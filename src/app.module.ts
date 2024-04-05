import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CertificatesController } from './certificates/certificates.controller';
import { CertificatesService } from './certificates/certificates.service';

@Module({
  imports: [],
  controllers: [AppController, CertificatesController],
  providers: [AppService, CertificatesService],
})
export class AppModule {}
