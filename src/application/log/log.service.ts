import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/config/prisma.service';
import { Log, Prisma } from '@prisma/client';

@Injectable()
export class LogService {
  constructor(private readonly prisma: PrismaService) {}

  async createLog(data: Prisma.LogCreateInput): Promise<Log> {
    return this.prisma.log.create({ data });
  }

  async findAllPaged(params: {
    page: number;
    limit: number;
  }): Promise<{ data: Log[]; total: number; page: number; limit: number }> {
    const { page, limit } = params;

    const [total, data] = await this.prisma.$transaction([
      this.prisma.log.count(),
      this.prisma.log.findMany({
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
      }),
    ]);

    return { data, total, page, limit };
  }
}
