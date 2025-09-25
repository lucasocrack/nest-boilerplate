import {
  Controller,
  Get,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { PerformanceMetricsService } from '../../core/monitoring/performance-metrics.service';
import { ResponseHelper } from '../../core/utils/response-helper';

@ApiTags('Monitoramento')
@Controller({ path: 'monitoring', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class MonitoringController {
  constructor(
    private readonly performanceMetricsService: PerformanceMetricsService,
  ) {}

  @Get('performance/stats')
  @ApiOperation({
    summary: 'Obter estatísticas de performance',
    description: 'Retorna métricas agregadas de performance da aplicação',
  })
  @ApiQuery({
    name: 'timeRange',
    required: false,
    description: 'Intervalo de tempo em minutos (padrão: 60)',
    example: 60,
  })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas de performance retornadas com sucesso',
  })
  getPerformanceStats(
    @Query('timeRange', new DefaultValuePipe(60), ParseIntPipe)
    timeRange: number,
  ) {
    const stats = this.performanceMetricsService.getStats(timeRange);

    return ResponseHelper.success(
      stats,
      200,
      'Estatísticas de performance obtidas com sucesso',
    );
  }

  @Get('performance/slow-requests')
  @ApiOperation({
    summary: 'Obter requisições lentas',
    description: 'Retorna lista das requisições mais lentas',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Número máximo de requisições a retornar (padrão: 50)',
    example: 50,
  })
  @ApiResponse({
    status: 200,
    description: 'Requisições lentas retornadas com sucesso',
  })
  getSlowRequests(
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    const slowRequests = this.performanceMetricsService.getSlowRequests(limit);

    return ResponseHelper.success(
      slowRequests,
      200,
      'Requisições lentas obtidas com sucesso',
    );
  }

  @Get('performance/clear')
  @ApiOperation({
    summary: 'Limpar métricas de performance',
    description: 'Remove todas as métricas armazenadas em memória',
  })
  @ApiResponse({
    status: 200,
    description: 'Métricas limpas com sucesso',
  })
  clearMetrics() {
    this.performanceMetricsService.clearMetrics();

    return ResponseHelper.success(
      null,
      200,
      'Métricas de performance limpas com sucesso',
    );
  }
}
