import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CreateUserDto } from '../application/dto/create-auth.dto';
import { User } from '../../generated/prisma';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(data: CreateUserDto): Promise<User> {
    return this.prisma.user.create({
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
    return this.prisma.user.findUnique({ where: { username } });
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany({ where: { deletedAt: null } });
  }

  async findOneById(id: number): Promise<User | null> {
    return this.prisma.user.findFirst({ where: { userId: id, deletedAt: null } });
  }

  async update(id: number, data: Partial<User>): Promise<User> {
    return this.prisma.user.update({
      where: { userId: id },
      data,
    });
  }

  async remove(id: number): Promise<User> {
    return this.prisma.user.update({
      where: { userId: id },
      data: { deletedAt: new Date() },
    });
  }
}
