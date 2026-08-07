import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaService } from '../../core/config/prisma.service';
import { UserController } from './user.controller';
import { UserRepository } from './repositories/user.repository';
import { AuditTrailService } from '../../core/audit/audit-trail.service';

@Module({
  controllers: [UserController],
  providers: [
    AuditTrailService,
    UserService,
    PrismaService,
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
  ],
  exports: [UserService],
})
export class UserModule {}
