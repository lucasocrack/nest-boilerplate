import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenUtils {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  generateActivationLink(userId: string): string {
    if (!userId) {
      throw new Error('User ID is required to generate activation link');
    }

    const payload = { sub: userId };
    const tokenExpiration = this.configService.get<string>(
      'ACTIVATION_TOKEN_EXPIRATION_TIME',
    );
    const token = this.jwtService.sign(payload, { expiresIn: tokenExpiration });

    if (!token) {
      throw new Error('Failed to generate token');
    }

    const domain = this.configService.get<string>('DOMAIN');
    if (!domain) {
      throw new Error('Domain is not configured');
    }

    return `${domain}/authentication/confirm-email/${token}`;
  }

  generateResetPasswordToken(userId: string): string {
    const payload = { sub: userId };
    const tokenExpiration = this.configService.get<string>(
      'RESET_PASSWORD_TOKEN_EXPIRATION_TIME',
    );
    return this.jwtService.sign(payload, { expiresIn: tokenExpiration });
  }
}
