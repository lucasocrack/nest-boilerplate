import { Injectable, Inject } from '@nestjs/common';
import { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  constructor(@Inject('MAILER') private readonly mailer: Transporter) {}

  async sendMail(
    to: string,
    subject: string,
    text: string,
    html?: string,
  ): Promise<void> {
    await this.mailer.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      html,
    });
  }
}
