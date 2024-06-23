import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  create(createUserDto: CreateUserDto) {
    console.log(createUserDto);
    return console.log('This action adds a new user');
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }
}
