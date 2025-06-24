import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ActivityType } from '../../../generated/prisma';

@Injectable()
export class ActivitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async logActivity(
    userId: string,
    type: ActivityType,
    action: string,
    itemTitle: string,
    itemId?: string
  ) {
    return this.prisma.activity.create({
      data: {
        userId,
        type,
        action,
        itemTitle,
        itemId,
      },
    });
  }

  async getUserActivities(userId: string, limit = 5) {
    return this.prisma.activity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        type: true,
        action: true,
        itemTitle: true,
        itemId: true,
        createdAt: true,
      },
    });
  }

  // Specific activity logging methods
  async logProjectUpload(userId: string, projectTitle: string, projectId: string) {
    return this.logActivity(
      userId,
      'PROJECT_UPLOAD',
      'Uploaded new project',
      projectTitle,
      projectId
    );
  }

  async logJobApplication(userId: string, jobTitle: string, jobId: string) {
    return this.logActivity(
      userId,
      'JOB_APPLICATION',
      'Applied to job',
      jobTitle,
      jobId
    );
  }

  async logEventRegistration(userId: string, eventTitle: string, eventId: string) {
    return this.logActivity(
      userId,
      'EVENT_REGISTRATION',
      'Registered for event',
      eventTitle,
      eventId
    );
  }

  async logProjectFeedback(userId: string, projectTitle: string, projectId: string) {
    return this.logActivity(
      userId,
      'PROJECT_FEEDBACK',
      'Received feedback on',
      projectTitle,
      projectId
    );
  }
} 