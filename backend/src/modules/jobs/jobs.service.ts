import { Injectable, NotFoundException, ForbiddenException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { CreateJobApplicationDto, UpdateApplicationStatusDto, BulkUpdateApplicationsDto } from './dto/job-application.dto';
import { Job, JobApplication, JobBookmark, User, JobType, ExperienceLevel, ApplicationStatus } from '../../../generated/prisma';
import { ActivitiesService } from '../activities/activities.service';

@Injectable()
export class JobsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activitiesService: ActivitiesService
  ) {}

  async findAll(filters?: {
    type?: JobType;
    remote?: boolean;
    experienceLevel?: ExperienceLevel;
    location?: string;
    skills?: string[];
    salaryMin?: number;
    salaryMax?: number;
    featured?: boolean;
    search?: string;
  }): Promise<Job[]> {
    const where: any = {
      status: 'PUBLISHED',
    };

    // Apply filters
    if (filters?.type) where.type = filters.type;
    if (filters?.remote !== undefined) where.remote = filters.remote;
    if (filters?.experienceLevel) where.experienceLevel = filters.experienceLevel;
    if (filters?.location) {
      where.location = {
        contains: filters.location,
        mode: 'insensitive',
      };
    }
    if (filters?.skills && filters.skills.length > 0) {
      where.OR = [
        { requiredSkills: { hasSome: filters.skills } },
        { preferredSkills: { hasSome: filters.skills } },
        { technologies: { hasSome: filters.skills } },
      ];
    }
    if (filters?.salaryMin) {
      where.salaryMin = { gte: filters.salaryMin };
    }
    if (filters?.salaryMax) {
      where.salaryMax = { lte: filters.salaryMax };
    }
    if (filters?.featured !== undefined) where.featured = filters.featured;
    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { company: { name: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    const jobs = await this.prisma.job.findMany({
      where,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            avatar: true,
            company: true,
            location: true,
          },
        },
        applicants: {
          select: {
            id: true,
            applicantId: true,
            status: true,
            appliedAt: true,
          },
        },
        _count: {
          select: {
            applicants: true,
            bookmarks: true,
          },
        },
      },
      orderBy: [
        { featured: 'desc' },
        { urgent: 'desc' },
        { postedAt: 'desc' },
      ],
    });

    // Transform the data to match frontend expectations
    return jobs.map(job => ({
      ...job,
      company: job.company.name,
      applicationsCount: job._count.applicants,
      bookmarksCount: job._count.bookmarks,
    }));
  }

  async findOne(id: string, userId?: string): Promise<Job> {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            avatar: true,
            company: true,
            location: true,
            bio: true,
          },
        },
        applicants: {
          include: {
            applicant: {
              select: {
                id: true,
                name: true,
                avatar: true,
                role: true,
                skills: true,
                bio: true,
                location: true,
              },
            },
          },
          orderBy: {
            appliedAt: 'desc',
          },
        },
        bookmarks: userId ? {
          where: { userId },
          select: { id: true },
        } : false,
        _count: {
          select: {
            applicants: true,
            bookmarks: true,
          },
        },
      },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }

    // Increment view count if viewing
    if (userId && job.companyId !== userId) {
      await this.prisma.job.update({
        where: { id },
        data: { views: { increment: 1 } },
      });
    }

    return {
      ...job,
      isBookmarked: userId ? job.bookmarks.length > 0 : false,
      applicationsCount: job._count.applicants,
      bookmarksCount: job._count.bookmarks,
    } as any;
  }

  async create(createJobDto: CreateJobDto, companyId: string): Promise<Job> {
    // Parse legacy salary field if provided
    let salaryData: any = {};
    if (createJobDto.salary && !createJobDto.salaryMin && !createJobDto.salaryMax) {
      const salaryMatch = createJobDto.salary.match(/(\d+)k?(?:\s*-\s*(\d+)k?)?/i);
      if (salaryMatch) {
        salaryData.salaryMin = parseInt(salaryMatch[1]) * (createJobDto.salary.includes('k') ? 1000 : 1);
        if (salaryMatch[2]) {
          salaryData.salaryMax = parseInt(salaryMatch[2]) * (createJobDto.salary.includes('k') ? 1000 : 1);
        }
      }
    }

    const jobData = {
      ...createJobDto,
      ...salaryData,
      companyId,
      applicationDeadline: createJobDto.applicationDeadline ? new Date(createJobDto.applicationDeadline) : null,
      expectedStartDate: createJobDto.expectedStartDate ? new Date(createJobDto.expectedStartDate) : null,
    };

    // Remove the legacy salary field from data
    delete (jobData as any).salary;

    const job = await this.prisma.job.create({
      data: jobData,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            avatar: true,
            company: true,
            location: true,
          },
        },
        _count: {
          select: {
            applicants: true,
            bookmarks: true,
          },
        },
      },
    });

    // Log activity
    await this.activitiesService.logActivity(
      companyId,
      'JOB_APPLICATION',
      `Posted job: ${job.title}`,
      job.title,
      job.id
    );

    return {
      ...job,
      company: job.company.name,
      applicationsCount: job._count.applicants,
      bookmarksCount: job._count.bookmarks,
    } as any;
  }

  async update(id: string, updateJobDto: UpdateJobDto, userId: string): Promise<Job> {
    const job = await this.prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }

    // Ownership check
    if (job.companyId !== userId) {
      throw new ForbiddenException('You can only update your own job postings');
    }

    const updateData = {
      ...updateJobDto,
      ...(updateJobDto.applicationDeadline && { applicationDeadline: new Date(updateJobDto.applicationDeadline) }),
      ...(updateJobDto.expectedStartDate && { expectedStartDate: new Date(updateJobDto.expectedStartDate) }),
    };

    return this.prisma.job.update({
      where: { id },
      data: updateData,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            avatar: true,
            company: true,
            location: true,
          },
        },
        _count: {
          select: {
            applicants: true,
            bookmarks: true,
          },
        },
      },
    });
  }

  async remove(id: string, userId: string): Promise<void> {
    const job = await this.prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }

    // Ownership check
    if (job.companyId !== userId) {
      throw new ForbiddenException('You can only delete your own job postings');
    }

    await this.prisma.job.delete({
      where: { id },
    });
  }

  // Enhanced application management
  async applyForJob(jobId: string, userId: string, applicationData?: CreateJobApplicationDto): Promise<JobApplication> {
    // Check if job exists and is available
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: { company: true },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }

    if (job.status !== 'PUBLISHED') {
      throw new BadRequestException('This job is not accepting applications');
    }

    if (job.applicationDeadline && new Date() > job.applicationDeadline) {
      throw new BadRequestException('Application deadline has passed');
    }

    // Check if user has already applied
    const existingApplication = await this.prisma.jobApplication.findUnique({
      where: {
        jobId_applicantId: {
          jobId,
          applicantId: userId,
        },
      },
    });

    if (existingApplication) {
      throw new ConflictException('You have already applied for this job');
    }

    // Get user skills for matching calculation
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { skills: true },
    });

    // Calculate skills match score
    const skillsMatchScore = this.calculateSkillsMatch(
      user?.skills || [],
      job.requiredSkills,
      job.preferredSkills
    );

    const application = await this.prisma.jobApplication.create({
      data: {
        jobId,
        applicantId: userId,
        ...applicationData,
        skillsMatchScore,
      },
      include: {
        applicant: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
            skills: true,
            location: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            company: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Log activity
    await this.activitiesService.logActivity(
      userId,
      'JOB_APPLICATION',
      `Applied for ${job.title} at ${job.company.name}`,
      job.title,
      jobId
    );

    return application;
  }

  // Calculate skills match percentage
  private calculateSkillsMatch(userSkills: string[], requiredSkills: string[], preferredSkills: string[] = []): number {
    if (!userSkills.length) return 0;

    const userSkillsLower = userSkills.map(s => s.toLowerCase());
    const requiredSkillsLower = requiredSkills.map(s => s.toLowerCase());
    const preferredSkillsLower = preferredSkills.map(s => s.toLowerCase());

    const requiredMatches = requiredSkillsLower.filter(skill => userSkillsLower.includes(skill)).length;
    const preferredMatches = preferredSkillsLower.filter(skill => userSkillsLower.includes(skill)).length;

    const totalRequired = requiredSkillsLower.length;
    const totalPreferred = preferredSkillsLower.length;

    if (totalRequired === 0 && totalPreferred === 0) return 100;

    // Weight required skills more heavily (70%) than preferred (30%)
    const requiredWeight = 0.7;
    const preferredWeight = 0.3;

    const requiredScore = totalRequired > 0 ? (requiredMatches / totalRequired) * requiredWeight : requiredWeight;
    const preferredScore = totalPreferred > 0 ? (preferredMatches / totalPreferred) * preferredWeight : preferredWeight;

    return Math.round((requiredScore + preferredScore) * 100);
  }

  // Application status management
  async updateApplicationStatus(
    applicationId: string,
    updateData: UpdateApplicationStatusDto,
    recruiterId: string
  ): Promise<JobApplication> {
    const application = await this.prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          select: {
            companyId: true,
            title: true,
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException(`Application with ID ${applicationId} not found`);
    }

    // Authorization check
    if (application.job.companyId !== recruiterId) {
      throw new ForbiddenException('You can only manage applications for your own job postings');
    }

    const now = new Date();
    const statusUpdateData: any = {
      status: updateData.status,
      recruiterNotes: updateData.recruiterNotes,
      rejectionReason: updateData.rejectionReason,
      rating: updateData.rating,
    };

    // Set appropriate timestamp based on status
    switch (updateData.status) {
      case 'REVIEWING':
        statusUpdateData.reviewedAt = now;
        break;
      case 'SHORTLISTED':
        statusUpdateData.shortlistedAt = now;
        break;
      case 'INTERVIEWED':
        statusUpdateData.interviewedAt = now;
        break;
      case 'OFFERED':
        statusUpdateData.offeredAt = now;
        break;
      case 'ACCEPTED':
      case 'REJECTED':
      case 'WITHDRAWN':
        statusUpdateData.respondedAt = now;
        break;
    }

    return this.prisma.jobApplication.update({
      where: { id: applicationId },
      data: statusUpdateData,
      include: {
        applicant: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
            skills: true,
            location: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  // Bulk application management
  async bulkUpdateApplications(
    jobId: string,
    updateData: BulkUpdateApplicationsDto,
    recruiterId: string
  ): Promise<{ updated: number; errors: any[] }> {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      select: { companyId: true },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }

    if (job.companyId !== recruiterId) {
      throw new ForbiddenException('You can only manage applications for your own job postings');
    }

    const errors: any[] = [];
    let updated = 0;

    for (const applicationId of updateData.applicationIds) {
      try {
        await this.updateApplicationStatus(
          applicationId,
          { status: updateData.status, recruiterNotes: updateData.notes },
          recruiterId
        );
        updated++;
      } catch (error) {
        errors.push({
          applicationId,
          error: error.message,
        });
      }
    }

    return { updated, errors };
  }

  // Bookmark functionality
  async bookmarkJob(jobId: string, userId: string): Promise<JobBookmark> {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }

    const existingBookmark = await this.prisma.jobBookmark.findUnique({
      where: {
        jobId_userId: {
          jobId,
          userId,
        },
      },
    });

    if (existingBookmark) {
      throw new ConflictException('Job is already bookmarked');
    }

    return this.prisma.jobBookmark.create({
      data: {
        jobId,
        userId,
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async removeBookmark(jobId: string, userId: string): Promise<void> {
    const bookmark = await this.prisma.jobBookmark.findUnique({
      where: {
        jobId_userId: {
          jobId,
          userId,
        },
      },
    });

    if (!bookmark) {
      throw new NotFoundException('Bookmark not found');
    }

    await this.prisma.jobBookmark.delete({
      where: {
        jobId_userId: {
          jobId,
          userId,
        },
      },
    });
  }

  // Get user bookmarks
  async getUserBookmarks(userId: string): Promise<JobBookmark[]> {
    return this.prisma.jobBookmark.findMany({
      where: { userId },
      include: {
        job: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                avatar: true,
                location: true,
              },
            },
            _count: {
              select: {
                applicants: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Get user applications
  async getUserApplications(userId: string): Promise<JobApplication[]> {
    return this.prisma.jobApplication.findMany({
      where: { applicantId: userId },
      include: {
        job: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                avatar: true,
                location: true,
              },
            },
          },
        },
      },
      orderBy: {
        appliedAt: 'desc',
      },
    });
  }

  // Get company applications
  async getCompanyApplications(companyId: string, filters?: {
    jobId?: string;
    status?: ApplicationStatus;
    skillsMatch?: number;
  }): Promise<JobApplication[]> {
    const where: any = {
      job: {
        companyId,
      },
    };

    if (filters?.jobId) where.jobId = filters.jobId;
    if (filters?.status) where.status = filters.status;
    if (filters?.skillsMatch) {
      where.skillsMatchScore = { gte: filters.skillsMatch };
    }

    return this.prisma.jobApplication.findMany({
      where,
      include: {
        applicant: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
            skills: true,
            location: true,
            bio: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            type: true,
            experienceLevel: true,
          },
        },
      },
      orderBy: [
        { skillsMatchScore: 'desc' },
        { appliedAt: 'desc' },
      ],
    });
  }

  // Analytics and insights
  async getJobAnalytics(jobId: string, companyId: string): Promise<any> {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: {
        applicants: {
          select: {
            status: true,
            skillsMatchScore: true,
            appliedAt: true,
          },
        },
        _count: {
          select: {
            applicants: true,
            bookmarks: true,
          },
        },
      },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }

    if (job.companyId !== companyId) {
      throw new ForbiddenException('You can only view analytics for your own job postings');
    }

    const applicationsByStatus = job.applicants.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const averageSkillsMatch = job.applicants.length > 0
      ? job.applicants.reduce((sum, app) => sum + (app.skillsMatchScore || 0), 0) / job.applicants.length
      : 0;

    // Application trend (daily applications over last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyApplications = await this.prisma.jobApplication.groupBy({
      by: ['appliedAt'],
      where: {
        jobId,
        appliedAt: {
          gte: thirtyDaysAgo,
        },
      },
      _count: {
        id: true,
      },
    });

    return {
      totalApplications: job._count.applicants,
      totalBookmarks: job._count.bookmarks,
      views: job.views,
      applicationsByStatus,
      averageSkillsMatch: Math.round(averageSkillsMatch),
      dailyApplications,
      conversionRate: job.views > 0 ? ((job._count.applicants / job.views) * 100).toFixed(2) : 0,
    };
  }

  // Skills-based job recommendations
  async getRecommendedJobs(userId: string): Promise<Job[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { skills: true, location: true },
    });

    if (!user || !user.skills?.length) {
      return this.findAll({ featured: true });
    }

    const jobs = await this.prisma.job.findMany({
      where: {
        status: 'PUBLISHED',
        OR: [
          { requiredSkills: { hasSome: user.skills } },
          { preferredSkills: { hasSome: user.skills } },
          { technologies: { hasSome: user.skills } },
        ],
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            avatar: true,
            location: true,
          },
        },
        _count: {
          select: {
            applicants: true,
            bookmarks: true,
          },
        },
      },
      orderBy: {
        postedAt: 'desc',
      },
      take: 10,
    });

    // Calculate match scores and sort by relevance
    return jobs
      .map(job => ({
        ...job,
        company: job.company.name,
        applicationsCount: job._count.applicants,
        bookmarksCount: job._count.bookmarks,
        matchScore: this.calculateSkillsMatch(user.skills, job.requiredSkills, job.preferredSkills),
      }))
      .sort((a, b) => b.matchScore - a.matchScore) as any;
  }
} 