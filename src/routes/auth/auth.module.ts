import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { LocalStrategy } from './strategies/local.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LoginValidationMiddleware } from './middlewares/login-validation.middleware';
import { PrismaModule } from '../../services/prisma/prisma.module';
import { EmailModule } from '../../services/email/email.module';
import { ConfigModule } from '@nestjs/config';
import { JwtConfigModule } from '../../services/jwt/jwt-config.module';
import { AuthController } from './auth.controller';
import { TokenUtils } from './utils/token.utils';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtConfigModule,
    PrismaModule,
    EmailModule,
    ConfigModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, TokenUtils],
  exports: [AuthService, TokenUtils],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoginValidationMiddleware).forRoutes('login');
  }
}
