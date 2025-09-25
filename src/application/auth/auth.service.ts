import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ActivateAccountDto } from './dto/activate-account.dto';
import * as crypto from 'crypto';
import { User } from '@prisma/client';
import { MailService } from '../../core/mail/mail.service';
import { ValidationUtils } from '../../core/utils/validation.utils';
import {
  IAuthRepository,
  AUTH_REPOSITORY_TOKEN,
} from './repositories/auth.repository.interface';
import {
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '../../core/exceptions/custom-exceptions';
import { SecurityLoggerService } from '../../core/security/security-logger.service';
import { AuditTrailService } from '../../core/audit/audit-trail.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private mailService: MailService,
    @Inject(AUTH_REPOSITORY_TOKEN)
    private readonly authRepository: IAuthRepository,
    private readonly configService: ConfigService,
    private readonly securityLogger: SecurityLoggerService,
    private readonly auditTrailService: AuditTrailService,
  ) {}

  private getActivationTokenExpiration(): Date {
    const hoursToExpire = Number(
      this.configService.get('ACTIVATION_TOKEN_EXPIRY_HOURS', '24'),
    );
    return new Date(Date.now() + hoursToExpire * 60 * 60 * 1000);
  }

  private getRefreshTokenExpiry(): string {
    return (
      this.configService.get<string>('JWT_REFRESH_TTL') ||
      this.configService.get<string>('REFRESH_TOKEN_TTL') ||
      '7d'
    );
  }

  private async signAccessToken(user: User): Promise<string> {
    const payload = {
      sub: user.userId,
      username: user.userName || undefined,
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
      secret:
        this.configService.get<string>('JWT_REFRESH_SECRET') ||
        process.env.JWT_SECRET ||
        'default-secret',
    });
  }

  async issueTokens(user: User) {
    const access_token = await this.signAccessToken(user);
    const refresh_token = await this.signRefreshToken(user);

    await this.authRepository.updateRefreshToken(user.userId, refresh_token);

    return { access_token, refresh_token };
  }

  async register(
    registerDto: RegisterDto,
  ): Promise<Omit<User, 'password' | 'activationToken'> & { message: string }> {
    if (registerDto.cpf) {
      const normalizedCpf = ValidationUtils.normalizeCpf(registerDto.cpf);
      if (!ValidationUtils.isValidCpf(normalizedCpf)) {
        throw new BadRequestException('CPF inválido');
      }
      registerDto.cpf = normalizedCpf;
    }

    const existingUser = await this.userService.checkUserExists({
      userName: registerDto.userName,
      email: registerDto.email,
      cpf: registerDto.cpf,
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
      throw new ConflictException(
        `Dados já existem no sistema: ${errors.join(', ')}`,
      );
    }

    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(
      registerDto.password,
      saltOrRounds,
    );

    const activationToken = crypto.randomBytes(32).toString('hex');
    const activationTokenExpires = this.getActivationTokenExpiration();

    const result = await this.authRepository.createUser({
      ...registerDto,
      cpf: registerDto.cpf || null,
      telefone: registerDto.telefone || null,
      avatarUrl: null,
      role: 'CLIENTE',
      password: hashedPassword,
      active: false,
      activationToken,
      activationTokenExpires,
      lastLogin: null,
      tokenVersion: 1,
      refreshToken: null,
      passwordResetToken: null,
      passwordResetExpires: null,
      blocked: false,
      blockedUntil: null,
      loginAttempts: 0,
      lastFailedLogin: null,
      deletedAt: null,
    });

    await this.mailService.sendActivationEmail(result, activationToken);

    await this.auditTrailService.logCreate(
      'User',
      result.userId,
      {
        userName: result.userName,
        email: result.email,
        role: result.role,
        active: result.active,
      },
      undefined,
      'system',
      'public_registration',
      { action: 'public_user_registration', securityLevel: 'public' },
    );

    const { password, activationToken: token, ...user } = result;
    return {
      ...user,
      message:
        'Usuário registrado com sucesso. Verifique seu email para ativar a conta.',
    };
  }

  private async handleFailedLogin(
    user: User,
    ip?: string,
    userAgent?: string,
  ): Promise<void> {
    const maxAttempts = 5;
    const lockoutDuration = 15 * 60 * 1000;

    const newAttempts = user.loginAttempts + 1;
    const updateData: {
      loginAttempts: number;
      lastFailedLogin: Date;
      blocked?: boolean;
      blockedUntil?: Date;
    } = {
      loginAttempts: newAttempts,
      lastFailedLogin: new Date(),
    };

    this.securityLogger.logLoginAttempt({
      userId: user.userId,
      email: user.email,
      username: user.userName || undefined,
      ip,
      userAgent,
      success: false,
      reason: 'Senha incorreta',
      attempts: newAttempts,
      timestamp: new Date(),
    });

    if (newAttempts >= 3) {
      await this.mailService.sendMultipleLoginAttemptsAlert(user, newAttempts);
    }

    if (newAttempts >= maxAttempts) {
      updateData.blocked = true;
      updateData.blockedUntil = new Date(Date.now() + lockoutDuration);
      updateData.loginAttempts = 0; // Reset contador após bloqueio

      this.securityLogger.logAccountBlocked(user, newAttempts, ip, userAgent);

      await this.mailService.sendAccountBlockedAlert(user, '15 minutos');
    }

    await this.userService.update(user.userId, updateData);
  }

  private async handleSuccessfulLogin(
    user: User,
    ip?: string,
    userAgent?: string,
  ): Promise<void> {
    const updateData: {
      lastLogin: Date;
      loginAttempts: number;
      blocked?: boolean;
      blockedUntil?: Date | null;
    } = {
      lastLogin: new Date(),
      loginAttempts: 0,
    };

    this.securityLogger.logLoginAttempt({
      userId: user.userId,
      email: user.email,
      username: user.userName || undefined,
      ip,
      userAgent,
      success: true,
      timestamp: new Date(),
    });

    if (user.blocked && user.blockedUntil && user.blockedUntil <= new Date()) {
      updateData.blocked = false;
      updateData.blockedUntil = null;
      this.securityLogger.logAccountUnblocked(user, ip, userAgent);
    }

    await this.userService.update(user.userId, updateData);
  }

  async signIn(
    identification: string,
    pass: string,
    loginDetails?: { ip: string; userAgent: string },
  ): Promise<{ access_token: string; refresh_token: string }> {
    const user = await this.userService.findByIdentification(identification);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    if (user.deletedAt) {
      throw new UnauthorizedException('Conta excluída.');
    }

    if (!user.active) {
      throw new UnauthorizedException('Conta inativa.');
    }

    if (user.blocked) {
      if (user.blockedUntil && user.blockedUntil <= new Date()) {
        await this.userService.update(user.userId, {
          blocked: false,
          blockedUntil: null,
          loginAttempts: 0,
        });
      } else {
        throw new UnauthorizedException(
          `Conta temporariamente bloqueada devido a muitas tentativas de login. Tente novamente em alguns minutos.`,
        );
      }
    }

    if (!user.password) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      await this.handleFailedLogin(
        user,
        loginDetails?.ip,
        loginDetails?.userAgent,
      );

      const updatedUser =
        await this.userService.findByIdentification(identification);
      if (updatedUser?.blocked) {
        throw new UnauthorizedException(
          'Muitas tentativas de login incorretas. Conta temporariamente bloqueada.',
        );
      }

      throw new UnauthorizedException('Credenciais inválidas.');
    }

    if (loginDetails && this.isSuspiciousLogin(user)) {
      this.securityLogger.logSuspiciousLogin(
        user,
        loginDetails.ip,
        loginDetails.userAgent,
        {
          reason: 'Login após longo período de inatividade ou primeiro login',
        },
      );

      await this.mailService.sendSuspiciousLoginAlert(user, {
        ...loginDetails,
        timestamp: new Date(),
      });
    }

    await this.handleSuccessfulLogin(
      user,
      loginDetails?.ip,
      loginDetails?.userAgent,
    );

    await this.auditTrailService.logSecurityAction(
      'LOGIN',
      'User',
      user.userId,
      user.userId,
      loginDetails?.ip,
      loginDetails?.userAgent,
      {
        identification,
        loginTime: new Date(),
        suspicious: this.isSuspiciousLogin(user),
      },
    );

    return this.issueTokens(user);
  }

  private isSuspiciousLogin(user: User): boolean {
    // Critérios simples para detectar login suspeito:
    // 1. Primeiro login do usuário
    // 2. Login após muito tempo inativo (mais de 30 dias)
    // 3. Mudança significativa no User-Agent

    if (!user.lastLogin) {
      return false; // Primeiro login não é suspeito
    }

    const daysSinceLastLogin = Math.floor(
      (Date.now() - user.lastLogin.getTime()) / (1000 * 60 * 60 * 24),
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

  async refreshToken(
    token: string,
    ip?: string,
    userAgent?: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: string;
        tv: number;
        type: string;
      }>(token, {
        secret:
          this.configService.get<string>('JWT_REFRESH_SECRET') ||
          process.env.JWT_SECRET ||
          'default-secret',
      });
      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Token inválido');
      }
      const user = await this.userService.findOneById(payload.sub);
      if (!user) throw new UnauthorizedException('Usuário não encontrado');
      if (user.tokenVersion !== payload.tv) {
        throw new UnauthorizedException('Refresh token expirado/invalidado');
      }

      // Log do refresh de token bem-sucedido
      this.securityLogger.logTokenRefresh(user.userId, ip, userAgent);

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
    ip?: string,
    userAgent?: string,
  ): Promise<{ message: string }> {
    const { token, password, passwordConfirmation } = resetPasswordDto;

    if (password !== passwordConfirmation) {
      throw new BadRequestException('As senhas não conferem.');
    }

    // O token enviado é aleatório; validar comparando o hash sha256 salvo no banco
    const passwordResetToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user =
      await this.authRepository.findUserByPasswordResetToken(
        passwordResetToken,
      );

    if (!user) {
      throw new UnauthorizedException('Token inválido ou expirado.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await this.authRepository.updateUserPassword(user.userId, hashedPassword);

    this.securityLogger.logPasswordReset(user, ip, userAgent);

    return { message: 'Redefinição de senha com sucesso' };
  }

  async activateAccount(
    activateDto: ActivateAccountDto,
  ): Promise<{ message: string }> {
    const { token } = activateDto;

    const user = await this.authRepository.findUserByActivationToken(token);

    if (!user) {
      throw new BadRequestException('Token de ativação inválido ou expirado');
    }

    await this.authRepository.activateUser(user.userId);

    return { message: 'Conta ativada com sucesso! Você já pode fazer login.' };
  }

  async resendActivationEmail(email: string): Promise<{ message: string }> {
    const user = await this.authRepository.findUserByEmail(email);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (user.active) {
      throw new BadRequestException('Esta conta já está ativada');
    }

    const activationToken = crypto.randomBytes(32).toString('hex');
    const activationTokenExpires = this.getActivationTokenExpiration();

    await this.authRepository.updateUserTokens(user.userId, {
      activationToken,
      activationTokenExpires,
    });

    await this.mailService.sendActivationEmail(
      { ...user, activationToken, activationTokenExpires },
      activationToken,
    );

    return { message: 'Email de ativação reenviado com sucesso' };
  }

  async logout(userId: string, ip?: string, userAgent?: string): Promise<void> {
    await this.authRepository.incrementTokenVersion(userId);

    this.securityLogger.logLogout(userId, ip, userAgent);

    await this.auditTrailService.logSecurityAction(
      'LOGOUT',
      'User',
      userId,
      userId,
      ip,
      userAgent,
      {
        logoutTime: new Date(),
      },
    );
  }

  async validateUser(identifier: string, password: string) {
    const user = await this.userService.findOneByEmail(identifier);
    if (user && user.deletedAt === null) {
      if (!user.active) {
        await this.mailService.sendUserConfirmation(user);
        throw new UnauthorizedException(
          'A conta do usuário não está ativada. Um e-mail de ativação foi enviado.',
        );
      }
      if (!user.password) {
        throw new UnauthorizedException(
          'Senha não definida para este usuário.',
        );
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
