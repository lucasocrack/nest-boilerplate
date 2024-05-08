import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePutUserDto } from './dto/update-put-user.dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() data: CreateUserDto) {
    return this.userService.create(data);
  }

  @Get()
  async read() {
    return this.userService.list();
  }

  @Get(':id')
  async readOne(@Param('id', ParseIntPipe) id) {
    return { user: {}, id };
  }

  @Put(':id')
  async replaceUser(
    @Body() { email, name, password }: UpdatePutUserDto,
    @Param() @Param('id', ParseIntPipe) id,
  ) {
    return {
      method: 'put',
      email,
      name,
      password,
      id,
    };
  }

  @Patch(':id')
  async updateUser(
    @Body() { email, name, password }: UpdatePutUserDto,
    @Param('id', ParseIntPipe) id,
  ) {
    return {
      metohd: 'path',
      email,
      name,
      password,
      id,
    };
  }

  @Delete(':id')
  async deleteUser(@Param('id', ParseIntPipe) id) {
    return { id };
  }
}
