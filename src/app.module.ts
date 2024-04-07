import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CertificatesModule } from './certificates/certificates.module';

@Module({
  imports: [CertificatesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
