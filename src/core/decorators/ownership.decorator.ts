import { SetMetadata } from '@nestjs/common';

export const OWNERSHIP_KEY = 'ownership';

/**
 * Decorator para validar ownership de recursos
 * Define se o usuário pode acessar apenas seus próprios dados ou todos
 */
export const RequireOwnership = (requireOwnership: boolean = true) =>
  SetMetadata(OWNERSHIP_KEY, requireOwnership);
