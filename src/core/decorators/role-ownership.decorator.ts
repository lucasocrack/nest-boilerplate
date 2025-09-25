import { applyDecorators } from '@nestjs/common';
import { Roles } from './roles.decorator';
import { RequireOwnership } from './ownership.decorator';
import { Role } from '@prisma/client';

/**
 * Decorator combinado para aplicar roles e ownership em uma única linha
 * Simplifica o uso comum de validação de acesso hierárquico
 */
export const RoleOwnership = (
  roles: Role[],
  requireOwnership: boolean = true,
) => applyDecorators(Roles(...roles), RequireOwnership(requireOwnership));

/**
 * Shortcuts para casos comuns de uso
 */
export const AdminOnly = () => RoleOwnership([Role.ADMIN], false);
export const ManagerAndAbove = () =>
  RoleOwnership([Role.GERENTE, Role.ADMIN], false);
export const AllRolesWithOwnership = () =>
  RoleOwnership(
    [Role.CLIENTE, Role.FUNCIONARIO, Role.GERENTE, Role.ADMIN],
    true,
  );
export const AllRoles = () =>
  RoleOwnership(
    [Role.CLIENTE, Role.FUNCIONARIO, Role.GERENTE, Role.ADMIN],
    false,
  );
