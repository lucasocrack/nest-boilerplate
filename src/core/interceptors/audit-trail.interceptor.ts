import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { AuditTrailService } from '../audit/audit-trail.service';
import { Request } from 'express';
import { AuthRequest } from '../../application/auth/models/AuthRequest';

/**
 * Metadados para configurar auditoria em métodos
 */
export interface AuditMetadata {
  entityType: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  entityIdParam?: string; // Nome do parâmetro que contém o ID da entidade
  skipAudit?: boolean;
}

/**
 * Decorator para marcar métodos que devem ser auditados
 */
export const Auditable = (metadata: AuditMetadata) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata('audit-metadata', metadata, descriptor.value);
    return descriptor;
  };
};

/**
 * Interceptor que captura automaticamente mudanças em entidades
 * e registra no audit trail
 */
@Injectable()
export class AuditTrailInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditTrailInterceptor.name);

  constructor(
    private readonly auditTrailService: AuditTrailService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const handler = context.getHandler();
    const auditMetadata = this.reflector.get<AuditMetadata>(
      'audit-metadata',
      handler,
    );

    // Se não há metadados de auditoria, prossegue sem auditoria
    if (!auditMetadata || auditMetadata.skipAudit) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request | AuthRequest>();
    const userId = this.extractUserId(request);
    const ip = request.ip || 'unknown';
    const userAgent = request.headers['user-agent'] || 'unknown';

    return next.handle().pipe(
      tap((result) => {
        this.processAuditLog(
          auditMetadata,
          request,
          result,
          userId,
          ip,
          userAgent,
        ).catch((error) => {
          this.logger.error('Erro ao processar audit log:', error);
          // Não propaga o erro para não afetar a operação principal
        });
      }),
    );
  }

  /**
   * Processa o log de auditoria baseado nos metadados
   */
  private async processAuditLog(
    metadata: AuditMetadata,
    request: Request | AuthRequest,
    result: any,
    userId?: string,
    ip?: string,
    userAgent?: string,
  ): Promise<void> {
    const entityId = this.extractEntityId(metadata, request, result);

    if (!entityId) {
      this.logger.warn(
        `Não foi possível extrair entityId para auditoria de ${metadata.entityType}`,
      );
      return;
    }

    const auditMetadata = {
      endpoint: `${request.method} ${request.url}`,
      params: request.params,
      query: request.query,
    };

    switch (metadata.action) {
      case 'CREATE':
        await this.auditTrailService.logCreate(
          metadata.entityType,
          entityId,
          this.sanitizeData(result),
          userId,
          ip,
          userAgent,
          auditMetadata,
        );
        break;

      case 'UPDATE':
        // Para UPDATE, precisaríamos dos valores antigos
        // Isso pode ser implementado usando um decorator adicional
        // ou capturando os dados antes da operação
        await this.auditTrailService.logUpdate(
          metadata.entityType,
          entityId,
          {}, // oldValues - seria necessário implementar captura prévia
          this.sanitizeData(result),
          userId,
          ip,
          userAgent,
          auditMetadata,
        );
        break;

      case 'DELETE':
        await this.auditTrailService.logDelete(
          metadata.entityType,
          entityId,
          this.sanitizeData(request.body || {}),
          userId,
          ip,
          userAgent,
          auditMetadata,
        );
        break;
    }
  }

  /**
   * Extrai o ID do usuário da requisição
   */
  private extractUserId(request: Request | AuthRequest): string | undefined {
    if ('user' in request && request.user) {
      // O tipo User do Prisma tem userId como string
      return (request.user as any).userId;
    }
    return undefined;
  }

  /**
   * Extrai o ID da entidade baseado nos metadados
   */
  private extractEntityId(
    metadata: AuditMetadata,
    request: Request | AuthRequest,
    result: any,
  ): string | undefined {
    // Tenta extrair do parâmetro especificado
    if (metadata.entityIdParam && request.params[metadata.entityIdParam]) {
      return request.params[metadata.entityIdParam];
    }

    // Tenta extrair do resultado (para operações CREATE)
    if (result && typeof result === 'object') {
      // Tenta diferentes nomes de campos de ID
      const idFields = ['id', 'userId', 'logId', 'auditId'];
      for (const field of idFields) {
        if (result[field]) {
          return String(result[field]);
        }
      }
    }

    // Tenta extrair do parâmetro 'id' padrão
    if (request.params.id) {
      return request.params.id;
    }

    return undefined;
  }

  /**
   * Remove dados sensíveis antes de armazenar no audit log
   */
  private sanitizeData(data: any): Record<string, any> {
    if (!data || typeof data !== 'object') {
      return {};
    }

    const sanitized = { ...data };
    const sensitiveFields = [
      'password',
      'refreshToken',
      'passwordResetToken',
      'activationToken',
      'access_token',
      'refresh_token',
    ];

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }
}

/**
 * Decorator para aplicar auditoria em controllers
 */
export const AuditController = (entityType: string) => {
  return (target: any) => {
    Reflect.defineMetadata('audit-entity-type', entityType, target);
  };
};
