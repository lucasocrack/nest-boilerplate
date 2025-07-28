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
}
