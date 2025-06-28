import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'User email address for authentication',
    example: 'john.doe@example.com',
    format: 'email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User password for authentication',
    example: 'MySecurePassword123!',
    minLength: 6,
    writeOnly: true,
    format: 'password',
  })
  @IsString()
  @MinLength(6)
  password: string;
} 