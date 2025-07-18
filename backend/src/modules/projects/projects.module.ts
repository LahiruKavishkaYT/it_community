import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { ActivitiesModule } from '../activities/activities.module';
import { AdminModule } from '../admin/admin.module';
import { NotificationModule } from '../notifications/notification.module';

@Module({
  imports: [ActivitiesModule, AdminModule, NotificationModule],
  controllers: [ProjectsController],
  providers: [ProjectsService, PrismaService],
  exports: [ProjectsService],
})
export class ProjectsModule {} 