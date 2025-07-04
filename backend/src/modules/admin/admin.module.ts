import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { DashboardGateway } from './dashboard.gateway';

@Module({
  controllers: [AdminController],
  providers: [AdminService, DashboardGateway],
  exports: [AdminService, DashboardGateway],
})
export class AdminModule {} 