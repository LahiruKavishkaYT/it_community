import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { Project, UserRole, ProjectType } from '../../../generated/prisma';
import { ActivitiesService } from '../activities/activities.service';
import { DashboardGateway } from '../admin/dashboard.gateway';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activitiesService: ActivitiesService,
    private readonly dashboardGateway: DashboardGateway
  ) {}

  async findAll(): Promise<Project[]> {
    const projects = await this.prisma.project.findMany({
      where: {
        status: 'APPROVED', // Only show approved projects to regular users
        isPublic: true
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
          },
        },
        feedback: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform the data to match frontend expectations
    return projects.map(project => ({
      ...project,
      author: project.author.name,
    }));
  }

  async findByType(projectType: ProjectType): Promise<Project[]> {
    const projects = await this.prisma.project.findMany({
      where: { 
        projectType,
        status: 'APPROVED', // Only show approved projects
        isPublic: true
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
          },
        },
        feedback: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return projects.map(project => ({
      ...project,
      author: project.author.name,
    }));
  }

  async findByUserRole(userRole: UserRole): Promise<Project[]> {
    // Students see practice projects first, IT professionals see student projects first
    const projectType = userRole === UserRole.STUDENT ? ProjectType.PRACTICE_PROJECT : ProjectType.STUDENT_PROJECT;
    return this.findByType(projectType);
  }

  async findOne(id: string): Promise<any> {
    const project = await this.prisma.project.findUnique({
      where: { 
        id,
        status: 'APPROVED', // Only show approved projects
        isPublic: true
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
          },
        },
        feedback: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    // Transform the data to match frontend expectations
    return {
      ...project,
      author: project.author.name,
      feedback: project.feedback.map(feedback => ({
        ...feedback,
        authorName: feedback.author.name,
      })),
    };
  }

  async create(createProjectDto: CreateProjectDto & { projectType: ProjectType }, authorId: string): Promise<any> {
    // Get user role to validate project type
    const user = await this.prisma.user.findUnique({
      where: { id: authorId },
      select: { role: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate project type based on user role
    this.validateProjectTypeByRole(createProjectDto.projectType, user.role);

    const project = await this.prisma.project.create({
      data: {
        ...createProjectDto,
        authorId,
        status: 'PENDING_APPROVAL', // Set to pending approval
        submittedAt: new Date(),
        isPublic: false // Not public until approved
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
      },
    });

    // Log the activity
    await this.activitiesService.logProjectUpload(
      authorId,
      project.title,
      project.id
    );

    // Emit real-time update to admin dashboard
    this.dashboardGateway.emitProjectApprovalUpdate({
      action: 'project-submitted',
      project: {
        id: project.id,
        title: project.title,
        author: project.author.name,
        authorEmail: project.author.email,
        projectType: project.projectType,
        status: project.status,
        submittedAt: project.submittedAt
      }
    });

    // Emit metrics update
    this.dashboardGateway.emitMetricsUpdate({
      type: 'project-created',
      data: { projectId: project.id }
    });

    // Transform the data to match frontend expectations
    return {
      ...project,
      author: project.author.name,
    };
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, userId: string): Promise<any> {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    // Ownership check
    if (project.authorId !== userId) {
      throw new ForbiddenException('You can only update your own projects');
    }

    // If project type is being updated, validate it
    if ('projectType' in updateProjectDto && updateProjectDto.projectType !== undefined) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });

      if (user && updateProjectDto.projectType) {
        this.validateProjectTypeByRole(updateProjectDto.projectType as ProjectType, user.role);
      }
    }

    const updatedProject = await this.prisma.project.update({
      where: { id },
      data: updateProjectDto,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
          },
        },
        feedback: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    // Transform the data to match frontend expectations
    return {
      ...updatedProject,
      author: updatedProject.author.name,
      feedback: updatedProject.feedback.map(feedback => ({
        ...feedback,
        authorName: feedback.author.name,
      })),
    };
  }

  async remove(id: string, userId: string): Promise<void> {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    // Ownership check
    if (project.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own projects');
    }

    await this.prisma.project.delete({
      where: { id },
    });
  }

  private validateProjectTypeByRole(projectType: ProjectType, userRole: UserRole): void {
    if (userRole === UserRole.STUDENT && projectType !== ProjectType.STUDENT_PROJECT) {
      throw new BadRequestException('Students can only create student projects');
    }

    if (userRole === UserRole.PROFESSIONAL && projectType !== ProjectType.PRACTICE_PROJECT) {
      throw new BadRequestException('IT professionals can only create practice projects');
    }
  }

  // New feedback methods
  async addFeedback(projectId: string, createFeedbackDto: CreateFeedbackDto, authorId: string): Promise<any> {
    // Check if project exists and is a student project (only student projects can receive feedback)
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    // Only student projects can receive feedback
    if (project.projectType !== ProjectType.STUDENT_PROJECT) {
      throw new BadRequestException('Feedback can only be provided for student projects');
    }

    // Check if the feedback author is not the project author
    if (project.authorId === authorId) {
      throw new BadRequestException('You cannot provide feedback on your own project');
    }

    // Check if the author has already provided feedback for this project
    const existingFeedback = await this.prisma.projectFeedback.findFirst({
      where: {
        projectId,
        authorId,
      },
    });

    if (existingFeedback) {
      throw new BadRequestException('You have already provided feedback for this project');
    }

    // Create the feedback
    const feedback = await this.prisma.projectFeedback.create({
      data: {
        ...createFeedbackDto,
        projectId,
        authorId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
          },
        },
      },
    });

    // Log the activity for the project author (they received feedback)
    await this.activitiesService.logProjectFeedback(
      project.authorId,
      project.title,
      project.id
    );

    // Return formatted feedback
    return {
      ...feedback,
      authorName: feedback.author.name,
    };
  }

  async getProjectFeedback(projectId: string): Promise<any[]> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    const feedback = await this.prisma.projectFeedback.findMany({
      where: { projectId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return feedback.map(fb => ({
      ...fb,
      authorName: fb.author.name,
    }));
  }

  async getUserFeedback(userId: string): Promise<any> {
    // Get all projects by the user
    const userProjects = await this.prisma.project.findMany({
      where: { authorId: userId },
      include: {
        feedback: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatar: true,
                role: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform the data to group feedback by project
    const projectsWithFeedback = userProjects.map(project => ({
      id: project.id,
      title: project.title,
      description: project.description,
      technologies: project.technologies,
      createdAt: project.createdAt,
      feedbackCount: project.feedback.length,
      averageRating: project.feedback.length > 0 
        ? Number((project.feedback.reduce((sum, fb) => sum + fb.rating, 0) / project.feedback.length).toFixed(1))
        : 0,
      feedback: project.feedback.map(fb => ({
        id: fb.id,
        content: fb.content,
        rating: fb.rating,
        authorId: fb.authorId,
        authorName: fb.author.name,
        authorRole: fb.author.role,
        createdAt: fb.createdAt,
      })),
    }));

    // Calculate overall statistics
    const totalFeedback = userProjects.reduce((sum, project) => sum + project.feedback.length, 0);
    const totalRating = userProjects.reduce((sum, project) => 
      sum + project.feedback.reduce((subSum, fb) => subSum + fb.rating, 0), 0);
    const overallAverageRating = totalFeedback > 0 ? Number((totalRating / totalFeedback).toFixed(1)) : 0;

    return {
      projects: projectsWithFeedback.filter(project => project.feedbackCount > 0), // Only projects with feedback
      statistics: {
        totalProjects: userProjects.length,
        projectsWithFeedback: projectsWithFeedback.filter(p => p.feedbackCount > 0).length,
        totalFeedback,
        overallAverageRating,
      },
    };
  }
} 