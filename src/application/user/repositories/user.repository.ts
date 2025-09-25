import { Injectable } from '@nestjs/common';
import { User, Role } from '@prisma/client';
import { PrismaService } from '../../../core/config/prisma.service';
import { CreateUserDto } from '../../auth/dto/create-auth.dto';
import { IUserRepository } from './user.repository.interface';

/**
 * Implementação concreta do repositório User usando Prisma
 * Responsável por todas as operações de acesso a dados relacionadas ao usuário
 */
@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserDto): Promise<User> {
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

  async createAdmin(
    data: Omit<User, 'userId' | 'createdAt' | 'updatedAt'>,
  ): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { userId: id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findByUsername(userName: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { userName },
    });
  }

  async findByCpf(cpf: string): Promise<User | null> {
    if (!cpf) return null;
    return this.prisma.user.findUnique({
      where: { cpf },
    });
  }

  async findByIdentification(identification: string): Promise<User | null> {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (emailRegex.test(identification)) {
      return this.findByEmail(identification);
    } else {
      // Assumir que é CPF e normalizar
      const normalizedCpf = identification.replace(/\D/g, '');
      if (normalizedCpf.length === 11) {
        return this.findByCpf(normalizedCpf);
      }
    }

    return null;
  }

  async findByPasswordResetToken(token: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { passwordResetToken: token },
    });
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async findAllPaged(params: {
    page: number;
    limit: number;
    role?: Role;
    search?: string;
    userName?: string;
    email?: string;
  }): Promise<{
    data: User[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page, limit, role, search, userName, email } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (role) {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { userName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (userName) {
      where.userName = { contains: userName, mode: 'insensitive' };
    }

    if (email) {
      where.email = { contains: email, mode: 'insensitive' };
    }

    const [data, total]: any = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    return this.prisma.user.update({
      where: { userId: id },
      data,
    });
  }

  async blockUser(id: string, blockedUntil?: Date): Promise<User> {
    return this.prisma.user.update({
      where: { userId: id },
      data: {
        blocked: true,
        blockedUntil: blockedUntil || new Date(Date.now() + 15 * 60 * 1000), // 15 minutos por padrão
      },
    });
  }

  async unblockUser(id: string): Promise<User> {
    return this.prisma.user.update({
      where: { userId: id },
      data: {
        blocked: false,
        blockedUntil: null,
        loginAttempts: 0,
      },
    });
  }

  async restoreUser(id: string): Promise<User> {
    return this.prisma.user.update({
      where: { userId: id },
      data: {
        deletedAt: null,
        active: true,
        blocked: false,
        blockedUntil: null,
      },
    });
  }

  async remove(id: string): Promise<User> {
    return this.prisma.user.update({
      where: { userId: id },
      data: {
        deletedAt: new Date(),
        active: false,
      },
    });
  }

  async checkUserExists(data: {
    userName?: string;
    email?: string;
    cpf?: string;
  }): Promise<{
    userNameExists: boolean;
    emailExists: boolean;
    cpfExists: boolean;
  }> {
    const [userNameExists, emailExists, cpfExists] = await Promise.all([
      data.userName
        ? this.prisma.user.findFirst({ where: { userName: data.userName } })
        : null,
      data.email
        ? this.prisma.user.findUnique({ where: { email: data.email } })
        : null,
      data.cpf
        ? this.prisma.user.findUnique({ where: { cpf: data.cpf } })
        : null,
    ]);

    return {
      userNameExists: !!userNameExists,
      emailExists: !!emailExists,
      cpfExists: !!cpfExists,
    };
  }
}
