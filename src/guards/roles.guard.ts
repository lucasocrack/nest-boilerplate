// src/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { EXCLUDE_ROLES_KEY } from '../decorators/exclude-roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const excludedRoles = this.reflector.getAllAndOverride<Role[]>(
      EXCLUDE_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles && !excludedRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (excludedRoles && excludedRoles.includes(user.role)) {
      return false;
    }

    return requiredRoles ? requiredRoles.includes(user.role) : true;
  }
}
