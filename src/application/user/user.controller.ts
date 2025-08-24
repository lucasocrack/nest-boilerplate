import { Controller, Get, Body, Patch, Param, Delete, Query, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UpdateUserDto } from '../auth/dto/update-auth.dto';
import { Roles } from '../../core/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { BlockUserDto } from './dto/block-user.dto';
import { RestoreUserDto } from './dto/restore-user.dto';

@ApiTags('Usuários')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Roles(Role.ADMIN, Role.GERENTE)
  @ApiOperation({ summary: 'Listar usuários com paginação e filtros' })
  @ApiResponse({ status: 200, description: 'Lista de usuários retornada com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado - permissão insuficiente' })
  @ApiQuery({ name: 'page', required: false, description: 'Número da página (padrão: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Itens por página (padrão: 20, máximo: 100)' })
  @ApiQuery({ name: 'role', required: false, enum: Role, description: 'Filtrar por papel do usuário' })
  @ApiQuery({ name: 'search', required: false, description: 'Buscar por nome, email ou username' })
  @ApiQuery({ name: 'userName', required: false, description: 'Filtrar por username' })
  @ApiQuery({ name: 'email', required: false, description: 'Filtrar por email' })
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

  @Get(':id')
  @Roles(Role.ADMIN, Role.GERENTE)
  @ApiOperation({ summary: 'Buscar usuário por ID' })
  @ApiResponse({ status: 200, description: 'Usuário encontrado com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado - permissão insuficiente' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @ApiParam({ name: 'id', description: 'ID único do usuário' })
  findOne(@Param('id') id: string) {
    return this.userService.findOneById(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.GERENTE)
  @ApiOperation({ summary: 'Atualizar dados do usuário' })
  @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos fornecidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado - permissão insuficiente' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @ApiParam({ name: 'id', description: 'ID único do usuário' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Excluir usuário (soft delete)' })
  @ApiResponse({ status: 200, description: 'Usuário excluído com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado - apenas administradores' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @ApiParam({ name: 'id', description: 'ID único do usuário' })
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  @Post(':id/block')
  @Roles(Role.ADMIN, Role.GERENTE)
  @ApiOperation({ summary: 'Bloquear usuário' })
  @ApiResponse({ status: 200, description: 'Usuário bloqueado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos fornecidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado - permissão insuficiente' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @ApiParam({ name: 'id', description: 'ID único do usuário' })
  async blockUser(@Param('id') id: string, @Body() dto: BlockUserDto) {
    const blockedUntil = dto.blockedUntil ? new Date(dto.blockedUntil) : undefined;
    return this.userService.blockUser(id, blockedUntil);
  }

  @Post(':id/unblock')
  @Roles(Role.ADMIN, Role.GERENTE)
  @ApiOperation({ summary: 'Desbloquear usuário' })
  @ApiResponse({ status: 200, description: 'Usuário desbloqueado com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado - permissão insuficiente' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @ApiParam({ name: 'id', description: 'ID único do usuário' })
  async unblockUser(@Param('id') id: string) {
    return this.userService.unblockUser(id);
  }

  @Post(':id/restore')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Restaurar usuário excluído' })
  @ApiResponse({ status: 200, description: 'Usuário restaurado com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado - apenas administradores' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @ApiParam({ name: 'id', description: 'ID único do usuário' })
  async restoreUser(@Param('id') id: string, @Body() _dto: RestoreUserDto) {
    return this.userService.restoreUser(id);
  }
}
