import { IsString, IsNotEmpty, IsDateString, IsEnum, IsOptional, IsInt, IsUrl, IsBoolean, Min, IsArray, ValidateNested, IsNumber, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';
import { EventType } from '../../../../generated/prisma';

// Update EventType enum to include RECRUITMENT_DRIVE
export enum ExtendedEventType {
  WORKSHOP = 'WORKSHOP',
  HACKATHON = 'HACKATHON', 
  NETWORKING = 'NETWORKING',
  SEMINAR = 'SEMINAR',
  RECRUITMENT_DRIVE = 'RECRUITMENT_DRIVE'
}

export enum LocationType {
  ONSITE = 'ONSITE',
  VIRTUAL = 'VIRTUAL'
}

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

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsEnum(ExtendedEventType)
  type: ExtendedEventType;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsDateString()
  startDateTime: string;

  @IsDateString()
  endDateTime: string;

  @IsEnum(LocationType)
  locationType: LocationType;

  @ValidateIf(o => o.locationType === LocationType.ONSITE)
  @IsString()
  @IsNotEmpty()
  venue?: string;

  @ValidateIf(o => o.locationType === LocationType.VIRTUAL)
  @IsUrl()
  @IsNotEmpty()
  virtualEventLink?: string;

  @IsDateString()
  registrationDeadline: string;

  @IsOptional()
  @IsBoolean()
  foodAndDrinksProvided?: boolean;

  // Legacy field for backward compatibility
  @IsOptional()
  @IsString()
  location?: string;

  // Legacy field for backward compatibility
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  maxAttendees?: number;

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

  // Registration settings
  @IsOptional()
  @IsBoolean()
  requireApproval?: boolean;

  @IsOptional()
  @IsString()
  registrationInstructions?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredFields?: string[];
} 