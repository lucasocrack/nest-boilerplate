import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from './user.repository';
import { PrismaService } from '../../../core/config/prisma.service';
import { CreateUserDto } from '../../auth/dto/create-auth.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User, Role } from '@prisma/client';

const mockPrismaService = {
  user: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
};

describe('UserRepository', () => {
  let repository: UserRepository;

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      const createUserDto: CreateUserDto = {
        userName: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const result = await repository.create(createUserDto);

      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          ...createUserDto,
          cpf: null,
          telefone: null,
          avatarUrl: null,
          role: 'CLIENTE',
          active: false,
        },
      });
      expect(result).toEqual(mockUser);
    });

    it('should handle creation errors', async () => {
      const createUserDto: CreateUserDto = {
        userName: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      const error = new Error('Database error');
      mockPrismaService.user.create.mockRejectedValue(error);

      await expect(repository.create(createUserDto)).rejects.toThrow(error);
    });
  });

  describe('findAll', () => {
    it('should return all active users', async () => {
      const users = [mockUser, { ...mockUser, userId: '2', userName: 'user2' }];
      mockPrismaService.user.findMany.mockResolvedValue(users);

      const result = await repository.findAll();

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith();
      expect(result).toEqual(users);
    });

    it('should return empty array when no users found', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([]);

      const result = await repository.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return user by id', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await repository.findById('1');

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { userId: '1' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await repository.findById('999');

      expect(result).toBeNull();
    });
  });

  describe('findByUsername', () => {
    it('should return user by username', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);

      const result = await repository.findByUsername('testuser');

      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
        where: { userName: 'testuser' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when username not found', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      const result = await repository.findByUsername('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await repository.findByEmail('test@example.com');

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when email not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await repository.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findByIdentification', () => {
    it('should find user by email when identification is email format', async () => {
      const email = 'test@example.com';
      const mockUser = { userId: '1', email, userName: 'testuser' };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await repository.findByIdentification(email);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email },
      });
      expect(result).toEqual(mockUser);
    });

    it('should find user by CPF when identification is CPF format', async () => {
      const cpf = '12345678901';
      const mockUser = { userId: '1', cpf, email: 'test@example.com' };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await repository.findByIdentification(cpf);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { cpf },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when identification format is not recognized', async () => {
      const result = await repository.findByIdentification('invalidformat');
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      const updateData: UpdateUserDto = {
        name: 'Updated Name',
        email: 'updated@example.com',
      };
      const updatedUser = { ...mockUser, ...updateData };

      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await repository.update('1', updateData);

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { userId: '1' },
        data: updateData,
      });
      expect(result).toEqual(updatedUser);
    });

    it('should handle update errors', async () => {
      const updateData: UpdateUserDto = { name: 'Updated Name' };
      const error = new Error('Update failed');

      mockPrismaService.user.update.mockRejectedValue(error);

      await expect(repository.update('1', updateData)).rejects.toThrow(error);
    });
  });

  describe('remove', () => {
    it('should soft delete user', async () => {
      const deletedUser = { ...mockUser, deletedAt: new Date() };
      mockPrismaService.user.update.mockResolvedValue(deletedUser);

      const result: any = await repository.remove('1');

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { userId: '1' },
        data: {
          deletedAt: expect.any(Date),
          active: false,
        },
      });
      expect(result).toEqual(deletedUser);
    });

    it('should handle remove errors', async () => {
      const error = new Error('Remove failed');
      mockPrismaService.user.update.mockRejectedValue(error);

      await expect(repository.remove('1')).rejects.toThrow(error);
    });
  });

  describe('findAllPaged', () => {
    it('should find users with pagination and filters', async () => {
      const params = {
        page: 1,
        limit: 10,
        role: Role.CLIENTE,
        userName: 'test',
        email: 'test@',
      };

      const users = [mockUser];
      const total = 1;

      mockPrismaService.user.findMany.mockResolvedValue(users);
      mockPrismaService.user.count.mockResolvedValue(total);

      const result = await repository.findAllPaged(params);

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: {
          role: Role.CLIENTE,
          userName: { contains: 'test', mode: 'insensitive' },
          email: { contains: 'test@', mode: 'insensitive' },
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });

      expect(mockPrismaService.user.count).toHaveBeenCalledWith({
        where: {
          role: Role.CLIENTE,
          userName: { contains: 'test', mode: 'insensitive' },
          email: { contains: 'test@', mode: 'insensitive' },
        },
      });

      expect(result).toEqual({
        data: users,
        total,
        page: 1,
        limit: 10,
      });
    });

    it('should handle search filter', async () => {
      const params = {
        page: 1,
        limit: 10,
        search: 'john',
      };

      const users = [mockUser];
      const total = 1;

      mockPrismaService.user.findMany.mockResolvedValue(users);
      mockPrismaService.user.count.mockResolvedValue(total);

      await repository.findAllPaged(params);

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: 'john', mode: 'insensitive' } },
            { email: { contains: 'john', mode: 'insensitive' } },
            { userName: { contains: 'john', mode: 'insensitive' } },
          ],
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });

      expect(mockPrismaService.user.count).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: 'john', mode: 'insensitive' } },
            { email: { contains: 'john', mode: 'insensitive' } },
            { userName: { contains: 'john', mode: 'insensitive' } },
          ],
        },
      });
    });

    it('should return empty result when no users match filters', async () => {
      const params = {
        page: 1,
        limit: 10,
        role: Role.ADMIN,
      };

      mockPrismaService.user.findMany.mockResolvedValue([]);
      mockPrismaService.user.count.mockResolvedValue(0);

      const result = await repository.findAllPaged(params);

      expect(result).toEqual({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      });
    });
  });

  describe('blockUser', () => {
    it('should block user until specified date', async () => {
      const blockUntil = new Date('2024-12-31');
      const blockedUser = {
        ...mockUser,
        blocked: true,
        blockedUntil: blockUntil,
      };

      mockPrismaService.user.update.mockResolvedValue(blockedUser);

      const result = await repository.blockUser('1', blockUntil);

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { userId: '1' },
        data: {
          blocked: true,
          blockedUntil: blockUntil,
        },
      });
      expect(result).toEqual(blockedUser);
    });

    it('should handle block user errors', async () => {
      const blockUntil = new Date('2024-12-31');
      const error = new Error('Block failed');

      mockPrismaService.user.update.mockRejectedValue(error);

      await expect(repository.blockUser('1', blockUntil)).rejects.toThrow(
        error,
      );
    });
  });

  describe('unblockUser', () => {
    it('should unblock user successfully', async () => {
      const unblockedUser = {
        ...mockUser,
        blocked: false,
        blockedUntil: null,
      };

      mockPrismaService.user.update.mockResolvedValue(unblockedUser);

      const result = await repository.unblockUser('1');

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { userId: '1' },
        data: {
          blocked: false,
          blockedUntil: null,
          loginAttempts: 0,
        },
      });
      expect(result).toEqual(unblockedUser);
    });

    it('should handle unblock user errors', async () => {
      const error = new Error('Unblock failed');

      mockPrismaService.user.update.mockRejectedValue(error);

      await expect(repository.unblockUser('1')).rejects.toThrow(error);
    });
  });
});
