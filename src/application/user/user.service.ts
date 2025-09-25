import {
  Injectable,
  Inject,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { CreateUserDto } from '../auth/dto/create-auth.dto';
import { CreateUserAdminDto } from './dto/create-user-admin.dto';
import { User, Role } from '@prisma/client';
import { IUserRepository } from './repositories/user.repository.interface';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { ValidationUtils } from '../../core/utils/validation.utils';

@Injectable()
export class UserService {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
  ) {}

  async createUser(data: CreateUserDto): Promise<User> {
    return this.userRepository.create(data);
  }

  async createUserAdmin(createUserAdminDto: CreateUserAdminDto): Promise<User> {
    if (
      createUserAdminDto.cpf &&
      !ValidationUtils.isValidCpf(createUserAdminDto.cpf)
    ) {
      throw new BadRequestException('CPF inválido');
    }

    const userExists = await this.userRepository.checkUserExists({
      userName: createUserAdminDto.userName,
      email: createUserAdminDto.email,
      cpf: createUserAdminDto.cpf,
    });

    if (userExists.userNameExists) {
      throw new ConflictException('Nome de usuário já existe');
    }

    if (userExists.emailExists) {
      throw new ConflictException('Email já está em uso');
    }

    if (userExists.cpfExists) {
      throw new ConflictException('CPF já está em uso');
    }

    const hashedPassword = await bcrypt.hash(createUserAdminDto.password, 12);

    let activationToken: string | null = null;
    let activationTokenExpires: Date | null = null;

    if (!createUserAdminDto.active) {
      activationToken = crypto.randomBytes(32).toString('hex');
      activationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }

    const userData: Omit<User, 'userId' | 'createdAt' | 'updatedAt'> = {
      userName: createUserAdminDto.userName,
      name: createUserAdminDto.name,
      email: createUserAdminDto.email,
      password: hashedPassword,
      cpf: createUserAdminDto.cpf || null,
      telefone: createUserAdminDto.telefone || null,
      avatarUrl: createUserAdminDto.avatarUrl || null,
      role: createUserAdminDto.role,
      active: createUserAdminDto.active ?? true,
      lastLogin: null,
      tokenVersion: 1,
      refreshToken: null,
      passwordResetToken: null,
      passwordResetExpires: null,
      activationToken,
      activationTokenExpires,
      blocked: false,
      blockedUntil: null,
      loginAttempts: 0,
      lastFailedLogin: null,
      deletedAt: null,
    };

    return this.userRepository.createAdmin(userData);
  }

  async findOneByUsername(userName: string): Promise<User | null> {
    return this.userRepository.findByUsername(userName);
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async findOneByCpf(cpf: string): Promise<User | null> {
    return this.userRepository.findByCpf(cpf);
  }

  async findByIdentification(identification: string): Promise<User | null> {
    return this.userRepository.findByIdentification(identification);
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
    return this.userRepository.checkUserExists(data);
  }

  async findOneByPasswordResetToken(token: string): Promise<User | null> {
    return this.userRepository.findByPasswordResetToken(token);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async findAllPaged(params: {
    page: number;
    limit: number;
    role?: Role;
    search?: string;
    userName?: string;
    email?: string;
  }): Promise<{ data: User[]; total: number; page: number; limit: number }> {
    return this.userRepository.findAllPaged(params);
  }

  async findOneById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    return this.userRepository.update(id, data);
  }

  async remove(id: string): Promise<User> {
    return this.userRepository.remove(id);
  }

  async blockUser(id: string, blockedUntil?: Date): Promise<User> {
    return this.userRepository.blockUser(id, blockedUntil);
  }

  async unblockUser(id: string): Promise<User> {
    return this.userRepository.unblockUser(id);
  }

  async restoreUser(id: string): Promise<User> {
    return this.userRepository.restoreUser(id);
  }
}
