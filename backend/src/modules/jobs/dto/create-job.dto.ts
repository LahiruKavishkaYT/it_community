import { IsString, IsNotEmpty, IsArray, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { JobType } from '../../../../generated/prisma';

export class CreateJobDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsArray()
  @IsString({ each: true })
  requirements: string[];

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsEnum(JobType)
  type: JobType;

  @IsOptional()
  @IsString()
  salary?: string;

  @IsOptional()
  @IsBoolean()
  remote?: boolean;
} 