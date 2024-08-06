import { Module } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Module({
  providers: [
    {
      provide: 'MAILER',
      useValue: nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT, 10),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      }),
    },
  ],
  exports: ['MAILER'],
})
export class EmailModule {}
