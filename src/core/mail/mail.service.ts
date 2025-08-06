import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from '@prisma/client';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendUserConfirmation(user: User): Promise<void> {
    const { email, username } = user;
    await this.mailerService.sendMail({
      to: email,
      subject: 'Welcome to our app! Confirm your email',
      template: './confirmation', // `.hbs` extension is appended automatically
      context: {
        name: username,
      },
    });
  }
}
