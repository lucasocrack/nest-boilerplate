import { Injectable, Inject } from '@nestjs/common';
import { Transporter } from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EmailService {
  constructor(@Inject('MAILER') private readonly mailer: Transporter) {}

  async sendMail(
    to: string,
    subject: string,
    template: string,
    context: any,
  ): Promise<void> {
    const templatePath = path.join(
      process.cwd(),
      'src',
      'templates',
      `${template}.hbs`,
    );
    const templateString = fs.readFileSync(templatePath, 'utf-8');
    const compiledTemplate = handlebars.compile(templateString);
    const html = compiledTemplate(context);

    await this.mailer.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    });
  }

  async sendRegistrationEmail(to: string, context: any): Promise<void> {
    const templatePath = path.join(
      process.cwd(),
      'src',
      'templates',
      'account-registration.hbs',
    );
    const templateString = fs.readFileSync(templatePath, 'utf-8');
    const compiledTemplate = handlebars.compile(templateString);
    const html = compiledTemplate(context);

    await this.mailer.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject: 'Account Registration',
      html,
    });
  }


}
