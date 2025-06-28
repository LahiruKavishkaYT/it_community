import { IsEmail, IsString, IsEnum, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../../generated/prisma';

export class CreateUserDto {
  @ApiProperty({
    description: 'User email address (must be unique)',
    example: 'john.doe@example.com',
    format: 'email',
    uniqueItems: true,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User password (minimum 6 characters)',
    example: 'MySecurePassword123!',
    minLength: 6,
    writeOnly: true,
    format: 'password',
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'Full name of the user',
    example: 'John Doe',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiPropertyOptional({
    description: 'User role in the platform',
    enum: UserRole,
    enumName: 'UserRole',
    example: UserRole.STUDENT,
    default: UserRole.STUDENT,
    examples: {
      student: {
        value: 'STUDENT',
        description: 'Student users can showcase projects, apply for jobs, and attend events'
      },
      professional: {
        value: 'PROFESSIONAL', 
        description: 'Professional users can mentor, network, and access exclusive opportunities'
      },
      company: {
        value: 'COMPANY',
        description: 'Company users can post jobs, organize events, and recruit talent'
      }
    }
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
} 