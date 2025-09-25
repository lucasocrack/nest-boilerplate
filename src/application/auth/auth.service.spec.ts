import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '../../core/exceptions/custom-exceptions';
import * as bcrypt from 'bcrypt';
import { User, Role } from '@prisma/client';
import { MailService } from '../../core/mail/mail.service';
import { PrismaService } from '../../core/config/prisma.service';
import { CreateUserDto } from './dto/create-auth.dto';
import { AUTH_REPOSITORY_TOKEN } from './repositories/auth.repository.interface';
import { SecurityLoggerService } from '../../core/security/security-logger.service';
import { AuditTrailService } from '../../core/audit/audit-trail.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;

  const mockUserService = {
    findOneByUsername: jest.fn(),
    findByIdentification: jest.fn(),
    update: jest.fn(),
    createUser: jest.fn(),
    checkUserExists: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  const mockMailService = {
    sendUserConfirmation: jest.fn(),
    sendActivationEmail: jest.fn(),
  };

  const mockPrismaService = {
    user: {
      update: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockAuthRepository = {
    createUser: jest.fn(),
    findByEmail: jest.fn(),
    findByUsername: jest.fn(),
    findByIdentification: jest.fn(),
    updateUser: jest.fn(),
    updatePassword: jest.fn(),
    updateActivationToken: jest.fn(),
    updatePasswordResetToken: jest.fn(),
    activateUser: jest.fn(),
    incrementLoginAttempts: jest.fn(),
    resetLoginAttempts: jest.fn(),
    blockUser: jest.fn(),
    updateLastLogin: jest.fn(),
    updateRefreshToken: jest.fn(),
    updateUserTokens: jest.fn(),
  };

  const mockSecurityLoggerService = {
    logLoginAttempt: jest.fn(),
    logAccountBlocked: jest.fn(),
    logAccountUnblocked: jest.fn(),
    logSuspiciousLogin: jest.fn(),
    logTokenRefresh: jest.fn(),
    logPasswordReset: jest.fn(),
    logLogout: jest.fn(),
  };

  const mockAuditTrailService = {
    logCreate: jest.fn(),
    logSecurityAction: jest.fn(),
    findAuditLogs: jest.fn(),
    getAuditStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: MailService, useValue: mockMailService },
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: AUTH_REPOSITORY_TOKEN, useValue: mockAuthRepository },
        { provide: SecurityLoggerService, useValue: mockSecurityLoggerService },
        { provide: AuditTrailService, useValue: mockAuditTrailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should create a new user and send confirmation email', async () => {
      const createUserDto: CreateUserDto = {
        userName: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        cpf: '11144477735',
        telefone: '11999999999',
      };

      const mockUserData = {
        userName: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword',
        cpf: '11144477735',
        telefone: '11999999999',
        avatarUrl: null,
        role: 'CLIENTE' as const,
        lastLogin: null,
        refreshToken: null,
        passwordResetToken: null,
        passwordResetExpires: null,
        activationToken: 'activation_token',
        activationTokenExpires: expect.any(Date) as Date,
        active: false,
        blocked: false,
        blockedUntil: null,
        loginAttempts: 0,
        lastFailedLogin: null,
        deletedAt: null,
      };

      mockUserService.checkUserExists.mockResolvedValue({
        userNameExists: false,
        emailExists: false,
        cpfExists: false,
      });
      mockAuthRepository.createUser.mockResolvedValue(mockUserData);
      mockMailService.sendUserConfirmation.mockResolvedValue(undefined);
      mockMailService.sendActivationEmail.mockResolvedValue(undefined);

      const result = await service.register(createUserDto);

      expect(result).toEqual({
        userName: mockUserData.userName,
        name: mockUserData.name,
        email: mockUserData.email,
        cpf: mockUserData.cpf,
        telefone: mockUserData.telefone,
        avatarUrl: mockUserData.avatarUrl,
        role: mockUserData.role,
        lastLogin: mockUserData.lastLogin,
        refreshToken: mockUserData.refreshToken,
        passwordResetToken: mockUserData.passwordResetToken,
        passwordResetExpires: mockUserData.passwordResetExpires,
        activationTokenExpires: expect.any(Date) as Date,
        active: mockUserData.active,
        blocked: mockUserData.blocked,
        blockedUntil: mockUserData.blockedUntil,
        loginAttempts: mockUserData.loginAttempts,
        lastFailedLogin: mockUserData.lastFailedLogin,
        deletedAt: mockUserData.deletedAt,
        message:
          'Usuário registrado com sucesso. Verifique seu email para ativar a conta.',
      });
      expect(mockAuthRepository.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          userName: createUserDto.userName,
          name: createUserDto.name,
          email: createUserDto.email,
          cpf: createUserDto.cpf,
          telefone: createUserDto.telefone,
        }),
      );
      expect(mockMailService.sendActivationEmail).toHaveBeenCalledWith(
        mockUserData,
        expect.any(String),
      );
    });
  });

  describe('signIn', () => {
    it('should return an access token for valid credentials', async () => {
      const user: User = {
        userId: '1',
        userName: 'testuser',
        password: 'hashedpassword',
        name: 'Test User',
        email: 'test@example.com',
        cpf: null,
        telefone: null,
        avatarUrl: null,
        role: Role.CLIENTE,
        active: true,
        blocked: false,
        blockedUntil: null,
        loginAttempts: 0,
        lastFailedLogin: null,
        activationToken: null,
        activationTokenExpires: null,
        lastLogin: null,
        tokenVersion: 1,
        refreshToken: null,
        passwordResetToken: null,
        passwordResetExpires: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      mockUserService.findByIdentification.mockResolvedValue(user);
      (
        bcrypt.compare as jest.MockedFunction<typeof bcrypt.compare>
      ).mockImplementation(() => true);
      mockJwtService.signAsync.mockResolvedValue('test_token');

      const result = await service.signIn('testuser', 'password');

      expect(result).toEqual({
        access_token: 'test_token',
        refresh_token: 'test_token',
      });
      expect(mockUserService.findByIdentification).toHaveBeenCalledWith(
        'testuser',
      );
      expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedpassword');
      expect(mockJwtService.signAsync).toHaveBeenCalledWith({
        sub: '1',
        username: 'testuser',
        tokenVersion: 1,
      });
    });

    it('should throw an UnauthorizedException for invalid password', async () => {
      const user: User = {
        userId: '1',
        userName: 'testuser',
        password: 'hashedpassword',
        name: 'Test User',
        email: 'test@example.com',
        cpf: null,
        telefone: null,
        avatarUrl: null,
        role: Role.CLIENTE,
        active: true,
        blocked: false,
        blockedUntil: null,
        loginAttempts: 0,
        lastFailedLogin: null,
        activationToken: null,
        activationTokenExpires: null,
        lastLogin: null,
        tokenVersion: 1,
        refreshToken: null,
        passwordResetToken: null,
        passwordResetExpires: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      mockUserService.findByIdentification.mockResolvedValue(user);
      (
        bcrypt.compare as jest.MockedFunction<typeof bcrypt.compare>
      ).mockImplementation(() => false);

      await expect(service.signIn('testuser', 'wrongpassword')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw an UnauthorizedException for non-existent user', async () => {
      mockUserService.findByIdentification.mockResolvedValue(null);

      await expect(service.signIn('unknownuser', 'password')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
