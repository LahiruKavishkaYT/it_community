import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  UseGuards, 
  Request,
  HttpCode,
  HttpStatus,
  SetMetadata,
  UnauthorizedException,
  Response,
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
import { NotificationService } from '../modules/notifications/notification.service';
import { CreateUserDto, CreateCompanyDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';
import { GitHubOAuthGuard } from './guards/github-oauth.guard';
import { RateLimitGuard, RateLimitConfigs } from '../common/guards/rate-limit.guard';
import { User } from '../../generated/prisma';
import { $Enums } from '../../generated/prisma';
import { Request as ExpressRequest } from 'express';
import { RefreshTokenService } from './services/refresh-token.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly notificationService: NotificationService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

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

  @Post('register/company')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Register a new company',
    description: `
      Create a new company account in the IT Community Platform.
      
      **Password Requirements:**
      - Minimum 8 characters
      - At least one uppercase letter
      - At least one lowercase letter
      - At least one number
      - At least one special character (@$!%*?&)
    `
  })
  @ApiCreatedResponse({ 
    description: 'Company successfully registered',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['COMPANY'] },
            company: { type: 'string' },
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
  @ApiBody({ type: CreateCompanyDto })
  async registerCompany(@Body() createCompanyDto: CreateCompanyDto) {
    return this.authService.registerCompany(createCompanyDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RateLimitGuard)
  @SetMetadata('rate_limit', RateLimitConfigs.AUTH)
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
        refresh_token: { 
          type: 'string', 
          description: 'Refresh token for obtaining new access tokens'
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
  async login(@Body() loginDto: LoginDto, @Request() req: ExpressRequest) {
    const result = await this.authService.login(loginDto);

    // Fire a "new device / location" notification (basic implementation – always send)
    try {
      await this.notificationService.createNotification({
        userId: result.user.id,
        type: $Enums.NotificationType.SYSTEM_MESSAGE,
        title: 'New sign-in detected',
        message: `We noticed a new sign-in from IP ${req.ip || 'unknown'} on ${new Date().toLocaleString()}. If this wasn't you please reset your password.`,
        priority: $Enums.NotificationPriority.LOW,
        metadata: { ip: req.ip, userAgent: req.headers['user-agent'] },
      });
    } catch (err) {
      // Non-blocking – log and continue
      console.error('Failed to create login notification', err);
    }

    return result;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiOkResponse({
    description: 'New access and refresh tokens',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string' },
        refresh_token: { type: 'string' },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired refresh token' })
  async refresh(@Body() dto: RefreshTokenDto) {
    const result = await this.refreshTokenService.refreshAccessToken(dto.refreshToken);
    if (!result) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    return {
      access_token: result.accessToken,
      refresh_token: result.newRefreshToken,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Logout and revoke refresh token' })
  @ApiOkResponse({ description: 'Successfully logged out' })
  async logout(@Request() req: { user: User }) {
    await this.refreshTokenService.revokeRefreshToken(req.user.id);
    return { message: 'Logged out successfully' };
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

  // Google OAuth endpoints
  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  @ApiResponse({ status: 302, description: 'Redirects to Google OAuth consent screen' })
  async googleAuth() {
    // This endpoint initiates Google OAuth flow
  }

  @Get('google/callback')
  @UseGuards(GoogleOAuthGuard)
  @ApiOperation({ summary: 'Google OAuth callback' })
  @ApiResponse({ status: 302, description: 'Redirects to frontend with auth tokens' })
  async googleAuthCallback(@Request() req: any, @Response() res: any) {
    const result = req.user;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    // Redirect to frontend with tokens in query params
    const redirectUrl = `${frontendUrl}/auth/callback?access_token=${result.access_token}&refresh_token=${result.refresh_token}&user=${encodeURIComponent(JSON.stringify(result.user))}`;
    
    return res.redirect(redirectUrl);
  }

  // GitHub OAuth endpoints  
  @Get('github')
  @UseGuards(GitHubOAuthGuard)
  @ApiOperation({ summary: 'Initiate GitHub OAuth login' })
  @ApiResponse({ status: 302, description: 'Redirects to GitHub OAuth consent screen' })
  async githubAuth() {
    // This endpoint initiates GitHub OAuth flow
  }

  @Get('github/callback')
  @UseGuards(GitHubOAuthGuard)
  @ApiOperation({ summary: 'GitHub OAuth callback' })
  @ApiResponse({ status: 302, description: 'Redirects to frontend with auth tokens' })
  async githubAuthCallback(@Request() req: any, @Response() res: any) {
    const result = req.user;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    // Redirect to frontend with tokens in query params
    const redirectUrl = `${frontendUrl}/auth/callback?access_token=${result.access_token}&refresh_token=${result.refresh_token}&user=${encodeURIComponent(JSON.stringify(result.user))}`;
    
    return res.redirect(redirectUrl);
  }
}