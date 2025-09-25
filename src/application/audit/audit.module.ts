import { Module } from '@nestjs/common';
import { AuditController } from './audit.controller';
import { AuditModule as CoreAuditModule } from '../../core/audit/audit.module';

/**
 * Módulo da aplicação para audit trail
 * Expõe endpoints para consulta de logs de auditoria
 */
@Module({
  imports: [CoreAuditModule],
  controllers: [AuditController],
})
export class AuditModule {}
