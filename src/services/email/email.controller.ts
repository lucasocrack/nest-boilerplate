import { Controller, Post, Body } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  async sendEmail(
    @Body('to') to: string,
    @Body('subject') subject: string,
    @Body('template') template: string,
    @Body('context') context: any,
  ): Promise<void> {
    await this.emailService.sendMail(to, subject, template, context);
  }
}