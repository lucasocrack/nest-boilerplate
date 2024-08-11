import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class InactiveUserService {
  constructor(private readonly prisma: PrismaService) {}

  async deleteInactiveUsers(): Promise<void> {
    console.log(
      'deleteInactiveUsers function executed at',
      new Date().toISOString(),
    );
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const usersToDelete: User[] = await this.prisma.user.findMany({
      where: {
        createdAt: {
          lt: oneHourAgo,
        },
        isActive: false,
      },
    });

    for (const user of usersToDelete) {
      await this.prisma.user.delete({
        where: { id: user.id },
      });
    }
  }
}
