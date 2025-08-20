import { Controller, Get, Body, Patch, Param, Delete, Query, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from '../auth/dto/update-auth.dto';
import { Roles } from '../../core/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { BlockUserDto } from './dto/block-user.dto';
import { RestoreUserDto } from './dto/restore-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Lista com paginação e filtros
  @Get()
  @Roles(Role.ADMIN, Role.GERENTE)
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('role') role?: Role,
    @Query('search') search?: string,
    @Query('userName') userName?: string,
    @Query('email') email?: string,
  ) {
    const pageNum = Math.max(parseInt(page as string, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit as string, 10) || 20, 1), 100);
    return this.userService.findAllPaged({ page: pageNum, limit: limitNum, role, search, userName, email });
  }

  // Buscar por ID
  @Get(':id')
  @Roles(Role.ADMIN, Role.GERENTE)
  findOne(@Param('id') id: string) {
    return this.userService.findOneById(id);
  }

  // Atualização parcial segura
  @Patch(':id')
  @Roles(Role.ADMIN, Role.GERENTE)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  // Soft delete com checagem
  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  // Bloquear usuário (opcionalmente até uma data)
  @Post(':id/block')
  @Roles(Role.ADMIN, Role.GERENTE)
  async blockUser(@Param('id') id: string, @Body() dto: BlockUserDto) {
    const blockedUntil = dto.blockedUntil ? new Date(dto.blockedUntil) : undefined;
    return this.userService.blockUser(id, blockedUntil);
  }

  // Desbloquear usuário
  @Post(':id/unblock')
  @Roles(Role.ADMIN, Role.GERENTE)
  async unblockUser(@Param('id') id: string) {
    return this.userService.unblockUser(id);
  }

  // Restaurar usuário excluído (reativar e limpar deletedAt)
  @Post(':id/restore')
  @Roles(Role.ADMIN)
  async restoreUser(@Param('id') id: string, @Body() _dto: RestoreUserDto) {
    return this.userService.restoreUser(id);
  }
}
