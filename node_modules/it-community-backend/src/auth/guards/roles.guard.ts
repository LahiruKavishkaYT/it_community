import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../../generated/prisma';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    
    // Secure logging - only log authorization failures for security monitoring
    const hasAccess = requiredRoles.some((role) => user.role === role);
    
    if (!hasAccess && process.env.NODE_ENV !== 'test') {
      console.warn('Authorization denied:', {
        timestamp: new Date().toISOString(),
        userId: user?.id?.substring(0, 8) + '...' || 'unknown',
        requiredRoles: requiredRoles.length,
        hasUser: !!user
      });
    }
    
    return hasAccess;
  }
} 