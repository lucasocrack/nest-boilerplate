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
import { MailService } from '../../core/mail/mail.service';
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
    // Ex: '7d' via env JWT_REFRESH_TTL (fallback para REFRESH_TOKEN_TTL)
    return (
      this.configService.get<string>('JWT_REFRESH_TTL') ||
      this.configService.get<string>('REFRESH_TOKEN_TTL') ||
      '7d'
    );
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

  private async handleFailedLogin(user: User, loginDetails?: { ip: string; userAgent: string }): Promise<void> {
    const maxAttempts = 5;
    const lockoutDuration = 15 * 60 * 1000; // 15 minutos em millisegundos
    
    const newAttempts = user.loginAttempts + 1;
    const updateData: any = {
      loginAttempts: newAttempts,
      lastFailedLogin: new Date(),
    };

    // Enviar alerta de múltiplas tentativas se estiver próximo do limite
    if (newAttempts >= 3) {
      await this.mailService.sendMultipleLoginAttemptsAlert(user, newAttempts);
    }

    // Se atingiu o máximo de tentativas, bloquear a conta
    if (newAttempts >= maxAttempts) {
      updateData.blocked = true;
      updateData.blockedUntil = new Date(Date.now() + lockoutDuration);
      updateData.loginAttempts = 0; // Reset contador após bloqueio
      
      // Enviar alerta de conta bloqueada
      await this.mailService.sendAccountBlockedAlert(user, '15 minutos');
    }

    await this.userService.update(user.userId, updateData);
  }

  private async handleSuccessfulLogin(user: User): Promise<void> {
    const updateData: any = {
      lastLogin: new Date(),
      loginAttempts: 0, // Reset contador de tentativas
    };

    // Se estava bloqueado temporariamente, desbloquear
    if (user.blocked && user.blockedUntil && user.blockedUntil <= new Date()) {
      updateData.blocked = false;
      updateData.blockedUntil = null;
    }

    await this.userService.update(user.userId, updateData);
  }

  async signIn(
    identification: string,
    pass: string,
    loginDetails?: { ip: string; userAgent: string }
  ): Promise<{ access_token: string; refresh_token: string }> {
    const user = await this.userService.findByIdentification(identification);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }
    
    // Verificar se a conta está excluída
    if (user.deletedAt) {
      throw new UnauthorizedException('Conta excluída.');
    }
    
    // Verificar se a conta está ativa
    if (!user.active) {
      throw new UnauthorizedException('Conta inativa.');
    }
    
    // Verificar se a conta está bloqueada
    if (user.blocked) {
      // Se o bloqueio expirou, desbloquear automaticamente
      if (user.blockedUntil && user.blockedUntil <= new Date()) {
        await this.userService.update(user.userId, {
          blocked: false,
          blockedUntil: null,
          loginAttempts: 0,
        });
      } else {
        throw new UnauthorizedException(
          `Conta temporariamente bloqueada devido a muitas tentativas de login. Tente novamente em alguns minutos.`
        );
      }
    }
    
    if (!user.password) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }
    
    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      // Registrar tentativa de login falhada
      await this.handleFailedLogin(user, loginDetails);
      
      // Verificar se a conta foi bloqueada após esta tentativa
      const updatedUser = await this.userService.findByIdentification(identification);
      if (updatedUser?.blocked) {
        throw new UnauthorizedException(
          'Muitas tentativas de login incorretas. Conta temporariamente bloqueada.'
        );
      }
      
      throw new UnauthorizedException('Credenciais inválidas.');
    }
    
    // Login bem-sucedido - verificar se é suspeito
    if (loginDetails && this.isSuspiciousLogin(user, loginDetails)) {
      await this.mailService.sendSuspiciousLoginAlert(user, {
        ...loginDetails,
        timestamp: new Date()
      });
    }
    
    await this.handleSuccessfulLogin(user);
    return this.issueTokens(user);
  }

  private isSuspiciousLogin(user: User, loginDetails: { ip: string; userAgent: string }): boolean {
    // Critérios simples para detectar login suspeito:
    // 1. Primeiro login do usuário
    // 2. Login após muito tempo inativo (mais de 30 dias)
    // 3. Mudança significativa no User-Agent
    
    if (!user.lastLogin) {
      return false; // Primeiro login não é suspeito
    }
    
    const daysSinceLastLogin = Math.floor(
      (Date.now() - user.lastLogin.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    // Login após mais de 30 dias de inatividade
    if (daysSinceLastLogin > 30) {
      return true;
    }
    
    // Aqui você pode adicionar mais lógica de detecção:
    // - Verificar se o IP está em uma lista de IPs conhecidos
    // - Verificar geolocalização do IP
    // - Analisar padrões de User-Agent
    
    return false;
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
