import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendMail({ to, subject, template, context }) {
    await this.mailerService.sendMail({
      to,
      subject,
      template,
      context,
    });
  }
}
