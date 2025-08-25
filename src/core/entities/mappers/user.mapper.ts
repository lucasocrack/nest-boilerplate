import { User as PrismaUser, Role as PrismaRole } from '@prisma/client';
import { UserEntity, UserRole } from '../user.entity';

/**
 * Mapper para converter entre modelo Prisma e entidade de domínio User
 */
export class UserMapper {
  /**
   * Converte modelo Prisma para entidade de domínio
   */
  static toDomain(prismaUser: PrismaUser): UserEntity {
    return new UserEntity({
      userId: prismaUser.userId,
      userName: prismaUser.userName || undefined,
      name: prismaUser.name,
      email: prismaUser.email,
      cpf: prismaUser.cpf || undefined,
      telefone: prismaUser.telefone || undefined,
      avatarUrl: prismaUser.avatarUrl || undefined,
      role: this.mapPrismaRoleToUserRole(prismaUser.role),
      password: prismaUser.password || undefined,
      lastLogin: prismaUser.lastLogin || undefined,
      tokenVersion: prismaUser.tokenVersion,
      refreshToken: prismaUser.refreshToken || undefined,
      passwordResetToken: prismaUser.passwordResetToken || undefined,
      passwordResetExpires: prismaUser.passwordResetExpires || undefined,
      activationToken: prismaUser.activationToken || undefined,
      activationTokenExpires: prismaUser.activationTokenExpires || undefined,
      active: prismaUser.active,
      blocked: prismaUser.blocked,
      blockedUntil: prismaUser.blockedUntil || undefined,
      loginAttempts: prismaUser.loginAttempts,
      lastFailedLogin: prismaUser.lastFailedLogin || undefined,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
      deletedAt: prismaUser.deletedAt || undefined,
    });
  }

  /**
   * Converte entidade de domínio para modelo Prisma (para criação)
   */
  static toPrismaCreate(
    userEntity: Partial<UserEntity>,
  ): Omit<PrismaUser, 'userId' | 'createdAt' | 'updatedAt'> {
    return {
      userName: userEntity.userName!,
      name: userEntity.name!,
      email: userEntity.email!,
      cpf: userEntity.cpf || null,
      telefone: userEntity.telefone || null,
      avatarUrl: userEntity.avatarUrl || null,
      role: this.mapUserRoleToPrismaRole(userEntity.role || UserRole.CLIENTE),
      password: userEntity.password || null,
      lastLogin: userEntity.lastLogin || null,
      tokenVersion: userEntity.tokenVersion || 1,
      refreshToken: userEntity.refreshToken || null,
      passwordResetToken: userEntity.passwordResetToken || null,
      passwordResetExpires: userEntity.passwordResetExpires || null,
      activationToken: userEntity.activationToken || null,
      activationTokenExpires: userEntity.activationTokenExpires || null,
      active: userEntity.active ?? false,
      blocked: userEntity.blocked ?? false,
      blockedUntil: userEntity.blockedUntil || null,
      loginAttempts: userEntity.loginAttempts || 0,
      lastFailedLogin: userEntity.lastFailedLogin || null,
      deletedAt: userEntity.deletedAt || null,
    };
  }

  /**
   * Converte entidade de domínio para dados de atualização Prisma
   */
  static toPrismaUpdate(userEntity: Partial<UserEntity>): Partial<PrismaUser> {
    const updateData: Partial<PrismaUser> = {};

    if (userEntity.userName !== undefined)
      updateData.userName = userEntity.userName;
    if (userEntity.name !== undefined) updateData.name = userEntity.name;
    if (userEntity.email !== undefined) updateData.email = userEntity.email;
    if (userEntity.cpf !== undefined) updateData.cpf = userEntity.cpf || null;
    if (userEntity.telefone !== undefined)
      updateData.telefone = userEntity.telefone || null;
    if (userEntity.avatarUrl !== undefined)
      updateData.avatarUrl = userEntity.avatarUrl || null;
    if (userEntity.role !== undefined)
      updateData.role = this.mapUserRoleToPrismaRole(userEntity.role);
    if (userEntity.password !== undefined)
      updateData.password = userEntity.password || null;
    if (userEntity.lastLogin !== undefined)
      updateData.lastLogin = userEntity.lastLogin || null;
    if (userEntity.tokenVersion !== undefined)
      updateData.tokenVersion = userEntity.tokenVersion;
    if (userEntity.refreshToken !== undefined)
      updateData.refreshToken = userEntity.refreshToken || null;
    if (userEntity.passwordResetToken !== undefined)
      updateData.passwordResetToken = userEntity.passwordResetToken || null;
    if (userEntity.passwordResetExpires !== undefined)
      updateData.passwordResetExpires = userEntity.passwordResetExpires || null;
    if (userEntity.activationToken !== undefined)
      updateData.activationToken = userEntity.activationToken || null;
    if (userEntity.activationTokenExpires !== undefined)
      updateData.activationTokenExpires =
        userEntity.activationTokenExpires || null;
    if (userEntity.active !== undefined) updateData.active = userEntity.active;
    if (userEntity.blocked !== undefined)
      updateData.blocked = userEntity.blocked;
    if (userEntity.blockedUntil !== undefined)
      updateData.blockedUntil = userEntity.blockedUntil || null;
    if (userEntity.loginAttempts !== undefined)
      updateData.loginAttempts = userEntity.loginAttempts;
    if (userEntity.lastFailedLogin !== undefined)
      updateData.lastFailedLogin = userEntity.lastFailedLogin || null;
    if (userEntity.deletedAt !== undefined)
      updateData.deletedAt = userEntity.deletedAt || null;

    return updateData;
  }

  /**
   * Converte array de modelos Prisma para array de entidades de domínio
   */
  static toDomainArray(prismaUsers: PrismaUser[]): UserEntity[] {
    return prismaUsers.map((user) => this.toDomain(user));
  }

  /**
   * Mapeia Role do Prisma para UserRole da entidade
   */
  private static mapPrismaRoleToUserRole(prismaRole: PrismaRole): UserRole {
    switch (prismaRole) {
      case PrismaRole.CLIENTE:
        return UserRole.CLIENTE;
      case PrismaRole.FUNCIONARIO:
        return UserRole.FUNCIONARIO;
      case PrismaRole.GERENTE:
        return UserRole.GERENTE;
      case PrismaRole.ADMIN:
        return UserRole.ADMIN;
      case PrismaRole.SUPERADMIN:
        return UserRole.SUPERADMIN;
      default:
        return UserRole.CLIENTE;
    }
  }

  /**
   * Mapeia UserRole da entidade para Role do Prisma
   */
  private static mapUserRoleToPrismaRole(userRole: UserRole): PrismaRole {
    switch (userRole) {
      case UserRole.CLIENTE:
        return PrismaRole.CLIENTE;
      case UserRole.FUNCIONARIO:
        return PrismaRole.FUNCIONARIO;
      case UserRole.GERENTE:
        return PrismaRole.GERENTE;
      case UserRole.ADMIN:
        return PrismaRole.ADMIN;
      case UserRole.SUPERADMIN:
        return PrismaRole.SUPERADMIN;
      default:
        return PrismaRole.CLIENTE;
    }
  }
}
