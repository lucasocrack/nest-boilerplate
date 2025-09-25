import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { Role, AuditAction } from '@prisma/client';
import { AuditTrailService } from '../../core/audit/audit-trail.service';
import { AuditLogEntity } from '../../core/entities/audit-log.entity';

/**
 * Controller para consulta de logs de auditoria
 * Apenas usuários com role ADMIN podem acessar
 */
@ApiTags('Audit Trail')
@ApiBearerAuth()
@Controller('audit')
@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
export class AuditController {
  constructor(private readonly auditTrailService: AuditTrailService) {}

  /**
   * Lista logs de auditoria com filtros
   */
  @Get()
  @ApiOperation({
    summary: 'Listar logs de auditoria',
    description: 'Retorna logs de auditoria com filtros opcionais',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de logs de auditoria',
    type: [AuditLogEntity],
  })
  @ApiQuery({
    name: 'entityType',
    required: false,
    description: 'Tipo da entidade (User, etc.)',
  })
  @ApiQuery({
    name: 'action',
    required: false,
    description: 'Ação realizada (CREATE, UPDATE, DELETE, etc.)',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'ID do usuário que realizou a ação',
  })
  @ApiQuery({
    name: 'entityId',
    required: false,
    description: 'ID da entidade afetada',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Data inicial (ISO string)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Data final (ISO string)',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Número da página (padrão: 1)',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Itens por página (padrão: 20, máximo: 100)',
    type: Number,
  })
  async findAll(
    @Query('entityType') entityType?: string,
    @Query('action') action?: string,
    @Query('userId') userId?: string,
    @Query('entityId') entityId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    // Converte action string para enum AuditAction se válido
    const validAction =
      action && Object.values(AuditAction).includes(action as AuditAction)
        ? (action as AuditAction)
        : undefined;

    const filters = {
      entityType,
      action: validAction,
      userId,
      entityId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      page: Math.max(1, page),
      limit: Math.min(100, Math.max(1, limit)),
    };

    Object.keys(filters).forEach(
      (key) => filters[key] === undefined && delete filters[key],
    );

    return this.auditTrailService.findAuditLogs(filters);
  }

  /**
   * Obtém histórico de uma entidade específica
   */
  @Get('entity/:entityType/:entityId')
  @ApiOperation({
    summary: 'Histórico de uma entidade',
    description: 'Retorna o histórico completo de mudanças de uma entidade',
  })
  @ApiParam({
    name: 'entityType',
    description: 'Tipo da entidade',
    example: 'User',
  })
  @ApiParam({
    name: 'entityId',
    description: 'ID da entidade',
    example: 'user-123',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Histórico da entidade',
    type: [AuditLogEntity],
  })
  async getEntityHistory(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return this.auditTrailService.getEntityHistory(entityType, entityId);
  }

  /**
   * Obtém estatísticas de auditoria
   */
  @Get('stats')
  @ApiOperation({
    summary: 'Estatísticas de auditoria',
    description: 'Retorna estatísticas dos logs de auditoria',
  })
  @ApiQuery({
    name: 'days',
    required: false,
    description: 'Número de dias para as estatísticas (padrão: 30)',
    type: Number,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Estatísticas de auditoria',
    schema: {
      type: 'object',
      properties: {
        totalLogs: { type: 'number' },
        logsByAction: {
          type: 'object',
          additionalProperties: { type: 'number' },
        },
        logsByEntityType: {
          type: 'object',
          additionalProperties: { type: 'number' },
        },
        logsByDay: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              date: { type: 'string' },
              count: { type: 'number' },
            },
          },
        },
        topUsers: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              userId: { type: 'string' },
              count: { type: 'number' },
            },
          },
        },
      },
    },
  })
  async getStats(@Query('days') days = 30) {
    const validDays = Math.max(1, Math.min(365, days));
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - validDays);

    return this.auditTrailService.getAuditStats(startDate, endDate);
  }

  /**
   * Obtém um log específico por ID
   */
  @Get(':auditId')
  @ApiOperation({
    summary: 'Obter log específico',
    description: 'Retorna um log de auditoria específico pelo ID',
  })
  @ApiParam({
    name: 'auditId',
    description: 'ID do log de auditoria',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Log de auditoria',
    type: AuditLogEntity,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Log não encontrado',
  })
  async findOne(@Param('auditId') auditId: string) {
    return this.auditTrailService.findLogById(auditId);
  }
}
