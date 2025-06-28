# Authentication Module

This module provides JWT-based authentication with role-based access control (RBAC) for the ITCommunity platform.

## Features

- User registration and login
- JWT token-based authentication
- Password hashing with bcrypt
- Role-based access control (Student, Professional, Company, Admin)
- Protected route guards

## Environment Variables

Create a `.env` file with the following variables:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/itcommunity_db?schema=public"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRATION="24h"

# Server Configuration
PORT=3001

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:5173"
```

## API Endpoints

### Public Endpoints

#### POST /auth/register
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "STUDENT" // Optional: STUDENT, PROFESSIONAL, COMPANY, ADMIN
}
```

**Response:**
```json
{
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "STUDENT",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "access_token": "jwt-token"
}
```

#### POST /auth/login
Login with existing credentials.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "STUDENT"
  },
  "access_token": "jwt-token"
}
```

### Protected Endpoints

#### GET /auth/profile
Get current user profile (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "STUDENT"
  }
}
```

## Usage in Controllers

### Protecting Routes

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Get('protected')
@UseGuards(JwtAuthGuard)
async protectedRoute(@Request() req) {
  return { user: req.user };
}
```

### Role-Based Access Control

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../generated/prisma';

@Get('admin-only')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
async adminOnlyRoute(@Request() req) {
  return { message: 'Admin access granted' };
}
```

## Database Setup

1. Set up PostgreSQL database
2. Configure DATABASE_URL in .env file
3. Run Prisma migrations:

```bash
npx prisma db push
npx prisma generate
```

## Testing

Start the development server:

```bash
npm run start:dev
```

The API will be available at `http://localhost:3001` 