import { Module } from '@nestjs/common';
import { InactiveUserService } from './inactive-user.service';
import { ScheduleModule } from '@nestjs/schedule';
import { InactiveUserScheduler } from './inactive-user.scheduler';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [ScheduleModule.forRoot(), PrismaModule],
  providers: [InactiveUserService, InactiveUserScheduler],
})
export class InactiveUserModule {}