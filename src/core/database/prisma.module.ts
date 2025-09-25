import { Module, Global } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';

/**
 * Módulo global do Prisma
 * Fornece o PrismaService para toda a aplicação
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
