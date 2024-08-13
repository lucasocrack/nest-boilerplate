import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from '../../routes/user/user.module';
import { LocalStrategy } from './strategies/local.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LoginValidationMiddleware } from './middlewares/ogin-validation.middleware';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailModule } from '../email/email.module';
import { ConfigModule } from '@nestjs/config';
import { JwtConfigModule } from '../jwt/jwt-config.module';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtConfigModule,
    PrismaModule,
    EmailModule,
    ConfigModule,
  ],
  controllers: [],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoginValidationMiddleware).forRoutes('login');
  }
}
