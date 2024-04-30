import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from 'prisma/prisma-client/scripts/default-index';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks() {
    this.$on('beforeExit', async () => {
      await this.$disconnect();
    });
  }
}
