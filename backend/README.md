# 📚 IT Community Platform API Documentation

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-11+-E0234E?logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?logo=typescript&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-OpenAPI%203.0-85EA2D?logo=swagger&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13+-4169E1?logo=postgresql&logoColor=white)

> **Comprehensive REST API for the IT Community Platform - Connecting students, professionals, and companies in the tech ecosystem**

## 🌟 Overview

The IT Community Platform API is a robust, enterprise-grade REST API built with NestJS and TypeScript. It provides comprehensive endpoints for user management, project showcasing, job portal functionality, event management, and administrative operations.

### 🎯 API Features

- **🔐 JWT Authentication** - Secure token-based authentication with role-based access control
- **📖 OpenAPI/Swagger Documentation** - Interactive API documentation and testing interface
- **🎭 Role-Based Access Control** - STUDENT, PROFESSIONAL, COMPANY, and ADMIN roles
- **📊 Analytics & Reporting** - Comprehensive dashboard analytics and metrics
- **🔄 Real-time Updates** - WebSocket support for live data updates
- **📱 Mobile-Ready** - RESTful design optimized for mobile and web clients
- **🛡️ Security-First** - Input validation, sanitization, and comprehensive error handling

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 8+
- PostgreSQL 13+
- Git

### 1. Installation

```bash
# Clone the repository
git clone <repository-url>
cd it-community-platform/backend

# Install dependencies
npm install

# Install Swagger dependencies (if not already installed)
npm install @nestjs/swagger swagger-ui-express
```

### 2. Environment Setup

Create `.env` file in the backend directory:

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:password@localhost:5432/it_community_db?schema=public"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRATION="7d"

# Server Configuration
PORT=3001
NODE_ENV="development"

# Frontend URL for CORS
FRONTEND_URL="http://localhost:5173"
```

### 3. Database Setup

```bash
# Create database
createdb it_community_db

# Run migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate
```

### 4. Start the Server

```bash
# Development mode with hot reload
npm run start:dev

# Production mode
npm run start:prod
```

The server will start on `http://localhost:3001`

## 📖 API Documentation

### 🎯 Interactive Swagger UI

Once the server is running, access the comprehensive API documentation at:

**🌐 [http://localhost:3001/api/docs](http://localhost:3001/api/docs)**

The Swagger UI provides:

- **Interactive Testing** - Test API endpoints directly from the browser
- **Authentication Support** - Built-in JWT token management
- **Request/Response Examples** - Detailed schemas and examples
- **Parameter Validation** - Real-time input validation
- **Error Code Reference** - Comprehensive error documentation

### 🔑 Authentication

#### Getting Started with Authentication

1. **Register a new user:**
   ```bash
   POST /auth/register
   Content-Type: application/json
   
   {
     "name": "John Doe",
     "email": "john.doe@example.com",
     "password": "MySecurePassword123!",
     "role": "STUDENT"
   }
   ```

2. **Login to get access token:**
   ```bash
   POST /auth/login
   Content-Type: application/json
   
   {
     "email": "john.doe@example.com",
     "password": "MySecurePassword123!"
   }
   ```

3. **Use the token for protected endpoints:**
   ```bash
   GET /profile/me
   Authorization: Bearer <your-jwt-token>
   ```

#### JWT Token Usage

- **Header Format:** `Authorization: Bearer <your-jwt-token>`
- **Token Expiration:** 7 days (configurable)
- **Token Refresh:** Use `/auth/login` to get a new token
- **Storage:** Store securely (HttpOnly cookies recommended for web)

## 🏗️ API Architecture

### 📋 Endpoint Categories

| Category | Base URL | Description | Authentication |
|----------|----------|-------------|----------------|
| **Authentication** | `/auth/*` | User registration, login, profile | Public/Protected |
| **Users** | `/profile/*`, `/users/*` | User management and settings | Protected |
| **Projects** | `/projects/*` | Project showcase and feedback | Mixed |
| **Events** | `/events/*` | Event management and registration | Mixed |
| **Jobs** | `/jobs/*` | Job portal and applications | Mixed |
| **Admin** | `/admin/*` | Administrative functions | Admin Only |
| **Activities** | `/activities/*` | User activity tracking | Protected |

### 🎭 User Roles & Permissions

#### 👨‍🎓 STUDENT
- Create and showcase projects
- Apply for jobs and internships
- Register for events
- Receive feedback on projects
- Access learning resources

#### 👨‍💼 PROFESSIONAL
- Share advanced projects and case studies
- Provide feedback to students
- Access exclusive networking events
- Advanced job opportunities

#### 🏢 COMPANY
- Post job openings and internships
- Access talent pool and applications
- Organize recruitment events
- View comprehensive analytics

#### 🛠️ ADMIN
- Manage all platform content
- User management and moderation
- Access comprehensive analytics
- System configuration and monitoring

### 📊 Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "data": {
    // Response data here
  },
  "message": "Operation completed successfully",
  "pagination": {
    // For paginated responses
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

### ❌ Error Handling

Error responses include detailed information:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    "email must be a valid email",
    "password must be at least 6 characters"
  ]
}
```

## 🔧 Development Guide

### 📁 Project Structure

```
backend/src/
├── auth/                    # Authentication module
│   ├── dto/                # Data transfer objects
│   ├── guards/             # Auth guards
│   └── strategies/         # JWT strategies
├── modules/                # Feature modules
│   ├── projects/           # Project management
│   ├── events/             # Event management
│   ├── jobs/               # Job portal
│   ├── admin/              # Admin functions
│   └── activities/         # Activity tracking
├── users/                  # User management
├── prisma/                 # Database service
└── main.ts                 # Application entry point
```

### 🛠️ Adding New Endpoints

1. **Create a new controller:**
   ```typescript
   import { Controller, Get } from '@nestjs/common';
   import { ApiTags, ApiOperation } from '@nestjs/swagger';

   @ApiTags('YourModule')
   @Controller('your-module')
   export class YourController {
     @Get()
     @ApiOperation({ summary: 'Get all items' })
     async findAll() {
       return { message: 'Hello World' };
     }
   }
   ```

2. **Add Swagger documentation:**
   ```typescript
   @ApiOperation({
     summary: 'Brief description',
     description: 'Detailed description with usage examples'
   })
   @ApiOkResponse({ description: 'Success response description' })
   @ApiBadRequestResponse({ description: 'Error response description' })
   ```

3. **Create DTOs with validation:**
   ```typescript
   import { ApiProperty } from '@nestjs/swagger';
   import { IsString, IsEmail } from 'class-validator';

   export class CreateUserDto {
     @ApiProperty({ description: 'User email', example: 'user@example.com' })
     @IsEmail()
     email: string;

     @ApiProperty({ description: 'User name', example: 'John Doe' })
     @IsString()
     name: string;
   }
   ```

### 🧪 Testing

```bash
# Unit tests
npm run test

# End-to-end tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### 📊 API Analytics

The API includes comprehensive analytics endpoints for administrators:

- **User Analytics** - Registration trends, role distribution, engagement
- **Content Analytics** - Project, event, job creation and interaction metrics
- **Engagement Analytics** - User interaction patterns and platform usage
- **System Health** - Performance metrics, error rates, uptime monitoring

## 🚀 Deployment

### 🐳 Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "run", "start:prod"]
```

### 🔧 Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string | - | ✅ |
| `JWT_SECRET` | JWT signing secret | - | ✅ |
| `JWT_EXPIRATION` | Token expiration time | `7d` | ❌ |
| `PORT` | Server port | `3001` | ❌ |
| `NODE_ENV` | Environment mode | `development` | ❌ |
| `FRONTEND_URL` | Frontend URL for CORS | - | ❌ |

### 📈 Performance Optimization

- **Database Connection Pooling** - Optimized connection management
- **Response Caching** - Strategic caching for analytics endpoints
- **Query Optimization** - Efficient database queries with proper indexing
- **Compression** - Gzip compression for API responses
- **Rate Limiting** - Prevents API abuse and ensures fair usage

## 🔐 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Input Validation** - Comprehensive validation using class-validator
- **SQL Injection Protection** - Prisma ORM provides built-in protection
- **CORS Configuration** - Properly configured cross-origin resource sharing
- **Helmet Security** - Security headers for enhanced protection
- **Rate Limiting** - Prevents brute force attacks and API abuse

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### 🧹 Code Style

- **TypeScript** - Strict type checking enabled
- **ESLint** - Code linting with recommended rules
- **Prettier** - Code formatting
- **Husky** - Pre-commit hooks for code quality

## 🤝 Support

- **Documentation** - [Swagger UI](http://localhost:3001/api/docs)
- **Issues** - [GitHub Issues](https://github.com/your-org/it-community-platform/issues)
- **Discussions** - [GitHub Discussions](https://github.com/your-org/it-community-platform/discussions)
- **Email** - support@itcommunity.com

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**🚀 Built with love by the IT Community Team**
