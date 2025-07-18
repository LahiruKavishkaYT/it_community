import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { ActivitiesModule } from '../activities/activities.module';
import { NotificationModule } from '../notifications/notification.module';

@Module({
  imports: [ActivitiesModule, NotificationModule],
  controllers: [EventsController],
  providers: [EventsService, PrismaService],
  exports: [EventsService],
})
export class EventsModule {} 