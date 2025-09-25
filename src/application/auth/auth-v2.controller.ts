import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { IsPublic } from '../../core/decorators/is-public.decorator';
import { AuthRequest } from './models/AuthRequest';
import { AuthThrottle } from '../../core/decorators/auth-throttle.decorator';

@ApiTags('Autenticação v2')
@Controller({ path: 'auth', version: '2' })
export class AuthV2Controller {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @IsPublic()
  @AuthThrottle()
  @ApiOperation({ summary: 'Fazer login no sistema (v2)' })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso - retorna tokens e metadados',
  })
  async signIn(@Body() loginDto: LoginDto, @Req() req: Request) {
    const loginDetails = {
      ip: req.ip || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
    };

    const result = await this.authService.signIn(
      loginDto.identification,
      loginDto.password,
      loginDetails,
    );

    return {
      ...result,
      loginTime: new Date().toISOString(),
      ipAddress: req.ip || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      apiVersion: 'v2',
    };
  }

  @Post('refresh')
  @IsPublic()
  @ApiOperation({ summary: 'Renovar tokens (v2)' })
  @ApiResponse({
    status: 200,
    description: 'Tokens renovados com sucesso - resposta aprimorada',
  })
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Req() req: Request,
  ) {
    const result = await this.authService.refreshToken(
      refreshTokenDto.refreshToken,
      req.ip || 'unknown',
      req.headers['user-agent'] || 'unknown',
    );

    return {
      ...result,
      refreshTime: new Date().toISOString(),
      ipAddress: req.ip || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      apiVersion: 'v2',
    };
  }

  @Post('logout')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Fazer logout (v2)' })
  @ApiResponse({
    status: 200,
    description: 'Logout realizado com sucesso - resposta aprimorada',
  })
  async logout(@Req() req: AuthRequest) {
    await this.authService.logout(
      req.user.userId,
      req.ip || 'unknown',
      req.headers['user-agent'] || 'unknown',
    );

    return {
      message: 'Logout realizado com sucesso',
      logoutTime: new Date().toISOString(),
      ipAddress: req.ip || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      apiVersion: 'v2',
    };
  }
}
