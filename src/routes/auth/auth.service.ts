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

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
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
      (await this.isPasswordValid(password, user.password))
    ) {
      return { ...user, password: undefined };
    }
    throw new UnauthorizedError(
      user && user.deletedAt !== null
        ? 'User account is deleted.'
        : 'Email address or password provided is incorrect.',
      user && user.deletedAt !== null ? 403 : 401,
    );
  }

  async register(registerUserDto: RegisterUserDto) {
    const { email, username, cpf, password, role } = registerUserDto;

    await this.validateUniqueEmail(email);
    await this.validateUniqueUsername(username);
    await this.validateUniqueCpf(cpf);

    const hashedPassword = await this.hashPassword(password);

    const createdUser = await this.prisma.user.create({
      data: { email, username, cpf, password: hashedPassword, role },
    });

    await this.emailService.sendRegistrationEmail(email, {
      name: username,
      activationLink: `https://example.com/activate?token=someToken`,
    });

    return { ...createdUser, password: undefined };
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

  private async validateUniqueCpf(cpf: string) {
    const user = await this.userService.findOneByCpf(cpf);
    if (user) {
      throw new UnauthorizedError('CPF is already in use.', 400);
    }
  }
}
