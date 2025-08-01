import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async signIn(
    username: string,
    pass: string,
  ): Promise<{ access_token: string }> {
    const user = await this.userService.findOneByUsername(username);
    if (!user || !user.active) {
      throw new UnauthorizedException();
    }
    if (!user.password) {
      throw new UnauthorizedException();
    }
    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException();
    }
    await this.userService.update(user.userId, { lastLogin: new Date() });
    const payload = { sub: user.userId, username: user.username, tokenVersion: user.tokenVersion };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
