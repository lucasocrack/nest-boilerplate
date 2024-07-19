import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const data = {
      ...createUserDto,
      password: await bcrypt.hash(createUserDto.password, 10),
    };
    const createdUser = await this.prisma.users.create({ data });

    return {
      ...createdUser,
      password: undefined,
    };
  }

  findOneByEmailOrUsername(identity: string) {
    return this.prisma.users.findFirst({
      where: {
        OR: [{ email: identity }, { username: identity }],
      },
    });
  }

  async list() {
    return this.prisma.users.findMany();
  }

  async readOne(id: string) {
    await this.exists(id);
    return this.prisma.users.findUnique({
      where: { id },
    });
  }

  async update(id: string, { email, username, password, role }: UpdateUserDto) {
    await this.exists(id);
    password = await bcrypt.hash(password, await bcrypt.genSalt());
    return this.prisma.users.update({
      data: {
        email,
        username,
        password,
        role,
      },
      where: {
        id: id,
      },
    });
  }

  async updatePartial(id: string, updateUserDto: UpdateUserDto) {
    await this.exists(id);
    const data: any = Object.keys(updateUserDto).reduce((acc, key) => {
      if (updateUserDto[key]) {
        acc[key] = updateUserDto[key];
      }
      return acc;
    }, {});
    if (updateUserDto.password) {
      data.password = await bcrypt.hash(
        updateUserDto.password,
        await bcrypt.genSalt(),
      );
    }
    return this.prisma.users.update({
      data,
      where: { id },
    });
  }

  async delete(id: string) {
    await this.exists(id);

    return this.prisma.users.delete({
      where: { id },
    });
  }

  async exists(id: string) {
    if (
      !(await this.prisma.users.count({
        where: {
          id,
        },
      }))
    ) {
      throw new NotFoundException(`O usuário ${id} não foi encontrado.`);
    }
  }
}
