import { AuditAction } from '@prisma/client';

/**
 * Entidade AuditLog - Representação tipada para audit trail
 * Esta entidade define a estrutura de dados do audit log para a camada de domínio
 */
export class AuditLogEntity {
  auditId: string;
  entityType: string;
  entityId: string;
  action: AuditAction;
  userId?: string;
  timestamp: Date;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  changedFields: string[];
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, any>;

  constructor(data: Partial<AuditLogEntity>) {
    Object.assign(this, data);
  }

  /**
   * Verifica se a ação é uma operação de dados (CREATE, UPDATE, DELETE)
   */
  isDataOperation(): boolean {
    const dataOperations = [
      AuditAction.CREATE,
      AuditAction.UPDATE,
      AuditAction.DELETE,
    ];
    return dataOperations.includes(this.action as any);
  }

  /**
   * Verifica se a ação é relacionada à segurança
   */
  isSecurityAction(): boolean {
    const securityActions = [
      AuditAction.LOGIN,
      AuditAction.LOGOUT,
      AuditAction.PASSWORD_RESET,
      AuditAction.ACCOUNT_BLOCKED,
      AuditAction.ACCOUNT_UNBLOCKED,
    ];
    return securityActions.includes(this.action as any);
  }

  /**
   * Verifica se há mudanças nos valores
   */
  hasChanges(): boolean {
    return this.changedFields && this.changedFields.length > 0;
  }

  /**
   * Obtém uma descrição legível da ação
   */
  getActionDescription(): string {
    const descriptions = {
      [AuditAction.CREATE]: 'Criação',
      [AuditAction.UPDATE]: 'Atualização',
      [AuditAction.DELETE]: 'Exclusão',
      [AuditAction.LOGIN]: 'Login',
      [AuditAction.LOGOUT]: 'Logout',
      [AuditAction.PASSWORD_RESET]: 'Reset de senha',
      [AuditAction.ACCOUNT_BLOCKED]: 'Conta bloqueada',
      [AuditAction.ACCOUNT_UNBLOCKED]: 'Conta desbloqueada',
    };
    return descriptions[this.action] || 'Ação desconhecida';
  }

  /**
   * Formata o audit log para exibição
   */
  format(): string {
    const timestamp = this.timestamp.toISOString();
    const userInfo = this.userId ? ` [User: ${this.userId}]` : ' [Sistema]';
    const entityInfo = `${this.entityType}:${this.entityId}`;
    return `[${timestamp}] ${this.getActionDescription()} - ${entityInfo}${userInfo}`;
  }
}

/**
 * Tipo para criação de audit log (sem campos gerados automaticamente)
 */
export type CreateAuditLogData = Omit<AuditLogEntity, 'auditId' | 'timestamp'>;

/**
 * Tipo para filtros de busca de audit logs
 */
export interface AuditLogFilters {
  entityType?: string;
  entityId?: string;
  action?: AuditAction;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

/**
 * Interface para comparação de entidades
 */
export interface EntityComparison {
  changedFields: string[];
  oldValues: Record<string, any>;
  newValues: Record<string, any>;
}
