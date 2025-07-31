import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient, User } from '@prisma/client';
import { CreateUserDto } from '../application/dto/create-auth.dto';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async createUser(data: CreateUserDto): Promise<User> {
    return await this.user.create({
      data: {
        ...data,
        cpf: data.cpf ?? null,
        telefone: data.telefone ?? null,
        avatarUrl: data.avatarUrl ?? null,
        role: data.role ?? 'CLIENTE',
        active: data.active ?? false,
      },
    });
  }

  async findOneByUsername(username: string): Promise<User | null> {
    return await this.user.findUnique({ where: { username } });
  }

  async findAll(): Promise<User[]> {
    return await this.user.findMany({ where: { deletedAt: null } });
  }

  async findOneById(id: number): Promise<User | null> {
    return await this.user.findFirst({
      where: { userId: id, deletedAt: null },
    });
  }

  async update(id: number, data: Partial<User>): Promise<User> {
    return await this.user.update({
      where: { userId: id },
      data,
    });
  }

  async remove(id: number): Promise<User> {
    return await this.user.update({
      where: { userId: id },
      data: { deletedAt: new Date() },
    });
  }
}
