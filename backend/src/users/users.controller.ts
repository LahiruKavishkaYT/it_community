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
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../../generated/prisma';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile/me')
  @UseGuards(JwtAuthGuard)
  async getMyProfile(@Request() req: { user: Omit<User, 'password'> }) {
    return {
      user: req.user,
    };
  }

  @Patch('profile/me')
  @UseGuards(JwtAuthGuard)
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
  async getUserStats(@Request() req: { user: Omit<User, 'password'> }) {
    const stats = await this.usersService.getUserStats(req.user.id);
    return stats;
  }

  @Get('profile/activity')
  @UseGuards(JwtAuthGuard)
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
  async getProfileCompletion(@Request() req: { user: Omit<User, 'password'> }) {
    const completion = await this.usersService.getProfileCompletion(req.user.id);
    return completion;
  }

  @Post('profile/change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Request() req: { user: Omit<User, 'password'> },
    @Body(ValidationPipe) changePasswordDto: ChangePasswordDto
  ) {
    return this.usersService.changePassword(req.user.id, changePasswordDto);
  }

  @Patch('profile/settings')
  @UseGuards(JwtAuthGuard)
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