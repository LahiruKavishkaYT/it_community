import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

export interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    
    // Critical security check - never use default secrets
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is required for authentication');
    }
    
    if (jwtSecret.length < 32) {
      console.warn('⚠️  JWT_SECRET should be at least 32 characters for security');
    }
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    
    // Secure logging - only log in development with masked data
    if (process.env.NODE_ENV === 'development') {
      console.log('JWT Strategy - User authenticated:', {
        userId: user.id.substring(0, 8) + '...',
        role: user.role
      });
    }
    
    return user;
  }
} 