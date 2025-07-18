import { Controller, Get, Patch, Body, Param, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

interface UserRequest extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getUserNotifications(@Req() req: UserRequest) {
    const userId = req.user.id;
    return this.notificationService.getUserNotifications(userId);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Req() req: UserRequest) {
    const userId = req.user.id;
    return this.notificationService.markAsRead(id, userId);
  }
} 