import { User, Role } from '@prisma/client';
import { CreateUserDto } from '../../auth/dto/create-auth.dto';

/**
 * Interface que define os contratos para operações de dados do usuário
 * Seguindo o padrão Repository Pattern para separar lógica de negócio do acesso a dados
 */
export interface IUserRepository {
  // Operações de criação
  create(data: CreateUserDto): Promise<User>;
  createAdmin(
    data: Omit<User, 'userId' | 'createdAt' | 'updatedAt'>,
  ): Promise<User>;

  // Operações de busca
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByUsername(userName: string): Promise<User | null>;
  findByCpf(cpf: string): Promise<User | null>;
  findByIdentification(identification: string): Promise<User | null>;
  findByPasswordResetToken(token: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  findAllPaged(params: {
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
  }>;

  // Operações de atualização
  update(id: string, data: Partial<User>): Promise<User>;
  blockUser(id: string, blockedUntil?: Date): Promise<User>;
  unblockUser(id: string): Promise<User>;
  restoreUser(id: string): Promise<User>;

  // Operações de remoção
  remove(id: string): Promise<User>;

  // Operações de verificação
  checkUserExists(data: {
    userName?: string;
    email?: string;
    cpf?: string;
  }): Promise<{
    userNameExists: boolean;
    emailExists: boolean;
    cpfExists: boolean;
  }>;
}
