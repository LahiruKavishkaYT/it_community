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
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../../generated/prisma';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  async findAll() {
    return this.jobsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY)
  async create(
    @Body(ValidationPipe) createJobDto: CreateJobDto,
    @Request() req: any,
  ) {
    return this.jobsService.create(createJobDto, req.user.sub);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY)
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateJobDto: UpdateJobDto,
    @Request() req: any,
  ) {
    return this.jobsService.update(id, updateJobDto, req.user.sub);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY)
  async remove(@Param('id') id: string, @Request() req: any) {
    await this.jobsService.remove(id, req.user.sub);
    return { message: 'Job deleted successfully' };
  }

  @Post(':id/apply')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT, UserRole.PROFESSIONAL)
  async applyForJob(@Param('id') id: string, @Request() req: any) {
    const application = await this.jobsService.applyForJob(id, req.user.sub);
    return {
      message: 'Application submitted successfully',
      application,
    };
  }
} 