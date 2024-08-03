import { Body, Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiTags } from '@nestjs/swagger';
import { IsPublic } from '../../decorators/is-public.decorator';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { User } from './entities/user.entity';
import { ParamId } from '../../decorators/param-id.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from '../../decorators/roles.decorator';
import { Role } from '@prisma/client';
import { RegisterUserDto } from './dto/register-user.dto';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Roles(Role.ADMIN, Role.SUPERADMIN, Role.SUPERVISOR)
  @Post('')
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @IsPublic()
  @Post('register')
  register(@Body() registerUserDto: RegisterUserDto) {
    return this.userService.register(registerUserDto);
  }

  @Get('me')
  getMe(@CurrentUser() user: User) {
    return user;
  }

  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @Get('')
  async list() {
    return this.userService.list();
  }

  @Get(':id')
  async readOne(@ParamId() id: string) {
    return this.userService.readOne(id);
  }

  @Patch(':id')
  async updateUser(@Body() data: UpdateUserDto, @ParamId() id: string) {
    return this.userService.updatePartial(id, data);
  }

  @Patch('me-update')
  async updateMe(@CurrentUser() user: User, @Body() data: UpdateUserDto) {
    return this.userService.updatePartial(user.id, data);
  }

  @Delete(':id')
  async deleteUser(@ParamId() id: string) {
    return this.userService.delete(id);
  }
}
