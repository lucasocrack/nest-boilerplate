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
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-auth.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ActivateAccountDto } from './dto/activate-account.dto';
import { ResendActivationDto } from './dto/resend-activation.dto';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { IsPublic } from '../../core/decorators/is-public.decorator';
import { AuthRequest } from './models/AuthRequest';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthThrottle } from '../../core/decorators/auth-throttle.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @IsPublic()
  @AuthThrottle()
  @Post('login')
  signIn(@Body() loginDto: LoginDto, @Req() req: any) {
    const loginDetails = {
      ip: req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown'
    };
    return this.authService.signIn(loginDto.identification, loginDto.password, loginDetails);
  }

  @Post('register')
  @IsPublic()
  @AuthThrottle()
  async signUp(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @IsPublic()
  @AuthThrottle()
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @IsPublic()
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('activate')
  @HttpCode(HttpStatus.OK)
  @IsPublic()
  activateAccount(@Body() activateDto: ActivateAccountDto) {
    return this.authService.activateAccount(activateDto);
  }

  @Post('resend-activation')
  @HttpCode(HttpStatus.OK)
  @IsPublic()
  resendActivationEmail(@Body() resendDto: ResendActivationDto) {
    return this.authService.resendActivationEmail(resendDto.email);
  }

  @IsPublic()
  @Post('refresh')
  async refresh(@Body() body: RefreshTokenDto) {
    return this.authService.refreshToken(body.refreshToken);
  }

  @Get('me')
  async getProfile(@Req() req: AuthRequest) {
    if (!req.user) {
      throw new UnauthorizedException('User not found');
    }
    return req.user;
  }

  @Post('logout')
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
    await this.authService.logout(userId);
    return { message: 'Saindo do sistema' };
  }
}
