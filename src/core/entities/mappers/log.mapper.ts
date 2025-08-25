import { Log as PrismaLog, Prisma } from '@prisma/client';
import { LogEntity } from '../log.entity';

/**
 * Mapper para converter entre modelo Prisma e entidade de domínio Log
 */
export class LogMapper {
  /**
   * Converte modelo Prisma para entidade de domínio
   */
  static toDomain(prismaLog: PrismaLog): LogEntity {
    return new LogEntity({
      logId: prismaLog.logId,
      timestamp: prismaLog.timestamp,
      route: prismaLog.route,
      method: prismaLog.method,
      userId: prismaLog.userId || undefined,
      details: (prismaLog.details as Record<string, any>) || undefined,
    });
  }

  /**
   * Converte entidade de domínio para modelo Prisma (para criação)
   */
  static toPrismaCreate(logEntity: Partial<LogEntity>): Prisma.LogCreateInput {
    const createData: Prisma.LogCreateInput = {
      route: logEntity.route!,
      method: logEntity.method!,
      details: logEntity.details || Prisma.JsonNull,
      timestamp: logEntity.timestamp || new Date(),
    };

    if (logEntity.userId) {
      createData.user = {
        connect: { userId: logEntity.userId },
      };
    }

    return createData;
  }

  /**
   * Converte entidade de domínio para dados de atualização Prisma
   */
  static toPrismaUpdate(logEntity: Partial<LogEntity>): Partial<PrismaLog> {
    const updateData: Partial<PrismaLog> = {};

    if (logEntity.route !== undefined) updateData.route = logEntity.route;
    if (logEntity.method !== undefined) updateData.method = logEntity.method;
    if (logEntity.userId !== undefined)
      updateData.userId = logEntity.userId || null;
    if (logEntity.details !== undefined)
      updateData.details = logEntity.details || null;
    if (logEntity.timestamp !== undefined)
      updateData.timestamp = logEntity.timestamp;

    return updateData;
  }

  /**
   * Converte array de modelos Prisma para array de entidades de domínio
   */
  static toDomainArray(prismaLogs: PrismaLog[]): LogEntity[] {
    return prismaLogs.map((log) => this.toDomain(log));
  }

  /**
   * Converte dados de criação simples para Prisma.LogCreateInput
   */
  static createInputFromData(data: {
    route: string;
    method: string;
    userId?: string;
    details?: Record<string, any>;
  }): Prisma.LogCreateInput {
    const createData: Prisma.LogCreateInput = {
      route: data.route,
      method: data.method,
      details: data.details || Prisma.JsonNull,
    };

    if (data.userId) {
      createData.user = {
        connect: { userId: data.userId },
      };
    }

    return createData;
  }
}
