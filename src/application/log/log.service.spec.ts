import { Test, TestingModule } from '@nestjs/testing';
import { LogService } from './log.service';
import { PrismaService } from '../../core/config/prisma.service';
import { Log, Prisma } from '@prisma/client';

// Mock PrismaService
const mockPrismaService = {
  log: {
    create: jest.fn(),
    count: jest.fn(),
    findMany: jest.fn(),
  },
  $transaction: jest.fn(),
};

describe('LogService', () => {
  let service: LogService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<LogService>(LogService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createLog', () => {
    it('should create a new log', async () => {
      const logData: Prisma.LogCreateInput = {
        route: '/test',
        method: 'GET',
      };
      const expectedLog: Log = {
        logId: 1,
        timestamp: new Date(),
        route: '/test',
        method: 'GET',
        userId: null,
        details: null,
      };
      mockPrismaService.log.create.mockResolvedValue(expectedLog);

      const result = await service.createLog(logData);
      expect(result).toEqual(expectedLog);
      expect(mockPrismaService.log.create).toHaveBeenCalledWith({ data: logData });
    });
  });

  describe('findAllPaged', () => {
    it('should return a paginated object of logs', async () => {
      const logs: Log[] = [
        {
          logId: 1,
          timestamp: new Date(),
          route: '/test1',
          method: 'GET',
          userId: null,
          details: null,
        },
        {
          logId: 2,
          timestamp: new Date(),
          route: '/test2',
          method: 'POST',
          userId: '1',
          details: { body: { key: 'value' } },
        },
      ];
      const total = 2;
      const page = 1;
      const limit = 20;

      mockPrismaService.$transaction.mockResolvedValue([total, logs]);

      const result = await service.findAllPaged({ page, limit });

      expect(result).toEqual({
        data: logs,
        total,
        page,
        limit,
      });

      expect(mockPrismaService.$transaction).toHaveBeenCalled();
      expect(mockPrismaService.log.count).toHaveBeenCalled();
      expect(mockPrismaService.log.findMany).toHaveBeenCalledWith({
        orderBy: { timestamp: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              userId: true,
              name: true,
              email: true,
            },
          },
        },
      });
    });
  });
});
