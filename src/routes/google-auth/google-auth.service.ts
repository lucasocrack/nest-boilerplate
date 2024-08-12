import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class GoogleAuthService {
  constructor(private readonly jwtService: JwtService) {}

  async generateJwt(user: any): Promise<string> {
    const payload = { email: user.email, sub: user.userId };
    return this.jwtService.sign(payload);
  }
}
