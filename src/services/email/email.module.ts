import { Module } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as hbs from 'nodemailer-express-handlebars';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';

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
              layoutsDir: process.env.EMAIL_LAYOUTS_DIR,
              defaultLayout: false,
              partialsDir: process.env.EMAIL_PARTIALS_DIR,
            },
            viewPath: process.env.EMAIL_LAYOUTS_DIR,
            extName: '.hbs',
          }),
        );

        return transporter;
      },
    },
    EmailService,
  ],
  exports: [EmailService],
})
export class EmailModule {}
