# Business Logic & Performance Architecture

## 1. Dashboard Statistics Calculation

### Core Statistics Logic

#### Total Users Calculation
```typescript
interface UserStatsCalculation {
  value: number;
  trend: number;
  trendDirection: 'up' | 'down' | 'neutral';
  breakdown: Record<string, number>;
  previousPeriod: number;
}

@Injectable()
export class DashboardAnalyticsService {
  constructor(private prisma: PrismaService) {}

  async calculateUserStats(period: string = '30d'): Promise<UserStatsCalculation> {
    const { startDate, endDate, previousStartDate, previousEndDate } = this.getPeriodDates(period);

    // Current period users
    const currentUsers = await this.prisma.user.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        },
        isActive: true
      }
    });

    // Previous period users (for comparison)
    const previousUsers = await this.prisma.user.count({
      where: {
        createdAt: {
          gte: previousStartDate,
          lte: previousEndDate
        },
        isActive: true
      }
    });

    // Role breakdown
    const roleBreakdown = await this.prisma.user.groupBy({
      by: ['role'],
      where: {
        createdAt: { lte: endDate },
        isActive: true
      },
      _count: true
    });

    const breakdown = roleBreakdown.reduce((acc, item) => {
      acc[item.role] = item._count;
      return acc;
    }, {} as Record<string, number>);

    // Calculate trend percentage
    const trend = previousUsers > 0 
      ? ((currentUsers - previousUsers) / previousUsers) * 100 
      : 0;

    return {
      value: currentUsers,
      trend: Number(trend.toFixed(1)),
      trendDirection: trend > 0 ? 'up' : trend < 0 ? 'down' : 'neutral',
      breakdown,
      previousPeriod: previousUsers
    };
  }

  private getPeriodDates(period: string) {
    const now = new Date();
    const periodMap = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    };

    const days = periodMap[period] || 30;
    const endDate = now;
    const startDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
    const previousEndDate = new Date(startDate.getTime() - 1);
    const previousStartDate = new Date(previousEndDate.getTime() - (days * 24 * 60 * 60 * 1000));

    return { startDate, endDate, previousStartDate, previousEndDate };
  }
}
```

#### Active Projects Calculation
```typescript
async calculateProjectStats(period: string = '30d'): Promise<StatsCalculation> {
  const { startDate, endDate } = this.getPeriodDates(period);

  // Use raw SQL for better performance on complex queries
  const currentProjects = await this.prisma.$queryRaw`
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN type = 'STUDENT_PROJECT' THEN 1 END) as student_projects,
      COUNT(CASE WHEN type = 'RESEARCH' THEN 1 END) as research,
      COUNT(CASE WHEN type = 'OPEN_SOURCE' THEN 1 END) as open_source
    FROM projects 
    WHERE status = 'PUBLISHED' 
    AND created_at <= ${endDate}
  `;

  const previousProjects = await this.prisma.$queryRaw`
    SELECT COUNT(*) as total
    FROM projects 
    WHERE status = 'PUBLISHED' 
    AND created_at <= ${this.getPeriodDates(period).previousEndDate}
  `;

  // Calculate trend and return structured data
  return this.formatStatsResponse(currentProjects[0], previousProjects[0]);
}
```

#### Performance Optimization for Statistics
```typescript
@Injectable()
export class CachedAnalyticsService {
  constructor(
    private prisma: PrismaService,
    private redis: Redis,
    private analyticsService: DashboardAnalyticsService
  ) {}

  async getCachedDashboardStats(period: string = '30d'): Promise<DashboardStats> {
    const cacheKey = `dashboard:stats:${period}`;
    
    // Try to get from cache first
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Calculate all statistics in parallel for better performance
    const [
      userStats,
      projectStats,
      eventStats,
      jobStats,
      careerPathStats,
      adminStats
    ] = await Promise.all([
      this.analyticsService.calculateUserStats(period),
      this.analyticsService.calculateProjectStats(period),
      this.analyticsService.calculateEventStats(period),
      this.analyticsService.calculateJobStats(period),
      this.analyticsService.calculateCareerPathStats(period),
      this.analyticsService.calculateAdminStats(period)
    ]);

    const stats = {
      totalUsers: userStats,
      activeProjects: projectStats,
      upcomingEvents: eventStats,
      openPositions: jobStats,
      careerPaths: careerPathStats,
      adminUsers: adminStats,
      meta: {
        period,
        generatedAt: new Date().toISOString(),
        cacheExpiry: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes
      }
    };

    // Cache for 15 minutes
    await this.redis.setex(cacheKey, 15 * 60, JSON.stringify(stats));
    
    return stats;
  }
}
```

## 2. Time-Series Data for Growth Charts

### Optimized Growth Chart Data
```typescript
@Injectable()
export class GrowthChartService {
  constructor(private prisma: PrismaService) {}

  async getGrowthChartData(period: 'weekly' | 'monthly' | 'yearly'): Promise<GrowthChartData[]> {
    const query = this.buildGrowthQuery(period);
    
    // Use materialized view for better performance
    const data = await this.prisma.$queryRaw`
      SELECT 
        time_bucket('1 ${period === 'weekly' ? 'week' : period === 'monthly' ? 'month' : 'year'}', created_at) as period,
        COUNT(CASE WHEN table_name = 'users' THEN 1 END) as users,
        COUNT(CASE WHEN table_name = 'projects' THEN 1 END) as projects,
        COUNT(CASE WHEN table_name = 'events' THEN 1 END) as events,
        AVG(engagement_score) as engagement_score
      FROM analytics_growth_view 
      WHERE created_at >= NOW() - INTERVAL '1 year'
      GROUP BY period 
      ORDER BY period ASC
    `;

    return data.map(row => ({
      period: this.formatPeriod(row.period, period),
      users: Number(row.users),
      projects: Number(row.projects),
      events: Number(row.events),
      userRegistrations: Number(row.user_registrations),
      engagementScore: Number(row.engagement_score?.toFixed(1) || 0)
    }));
  }

  private formatPeriod(date: Date, period: string): string {
    switch (period) {
      case 'weekly':
        return `Week ${Math.ceil(date.getDate() / 7)}`;
      case 'monthly':
        return date.toISOString().substring(0, 7); // YYYY-MM
      case 'yearly':
        return date.getFullYear().toString();
      default:
        return date.toISOString().substring(0, 10);
    }
  }
}
```

## 3. Caching Strategy Implementation

### Redis Caching Layer
```typescript
@Injectable()
export class CacheService {
  constructor(private redis: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    await this.redis.setex(key, ttlSeconds, JSON.stringify(value));
  }

  async invalidate(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }

  async getOrSet<T>(
    key: string, 
    fetcher: () => Promise<T>, 
    ttlSeconds: number
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached) return cached;

    const fresh = await fetcher();
    await this.set(key, fresh, ttlSeconds);
    return fresh;
  }
}

// Cache configuration for different data types
export const CACHE_CONFIGS = {
  DASHBOARD_STATS: {
    key: (period: string) => `dashboard:stats:${period}`,
    ttl: 15 * 60 // 15 minutes
  },
  GROWTH_CHART: {
    key: (period: string, metrics: string) => `dashboard:growth:${period}:${metrics}`,
    ttl: 60 * 60 // 1 hour
  },
  SYSTEM_HEALTH: {
    key: () => 'dashboard:health',
    ttl: 5 * 60 // 5 minutes
  },
  USER_LISTINGS: {
    key: (filters: string) => `users:list:${Buffer.from(filters).toString('base64')}`,
    ttl: 5 * 60 // 5 minutes
  }
};
```

### Cache Invalidation Strategy
```typescript
@Injectable()
export class CacheInvalidationService {
  constructor(private cacheService: CacheService) {}

  async invalidateUserRelatedCaches(): Promise<void> {
    await Promise.all([
      this.cacheService.invalidate('dashboard:stats:*'),
      this.cacheService.invalidate('dashboard:growth:*'),
      this.cacheService.invalidate('users:list:*')
    ]);
  }

  async invalidateProjectRelatedCaches(): Promise<void> {
    await Promise.all([
      this.cacheService.invalidate('dashboard:stats:*'),
      this.cacheService.invalidate('dashboard:growth:*'),
      this.cacheService.invalidate('dashboard:content:*')
    ]);
  }

  // Event-driven cache invalidation
  @OnEvent('user.created')
  async handleUserCreated(): Promise<void> {
    await this.invalidateUserRelatedCaches();
  }

  @OnEvent('project.created')
  async handleProjectCreated(): Promise<void> {
    await this.invalidateProjectRelatedCaches();
  }
}
```

## 4. Database Performance Optimization

### Database Indexing Strategy
```sql
-- Indexes for analytics queries
CREATE INDEX CONCURRENTLY idx_users_created_at_role ON users(created_at, role) WHERE is_active = true;
CREATE INDEX CONCURRENTLY idx_projects_created_at_status ON projects(created_at, status);
CREATE INDEX CONCURRENTLY idx_events_date_status ON events(date, status);
CREATE INDEX CONCURRENTLY idx_jobs_created_at_status ON jobs(created_at, status);
CREATE INDEX CONCURRENTLY idx_activities_type_created_at ON activities(type, created_at);
CREATE INDEX CONCURRENTLY idx_activities_user_created_at ON activities(user_id, created_at);

-- Composite indexes for common queries
CREATE INDEX CONCURRENTLY idx_users_role_active_created ON users(role, is_active, created_at);
CREATE INDEX CONCURRENTLY idx_projects_status_type_created ON projects(status, type, created_at);

-- Partial indexes for active records
CREATE INDEX CONCURRENTLY idx_users_active ON users(created_at) WHERE is_active = true;
CREATE INDEX CONCURRENTLY idx_projects_published ON projects(created_at) WHERE status = 'PUBLISHED';
```

### Materialized Views for Analytics
```sql
-- Materialized view for growth analytics
CREATE MATERIALIZED VIEW analytics_growth_view AS
SELECT 
  'users' as table_name,
  u.created_at,
  u.role,
  CASE 
    WHEN u.last_login > NOW() - INTERVAL '7 days' THEN 1 
    ELSE 0 
  END as is_active_user
FROM users u
WHERE u.is_active = true

UNION ALL

SELECT 
  'projects' as table_name,
  p.created_at,
  p.type::text as role,
  CASE 
    WHEN p.status = 'PUBLISHED' THEN 1 
    ELSE 0 
  END as is_active_user
FROM projects p

UNION ALL

SELECT 
  'events' as table_name,
  e.created_at,
  e.type::text as role,
  CASE 
    WHEN e.status = 'PUBLISHED' AND e.date > NOW() THEN 1 
    ELSE 0 
  END as is_active_user
FROM events e;

-- Refresh materialized view hourly
CREATE OR REPLACE FUNCTION refresh_analytics_growth_view()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY analytics_growth_view;
END;
$$ LANGUAGE plpgsql;

-- Schedule refresh (use pg_cron extension)
SELECT cron.schedule('refresh-analytics', '0 * * * *', 'SELECT refresh_analytics_growth_view();');
```

### Query Optimization Examples
```typescript
// Bad: N+1 query problem
async getUsersWithStats(): Promise<UserWithStats[]> {
  const users = await this.prisma.user.findMany();
  
  // This creates N additional queries!
  for (const user of users) {
    user.projectCount = await this.prisma.project.count({
      where: { authorId: user.id }
    });
  }
  return users;
}

// Good: Single query with joins
async getUsersWithStats(): Promise<UserWithStats[]> {
  return await this.prisma.user.findMany({
    include: {
      _count: {
        select: {
          projects: true,
          events: true,
          jobApplications: true
        }
      }
    }
  });
}

// Better: Raw SQL for complex analytics
async getUserAnalytics(): Promise<UserAnalytics[]> {
  return await this.prisma.$queryRaw`
    SELECT 
      u.id,
      u.name,
      u.email,
      u.role,
      COUNT(DISTINCT p.id) as project_count,
      COUNT(DISTINCT e.id) as event_count,
      COUNT(DISTINCT ja.id) as application_count,
      AVG(pf.rating) as avg_project_rating
    FROM users u
    LEFT JOIN projects p ON u.id = p.author_id
    LEFT JOIN events e ON u.id = e.organizer_id
    LEFT JOIN job_applications ja ON u.id = ja.applicant_id
    LEFT JOIN project_feedback pf ON p.id = pf.project_id
    WHERE u.is_active = true
    GROUP BY u.id, u.name, u.email, u.role
    ORDER BY u.created_at DESC
    LIMIT 1000
  `;
}
```

## 5. Background Job Processing

### Queue System for Heavy Operations
```typescript
@Injectable()
export class AnalyticsQueueService {
  constructor(
    @InjectQueue('analytics') private analyticsQueue: Queue,
    @InjectQueue('export') private exportQueue: Queue
  ) {}

  async scheduleStatsRecalculation(): Promise<void> {
    // Schedule stats recalculation every 15 minutes
    await this.analyticsQueue.add(
      'recalculate-stats',
      {},
      {
        repeat: { cron: '*/15 * * * *' },
        removeOnComplete: 5,
        removeOnFail: 10
      }
    );
  }

  async scheduleDataExport(
    userId: string, 
    exportType: string, 
    filters: any
  ): Promise<void> {
    await this.exportQueue.add(
      'export-data',
      { userId, exportType, filters },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 }
      }
    );
  }
}

@Processor('analytics')
export class AnalyticsProcessor {
  constructor(
    private analyticsService: DashboardAnalyticsService,
    private cacheService: CacheService
  ) {}

  @Process('recalculate-stats')
  async handleStatsRecalculation(): Promise<void> {
    const periods = ['7d', '30d', '90d', '1y'];
    
    for (const period of periods) {
      try {
        const stats = await this.analyticsService.calculateAllStats(period);
        await this.cacheService.set(
          `dashboard:stats:${period}`,
          stats,
          15 * 60 // 15 minutes
        );
      } catch (error) {
        console.error(`Failed to calculate stats for period ${period}:`, error);
      }
    }
  }
}
```

## 6. Real-time Features

### WebSocket Implementation for Live Updates
```typescript
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true
  }
})
export class DashboardGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private adminClients = new Map<string, Socket>();

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket): Promise<void> {
    try {
      const token = client.handshake.auth.token;
      const payload = await this.jwtService.verifyAsync(token);
      
      if (payload.role === 'ADMIN' || payload.role === 'SUPER_ADMIN') {
        this.adminClients.set(client.id, client);
        client.join('admin-dashboard');
      } else {
        client.disconnect();
      }
    } catch (error) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket): void {
    this.adminClients.delete(client.id);
  }

  @OnEvent('activity.created')
  async handleNewActivity(activity: Activity): Promise<void> {
    this.server.to('admin-dashboard').emit('new-activity', {
      id: activity.id,
      type: activity.type,
      description: activity.description,
      timestamp: activity.createdAt,
      user: activity.user ? {
        name: activity.user.name,
        initials: this.getInitials(activity.user.name)
      } : null
    });
  }

  @OnEvent('system.health.update')
  async handleSystemHealthUpdate(health: SystemHealth): Promise<void> {
    this.server.to('admin-dashboard').emit('system-health-update', health);
  }

  private getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }
}
```

## 7. Performance Monitoring

### Application Performance Monitoring
```typescript
@Injectable()
export class PerformanceMonitoringService {
  constructor(private prisma: PrismaService) {}

  async recordSystemMetric(
    name: string, 
    value: number, 
    unit?: string, 
    status: SystemStatus = SystemStatus.HEALTHY
  ): Promise<void> {
    await this.prisma.systemMetric.create({
      data: { name, value, unit, status }
    });
  }

  async getSystemHealth(): Promise<SystemHealthMetrics> {
    const metrics = await Promise.all([
      this.getCPUUsage(),
      this.getMemoryUsage(),
      this.getDatabasePerformance(),
      this.getAPIResponseTime(),
      this.getActiveConnections()
    ]);

    return {
      status: this.determineOverallStatus(metrics),
      metrics: metrics.map(metric => ({
        name: metric.name,
        value: metric.displayValue,
        progress: metric.progress,
        status: metric.status
      })),
      timestamp: new Date().toISOString()
    };
  }

  private async getDatabasePerformance(): Promise<MetricData> {
    const start = Date.now();
    await this.prisma.$queryRaw`SELECT 1`;
    const responseTime = Date.now() - start;

    return {
      name: 'Database Performance',
      value: responseTime,
      displayValue: `${responseTime}ms`,
      progress: Math.max(0, 100 - responseTime), // Lower is better
      status: responseTime < 100 ? SystemStatus.HEALTHY : 
              responseTime < 500 ? SystemStatus.WARNING : 
              SystemStatus.CRITICAL
    };
  }
}
``` 