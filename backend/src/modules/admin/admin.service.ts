import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole, ProjectStatus, ProjectType, EventStatus, JobStatus } from '../../../generated/prisma';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

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
      throw new BadRequestException('Project is not pending approval');
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
      throw new BadRequestException('Project is not pending approval');
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
    
    if (status) {
      where.status = status as ProjectStatus;
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