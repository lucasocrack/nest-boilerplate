import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export class TokenUtils {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  generateActivationLink(userId: string): string {
    const payload = { sub: userId };
    const tokenExpiration = this.configService.get<string>(
      'ACTIVATION_TOKEN_EXPIRATION_TIME',
    );
    const token = this.jwtService.sign(payload, { expiresIn: tokenExpiration });
    const domain = this.configService.get<string>('DOMAIN');
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
