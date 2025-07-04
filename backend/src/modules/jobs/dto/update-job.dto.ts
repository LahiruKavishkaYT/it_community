import { IsString, IsNotEmpty, IsArray, IsOptional, IsBoolean, IsEnum, IsInt, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { JobType, JobStatus, ExperienceLevel } from '../../../../generated/prisma';

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
  @IsEnum(JobStatus)
  status?: JobStatus;

  @IsOptional()
  @IsEnum(ExperienceLevel)
  experienceLevel?: ExperienceLevel;

  // Salary and compensation
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  salaryMin?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  salaryMax?: number;

  @IsOptional()
  @IsString()
  salaryCurrency?: string;

  @IsOptional()
  @IsString()
  salaryPeriod?: string;

  @IsOptional()
  @IsBoolean()
  equity?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  benefits?: string[];

  // Work arrangements
  @IsOptional()
  @IsBoolean()
  remote?: boolean;

  @IsOptional()
  @IsBoolean()
  hybrid?: boolean;

  @IsOptional()
  @IsBoolean()
  onSite?: boolean;

  // Skills and matching
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredSkills?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredSkills?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  technologies?: string[];

  // Job details
  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  reportingTo?: string;

  @IsOptional()
  @IsString()
  teamSize?: string;

  @IsOptional()
  @IsString()
  jobFunction?: string;

  // Application process
  @IsOptional()
  @IsDateString()
  applicationDeadline?: string;

  @IsOptional()
  @IsDateString()
  expectedStartDate?: string;

  @IsOptional()
  @IsString()
  interviewProcess?: string;

  // SEO and visibility
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsBoolean()
  urgent?: boolean;

  // Legacy field for backward compatibility
  @IsOptional()
  @IsString()
  salary?: string;
} 