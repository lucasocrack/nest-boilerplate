import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './services/auth/auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthRequest } from './services/auth/models/AuthRequest';
import { IsPublic } from './decorators/is-public.decorator';
import { ApiTags } from '@nestjs/swagger';
import { RegisterUserDto } from './services/auth/dto/register-user.dto';
import { LoginAuthDto } from './services/auth/dto/login-auth.dto';

@IsPublic()
@Controller()
export class AppController {
  constructor(private readonly authService: AuthService) {}

  @ApiTags('login')
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  async login(@Req() req: AuthRequest, @Body() loginAuthDto: LoginAuthDto) {
    return this.authService.login(loginAuthDto);
  }

  @ApiTags('Register')
  @Post('register')
  @HttpCode(HttpStatus.OK)
  register(@Req() req: AuthRequest, @Body() registerUserDto: RegisterUserDto) {
    return this.authService.register(registerUserDto);
  }

  @Get('activate')
  async activateAccount(@Query('token') token: string): Promise<string> {
    if (!token) {
      throw new BadRequestException('Token is required');
    }
    await this.authService.activateAccount(token);
    return 'Account activated successfully'; // tratar melhor essa mensagem
  }
}
