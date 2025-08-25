import { Test, TestingModule } from '@nestjs/testing';
import { LogService } from './log.service';
import { PrismaService } from '../../core/config/prisma.service';
import { Log, Prisma } from '@prisma/client';

// Mock PrismaService
const mockPrismaService = {
  log: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
};

describe('LogService', () => {
  let service: LogService;

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
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createLog', () => {
    it('should create AuthRequest.ts new log', async () => {
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
      expect(mockPrismaService.log.create).toHaveBeenCalledWith({
        data: logData,
      });
    });
  });

  describe('findAll', () => {
    it('should return an array of logs', async () => {
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
      mockPrismaService.log.findMany.mockResolvedValue(logs);

      const result = await service.findAll();
      expect(result).toEqual(logs);
      expect(mockPrismaService.log.findMany).toHaveBeenCalled();
    });
  });
});
