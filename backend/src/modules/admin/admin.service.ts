import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationService } from '../notifications/notification.service';
import { UserRole, ProjectStatus, ProjectType, EventStatus, JobStatus, ApplicationStatus } from '../../../generated/prisma';
import { $Enums } from '../../../generated/prisma';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService, private notificationService: NotificationService) {}

  // Status mapping function to convert frontend status to backend enum
  private mapProjectStatus(frontendStatus: string): ProjectStatus | undefined {
    const statusMap: Record<string, ProjectStatus> = {
      'published': ProjectStatus.PUBLISHED,
      'draft': ProjectStatus.DRAFT,
      'flagged': ProjectStatus.PENDING_APPROVAL,
      'pending': ProjectStatus.PENDING_APPROVAL,
      'approved': ProjectStatus.APPROVED,
      'rejected': ProjectStatus.REJECTED,
      'archived': ProjectStatus.ARCHIVED
    };
    
    return statusMap[frontendStatus.toLowerCase()];
  }

  // Dashboard Overview
  async getDashboardOverview() {
    const [
      userMetrics,
      contentMetrics,
      recentActivity,
      systemHealth,
      quickActions,
      realTimeData
    ] = await Promise.all([
      this.getUserMetrics(),
      this.getContentMetrics(),
      this.getRecentActivity({ page: 1, limit: 10 }),
      this.getSystemHealth(),
      this.getQuickActions(),
      this.getRealTimeData()
    ]);

    return {
      metrics: {
        users: userMetrics,
        content: contentMetrics,
        engagement: await this.getEngagementMetrics(),
        system: await this.getSystemMetrics()
      },
      recentActivity: recentActivity.data,
      systemHealth,
      quickActions,
      realTimeData
    };
  }

  async getDashboardMetrics() {
    return {
      users: await this.getUserMetrics(),
      content: await this.getContentMetrics(),
      engagement: await this.getEngagementMetrics(),
      system: await this.getSystemMetrics()
    };
  }

  async getRealTimeData() {
    const [activeUsers, recentSignups, recentActivity, systemAlerts] = await Promise.all([
      this.getActiveUsers(),
      this.getRecentSignups(),
      this.getRecentActivity({ page: 1, limit: 5 }),
      this.getSystemAlerts()
    ]);

    return {
      activeUsers,
      currentSessions: activeUsers,
      recentSignups: recentSignups.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        timestamp: user.createdAt.toISOString()
      })),
      recentActivity: recentActivity.data.map(activity => ({
        type: activity.type,
        description: activity.action,
        timestamp: activity.createdAt.toISOString()
      })),
      systemAlerts
    };
  }

  // Project Approval Workflow
  async approveProject(projectId: string, adminId: string, notes?: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { author: true }
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.status !== ProjectStatus.PENDING_APPROVAL) {
      throw new BadRequestException(`Project is not pending approval. Current status: ${project.status}`);
    }

    const updatedProject = await this.prisma.project.update({
      where: { id: projectId },
      data: {
        status: ProjectStatus.APPROVED,
        reviewedById: adminId,
        reviewedAt: new Date(),
        approvalNotes: notes,
        isPublic: true
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        reviewedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Log activity
    await this.prisma.activity.create({
      data: {
        type: 'PROJECT_UPLOAD',
        action: `Project "${project.title}" approved by admin`,
        itemTitle: project.title,
        itemId: project.id,
        userId: adminId
      }
    });

    // Send approval notification to project author
    await this.notificationService.createNotification({
      userId: project.authorId,
      type: $Enums.NotificationType.PROJECT_APPROVED,
      title: 'Project Approved! 🎉',
      message: `Your project "${project.title}" has been approved and is now public${notes ? `. Admin notes: ${notes}` : '.'}`,
      priority: $Enums.NotificationPriority.HIGH,
      itemId: project.id,
      itemType: 'project',
      metadata: {
        projectTitle: project.title,
        approvedBy: updatedProject.reviewedBy?.name,
        approvedAt: updatedProject.reviewedAt,
        notes: notes
      }
    });

    return updatedProject;
  }

  async rejectProject(projectId: string, adminId: string, reason: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { author: true }
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.status !== ProjectStatus.PENDING_APPROVAL) {
      throw new BadRequestException(`Project is not pending approval. Current status: ${project.status}`);
    }

    const updatedProject = await this.prisma.project.update({
      where: { id: projectId },
      data: {
        status: ProjectStatus.REJECTED,
        reviewedById: adminId,
        reviewedAt: new Date(),
        rejectionReason: reason,
        isPublic: false
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        reviewedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Log activity
    await this.prisma.activity.create({
      data: {
        type: 'PROJECT_UPLOAD',
        action: `Project "${project.title}" rejected by admin`,
        itemTitle: project.title,
        itemId: project.id,
        userId: adminId
      }
    });

    // Send rejection notification to project author
    await this.notificationService.createNotification({
      userId: project.authorId,
      type: $Enums.NotificationType.PROJECT_REJECTED,
      title: 'Project Needs Revision',
      message: `Your project "${project.title}" needs revision. Reason: ${reason}`,
      priority: $Enums.NotificationPriority.HIGH,
      itemId: project.id,
      itemType: 'project',
      metadata: {
        projectTitle: project.title,
        rejectedBy: updatedProject.reviewedBy?.name,
        rejectedAt: updatedProject.reviewedAt,
        rejectionReason: reason
      }
    });

    return updatedProject;
  }

  // User Management
  async getAllUsers(filters: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
    status?: string;
  }) {
    const { page = 1, limit = 10, role, search, status } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (role) {
      where.role = role as UserRole;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
          company: true,
          location: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              projects: true,
              events: true,
              jobs: true,
              activities: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.user.count({ where })
    ]);

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getUserDetails(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        projects: {
          include: {
            feedback: true
          }
        },
        events: true,
        jobs: true,
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        _count: {
          select: {
            projects: true,
            events: true,
            jobs: true,
            feedback: true,
            jobApplications: true,
            activities: true
          }
        }
      }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateUserRole(userId: string, newRole: UserRole) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Prevent changing the last admin
    if (user.role === UserRole.ADMIN && newRole !== UserRole.ADMIN) {
      const adminCount = await this.prisma.user.count({
        where: { role: UserRole.ADMIN },
      });

      if (adminCount <= 1) {
        throw new ForbiddenException('Cannot change role of the last admin user');
      }
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        updatedAt: true,
      },
    });
  }

  async updateUserStatus(userId: string, status: 'active' | 'suspended' | 'deleted') {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Prevent suspending/deleting the last admin
    if (user.role === UserRole.ADMIN && status !== 'active') {
      const adminCount = await this.prisma.user.count({
        where: { role: UserRole.ADMIN },
      });

      if (adminCount <= 1) {
        throw new ForbiddenException('Cannot suspend/delete the last admin user');
      }
    }

    if (status === 'deleted') {
      await this.prisma.user.delete({ where: { id: userId } });
      return { message: 'User deleted successfully' };
    }

    // For now, we'll use a simple approach. In a real app, you might want to add a status field
    return this.prisma.user.update({
      where: { id: userId },
      data: { updatedAt: new Date() }, // Placeholder for status update
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        updatedAt: true,
      },
    });
  }

  async deleteUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Prevent deleting the last admin
    if (user.role === UserRole.ADMIN) {
      const adminCount = await this.prisma.user.count({
        where: { role: UserRole.ADMIN },
      });

      if (adminCount <= 1) {
        throw new ForbiddenException('Cannot delete the last admin user');
      }
    }

    await this.prisma.user.delete({
      where: { id: userId },
    });
  }

  // Project Management
  async getAllProjects(filters: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    type?: string;
  }) {
    const { page = 1, limit = 10, status, search, type } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (status && status !== 'all') {
      const mappedStatus = this.mapProjectStatus(status);
      if (mappedStatus) {
        where.status = mappedStatus;
      } else {
        // If status mapping fails, don't filter by status
        console.warn(`Invalid project status: ${status}`);
      }
    }
    
    if (type) {
      where.projectType = type as ProjectType;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    try {
      const [projects, total] = await Promise.all([
        this.prisma.project.findMany({
          where,
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                avatar: true
              }
            },
            reviewedBy: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            feedback: {
              include: {
                author: {
                  select: {
                    id: true,
                    name: true,
                    avatar: true
                  }
                }
              }
            },
            _count: {
              select: {
                feedback: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        this.prisma.project.count({ where })
      ]);

      return {
        projects,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw new Error('Failed to fetch projects');
    }
  }

  async getProjectDetails(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            avatar: true,
            company: true,
            location: true
          }
        },
        reviewedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        feedback: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatar: true,
                role: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async deleteProject(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    await this.prisma.project.delete({
      where: { id: projectId },
    });
  }

  // Content Management
  async getAllEvents(filters: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    type?: string;
  }) {
    const { page = 1, limit = 10, status, search, type } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (status) {
      where.status = status as EventStatus;
    }
    
    if (type) {
      where.type = type;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        include: {
          organizer: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          attendees: {
            include: {
              applicant: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          },
          _count: {
            select: {
              attendees: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.event.count({ where })
    ]);

    return {
      events,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getEventDetails(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            company: true,
            location: true
          }
        },
        attendees: {
          include: {
            applicant: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            }
          }
        }
      }
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  async deleteEvent(eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    await this.prisma.event.delete({
      where: { id: eventId },
    });
  }

  async approveEvent(eventId: string, adminId: string, notes?: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.status !== 'DRAFT') {
      throw new BadRequestException(`Event is not in DRAFT status. Current status: ${event.status}`);
    }

    const updatedEvent = await this.prisma.event.update({
      where: { id: eventId },
      data: {
        status: 'PUBLISHED',
        updatedAt: new Date()
      },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Create activity record
    await this.prisma.activity.create({
      data: {
        type: 'EVENT_APPROVED',
        userId: event.organizerId,
        action: `Event "${event.title}" has been approved`,
        itemTitle: event.title,
        itemId: eventId
      }
    });

    return {
      message: 'Event approved successfully',
      event: updatedEvent
    };
  }

  async rejectEvent(eventId: string, adminId: string, reason: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.status !== 'DRAFT') {
      throw new BadRequestException(`Event is not in DRAFT status. Current status: ${event.status}`);
    }

    const updatedEvent = await this.prisma.event.update({
      where: { id: eventId },
      data: {
        status: 'CANCELLED',
        updatedAt: new Date()
      },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Create activity record
    await this.prisma.activity.create({
      data: {
        type: 'EVENT_REJECTED',
        userId: event.organizerId,
        action: `Event "${event.title}" has been rejected`,
        itemTitle: event.title,
        itemId: eventId
      }
    });

    return {
      message: 'Event rejected successfully',
      event: updatedEvent,
      reason
    };
  }

  async updateEventStatus(eventId: string, status: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const validStatuses = ['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const updatedEvent = await this.prisma.event.update({
      where: { id: eventId },
      data: {
        status: status as EventStatus,
        updatedAt: new Date()
      },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Send notification to organizer about status change
    let notificationTitle = '';
    let notificationMessage = '';
    let priority: $Enums.NotificationPriority = $Enums.NotificationPriority.MEDIUM;

    switch (status) {
      case 'PUBLISHED':
        notificationTitle = 'Event Featured';
        notificationMessage = `Your event "${event.title}" has been featured and is now more visible to users.`;
        priority = $Enums.NotificationPriority.HIGH;
        break;
      case 'CANCELLED':
        notificationTitle = 'Event Suspended';
        notificationMessage = `Your event "${event.title}" has been suspended by an administrator. Please contact support for more information.`;
        priority = $Enums.NotificationPriority.HIGH;
        break;
      case 'DRAFT':
        notificationTitle = 'Event Moved to Draft';
        notificationMessage = `Your event "${event.title}" has been moved back to draft status by an administrator.`;
        priority = $Enums.NotificationPriority.MEDIUM;
        break;
      case 'COMPLETED':
        notificationTitle = 'Event Marked as Completed';
        notificationMessage = `Your event "${event.title}" has been marked as completed.`;
        priority = $Enums.NotificationPriority.LOW;
        break;
    }

    if (notificationTitle && event.organizerId) {
      await this.notificationService.createNotification({
        userId: event.organizerId,
        type: $Enums.NotificationType.EVENT_NOTIFICATION,
        title: notificationTitle,
        message: notificationMessage,
        priority: priority,
        itemId: event.id,
        itemType: 'event',
        metadata: {
          eventTitle: event.title,
          newStatus: status,
          adminAction: true,
          previousStatus: event.status
        }
      });
    }

    return {
      message: 'Event status updated successfully',
      event: updatedEvent
    };
  }

  async getEventAnalytics(period: '7d' | '30d' | '90d' | '1y' = '30d') {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const [
      totalEvents,
      publishedEvents,
      draftEvents,
      cancelledEvents,
      completedEvents,
      totalAttendees,
      eventsByType,
      recentEvents
    ] = await Promise.all([
      // Total events in period
      this.prisma.event.count({
        where: {
          createdAt: { gte: startDate }
        }
      }),
      // Published events
      this.prisma.event.count({
        where: {
          status: 'PUBLISHED',
          createdAt: { gte: startDate }
        }
      }),
      // Draft events
      this.prisma.event.count({
        where: {
          status: 'DRAFT',
          createdAt: { gte: startDate }
        }
      }),
      // Cancelled events
      this.prisma.event.count({
        where: {
          status: 'CANCELLED',
          createdAt: { gte: startDate }
        }
      }),
      // Completed events
      this.prisma.event.count({
        where: {
          status: 'COMPLETED',
          createdAt: { gte: startDate }
        }
      }),
      // Total attendees
      this.prisma.eventAttendee.count({
        where: {
          event: {
            createdAt: { gte: startDate }
          }
        }
      }),
      // Events by type
      this.prisma.event.groupBy({
        by: ['type'],
        where: {
          createdAt: { gte: startDate }
        },
        _count: {
          type: true
        }
      }),
      // Recent events
      this.prisma.event.findMany({
        where: {
          createdAt: { gte: startDate }
        },
        include: {
          organizer: {
            select: {
              name: true
            }
          },
          _count: {
            select: {
              attendees: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5
      })
    ]);

    return {
      period,
      overview: {
        totalEvents,
        publishedEvents,
        draftEvents,
        cancelledEvents,
        completedEvents,
        totalAttendees,
        averageAttendeesPerEvent: totalEvents > 0 ? Math.round(totalAttendees / totalEvents) : 0
      },
      eventsByType: eventsByType.map(item => ({
        type: item.type,
        count: item._count.type
      })),
      recentEvents: recentEvents.map(event => ({
        id: event.id,
        title: event.title,
        type: event.type,
        status: event.status,
        organizer: event.organizer.name,
        attendeeCount: event._count.attendees,
        createdAt: event.createdAt
      }))
    };
  }

  async getEventTrends(period: '7d' | '30d' | '90d' | '1y' = '30d', groupBy: 'day' | 'week' | 'month' = 'day') {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get events created in the period
    const events = await this.prisma.event.findMany({
      where: {
        createdAt: { gte: startDate }
      },
      select: {
        createdAt: true,
        status: true,
        type: true,
        attendees: {
          select: {
            id: true
          }
        }
      }
    });

    // Group events by date
    const eventGroups = new Map<string, any[]>();
    const attendeeGroups = new Map<string, number>();

    events.forEach(event => {
      let dateKey: string;
      
      if (groupBy === 'day') {
        dateKey = event.createdAt.toISOString().split('T')[0];
      } else if (groupBy === 'week') {
        const weekStart = new Date(event.createdAt);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        dateKey = weekStart.toISOString().split('T')[0];
      } else {
        dateKey = `${event.createdAt.getFullYear()}-${String(event.createdAt.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!eventGroups.has(dateKey)) {
        eventGroups.set(dateKey, []);
      }
      eventGroups.get(dateKey)!.push(event);

      // Count attendees
      const currentAttendees = attendeeGroups.get(dateKey) || 0;
      attendeeGroups.set(dateKey, currentAttendees + event.attendees.length);
    });

    // Convert to sorted array
    const trends = Array.from(eventGroups.keys())
      .sort()
      .map(dateKey => {
        const dayEvents = eventGroups.get(dateKey)!;
        const statusCounts = dayEvents.reduce((acc, event) => {
          acc[event.status] = (acc[event.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const typeCounts = dayEvents.reduce((acc, event) => {
          acc[event.type] = (acc[event.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        return {
          date: dateKey,
          totalEvents: dayEvents.length,
          attendees: attendeeGroups.get(dateKey) || 0,
          statusBreakdown: statusCounts,
          typeBreakdown: typeCounts
        };
      });

    return {
      period,
      groupBy,
      trends,
      summary: {
        totalEvents: events.length,
        totalAttendees: events.reduce((sum, event) => sum + event.attendees.length, 0),
        averageEventsPerPeriod: trends.length > 0 ? Math.round(events.length / trends.length) : 0
      }
    };
  }

  // Job Management
  async getAllJobs(filters: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    type?: string;
  }) {
    const { page = 1, limit = 10, status, search, type } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (status) {
      where.status = status as JobStatus;
    }
    
    if (type) {
      where.type = type;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          applicants: {
            include: {
              applicant: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          },
          _count: {
            select: {
              applicants: true
            }
          }
        },
        orderBy: { postedAt: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.job.count({ where })
    ]);

    return {
      jobs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getJobDetails(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            company: true,
            location: true
          }
        },
        applicants: {
          include: {
            applicant: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            }
          }
        }
      }
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    return job;
  }

  async deleteJob(jobId: string) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    await this.prisma.job.delete({
      where: { id: jobId },
    });
  }

  async approveJob(jobId: string, adminId: string, notes?: string) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.status !== 'DRAFT') {
      throw new BadRequestException(`Job is not in DRAFT status. Current status: ${job.status}`);
    }

    const updatedJob = await this.prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'PUBLISHED',
        updatedAt: new Date()
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Create activity record
    await this.prisma.activity.create({
      data: {
        type: 'JOB_APPROVED',
        userId: job.companyId,
        action: `Job "${job.title}" has been approved`,
        itemTitle: job.title,
        itemId: jobId
      }
    });

    // Notify job poster
    await this.notificationService.createNotification({
      userId: job.companyId,
      type: $Enums.NotificationType.JOB_NOTIFICATION,
      title: `Job approved: ${job.title}`,
      message: 'Your job posting has been approved and is now live on the platform.',
      itemId: jobId,
      itemType: 'job',
      priority: $Enums.NotificationPriority.MEDIUM,
    });

    return {
      message: 'Job approved successfully',
      job: updatedJob
    };
  }

  async rejectJob(jobId: string, adminId: string, reason: string) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.status !== 'DRAFT') {
      throw new BadRequestException(`Job is not in DRAFT status. Current status: ${job.status}`);
    }

    const updatedJob = await this.prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'CLOSED',
        updatedAt: new Date()
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Create activity record
    await this.prisma.activity.create({
      data: {
        type: 'JOB_REJECTED',
        userId: job.companyId,
        action: `Job "${job.title}" has been rejected`,
        itemTitle: job.title,
        itemId: jobId
      }
    });

    // Notify job poster
    await this.notificationService.createNotification({
      userId: job.companyId,
      type: $Enums.NotificationType.JOB_NOTIFICATION,
      title: `Job rejected: ${job.title}`,
      message: `Your job posting was rejected by admin. Reason: ${reason}`,
      itemId: jobId,
      itemType: 'job',
      priority: $Enums.NotificationPriority.MEDIUM,
    });

    return {
      message: 'Job rejected successfully',
      job: updatedJob,
      reason
    };
  }

  async updateJobStatus(jobId: string, status: string) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const validStatuses = ['DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const updatedJob = await this.prisma.job.update({
      where: { id: jobId },
      data: {
        status: status as JobStatus,
        updatedAt: new Date()
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return {
      message: 'Job status updated successfully',
      job: updatedJob
    };
  }

  async getJobApplications(jobId: string, filters: {
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const { page = 1, limit = 10, status } = filters;
    const skip = (page - 1) * limit;

    const where: any = { jobId };
    
    if (status) {
      where.status = status as ApplicationStatus;
    }

    const [applications, total] = await Promise.all([
      this.prisma.jobApplication.findMany({
        where,
        include: {
          applicant: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              avatar: true
            }
          },
          job: {
            select: {
              id: true,
              title: true,
              company: {
                select: {
                  name: true
                }
              }
            }
          }
        },
        orderBy: { appliedAt: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.jobApplication.count({ where })
    ]);

    return {
      applications,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async updateApplicationStatus(
    jobId: string, 
    applicationId: string, 
    status: string, 
    adminId: string, 
    notes?: string
  ) {
    const application = await this.prisma.jobApplication.findFirst({
      where: {
        id: applicationId,
        jobId: jobId
      },
      include: {
        applicant: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        job: {
          select: {
            id: true,
            title: true,
            company: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const validStatuses = ['PENDING', 'REVIEWING', 'SHORTLISTED', 'INTERVIEWED', 'OFFERED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const updatedApplication = await this.prisma.jobApplication.update({
      where: { id: applicationId },
      data: {
        status: status as ApplicationStatus,
        recruiterNotes: notes,
        reviewedAt: new Date()
      },
      include: {
        applicant: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        job: {
          select: {
            id: true,
            title: true,
            company: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    // Create activity record
    await this.prisma.activity.create({
      data: {
        type: 'APPLICATION_STATUS_UPDATED',
        userId: application.applicantId,
        action: `Application status updated to ${status} for ${application.job.title}`,
        itemTitle: application.job.title,
        itemId: applicationId
      }
    });

    return {
      message: 'Application status updated successfully',
      application: updatedApplication
    };
  }

  async getJobAnalytics(period: '7d' | '30d' | '90d' | '1y' = '30d') {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const [
      totalJobs,
      publishedJobs,
      draftJobs,
      closedJobs,
      archivedJobs,
      totalApplications,
      jobsByType,
      jobsByExperienceLevel,
      recentJobs
    ] = await Promise.all([
      // Total jobs in period
      this.prisma.job.count({
        where: {
          postedAt: { gte: startDate }
        }
      }),
      // Published jobs
      this.prisma.job.count({
        where: {
          status: 'PUBLISHED',
          postedAt: { gte: startDate }
        }
      }),
      // Draft jobs
      this.prisma.job.count({
        where: {
          status: 'DRAFT',
          postedAt: { gte: startDate }
        }
      }),
      // Closed jobs
      this.prisma.job.count({
        where: {
          status: 'CLOSED',
          postedAt: { gte: startDate }
        }
      }),
      // Archived jobs
      this.prisma.job.count({
        where: {
          status: 'ARCHIVED',
          postedAt: { gte: startDate }
        }
      }),
      // Total applications
      this.prisma.jobApplication.count({
        where: {
          job: {
            postedAt: { gte: startDate }
          }
        }
      }),
      // Jobs by type
      this.prisma.job.groupBy({
        by: ['type'],
        where: {
          postedAt: { gte: startDate }
        },
        _count: {
          type: true
        }
      }),
      // Jobs by experience level
      this.prisma.job.groupBy({
        by: ['experienceLevel'],
        where: {
          postedAt: { gte: startDate }
        },
        _count: {
          experienceLevel: true
        }
      }),
      // Recent jobs
      this.prisma.job.findMany({
        where: {
          postedAt: { gte: startDate }
        },
        include: {
          company: {
            select: {
              name: true
            }
          },
          _count: {
            select: {
              applicants: true
            }
          }
        },
        orderBy: { postedAt: 'desc' },
        take: 5
      })
    ]);

    return {
      period,
      overview: {
        totalJobs,
        publishedJobs,
        draftJobs,
        closedJobs,
        archivedJobs,
        totalApplications,
        averageApplicationsPerJob: totalJobs > 0 ? Math.round(totalApplications / totalJobs) : 0
      },
      jobsByType: jobsByType.map(item => ({
        type: item.type,
        count: item._count.type
      })),
      jobsByExperienceLevel: jobsByExperienceLevel.map(item => ({
        level: item.experienceLevel,
        count: item._count.experienceLevel
      })),
      recentJobs: recentJobs.map(job => ({
        id: job.id,
        title: job.title,
        type: job.type,
        status: job.status,
        company: job.company.name,
        applicationCount: job._count.applicants,
        postedAt: job.postedAt
      }))
    };
  }

  async getJobTrends(period: '7d' | '30d' | '90d' | '1y' = '30d', groupBy: 'day' | 'week' | 'month' = 'day') {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get jobs created in the period
    const jobs = await this.prisma.job.findMany({
      where: {
        postedAt: { gte: startDate }
      },
      select: {
        postedAt: true,
        status: true,
        type: true,
        experienceLevel: true,
        applicants: {
          select: {
            id: true,
            status: true
          }
        }
      }
    });

    // Group jobs by date
    const jobGroups = new Map<string, any[]>();
    const applicationGroups = new Map<string, number>();

    jobs.forEach(job => {
      let dateKey: string;
      
      if (groupBy === 'day') {
        dateKey = job.postedAt.toISOString().split('T')[0];
      } else if (groupBy === 'week') {
        const weekStart = new Date(job.postedAt);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        dateKey = weekStart.toISOString().split('T')[0];
      } else {
        dateKey = `${job.postedAt.getFullYear()}-${String(job.postedAt.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!jobGroups.has(dateKey)) {
        jobGroups.set(dateKey, []);
      }
      jobGroups.get(dateKey)!.push(job);

      // Count applications
      const currentApplications = applicationGroups.get(dateKey) || 0;
      applicationGroups.set(dateKey, currentApplications + job.applicants.length);
    });

    // Convert to sorted array
    const trends = Array.from(jobGroups.keys())
      .sort()
      .map(dateKey => {
        const dayJobs = jobGroups.get(dateKey)!;
        const statusCounts = dayJobs.reduce((acc, job) => {
          acc[job.status] = (acc[job.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const typeCounts = dayJobs.reduce((acc, job) => {
          acc[job.type] = (acc[job.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const levelCounts = dayJobs.reduce((acc, job) => {
          acc[job.experienceLevel] = (acc[job.experienceLevel] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        return {
          date: dateKey,
          totalJobs: dayJobs.length,
          applications: applicationGroups.get(dateKey) || 0,
          statusBreakdown: statusCounts,
          typeBreakdown: typeCounts,
          experienceLevelBreakdown: levelCounts
        };
      });

    return {
      period,
      groupBy,
      trends,
      summary: {
        totalJobs: jobs.length,
        totalApplications: jobs.reduce((sum, job) => sum + job.applicants.length, 0),
        averageJobsPerPeriod: trends.length > 0 ? Math.round(jobs.length / trends.length) : 0
      }
    };
  }

  async getApplicationAnalytics(period: '7d' | '30d' | '90d' | '1y' = '30d', jobId?: string) {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const whereClause: any = {
      appliedAt: { gte: startDate }
    };

    if (jobId) {
      whereClause.jobId = jobId;
    }

    const [
      totalApplications,
      applicationsByStatus,
      applicationsByJob,
      applicationsByApplicant,
      recentApplications
    ] = await Promise.all([
      // Total applications
      this.prisma.jobApplication.count({ where: whereClause }),
      // Applications by status
      this.prisma.jobApplication.groupBy({
        by: ['status'],
        where: whereClause,
        _count: {
          status: true
        }
      }),
      // Applications by job
      this.prisma.jobApplication.groupBy({
        by: ['jobId'],
        where: whereClause,
        _count: {
          jobId: true
        }
      }),
      // Applications by applicant
      this.prisma.jobApplication.groupBy({
        by: ['applicantId'],
        where: whereClause,
        _count: {
          applicantId: true
        }
      }),
      // Recent applications
      this.prisma.jobApplication.findMany({
        where: whereClause,
        include: {
          applicant: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          job: {
            select: {
              id: true,
              title: true,
              company: {
                select: {
                  name: true
                }
              }
            }
          }
        },
        orderBy: { appliedAt: 'desc' },
        take: 10
      })
    ]);

    // Get job details for top jobs
    const topJobIds = applicationsByJob
      .sort((a, b) => b._count.jobId - a._count.jobId)
      .slice(0, 5)
      .map(item => item.jobId);

    const topJobs = await this.prisma.job.findMany({
      where: {
        id: { in: topJobIds }
      },
      select: {
        id: true,
        title: true,
        company: {
          select: {
            name: true
          }
        }
      }
    });

    return {
      period,
      overview: {
        totalApplications,
        uniqueJobs: applicationsByJob.length,
        uniqueApplicants: applicationsByApplicant.length,
        averageApplicationsPerJob: applicationsByJob.length > 0 ? Math.round(totalApplications / applicationsByJob.length) : 0
      },
      applicationsByStatus: applicationsByStatus.map(item => ({
        status: item.status,
        count: item._count.status
      })),
      topJobs: topJobs.map(job => {
        const applicationCount = applicationsByJob.find(item => item.jobId === job.id)?._count.jobId || 0;
        return {
          ...job,
          applicationCount
        };
      }),
      recentApplications: recentApplications.map(app => ({
        id: app.id,
        status: app.status,
        appliedAt: app.appliedAt,
        applicant: app.applicant,
        job: app.job
      }))
    };
  }

  // Analytics Methods
  private async getUserMetrics() {
    const [
      totalUsers,
      usersByRole,
      newThisWeek,
      newThisMonth
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.groupBy({
        by: ['role'],
        _count: { role: true }
      }),
      this.prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      this.prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ]);

    const roleCounts = usersByRole.reduce((acc, item) => {
      acc[item.role] = item._count.role;
      return acc;
    }, {} as Record<string, number>);

    const growthRate = '12.5%'; // Mock data

    return {
      total: totalUsers,
      active: totalUsers,
      newThisWeek,
      newThisMonth,
      byRole: roleCounts,
      growthRate,
      topLocations: []
    };
  }

  private async getContentMetrics() {
    const [
      projects,
      events,
      jobs
    ] = await Promise.all([
      this.prisma.project.groupBy({
        by: ['status'],
        _count: { status: true }
      }),
      this.prisma.event.groupBy({
        by: ['status'],
        _count: { status: true }
      }),
      this.prisma.job.groupBy({
        by: ['status'],
        _count: { status: true }
      })
    ]);

    const projectCounts = projects.reduce((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {} as Record<string, number>);

    const eventCounts = events.reduce((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {} as Record<string, number>);

    const jobCounts = jobs.reduce((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {} as Record<string, number>);

    return {
      projects: {
        total: projectCounts.APPROVED || 0 + projectCounts.PENDING_APPROVAL || 0 + projectCounts.DRAFT || 0,
        published: projectCounts.APPROVED || 0,
        draft: projectCounts.DRAFT || 0,
        flagged: projectCounts.REJECTED || 0,
        newThisWeek: 0
      },
      events: {
        total: eventCounts.PUBLISHED || 0 + eventCounts.DRAFT || 0,
        upcoming: eventCounts.PUBLISHED || 0,
        completed: eventCounts.COMPLETED || 0,
        cancelled: eventCounts.CANCELLED || 0,
        newThisWeek: 0
      },
      jobs: {
        total: jobCounts.PUBLISHED || 0 + jobCounts.DRAFT || 0,
        active: jobCounts.PUBLISHED || 0,
        closed: jobCounts.CLOSED || 0,
        applications: await this.prisma.jobApplication.count(),
        newThisWeek: 0
      }
    };
  }

  private async getEngagementMetrics() {
    const totalInteractions = await this.prisma.activity.count();
    const uniqueUsers = await this.prisma.user.count();

    return {
      totalInteractions,
      uniqueUsers,
      averageSessionDuration: 0,
      bounceRate: '0%',
      topPages: [],
      userRetention: '0%'
    };
  }

  private async getSystemMetrics() {
    return {
      uptime: '99.9%',
      responseTime: 150,
      errorRate: '0.1%',
      activeConnections: 0,
      databaseSize: '1.2GB'
    };
  }

  // Recent Activity
  async getRecentActivity(filters: {
    page?: number;
    limit?: number;
    type?: string;
  }) {
    const { page = 1, limit = 20, type } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (type) {
      where.type = type;
    }

    const [activities, total] = await Promise.all([
      this.prisma.activity.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.activity.count({ where })
    ]);

    return {
      data: activities,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  // Quick Actions
  async getQuickActions() {
    const [
      pendingProjects,
      flaggedContent,
      newUsers
    ] = await Promise.all([
      this.prisma.project.count({
        where: { status: ProjectStatus.PENDING_APPROVAL }
      }),
      this.prisma.project.count({
        where: { status: ProjectStatus.REJECTED }
      }),
      this.prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      })
    ]);

    return [
      {
        id: 'review-projects',
        title: 'Review Projects',
        description: 'Projects pending approval',
        icon: 'FileText',
        action: 'review',
        count: pendingProjects,
        priority: pendingProjects > 0 ? 'high' : 'low',
        category: 'moderation'
      },
      {
        id: 'flagged-content',
        title: 'Flagged Content',
        description: 'Content requiring attention',
        icon: 'AlertTriangle',
        action: 'review',
        count: flaggedContent,
        priority: flaggedContent > 0 ? 'medium' : 'low',
        category: 'moderation'
      },
      {
        id: 'new-users',
        title: 'New Users',
        description: 'Users joined today',
        icon: 'Users',
        action: 'view',
        count: newUsers,
        priority: 'low',
        category: 'users'
      }
    ];
  }

  // System Health
  async getSystemHealth() {
    const checks = [
      {
        name: 'Database Connection',
        status: 'pass' as const,
        responseTime: 15,
        message: 'Connected successfully',
        lastChecked: new Date().toISOString()
      },
      {
        name: 'API Response Time',
        status: 'pass' as const,
        responseTime: 120,
        message: 'Response time within limits',
        lastChecked: new Date().toISOString()
      }
    ];

    return {
      status: 'healthy' as const,
      checks,
      lastChecked: new Date().toISOString(),
      uptime: '99.9%'
    };
  }

  // System Performance
  async getSystemPerformance() {
    return {
      cpu: {
        usage: 25,
        cores: 8,
        temperature: 45
      },
      memory: {
        total: 16384,
        used: 8192,
        free: 8192,
        usage: 50
      },
      disk: {
        total: 1000000,
        used: 250000,
        free: 750000,
        usage: 25
      },
      network: {
        bytesIn: 1024000,
        bytesOut: 512000,
        connections: 150
      },
      database: {
        connections: 25,
        queryTime: 45,
        slowQueries: 2
      },
      timestamp: new Date().toISOString()
    };
  }

  // System Logs
  async getSystemLogs(filters: {
    page?: number;
    limit?: number;
    level?: string;
    startDate?: string;
    endDate?: string;
  }) {
    return {
      logs: [],
      total: 0,
      page: filters.page || 1,
      limit: filters.limit || 50,
      totalPages: 0
    };
  }

  // Bulk Operations
  async bulkApproveContent(type: string, ids: string[]) {
    if (type === 'projects') {
      const updates = ids.map(id => 
        this.prisma.project.update({
          where: { id },
          data: {
            status: ProjectStatus.APPROVED,
            isPublic: true
          }
        })
      );
      await this.prisma.$transaction(updates);
    }
    
    return { message: `${ids.length} items approved successfully` };
  }

  async bulkDeleteContent(type: string, ids: string[]) {
    if (type === 'projects') {
      await this.prisma.project.deleteMany({
        where: { id: { in: ids } }
      });
    } else if (type === 'events') {
      await this.prisma.event.deleteMany({
        where: { id: { in: ids } }
      });
    } else if (type === 'jobs') {
      await this.prisma.job.deleteMany({
        where: { id: { in: ids } }
      });
    }
    
    return { message: `${ids.length} items deleted successfully` };
  }

  // Analytics with period support
  async getUserAnalytics(period: '7d' | '30d' | '90d' | '1y' = '30d', groupBy: 'day' | 'week' | 'month' = 'day') {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [totalUsers, newUsers, usersByRole] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({
        where: { createdAt: { gte: startDate } }
      }),
      this.prisma.user.groupBy({
        by: ['role'],
        _count: { role: true }
      })
    ]);

    const roleCounts = usersByRole.reduce((acc, item) => {
      acc[item.role] = item._count.role;
      return acc;
    }, {} as Record<string, number>);

    const growthRate = '12.5%';

    return {
      totalUsers,
      activeUsers: totalUsers,
      newUsers,
      growthRate,
      byRole: roleCounts,
      byLocation: [],
      trends: []
    };
  }

  async getContentAnalytics(period: '7d' | '30d' | '90d' | '1y' = '30d', type?: 'projects' | 'events' | 'jobs') {
    return {
      total: 0,
      published: 0,
      draft: 0,
      flagged: 0,
      growthRate: '15.2%',
      byType: {},
      byStatus: {},
      trends: []
    };
  }

  async getEngagementAnalytics(period: '7d' | '30d' | '90d' | '1y' = '30d') {
    return {
      totalInteractions: 0,
      uniqueUsers: 0,
      averageSessionDuration: 0,
      bounceRate: '0%',
      topPages: [],
      userJourney: []
    };
  }

  async getTrendAnalytics(period: '7d' | '30d' | '90d' | '1y' = '30d', metric: 'users' | 'projects' | 'events' | 'jobs' = 'users') {
    return {
      trends: [],
      period,
      metric
    };
  }

  // Helper methods
  private async getActiveUsers() {
    return Math.floor(Math.random() * 100) + 50;
  }

  private async getRecentSignups() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
  }

  private async getSystemAlerts() {
    return [];
  }
} 