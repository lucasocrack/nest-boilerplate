import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../../core/guards/jwt.strategy';
import { ConfigModule } from '@nestjs/config';
import { MailModule } from 'src/core/mail/mail.module';
import { PrismaModule } from '../../core/config/prisma.module';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot(),
    UserModule,
    MailModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}