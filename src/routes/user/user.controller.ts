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

@ApiTags('user')
@Controller('')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Roles(Role.ADMIN, Role.SUPERADMIN, Role.SUPERVISOR)
  @Post('user')
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @IsPublic()
  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.userService.register(createUserDto);
  }

  @Get('user/me')
  getMe(@CurrentUser() user: User) {
    return user;
  }

  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @Get('user/list')
  async list() {
    return this.userService.list();
  }

  @Get('user/:id')
  async readOne(@ParamId() id: string) {
    return this.userService.readOne(id);
  }

  @Patch('user/:id')
  async updateUser(@Body() data: UpdateUserDto, @ParamId() id: string) {
    return this.userService.updatePartial(id, data);
  }

  @Delete('user/:id')
  async deleteUser(@ParamId() id: string) {
    return this.userService.delete(id);
  }
}
