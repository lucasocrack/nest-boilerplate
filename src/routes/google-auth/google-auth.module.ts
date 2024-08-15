import { Module } from '@nestjs/common';
import { GoogleAuthService } from './google-auth.service';
import { GoogleAuthController } from './google-auth.controller';
import { GoogleStrategy } from './google.strategy';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../services/prisma/prisma.module';
import { JwtConfigModule } from '../../services/jwt/jwt-config.module';

@Module({
  imports: [PrismaModule, ConfigModule, JwtConfigModule],
  controllers: [GoogleAuthController],
  providers: [GoogleAuthService, GoogleStrategy],
})
export class GoogleAuthModule {}
