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
  UsePipes,
  UseInterceptors,
  UploadedFile,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { CreateJobApplicationDto, UpdateApplicationStatusDto, BulkUpdateApplicationsDto } from './dto/job-application.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole, JobType, ExperienceLevel, ApplicationStatus } from '../../../generated/prisma';
import { UploadService } from '../../common/upload/upload.service';

@Controller('jobs')
export class JobsController {
  constructor(
    private readonly jobsService: JobsService,
    private readonly uploadService: UploadService,
  ) {}

  @Get('debug/user-role')
  @UseGuards(JwtAuthGuard)
  async debugUserRole(@Request() req: any) {
    return {
      user: req.user,
      canCreateJobs: req.user?.role === 'COMPANY' || req.user?.role === 'PROFESSIONAL',
      allowedRoles: ['COMPANY', 'PROFESSIONAL'],
      timestamp: new Date().toISOString()
    };
  }

  @Get()
  async findAll(
    @Query('type') type?: JobType,
    @Query('remote') remote?: string,
    @Query('experienceLevel') experienceLevel?: ExperienceLevel,
    @Query('location') location?: string,
    @Query('skills') skills?: string,
    @Query('salaryMin') salaryMin?: string,
    @Query('salaryMax') salaryMax?: string,
    @Query('featured') featured?: string,
    @Query('search') search?: string,
  ) {
    const filters: any = {};
    
    if (type) filters.type = type;
    if (remote !== undefined) filters.remote = remote === 'true';
    if (experienceLevel) filters.experienceLevel = experienceLevel;
    if (location) filters.location = location;
    if (skills) filters.skills = skills.split(',').map(s => s.trim());
    if (salaryMin) filters.salaryMin = parseInt(salaryMin);
    if (salaryMax) filters.salaryMax = parseInt(salaryMax);
    if (featured !== undefined) filters.featured = featured === 'true';
    if (search) filters.search = search;

    return this.jobsService.findAll(filters);
  }

  @Get('recommended/:userId')
  @UseGuards(JwtAuthGuard)
  async getRecommendedJobs(@Param('userId') userId: string) {
    return this.jobsService.getRecommendedJobs(userId);
  }

  @Get('company/:companyId/applications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY, UserRole.PROFESSIONAL)
  async getCompanyApplications(
    @Param('companyId') companyId: string,
    @Query('jobId') jobId?: string,
    @Query('status') status?: ApplicationStatus,
    @Query('skillsMatch') skillsMatch?: string,
    @Request() req?: any,
  ) {
    const filters: any = {};
    if (jobId) filters.jobId = jobId;
    if (status) filters.status = status;
    if (skillsMatch) filters.skillsMatch = parseInt(skillsMatch);

    return this.jobsService.getCompanyApplications(req.user.id, filters);
  }

  @Get('user/:userId/applications')
  @UseGuards(JwtAuthGuard)
  async getUserApplications(@Param('userId') userId: string, @Request() req: any) {
    // Users can only view their own applications
    if (req.user.id !== userId && req.user.role !== UserRole.ADMIN) {
      userId = req.user.id;
    }
    return this.jobsService.getUserApplications(userId);
  }

  @Get('user/:userId/bookmarks')
  @UseGuards(JwtAuthGuard)
  async getUserBookmarks(@Param('userId') userId: string, @Request() req: any) {
    // Users can only view their own bookmarks
    if (req.user.id !== userId && req.user.role !== UserRole.ADMIN) {
      userId = req.user.id;
    }
    return this.jobsService.getUserBookmarks(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req?: any) {
    const userId = req?.user?.id;
    return this.jobsService.findOne(id, userId);
  }

  @Get(':id/analytics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY)
  async getJobAnalytics(@Param('id') id: string, @Request() req: any) {
    return this.jobsService.getJobAnalytics(id, req.user.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY, UserRole.PROFESSIONAL)
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(
    @Body() createJobDto: CreateJobDto,
    @Request() req: any,
  ) {
    // Debug: Log user info for troubleshooting
    console.log('Job creation request from user:', {
      id: req.user?.id,
      role: req.user?.role,
      email: req.user?.email,
      name: req.user?.name
    });
    console.log('Job data received:', createJobDto);
    
    return this.jobsService.create(createJobDto, req.user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY, UserRole.PROFESSIONAL)
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(
    @Param('id') id: string,
    @Body() updateJobDto: UpdateJobDto,
    @Request() req: any,
  ) {
    return this.jobsService.update(id, updateJobDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY, UserRole.PROFESSIONAL)
  async remove(@Param('id') id: string, @Request() req: any) {
    await this.jobsService.remove(id, req.user.id);
    return { message: 'Job deleted successfully' };
  }

  // CV/Resume Upload
  @Post('upload-resume')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('resume'))
  async uploadResume(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    this.uploadService.validateFileUpload(file);
    
    return {
      message: 'Resume uploaded successfully',
      resumeUrl: `/jobs/download-resume/${file.filename}`,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
    };
  }

  // CV/Resume Download
  @Get('download-resume/:filename')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY, UserRole.PROFESSIONAL, UserRole.ADMIN)
  async downloadResume(
    @Param('filename') filename: string,
    @Res() res: Response,
    @Request() req: any,
  ) {
    try {
      const filePath = this.uploadService.getResumeFilePath(filename);
      
      // Security check - ensure file exists and user has permission
      if (!this.uploadService.fileExists(filename)) {
        throw new BadRequestException('File not found');
      }

      // Set appropriate headers for download
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      return res.sendFile(filePath);
    } catch (error) {
      throw new BadRequestException('Unable to download file');
    }
  }

  // Application Management
  @Post(':id/apply')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT, UserRole.PROFESSIONAL)
  @UsePipes(new ValidationPipe({ transform: true }))
  async applyForJob(
    @Param('id') id: string, 
    @Body() applicationData: CreateJobApplicationDto,
    @Request() req: any
  ) {
    const application = await this.jobsService.applyForJob(id, req.user.id, applicationData);
    return {
      message: 'Application submitted successfully',
      application,
    };
  }

  @Patch('applications/:applicationId/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY, UserRole.PROFESSIONAL)
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateApplicationStatus(
    @Param('applicationId') applicationId: string,
    @Body() updateData: UpdateApplicationStatusDto,
    @Request() req: any,
  ) {
    return this.jobsService.updateApplicationStatus(applicationId, updateData, req.user.id);
  }

  @Post(':id/applications/bulk-update')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY, UserRole.PROFESSIONAL)
  @UsePipes(new ValidationPipe({ transform: true }))
  async bulkUpdateApplications(
    @Param('id') jobId: string,
    @Body() updateData: BulkUpdateApplicationsDto,
    @Request() req: any,
  ) {
    return this.jobsService.bulkUpdateApplications(jobId, updateData, req.user.id);
  }

  // Bookmark Management
  @Post(':id/bookmark')
  @UseGuards(JwtAuthGuard)
  async bookmarkJob(@Param('id') jobId: string, @Request() req: any) {
    const bookmark = await this.jobsService.bookmarkJob(jobId, req.user.id);
    return {
      message: 'Job bookmarked successfully',
      bookmark,
    };
  }

  @Delete(':id/bookmark')
  @UseGuards(JwtAuthGuard)
  async removeBookmark(@Param('id') jobId: string, @Request() req: any) {
    await this.jobsService.removeBookmark(jobId, req.user.id);
    return { message: 'Bookmark removed successfully' };
  }
} 