import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePutUserDto } from './dto/update-put-user.dto';
import { UpdatePatchUserDto } from './dto/update-patch-user.dto';

@Injectable()
export class UserService {
  private _data: UpdatePutUserDto;
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserDto) {
    return this.prisma.user.create({
      data,
    });
  }

  async list() {
    return this.prisma.user.findMany();
  }

  async readOne(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async update(
    id: number,
    { email, name, password, birthAt }: UpdatePutUserDto,
  ) {
    console.log({ email, name, password, birthAt });

    if (!birthAt) {
      birthAt = null;
    }

    return this.prisma.user.update({
      data: { email, name, password },
      where: {
        id: id,
      },
    });
  }

  async updatePartial(id: number, data: UpdatePatchUserDto) {
    console.log(data);
    return this.prisma.user.update({
      data: { ...data },
      where: { id },
    });
  }
}
