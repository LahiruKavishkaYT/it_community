# Backend Code Structure & Architecture

## Directory Structure (Feature-Based Modular Architecture)

```
src/
├── main.ts                          # Application entry point
├── app.module.ts                    # Root application module
├── app.controller.ts                # Health check endpoints
├── app.service.ts                   # Global application services
│
├── common/                          # Shared utilities and common functionality
│   ├── decorators/                  # Custom decorators
│   │   ├── current-user.decorator.ts
│   │   ├── permissions.decorator.ts
│   │   └── api-response.decorator.ts
│   ├── filters/                     # Exception filters
│   │   ├── http-exception.filter.ts
│   │   └── validation-exception.filter.ts
│   ├── guards/                      # Authentication and authorization guards
│   │   ├── jwt-auth.guard.ts
│   │   ├── roles.guard.ts
│   │   └── permissions.guard.ts
│   ├── interceptors/                # Request/response interceptors
│   │   ├── transform.interceptor.ts
│   │   ├── logging.interceptor.ts
│   │   └── cache.interceptor.ts
│   ├── pipes/                       # Validation and transformation pipes
│   │   ├── validation.pipe.ts
│   │   ├── sanitization.pipe.ts
│   │   └── parse-filter.pipe.ts
│   ├── middleware/                  # Custom middleware
│   │   ├── rate-limit.middleware.ts
│   │   ├── cors.middleware.ts
│   │   └── security.middleware.ts
│   ├── types/                       # Shared TypeScript types
│   │   ├── api-response.types.ts
│   │   ├── pagination.types.ts
│   │   └── filter.types.ts
│   └── utils/                       # Utility functions
│       ├── date.utils.ts
│       ├── crypto.utils.ts
│       └── validation.utils.ts
│
├── config/                          # Configuration modules
│   ├── database.config.ts
│   ├── jwt.config.ts
│   ├── redis.config.ts
│   ├── queue.config.ts
│   └── app.config.ts
│
├── core/                           # Core infrastructure services
│   ├── cache/                      # Caching service
│   │   ├── cache.module.ts
│   │   ├── cache.service.ts
│   │   └── cache-invalidation.service.ts
│   ├── database/                   # Database connection and services
│   │   ├── prisma.module.ts
│   │   ├── prisma.service.ts
│   │   └── database-health.service.ts
│   ├── queue/                      # Background job processing
│   │   ├── queue.module.ts
│   │   ├── analytics.processor.ts
│   │   ├── export.processor.ts
│   │   └── notification.processor.ts
│   ├── websocket/                  # Real-time communication
│   │   ├── websocket.module.ts
│   │   ├── dashboard.gateway.ts
│   │   └── websocket-auth.guard.ts
│   └── monitoring/                 # Application monitoring
│       ├── monitoring.module.ts
│       ├── performance.service.ts
│       ├── health-check.service.ts
│       └── metrics.service.ts
│
├── modules/                        # Feature modules (business logic)
│   │
│   ├── auth/                       # Authentication module
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── dto/
│   │   │   ├── login.dto.ts
│   │   │   ├── register.dto.ts
│   │   │   └── refresh-token.dto.ts
│   │   ├── strategies/
│   │   │   ├── jwt.strategy.ts
│   │   │   └── local.strategy.ts
│   │   └── session/
│   │       ├── session.service.ts
│   │       └── session.interface.ts
│   │
│   ├── dashboard/                  # Dashboard analytics module
│   │   ├── dashboard.module.ts
│   │   ├── dashboard.controller.ts
│   │   ├── services/
│   │   │   ├── dashboard-analytics.service.ts
│   │   │   ├── growth-chart.service.ts
│   │   │   ├── content-analytics.service.ts
│   │   │   ├── system-health.service.ts
│   │   │   └── recent-activity.service.ts
│   │   ├── dto/
│   │   │   ├── dashboard-stats.dto.ts
│   │   │   ├── growth-chart-query.dto.ts
│   │   │   └── system-health.dto.ts
│   │   └── interfaces/
│   │       ├── dashboard-stats.interface.ts
│   │       └── analytics.interface.ts
│   │
│   ├── users/                      # User management module
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── dto/
│   │   │   ├── create-user.dto.ts
│   │   │   ├── update-user.dto.ts
│   │   │   ├── user-filters.dto.ts
│   │   │   └── suspend-user.dto.ts
│   │   └── interfaces/
│   │       └── user.interface.ts
│   │
│   ├── projects/                   # Project management module
│   │   ├── projects.module.ts
│   │   ├── projects.controller.ts
│   │   ├── projects.service.ts
│   │   ├── dto/
│   │   │   ├── create-project.dto.ts
│   │   │   ├── update-project.dto.ts
│   │   │   ├── project-filters.dto.ts
│   │   │   └── project-status.dto.ts
│   │   └── interfaces/
│   │       └── project.interface.ts
│   │
│   ├── events/                     # Event management module
│   │   ├── events.module.ts
│   │   ├── events.controller.ts
│   │   ├── events.service.ts
│   │   ├── dto/
│   │   │   ├── create-event.dto.ts
│   │   │   ├── update-event.dto.ts
│   │   │   └── event-filters.dto.ts
│   │   └── interfaces/
│   │       └── event.interface.ts
│   │
│   ├── jobs/                       # Job management module
│   │   ├── jobs.module.ts
│   │   ├── jobs.controller.ts
│   │   ├── jobs.service.ts
│   │   ├── dto/
│   │   │   ├── create-job.dto.ts
│   │   │   ├── update-job.dto.ts
│   │   │   └── job-filters.dto.ts
│   │   └── interfaces/
│   │       └── job.interface.ts
│   │
│   ├── career-paths/               # Career path management module
│   │   ├── career-paths.module.ts
│   │   ├── career-paths.controller.ts
│   │   ├── career-paths.service.ts
│   │   ├── dto/
│   │   │   ├── create-career-path.dto.ts
│   │   │   ├── update-career-path.dto.ts
│   │   │   └── career-path-step.dto.ts
│   │   └── interfaces/
│   │       ├── career-path.interface.ts
│   │       └── career-path-step.interface.ts
│   │
│   ├── admin/                      # System administration module
│   │   ├── admin.module.ts
│   │   ├── admin.controller.ts
│   │   ├── admin.service.ts
│   │   ├── services/
│   │   │   ├── content-moderation.service.ts
│   │   │   ├── announcement.service.ts
│   │   │   ├── audit-log.service.ts
│   │   │   └── data-export.service.ts
│   │   ├── dto/
│   │   │   ├── create-announcement.dto.ts
│   │   │   ├── content-report.dto.ts
│   │   │   └── data-export.dto.ts
│   │   └── interfaces/
│   │       ├── announcement.interface.ts
│   │       └── content-report.interface.ts
│   │
│   └── notifications/              # Notification system module
│       ├── notifications.module.ts
│       ├── notifications.service.ts
│       ├── providers/
│       │   ├── email.provider.ts
│       │   ├── websocket.provider.ts
│       │   └── push.provider.ts
│       └── dto/
│           └── notification.dto.ts
│
├── database/                       # Database schema and migrations
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seeds/
│   │       ├── seed.ts
│   │       └── admin-user.seed.ts
│   └── views/
│       ├── analytics-growth.sql
│       └── user-stats.sql
│
├── scripts/                        # Utility scripts
│   ├── generate-admin.ts
│   ├── migrate-data.ts
│   ├── cleanup-old-data.ts
│   └── performance-test.ts
│
└── test/                          # Test files
    ├── unit/                      # Unit tests
    ├── integration/               # Integration tests
    ├── e2e/                       # End-to-end tests
    └── fixtures/                  # Test data fixtures
```

## Core Controller Example

```typescript
// src/modules/dashboard/dashboard.controller.ts
@Controller('api/v1/dashboard')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
@ApiTags('Dashboard')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardAnalyticsService,
    private readonly cacheService: CacheService,
    private readonly activityLogger: ActivityLogger
  ) {}

  @Get('stats')
  @RequirePermissions('analytics.read')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiQuery({ name: 'period', enum: ['7d', '30d', '90d', '1y'], required: false })
  @ApiResponse({ status: 200, description: 'Dashboard statistics retrieved successfully' })
  async getDashboardStats(
    @Query('period', new DefaultValuePipe('30d')) period: string,
    @CurrentUser() user: JWTPayload
  ): Promise<ApiResponse<DashboardStats>> {
    const stats = await this.cacheService.getOrSet(
      `dashboard:stats:${period}`,
      () => this.dashboardService.calculateAllStats(period),
      15 * 60 // 15 minutes
    );

    await this.activityLogger.logActivity(
      user.sub,
      ActivityType.ADMIN_ACTION,
      `Viewed dashboard statistics for period: ${period}`
    );

    return {
      success: true,
      data: stats,
      message: 'Dashboard statistics retrieved successfully'
    };
  }

  @Get('growth-chart')
  @RequirePermissions('analytics.read')
  @ApiOperation({ summary: 'Get growth chart data' })
  async getGrowthChart(
    @Query() query: GrowthChartQueryDto
  ): Promise<ApiResponse<GrowthChartData[]>> {
    const data = await this.dashboardService.getGrowthChartData(
      query.period,
      query.metrics
    );

    return {
      success: true,
      data,
      message: 'Growth chart data retrieved successfully'
    };
  }
}
```

## Service Layer Example

```typescript
// src/modules/dashboard/services/dashboard-analytics.service.ts
@Injectable()
export class DashboardAnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService
  ) {}

  async calculateAllStats(period: string): Promise<DashboardStats> {
    // Execute all calculations in parallel for better performance
    const [
      userStats,
      projectStats,
      eventStats,
      jobStats,
      careerPathStats,
      adminStats
    ] = await Promise.all([
      this.calculateUserStats(period),
      this.calculateProjectStats(period),
      this.calculateEventStats(period),
      this.calculateJobStats(period),
      this.calculateCareerPathStats(period),
      this.calculateAdminStats(period)
    ]);

    return {
      totalUsers: userStats,
      activeProjects: projectStats,
      upcomingEvents: eventStats,
      openPositions: jobStats,
      careerPaths: careerPathStats,
      adminUsers: adminStats,
      meta: {
        period,
        generatedAt: new Date().toISOString(),
        cacheExpiry: new Date(Date.now() + 15 * 60 * 1000).toISOString()
      }
    };
  }

  private async calculateUserStats(period: string): Promise<StatCalculation> {
    const { startDate, endDate, previousStartDate, previousEndDate } = 
      this.getPeriodDates(period);

    // Use efficient raw SQL for complex aggregations
    const [currentData, previousData, roleBreakdown] = await Promise.all([
      this.prisma.$queryRaw`
        SELECT COUNT(*) as total
        FROM users 
        WHERE created_at BETWEEN ${startDate} AND ${endDate}
        AND is_active = true
      `,
      this.prisma.$queryRaw`
        SELECT COUNT(*) as total
        FROM users 
        WHERE created_at BETWEEN ${previousStartDate} AND ${previousEndDate}
        AND is_active = true
      `,
      this.prisma.user.groupBy({
        by: ['role'],
        where: { isActive: true },
        _count: true
      })
    ]);

    const current = Number(currentData[0].total);
    const previous = Number(previousData[0].total);
    const trend = this.calculateTrend(current, previous);

    return {
      value: current,
      trend,
      trendDirection: trend > 0 ? 'up' : trend < 0 ? 'down' : 'neutral',
      breakdown: roleBreakdown.reduce((acc, item) => {
        acc[item.role] = item._count;
        return acc;
      }, {}),
      previousPeriod: previous
    };
  }

  private calculateTrend(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Number((((current - previous) / previous) * 100).toFixed(1));
  }

  private getPeriodDates(period: string) {
    const now = new Date();
    const days = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 }[period] || 30;
    
    const endDate = now;
    const startDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
    const previousEndDate = new Date(startDate.getTime() - 1);
    const previousStartDate = new Date(previousEndDate.getTime() - (days * 24 * 60 * 60 * 1000));

    return { startDate, endDate, previousStartDate, previousEndDate };
  }
}
```

## Module Configuration Example

```typescript
// src/modules/dashboard/dashboard.module.ts
@Module({
  imports: [
    PrismaModule,
    CacheModule,
    BullModule.registerQueue({
      name: 'analytics',
      defaultJobOptions: {
        removeOnComplete: 10,
        removeOnFail: 50,
      }
    })
  ],
  controllers: [DashboardController],
  providers: [
    DashboardAnalyticsService,
    GrowthChartService,
    ContentAnalyticsService,
    SystemHealthService,
    RecentActivityService,
    AnalyticsProcessor
  ],
  exports: [DashboardAnalyticsService]
})
export class DashboardModule {}
```

## Environment Configuration

```typescript
// src/config/app.config.ts
export default () => ({
  port: parseInt(process.env.PORT, 10) || 3001,
  database: {
    url: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production'
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expirationTime: process.env.JWT_EXPIRATION_TIME || '15m',
    refreshExpirationTime: process.env.JWT_REFRESH_EXPIRATION_TIME || '7d'
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD
  },
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  },
  rateLimit: {
    ttl: 60,
    limit: 100
  }
});
```

This structure provides:
- **Clear separation of concerns** between modules
- **Scalable architecture** that can grow with the application
- **Reusable components** across different modules
- **Proper dependency injection** and testability
- **Configuration management** for different environments
- **Performance optimization** through caching and background processing 