import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthModule } from './application/auth/auth.module';
import { UserModule } from './application/user/user.module';
import { PrismaService } from './core/config/prisma.service';
import { LogModule } from './application/log/log.module';
import { LoggerMiddleware } from './application/log/middleware/log.middleware';
import { HomeModule } from './application/home/home.module';
import { ConfigModule } from '@nestjs/config';
import { MailModule } from './core/mail/mail.module';
import mailConfig from './core/config/mail.config';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { GlobalAuthGuard } from './core/guards/global-auth.guard';
import { GlobalExceptionFilter } from './core/filters/global-exception.filter';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [mailConfig],
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'default-secret',
      signOptions: { expiresIn: '1d' },
    }),
    AuthModule,
    UserModule,
    LogModule,
    HomeModule,
    MailModule,
  ],
  controllers: [],
  providers: [
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: GlobalAuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
  exports: [PrismaService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
