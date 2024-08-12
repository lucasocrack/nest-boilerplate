import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { GoogleAuthService } from './google-auth.service';

@Controller('google')
export class GoogleAuthController {
  constructor(
    private readonly googleAuthService: GoogleAuthService,
    private readonly configService: ConfigService,
  ) {}

  @Get('register')
  @UseGuards(AuthGuard('google'))
  async googleRegister(@Req() req) {
    const jwt = await this.googleAuthService.generateJwt(req.user);
    const redirectUrl = `${this.configService.get<string>('DOMAIN')}/update-profile`;
    return { user: req.user, token: jwt, redirectUrl };
  }

  @Get('login')
  @UseGuards(AuthGuard('google'))
  async googleLogin(@Req() req) {
    const jwt = await this.googleAuthService.generateJwt(req.user);
    return { user: req.user, token: jwt };
  }

  @Get('callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req) {
    const jwt = await this.googleAuthService.generateJwt(req.user);
    return { user: req.user, token: jwt };
  }
}
