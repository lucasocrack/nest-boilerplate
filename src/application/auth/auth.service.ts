import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-auth.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import * as crypto from 'crypto';
import { User } from '@prisma/client';
import { MailService } from 'src/core/mail/mail.service';
import { PrismaService } from '../../core/config/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private mailService: MailService,
    private readonly prisma: PrismaService,
  ) {}

  async register(
    createUserDto: CreateUserDto,
  ): Promise<Omit<User, 'password'>> {
    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      saltOrRounds,
    );
    const result = await this.userService.createUser({
      ...createUserDto,
      password: hashedPassword,
      active: true,
    });

    if (createUserDto.sendEmail) {
      await this.mailService.sendUserConfirmation(result);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...user } = result;
    return user;
  }

  async signIn(
    username: string,
    pass: string,
  ): Promise<{ access_token: string }> {
    const user = await this.userService.findOneByUsername(username);
    if (!user || !user.active) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }
    if (!user.password) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }
    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }
    await this.userService.update(user.userId, { lastLogin: new Date() });
    const payload = {
      sub: user.userId,
      username: user.username,
      tokenVersion: user.tokenVersion,
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string; token: string }> {
    const user = await this.userService.findOneByEmail(forgotPasswordDto.email);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    const passwordResetExpires = new Date(Date.now() + 3600000); // 1 hora

    await this.userService.update(user.userId, {
      passwordResetToken,
      passwordResetExpires,
    });

    return {
      message:
        'Token de redefinição de senha gerado com sucesso. Verifique seu e-mail.',
      token: resetToken,
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    const { token, password, passwordConfirmation } = resetPasswordDto;

    if (password !== passwordConfirmation) {
      throw new BadRequestException('As senhas não conferem.');
    }

    const passwordResetToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user =
      await this.userService.findOneByPasswordResetToken(passwordResetToken);

    if (!user) {
      throw new BadRequestException('Token de redefinição de senha inválido.');
    }

    if (!user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      throw new BadRequestException('Token de redefinição de senha expirado.');
    }

    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltOrRounds);

    await this.userService.update(user.userId, {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
      tokenVersion: user.tokenVersion + 1,
    });
  }

  async logout(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { userId },
      data: {
        tokenVersion: { increment: 1 },
      },
    });
  }
}
