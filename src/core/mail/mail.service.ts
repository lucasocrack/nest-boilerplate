import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from '@prisma/client';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailerService: MailerService) {}

  private isEmailEnabled(): boolean {
    return process.env.EMAIL_ENABLED === 'true';
  }

  private async sendEmailIfEnabled(emailOptions: any, logMessage: string): Promise<void> {
    if (!this.isEmailEnabled()) {
      this.logger.log(`📧 Email desabilitado: ${logMessage}`);
      return;
    }

    try {
      await this.mailerService.sendMail(emailOptions);
      this.logger.log(`✅ ${logMessage}`);
    } catch (error) {
      this.logger.error(`❌ Erro ao enviar email: ${logMessage}`, error.message);
      if (process.env.NODE_ENV === 'development') {
        this.logger.warn('🚀 Modo desenvolvimento: Email seria enviado em produção');
        return;
      }
      throw error;
    }
  }

  async sendUserConfirmation(user: User): Promise<void> {
    const { email, name } = user;
    
    await this.sendEmailIfEnabled(
      {
        to: email,
        subject: 'Welcome to our app! Confirm your email',
        template: './confirmation',
        context: {
          name: name,
        },
      },
      `Email de confirmação enviado para: ${email}`
    );
  }

  async sendActivationEmail(user: User, activationToken: string): Promise<void> {
    const { email, name } = user;
    const activationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/activate?token=${activationToken}`;
    
    await this.sendEmailIfEnabled(
      {
        to: email,
        subject: 'Ative sua conta - Bem-vindo!',
        template: './activation',
        context: {
          name: name,
          activationUrl: activationUrl,
          token: activationToken,
        },
      },
      `Email de ativação enviado para: ${email}`
    );
    
    // Log da URL de ativação em desenvolvimento quando email está desabilitado
    if (process.env.NODE_ENV === 'development' && !this.isEmailEnabled()) {
      this.logger.log(`🔗 URL de ativação: ${activationUrl}`);
    }
  }

  async sendSuspiciousLoginAlert(user: User, loginDetails: { ip: string; userAgent: string; timestamp: Date }): Promise<void> {
    const { email, name } = user;
    
    await this.sendEmailIfEnabled(
      {
        to: email,
        subject: '🚨 Alerta de Segurança - Login Suspeito Detectado',
        template: './security-alert',
        context: {
          name: name,
          alertType: 'Login Suspeito',
          ip: loginDetails.ip,
          userAgent: loginDetails.userAgent,
          timestamp: loginDetails.timestamp.toLocaleString('pt-BR'),
          message: 'Detectamos um login suspeito em sua conta. Se não foi você, recomendamos alterar sua senha imediatamente.',
        },
      },
      `Alerta de login suspeito enviado para: ${email}`
    );
  }

  async sendMultipleLoginAttemptsAlert(user: User, attemptCount: number): Promise<void> {
    const { email, name } = user;
    
    await this.sendEmailIfEnabled(
      {
        to: email,
        subject: '🚨 Alerta de Segurança - Múltiplas Tentativas de Login',
        template: './security-alert',
        context: {
          name: name,
          alertType: 'Múltiplas Tentativas de Login',
          attemptCount: attemptCount,
          timestamp: new Date().toLocaleString('pt-BR'),
          message: `Detectamos ${attemptCount} tentativas de login em sua conta. Por segurança, sua conta pode ser temporariamente bloqueada.`,
        },
      },
      `Alerta de múltiplas tentativas enviado para: ${email}`
    );
  }

  async sendAccountBlockedAlert(user: User, blockDuration: string): Promise<void> {
    const { email, name } = user;
    
    await this.sendEmailIfEnabled(
      {
        to: email,
        subject: '🔒 Conta Temporariamente Bloqueada',
        template: './security-alert',
        context: {
          name: name,
          alertType: 'Conta Bloqueada',
          blockDuration: blockDuration,
          timestamp: new Date().toLocaleString('pt-BR'),
          message: `Sua conta foi temporariamente bloqueada devido a múltiplas tentativas de login falhadas. O bloqueio será removido automaticamente em ${blockDuration}.`,
        },
      },
      `Alerta de conta bloqueada enviado para: ${email}`
    );
  }
}
