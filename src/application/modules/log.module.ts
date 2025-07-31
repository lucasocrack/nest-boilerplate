import { Module } from '@nestjs/common';
import { LogService } from '../../services/log.service';
import { PrismaService } from '../../services/prisma.service';
import { LogController } from '../controllers/log.controller';

@Module({
  controllers: [LogController],
  providers: [LogService, PrismaService],
  exports: [LogService],
})
export class LogModule {}
