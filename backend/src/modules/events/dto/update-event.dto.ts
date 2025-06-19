import { IsString, IsNotEmpty, IsDateString, IsEnum, IsOptional, IsInt, IsUrl, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { EventType } from '../../../../generated/prisma';

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  location?: string;

  @IsOptional()
  @IsEnum(EventType)
  type?: EventType;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  maxAttendees?: number;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;
} 