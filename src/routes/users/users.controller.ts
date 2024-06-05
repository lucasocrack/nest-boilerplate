import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RoleGuard } from '../../common/guards/role.guard';
import { LogInterceptor } from '../../common/interceptors/log.interceptor';
import { ParamId } from '../../common/decorators/param-id.decorator';

@Roles(Role.Admin, Role.User)
@UseGuards(AuthGuard, RoleGuard)
@UseInterceptors(LogInterceptor)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() data: CreateUserDto) {
    return this.usersService.create(data);
  }

  @Get()
  async read() {
    return this.usersService.list();
  }

  @Get(':id')
  async readOne(@ParamId() id: number) {
    return this.usersService.readOne(id);
  }

  @Patch(':id')
  async updateUser(@Body() data: UpdateUserDto, @ParamId() id: number) {
    return this.usersService.updatePartial(id, data);
  }

  @Delete(':id')
  async deleteUser(@ParamId() id: number) {
    return this.usersService.delete(id);
  }
}
