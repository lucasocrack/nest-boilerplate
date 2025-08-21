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
    return this.prisma.user.findFirst({ where: { userName } });
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findOneByCpf(cpf: string): Promise<User | null> {
    if (!cpf) return null;
    return this.prisma.user.findUnique({ where: { cpf } });
  }

  async findByIdentification(identification: string): Promise<User | null> {
    // Primeiro, verificar se é um email válido
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (emailRegex.test(identification)) {
      // Se for um email, buscar por email
      return this.findOneByEmail(identification);
    } else {
      // Se não for email, assumir que é CPF e normalizar
      const normalizedCpf = identification.replace(/\D/g, '');
      if (normalizedCpf.length === 11) {
        return this.findOneByCpf(normalizedCpf);
      }
    }
    
    return null;
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

  async findAllPaged(params: { page: number; limit: number; role?: Role; search?: string; userName?: string; email?: string }): Promise<{ data: User[]; total: number; page: number; limit: number; }> {
    const { page, limit, role, search, userName, email } = params;
    const where: any = { deletedAt: null };
    if (role) where.role = role;
    if (userName) where.userName = { contains: userName, mode: 'insensitive' };
    if (email) where.email = { contains: email, mode: 'insensitive' };
    if (search) {
      where.OR = [
        { userName: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, data] = await this.prisma.$transaction([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return { data, total, page, limit };
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
      data: { deletedAt: new Date(), active: false },
    });
  }

  async blockUser(id: string, blockedUntil?: Date): Promise<User> {
    return this.prisma.user.update({
      where: { userId: id },
      data: { blocked: true, blockedUntil: blockedUntil ?? null },
    });
  }

  async unblockUser(id: string): Promise<User> {
    return this.prisma.user.update({
      where: { userId: id },
      data: { blocked: false, blockedUntil: null },
    });
  }

  async restoreUser(id: string): Promise<User> {
    return this.prisma.user.update({
      where: { userId: id },
      data: { deletedAt: null, active: true },
    });
  }
}
