import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { ConfigService } from '@nestjs/config';
import { promises as fs } from 'fs';

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

    const [database, memory, disk, external] = checks.map((result) =>
      result.status === 'fulfilled'
        ? result.value
        : {
            status: 'unhealthy' as const,
            message: 'Check failed',
            details: {
              error:
                result.reason instanceof Error
                  ? result.reason.message
                  : 'Unknown error',
            },
          },
    );

    const overallStatus = this.determineOverallStatus([
      database,
      memory,
      disk,
      external,
    ]);

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
      await this.prisma.$queryRaw`SELECT 1`;
      const userCount = await this.prisma.user.count();

      const responseTime = Date.now() - startTime;

      if (responseTime > 1000) {
        return {
          status: 'degraded',
          message: 'Database responding slowly',
          responseTime,
          details: { userCount, threshold: '1000ms' },
        };
      }

      return {
        status: 'healthy',
        message: 'Database connection is healthy',
        responseTime,
        details: { userCount },
      };
    } catch (error) {
      this.logger.error('Database health check failed', error);
      return {
        status: 'unhealthy',
        message: 'Database connection failed',
        responseTime: Date.now() - startTime,
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  private checkMemory(): HealthCheckResult {
    try {
      const memoryUsage = process.memoryUsage();
      const totalMemory = memoryUsage.heapTotal;
      const usedMemory = memoryUsage.heapUsed;
      const memoryUsagePercent = (usedMemory / totalMemory) * 100;

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
          details,
        };
      }

      if (memoryUsagePercent > 85) {
        return {
          status: 'degraded',
          message: 'Memory usage high',
          details,
        };
      }

      return {
        status: 'healthy',
        message: 'Memory usage normal',
        details,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: 'Memory check failed',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  private async checkDisk(): Promise<HealthCheckResult> {
    try {
      const testFile = `${process.cwd()}/temp-health-check.txt`;
      await fs.writeFile(testFile, 'health check test');
      await fs.unlink(testFile);

      return {
        status: 'healthy',
        message: 'Disk access is healthy',
        details: {
          workingDirectory: process.cwd(),
          canWrite: true,
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: 'Disk access failed',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  private async checkExternalServices(): Promise<HealthCheckResult> {
    const checks: Promise<void>[] = [];

    const emailEnabled = this.configService.get<string>('MAIL_HOST');

    if (emailEnabled) {
      checks.push(this.checkEmailService());
    }
    if (checks.length === 0) {
      return {
        status: 'healthy',
        message: 'No external services configured',
        details: { services: [] },
      };
    }

    const results = await Promise.allSettled(checks);
    const failedChecks = results.filter((r) => r.status === 'rejected').length;

    if (failedChecks === results.length) {
      return {
        status: 'unhealthy',
        message: 'All external services failed',
        details: {
          totalServices: results.length,
          failedServices: failedChecks,
        },
      };
    }

    if (failedChecks > 0) {
      return {
        status: 'degraded',
        message: 'Some external services failed',
        details: {
          totalServices: results.length,
          failedServices: failedChecks,
        },
      };
    }

    return {
      status: 'healthy',
      message: 'All external services healthy',
      details: { totalServices: results.length, failedServices: 0 },
    };
  }

  private async checkEmailService(): Promise<void> {
    const mailHost = this.configService.get<string>('MAIL_HOST');
    const mailPort = this.configService.get<string>('MAIL_PORT');

    if (!mailHost || !mailPort) {
      throw new Error('Email service not properly configured');
    }

    return Promise.resolve();
  }

  private determineOverallStatus(
    checks: HealthCheckResult[],
  ): 'healthy' | 'unhealthy' | 'degraded' {
    const unhealthyCount = checks.filter(
      (check) => check.status === 'unhealthy',
    ).length;
    const degradedCount = checks.filter(
      (check) => check.status === 'degraded',
    ).length;

    if (unhealthyCount > 0) {
      return 'unhealthy';
    }

    if (degradedCount > 0) {
      return 'degraded';
    }

    return 'healthy';
  }

  async isHealthy(): Promise<boolean> {
    try {
      const health = await this.getSystemHealth();
      return health.status !== 'unhealthy';
    } catch {
      return false;
    }
  }

  async isReady(): Promise<boolean> {
    try {
      const dbCheck = await this.checkDatabase();
      return dbCheck.status !== 'unhealthy';
    } catch {
      return false;
    }
  }
}
