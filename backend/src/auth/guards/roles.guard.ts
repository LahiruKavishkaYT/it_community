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
    
    // Debug: Log role checking details
    console.log('Roles Guard Debug:', {
      requiredRoles,
      userRole: user?.role,
      userRoleType: typeof user?.role,
      userExists: !!user,
      roleMatch: requiredRoles.some((role) => user.role === role),
      exactComparisons: requiredRoles.map(role => ({
        required: role,
        actual: user?.role,
        match: role === user?.role,
        strictMatch: role === user?.role && typeof role === typeof user?.role
      }))
    });
    
    return requiredRoles.some((role) => user.role === role);
  }
} 