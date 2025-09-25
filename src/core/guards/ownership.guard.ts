import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OWNERSHIP_KEY } from '../decorators/ownership.decorator';
import { Role } from '@prisma/client';

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requireOwnership = this.reflector.getAllAndOverride<boolean>(
      OWNERSHIP_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Se não há requisito de ownership, permite acesso
    if (requireOwnership === undefined || requireOwnership === false) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const resourceId = request.params.id;

    if (!user) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    // Hierarquia de acesso: SUPERADMIN, ADMIN, GERENTE têm acesso total
    const hasFullAccess = [Role.SUPERADMIN, Role.ADMIN, Role.GERENTE].includes(
      user.role,
    );

    if (hasFullAccess) {
      return true;
    }

    // FUNCIONARIO: acesso restritivo (definir regras específicas)
    if (user.role === Role.FUNCIONARIO) {
      // Por enquanto, FUNCIONARIO pode acessar qualquer recurso
      // Aqui você pode implementar regras específicas para FUNCIONARIO
      return true;
    }

    // CLIENTE: só pode acessar próprios dados
    if (user.role === Role.CLIENTE) {
      if (!resourceId) {
        throw new ForbiddenException('ID do recurso é obrigatório');
      }

      if (user.userId !== resourceId) {
        throw new ForbiddenException(
          'Acesso negado: você só pode acessar seus próprios dados',
        );
      }
    }

    return true;
  }
}
