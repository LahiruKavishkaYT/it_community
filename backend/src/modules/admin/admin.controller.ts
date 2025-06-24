import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../../generated/prisma';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // User Management
  @Get('users')
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Patch('users/:id/role')
  async updateUserRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('role') newRole: UserRole,
  ) {
    return this.adminService.updateUserRole(id, newRole);
  }

  @Delete('users/:id')
  async deleteUser(@Param('id', ParseUUIDPipe) id: string) {
    await this.adminService.deleteUser(id);
    return { message: 'User deleted successfully' };
  }

  // Content Moderation
  @Get('content/projects')
  async getAllProjects() {
    return this.adminService.getAllProjects();
  }

  @Delete('content/projects/:id')
  async deleteProject(@Param('id', ParseUUIDPipe) id: string) {
    await this.adminService.deleteProject(id);
    return { message: 'Project deleted successfully' };
  }

  @Get('content/jobs')
  async getAllJobs() {
    return this.adminService.getAllJobs();
  }

  @Delete('content/jobs/:id')
  async deleteJob(@Param('id', ParseUUIDPipe) id: string) {
    await this.adminService.deleteJob(id);
    return { message: 'Job deleted successfully' };
  }

  @Get('content/events')
  async getAllEvents() {
    return this.adminService.getAllEvents();
  }

  @Delete('content/events/:id')
  async deleteEvent(@Param('id', ParseUUIDPipe) id: string) {
    await this.adminService.deleteEvent(id);
    return { message: 'Event deleted successfully' };
  }

  // System Analytics
  @Get('analytics/users')
  async getUserAnalytics() {
    return this.adminService.getUserAnalytics();
  }

  @Get('analytics/content')
  async getContentAnalytics() {
    return this.adminService.getContentAnalytics();
  }

  @Get('system/health')
  async getSystemHealth() {
    return this.adminService.getSystemHealth();
  }
} 