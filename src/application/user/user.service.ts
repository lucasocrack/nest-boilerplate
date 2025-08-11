import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../auth/dto/create-auth.dto';
import { PrismaService } from '../../core/config/prisma.service';
import { User, Role } from '@prisma/client';

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
        role: data.role ?? Role.CLIENTE,
        active: data.active ?? false,
      },
    });
  }


  async findOneByUsername(userName: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { userName } });
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findOneByCpf(cpf: string): Promise<User | null> {
    if (!cpf) return null;
    return this.prisma.user.findUnique({ where: { cpf } });
  }

  async checkUserExists(data: { userName?: string; email?: string; cpf?: string }): Promise<{
    userNameExists: boolean;
    emailExists: boolean;
    cpfExists: boolean;
  }> {
    const [userNameExists, emailExists, cpfExists] = await Promise.all([
      data.userName ? this.findOneByUsername(data.userName) : null,
      data.email ? this.findOneByEmail(data.email) : null,
      data.cpf ? this.findOneByCpf(data.cpf) : null,
    ]);

    return {
      userNameExists: !!userNameExists,
      emailExists: !!emailExists,
      cpfExists: !!cpfExists,
    };
  }

  async findOneByPasswordResetToken(token: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { passwordResetToken: token },
    });
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany({ where: { deletedAt: null } });
  }

  async findOneById(id: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { userId: id, deletedAt: null },
    });
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    return this.prisma.user.update({
      where: { userId: id },
      data,
    });
  }

  async remove(id: string): Promise<User> {
    return this.prisma.user.update({
      where: { userId: id },
      data: { deletedAt: new Date() },
    });
  }
}
