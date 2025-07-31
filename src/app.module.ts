import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './application/modules/auth.module';
import { UserModule } from './application/modules/user.module';
import { PrismaService } from './services/prisma.service';
import { LogModule } from './application/modules/log.module';
import { LoggerMiddleware } from './application/middleware/log.middleware';

@Module({
  imports: [AuthModule, UserModule, LogModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
  exports: [PrismaService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
