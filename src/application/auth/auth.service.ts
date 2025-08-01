import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-auth.dto';
import { MailService } from 'src/core/services/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async signIn(username: string, pass: string): Promise<{ access_token: string }> {
    const user = await this.userService.findOneByUsername(username);
    if (!user) {
      throw new UnauthorizedException();
    }
    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException();
    }
    const payload = { sub: user.userId, username: user.username };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async signUp(createUserDto: CreateUserDto) {
    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      saltOrRounds,
    );
    const result = await this.userService.createUser({
      ...createUserDto,
      password: hashedPassword,
    });

    await this.mailService.sendMail({
      to: result.email,
      subject: 'Welcome to our app!',
      template: './welcome',
      context: {
        name: result.name,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...user } = result;
    return user;
  }
}
