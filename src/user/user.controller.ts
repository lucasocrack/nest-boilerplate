import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePutUserDto } from './dto/update-put-user.dto';
import { UserService } from './user.service';
import { UpdatePatchUserDto } from './dto/update-patch-user.dto';
import { ParamId } from '../decorators/param-id.decorator';

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
  async readOne(@ParamId() id: number) {
    return this.userService.readOne(id);
  }

  @Put(':id')
  async replaceUser(@Body() data: UpdatePutUserDto, @ParamId() id: number) {
    return this.userService.update(id, data);
  }

  @Patch(':id')
  async updateUser(@Body() data: UpdatePatchUserDto, @ParamId() id: number) {
    return this.userService.updatePartial(id, data);
  }

  @Delete(':id')
  async deleteUser(@ParamId() id: number) {
    return this.userService.delete(id);
  }
}
