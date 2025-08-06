import { Module } from '@nestjs/common';
import { LogService } from './log.service';
import { PrismaService } from '../../core/config/prisma.service';
import { LogController } from './log.controller';

@Module({
  controllers: [LogController],
  providers: [LogService, PrismaService],
  exports: [LogService],
})
export class LogModule {}
