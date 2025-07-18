import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ValidationPipe,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBody,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole, ProjectType } from '../../../generated/prisma';

@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Get all projects',
    description: `
      Retrieve all published projects in the platform.
      
      **Filtering Options:**
      - Filter by project type (STUDENT_PROJECT, PRACTICE_PROJECT)
      - Filter by author's role (STUDENT, PROFESSIONAL, COMPANY)
      
      **Public Access:** This endpoint doesn't require authentication.
      
      **Results:** Returns published projects with basic information and author details.
    `
  })
  @ApiQuery({ 
    name: 'type', 
    required: false, 
    enum: ProjectType, 
    description: 'Filter projects by type',
    example: 'STUDENT_PROJECT'
  })
  @ApiQuery({ 
    name: 'userRole', 
    required: false, 
    enum: UserRole, 
    description: 'Filter projects by author role',
    example: 'STUDENT'
  })
  @ApiOkResponse({ 
    description: 'Projects retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          description: { type: 'string' },
          projectType: { type: 'string', enum: ['STUDENT_PROJECT', 'PRACTICE_PROJECT'] },
          status: { type: 'string', enum: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'PUBLISHED', 'ARCHIVED'] },
          technologies: { type: 'array', items: { type: 'string' } },
          githubUrl: { type: 'string', nullable: true },
          liveUrl: { type: 'string', nullable: true },
          imageUrl: { type: 'string', nullable: true },
          views: { type: 'number' },
          likes: { type: 'number' },
          createdAt: { type: 'string', format: 'date-time' },
          author: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string' },
              role: { type: 'string', enum: ['STUDENT', 'PROFESSIONAL', 'COMPANY', 'ADMIN'] },
              avatar: { type: 'string', nullable: true },
            }
          },
          _count: {
            type: 'object',
            properties: {
              feedback: { type: 'number' }
            }
          }
        }
      }
    }
  })
  async findAll(@Query('type') type?: string, @Query('userRole') userRole?: string) {
    if (type && Object.values(ProjectType).includes(type as ProjectType)) {
      return this.projectsService.findByType(type as ProjectType);
    }
    
    if (userRole && Object.values(UserRole).includes(userRole as UserRole)) {
      return this.projectsService.findByUserRole(userRole as UserRole);
    }
    
    return this.projectsService.findAll();
  }

  @Get('for-role')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Get projects for user role',
    description: `
      Retrieve projects relevant to the authenticated user's role.
      
      **Role-based Results:**
      - STUDENT: Student projects and practice projects for learning
      - PROFESSIONAL: Advanced projects and case studies
      - COMPANY: All projects for recruitment and assessment
      
      **Authentication Required:** Must be logged in to access.
    `
  })
  @ApiOkResponse({ 
    description: 'Role-specific projects retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          description: { type: 'string' },
          projectType: { type: 'string', enum: ['STUDENT_PROJECT', 'PRACTICE_PROJECT'] },
          technologies: { type: 'array', items: { type: 'string' } },
          githubUrl: { type: 'string', nullable: true },
          liveUrl: { type: 'string', nullable: true },
          imageUrl: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          author: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              role: { type: 'string' },
              avatar: { type: 'string', nullable: true },
            }
          }
        }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  async findForUserRole(@Request() req: any) {
    return this.projectsService.findByUserRole(req.user.role);
  }

  @Get('my-feedback')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Get my project feedback',
    description: `
      Retrieve all feedback received on the authenticated student's projects.
      
      **Student Only:** This endpoint is restricted to users with STUDENT role.
      
      **Returns:**
      - All feedback received on student's projects
      - Feedback ratings and comments
      - Feedback author information
      - Project details for each feedback
    `
  })
  @ApiOkResponse({ 
    description: 'Student feedback retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          content: { type: 'string' },
          rating: { type: 'number', minimum: 1, maximum: 5 },
          createdAt: { type: 'string', format: 'date-time' },
          author: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              role: { type: 'string' },
              company: { type: 'string', nullable: true },
            }
          },
          project: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              title: { type: 'string' },
              technologies: { type: 'array', items: { type: 'string' } },
            }
          }
        }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Student role required' })
  async getMyFeedback(@Request() req: any) {
    return this.projectsService.getUserFeedback(req.user.id);
  }

  @Get('learning/org')
  @ApiOperation({summary: 'Get learning projects from professionals and companies'})
  @ApiQuery({name:'category',required:false,description:'Project category filter'})
  @ApiOkResponse({description:'Learning projects retrieved'})
  async getOrgLearningProjects(@Query('category') category?: string){
    return this.projectsService.findLearningProjectsFromOrgAuthors(category);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get project by ID',
    description: `
      Retrieve detailed information about a specific project.
      
      **Public Access:** No authentication required for published projects.
      
      **Returns:**
      - Complete project details
      - Author information
      - All feedback and ratings
      - Project statistics
      - Architecture and features
    `
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Project ID (UUID format)', 
    type: 'string',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiOkResponse({ 
    description: 'Project retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        title: { type: 'string' },
        description: { type: 'string' },
        projectType: { type: 'string', enum: ['STUDENT_PROJECT', 'PRACTICE_PROJECT'] },
        status: { type: 'string', enum: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'PUBLISHED', 'ARCHIVED'] },
        technologies: { type: 'array', items: { type: 'string' } },
        githubUrl: { type: 'string', nullable: true },
        liveUrl: { type: 'string', nullable: true },
        imageUrl: { type: 'string', nullable: true },
        architecture: { type: 'string', nullable: true },
        learningObjectives: { type: 'array', items: { type: 'string' } },
        keyFeatures: { type: 'array', items: { type: 'string' } },
        views: { type: 'number' },
        likes: { type: 'number' },
        createdAt: { type: 'string', format: 'date-time' },
        author: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            role: { type: 'string' },
            avatar: { type: 'string', nullable: true },
            bio: { type: 'string', nullable: true },
          }
        },
        feedback: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              content: { type: 'string' },
              rating: { type: 'number', minimum: 1, maximum: 5 },
              createdAt: { type: 'string', format: 'date-time' },
              author: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  role: { type: 'string' },
                  avatar: { type: 'string', nullable: true },
                }
              }
            }
          }
        }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'Project not found' })
  @ApiBadRequestResponse({ description: 'Invalid project ID format' })
  async findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Post(':id/feedback')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROFESSIONAL, UserRole.COMPANY)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Add feedback to project',
    description: `
      Add feedback and rating to a student's project.
      
      **Permissions:** Only PROFESSIONAL and COMPANY users can provide feedback.
      
      **Feedback Guidelines:**
      - Provide constructive criticism
      - Include specific improvement suggestions
      - Rate based on code quality, functionality, and presentation
      - Be encouraging and supportive
      
      **Rating Scale:** 1-5 stars (1 = Needs Improvement, 5 = Excellent)
    `
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Project ID to add feedback to', 
    type: 'string',
    format: 'uuid'
  })
  @ApiCreatedResponse({ 
    description: 'Feedback added successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        content: { type: 'string' },
        rating: { type: 'number', minimum: 1, maximum: 5 },
        createdAt: { type: 'string', format: 'date-time' },
        author: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            role: { type: 'string' },
            company: { type: 'string', nullable: true },
          }
        }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'Project not found' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Professional or Company role required' })
  @ApiBadRequestResponse({ description: 'Invalid feedback data' })
  @ApiBody({ type: CreateFeedbackDto })
  async addFeedback(
    @Param('id') projectId: string,
    @Body(ValidationPipe) createFeedbackDto: CreateFeedbackDto,
    @Request() req: any,
  ) {
    return this.projectsService.addFeedback(projectId, createFeedbackDto, req.user.id);
  }

  @Get(':id/feedback')
  @ApiOperation({ 
    summary: 'Get project feedback',
    description: `
      Retrieve all feedback for a specific project.
      
      **Public Access:** Anyone can view feedback on published projects.
      
      **Returns:**
      - All feedback comments and ratings
      - Feedback author information
      - Feedback timestamps
      - Average rating calculation
    `
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Project ID to get feedback for', 
    type: 'string',
    format: 'uuid'
  })
  @ApiOkResponse({ 
    description: 'Project feedback retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          content: { type: 'string' },
          rating: { type: 'number', minimum: 1, maximum: 5 },
          createdAt: { type: 'string', format: 'date-time' },
          author: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              role: { type: 'string' },
              avatar: { type: 'string', nullable: true },
              company: { type: 'string', nullable: true },
            }
          }
        }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'Project not found' })
  async getProjectFeedback(@Param('id') projectId: string) {
    return this.projectsService.getProjectFeedback(projectId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT, UserRole.PROFESSIONAL)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Create new project',
    description: `
      Create a new project in the platform.
      
      **Permissions:** STUDENT and PROFESSIONAL users can create projects.
      
      **Project Types:**
      - STUDENT projects: Academic projects, assignments, personal learning projects
      - PROFESSIONAL projects: Case studies, advanced implementations, portfolio pieces
      
      **Workflow:**
      1. Project created in DRAFT status
      2. Submitted for review (PENDING_APPROVAL)
      3. Admin reviews and approves/rejects
      4. Approved projects are PUBLISHED and visible to all users
      
      **Required Information:**
      - Title and description
      - Technologies used
      - GitHub repository (recommended)
      - Live demo URL (optional)
    `
  })
  @ApiCreatedResponse({ 
    description: 'Project created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        title: { type: 'string' },
        description: { type: 'string' },
        projectType: { type: 'string', enum: ['STUDENT_PROJECT', 'PRACTICE_PROJECT'] },
        status: { type: 'string', enum: ['DRAFT'] },
        technologies: { type: 'array', items: { type: 'string' } },
        githubUrl: { type: 'string', nullable: true },
        liveUrl: { type: 'string', nullable: true },
        imageUrl: { type: 'string', nullable: true },
        architecture: { type: 'string', nullable: true },
        learningObjectives: { type: 'array', items: { type: 'string' } },
        keyFeatures: { type: 'array', items: { type: 'string' } },
        createdAt: { type: 'string', format: 'date-time' },
        authorId: { type: 'string', format: 'uuid' },
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Student or Professional role required' })
  @ApiBadRequestResponse({ description: 'Invalid project data' })
  @ApiBody({ type: CreateProjectDto })
  async create(
    @Body(ValidationPipe) createProjectDto: CreateProjectDto,
    @Request() req: any,
  ) {
    // Auto-set project type based on user role
    const userRole = req.user.role;
    const projectType = userRole === UserRole.STUDENT 
      ? ProjectType.STUDENT_PROJECT 
      : ProjectType.PRACTICE_PROJECT;
    
    const projectData = {
      ...createProjectDto,
      projectType,
    };
    
    return this.projectsService.create(projectData, req.user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT, UserRole.PROFESSIONAL)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Update project',
    description: `
      Update an existing project.
      
      **Permissions:** 
      - Only the project author can update their project
      - STUDENT and PROFESSIONAL users only
      
      **Update Restrictions:**
      - Projects in PENDING_APPROVAL status cannot be edited
      - Approved projects can be updated but may require re-approval
      - Published projects maintain their published status unless major changes are made
      
      **Updatable Fields:**
      - Title, description, technologies
      - URLs (GitHub, live demo)
      - Architecture description
      - Learning objectives and key features
    `
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Project ID to update', 
    type: 'string',
    format: 'uuid'
  })
  @ApiOkResponse({ 
    description: 'Project updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        title: { type: 'string' },
        description: { type: 'string' },
        projectType: { type: 'string', enum: ['STUDENT_PROJECT', 'PRACTICE_PROJECT'] },
        status: { type: 'string', enum: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'PUBLISHED', 'ARCHIVED'] },
        technologies: { type: 'array', items: { type: 'string' } },
        githubUrl: { type: 'string', nullable: true },
        liveUrl: { type: 'string', nullable: true },
        imageUrl: { type: 'string', nullable: true },
        architecture: { type: 'string', nullable: true },
        learningObjectives: { type: 'array', items: { type: 'string' } },
        keyFeatures: { type: 'array', items: { type: 'string' } },
        updatedAt: { type: 'string', format: 'date-time' },
      }
    }
  })
  @ApiNotFoundResponse({ description: 'Project not found or not owned by user' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Student or Professional role required, or not project owner' })
  @ApiBadRequestResponse({ description: 'Invalid project data or project cannot be edited' })
  @ApiBody({ type: UpdateProjectDto })
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateProjectDto: UpdateProjectDto,
    @Request() req: any,
  ) {
    return this.projectsService.update(id, updateProjectDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT, UserRole.PROFESSIONAL)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Delete project',
    description: `
      Delete a project from the platform.
      
      **Permissions:** 
      - Only the project author can delete their project
      - STUDENT and PROFESSIONAL users only
      
      **Deletion Rules:**
      - Projects with feedback cannot be deleted (archived instead)
      - Draft projects can be deleted immediately
      - Published projects are archived to maintain feedback integrity
      
      **Warning:** This action cannot be undone for projects without feedback.
    `
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Project ID to delete', 
    type: 'string',
    format: 'uuid'
  })
  @ApiOkResponse({ 
    description: 'Project deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Project deleted successfully' }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'Project not found or not owned by user' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Student or Professional role required, or not project owner' })
  @ApiBadRequestResponse({ description: 'Project cannot be deleted (has feedback - will be archived instead)' })
  async remove(@Param('id') id: string, @Request() req: any) {
    await this.projectsService.remove(id, req.user.id);
    return { message: 'Project deleted successfully' };
  }
} 