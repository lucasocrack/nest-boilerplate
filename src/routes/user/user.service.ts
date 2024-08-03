import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';
import { MeUpdateUserDto } from './dto/me-update-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const data = {
      ...createUserDto,
      password: await bcrypt.hash(createUserDto.password, 10),
    };
    const createdUser = await this.prisma.user.create({ data });

    return {
      ...createdUser,
      password: undefined,
    };
  }

  async register(registerUserDto: RegisterUserDto) {
    const data = {
      ...registerUserDto,
      password: await bcrypt.hash(registerUserDto.password, 10),
    };
    const createdUser = await this.prisma.user.create({ data });

    return {
      ...createdUser,
      password: undefined,
    };
  }

  findOneByEmailOrUsername(identity: string) {
    return this.prisma.user.findFirst({
      where: {
        OR: [{ email: identity }, { username: identity }],
      },
    });
  }

  async list() {
    return this.prisma.user.findMany();
  }

  async readOne(id: string) {
    await this.exists(id);
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (user) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return null;
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
    return this.prisma.user.update({
      data,
      where: { id },
    });
  }

  async meUpdate(id: string, meUpdateUserDto: MeUpdateUserDto) {
    await this.exists(id);
    const data: any = Object.keys(meUpdateUserDto).reduce((acc, key) => {
      if (meUpdateUserDto[key]) {
        acc[key] = meUpdateUserDto[key];
      }
      return acc;
    }, {});
    if (meUpdateUserDto.password) {
      data.password = await bcrypt.hash(
        meUpdateUserDto.password,
        await bcrypt.genSalt(),
      );
    }
    return this.prisma.user.update({
      data,
      where: { id },
    });
  }
  async delete(id: string) {
    await this.exists(id);

    return this.prisma.user.delete({
      where: { id },
    });
  }

  async exists(id: string) {
    if (
      !(await this.prisma.user.count({
        where: {
          id,
        },
      }))
    ) {
      throw new NotFoundException(`O usuário ${id} não foi encontrado.`);
    }
  }
}
