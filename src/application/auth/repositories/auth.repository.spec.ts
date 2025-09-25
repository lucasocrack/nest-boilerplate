import { Test, TestingModule } from '@nestjs/testing';
import { AuthRepository } from './auth.repository';
import { PrismaService } from '../../../core/config/prisma.service';
import { User, Role } from '@prisma/client';

const mockPrismaService = {
  user: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

describe('AuthRepository', () => {
  let repository: AuthRepository;

  const mockUser: User = {
    userId: '1',
    userName: 'testuser',
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedpassword',
    cpf: '12345678901',
    telefone: '11999999999',
    avatarUrl: 'https://example.com/avatar.jpg',
    role: Role.CLIENTE,
    active: true,
    lastLogin: new Date(),
    tokenVersion: 1,
    refreshToken: 'refresh_token_hash',
    passwordResetToken: null,
    passwordResetExpires: null,
    activationToken: null,
    activationTokenExpires: null,
    blocked: false,
    blockedUntil: null,
    loginAttempts: 0,
    lastFailedLogin: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<AuthRepository>(AuthRepository);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const userData: Omit<User, 'userId' | 'createdAt' | 'updatedAt'> = {
        userName: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword',
        cpf: '12345678901',
        telefone: '11999999999',
        avatarUrl: null,
        role: Role.CLIENTE,
        lastLogin: null,
        tokenVersion: 0,
        refreshToken: null,
        passwordResetToken: null,
        passwordResetExpires: null,
        activationToken: 'activation_token',
        activationTokenExpires: new Date(Date.now() + 3600000),
        active: false,
        blocked: false,
        blockedUntil: null,
        loginAttempts: 0,
        lastFailedLogin: null,
        deletedAt: null,
      };

      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const result = await repository.createUser(userData);

      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: userData,
      });
      expect(result).toEqual(mockUser);
    });

    it('should handle creation errors', async () => {
      const userData: Omit<User, 'userId' | 'createdAt' | 'updatedAt'> = {
        userName: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword',
        cpf: '12345678901',
        telefone: '11999999999',
        avatarUrl: null,
        role: Role.CLIENTE,
        lastLogin: null,
        tokenVersion: 0,
        refreshToken: null,
        passwordResetToken: null,
        passwordResetExpires: null,
        activationToken: 'activation_token',
        activationTokenExpires: new Date(Date.now() + 3600000),
        active: false,
        blocked: false,
        blockedUntil: null,
        loginAttempts: 0,
        lastFailedLogin: null,
        deletedAt: null,
      };

      const error = new Error('Database error');
      mockPrismaService.user.create.mockRejectedValue(error);

      await expect(repository.createUser(userData)).rejects.toThrow(error);
    });
  });

  describe('findUserByPasswordResetToken', () => {
    it('should find user by valid password reset token', async () => {
      const token = 'reset_token';
      const userWithResetToken = {
        ...mockUser,
        passwordResetToken: token,
        passwordResetExpires: new Date(Date.now() + 3600000),
      };
      mockPrismaService.user.findFirst.mockResolvedValue(userWithResetToken);

      const result = await repository.findUserByPasswordResetToken(token);

      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
        where: {
          passwordResetToken: token,
          passwordResetExpires: { gte: expect.any(Date) as Date },
        },
      });
      expect(result).toEqual(userWithResetToken);
    });

    it('should return null when password reset token not found or expired', async () => {
      const token = 'invalid_token';
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      const result = await repository.findUserByPasswordResetToken(token);

      expect(result).toBeNull();
    });
  });

  describe('findUserByEmail', () => {
    it('should return user by email', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await repository.findUserByEmail('test@example.com');

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when email not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await repository.findUserByEmail(
        'nonexistent@example.com',
      );

      expect(result).toBeNull();
    });
  });

  describe('findUserByActivationToken', () => {
    it('should find user by valid activation token', async () => {
      const token = 'activation_token';
      const userWithActivationToken = {
        ...mockUser,
        activationToken: token,
        activationTokenExpires: new Date(Date.now() + 3600000),
        active: false,
      };
      mockPrismaService.user.findFirst.mockResolvedValue(
        userWithActivationToken,
      );

      const result = await repository.findUserByActivationToken(token);

      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
        where: {
          activationToken: token,
          activationTokenExpires: { gte: expect.any(Date) as Date },
          active: false,
        },
      });
      expect(result).toEqual(userWithActivationToken);
    });

    it('should return null when activation token not found or expired', async () => {
      const token = 'invalid_token';
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      const result = await repository.findUserByActivationToken(token);

      expect(result).toBeNull();
    });
  });

  describe('activateUser', () => {
    it('should activate user and clear activation token', async () => {
      const userId = '1';
      const updatedUser = {
        ...mockUser,
        active: true,
        activationToken: null,
        activationTokenExpires: null,
      };
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await repository.activateUser(userId);

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { userId },
        data: {
          active: true,
          activationToken: null,
          activationTokenExpires: null,
        },
      });
      expect(result).toEqual(updatedUser);
    });

    it('should handle activation errors', async () => {
      const error = new Error('Activation failed');
      mockPrismaService.user.update.mockRejectedValue(error);

      await expect(repository.activateUser('1')).rejects.toThrow(error);
    });
  });

  describe('updateUserPassword', () => {
    it('should update user password and clear reset token', async () => {
      const userId = '1';
      const hashedPassword = 'hashed_new_password';
      const updatedUser = {
        ...mockUser,
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      };
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await repository.updateUserPassword(
        userId,
        hashedPassword,
      );

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { userId },
        data: {
          password: hashedPassword,
          passwordResetToken: null,
          passwordResetExpires: null,
          tokenVersion: { increment: 1 },
          refreshToken: null,
        },
      });
      expect(result).toEqual(updatedUser);
    });

    it('should handle password update errors', async () => {
      const hashedPassword = 'hashed_new_password';
      const error = new Error('Password update failed');
      mockPrismaService.user.update.mockRejectedValue(error);

      await expect(
        repository.updateUserPassword('1', hashedPassword),
      ).rejects.toThrow(error);
    });
  });

  describe('updateUserTokens', () => {
    it('should update user tokens successfully', async () => {
      const userId = '1';
      const tokenData = {
        refreshToken: 'new_refresh_token',
        tokenVersion: 2,
        passwordResetToken: 'reset_token',
        passwordResetExpires: new Date(Date.now() + 3600000),
      };
      const updatedUser = {
        ...mockUser,
        ...tokenData,
      };
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await repository.updateUserTokens(userId, tokenData);

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { userId },
        data: tokenData,
      });
      expect(result).toEqual(updatedUser);
    });

    it('should handle update user tokens errors', async () => {
      const tokenData = { refreshToken: 'new_token' };
      const error = new Error('Update failed');
      mockPrismaService.user.update.mockRejectedValue(error);

      await expect(repository.updateUserTokens('1', tokenData)).rejects.toThrow(
        error,
      );
    });
  });

  describe('incrementTokenVersion', () => {
    it('should increment token version and clear refresh token', async () => {
      const userId = '1';
      const updatedUser = {
        ...mockUser,
        tokenVersion: 2,
        refreshToken: null,
      };
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await repository.incrementTokenVersion(userId);

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { userId },
        data: {
          tokenVersion: { increment: 1 },
          refreshToken: null,
        },
      });
      expect(result).toEqual(updatedUser);
    });

    it('should handle increment token version errors', async () => {
      const error = new Error('Update failed');
      mockPrismaService.user.update.mockRejectedValue(error);

      await expect(repository.incrementTokenVersion('1')).rejects.toThrow(
        error,
      );
    });
  });
});
