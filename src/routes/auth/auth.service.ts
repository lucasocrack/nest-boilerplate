import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { UnauthorizedError } from './errors/unauthorized.error';
import { User } from '../../entities/user.entity';
import { UserPayload } from './models/UserPayload';
import { JwtService } from '@nestjs/jwt';
import { UserToken } from './models/UserToken';
import { RegisterUserDto } from './dto/register-user.dto';
import { PrismaService } from '../../services/prisma/prisma.service';
import { EmailService } from '../../services/email/email.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginAuthDto: LoginAuthDto): Promise<UserToken> {
    const { identifier, password } = loginAuthDto;
    const user = await this.validateUser(identifier, password);
    const payload = this.createUserPayload(user);
    const { password: userPassword, ...userWithoutPassword } = user;

    return {
      access_token: this.jwtService.sign(payload),
      user: userWithoutPassword,
    };
  }

  async validateUser(identifier: string, password: string) {
    const user = await this.userService.findOneByEmailOrUsername(identifier);
    if (
      user &&
      user.deletedAt === null &&
      user.isActive &&
      (await this.isPasswordValid(password, user.password))
    ) {
      return { ...user, password: undefined };
    }
    throw new UnauthorizedError(
      user && user.deletedAt !== null
        ? 'User account is deleted.'
        : user && !user.isActive
          ? 'User account is not activated.'
          : 'Email address or password provided is incorrect.',
      user && user.deletedAt !== null ? 403 : 401,
    );
  }

  async register(registerUserDto: RegisterUserDto) {
    const { email, username, cpfCnpj, password, role } = registerUserDto;

    await this.validateUniqueEmail(email);
    await this.validateUniqueUsername(username);
    await this.validateUniqueCpfCnpj(cpfCnpj);

    const hashedPassword = await this.hashPassword(password);

    const createdUser = await this.prisma.user.create({
      data: { email, username, cpfCnpj, password: hashedPassword, role },
    });

    const activationLink = this.generateActivationLink(createdUser.id);

    await this.emailService.sendRegistrationEmail(email, {
      name: username,
      activationLink,
    });

    return { ...createdUser, password: undefined };
  }

  async activateAccount(token: string): Promise<void> {
    try {
      const payload = this.jwtService.verify(token);
      const userId = payload.sub;

      const user = await this.prisma.user.update({
        where: { id: userId },
        data: { isActive: true },
      });

      if (!user) {
        throw new UnauthorizedError('Invalid token');
      }
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired token');
    }
  }

  private createUserPayload(user: User): UserPayload {
    return {
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };
  }

  private async isPasswordValid(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  private async validateUniqueEmail(email: string) {
    const user = await this.userService.findOneByEmail(email);
    if (user) {
      throw new UnauthorizedError('Email address is already in use.', 400);
    }
  }

  private async validateUniqueUsername(username: string) {
    const user = await this.userService.findOneByUsername(username);
    if (user) {
      throw new UnauthorizedError('Username is already in use.', 400);
    }
  }

  private async validateUniqueCpfCnpj(cpfCnpj: string) {
    if (!cpfCnpj) {
      return;
    }

    const user = await this.userService.findOneByCpfCnpj(cpfCnpj);
    if (user) {
      throw new UnauthorizedError('CPF/CNPJ já está em uso.', 400);
    }
  }

  private generateActivationLink(userId: string): string {
    const payload = { sub: userId };
    const token = this.jwtService.sign(payload, { expiresIn: '1h' });
    const domain = this.configService.get<string>('DOMAIN');
    return `${domain}/activate?token=${token}`;
  }
}
