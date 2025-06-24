import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { User, UserRole } from '../../generated/prisma';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string): Promise<Omit<User, 'password'> | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        bio: true,
        skills: true,
        company: true,
        location: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  // Alias for findById to match the requirement
  async findOne(id: string): Promise<Omit<User, 'password'> | null> {
    return this.findById(id);
  }

  async create(userData: {
    email: string;
    password: string;
    name: string;
    role?: UserRole;
  }): Promise<User> {
    return this.prisma.user.create({
      data: userData,
    });
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: updateData,
    });
  }

  async updateProfile(id: string, updateProfileDto: UpdateProfileDto): Promise<Omit<User, 'password'>> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.prisma.user.update({
      where: { id },
      data: updateProfileDto,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        bio: true,
        skills: true,
        company: true,
        location: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getUserStats(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Get counts based on user role
    const [projectsCount, jobApplicationsCount, eventsCount, feedbackCount] = await Promise.all([
      // Projects uploaded (for STUDENT/PROFESSIONAL) or Jobs posted (for COMPANY)
      user.role === 'COMPANY' 
        ? this.prisma.job.count({ where: { companyId: userId } })
        : this.prisma.project.count({ where: { authorId: userId } }),
      
      // Job applications sent (for STUDENT/PROFESSIONAL) or Applications received (for COMPANY)
      user.role === 'COMPANY'
        ? this.prisma.jobApplication.count({
            where: { job: { companyId: userId } }
          })
        : this.prisma.jobApplication.count({ where: { applicantId: userId } }),
      
      // Events attended (for STUDENT/PROFESSIONAL) or Events organized (for PROFESSIONAL/COMPANY)
      user.role === 'STUDENT'
        ? this.prisma.eventAttendee.count({ where: { applicantId: userId } })
        : this.prisma.event.count({ where: { organizerId: userId } }),
      
      // Feedback received on projects (for STUDENT/PROFESSIONAL) or Talent connected (for COMPANY)
      user.role === 'COMPANY'
        ? this.prisma.jobApplication.count({
            where: { 
              job: { companyId: userId },
              // Only count applications from last 30 days as "connected talent"
              appliedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
            }
          })
        : this.prisma.projectFeedback.count({
            where: { project: { authorId: userId } }
          })
    ]);

    // Calculate additional stats for PROFESSIONAL role
    let additionalStat = 0;
    if (user.role === 'PROFESSIONAL') {
      // For professionals, get mentoring/workshop activities (events created)
      additionalStat = await this.prisma.event.count({ where: { organizerId: userId } });
    }

    return {
      projectsOrJobs: projectsCount,
      applicationsOrReceived: jobApplicationsCount,
      eventsOrOrganized: eventsCount,
      feedbackOrTalent: feedbackCount,
      additionalStat: user.role === 'PROFESSIONAL' ? additionalStat : undefined,
    };
  }

  async getUserActivity(userId: string, limit = 10) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Get recent activities from different sources
    const [projects, jobApplications, events, eventRegistrations] = await Promise.all([
      // Recent projects
      this.prisma.project.findMany({
        where: { authorId: userId },
        select: {
          id: true,
          title: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),

      // Recent job applications
      this.prisma.jobApplication.findMany({
        where: { applicantId: userId },
        select: {
          id: true,
          appliedAt: true,
          job: {
            select: {
              title: true,
              company: { select: { name: true } }
            }
          }
        },
        orderBy: { appliedAt: 'desc' },
        take: limit,
      }),

      // Recent events created (for professionals/companies)
      user.role !== 'STUDENT' ? this.prisma.event.findMany({
        where: { organizerId: userId },
        select: {
          id: true,
          title: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }) : Promise.resolve([]),

      // Recent event registrations
      this.prisma.eventAttendee.findMany({
        where: { applicantId: userId },
        select: {
          id: true,
          registeredAt: true,
          event: {
            select: {
              title: true,
            }
          }
        },
        orderBy: { registeredAt: 'desc' },
        take: limit,
      }),
    ]);

    // Combine and format activities
    const activities: any[] = [];

    projects.forEach(project => {
      activities.push({
        id: `project-${project.id}`,
        type: 'PROJECT_UPLOAD',
        title: `Uploaded project: ${project.title}`,
        date: project.createdAt,
        icon: 'folder'
      });
    });

    jobApplications.forEach(app => {
      activities.push({
        id: `job-app-${app.id}`,
        type: 'JOB_APPLICATION',
        title: `Applied to ${app.job.title} at ${app.job.company.name}`,
        date: app.appliedAt,
        icon: 'briefcase'
      });
    });

    events.forEach(event => {
      activities.push({
        id: `event-${event.id}`,
        type: 'EVENT_CREATED',
        title: `Created event: ${event.title}`,
        date: event.createdAt,
        icon: 'calendar'
      });
    });

    eventRegistrations.forEach(reg => {
      activities.push({
        id: `event-reg-${reg.id}`,
        type: 'EVENT_REGISTRATION',
        title: `Registered for: ${reg.event.title}`,
        date: reg.registeredAt,
        icon: 'calendar-check'
      });
    });

    // Sort by date and return top activities
    return activities
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }

  async getProfileCompletion(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const fields = [
      'name', 'bio', 'location', 'avatar', 'skills'
    ];

    if (user.role !== 'COMPANY') {
      fields.push('company');
    }

    const completedFields = fields.filter(field => {
      const value = user[field as keyof User];
      if (field === 'skills') {
        return Array.isArray(value) && value.length > 0;
      }
      return value && value.toString().trim().length > 0;
    });

    const completionPercentage = Math.round((completedFields.length / fields.length) * 100);

    return {
      completionPercentage,
      totalFields: fields.length,
      completedFields: completedFields.length,
      missingFields: fields.filter(field => !completedFields.includes(field))
    };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const { currentPassword, newPassword, confirmPassword } = changePasswordDto;

    if (newPassword !== confirmPassword) {
      throw new BadRequestException('New password and confirmation do not match');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return { message: 'Password changed successfully' };
  }

  async updateUserSettings(userId: string, settings: {
    emailNotifications?: boolean;
    profileSearchable?: boolean;
    isProfilePublic?: boolean;
  }) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // For now, we'll store these in user table, but in production
    // you might want a separate UserSettings table
    await this.prisma.user.update({
      where: { id: userId },
      data: settings,
    });

    return { message: 'Settings updated successfully' };
  }
} 