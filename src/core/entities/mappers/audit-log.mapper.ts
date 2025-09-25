import {
  AuditLog as PrismaAuditLog,
  Prisma,
  AuditAction,
} from '@prisma/client';
import { AuditLogEntity, CreateAuditLogData } from '../audit-log.entity';

/**
 * Interface para contexto de auditoria
 */
export interface AuditContext {
  userId?: string;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

/**
 * Mapper para converter entre modelo Prisma e entidade de domínio AuditLog
 */
export class AuditLogMapper {
  /**
   * Converte modelo Prisma para entidade de domínio
   */
  static toDomain(prismaAuditLog: PrismaAuditLog): AuditLogEntity {
    return new AuditLogEntity({
      auditId: prismaAuditLog.auditId,
      entityType: prismaAuditLog.entityType,
      entityId: prismaAuditLog.entityId,
      action: prismaAuditLog.action,
      userId: prismaAuditLog.userId || undefined,
      timestamp: prismaAuditLog.timestamp,
      oldValues: (prismaAuditLog.oldValues as Record<string, any>) || undefined,
      newValues: (prismaAuditLog.newValues as Record<string, any>) || undefined,
      changedFields: prismaAuditLog.changedFields,
      ip: prismaAuditLog.ip || undefined,
      userAgent: prismaAuditLog.userAgent || undefined,
      metadata: (prismaAuditLog.metadata as Record<string, any>) || undefined,
    });
  }

  /**
   * Converte entidade de domínio para dados de criação Prisma
   */
  static toPrisma(
    auditLogData: CreateAuditLogData,
  ): Prisma.AuditLogCreateInput {
    const createInput: Prisma.AuditLogCreateInput = {
      entityType: auditLogData.entityType,
      entityId: auditLogData.entityId,
      action: auditLogData.action,
      oldValues: auditLogData.oldValues || Prisma.JsonNull,
      newValues: auditLogData.newValues || Prisma.JsonNull,
      changedFields: auditLogData.changedFields,
      ip: auditLogData.ip || null,
      userAgent: auditLogData.userAgent || null,
      metadata: auditLogData.metadata || Prisma.JsonNull,
    };

    if (auditLogData.userId) {
      createInput.user = {
        connect: { userId: auditLogData.userId },
      };
    }

    return createInput;
  }

  /**
   * Converte array de modelos Prisma para array de entidades de domínio
   */
  static toDomainArray(prismaAuditLogs: PrismaAuditLog[]): AuditLogEntity[] {
    return prismaAuditLogs.map((log) => AuditLogMapper.toDomain(log));
  }

  /**
   * Cria dados de audit log para operação CREATE
   */
  static createForCreate(
    entityType: string,
    entityId: string,
    newValues: Record<string, any>,
    context?: AuditContext,
  ): CreateAuditLogData {
    const changedFields = Object.keys(newValues);

    return new AuditLogEntity({
      entityType,
      entityId,
      action: AuditAction.CREATE,
      userId: context?.userId,
      newValues,
      changedFields,
      ip: context?.ip,
      userAgent: context?.userAgent,
      metadata: context?.metadata,
    });
  }

  /**
   * Cria dados de audit log para operação UPDATE
   */
  static createForUpdate(
    entityType: string,
    entityId: string,
    oldValues: Record<string, any>,
    newValues: Record<string, any>,
    changedFields: string[],
    context?: AuditContext,
  ): CreateAuditLogData {
    return new AuditLogEntity({
      entityType,
      entityId,
      action: AuditAction.UPDATE,
      userId: context?.userId,
      oldValues,
      newValues,
      changedFields,
      ip: context?.ip,
      userAgent: context?.userAgent,
      metadata: context?.metadata,
    });
  }

  /**
   * Cria dados de audit log para operação DELETE
   */
  static createForDelete(
    entityType: string,
    entityId: string,
    oldValues: Record<string, any>,
    context?: AuditContext,
  ): CreateAuditLogData {
    const changedFields = Object.keys(oldValues);

    return new AuditLogEntity({
      entityType,
      entityId,
      action: AuditAction.DELETE,
      userId: context?.userId,
      oldValues,
      changedFields,
      ip: context?.ip,
      userAgent: context?.userAgent,
      metadata: context?.metadata,
    });
  }

  /**
   * Cria dados de audit log para ações de segurança
   */
  static createForSecurityAction(
    entityType: string,
    entityId: string,
    action: AuditAction,
    context?: AuditContext,
  ): CreateAuditLogData {
    return new AuditLogEntity({
      entityType,
      entityId,
      action,
      userId: context?.userId,
      changedFields: [],
      ip: context?.ip,
      userAgent: context?.userAgent,
      metadata: context?.metadata,
    });
  }
}
