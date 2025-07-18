import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { $Enums } from '../../../generated/prisma';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: NotificationGateway,
  ) {}

  async createNotification({
    userId,
    type,
    title,
    message,
    itemId,
    itemType,
    priority = $Enums.NotificationPriority.MEDIUM,
    metadata = null,
  }: {
    userId: string;
    type: $Enums.NotificationType;
    title: string;
    message: string;
    itemId?: string;
    itemType?: string;
    priority?: $Enums.NotificationPriority;
    metadata?: any;
  }) {
    const notif = await this.prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        itemId,
        itemType,
        priority,
        metadata,
      },
    });

    // fire websocket event (best-effort)
    try {
      this.gateway.emitToUser(userId, notif);
    } catch (e) {
      // ignore broadcast errors to keep DB insert reliable
    }

    return notif;
  }

  async getUserNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true, readAt: new Date() },
    });
  }
} 