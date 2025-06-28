import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  UseGuards, 
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBody, 
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { User } from '../../generated/prisma';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Register a new user',
    description: `
      Create a new user account in the IT Community Platform.
      
      **Supported Roles:**
      - STUDENT: Portfolio showcase, job applications, event participation
      - PROFESSIONAL: Advanced networking, mentoring opportunities
      - COMPANY: Job posting, talent acquisition, event sponsorship
      
      **Password Requirements:**
      - Minimum 8 characters
      - At least one uppercase letter
      - At least one lowercase letter
      - At least one number
      - At least one special character
    `
  })
  @ApiCreatedResponse({ 
    description: 'User successfully registered',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['STUDENT', 'PROFESSIONAL', 'COMPANY', 'ADMIN'] },
            createdAt: { type: 'string', format: 'date-time' },
          }
        },
        access_token: { type: 'string', description: 'JWT access token' },
      }
    }
  })
  @ApiBadRequestResponse({ 
    description: 'Invalid input data or email already exists',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { 
          oneOf: [
            { type: 'string' },
            { type: 'array', items: { type: 'string' } }
          ]
        },
        error: { type: 'string', example: 'Bad Request' }
      }
    }
  })
  @ApiBody({ type: CreateUserDto })
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Authenticate user',
    description: `
      Authenticate a user and receive an access token for API requests.
      
      **Login Flow:**
      1. Provide valid email and password
      2. Receive JWT access token in response
      3. Include token in Authorization header for protected endpoints
      
      **Token Usage:**
      \`Authorization: Bearer <your-jwt-token>\`
      
      **Token Expiration:**
      Access tokens are valid for 7 days by default.
    `
  })
  @ApiOkResponse({ 
    description: 'Login successful',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['STUDENT', 'PROFESSIONAL', 'COMPANY', 'ADMIN'] },
            avatar: { type: 'string', nullable: true },
            bio: { type: 'string', nullable: true },
            skills: { type: 'array', items: { type: 'string' } },
            company: { type: 'string', nullable: true },
            location: { type: 'string', nullable: true },
          }
        },
        access_token: { 
          type: 'string', 
          description: 'JWT access token for API authentication',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        },
      }
    }
  })
  @ApiUnauthorizedResponse({ 
    description: 'Invalid credentials',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Invalid credentials' },
        error: { type: 'string', example: 'Unauthorized' }
      }
    }
  })
  @ApiBadRequestResponse({ 
    description: 'Invalid input data',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'array', items: { type: 'string' } },
        error: { type: 'string', example: 'Bad Request' }
      }
    }
  })
  @ApiBody({ type: LoginDto })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Get current user profile',
    description: `
      Retrieve the authenticated user's profile information.
      
      **Requirements:**
      - Valid JWT token in Authorization header
      
      **Returns:**
      - Complete user profile without sensitive data (password excluded)
      - User role and permissions
      - Profile completion status
    `
  })
  @ApiOkResponse({ 
    description: 'User profile retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['STUDENT', 'PROFESSIONAL', 'COMPANY', 'ADMIN'] },
            avatar: { type: 'string', nullable: true },
            bio: { type: 'string', nullable: true },
            skills: { type: 'array', items: { type: 'string' } },
            company: { type: 'string', nullable: true },
            location: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          }
        }
      }
    }
  })
  @ApiUnauthorizedResponse({ 
    description: 'Missing or invalid JWT token',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' },
      }
    }
  })
  async getProfile(@Request() req: { user: Omit<User, 'password'> }) {
    return {
      user: req.user,
    };
  }
} 