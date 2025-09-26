import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Req,
  UnauthorizedException,
  Get,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ActivateAccountDto } from './dto/activate-account.dto';
import { ResendActivationDto } from './dto/resend-activation.dto';
import { IsPublic } from '../../core/decorators/is-public.decorator';
import { AuthRequest } from './models/AuthRequest';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthThrottle } from '../../core/decorators/auth-throttle.decorator';

@ApiTags('Autenticação')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @IsPublic()
  @AuthThrottle()
  @Post('login')
  @ApiOperation({ summary: 'Fazer login no sistema' })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso - retorna tokens de acesso',
  })
  @ApiResponse({ status: 400, description: 'Dados de login inválidos' })
  @ApiResponse({ status: 401, description: 'Credenciais incorretas' })
  @ApiResponse({
    status: 429,
    description: 'Muitas tentativas de login - rate limit atingido',
  })
  signIn(@Body() loginDto: LoginDto, @Req() req: Request) {
    const loginDetails = {
      ip: req.ip || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
    };
    return this.authService.signIn(
      loginDto.identification,
      loginDto.password,
      loginDetails,
    );
  }

  @Post('register')
  @IsPublic()
  @AuthThrottle()
  @ApiOperation({
    summary: 'Registrar novo usuário (público)',
    description:
      'Registro público que cria usuários com role USER automaticamente. Para criar usuários com privilégios administrativos, use a rota administrativa em /users.',
  })
  @ApiResponse({
    status: 201,
    description:
      'Usuário registrado com sucesso - email de ativação enviado. Role definido automaticamente como USER.',
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos fornecidos' })
  @ApiResponse({
    status: 409,
    description: 'Usuário já existe (email, username ou CPF duplicado)',
  })
  @ApiResponse({
    status: 429,
    description: 'Muitas tentativas de registro - rate limit atingido',
  })
  async signUp(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @IsPublic()
  @AuthThrottle()
  @ApiOperation({ summary: 'Solicitar redefinição de senha' })
  @ApiResponse({
    status: 200,
    description: 'Token de redefinição gerado e enviado por email',
  })
  @ApiResponse({ status: 400, description: 'Email inválido' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @ApiResponse({
    status: 429,
    description: 'Muitas tentativas - rate limit atingido',
  })
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @IsPublic()
  @ApiOperation({ summary: 'Redefinir senha com token' })
  @ApiResponse({ status: 200, description: 'Senha redefinida com sucesso' })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou senhas não conferem',
  })
  @ApiResponse({ status: 401, description: 'Token inválido ou expirado' })
  resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @Req() req: Request,
  ) {
    const ip = req.ip || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    return this.authService.resetPassword(resetPasswordDto, ip, userAgent);
  }

  @Post('activate')
  @HttpCode(HttpStatus.OK)
  @IsPublic()
  @ApiOperation({ summary: 'Ativar conta de usuário' })
  @ApiResponse({ status: 200, description: 'Conta ativada com sucesso' })
  @ApiResponse({
    status: 400,
    description: 'Token de ativação inválido ou expirado',
  })
  activateAccount(@Body() activateDto: ActivateAccountDto) {
    return this.authService.activateAccount(activateDto);
  }

  @Post('resend-activation')
  @HttpCode(HttpStatus.OK)
  @IsPublic()
  @ApiOperation({ summary: 'Reenviar email de ativação' })
  @ApiResponse({
    status: 200,
    description: 'Email de ativação reenviado com sucesso',
  })
  @ApiResponse({ status: 400, description: 'Conta já está ativada' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  resendActivationEmail(@Body() resendDto: ResendActivationDto) {
    return this.authService.resendActivationEmail(resendDto.email);
  }

  @IsPublic()
  @Post('refresh')
  @ApiOperation({ summary: 'Renovar token de acesso' })
  @ApiResponse({ status: 200, description: 'Tokens renovados com sucesso' })
  @ApiResponse({
    status: 401,
    description: 'Refresh token inválido ou expirado',
  })
  async refresh(@Body() body: RefreshTokenDto, @Req() req: Request) {
    const ip = req.ip || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    return this.authService.refreshToken(body.refreshToken, ip, userAgent);
  }

  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obter perfil do usuário autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Perfil do usuário retornado com sucesso',
  })
  @ApiResponse({
    status: 401,
    description: 'Token de acesso inválido ou expirado',
  })
  getProfile(@Req() req: AuthRequest) {
    if (!req.user) {
      throw new UnauthorizedException('User not found');
    }
    return req.user;
  }

  @Post('logout')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Fazer logout e invalidar tokens' })
  @ApiResponse({ status: 200, description: 'Logout realizado com sucesso' })
  @ApiResponse({
    status: 401,
    description: 'Token de acesso inválido ou expirado',
  })
  async logout(@Req() req: AuthRequest): Promise<{ message: string }> {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const token = authHeader.split(' ')[1];
    console.log('Token JWT:', token);
    console.log('User:', req.user);

    if (!req.user) {
      throw new UnauthorizedException('User not found');
    }

    const userId = req.user.userId;
    const ip = req.ip || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    await this.authService.logout(userId, ip, userAgent);
    return { message: 'Saindo do sistema' };
  }
}
