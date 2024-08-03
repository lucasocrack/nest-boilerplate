import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const EXCLUDE_ROLES_KEY = 'excludeRoles';
export const ExcludeRoles = (...roles: Role[]) =>
  SetMetadata(EXCLUDE_ROLES_KEY, roles);
