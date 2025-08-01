import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthModule } from './application/auth/auth.module';
import { UserModule } from './application/user/user.module';
import { PrismaService } from './core/services/prisma.service';
import { LogModule } from './application/log/log.module';
import { LoggerMiddleware } from './application/log/middleware/log.middleware';

@Module({
  imports: [AuthModule, UserModule, LogModule],
  controllers: [],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
