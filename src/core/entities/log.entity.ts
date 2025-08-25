/**
 * Entidade Log - Representação tipada independente do modelo Prisma
 * Esta entidade define a estrutura de dados do log para a camada de domínio
 */
export class LogEntity {
  logId: number;
  timestamp: Date;
  route: string;
  method: string;
  userId?: string;
  details?: Record<string, any>;

  constructor(data: Partial<LogEntity>) {
    Object.assign(this, data);
  }

  /**
   * Verifica se o log possui detalhes adicionais
   */
  hasDetails(): boolean {
    return !!this.details && Object.keys(this.details).length > 0;
  }

  /**
   * Formata o log para exibição
   */
  format(): string {
    const timestamp = this.timestamp.toISOString();
    const userInfo = this.userId ? ` [User: ${this.userId}]` : '';
    return `[${timestamp}] ${this.method} ${this.route}${userInfo}`;
  }

  /**
   * Verifica se o log é de uma ação crítica
   */
  isCriticalAction(): boolean {
    const criticalRoutes = [
      '/auth/login',
      '/auth/register',
      '/users',
      '/auth/reset-password',
    ];
    const criticalMethods = ['POST', 'DELETE', 'PATCH'];

    return (
      criticalRoutes.some((route) => this.route.includes(route)) ||
      criticalMethods.includes(this.method)
    );
  }
}

/**
 * Tipo para criação de log (sem campos gerados automaticamente)
 */
export type CreateLogData = Omit<LogEntity, 'logId' | 'timestamp'>;

/**
 * Tipo para filtros de busca de logs
 */
export interface LogFilters {
  userId?: string;
  method?: string;
  route?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}
