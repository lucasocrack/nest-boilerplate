import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

const mockMailerService = {
  sendMail: jest.fn(),
};

const mockConfigService = {
  get: jest.fn(),
};

describe('MailService', () => {
  let service: MailService;
  let mailerService: MailerService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: MailerService,
          useValue: mockMailerService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    mailerService = module.get<MailerService>(MailerService);
    configService = module.get<ConfigService>(ConfigService);

    // Limpar todos os mocks antes de cada teste
    jest.clearAllMocks();

    // Configurar EMAIL_ENABLED como true para os testes
    process.env.EMAIL_ENABLED = 'true';

    // Mock do Logger para evitar logs durante os testes
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendActivationEmail', () => {
    it('should send activation email successfully', async () => {
      const user = {
        email: 'test@example.com',
        name: 'Test User',
        userId: '1',
      } as any;
      const activationToken = 'activation_token_123';
      const frontendUrl = 'https://frontend.com';

      mockConfigService.get.mockReturnValue(frontendUrl);
      mockMailerService.sendMail.mockResolvedValue({
        messageId: 'test-message-id',
      });

      await service.sendActivationEmail(user, activationToken);

      expect(mailerService.sendMail).toHaveBeenCalledWith({
        to: user.email,
        subject: 'Ative sua conta - Bem-vindo!',
        template: './activation',
        context: {
          name: user.name,
          activationUrl: `http://localhost:3000/auth/activate?token=${activationToken}`,
          token: activationToken,
        },
      });
    });

    it('should handle activation email sending errors', async () => {
      const user = {
        email: 'test@example.com',
        name: 'Test User',
        userId: '1',
      } as any;
      const activationToken = 'activation_token_123';
      const frontendUrl = 'https://frontend.com';
      const error = new Error('Email sending failed');

      mockConfigService.get.mockReturnValue(frontendUrl);
      mockMailerService.sendMail.mockRejectedValue(error);

      await expect(
        service.sendActivationEmail(user, activationToken),
      ).rejects.toThrow(error);
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('should send password reset email successfully', async () => {
      const email = 'test@example.com';
      const name = 'Test User';
      const resetToken = 'reset_token_123';
      const frontendUrl = 'https://frontend.com';

      mockConfigService.get.mockReturnValue(frontendUrl);
      mockMailerService.sendMail.mockResolvedValue({
        messageId: 'test-message-id',
      });

      await service.sendPasswordResetEmail(email, name, resetToken);

      expect(configService.get).toHaveBeenCalledWith('FRONTEND_URL');
      expect(mailerService.sendMail).toHaveBeenCalledWith({
        to: email,
        subject: 'Redefinição de Senha',
        template: './password-reset',
        context: {
          name,
          resetUrl: `${frontendUrl}/auth/reset-password?token=${resetToken}`,
          token: resetToken,
        },
      });
    });

    it('should handle password reset email sending errors', async () => {
      const email = 'test@example.com';
      const name = 'Test User';
      const resetToken = 'reset_token_123';
      const frontendUrl = 'https://frontend.com';
      const error = new Error('Email sending failed');

      mockConfigService.get.mockReturnValue(frontendUrl);
      mockMailerService.sendMail.mockRejectedValue(error);

      await expect(
        service.sendPasswordResetEmail(email, name, resetToken),
      ).rejects.toThrow(error);
    });
  });

  describe('sendWelcomeEmail', () => {
    it('should send welcome email successfully', async () => {
      const email = 'test@example.com';
      const name = 'Test User';
      const frontendUrl = 'https://frontend.com';

      mockConfigService.get.mockReturnValue(frontendUrl);
      mockMailerService.sendMail.mockResolvedValue({
        messageId: 'test-message-id',
      });

      await service.sendWelcomeEmail(email, name);

      expect(configService.get).toHaveBeenCalledWith('FRONTEND_URL');
      expect(mailerService.sendMail).toHaveBeenCalledWith({
        to: email,
        subject: 'Bem-vindo!',
        template: 'welcome',
        context: {
          name,
          loginUrl: `${frontendUrl}/auth/login`,
        },
      });
    });

    it('should handle welcome email sending errors', async () => {
      const email = 'test@example.com';
      const name = 'Test User';
      const frontendUrl = 'https://frontend.com';
      const error = new Error('Email sending failed');

      mockConfigService.get.mockReturnValue(frontendUrl);
      mockMailerService.sendMail.mockRejectedValue(error);

      await expect(service.sendWelcomeEmail(email, name)).rejects.toThrow(
        error,
      );
    });
  });

  describe('sendSecurityAlertEmail', () => {
    it('should send security alert email successfully', async () => {
      const email = 'test@example.com';
      const name = 'Test User';
      const alertType = 'login_attempt';
      const details = 'Tentativa de login de IP suspeito';

      mockMailerService.sendMail.mockResolvedValue({
        messageId: 'test-message-id',
      });

      await service.sendSecurityAlertEmail(email, name, alertType, details);

      expect(mailerService.sendMail).toHaveBeenCalledWith({
        to: email,
        subject: `🔒 Alerta de Segurança: ${alertType}`,
        template: './security-alert',
        context: {
          name,
          alertType,
          details,
          timestamp: expect.any(String),
        },
      });
    });

    it('should handle security alert email sending errors', async () => {
      const email = 'test@example.com';
      const name = 'Test User';
      const alertType = 'login_attempt';
      const details = 'Tentativa de login de IP suspeito';
      const error = new Error('Email sending failed');

      mockMailerService.sendMail.mockRejectedValue(error);

      await expect(
        service.sendSecurityAlertEmail(email, name, alertType, details),
      ).rejects.toThrow(error);
    });
  });

  describe('sendEmail', () => {
    it('should send generic email successfully', async () => {
      const to = 'test@example.com';
      const subject = 'Test Subject';
      const template = 'test-template';
      const context = { name: 'Test User' };

      mockMailerService.sendMail.mockResolvedValue({
        messageId: 'test-message-id',
      });

      await service.sendEmail(to, subject, template, context);

      expect(mailerService.sendMail).toHaveBeenCalledWith({
        to,
        subject,
        template,
        context,
      });
    });

    it('should handle generic email sending errors', async () => {
      const to = 'test@example.com';
      const subject = 'Test Subject';
      const template = 'test-template';
      const context = { name: 'Test User' };
      const error = new Error('Email sending failed');

      mockMailerService.sendMail.mockRejectedValue(error);

      await expect(
        service.sendEmail(to, subject, template, context),
      ).rejects.toThrow(error);
    });
  });
});
