import { EmailService } from '../../../services/email/email.service';
import { ConfigService } from '@nestjs/config';
import { User } from '../../../entities/user.entity';
import { TokenUtils } from './token.utils';

export class EmailUtils {
  constructor(
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
    private readonly tokenUtils: TokenUtils,
  ) {}

  async sendActivationEmail(user: User) {
    const activationLink = this.tokenUtils.generateActivationLink(user.id);
    await this.emailService.sendActivationEmail(user.email, {
      name: user.username,
      activationLink,
    });
  }

  async sendResetPasswordEmail(user: User) {
    const resetLink = `${this.configService.get<string>('DOMAIN')}/reset-password?token=${this.tokenUtils.generateResetPasswordToken(user.id)}`;
    await this.emailService.sendResetPasswordEmail(user.email, {
      name: user.username,
      resetLink,
    });
  }
}