import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../../core/services/prisma.service';
import { CreateUserDto } from '../auth/dto/create-auth.dto';
import { User, Role } from '@prisma/client';

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
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a new user with correct data', async () => {
      const createUserDto: CreateUserDto = {
        username: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      const expectedUser: User = {
        userId: '1',
        username: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        cpf: null,
        telefone: null,
        avatarUrl: null,
        role: Role.CLIENTE,
        active: false,
        divida: false,
        lastLogin: null,
        tokenVersion: 1,
        refreshToken: null,
        passwordResetToken: null,
        passwordResetExpires: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      mockPrismaService.user.create.mockResolvedValue(expectedUser);

      const result = await service.createUser(createUserDto);

      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          username: 'testuser',
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          cpf: null,
          telefone: null,
          avatarUrl: null,
          role: 'CLIENTE',
          active: false,
        },
      });
      expect(result).toEqual(expectedUser);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users: User[] = [
        { userId: '1', username: 'user1', name: 'User One', email: 'user1@example.com', password: 'p1', active: true, divida: false, createdAt: new Date(), updatedAt: new Date(), deletedAt: null, role: Role.CLIENTE, lastLogin: null, tokenVersion: 1, refreshToken: null, passwordResetToken: null, passwordResetExpires: null, cpf: null, telefone: null, avatarUrl: null },
        { userId: '2', username: 'user2', name: 'User Two', email: 'user2@example.com', password: 'p2', active: true, divida: false, createdAt: new Date(), updatedAt: new Date(), deletedAt: null, role: Role.CLIENTE, lastLogin: null, tokenVersion: 1, refreshToken: null, passwordResetToken: null, passwordResetExpires: null, cpf: null, telefone: null, avatarUrl: null },
      ];
      mockPrismaService.user.findMany.mockResolvedValue(users);

      const result = await service.findAll();
      expect(result).toEqual(users);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({ where: { deletedAt: null } });
    });
  });

  describe('findOneById', () => {
    it('should return a single user', async () => {
      const user: User = { userId: '1', username: 'user1', name: 'User One', email: 'user1@example.com', password: 'p1', active: true, divida: false, createdAt: new Date(), updatedAt: new Date(), deletedAt: null, role: Role.CLIENTE, lastLogin: null, tokenVersion: 1, refreshToken: null, passwordResetToken: null, passwordResetExpires: null, cpf: null, telefone: null, avatarUrl: null };
      mockPrismaService.user.findFirst.mockResolvedValue(user);

      const result = await service.findOneById('1');
      expect(result).toEqual(user);
      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({ where: { userId: '1', deletedAt: null } });
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const user: User = { userId: '1', username: 'user1', name: 'User One', email: 'user1@example.com', password: 'p1', active: true, divida: false, createdAt: new Date(), updatedAt: new Date(), deletedAt: null, role: Role.CLIENTE, lastLogin: null, tokenVersion: 1, refreshToken: null, passwordResetToken: null, passwordResetExpires: null, cpf: null, telefone: null, avatarUrl: null };
      const updatedUser: User = { ...user, name: 'User One Updated' };
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update('1', { name: 'User One Updated' });
      expect(result).toEqual(updatedUser);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({ where: { userId: '1' }, data: { name: 'User One Updated' } });
    });
  });

  describe('remove', () => {
    it('should soft delete a user', async () => {
      const user: User = { userId: '1', username: 'user1', name: 'User One', email: 'user1@example.com', password: 'p1', active: true, divida: false, createdAt: new Date(), updatedAt: new Date(), deletedAt: null, role: Role.CLIENTE, lastLogin: null, tokenVersion: 1, refreshToken: null, passwordResetToken: null, passwordResetExpires: null, cpf: null, telefone: null, avatarUrl: null };
      const deletedUser: User = { ...user, deletedAt: new Date() };
      mockPrismaService.user.update.mockResolvedValue(deletedUser);

      const result = await service.remove('1');
      expect(result).toEqual(deletedUser);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({ where: { userId: '1' }, data: { deletedAt: expect.any(Date) } });
    });
  });
});
