import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../../core/config/prisma.service';
import { CreateUserDto } from '../auth/dto/create-auth.dto';
import { User, Role } from '@prisma/client';

const mockUserRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
  findAllPaged: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  findByUsername: jest.fn(),
  findByCpf: jest.fn(),
  findByIdentification: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockPrismaService = {
  user: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
  },
};

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: 'IUserRepository',
          useValue: mockUserRepository,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should create AuthRequest.ts new user with correct data', async () => {
      const createUserDto: CreateUserDto = {
        userName: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      const expectedUser: User = {
        userId: '1',
        userName: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        cpf: null,
        telefone: null,
        avatarUrl: null,
        role: Role.CLIENTE,
        active: false,
        lastLogin: null,
        tokenVersion: 1,
        refreshToken: null,
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

      mockUserRepository.create.mockResolvedValue(expectedUser);

      const result = await service.createUser(createUserDto);

      expect(mockUserRepository.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(expectedUser);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users: User[] = [
        {
          userId: '1',
          userName: 'user1',
          name: 'User One',
          email: 'user1@example.com',
          password: 'p1',
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          role: Role.CLIENTE,
          lastLogin: null,
          tokenVersion: 1,
          refreshToken: null,
          passwordResetToken: null,
          passwordResetExpires: null,
          activationToken: null,
          activationTokenExpires: null,
          blocked: false,
          blockedUntil: null,
          loginAttempts: 0,
          lastFailedLogin: null,
          cpf: null,
          telefone: null,
          avatarUrl: null,
        },
        {
          userId: '2',
          userName: 'user2',
          name: 'User Two',
          email: 'user2@example.com',
          password: 'p2',
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          role: Role.CLIENTE,
          lastLogin: null,
          tokenVersion: 1,
          refreshToken: null,
          passwordResetToken: null,
          passwordResetExpires: null,
          activationToken: null,
          activationTokenExpires: null,
          blocked: false,
          blockedUntil: null,
          loginAttempts: 0,
          lastFailedLogin: null,
          cpf: null,
          telefone: null,
          avatarUrl: null,
        },
      ];
      mockUserRepository.findAll.mockResolvedValue(users);

      const result = await service.findAll();
      expect(result).toEqual(users);
      expect(mockUserRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('findOneById', () => {
    it('should return AuthRequest.ts single user', async () => {
      const user: User = {
        userId: '1',
        userName: 'user1',
        name: 'User One',
        email: 'user1@example.com',
        password: 'p1',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        role: Role.CLIENTE,
        lastLogin: null,
        tokenVersion: 1,
        refreshToken: null,
        passwordResetToken: null,
        passwordResetExpires: null,
        activationToken: null,
        activationTokenExpires: null,
        blocked: false,
        blockedUntil: null,
        loginAttempts: 0,
        lastFailedLogin: null,
        cpf: null,
        telefone: null,
        avatarUrl: null,
      };
      mockUserRepository.findById.mockResolvedValue(user);

      const result = await service.findOneById('1');
      expect(result).toEqual(user);
      expect(mockUserRepository.findById).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should update AuthRequest.ts user', async () => {
      const user: User = {
        userId: '1',
        userName: 'user1',
        name: 'User One',
        email: 'user1@example.com',
        password: 'p1',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        role: Role.CLIENTE,
        lastLogin: null,
        tokenVersion: 1,
        refreshToken: null,
        passwordResetToken: null,
        passwordResetExpires: null,
        activationToken: null,
        activationTokenExpires: null,
        blocked: false,
        blockedUntil: null,
        loginAttempts: 0,
        lastFailedLogin: null,
        cpf: null,
        telefone: null,
        avatarUrl: null,
      };
      const updatedUser: User = { ...user, name: 'User One Updated' };
      mockUserRepository.update.mockResolvedValue(updatedUser);

      const result = await service.update('1', { name: 'User One Updated' });
      expect(result).toEqual(updatedUser);
      expect(mockUserRepository.update).toHaveBeenCalledWith('1', {
        name: 'User One Updated',
      });
    });
  });

  describe('remove', () => {
    it('should soft delete user', async () => {
      const user: User = {
        userId: '1',
        userName: 'user1',
        name: 'User One',
        email: 'user1@example.com',
        password: 'p1',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        role: Role.CLIENTE,
        lastLogin: null,
        tokenVersion: 1,
        refreshToken: null,
        passwordResetToken: null,
        passwordResetExpires: null,
        activationToken: null,
        activationTokenExpires: null,
        blocked: false,
        blockedUntil: null,
        loginAttempts: 0,
        lastFailedLogin: null,
        cpf: null,
        telefone: null,
        avatarUrl: null,
      };
      const deletedUser: User = { ...user, deletedAt: new Date() };
      mockUserRepository.remove.mockResolvedValue(deletedUser);

      const result = await service.remove('1');
      expect(result).toEqual(deletedUser);
      expect(mockUserRepository.remove).toHaveBeenCalledWith('1');
    });
  });
});
