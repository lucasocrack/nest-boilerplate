import { Module } from '@nestjs/common';
import { MonitoringController } from './monitoring.controller';
import { PerformanceMetricsService } from '../../core/monitoring/performance-metrics.service';

@Module({
  controllers: [MonitoringController],
  providers: [PerformanceMetricsService],
  exports: [PerformanceMetricsService],
})
export class MonitoringModule {}
