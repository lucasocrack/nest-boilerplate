import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  // Hierarquia de roles: maior número = maior privilégio
  private readonly roleHierarchy = {
    [Role.CLIENTE]: 1,
    [Role.FUNCIONARIO]: 2,
    [Role.GERENTE]: 3,
    [Role.ADMIN]: 4,
    [Role.SUPERADMIN]: 5,
  };

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) return false;

    const userRoleLevel = this.roleHierarchy[user.role];
    const minRequiredLevel = Math.min(
      ...requiredRoles.map((role) => this.roleHierarchy[role]),
    );

    // Usuário tem acesso se seu nível for >= ao mínimo exigido
    return userRoleLevel >= minRequiredLevel;
  }
}
