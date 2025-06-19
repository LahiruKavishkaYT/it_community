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
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../../generated/prisma';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  async findAll() {
    return this.projectsService.findAll();
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
    return this.projectsService.create(createProjectDto, req.user.sub);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT, UserRole.PROFESSIONAL)
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateProjectDto: UpdateProjectDto,
    @Request() req: any,
  ) {
    return this.projectsService.update(id, updateProjectDto, req.user.sub);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT, UserRole.PROFESSIONAL)
  async remove(@Param('id') id: string, @Request() req: any) {
    await this.projectsService.remove(id, req.user.sub);
    return { message: 'Project deleted successfully' };
  }
} 