import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class RefreshTokenService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  /**
   * Generate a secure refresh token
   */
  generateRefreshToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Store refresh token in database
   */
  async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    // Remove existing refresh tokens for this user (single session)
    await this.prisma.refreshToken.deleteMany({
      where: { userId }
    });

    // Store new refresh token
    await this.prisma.refreshToken.create({
      data: {
        userId,
        token: hashedToken,
        expiresAt,
      },
    });
  }

  /**
   * Validate and verify refresh token
   */
  async validateRefreshToken(userId: string, refreshToken: string): Promise<boolean> {
    const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
    
    const tokenRecord = await this.prisma.refreshToken.findFirst({
      where: {
        userId,
        token: hashedToken,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    return !!tokenRecord;
  }

  /**
   * Generate new access token
   */
  generateAccessToken(payload: { sub: string; email: string }): string {
    return this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_EXPIRATION') || '24h',
    });
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; newRefreshToken: string } | null> {
    try {
      // Note: We would need to implement a way to map refresh tokens to users
      // For now, this is a basic implementation
      const tokenRecord = await this.prisma.refreshToken.findFirst({
        where: {
          token: crypto.createHash('sha256').update(refreshToken).digest('hex'),
          expiresAt: {
            gt: new Date(),
          },
        },
        include: {
          user: true,
        },
      });

      if (!tokenRecord) {
        return null;
      }

      // Generate new tokens
      const payload = { sub: tokenRecord.userId, email: tokenRecord.user.email };
      const accessToken = this.generateAccessToken(payload);
      const newRefreshToken = this.generateRefreshToken();

      // Store new refresh token
      await this.storeRefreshToken(tokenRecord.userId, newRefreshToken);

      return { accessToken, newRefreshToken };
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  }

  /**
   * Revoke refresh token (logout)
   */
  async revokeRefreshToken(userId: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { userId }
    });
  }

  /**
   * Cleanup expired tokens
   */
  async cleanupExpiredTokens(): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }
} 