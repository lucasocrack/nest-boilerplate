import { Module } from '@nestjs/common';
import { PrismaModule } from './services/prisma/prisma.module';
import { UserModule } from './routes/user/user.module';
import { AuthModule } from './services/auth/auth.module';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { PostModule } from './routes/post/post.module';
import { EmailModule } from './services/email/email.module';
import { AppController } from './app.controller';
import { InactiveUserModule } from './services/inactive-user/inactive-user.module';

@Module({
  imports: [PrismaModule, UserModule, AuthModule, PostModule, EmailModule, InactiveUserModule],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
