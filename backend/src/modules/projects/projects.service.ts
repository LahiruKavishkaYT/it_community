import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project, UserRole, ProjectType } from '../../../generated/prisma';
import { ActivitiesService } from '../activities/activities.service';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activitiesService: ActivitiesService
  ) {}

  async findAll(): Promise<Project[]> {
    const projects = await this.prisma.project.findMany({
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
      where: { projectType },
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
      where: { id },
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

    // Log the activity
    await this.activitiesService.logProjectUpload(
      authorId,
      project.title,
      project.id
    );

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
} 