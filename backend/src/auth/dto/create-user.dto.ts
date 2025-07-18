import { IsEmail, IsString, IsEnum, IsOptional, MinLength, Matches } from 'class-validator';
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

export class CreateCompanyDto {
  @ApiProperty({
    description: 'Company name',
    example: 'Tech Solutions Inc.',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @MinLength(2)
  companyName: string;

  @ApiProperty({
    description: 'Company email address (must be unique)',
    example: 'contact@techsolutions.com',
    format: 'email',
    uniqueItems: true,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Strong password (minimum 8 characters, must include uppercase, lowercase, number, and special character)',
    example: 'MySecurePassword123!',
    minLength: 8,
    writeOnly: true,
    format: 'password',
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    {
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    }
  )
  password: string;
} 