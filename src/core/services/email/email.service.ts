import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as hbs from 'nodemailer-express-handlebars';
import { join } from 'path';

@Injectable()
export class EmailService {
  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  constructor() {
    this.transporter.use(
      'compile',
      hbs({
        viewEngine: {
          extname: '.hbs',
          partialsDir: join(__dirname, '..', 'templates'),
          layoutsDir: join(__dirname, '..', 'templates'),
          defaultLayout: false,
        },
        viewPath: join(__dirname, '..', 'templates'),
        extName: '.hbs',
      }),
    );
  }

  async sendMail(to: string, subject: string, template: string, context: any) {
    await this.transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject,
      template,
      context,
    });
  }
}