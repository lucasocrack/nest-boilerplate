import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { GoogleAuthService } from './google-auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { generateRandomPassword } from './utils/password.util';

@Controller('google')
export class GoogleAuthController {
  constructor(
    private readonly googleAuthService: GoogleAuthService,
    private readonly configService: ConfigService,
  ) {}

  @Get('register')
  @UseGuards(AuthGuard('google'))
  async googleRegister(@Req() req) {
    const userDto: CreateUserDto = {
      email: req.user.email,
      username: req.user.name,
      password: generateRandomPassword(),
      isActive: true,
      role: 'CLIENT',
      createdAt: new Date(),
    };
    const user = await this.googleAuthService.registerUser(userDto);
    const jwt = await this.googleAuthService.generateJwt(user);
    const redirectUrl = `${this.configService.get<string>('DOMAIN')}/update-profile`;
    return { user, token: jwt, redirectUrl };
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
