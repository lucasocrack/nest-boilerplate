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

@Controller('users')
export class UserController {
  @Post()
  async createUser(@Body() { name, password, email }: CreateUserDto) {
    return { name, password, email };
  }

  @Get()
  async read() {
    return { users: [] };
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
