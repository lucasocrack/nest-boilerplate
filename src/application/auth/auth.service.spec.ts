import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User, Role } from '@prisma/client';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  const mockUserService = {
    findOneByUsername: jest.fn(),
  update: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
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
        userId: 1,
        username: 'testuser',
        password: 'hashedpassword',
        name: 'Test User',
        email: 'test@example.com',
        cpf: null,
        telefone: null,
        avatarUrl: null,
        role: Role.CLIENTE,
        active: true,
        divida: false,
        lastLogin: null,
        passwordResetToken: null,
        passwordResetExpires: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      mockUserService.findOneByUsername.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue('test_token');

      const result = await service.signIn('testuser', 'password');

      expect(result).toEqual({ access_token: 'test_token' });
      expect(mockUserService.findOneByUsername).toHaveBeenCalledWith(
        'testuser',
      );
      expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedpassword');
      expect(mockJwtService.signAsync).toHaveBeenCalledWith({
        sub: 1,
        username: 'testuser',
      });
    });

    it('should throw an UnauthorizedException for invalid password', async () => {
      const user: User = {
        userId: 1,
        username: 'testuser',
        password: 'hashedpassword',
        name: 'Test User',
        email: 'test@example.com',
        cpf: null,
        telefone: null,
        avatarUrl: null,
        role: Role.CLIENTE,
        active: true,
        divida: false,
        lastLogin: null,
        passwordResetToken: null,
        passwordResetExpires: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      mockUserService.findOneByUsername.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.signIn('testuser', 'wrongpassword')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw an UnauthorizedException for non-existent user', async () => {
      mockUserService.findOneByUsername.mockResolvedValue(null);

      await expect(service.signIn('unknownuser', 'password')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
