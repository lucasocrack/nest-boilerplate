import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { ConfigService } from '@nestjs/config';

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded';
  message: string;
  responseTime?: number;
  details?: Record<string, any>;
}

export interface SystemHealth {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  checks: {
    database: HealthCheckResult;
    memory: HealthCheckResult;
    disk: HealthCheckResult;
    external: HealthCheckResult;
  };
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private readonly startTime = Date.now();

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async getSystemHealth(): Promise<SystemHealth> {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkMemory(),
      this.checkDisk(),
      this.checkExternalServices(),
    ]);

    const [database, memory, disk, external] = checks.map(result => 
      result.status === 'fulfilled' ? result.value : {
        status: 'unhealthy' as const,
        message: 'Check failed',
        details: { error: result.reason?.message || 'Unknown error' }
      }
    );

    // Determinar status geral do sistema
    const overallStatus = this.determineOverallStatus([database, memory, disk, external]);

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime,
      checks: {
        database,
        memory,
        disk,
        external,
      },
    };
  }

  private async checkDatabase(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      // Teste de conectividade básica
      await this.prisma.$queryRaw`SELECT 1`;
      
      // Teste de performance - consulta simples
      const userCount = await this.prisma.user.count();
      
      const responseTime = Date.now() - startTime;
      
      if (responseTime > 1000) {
        return {
          status: 'degraded',
          message: 'Database responding slowly',
          responseTime,
          details: { userCount, threshold: '1000ms' }
        };
      }

      return {
        status: 'healthy',
        message: 'Database connection is healthy',
        responseTime,
        details: { userCount }
      };
    } catch (error) {
      this.logger.error('Database health check failed', error);
      return {
        status: 'unhealthy',
        message: 'Database connection failed',
        responseTime: Date.now() - startTime,
        details: { error: error.message }
      };
    }
  }

  private async checkMemory(): Promise<HealthCheckResult> {
    try {
      const memoryUsage = process.memoryUsage();
      const totalMemory = memoryUsage.heapTotal;
      const usedMemory = memoryUsage.heapUsed;
      const memoryUsagePercent = (usedMemory / totalMemory) * 100;

      // Converter para MB para melhor legibilidade
      const details = {
        heapUsed: Math.round(usedMemory / 1024 / 1024),
        heapTotal: Math.round(totalMemory / 1024 / 1024),
        usagePercent: Math.round(memoryUsagePercent),
        rss: Math.round(memoryUsage.rss / 1024 / 1024),
        external: Math.round(memoryUsage.external / 1024 / 1024),
      };

      if (memoryUsagePercent > 95) {
        return {
          status: 'unhealthy',
          message: 'Memory usage critically high',
          details
        };
      }

      if (memoryUsagePercent > 85) {
        return {
          status: 'degraded',
          message: 'Memory usage high',
          details
        };
      }

      return {
        status: 'healthy',
        message: 'Memory usage normal',
        details
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: 'Memory check failed',
        details: { error: error.message }
      };
    }
  }

  private async checkDisk(): Promise<HealthCheckResult> {
    try {
      // No Node.js, verificamos o espaço disponível usando fs
      const fs = require('fs').promises;
      const stats = await fs.stat(process.cwd());
      
      // Para uma verificação mais robusta, poderíamos usar uma lib como 'check-disk-space'
      // Por simplicidade, vamos verificar se conseguimos escrever um arquivo temporário
      const testFile = `${process.cwd()}/temp-health-check.txt`;
      await fs.writeFile(testFile, 'health check test');
      await fs.unlink(testFile);

      return {
        status: 'healthy',
        message: 'Disk access is healthy',
        details: {
          workingDirectory: process.cwd(),
          canWrite: true
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: 'Disk access failed',
        details: { error: error.message }
      };
    }
  }

  private async checkExternalServices(): Promise<HealthCheckResult> {
    const checks: Promise<void>[] = [];
    
    // Verificar serviços externos configurados
    const emailEnabled = this.configService.get('MAIL_HOST');
    
    if (emailEnabled) {
      checks.push(this.checkEmailService());
    }

    // Se não há serviços externos configurados
    if (checks.length === 0) {
      return {
        status: 'healthy',
        message: 'No external services configured',
        details: { services: [] }
      };
    }

    const results = await Promise.allSettled(checks);
    const failedChecks = results.filter(r => r.status === 'rejected').length;
    
    if (failedChecks === results.length) {
      return {
        status: 'unhealthy',
        message: 'All external services failed',
        details: { totalServices: results.length, failedServices: failedChecks }
      };
    }

    if (failedChecks > 0) {
      return {
        status: 'degraded',
        message: 'Some external services failed',
        details: { totalServices: results.length, failedServices: failedChecks }
      };
    }

    return {
      status: 'healthy',
      message: 'All external services healthy',
      details: { totalServices: results.length, failedServices: 0 }
    };
  }

  private async checkEmailService(): Promise<void> {
    // Verificação básica de conectividade com o servidor de email
    // Em um ambiente real, você poderia tentar uma conexão SMTP
    const mailHost = this.configService.get('MAIL_HOST');
    const mailPort = this.configService.get('MAIL_PORT');
    
    if (!mailHost || !mailPort) {
      throw new Error('Email service not properly configured');
    }

    // Aqui você poderia implementar uma verificação real de conectividade SMTP
    // Por simplicidade, vamos apenas verificar se as configurações existem
    return Promise.resolve();
  }

  private determineOverallStatus(checks: HealthCheckResult[]): 'healthy' | 'unhealthy' | 'degraded' {
    const unhealthyCount = checks.filter(check => check.status === 'unhealthy').length;
    const degradedCount = checks.filter(check => check.status === 'degraded').length;

    if (unhealthyCount > 0) {
      return 'unhealthy';
    }

    if (degradedCount > 0) {
      return 'degraded';
    }

    return 'healthy';
  }

  // Método para health check simples (usado pelo Kubernetes/Docker)
  async isHealthy(): Promise<boolean> {
    try {
      const health = await this.getSystemHealth();
      return health.status !== 'unhealthy';
    } catch {
      return false;
    }
  }

  // Método para readiness check
  async isReady(): Promise<boolean> {
    try {
      // Verificar apenas componentes críticos para readiness
      const dbCheck = await this.checkDatabase();
      return dbCheck.status !== 'unhealthy';
    } catch {
      return false;
    }
  }
}