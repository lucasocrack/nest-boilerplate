import { Injectable } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common/exceptions/unauthorized.exception';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { user } from '.prisma/client';
import { AuthRegisterDto } from './dto/auth-register.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createToken(user: user) {
    return {
      access_token: this.jwtService.sign(
        {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        {
          expiresIn: '7 days',
          subject: user.id.toString(),
          issuer: 'login',
          audience: 'users',
        },
      ),
    };
  }

  async isValidToken(token: string) {
    try {
      const data = this.jwtService.verify(token, {
        audience: 'users',
        issuer: 'login',
      });
      if (data) {
        const user = await this.prisma.user.findFirst({
          where: {
            id: data.id,
          },
        });
        if (user) {
          this.createToken(user);
          return true;
        }
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  async checkToken(token: string) {
    try {
      const data = this.jwtService.verify(token, {
        audience: 'users',
        issuer: 'login',
      });
      return data;
    } catch (e) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
        password,
      },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.createToken(user);
  }

  async forget(email: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
      },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid email');
    }
    // implementar envio de email
    return true;
  }
  async reset(password: string, token: string) {
    // validar o token
    // atualizar a senha
    const id = 0;

    const user = await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        password,
      },
    });
    return this.createToken(user);
  }

  async register(data: AuthRegisterDto) {
    const user = await this.userService.create(data);
    return this.createToken(user);
  }
}
