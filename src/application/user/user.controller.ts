import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Post,
  UseGuards,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { UpdateUserDto } from '../auth/dto/update-auth.dto';
import { Role } from '@prisma/client';
import { BlockUserDto } from './dto/block-user.dto';
import { CreateUserAdminDto } from './dto/create-user-admin.dto';
import { OwnershipGuard } from '../../core/guards/ownership.guard';
import {
  ManagerAndAbove,
  AllRolesWithOwnership,
  AllRoles,
  AdminOnly,
} from '../../core/decorators/role-ownership.decorator';
import {
  AuditTrailInterceptor,
  Auditable,
} from '../../core/interceptors/audit-trail.interceptor';

@ApiTags('Usuários')
@ApiBearerAuth('JWT-auth')
@Controller({ path: 'users', version: '1' })
@UseGuards(OwnershipGuard)
@UseInterceptors(AuditTrailInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @AdminOnly()
  @Auditable({ entityType: 'User', action: 'CREATE' })
  @ApiOperation({
    summary: 'Criar usuário com privilégios administrativos',
    description:
      'Rota restrita a administradores para criar usuários com qualquer role e configurações avançadas. Para registro público de usuários comuns, use a rota /auth/register.',
  })
  @ApiResponse({
    status: 201,
    description: 'Usuário criado com sucesso',
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos fornecidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({
    status: 403,
    description:
      'Acesso negado - apenas administradores podem criar usuários com privilégios',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflito - usuário já existe (email, username ou CPF)',
  })
  async createUser(@Body() createUserAdminDto: CreateUserAdminDto) {
    return this.userService.createUserAdmin(createUserAdminDto);
  }

  @Get()
  @ManagerAndAbove()
  @ApiOperation({ summary: 'Listar usuários com paginação e filtros' })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários retornada com sucesso',
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado - permissão insuficiente',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Número da página (padrão: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Itens por página (padrão: 20, máximo: 100)',
  })
  @ApiQuery({
    name: 'role',
    required: false,
    enum: Role,
    description: 'Filtrar por papel do usuário',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Buscar por nome, email ou username',
  })
  @ApiQuery({
    name: 'userName',
    required: false,
    description: 'Filtrar por username',
  })
  @ApiQuery({
    name: 'email',
    required: false,
    description: 'Filtrar por email',
  })
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('role') role?: Role,
    @Query('search') search?: string,
    @Query('userName') userName?: string,
    @Query('email') email?: string,
  ) {
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    return this.userService.findAllPaged({
      page: pageNum,
      limit: limitNum,
      role,
      search,
      userName,
      email,
    });
  }

  @Get('me')
  @AllRoles()
  @ApiOperation({ summary: 'Buscar dados do próprio usuário logado' })
  @ApiResponse({
    status: 200,
    description: 'Dados do usuário retornados com sucesso',
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  findMe(@Req() request: any) {
    const userId = request.user.userId;
    return this.userService.findOneById(userId);
  }

  @Get(':id')
  @AllRolesWithOwnership()
  @ApiOperation({ summary: 'Buscar usuário por ID' })
  @ApiResponse({ status: 200, description: 'Usuário encontrado com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado - permissão insuficiente ou ownership',
  })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @ApiParam({ name: 'id', description: 'ID único do usuário' })
  findOne(@Param('id') id: string) {
    return this.userService.findOneById(id);
  }

  @Patch(':id')
  @AllRolesWithOwnership()
  @Auditable({ entityType: 'User', action: 'UPDATE', entityIdParam: 'id' })
  @ApiOperation({ summary: 'Atualizar dados do usuário' })
  @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos fornecidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado - permissão insuficiente ou ownership',
  })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @ApiParam({ name: 'id', description: 'ID único do usuário' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Patch('me')
  @AllRoles()
  @Auditable({ entityType: 'User', action: 'UPDATE' })
  @ApiOperation({ summary: 'Atualizar dados do próprio usuário logado' })
  @ApiResponse({ status: 200, description: 'Dados atualizados com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos fornecidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  updateMe(@Req() request: any, @Body() updateUserDto: UpdateUserDto) {
    const userId = request.user.userId;
    return this.userService.update(userId, updateUserDto);
  }

  @Delete(':id')
  @AdminOnly()
  @Auditable({ entityType: 'User', action: 'DELETE', entityIdParam: 'id' })
  @ApiOperation({ summary: 'Excluir usuário (soft delete)' })
  @ApiResponse({ status: 200, description: 'Usuário excluído com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado - apenas administradores',
  })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @ApiParam({ name: 'id', description: 'ID único do usuário' })
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  @Post(':id/block')
  @ManagerAndAbove()
  @ApiOperation({ summary: 'Bloquear usuário' })
  @ApiResponse({ status: 200, description: 'Usuário bloqueado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos fornecidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado - permissão insuficiente',
  })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @ApiParam({ name: 'id', description: 'ID único do usuário' })
  async blockUser(@Param('id') id: string, @Body() dto: BlockUserDto) {
    const blockedUntil = dto.blockedUntil
      ? new Date(dto.blockedUntil)
      : undefined;
    return this.userService.blockUser(id, blockedUntil);
  }

  @Post(':id/unblock')
  @ManagerAndAbove()
  @ApiOperation({ summary: 'Desbloquear usuário' })
  @ApiResponse({ status: 200, description: 'Usuário desbloqueado com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado - permissão insuficiente',
  })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @ApiParam({ name: 'id', description: 'ID único do usuário' })
  async unblockUser(@Param('id') id: string) {
    return this.userService.unblockUser(id);
  }

  @Post(':id/restore')
  @AdminOnly()
  @ApiOperation({ summary: 'Restaurar usuário excluído' })
  @ApiResponse({ status: 200, description: 'Usuário restaurado com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado - apenas administradores',
  })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @ApiParam({ name: 'id', description: 'ID único do usuário' })
  async restoreUser(@Param('id') id: string) {
    return this.userService.restoreUser(id);
  }
}
