import { Injectable, Inject } from '@nestjs/common';
import { CreateUserDto } from '../auth/dto/create-auth.dto';
import { User, Role } from '@prisma/client';
import { IUserRepository } from './repositories/user.repository.interface';

/**
 * Service responsável pela lógica de negócio relacionada aos usuários
 * Utiliza o padrão Repository para separar a lógica de negócio do acesso a dados
 */
@Injectable()
export class UserService {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
  ) {}

  async createUser(data: CreateUserDto): Promise<User> {
    return this.userRepository.create(data);
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
