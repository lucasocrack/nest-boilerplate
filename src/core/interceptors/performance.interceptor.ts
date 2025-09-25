import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { PerformanceMetricsService } from '../monitoring/performance-metrics.service';

export interface PerformanceMetrics {
  method: string;
  url: string;
  statusCode: number;
  responseTime: number;
  timestamp: Date;
  userAgent?: string;
  ip?: string;
}

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  private readonly logger = new Logger(PerformanceInterceptor.name);
  private readonly slowRequestThreshold = 1000; // 1 segundo

  constructor(
    private readonly performanceMetricsService: PerformanceMetricsService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse();
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        const metrics: PerformanceMetrics = {
          method: request.method,
          url: request.url,
          statusCode: response.statusCode,
          responseTime,
          timestamp: new Date(),
          userAgent: request.get('User-Agent'),
          ip: request.ip || request.connection.remoteAddress,
        };

        // Log requisições lentas
        if (responseTime > this.slowRequestThreshold) {
          this.logger.warn(
            `Requisição lenta detectada: ${metrics.method} ${metrics.url} - ${responseTime}ms`,
            {
              ...metrics,
              type: 'slow_request',
            },
          );
        }

        // Log métricas de performance (apenas em debug)
        this.logger.debug(
          `${metrics.method} ${metrics.url} - ${responseTime}ms`,
          {
            ...metrics,
            type: 'performance_metric',
          },
        );

        // Coletar métricas usando o serviço dedicado
        this.performanceMetricsService.collectMetric(metrics);
      }),
    );
  }
}
