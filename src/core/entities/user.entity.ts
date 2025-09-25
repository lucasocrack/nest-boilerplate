/**
 * Entidade User - Representação tipada independente do modelo Prisma
 * Esta entidade define a estrutura de dados do usuário para a camada de domínio
 */
export class UserEntity {
  userId: string;
  userName?: string;
  name: string;
  email: string;
  cpf?: string;
  telefone?: string;
  avatarUrl?: string;
  role: UserRole;

  // Campos de Segurança
  password?: string;
  lastLogin?: Date;
  tokenVersion: number;
  refreshToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  activationToken?: string;
  activationTokenExpires?: Date;

  // Campos de Controle
  active: boolean;
  blocked: boolean;
  blockedUntil?: Date;
  loginAttempts: number;
  lastFailedLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;

  constructor(data: Partial<UserEntity>) {
    Object.assign(this, data);
  }

  /**
   * Verifica se o usuário está ativo
   */
  isActive(): boolean {
    return this.active && !this.blocked && !this.deletedAt;
  }

  /**
   * Verifica se o usuário está bloqueado
   */
  isBlocked(): boolean {
    if (!this.blocked) return false;
    if (!this.blockedUntil) return true;
    return new Date() < this.blockedUntil;
  }

  /**
   * Verifica se o token de reset de senha é válido
   */
  isPasswordResetTokenValid(): boolean {
    return (
      !!this.passwordResetToken &&
      !!this.passwordResetExpires &&
      new Date() < this.passwordResetExpires
    );
  }

  /**
   * Verifica se o token de ativação é válido
   */
  isActivationTokenValid(): boolean {
    return (
      !!this.activationToken &&
      !!this.activationTokenExpires &&
      new Date() < this.activationTokenExpires
    );
  }

  /**
   * Remove dados sensíveis para retorno público
   */
  toPublic() {
    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      password,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      refreshToken,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      passwordResetToken,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      activationToken,
      ...publicData
    } = this;
    return publicData;
  }
}

/**
 * Enum para os papéis do usuário
 */
export enum UserRole {
  CLIENTE = 'CLIENTE',
  FUNCIONARIO = 'FUNCIONARIO',
  GERENTE = 'GERENTE',
  ADMIN = 'ADMIN',
  SUPERADMIN = 'SUPERADMIN',
}

/**
 * Tipo para criação de usuário (sem campos gerados automaticamente)
 */
export type CreateUserData = Omit<
  UserEntity,
  | 'userId'
  | 'createdAt'
  | 'updatedAt'
  | 'tokenVersion'
  | 'loginAttempts'
  | 'active'
  | 'blocked'
>;

/**
 * Tipo para atualização de usuário (campos opcionais)
 */
export type UpdateUserData = Partial<
  Omit<UserEntity, 'userId' | 'createdAt' | 'updatedAt'>
>;
