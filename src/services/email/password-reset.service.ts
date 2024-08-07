import { Injectable, Inject } from '@nestjs/common';
import { Transporter } from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PasswordResetService {
  constructor(@Inject('MAILER') private readonly mailer: Transporter) {}

  async sendPasswordResetEmail(to: string, context: any): Promise<void> {
    const templatePath = path.join(
      process.cwd(),
      'src',
      'templates',
      'password-reset.hbs',
    );
    const templateString = fs.readFileSync(templatePath, 'utf-8');
    const compiledTemplate = handlebars.compile(templateString);
    const html = compiledTemplate(context);

    await this.mailer.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject: 'Password Reset Request',
      html,
    });
  }
}