import { IsString, IsNotEmpty, IsDateString, IsEnum, IsOptional, IsInt, IsUrl, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { EventType } from '../../../../generated/prisma';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDateString()
  date: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsEnum(EventType)
  type: EventType;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  maxAttendees?: number;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;
} 