import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from './prisma.service';
import { CreateUserDto } from '../application/dto/create-auth.dto';
import { User, Role } from '../../generated/prisma';

// Mock PrismaService
const mockPrismaService = {
  user: {
    create: jest.fn(),
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
        userId: 1,
        username: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        cpf: null,
        telefone: null,
        avatarUrl: null,
        role: Role.CLIENTE,
        active: false,
        lastLogin: null,
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
});
