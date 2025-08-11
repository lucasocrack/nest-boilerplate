import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-auth.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ActivateAccountDto } from './dto/activate-account.dto';
import * as crypto from 'crypto';
import { User } from '@prisma/client';
import { MailService } from 'src/core/mail/mail.service';
import { PrismaService } from '../../core/config/prisma.service';
import { ValidationUtils } from '../../core/utils/validation.utils';
import {
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '../../core/exceptions/custom-exceptions';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private mailService: MailService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  private getActivationTokenExpiration(): Date {
    const hoursToExpire = Number(this.configService.get('ACTIVATION_TOKEN_EXPIRY_HOURS', '24'));
    return new Date(Date.now() + hoursToExpire * 60 * 60 * 1000);
  }

  private getRefreshTokenExpiry(): string {
    // Ex: '7d' via env REFRESH_TOKEN_TTL
    return this.configService.get<string>('REFRESH_TOKEN_TTL') || '7d';
  }

  private async signAccessToken(user: User): Promise<string> {
    const payload = {
      sub: user.userId,
      username: user.userName,
      tokenVersion: user.tokenVersion,
    };
    return this.jwtService.signAsync(payload);
  }

  private async signRefreshToken(user: User): Promise<string> {
    const payload = {
      sub: user.userId,
      tv: user.tokenVersion,
      type: 'refresh',
    };
    return this.jwtService.signAsync(payload, {
      expiresIn: this.getRefreshTokenExpiry(),
      secret: this.configService.get<string>('JWT_REFRESH_SECRET') || (process.env.JWT_SECRET || 'default-secret'),
    });
  }

  async issueTokens(user: User) {
    const access_token = await this.signAccessToken(user);
    const refresh_token = await this.signRefreshToken(user);

    // opcional: persistir hash do refreshToken
    await this.prisma.user.update({
      where: { userId: user.userId },
      data: { refreshToken: refresh_token },
    });

    return { access_token, refresh_token };
  }

  async register(
    createUserDto: CreateUserDto,
  ): Promise<Omit<User, 'password' | 'activationToken'> & { message: string }> {
    // Validar CPF se fornecido
    if (createUserDto.cpf) {
      const normalizedCpf = ValidationUtils.normalizeCpf(createUserDto.cpf);
      if (!ValidationUtils.isValidCpf(normalizedCpf)) {
        throw new BadRequestException('CPF inválido');
      }
      createUserDto.cpf = normalizedCpf; // Normalizar CPF antes de continuar
    }

    // Verificar se o usuário já existe
    const existingUser = await this.userService.checkUserExists({
      userName: createUserDto.userName,
      email: createUserDto.email,
      cpf: createUserDto.cpf,
    });

    const errors: string[] = [];
    
    if (existingUser.userNameExists) {
      errors.push('Username já está em uso');
    }
    
    if (existingUser.emailExists) {
      errors.push('Email já está cadastrado');
    }
    
    if (existingUser.cpfExists) {
      errors.push('CPF já está cadastrado');
    }

    if (errors.length > 0) {
      throw new ConflictException(`Dados já existem no sistema: ${errors.join(', ')}`);
    }

    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      saltOrRounds,
    );

    const activationToken = crypto.randomBytes(32).toString('hex');
    const activationTokenExpires = this.getActivationTokenExpiration();

    const result = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
        active: false,
        activationToken,
        activationTokenExpires,
      },
    });

    await this.mailService.sendActivationEmail(result, activationToken);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, activationToken: token, ...user } = result;
    return {
      ...user,
      message: 'Usuário registrado com sucesso. Verifique seu email para ativar a conta.',
    };
  }

  async signIn(
    username: string,
    pass: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
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
    return this.issueTokens(user);
  }

  async refreshToken(token: string): Promise<{ access_token: string; refresh_token: string }> {
    try {
      const payload = await this.jwtService.verifyAsync<{ sub: string; tv: number; type: string }>(token, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET') || (process.env.JWT_SECRET || 'default-secret'),
      });
      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Token inválido');
      }
      const user = await this.prisma.user.findUnique({ where: { userId: payload.sub } });
      if (!user) throw new UnauthorizedException('Usuário não encontrado');
      if (user.tokenVersion !== payload.tv) {
        throw new UnauthorizedException('Refresh token expirado/invalidado');
      }
      return this.issueTokens(user);
    } catch {
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }
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

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    const { token, password, passwordConfirmation } = resetPasswordDto;

    if (password !== passwordConfirmation) {
      throw new BadRequestException('As senhas não conferem.');
    }

    // O token enviado é aleatório; validar comparando o hash sha256 salvo no banco
    const passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetToken,
        passwordResetExpires: { gte: new Date() },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Token inválido ou expirado.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await this.prisma.user.update({
      where: { userId: user.userId },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
        // invalidar refresh tokens existentes
        tokenVersion: { increment: 1 },
        refreshToken: null,
      },
    });

    return { message: 'Redefinição de senha com sucesso' };
  }

  async activateAccount(activateDto: ActivateAccountDto): Promise<{ message: string }> {
    const { token } = activateDto;

    const user = await this.prisma.user.findFirst({
      where: {
        activationToken: token,
        activationTokenExpires: {
          gte: new Date(),
        },
        active: false,
      },
    });

    if (!user) {
      throw new BadRequestException('Token de ativação inválido ou expirado');
    }

    await this.prisma.user.update({
      where: { userId: user.userId },
      data: {
        active: true,
        activationToken: null,
        activationTokenExpires: null,
      },
    });

    return { message: 'Conta ativada com sucesso! Você já pode fazer login.' };
  }

  async resendActivationEmail(email: string): Promise<{ message: string }> {
    // Buscar usuário pelo email
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (user.active) {
      throw new BadRequestException('Esta conta já está ativada');
    }

    // Gerar novo token de ativação
    const activationToken = crypto.randomBytes(32).toString('hex');
    const activationTokenExpires = this.getActivationTokenExpiration();

    // Atualizar o token no banco
    await this.prisma.user.update({
      where: { userId: user.userId },
      data: {
        activationToken,
        activationTokenExpires,
      },
    });

    // Enviar email de ativação
    await this.mailService.sendActivationEmail(
      { ...user, activationToken, activationTokenExpires },
      activationToken,
    );

    return { message: 'Email de ativação reenviado com sucesso' };
  }

  async logout(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { userId },
      data: {
        tokenVersion: { increment: 1 },
        refreshToken: null,
      },
    });
  }

  async validateUser(identifier: string, password: string) {
    const user = await this.userService.findOneByEmail(identifier);
    if (user && user.deletedAt === null) {
      if (!user.active) {
        await this.mailService.sendUserConfirmation(user);
        throw new UnauthorizedException('A conta do usuário não está ativada. Um e-mail de ativação foi enviado.');
      }
      if (!user.password) {
        throw new UnauthorizedException('Senha não definida para este usuário.');
      }
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid) {
        return { ...user, password: undefined };
      }
    }
    throw new UnauthorizedException(
      user && user.deletedAt !== null
        ? 'A conta do usuário foi excluída.'
        : 'A identificação e ou a senha fornecidos estão incorretos.',
    );
  }
}
