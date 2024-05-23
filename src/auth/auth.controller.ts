import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthLoginDto } from './dto/auth-login.dto';
import { AuthRegisterDto } from './dto/auth-register.dto';
import { AuthResetDto } from './dto/auth-reset.dto';
import { AuthForgetDTO } from './dto/auth-forget.dto';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { AuthGuard } from './guards/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post('login')
  async login(@Body() { email, password }: AuthLoginDto) {
    return this.authService.login(email, password);
  }

  @Post('register')
  async register(@Body() body: AuthRegisterDto) {
    return this.authService.register(body);
  }

  @Post('forget')
  async forget(@Body() { email }: AuthForgetDTO) {
    return this.authService.forget(email);
  }

  @Post('reset')
  async resetPassword(@Body() { password, token }: AuthResetDto) {
    return this.authService.reset(password, token);
  }

  @UseGuards(AuthGuard)
  @Post('me')
  async me(@Req() req) {
    console.log('tokenPayload:', req.tokenPayload);
    return { me: 'ok', data: req.tokenPayload };
  }
}
