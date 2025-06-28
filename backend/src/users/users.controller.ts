import { 
  Controller, 
  Get, 
  Patch, 
  Param, 
  Body, 
  UseGuards, 
  Request, 
  NotFoundException,
  ParseUUIDPipe,
  Post,
  Query,
  ValidationPipe,
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
  ApiBody,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../../generated/prisma';

@ApiTags('Users')
@Controller()
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile/me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Get my profile',
    description: `
      Retrieve the authenticated user's complete profile information.
      
      **Returns:**
      - User profile data
      - Role and permissions
      - Account settings
      - Profile completion status
    `
  })
  @ApiOkResponse({ 
    description: 'Profile retrieved successfully',
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
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  async getMyProfile(@Request() req: { user: Omit<User, 'password'> }) {
    return {
      user: req.user,
    };
  }

  @Patch('profile/me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Update my profile',
    description: `
      Update the authenticated user's profile information.
      
      **Updatable Fields:**
      - Name
      - Bio/description
      - Skills array
      - Company information
      - Location
      - Avatar URL
      
      **Note:** Email and role cannot be updated through this endpoint.
    `
  })
  @ApiOkResponse({ 
    description: 'Profile updated successfully',
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
            updatedAt: { type: 'string', format: 'date-time' },
          }
        }
      }
    }
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiBody({ type: UpdateProfileDto })
  async updateMyProfile(
    @Request() req: { user: Omit<User, 'password'> },
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    const updatedUser = await this.usersService.updateProfile(req.user.id, updateProfileDto);
    return {
      user: updatedUser,
    };
  }

  @Get('users/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Get user profile by ID',
    description: `
      Retrieve a specific user's public profile information.
      
      **Privacy Notes:**
      - Only public profile information is returned
      - Sensitive data is excluded
      - Contact information may be limited based on user settings
    `
  })
  @ApiParam({ 
    name: 'id', 
    description: 'User ID (UUID format)', 
    type: 'string',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000'
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
            role: { type: 'string', enum: ['STUDENT', 'PROFESSIONAL', 'COMPANY', 'ADMIN'] },
            avatar: { type: 'string', nullable: true },
            bio: { type: 'string', nullable: true },
            skills: { type: 'array', items: { type: 'string' } },
            company: { type: 'string', nullable: true },
            location: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          }
        }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiBadRequestResponse({ description: 'Invalid user ID format' })
  async getUserProfile(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.usersService.findOne(id);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      user,
    };
  }

  @Get('profile/stats')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Get user statistics',
    description: `
      Retrieve comprehensive statistics for the authenticated user.
      
      **Statistics Include:**
      - Project count and status breakdown
      - Job applications submitted
      - Events attended/organized
      - Feedback received/given
      - Platform engagement metrics
    `
  })
  @ApiOkResponse({ 
    description: 'User statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        projectsOrJobs: { type: 'number', description: 'Total projects (for students/professionals) or jobs posted (for companies)' },
        applicationsOrReceived: { type: 'number', description: 'Applications submitted or received' },
        eventsOrOrganized: { type: 'number', description: 'Events attended or organized' },
        feedbackOrTalent: { type: 'number', description: 'Feedback given/received or talent interactions' },
        additionalStat: { type: 'number', description: 'Role-specific additional metric' },
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  async getUserStats(@Request() req: { user: Omit<User, 'password'> }) {
    const stats = await this.usersService.getUserStats(req.user.id);
    return stats;
  }

  @Get('profile/activity')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Get user activity feed',
    description: `
      Retrieve recent activity for the authenticated user.
      
      **Activity Types:**
      - Project uploads and updates
      - Job applications
      - Event registrations
      - Feedback given/received
      - Profile updates
    `
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    type: Number, 
    description: 'Maximum number of activities to return (default: 10, max: 50)',
    example: 20
  })
  @ApiOkResponse({ 
    description: 'User activities retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        activities: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              type: { type: 'string', enum: ['PROJECT_UPLOAD', 'JOB_APPLICATION', 'EVENT_REGISTRATION', 'PROJECT_FEEDBACK'] },
              action: { type: 'string', description: 'Human-readable action description' },
              itemTitle: { type: 'string', description: 'Title of the related item' },
              itemId: { type: 'string', nullable: true, description: 'ID of the related item' },
              createdAt: { type: 'string', format: 'date-time' },
            }
          }
        }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiBadRequestResponse({ description: 'Invalid limit parameter' })
  async getUserActivity(
    @Request() req: { user: Omit<User, 'password'> },
    @Query('limit') limit?: string
  ) {
    const activities = await this.usersService.getUserActivity(
      req.user.id, 
      limit ? parseInt(limit) : 10
    );
    return { activities };
  }

  @Get('profile/completion')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Get profile completion status',
    description: `
      Retrieve profile completion percentage and missing fields.
      
      **Completion Factors:**
      - Basic information (name, email)
      - Profile details (bio, avatar)
      - Skills and experience
      - Contact information
      - Role-specific requirements
    `
  })
  @ApiOkResponse({ 
    description: 'Profile completion status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        completionPercentage: { type: 'number', minimum: 0, maximum: 100 },
        totalFields: { type: 'number' },
        completedFields: { type: 'number' },
        missingFields: { type: 'array', items: { type: 'string' } },
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  async getProfileCompletion(@Request() req: { user: Omit<User, 'password'> }) {
    const completion = await this.usersService.getProfileCompletion(req.user.id);
    return completion;
  }

  @Post('profile/change-password')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Change password',
    description: `
      Change the authenticated user's password.
      
      **Security Requirements:**
      - Must provide current password for verification
      - New password must meet security requirements
      - Password change invalidates existing sessions
      
      **Password Requirements:**
      - Minimum 6 characters
      - Different from current password
    `
  })
  @ApiOkResponse({ 
    description: 'Password changed successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Password changed successfully' },
      }
    }
  })
  @ApiBadRequestResponse({ description: 'Invalid input data or incorrect current password' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiBody({ type: ChangePasswordDto })
  async changePassword(
    @Request() req: { user: Omit<User, 'password'> },
    @Body(ValidationPipe) changePasswordDto: ChangePasswordDto
  ) {
    return this.usersService.changePassword(req.user.id, changePasswordDto);
  }

  @Patch('profile/settings')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Update user settings',
    description: `
      Update user preferences and privacy settings.
      
      **Available Settings:**
      - Email notifications (enable/disable)
      - Profile searchability (public/private)
      - Profile visibility (public/limited)
    `
  })
  @ApiOkResponse({ 
    description: 'Settings updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Settings updated successfully' },
        settings: {
          type: 'object',
          properties: {
            emailNotifications: { type: 'boolean' },
            profileSearchable: { type: 'boolean' },
            isProfilePublic: { type: 'boolean' },
          }
        }
      }
    }
  })
  @ApiBadRequestResponse({ description: 'Invalid settings data' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        emailNotifications: { 
          type: 'boolean', 
          description: 'Enable or disable email notifications',
          example: true
        },
        profileSearchable: { 
          type: 'boolean', 
          description: 'Make profile searchable by other users',
          example: true
        },
        isProfilePublic: { 
          type: 'boolean', 
          description: 'Make profile publicly visible',
          example: false
        },
      }
    }
  })
  async updateUserSettings(
    @Request() req: { user: Omit<User, 'password'> },
    @Body() settings: {
      emailNotifications?: boolean;
      profileSearchable?: boolean;
      isProfilePublic?: boolean;
    }
  ) {
    return this.usersService.updateUserSettings(req.user.id, settings);
  }
} 