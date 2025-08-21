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

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  const mockUserService = {
    findOneByUsername: jest.fn(),
    findByIdentification: jest.fn(),
    update: jest.fn(),
    createUser: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  const mockMailService = {
    sendUserConfirmation: jest.fn(),
  };

  const mockPrismaService = {
    user: {
      update: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn(),
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
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue('test_token');

      const result = await service.signIn('testuser', 'password');

      expect(result).toEqual({ access_token: 'test_token', refresh_token: 'test_token' });
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
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

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
