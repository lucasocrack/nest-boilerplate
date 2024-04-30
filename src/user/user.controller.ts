import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
  async readOne(@Param() params) {
    return { user: {}, params };
  }

  @Put(':id')
  async replaceUser(
    @Body() { email, name, password }: UpdatePutUserDto,
    @Param() params,
  ) {
    return {
      method: 'put',
      email,
      name,
      password,
      params,
    };
  }

  @Patch(':id')
  async updateUser(
    @Body() { email, name, password }: UpdatePutUserDto,
    @Param() params,
  ) {
    return {
      metohd: 'path',
      email,
      name,
      password,
      params,
    };
  }

  @Delete('id')
  async deleteUser(@Param() params) {
    return { method: 'delete', params };
  }
}
