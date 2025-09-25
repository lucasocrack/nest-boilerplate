import { Injectable, Logger } from '@nestjs/common';
import { PerformanceMetrics } from '../interceptors/performance.interceptor';

export interface PerformanceStats {
  totalRequests: number;
  averageResponseTime: number;
  slowRequests: number;
  requestsByMethod: Record<string, number>;
  requestsByStatus: Record<string, number>;
  topSlowEndpoints: Array<{
    endpoint: string;
    averageTime: number;
    count: number;
  }>;
}

@Injectable()
export class PerformanceMetricsService {
  private readonly logger = new Logger(PerformanceMetricsService.name);
  private metrics: PerformanceMetrics[] = [];
  private readonly maxMetricsInMemory = 10000; // Limite para evitar vazamento de memória
  private readonly slowRequestThreshold = 1000;

  collectMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);

    // Limpar métricas antigas para evitar vazamento de memória
    if (this.metrics.length > this.maxMetricsInMemory) {
      this.metrics = this.metrics.slice(-this.maxMetricsInMemory / 2);
    }
  }

  getStats(timeRangeMinutes: number = 60): PerformanceStats {
    const cutoffTime = new Date(Date.now() - timeRangeMinutes * 60 * 1000);
    const recentMetrics = this.metrics.filter(
      (metric) => metric.timestamp >= cutoffTime,
    );

    if (recentMetrics.length === 0) {
      return this.getEmptyStats();
    }

    const totalRequests = recentMetrics.length;
    const totalResponseTime = recentMetrics.reduce(
      (sum, metric) => sum + metric.responseTime,
      0,
    );
    const averageResponseTime = Math.round(totalResponseTime / totalRequests);
    const slowRequests = recentMetrics.filter(
      (metric) => metric.responseTime > this.slowRequestThreshold,
    ).length;

    // Agrupar por método HTTP
    const requestsByMethod = recentMetrics.reduce(
      (acc, metric) => {
        acc[metric.method] = (acc[metric.method] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Agrupar por status code
    const requestsByStatus = recentMetrics.reduce(
      (acc, metric) => {
        const statusRange = `${Math.floor(metric.statusCode / 100)}xx`;
        acc[statusRange] = (acc[statusRange] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Top endpoints mais lentos
    const endpointStats = recentMetrics.reduce(
      (acc, metric) => {
        const key = `${metric.method} ${metric.url}`;
        if (!acc[key]) {
          acc[key] = { totalTime: 0, count: 0 };
        }
        acc[key].totalTime += metric.responseTime;
        acc[key].count += 1;
        return acc;
      },
      {} as Record<string, { totalTime: number; count: number }>,
    );

    const topSlowEndpoints = Object.entries(endpointStats)
      .map(([endpoint, stats]) => ({
        endpoint,
        averageTime: Math.round(stats.totalTime / stats.count),
        count: stats.count,
      }))
      .sort((a, b) => b.averageTime - a.averageTime)
      .slice(0, 10);

    return {
      totalRequests,
      averageResponseTime,
      slowRequests,
      requestsByMethod,
      requestsByStatus,
      topSlowEndpoints,
    };
  }

  getSlowRequests(limit: number = 50): PerformanceMetrics[] {
    return this.metrics
      .filter((metric) => metric.responseTime > this.slowRequestThreshold)
      .sort((a, b) => b.responseTime - a.responseTime)
      .slice(0, limit);
  }

  clearMetrics(): void {
    this.metrics = [];
    this.logger.log('Métricas de performance limpas');
  }

  private getEmptyStats(): PerformanceStats {
    return {
      totalRequests: 0,
      averageResponseTime: 0,
      slowRequests: 0,
      requestsByMethod: {},
      requestsByStatus: {},
      topSlowEndpoints: [],
    };
  }
}
