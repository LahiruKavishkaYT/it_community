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
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  Post,
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
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../../generated/prisma';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth('JWT-auth')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Dashboard Overview
  @Get('dashboard/overview')
  @ApiOperation({ 
    summary: 'Get dashboard overview',
    description: 'Retrieve comprehensive dashboard overview with key metrics and recent activity'
  })
  @ApiOkResponse({ description: 'Dashboard overview retrieved successfully' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Admin role required' })
  async getDashboardOverview() {
    return this.adminService.getDashboardOverview();
  }

  @Get('dashboard/metrics')
  @ApiOperation({ 
    summary: 'Get detailed dashboard metrics',
    description: 'Retrieve detailed metrics for dashboard analytics'
  })
  @ApiOkResponse({ description: 'Dashboard metrics retrieved successfully' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Admin role required' })
  async getDashboardMetrics() {
    return this.adminService.getDashboardMetrics();
  }

  @Get('dashboard/realtime')
  @ApiOperation({ 
    summary: 'Get real-time dashboard data',
    description: 'Retrieve real-time data for live dashboard updates'
  })
  @ApiOkResponse({ description: 'Real-time data retrieved successfully' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Admin role required' })
  async getRealTimeData() {
    return this.adminService.getRealTimeData();
  }

  // User Management
  @Get('users')
  @ApiOperation({ 
    summary: 'Get all users with pagination and filtering',
    description: 'Retrieve all platform users with advanced filtering and pagination'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)', example: 10 })
  @ApiQuery({ name: 'role', required: false, enum: UserRole, description: 'Filter by user role' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by name or email' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Filter by status' })
  @ApiOkResponse({ description: 'Users retrieved successfully' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Admin role required' })
  async getAllUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('role') role?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.getAllUsers({ page, limit, role, search, status });
  }

  @Get('users/:id')
  @ApiOperation({ 
    summary: 'Get user details by ID',
    description: 'Retrieve comprehensive details for a specific user'
  })
  @ApiParam({ name: 'id', description: 'User ID', type: 'string' })
  @ApiOkResponse({ description: 'User details retrieved successfully' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Admin role required' })
  async getUserDetails(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.getUserDetails(id);
  }

  @Patch('users/:id/role')
  @ApiOperation({ 
    summary: 'Update user role',
    description: 'Change a user\'s role in the platform'
  })
  @ApiParam({ name: 'id', description: 'User ID to update', type: 'string' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        role: { type: 'string', enum: ['STUDENT', 'PROFESSIONAL', 'COMPANY', 'ADMIN'] }
      },
      required: ['role']
    }
  })
  @ApiOkResponse({ description: 'User role updated successfully' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Admin role required' })
  async updateUserRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('role') newRole: UserRole,
  ) {
    return this.adminService.updateUserRole(id, newRole);
  }

  @Patch('users/:id/status')
  @ApiOperation({ 
    summary: 'Update user status',
    description: 'Change user account status (active, suspended, deleted)'
  })
  @ApiParam({ name: 'id', description: 'User ID to update', type: 'string' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['active', 'suspended', 'deleted'] }
      },
      required: ['status']
    }
  })
  @ApiOkResponse({ description: 'User status updated successfully' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Admin role required' })
  async updateUserStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: 'active' | 'suspended' | 'deleted',
  ) {
    return this.adminService.updateUserStatus(id, status);
  }

  @Delete('users/:id')
  @ApiOperation({ 
    summary: 'Delete user account',
    description: 'Permanently delete a user account and all associated data'
  })
  @ApiParam({ name: 'id', description: 'User ID to delete', type: 'string' })
  @ApiOkResponse({ description: 'User deleted successfully' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Admin role required' })
  async deleteUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.deleteUser(id);
  }

  // Project Management
  @Get('projects')
  @ApiOperation({ 
    summary: 'Get all projects for moderation',
    description: 'Retrieve all projects with filtering for moderation purposes'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Filter by status' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search projects' })
  @ApiOkResponse({ description: 'Projects retrieved successfully' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Admin role required' })
  async getAllProjects(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getAllProjects({ page, limit, status, search });
  }

  @Post('projects/:id/approve')
  @ApiOperation({ 
    summary: 'Approve project',
    description: 'Approve a project for publication'
  })
  @ApiParam({ name: 'id', description: 'Project ID', type: 'string' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        notes: { type: 'string' }
      }
    }
  })
  @ApiOkResponse({ description: 'Project approved successfully' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Admin role required' })
  async approveProject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { notes?: string },
    @Request() req: any,
  ) {
    return this.adminService.approveProject(id, req.user.id, body.notes);
  }

  @Post('projects/:id/reject')
  @ApiOperation({ 
    summary: 'Reject project',
    description: 'Reject a project with reason'
  })
  @ApiParam({ name: 'id', description: 'Project ID', type: 'string' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        reason: { type: 'string' }
      },
      required: ['reason']
    }
  })
  @ApiOkResponse({ description: 'Project rejected successfully' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Admin role required' })
  async rejectProject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { reason: string },
    @Request() req: any,
  ) {
    return this.adminService.rejectProject(id, req.user.id, body.reason);
  }

  @Delete('projects/:id')
  @ApiOperation({ 
    summary: 'Delete project',
    description: 'Delete a project permanently'
  })
  @ApiParam({ name: 'id', description: 'Project ID', type: 'string' })
  @ApiOkResponse({ description: 'Project deleted successfully' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Admin role required' })
  async deleteProject(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.deleteProject(id);
  }

  // Events Management
  @Get('events')
  @ApiOperation({ 
    summary: 'Get all events for moderation',
    description: 'Retrieve all events with filtering for moderation purposes'
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiOkResponse({ description: 'Events retrieved successfully' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Admin role required' })
  async getAllEvents(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') status?: string,
  ) {
    return this.adminService.getAllEvents({ page, limit, status });
  }

  @Delete('events/:id')
  @ApiOperation({ 
    summary: 'Delete event',
    description: 'Delete an event permanently'
  })
  @ApiParam({ name: 'id', description: 'Event ID', type: 'string' })
  @ApiOkResponse({ description: 'Event deleted successfully' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Admin role required' })
  async deleteEvent(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.deleteEvent(id);
  }

  // Jobs Management
  @Get('jobs')
  @ApiOperation({ 
    summary: 'Get all jobs for moderation',
    description: 'Retrieve all jobs with filtering for moderation purposes'
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiOkResponse({ description: 'Jobs retrieved successfully' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Admin role required' })
  async getAllJobs(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') status?: string,
  ) {
    return this.adminService.getAllJobs({ page, limit, status });
  }

  @Delete('jobs/:id')
  @ApiOperation({ 
    summary: 'Delete job',
    description: 'Delete a job posting permanently'
  })
  @ApiParam({ name: 'id', description: 'Job ID', type: 'string' })
  @ApiOkResponse({ description: 'Job deleted successfully' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Admin role required' })
  async deleteJob(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.deleteJob(id);
  }

  // Analytics
  @Get('analytics/users')
  @ApiOperation({ 
    summary: 'Get user analytics',
    description: 'Retrieve detailed user analytics with time period filtering'
  })
  @ApiQuery({ name: 'period', required: false, enum: ['7d', '30d', '90d', '1y'] })
  @ApiQuery({ name: 'groupBy', required: false, enum: ['day', 'week', 'month'] })
  @ApiOkResponse({ description: 'User analytics retrieved successfully' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Admin role required' })
  async getUserAnalytics(
    @Query('period') period?: '7d' | '30d' | '90d' | '1y',
    @Query('groupBy') groupBy?: 'day' | 'week' | 'month',
  ) {
    return this.adminService.getUserAnalytics(period, groupBy);
  }

  @Get('analytics/content')
  @ApiOperation({ 
    summary: 'Get content analytics',
    description: 'Retrieve content analytics by type and time period'
  })
  @ApiQuery({ name: 'period', required: false, enum: ['7d', '30d', '90d', '1y'] })
  @ApiQuery({ name: 'type', required: false, enum: ['projects', 'events', 'jobs'] })
  @ApiOkResponse({ description: 'Content analytics retrieved successfully' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Admin role required' })
  async getContentAnalytics(
    @Query('period') period?: '7d' | '30d' | '90d' | '1y',
    @Query('type') type?: 'projects' | 'events' | 'jobs',
  ) {
    return this.adminService.getContentAnalytics(period, type);
  }

  // System Health
  @Get('system/health')
  @ApiOperation({ 
    summary: 'Get system health status',
    description: 'Retrieve current system health and status information'
  })
  @ApiOkResponse({ description: 'System health retrieved successfully' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Admin role required' })
  async getSystemHealth() {
    return this.adminService.getSystemHealth();
  }

  @Get('system/performance')
  @ApiOperation({ 
    summary: 'Get system performance metrics',
    description: 'Get detailed system performance metrics and monitoring data'
  })
  @ApiOkResponse({ description: 'System performance metrics retrieved successfully' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Admin role required' })
  async getSystemPerformance() {
    return this.adminService.getSystemPerformance();
  }

  // Activity Tracking
  @Get('activity/recent')
  @ApiOperation({ 
    summary: 'Get recent platform activity',
    description: 'Retrieve recent user activity across the platform'
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, type: String })
  @ApiOkResponse({ description: 'Recent activity retrieved successfully' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Admin role required' })
  async getRecentActivity(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('type') type?: string,
  ) {
    return this.adminService.getRecentActivity({ page, limit, type });
  }

  // Quick Actions
  @Get('actions/quick')
  @ApiOperation({ 
    summary: 'Get quick actions for admin dashboard',
    description: 'Retrieve available quick actions for the admin dashboard'
  })
  @ApiOkResponse({ description: 'Quick actions retrieved successfully' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Admin role required' })
  async getQuickActions() {
    return this.adminService.getQuickActions();
  }

  // Bulk Operations
  @Post('bulk/approve')
  @ApiOperation({ 
    summary: 'Bulk approve content',
    description: 'Approve multiple content items at once'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['projects', 'events', 'jobs'] },
        ids: { type: 'array', items: { type: 'string' } }
      },
      required: ['type', 'ids']
    }
  })
  @ApiCreatedResponse({ description: 'Content approved successfully' })
  @ApiBadRequestResponse({ description: 'Invalid request data' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Admin role required' })
  async bulkApproveContent(@Body() body: { type: string; ids: string[] }) {
    return this.adminService.bulkApproveContent(body.type, body.ids);
  }

  @Delete('bulk/delete')
  @ApiOperation({ 
    summary: 'Bulk delete content',
    description: 'Delete multiple content items at once'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['projects', 'events', 'jobs', 'users'] },
        ids: { type: 'array', items: { type: 'string' } }
      },
      required: ['type', 'ids']
    }
  })
  @ApiOkResponse({ description: 'Content deleted successfully' })
  @ApiBadRequestResponse({ description: 'Invalid request data' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Admin role required' })
  async bulkDeleteContent(@Body() body: { type: string; ids: string[] }) {
    return this.adminService.bulkDeleteContent(body.type, body.ids);
  }
} 