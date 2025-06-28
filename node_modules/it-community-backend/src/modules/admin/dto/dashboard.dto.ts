import { IsOptional, IsString, IsNumber, IsEnum, IsArray, IsDateString, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

// Dashboard Overview DTOs
export class DashboardOverviewDto {
  metrics: DashboardMetricsDto;
  recentActivity: RecentActivityDto[];
  systemHealth: SystemHealthDto;
  quickActions: QuickActionDto[];
  realTimeData: RealTimeDataDto;
}

export class DashboardMetricsDto {
  users: UserMetricsDto;
  content: ContentMetricsDto;
  engagement: EngagementMetricsDto;
  system: SystemMetricsDto;
}

export class UserMetricsDto {
  total: number;
  active: number;
  newThisWeek: number;
  newThisMonth: number;
  byRole: Record<string, number>;
  growthRate: string;
  topLocations: Array<{ location: string; count: number }>;
}

export class ContentMetricsDto {
  projects: {
    total: number;
    published: number;
    draft: number;
    flagged: number;
    newThisWeek: number;
  };
  events: {
    total: number;
    upcoming: number;
    completed: number;
    cancelled: number;
    newThisWeek: number;
  };
  jobs: {
    total: number;
    active: number;
    closed: number;
    applications: number;
    newThisWeek: number;
  };
}

export class EngagementMetricsDto {
  totalInteractions: number;
  averageSessionDuration: number;
  bounceRate: string;
  topPages: Array<{ page: string; views: number }>;
  userRetention: string;
}

export class SystemMetricsDto {
  uptime: string;
  responseTime: number;
  errorRate: string;
  activeConnections: number;
  databaseSize: string;
}

// Real-time Data DTOs
export class RealTimeDataDto {
  activeUsers: number;
  currentSessions: number;
  recentSignups: Array<{ id: string; name: string; email: string; timestamp: string }>;
  recentActivity: Array<{ type: string; description: string; timestamp: string }>;
  systemAlerts: SystemAlertDto[];
}

export class SystemAlertDto {
  id: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
}

// Recent Activity DTOs
export class RecentActivityDto {
  id: string;
  type: 'user_signup' | 'project_created' | 'event_created' | 'job_posted' | 'user_login' | 'content_flagged';
  description: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  targetId?: string;
  targetType?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

// Quick Actions DTOs
export class QuickActionDto {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: string;
  count?: number;
  priority: 'low' | 'medium' | 'high';
  category: 'users' | 'content' | 'system' | 'moderation';
}

// System Health DTOs
export class SystemHealthDto {
  status: 'healthy' | 'warning' | 'critical';
  checks: SystemCheckDto[];
  lastChecked: string;
  uptime: string;
}

export class SystemCheckDto {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  responseTime?: number;
  message?: string;
  lastChecked: string;
}

// Filter and Pagination DTOs
export class PaginationDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  limit?: number = 10;
}

export class UserFiltersDto extends PaginationDto {
  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class ContentFiltersDto extends PaginationDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  authorId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

// Analytics DTOs
export class AnalyticsPeriodDto {
  @IsOptional()
  @IsEnum(['7d', '30d', '90d', '1y'])
  period?: '7d' | '30d' | '90d' | '1y' = '30d';

  @IsOptional()
  @IsEnum(['day', 'week', 'month'])
  groupBy?: 'day' | 'week' | 'month' = 'day';
}

export class UserAnalyticsDto extends AnalyticsPeriodDto {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  growthRate: string;
  byRole: Record<string, number>;
  byLocation: Array<{ location: string; count: number }>;
  trends: Array<{ date: string; count: number }>;
  topUsers: Array<{ id: string; name: string; email: string; activity: number }>;
}

export class ContentAnalyticsDto extends AnalyticsPeriodDto {
  @IsOptional()
  @IsEnum(['projects', 'events', 'jobs'])
  type?: 'projects' | 'events' | 'jobs';

  total: number;
  published: number;
  draft: number;
  flagged: number;
  growthRate: string;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  trends: Array<{ date: string; count: number }>;
  topContent: Array<{ id: string; title: string; type: string; views: number }>;
}

export class EngagementAnalyticsDto extends AnalyticsPeriodDto {
  totalInteractions: number;
  uniqueUsers: number;
  averageSessionDuration: number;
  bounceRate: string;
  userRetention: string;
  topPages: Array<{ page: string; views: number; uniqueViews: number }>;
  userJourney: Array<{ step: string; users: number; conversionRate: string }>;
}

// Bulk Operations DTOs
export class BulkOperationDto {
  @IsString()
  type: 'projects' | 'events' | 'jobs' | 'users';

  @IsArray()
  @IsString({ each: true })
  ids: string[];

  @IsOptional()
  @IsString()
  action?: 'approve' | 'delete' | 'suspend' | 'activate';
}

// System Logs DTOs
export class SystemLogsDto extends PaginationDto {
  @IsOptional()
  @IsEnum(['error', 'warn', 'info', 'debug'])
  level?: 'error' | 'warn' | 'info' | 'debug';

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  search?: string;
}

export class SystemLogEntryDto {
  id: string;
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  timestamp: string;
  userId?: string;
  userName?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

// Performance DTOs
export class SystemPerformanceDto {
  cpu: {
    usage: number;
    cores: number;
    temperature?: number;
  };
  memory: {
    total: number;
    used: number;
    free: number;
    usage: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
    usage: number;
  };
  network: {
    bytesIn: number;
    bytesOut: number;
    connections: number;
  };
  database: {
    connections: number;
    queryTime: number;
    slowQueries: number;
  };
  timestamp: string;
} 