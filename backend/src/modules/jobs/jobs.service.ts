import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { Job, JobApplication } from '../../../generated/prisma';

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Job[]> {
    return this.prisma.job.findMany({
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
            appliedAt: true,
          },
        },
      },
      orderBy: {
        postedAt: 'desc',
      },
    });
  }

  async findOne(id: string): Promise<Job> {
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
              },
            },
          },
          orderBy: {
            appliedAt: 'desc',
          },
        },
      },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }

    return job;
  }

  async create(createJobDto: CreateJobDto, companyId: string): Promise<Job> {
    return this.prisma.job.create({
      data: {
        ...createJobDto,
        companyId,
      },
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
            appliedAt: true,
          },
        },
      },
    });
  }

  async update(id: string, updateJobDto: UpdateJobDto, userId: string): Promise<Job> {
    const job = await this.prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }

    // Ownership check - only the company that posted the job can update it
    if (job.companyId !== userId) {
      throw new ForbiddenException('You can only update your own job postings');
    }

    return this.prisma.job.update({
      where: { id },
      data: updateJobDto,
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
          include: {
            applicant: {
              select: {
                id: true,
                name: true,
                avatar: true,
                role: true,
                skills: true,
              },
            },
          },
          orderBy: {
            appliedAt: 'desc',
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

    // Ownership check - only the company that posted the job can delete it
    if (job.companyId !== userId) {
      throw new ForbiddenException('You can only delete your own job postings');
    }

    await this.prisma.job.delete({
      where: { id },
    });
  }

  async applyForJob(jobId: string, userId: string): Promise<JobApplication> {
    // Check if job exists
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
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

    // Create application
    return this.prisma.jobApplication.create({
      data: {
        jobId,
        applicantId: userId,
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
        applicant: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
          },
        },
      },
    });
  }
} 