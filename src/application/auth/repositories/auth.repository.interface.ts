import { User } from '@prisma/client';

export const AUTH_REPOSITORY_TOKEN = 'AUTH_REPOSITORY_TOKEN';

export interface IAuthRepository {
  createUser(
    userData: Omit<User, 'userId' | 'createdAt' | 'updatedAt'>,
  ): Promise<User>;
  findUserByPasswordResetToken(token: string): Promise<User | null>;
  findUserByActivationToken(token: string): Promise<User | null>;
  findUserByEmail(email: string): Promise<User | null>;
  updateRefreshToken(
    userId: string,
    refreshToken: string | null,
  ): Promise<User>;
  updateUserTokens(
    userId: string,
    data: {
      refreshToken?: string | null;
      tokenVersion?: number;
      passwordResetToken?: string | null;
      passwordResetExpires?: Date | null;
      activationToken?: string | null;
      activationTokenExpires?: Date | null;
    },
  ): Promise<User>;
  updateUserPassword(userId: string, hashedPassword: string): Promise<User>;
  activateUser(userId: string): Promise<User>;
  incrementTokenVersion(userId: string): Promise<User>;
}
