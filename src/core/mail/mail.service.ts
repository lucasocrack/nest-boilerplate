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

  async sendActivationEmail(user: User, activationToken: string): Promise<void> {
    try {
      const { email, name } = user;
      const activationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/activate?token=${activationToken}`;
      
      this.logger.log(`Enviando email de ativação para: ${email}`);
      
      await this.mailerService.sendMail({
        to: email,
        subject: 'Ative sua conta - Bem-vindo!',
        template: './activation',
        context: {
          name: name,
          activationUrl: activationUrl,
          token: activationToken,
        },
      });
      
      this.logger.log(`Email de ativação enviado com sucesso para: ${email}`);
    } catch (error) {
      this.logger.error(`Erro ao enviar email de ativação para ${user.email}:`, error.message);
      // Em desenvolvimento, não falha a aplicação por erro de email
      if (process.env.NODE_ENV === 'development') {
        this.logger.warn('🚀 Modo desenvolvimento: Email de ativação seria enviado em produção');
        this.logger.log(`🔗 URL de ativação: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/activate?token=${activationToken}`);
        return;
      }
      throw error;
    }
  }
}
