import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-auth.dto';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: Record<string, any>) {
    return this.authService.signIn(signInDto.username, signInDto.password);
  }

  @Post('register')
  async signUp(@Body() createUserDto: CreateUserDto) {
    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      saltOrRounds,
    );
    const result = await this.userService.createUser({
      ...createUserDto,
      password: hashedPassword,
      active: true,
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...user } = result;
    return user;
  }
}
