import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { DashboardGateway } from './dashboard.gateway';
import { NotificationModule } from '../notifications/notification.module';

@Module({
  imports: [NotificationModule],
  controllers: [AdminController],
  providers: [AdminService, DashboardGateway],
  exports: [AdminService, DashboardGateway],
})
export class AdminModule {} 