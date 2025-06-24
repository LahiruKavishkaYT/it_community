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
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole, ProjectType } from '../../../generated/prisma';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
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
  async findForUserRole(@Request() req: any) {
    return this.projectsService.findByUserRole(req.user.role);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT, UserRole.PROFESSIONAL)
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
  async remove(@Param('id') id: string, @Request() req: any) {
    await this.projectsService.remove(id, req.user.id);
    return { message: 'Project deleted successfully' };
  }
} 