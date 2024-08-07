import { Module } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as hbs from 'nodemailer-express-handlebars';
import { join } from 'path';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { PasswordResetService } from './password-reset.service';

@Module({
  imports: [],
  controllers: [EmailController],
  providers: [
    {
      provide: 'MAILER',
      useFactory: () => {
        const transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST,
          port: parseInt(process.env.EMAIL_PORT, 10),
          secure: process.env.EMAIL_SECURE === 'true',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        transporter.use(
          'compile',
          hbs({
            viewEngine: {
              extname: '.hbs',
              layoutsDir: join(process.cwd(), 'src', 'templates'),
              defaultLayout: false,
              partialsDir: join(process.cwd(), 'src', 'templates'),
            },
            viewPath: join(process.cwd(), 'src', 'templates'),
            extName: '.hbs',
          }),
        );

        return transporter;
      },
    },
    EmailService,
    PasswordResetService,
  ],
  exports: [EmailService],
})
export class EmailModule {}
