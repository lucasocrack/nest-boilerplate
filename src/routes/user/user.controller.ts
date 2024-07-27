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
import { Role } from '../../enums/roles.enum';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @IsPublic()
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get('me')
  getMe(@CurrentUser() user: User) {
    return user;
  }

  @Roles(Role.Administrador, Role.SuperAdmin)
  @Get()
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

  @Delete(':id')
  async deleteUser(@ParamId() id: string) {
    return this.userService.delete(id);
  }
}
