import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  HealthCheckService,
  PrismaHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { HealthService } from '../../core/health/health.service';
import { PrismaService } from '../../core/config/prisma.service';
import { IsPublic } from '../../core/decorators/is-public.decorator';
import { ResponseHelper } from '../../core/utils/response-helper';

@ApiTags('Health')
@Controller({ path: 'health', version: '1' })
@IsPublic()
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaHealth: PrismaHealthIndicator,
    private readonly memoryHealth: MemoryHealthIndicator,
    private readonly diskHealth: DiskHealthIndicator,
    private readonly healthService: HealthService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Health check básico',
    description:
      'Endpoint simples para verificar se a aplicação está respondendo',
  })
  @ApiResponse({
    status: 200,
    description: 'Aplicação está saudável',
  })
  async check() {
    return this.health.check([
      () => this.prismaHealth.pingCheck('database', this.prisma),
      () => this.memoryHealth.checkHeap('memory_heap', 150 * 1024 * 1024),
      () => this.memoryHealth.checkRSS('memory_rss', 150 * 1024 * 1024),
      () =>
        this.diskHealth.checkStorage('storage', {
          path: 'C:\\',
          thresholdPercent: 0.9,
        }),
    ]);
  }

  @Get('detailed')
  @ApiOperation({
    summary: 'Health check detalhado',
    description: 'Retorna informações detalhadas sobre a saúde do sistema',
  })
  @ApiResponse({
    status: 200,
    description: 'Informações detalhadas de saúde retornadas com sucesso',
  })
  async detailedCheck() {
    const systemHealth = await this.healthService.getSystemHealth();

    const statusCode =
      systemHealth.status === 'healthy'
        ? HttpStatus.OK
        : systemHealth.status === 'degraded'
          ? HttpStatus.OK
          : HttpStatus.SERVICE_UNAVAILABLE;

    return ResponseHelper.success(
      systemHealth,
      statusCode,
      `Sistema está ${systemHealth.status}`,
    );
  }

  @Get('live')
  @ApiOperation({
    summary: 'Liveness probe',
    description:
      'Endpoint para verificar se a aplicação está viva (usado pelo Kubernetes)',
  })
  @ApiResponse({
    status: 200,
    description: 'Aplicação está viva',
  })
  @ApiResponse({
    status: 503,
    description: 'Aplicação não está respondendo',
  })
  async liveness() {
    const isHealthy = await this.healthService.isHealthy();

    if (!isHealthy) {
      return ResponseHelper.custom<{ status: string; error: string }>(
        HttpStatus.SERVICE_UNAVAILABLE,
        { status: 'unhealthy', error: 'UNHEALTHY' },
        'Aplicação não está saudável',
      );
    }

    return ResponseHelper.success(
      { status: 'alive', timestamp: new Date().toISOString() },
      HttpStatus.OK,
      'Aplicação está viva',
    );
  }

  @Get('ready')
  @ApiOperation({
    summary: 'Readiness probe',
    description:
      'Endpoint para verificar se a aplicação está pronta para receber tráfego',
  })
  @ApiResponse({
    status: 200,
    description: 'Aplicação está pronta',
  })
  @ApiResponse({
    status: 503,
    description: 'Aplicação não está pronta',
  })
  async readiness() {
    const isReady = await this.healthService.isReady();

    if (!isReady) {
      return ResponseHelper.custom(
        HttpStatus.SERVICE_UNAVAILABLE,
        { status: 'not_ready', error: 'NOT_READY' },
        'Aplicação não está pronta',
      );
    }

    return ResponseHelper.success(
      { status: 'ready', timestamp: new Date().toISOString() },
      HttpStatus.OK,
      'Aplicação está pronta',
    );
  }

  @Get('metrics')
  @ApiOperation({
    summary: 'Métricas básicas do sistema',
    description: 'Retorna métricas básicas de performance e uso de recursos',
  })
  @ApiResponse({
    status: 200,
    description: 'Métricas retornadas com sucesso',
  })
  metrics() {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    const metrics = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        rss: Math.round(memoryUsage.rss / 1024 / 1024),
        external: Math.round(memoryUsage.external / 1024 / 1024),
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system,
      },
      process: {
        pid: process.pid,
        version: process.version,
        platform: process.platform,
        arch: process.arch,
      },
    };

    return ResponseHelper.success(
      metrics,
      HttpStatus.OK,
      'Métricas obtidas com sucesso',
    );
  }
}
