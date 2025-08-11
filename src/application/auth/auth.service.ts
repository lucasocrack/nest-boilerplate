import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
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
      throw new ConflictException({
        message: 'Dados já existem no sistema',
        errors: errors,
      });
    }

    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      saltOrRounds,
    );

    // Gerar token de ativação
    const activationToken = crypto.randomBytes(32).toString('hex');
    const activationTokenExpires = this.getActivationTokenExpiration();

    const result = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
        active: false, // Usuário inativo por padrão
        activationToken,
        activationTokenExpires,
      },
    });

    // Sempre enviar email de ativação
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
      username: user.userName,
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

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    const { token, password, passwordConfirmation } = resetPasswordDto;

    if (password !== passwordConfirmation) {
      throw new BadRequestException('As senhas não conferem.');
    }

    let payload: { sub: string };
    try {
      payload = this.jwtService.verify<{ sub: string }>(token);
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado.');
    }

    const userId = payload.sub;
    const hashedPassword = await bcrypt.hash(password, 10);

    await this.prisma.user.update({
      where: { userId },
      data: { password: hashedPassword },
    });

    return { message: 'Redefinição de senha com sucesso' };
  }

  async activateAccount(activateDto: ActivateAccountDto): Promise<{ message: string }> {
    const { token } = activateDto;

    // Buscar usuário pelo token de ativação
    const user = await this.prisma.user.findFirst({
      where: {
        activationToken: token,
        activationTokenExpires: {
          gte: new Date(), // Token não expirado
        },
        active: false, // Só ativar contas inativas
      },
    });

    if (!user) {
      throw new BadRequestException('Token de ativação inválido ou expirado');
    }

    // Ativar a conta e limpar o token
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
