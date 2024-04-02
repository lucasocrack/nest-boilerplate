import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CertificatesController } from './certificates/certificates.controller';

@Module({
  imports: [],
  controllers: [AppController, CertificatesController],
  providers: [AppService],
})
export class AppModule {}
