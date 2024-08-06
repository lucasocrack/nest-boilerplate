import { Body, Controller, Delete, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { User } from '../../entities/user.entity';
import { ParamId } from '../../decorators/param-id.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from '../../decorators/roles.decorator';
import { Role } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';
import { ExcludeRoles } from '../../decorators/exclude-roles.decorator';

@ApiTags('user')
@UseGuards(AuthGuard('jwt'))
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Roles(Role.ADMIN, Role.SUPERADMIN, Role.SUPERVISOR)
  @Post('')
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get('me')
  getMe(@CurrentUser() user: User) {
    return user;
  }

  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ExcludeRoles(Role.CLIENT)
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
