import { Module, Global } from '@nestjs/common';
import { AuditTrailService } from './audit-trail.service';
import { AuditTrailInterceptor } from '../interceptors/audit-trail.interceptor';
import { PrismaModule } from '../database/prisma.module';

/**
 * Módulo global para audit trail
 * Fornece serviços de auditoria para toda a aplicação
 */
@Global()
@Module({
  imports: [PrismaModule],
  providers: [AuditTrailService, AuditTrailInterceptor],
  exports: [AuditTrailService, AuditTrailInterceptor],
})
export class AuditModule {}
