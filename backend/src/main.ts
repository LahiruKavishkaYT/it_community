import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { validateEnvironmentVariables } from './common/config/env-validation';
import * as dotenv from 'dotenv';

async function bootstrap() {
  // Load .env file first
  dotenv.config();
  
  // Temporarily disabled for development - validation runs before NestJS ConfigModule loads
  // validateEnvironmentVariables();
  
  const app = await NestFactory.create(AppModule);
  
  // Enable global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable CORS – dev vs production
  const devOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'http://localhost:4173',
    'http://localhost:8080',
    'http://localhost:8081',
    'http://localhost:8082',
    'http://localhost:8083',
    'http://localhost:4200',
  ];

  // Allow env-specified origins always
  const envOrigins = [
    ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
    ...(process.env.ADMIN_DASHBOARD_URL ? [process.env.ADMIN_DASHBOARD_URL] : []),
    ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()) : []),
  ];

  const allowOrigins = process.env.NODE_ENV === 'production'
    ? envOrigins // Prod – explicit list only
    : [...devOrigins, ...envOrigins]; // Dev – include localhost helpers

  app.enableCors({
    origin: allowOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  });

  // Swagger/OpenAPI Documentation Configuration
  const config = new DocumentBuilder()
    .setTitle('IT Community Platform API')
    .setDescription(
      '🚀 **Comprehensive SaaS platform connecting students, professionals, and companies in the tech ecosystem**\n\n' +
      '## Overview\n' +
      'The IT Community Platform API provides endpoints for:\n' +
      '- 👥 **User Management** - Authentication, profiles, and role-based access\n' +
      '- 📂 **Project Showcase** - Student portfolio management with feedback system\n' +
      '- 💼 **Job Portal** - Advanced job posting and application management\n' +
      '- 📅 **Event Management** - Workshop, hackathon, and networking event coordination\n' +
      '- 📊 **Analytics** - Comprehensive dashboard and reporting capabilities\n' +
      '- 🔧 **Admin Tools** - Platform administration and content moderation\n\n' +
      '## Authentication\n' +
      'Most endpoints require JWT Bearer token authentication. Use the /auth/login endpoint to obtain an access token.\n\n' +
      '## User Roles\n' +
      '- **STUDENT** - Portfolio showcase, job applications, event participation\n' +
      '- **PROFESSIONAL** - Advanced networking, mentoring, exclusive opportunities\n' +
      '- **COMPANY** - Job posting, talent acquisition, event sponsorship\n' +
      '- **ADMIN** - Platform management, content moderation, analytics access\n\n' +
      '## Rate Limiting\n' +
      'API requests are rate-limited to ensure fair usage and platform stability.\n\n' +
      '## Support\n' +
      'For API support, please contact the development team or check the GitHub repository.'
    )
    .setVersion('1.0.0')
    .setContact(
      'IT Community Team', 
      'https://github.com/your-org/it-community-platform',
      'support@itcommunity.com'
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer('http://localhost:3001', 'Development Server')
    .addServer('https://api.itcommunity.com', 'Production Server')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This name here is important for matching up with @ApiBearerAuth() in your controller!
    )
    .addTag('Authentication', 'User authentication and authorization endpoints')
    .addTag('Users', 'User profile management and settings')
    .addTag('Projects', 'Project showcase and feedback system')
    .addTag('Events', 'Event management and registration')
    .addTag('Jobs', 'Job portal and application management')
    .addTag('Admin', 'Administrative functions and analytics')
    .addTag('Activities', 'User activity tracking and audit logs')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  });

  // Setup Swagger UI
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'none',
      filter: true,
      showRequestHeaders: true,
      syntaxHighlight: {
        theme: 'arta'
      }
    },
    customSiteTitle: 'IT Community Platform API Documentation',
    customfavIcon: '/favicon.ico',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #3b82f6 }
      .swagger-ui .scheme-container { background: #f8fafc; padding: 15px; border-radius: 8px; }
    `,
  });

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation available at: http://localhost:${port}/api/docs`);
}
bootstrap();