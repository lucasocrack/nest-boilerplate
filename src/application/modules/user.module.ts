import { Module } from '@nestjs/common';
import { UserService } from '../../services/user.service';
import { PrismaService } from '../../services/prisma.service';
import { UserController } from '../controllers/user.controller';

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService],
  exports: [UserService],
})
export class UserModule {}
