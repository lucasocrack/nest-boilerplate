import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../../../core/config/prisma.service';
import { IAuthRepository } from './auth.repository.interface';

@Injectable()
export class AuthRepository implements IAuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(
    userData: Omit<User, 'userId' | 'createdAt' | 'updatedAt'>,
  ): Promise<User> {
    return this.prisma.user.create({
      data: userData,
    });
  }

  async findUserByPasswordResetToken(token: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: { gte: new Date() },
      },
    });
  }

  async findUserByActivationToken(token: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        activationToken: token,
        activationTokenExpires: { gte: new Date() },
        active: false,
      },
    });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string | null,
  ): Promise<User> {
    return this.prisma.user.update({
      where: { userId },
      data: { refreshToken },
    });
  }

  async updateUserTokens(
    userId: string,
    data: {
      refreshToken?: string | null;
      tokenVersion?: number;
      passwordResetToken?: string | null;
      passwordResetExpires?: Date | null;
      activationToken?: string | null;
      activationTokenExpires?: Date | null;
    },
  ): Promise<User> {
    const updateData: {
      refreshToken?: string | null;
      tokenVersion?: number;
      passwordResetToken?: string | null;
      passwordResetExpires?: Date | null;
      activationToken?: string | null;
      activationTokenExpires?: Date | null;
    } = {};

    if (data.refreshToken !== undefined)
      updateData.refreshToken = data.refreshToken;
    if (data.tokenVersion !== undefined)
      updateData.tokenVersion = data.tokenVersion;
    if (data.passwordResetToken !== undefined)
      updateData.passwordResetToken = data.passwordResetToken;
    if (data.passwordResetExpires !== undefined)
      updateData.passwordResetExpires = data.passwordResetExpires;
    if (data.activationToken !== undefined)
      updateData.activationToken = data.activationToken;
    if (data.activationTokenExpires !== undefined)
      updateData.activationTokenExpires = data.activationTokenExpires;

    return this.prisma.user.update({
      where: { userId },
      data: updateData,
    });
  }

  async updateUserPassword(
    userId: string,
    hashedPassword: string,
  ): Promise<User> {
    return this.prisma.user.update({
      where: { userId },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
        tokenVersion: { increment: 1 },
        refreshToken: null,
      },
    });
  }

  async activateUser(userId: string): Promise<User> {
    return this.prisma.user.update({
      where: { userId },
      data: {
        active: true,
        activationToken: null,
        activationTokenExpires: null,
      },
    });
  }

  async incrementTokenVersion(userId: string): Promise<User> {
    return this.prisma.user.update({
      where: { userId },
      data: {
        tokenVersion: { increment: 1 },
        refreshToken: null,
      },
    });
  }
}
