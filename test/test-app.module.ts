import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthModule } from '../src/application/auth/auth.module';
import { UserModule } from '../src/application/user/user.module';
import { PrismaService } from '../src/core/config/prisma.service';
import { LogModule } from '../src/application/log/log.module';
import { HomeModule } from '../src/application/home/home.module';
import { MailModule } from '../src/core/mail/mail.module';
import mailConfig from '../src/core/mail/mail.config';
import { GlobalAuthGuard } from '../src/core/guards/global-auth.guard';
import { GlobalExceptionFilter } from '../src/core/filters/global-exception.filter';
import { ResponseFormatInterceptor } from '../src/core/interceptors/response-format.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.test',
      load: [mailConfig],
    }),
    // Removido ThrottlerModule para testes
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'test-secret',
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
    // Removido ThrottlerGuard para testes
    {
      provide: APP_GUARD,
      useClass: GlobalAuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseFormatInterceptor,
    },
  ],
  exports: [PrismaService],
})
export class TestAppModule {}
