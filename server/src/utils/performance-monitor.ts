import { Logger } from '@nestjs/common';

export class PerformanceMonitor {
  private static logger = new Logger('PerformanceMonitor');
  private static timers = new Map<string, number>();

  static startTimer(operation: string): void {
    this.timers.set(operation, Date.now());
    this.logger.log(`⏱️  Started: ${operation}`);
  }

  static endTimer(operation: string): number {
    const startTime = this.timers.get(operation);
    if (!startTime) {
      this.logger.warn(`⚠️  Timer not found for operation: ${operation}`);
      return 0;
    }

    const duration = Date.now() - startTime;
    this.timers.delete(operation);
    
    this.logger.log(`✅ Completed: ${operation} in ${duration}ms`);
    return duration;
  }

  static logBatchPerformance(
    operation: string,
    batchSize: number,
    totalProcessed: number,
    duration: number
  ): void {
    const rowsPerSecond = Math.round((batchSize / duration) * 1000);
    const estimatedTotalTime = Math.round((totalProcessed / rowsPerSecond) * 1000);
    
    this.logger.log(`📊 ${operation} Performance:`);
    this.logger.log(`   Batch Size: ${batchSize} rows`);
    this.logger.log(`   Processing Rate: ${rowsPerSecond} rows/sec`);
    this.logger.log(`   Estimated Total Time: ${estimatedTotalTime}ms`);
  }

  static logMemoryUsage(): void {
    const memUsage = process.memoryUsage();
    this.logger.log(`💾 Memory Usage:`);
    this.logger.log(`   RSS: ${Math.round(memUsage.rss / 1024 / 1024)}MB`);
    this.logger.log(`   Heap Used: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`);
    this.logger.log(`   Heap Total: ${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`);
  }
}
