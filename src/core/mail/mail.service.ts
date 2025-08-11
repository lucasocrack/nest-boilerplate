import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from '@prisma/client';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailerService: MailerService) {}

  async sendUserConfirmation(user: User): Promise<void> {
    try {
      const { email, name } = user;
      
      this.logger.log(`Enviando email de confirmação para: ${email}`);
      
      await this.mailerService.sendMail({
        to: email,
        subject: 'Welcome to our app! Confirm your email',
        template: './confirmation',
        context: {
          name: name,
        },
      });
      
      this.logger.log(`Email de confirmação enviado com sucesso para: ${email}`);
    } catch (error) {
      this.logger.error(`Erro ao enviar email de confirmação para ${user.email}:`, error.message);
      // Em desenvolvimento, não falha a aplicação por erro de email
      if (process.env.NODE_ENV === 'development') {
        this.logger.warn('🚀 Modo desenvolvimento: Email seria enviado em produção');
        return;
      }
      throw error;
    }
  }
}
