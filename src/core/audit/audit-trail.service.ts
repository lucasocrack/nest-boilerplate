import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { AuditAction } from '@prisma/client';
import {
  AuditLogEntity,
  CreateAuditLogData,
  AuditLogFilters,
  EntityComparison,
} from '../entities/audit-log.entity';
import { AuditLogMapper } from '../entities/mappers/audit-log.mapper';

/**
 * Serviço responsável pelo audit trail completo do sistema
 * Registra todas as mudanças em entidades críticas para auditoria e compliance
 */
@Injectable()
export class AuditTrailService {
  private readonly logger = new Logger(AuditTrailService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Registra uma ação de auditoria
   */
  async logAction(auditData: CreateAuditLogData): Promise<AuditLogEntity> {
    try {
      const prismaData = AuditLogMapper.toPrisma(auditData);
      const createdAuditLog = await this.prisma.auditLog.create({
        data: prismaData,
      });

      this.logger.log(
        `Audit log criado: ${auditData.action} em ${auditData.entityType}:${auditData.entityId} por usuário ${auditData.userId || 'sistema'}`,
      );

      return AuditLogMapper.toDomain(createdAuditLog);
    } catch (error) {
      this.logger.error('Erro ao criar audit log:', error);
      throw error;
    }
  }

  /**
   * Registra criação de entidade
   */
  async logCreate(
    entityType: string,
    entityId: string,
    newValues: Record<string, any>,
    userId?: string,
    ip?: string,
    userAgent?: string,
    metadata?: Record<string, any>,
  ): Promise<AuditLogEntity> {
    const auditData = AuditLogMapper.createForCreate(
      entityType,
      entityId,
      this.sanitizeValues(newValues),
      { userId, ip, userAgent, metadata },
    );

    return this.logAction(auditData);
  }

  /**
   * Registra atualização de entidade
   */
  async logUpdate(
    entityType: string,
    entityId: string,
    oldValues: Record<string, any>,
    newValues: Record<string, any>,
    userId?: string,
    ip?: string,
    userAgent?: string,
    metadata?: Record<string, any>,
  ): Promise<AuditLogEntity | null> {
    const comparison = this.compareEntities(oldValues, newValues);

    // Só registra se houve mudanças
    if (comparison.changedFields.length === 0) {
      return null;
    }

    const auditData = AuditLogMapper.createForUpdate(
      entityType,
      entityId,
      this.sanitizeValues(comparison.oldValues),
      this.sanitizeValues(comparison.newValues),
      comparison.changedFields,
      { userId, ip, userAgent, metadata },
    );

    return this.logAction(auditData);
  }

  /**
   * Registra exclusão de entidade
   */
  async logDelete(
    entityType: string,
    entityId: string,
    oldValues: Record<string, any>,
    userId?: string,
    ip?: string,
    userAgent?: string,
    metadata?: Record<string, any>,
  ): Promise<AuditLogEntity> {
    const auditData = AuditLogMapper.createForDelete(
      entityType,
      entityId,
      this.sanitizeValues(oldValues),
      { userId, ip, userAgent, metadata },
    );

    return this.logAction(auditData);
  }

  /**
   * Registra ações de segurança (login, logout, etc.)
   */
  async logSecurityAction(
    action: AuditAction,
    entityType: string,
    entityId: string,
    userId?: string,
    ip?: string,
    userAgent?: string,
    metadata?: Record<string, any>,
  ): Promise<AuditLogEntity> {
    const auditData = AuditLogMapper.createForSecurityAction(
      entityType,
      entityId,
      action,
      { userId, ip, userAgent, metadata },
    );

    return this.logAction(auditData);
  }

  /**
   * Busca logs de auditoria com filtros
   */
  async findAuditLogs(filters: AuditLogFilters): Promise<{
    data: AuditLogEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.entityType) where.entityType = filters.entityType;
    if (filters.entityId) where.entityId = filters.entityId;
    if (filters.action) where.action = filters.action;
    if (filters.userId) where.userId = filters.userId;
    if (filters.startDate || filters.endDate) {
      where.timestamp = {};
      if (filters.startDate) where.timestamp.gte = filters.startDate;
      if (filters.endDate) where.timestamp.lte = filters.endDate;
    }

    const [auditLogs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              userId: true,
              userName: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: AuditLogMapper.toDomainArray(auditLogs),
      total,
      page,
      limit,
    };
  }

  /**
   * Busca histórico de uma entidade específica
   */
  async getEntityHistory(
    entityType: string,
    entityId: string,
    limit: number = 100,
  ): Promise<AuditLogEntity[]> {
    const auditLogs = await this.prisma.auditLog.findMany({
      where: {
        entityType,
        entityId,
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            userId: true,
            userName: true,
            email: true,
          },
        },
      },
    });

    return AuditLogMapper.toDomainArray(auditLogs);
  }

  /**
   * Compara duas versões de uma entidade e identifica mudanças
   */
  private compareEntities(
    oldValues: Record<string, any>,
    newValues: Record<string, any>,
  ): EntityComparison {
    const changedFields: string[] = [];
    const oldValuesFiltered: Record<string, any> = {};
    const newValuesFiltered: Record<string, any> = {};

    // Verifica campos que mudaram
    for (const key in newValues) {
      if (oldValues[key] !== newValues[key]) {
        changedFields.push(key);
        oldValuesFiltered[key] = oldValues[key];
        newValuesFiltered[key] = newValues[key];
      }
    }

    // Verifica campos que foram removidos
    for (const key in oldValues) {
      if (!(key in newValues)) {
        changedFields.push(key);
        oldValuesFiltered[key] = oldValues[key];
        newValuesFiltered[key] = null;
      }
    }

    return {
      changedFields,
      oldValues: oldValuesFiltered,
      newValues: newValuesFiltered,
    };
  }

  /**
   * Remove campos sensíveis dos valores antes de armazenar
   */
  private sanitizeValues(values: Record<string, any>): Record<string, any> {
    const sensitiveFields = [
      'password',
      'refreshToken',
      'passwordResetToken',
      'activationToken',
    ];
    const sanitized = { ...values };

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  /**
   * Obtém estatísticas de auditoria
   */
  async getAuditStats(
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    totalActions: number;
    actionsByType: Record<string, number>;
    entitiesByType: Record<string, number>;
    topUsers: Array<{ userId: string; count: number }>;
  }> {
    const where: any = {};
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = startDate;
      if (endDate) where.timestamp.lte = endDate;
    }

    const [totalActions, actionsByType, entitiesByType, topUsers] =
      await Promise.all([
        this.prisma.auditLog.count({ where }),
        this.prisma.auditLog.groupBy({
          by: ['action'],
          where,
          _count: { action: true },
        }),
        this.prisma.auditLog.groupBy({
          by: ['entityType'],
          where,
          _count: { entityType: true },
        }),
        this.prisma.auditLog.groupBy({
          by: ['userId'],
          where: { ...where, userId: { not: null } },
          _count: { userId: true },
          orderBy: { _count: { userId: 'desc' } },
          take: 10,
        }),
      ]);

    return {
      totalActions,
      actionsByType: actionsByType.reduce((acc, item) => {
        acc[item.action] = item._count.action;
        return acc;
      }, {}),
      entitiesByType: entitiesByType.reduce((acc, item) => {
        acc[item.entityType] = item._count.entityType;
        return acc;
      }, {}),
      topUsers: topUsers
        .filter((item) => item.userId !== null)
        .map((item) => ({
          userId: item.userId!,
          count: item._count.userId,
        })),
    };
  }

  async findLogById(auditId: string): Promise<AuditLogEntity | null> {
    try {
      const auditLog = await this.prisma.auditLog.findUnique({
        where: { auditId },
        include: {
          user: {
            select: {
              userId: true,
              email: true,
              userName: true,
            },
          },
        },
      });

      if (!auditLog) {
        return null;
      }

      return AuditLogMapper.toDomain(auditLog);
    } catch (error) {
      this.logger.error(`Erro ao buscar log de auditoria ${auditId}:`, error);
      throw error;
    }
  }
}
