import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './routes/user/user.module';

@Module({
  imports: [PrismaModule, UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
