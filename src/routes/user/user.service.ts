import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '../../services/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';
import { MeUpdateUserDto } from './dto/me-update-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { password, ...rest } = createUserDto;
    const hashedPassword = await bcrypt.hash(password, 10);
    const data: any = { ...rest, password: hashedPassword };

    const createdUser = await this.prisma.user.create({ data });
    return { ...createdUser, password: undefined };
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
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (user) {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return null;
  }

  async updatePartial(id: string, updateUserDto: UpdateUserDto) {
    return this.updateUser(id, updateUserDto);
  }

  async meUpdate(id: string, meUpdateUserDto: MeUpdateUserDto) {
    return this.updateUser(id, meUpdateUserDto);
  }

  private async updateUser(
    id: string,
    updateUserDto: Partial<UpdateUserDto | MeUpdateUserDto>,
  ) {
    await this.exists(id);
    const data: any = Object.keys(updateUserDto).reduce((acc, key) => {
      if (updateUserDto[key] !== undefined) {
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
    return this.prisma.user.update({ data, where: { id } });
  }

  async delete(id: string) {
    await this.exists(id);
    return this.prisma.user.delete({ where: { id } });
  }

  private async exists(id: string) {
    const count = await this.prisma.user.count({ where: { id } });
    if (!count) {
      throw new NotFoundException(`O usuário ${id} não foi encontrado.`);
    }
  }
}
