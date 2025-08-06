import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/config/prisma.service';
import { Log, Prisma } from '@prisma/client';

@Injectable()
export class LogService {
  constructor(private readonly prisma: PrismaService) {}

  async createLog(data: Prisma.LogCreateInput): Promise<Log> {
    return this.prisma.log.create({ data });
  }

  async findAll(): Promise<Log[]> {
    return this.prisma.log.findMany();
  }
}
