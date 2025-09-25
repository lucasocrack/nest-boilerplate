import { Injectable, Logger } from '@nestjs/common';
import { User } from '@prisma/client';

export interface LoginAttemptLog {
  userId?: string;
  email?: string;
  username?: string;
  ip?: string;
  userAgent?: string;
  success: boolean;
  reason?: string;
  timestamp: Date;
  attempts?: number;
}

export interface AccessAttemptLog {
  userId: string;
  resource: string;
  action: string;
  ip?: string;
  userAgent?: string;
  success: boolean;
  reason?: string;
  timestamp: Date;
  requiredRole?: string;
  userRole?: string;
}

export interface SecurityEventLog {
  userId?: string;
  event:
    | 'ACCOUNT_BLOCKED'
    | 'ACCOUNT_UNBLOCKED'
    | 'PASSWORD_RESET'
    | 'SUSPICIOUS_LOGIN'
    | 'TOKEN_REFRESH'
    | 'LOGOUT';
  ip?: string;
  userAgent?: string;
  details?: Record<string, any>;
  timestamp: Date;
}

@Injectable()
export class SecurityLoggerService {
  private readonly logger = new Logger('SecurityLogger');

  /**
   * Registra tentativas de login (sucesso ou falha)
   */
  logLoginAttempt(attempt: LoginAttemptLog): void {
    const logData = {
      event: 'LOGIN_ATTEMPT',
      success: attempt.success,
      userId: attempt.userId,
      email: attempt.email,
      username: attempt.username,
      ip: attempt.ip,
      userAgent: attempt.userAgent,
      reason: attempt.reason,
      attempts: attempt.attempts,
      timestamp: attempt.timestamp.toISOString(),
    };

    if (attempt.success) {
      this.logger.log(`Login bem-sucedido: ${JSON.stringify(logData)}`);
    } else {
      this.logger.warn(`Falha no login: ${JSON.stringify(logData)}`);
    }
  }

  /**
   * Registra tentativas de acesso a recursos protegidos
   */
  logAccessAttempt(attempt: AccessAttemptLog): void {
    const logData = {
      event: 'ACCESS_ATTEMPT',
      success: attempt.success,
      userId: attempt.userId,
      resource: attempt.resource,
      action: attempt.action,
      ip: attempt.ip,
      userAgent: attempt.userAgent,
      reason: attempt.reason,
      requiredRole: attempt.requiredRole,
      userRole: attempt.userRole,
      timestamp: attempt.timestamp.toISOString(),
    };

    if (attempt.success) {
      this.logger.log(`Acesso autorizado: ${JSON.stringify(logData)}`);
    } else {
      this.logger.warn(`Acesso negado: ${JSON.stringify(logData)}`);
    }
  }

  /**
   * Registra eventos de segurança importantes
   */
  logSecurityEvent(event: SecurityEventLog): void {
    const logData = {
      event: event.event,
      userId: event.userId,
      ip: event.ip,
      userAgent: event.userAgent,
      details: event.details,
      timestamp: event.timestamp.toISOString(),
    };

    this.logger.warn(`Evento de segurança: ${JSON.stringify(logData)}`);
  }

  /**
   * Registra bloqueio de conta por múltiplas tentativas
   */
  logAccountBlocked(
    user: User,
    attempts: number,
    ip?: string,
    userAgent?: string,
  ): void {
    this.logSecurityEvent({
      userId: user.userId,
      event: 'ACCOUNT_BLOCKED',
      ip,
      userAgent,
      details: {
        email: user.email,
        username: user.userName,
        attempts,
        reason: 'Múltiplas tentativas de login falhadas',
      },
      timestamp: new Date(),
    });
  }

  /**
   * Registra desbloqueio de conta
   */
  logAccountUnblocked(user: User, ip?: string, userAgent?: string): void {
    this.logSecurityEvent({
      userId: user.userId,
      event: 'ACCOUNT_UNBLOCKED',
      ip,
      userAgent,
      details: {
        email: user.email,
        username: user.userName,
        reason: 'Desbloqueio automático por expiração ou manual',
      },
      timestamp: new Date(),
    });
  }

  /**
   * Registra login suspeito
   */
  logSuspiciousLogin(
    user: User,
    ip?: string,
    userAgent?: string,
    details?: Record<string, any>,
  ): void {
    this.logSecurityEvent({
      userId: user.userId,
      event: 'SUSPICIOUS_LOGIN',
      ip,
      userAgent,
      details: {
        email: user.email,
        username: user.userName || undefined,
        ...details,
      },
      timestamp: new Date(),
    });
  }

  /**
   * Registra reset de senha
   */
  logPasswordReset(user: User, ip?: string, userAgent?: string): void {
    this.logSecurityEvent({
      userId: user.userId,
      event: 'PASSWORD_RESET',
      ip,
      userAgent,
      details: {
        email: user.email,
        username: user.userName,
      },
      timestamp: new Date(),
    });
  }

  /**
   * Registra refresh de token
   */
  logTokenRefresh(userId: string, ip?: string, userAgent?: string): void {
    this.logSecurityEvent({
      userId,
      event: 'TOKEN_REFRESH',
      ip,
      userAgent,
      details: {
        reason: 'Token de acesso renovado',
      },
      timestamp: new Date(),
    });
  }

  /**
   * Registra logout
   */
  logLogout(userId: string, ip?: string, userAgent?: string): void {
    this.logSecurityEvent({
      userId,
      event: 'LOGOUT',
      ip,
      userAgent,
      details: {
        reason: 'Logout realizado pelo usuário',
      },
      timestamp: new Date(),
    });
  }
}
