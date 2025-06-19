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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
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
  async getUserProfile(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.usersService.findOne(id);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      user,
    };
  }
} 