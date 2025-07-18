import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus, OnModuleDestroy } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import Redis, { Redis as RedisClient } from 'ioredis';

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string; // Custom error message
}

interface Store {
  increment(key: string, windowMs: number): Promise<{ count: number; resetTime: number }>;
  cleanup?(): void;
}

// In-memory store – kept for local development & fallback
class MemoryStore implements Store {
  private store = new Map<string, { count: number; resetTime: number }>();

  async increment(key: string, windowMs: number): Promise<{ count: number; resetTime: number }> {
    const now = Date.now();
    const resetTime = now + windowMs;
    
    const existing = this.store.get(key);
    
    if (!existing || now > existing.resetTime) {
      // New window or expired window
      const newEntry = { count: 1, resetTime };
      this.store.set(key, newEntry);
      return newEntry;
    }
    
    // Increment existing count
    existing.count++;
    this.store.set(key, existing);
    return existing;
  }

  // Cleanup expired entries periodically
  cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.store.entries()) {
      if (now > value.resetTime) {
        this.store.delete(key);
      }
    }
  }
}

// Redis-backed store – shared across all pods/instances
class RedisStore implements Store {
  constructor(private redis: RedisClient) {}

  async increment(key: string, windowMs: number): Promise<{ count: number; resetTime: number }> {
    const now = Date.now();
    const resetTime = now + windowMs;

    const ttlSeconds = Math.ceil(windowMs / 1000);

    // Use atomic INCR command – Redis guarantees atomicity.
    const count = await this.redis.incr(key);

    // First request in the window – set the key to expire
    if (Number(count) === 1) {
      await this.redis.expire(key, ttlSeconds);
    }

    return { count: Number(count), resetTime };
  }

  // No cleanup needed – Redis handles expiry
}

// Metadata key for rate limit decorator
export const RATE_LIMIT_KEY = 'rate_limit';

// Rate limit decorator
export const RateLimit = (options: RateLimitOptions) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Reflector.createDecorator<RateLimitOptions>()(options)(target, propertyKey, descriptor);
  };
};

@Injectable()
export class RateLimitGuard implements CanActivate, OnModuleDestroy {
  private store: Store;
  private cleanupInterval?: NodeJS.Timeout;
  private redis?: RedisClient;

  constructor(private reflector: Reflector) {
    const redisUrl = process.env.REDIS_URL || undefined;

    if (redisUrl) {
      this.redis = new Redis(redisUrl, { lazyConnect: true });
      // Attempt to connect early but don’t block app start.
      this.redis.connect().catch((err: unknown) => {
        console.error('Failed to connect to Redis for rate limiting – falling back to memory store.', err);
      });
      this.store = new RedisStore(this.redis);
    } else {
      console.warn('[RateLimitGuard] REDIS_URL not set – using in-memory store. Not suitable for production scale.');
      const memStore = new MemoryStore();
      this.cleanupInterval = setInterval(() => memStore.cleanup(), 5 * 60 * 1000);
      this.store = memStore;
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const options = this.reflector.getAllAndOverride<RateLimitOptions>(RATE_LIMIT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!options) {
      return true; // No rate limiting configured
    }

    const request = context.switchToHttp().getRequest<Request>();
    const key = this.generateKey(request);
    
    const { count, resetTime } = await this.store.increment(key, options.windowMs);
    
    // Add rate limit headers
    const response = context.switchToHttp().getResponse();
    response.setHeader('X-RateLimit-Limit', options.maxRequests);
    response.setHeader('X-RateLimit-Remaining', Math.max(0, options.maxRequests - count));
    response.setHeader('X-RateLimit-Reset', new Date(resetTime).toISOString());

    if (count > options.maxRequests) {
      // Log rate limit violation for security monitoring
      console.warn('Rate limit exceeded:', {
        ip: this.getClientIP(request),
        endpoint: request.path,
        userAgent: request.get('User-Agent'),
        count,
        limit: options.maxRequests,
        timestamp: new Date().toISOString()
      });

      throw new HttpException(
        options.message || `Too many requests. Try again after ${Math.ceil(options.windowMs / 1000)} seconds.`,
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    return true;
  }

  onModuleDestroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    if (this.redis) {
      this.redis.quit().catch(() => {});
    }
  }

  private generateKey(request: Request): string {
    // Use IP address as key (could be enhanced with user ID for authenticated requests)
    const ip = this.getClientIP(request);
    const endpoint = request.path;
    return `${ip}:${endpoint}`;
  }

  private getClientIP(request: Request): string {
    // Handle various proxy scenarios
    const xForwardedFor = request.get('X-Forwarded-For');
    const xRealIP = request.get('X-Real-IP');
    const remoteAddress = request.socket.remoteAddress;
    
    if (xForwardedFor) {
      return xForwardedFor.split(',')[0].trim();
    }
    
    if (xRealIP) {
      return xRealIP;
    }
    
    return remoteAddress || 'unknown';
  }
}

// Predefined rate limit configurations
export const RateLimitConfigs = {
  // Authentication endpoints - strict limits
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
    message: 'Too many authentication attempts. Please try again after 15 minutes.'
  },
  
  // API endpoints - moderate limits
  API: {
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute
    message: 'Too many API requests. Please slow down.'
  },
  
  // File upload endpoints - conservative limits
  UPLOAD: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 10, // 10 uploads per 5 minutes
    message: 'Too many upload attempts. Please wait before uploading again.'
  }
}; 