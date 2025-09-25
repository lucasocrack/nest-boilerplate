import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaService } from '../../core/config/prisma.service';
import { UserController } from './user.controller';
import { UserRepository } from './repositories/user.repository';

@Module({
  controllers: [UserController],
  providers: [
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
