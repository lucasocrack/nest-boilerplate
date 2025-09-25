import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthV2Controller } from './auth-v2.controller';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../../core/guards/jwt.strategy';
import { ConfigModule } from '@nestjs/config';
import { MailModule } from '../../core/mail/mail.module';
import { PrismaModule } from '../../core/config/prisma.module';
import { AuthRepository } from './repositories/auth.repository';
import { AUTH_REPOSITORY_TOKEN } from './repositories/auth.repository.interface';
import { SecurityLoggerService } from '../../core/security/security-logger.service';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot(),
    UserModule,
    MailModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default-secret',
      signOptions: { expiresIn: process.env.JWT_ACCESS_TTL || '15m' },
    }),
  ],
  controllers: [AuthController, AuthV2Controller],
  providers: [
    AuthService,
    JwtStrategy,
    SecurityLoggerService,
    {
      provide: AUTH_REPOSITORY_TOKEN,
      useClass: AuthRepository,
    },
  ],
})
export class AuthModule {}
