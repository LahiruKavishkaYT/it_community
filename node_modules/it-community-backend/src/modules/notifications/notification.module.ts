import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { NotificationsController } from './notifications.controller';
import { NotificationGateway } from './notification.gateway';

@Module({
  imports: [PrismaModule],
  providers: [NotificationService, NotificationGateway],
  exports: [NotificationService, NotificationGateway],
  controllers: [NotificationsController],
})
export class NotificationModule {} 