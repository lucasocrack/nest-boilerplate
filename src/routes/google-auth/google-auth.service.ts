import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../services/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class GoogleAuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async generateJwt(user: CreateUserDto): Promise<string> {
    const payload = { email: user.email, sub: user.id };
    return this.jwtService.sign(payload);
  }

  async registerUser(user: CreateUserDto): Promise<any> {
    const newUser = await this.prisma.user.create({
      data: {
        email: user.email,
        username: user.username,
        password: user.password,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    });
    return newUser;
  }
}
