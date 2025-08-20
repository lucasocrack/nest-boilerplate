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
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [mailConfig],
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 segundo
        limit: 3, // 3 requests por segundo
      },
      {
        name: 'medium',
        ttl: 10000, // 10 segundos
        limit: 20, // 20 requests por 10 segundos
      },
      {
        name: 'long',
        ttl: 60000, // 1 minuto
        limit: 100, // 100 requests por minuto
      },
      {
        name: 'auth',
        ttl: 60000, // 1 minuto
        limit: 5, // 5 tentativas de login por minuto
      },
    ]),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'default-secret',
      signOptions: { expiresIn: process.env.JWT_ACCESS_TTL || '1h' },
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
      useClass: ThrottlerGuard,
    },
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
