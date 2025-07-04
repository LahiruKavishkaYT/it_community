import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { ActivitiesModule } from '../activities/activities.module';
import { UploadModule } from '../../common/upload/upload.module';
import { UploadService } from '../../common/upload/upload.service';

@Module({
  imports: [
    ActivitiesModule,
    UploadModule,
    MulterModule.registerAsync({
      imports: [UploadModule],
      useFactory: async (uploadService: UploadService) => uploadService.getResumeUploadConfig(),
      inject: [UploadService],
    }),
  ],
  controllers: [JobsController],
  providers: [JobsService, PrismaService],
  exports: [JobsService],
})
export class JobsModule {} 