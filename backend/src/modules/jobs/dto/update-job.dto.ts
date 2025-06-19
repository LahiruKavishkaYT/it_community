import { IsString, IsNotEmpty, IsArray, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { JobType } from '../../../../generated/prisma';

export class UpdateJobDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requirements?: string[];

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  location?: string;

  @IsOptional()
  @IsEnum(JobType)
  type?: JobType;

  @IsOptional()
  @IsString()
  salary?: string;

  @IsOptional()
  @IsBoolean()
  remote?: boolean;
} 