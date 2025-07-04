import { IsString, IsNotEmpty, IsDateString, IsEnum, IsOptional, IsInt, IsUrl, IsBoolean, Min, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { EventType } from '../../../../generated/prisma';

class FoodAndDrinksDto {
  @IsBoolean()
  foodProvided: boolean;

  @IsBoolean()
  drinksProvided: boolean;

  @IsOptional()
  @IsString()
  foodDetails?: string;

  @IsOptional()
  @IsString()
  drinkDetails?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dietaryRestrictions?: string[];

  @IsOptional()
  @IsBoolean()
  alcoholicBeverages?: boolean;
}

class RegistrationSettingsDto {
  @IsOptional()
  @IsBoolean()
  requireApproval?: boolean;

  @IsOptional()
  @IsDateString()
  registrationDeadline?: string;

  @IsOptional()
  @IsString()
  registrationInstructions?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredFields?: string[];
}

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

  // Enhanced food and drinks coordination
  @IsOptional()
  @ValidateNested()
  @Type(() => FoodAndDrinksDto)
  foodAndDrinks?: FoodAndDrinksDto;

  // Legacy fields for backward compatibility
  @IsOptional()
  @IsBoolean()
  foodProvided?: boolean;

  @IsOptional()
  @IsBoolean()
  drinksProvided?: boolean;

  // Enhanced registration settings
  @IsOptional()
  @ValidateNested()
  @Type(() => RegistrationSettingsDto)
  registrationSettings?: RegistrationSettingsDto;

  // Additional event details
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  prerequisites?: string[];

  @IsOptional()
  @IsString()
  agenda?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  speakers?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  eventFee?: number;

  @IsOptional()
  @IsString()
  eventUrl?: string;

  @IsOptional()
  @IsBoolean()
  isVirtual?: boolean;

  @IsOptional()
  @IsString()
  virtualMeetingLink?: string;
} 