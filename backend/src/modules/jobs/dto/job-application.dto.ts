import { IsString, IsOptional, IsBoolean, IsInt, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApplicationStatus } from '../../../../generated/prisma';

export class CreateJobApplicationDto {
  @IsString()
  jobId: string;

  @IsOptional()
  @IsString()
  coverLetter?: string;

  @IsOptional()
  @IsString()
  resumeUrl?: string;

  @IsOptional()
  @IsString()
  portfolioUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  expectedSalary?: number;

  @IsOptional()
  @IsString()
  availability?: string;

  @IsOptional()
  @IsBoolean()
  relocatable?: boolean;
}

export class UpdateApplicationStatusDto {
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;

  @IsOptional()
  @IsString()
  recruiterNotes?: string;

  @IsOptional()
  @IsString()
  rejectionReason?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  rating?: number;
}

export class BulkUpdateApplicationsDto {
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;

  @IsString({ each: true })
  applicationIds: string[];

  @IsOptional()
  @IsString()
  notes?: string;
} 