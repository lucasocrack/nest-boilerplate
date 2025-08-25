import { applyDecorators } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

/**
 * Decorator para aplicar rate limiting específico em rotas de autenticação
 * Limita tentativas de login/registro para prevenir ataques de força bruta
 */
export const AuthThrottle = () =>
  applyDecorators(
    // 5 tentativas por minuto para rotas de autenticação
    Throttle({ default: { ttl: 60000, limit: 5 } }),
  );
