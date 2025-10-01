"use client";

/**
 * Performance monitoring utilities for customization operations
 */

interface PerformanceMetric {
  operation: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

class CustomizationPerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private readonly MAX_METRICS = 100; // Keep only last 100 metrics

  /**
   * Start timing an operation
   */
  startTiming(operation: string): () => void {
    const startTime = performance.now();

    return (metadata?: Record<string, any>) => {
      const duration = performance.now() - startTime;
      this.recordMetric({
        operation,
        duration,
        timestamp: Date.now(),
        ...(metadata && { metadata }),
      });
    };
  }

  /**
   * Record a performance metric
   */
  private recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);

    // Keep only the most recent metrics
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }

    // Log slow operations in development
    if (process.env['NODE_ENV'] === "development" && metric.duration > 100) {
      console.warn(`Slow customization operation: ${metric.operation} took ${metric.duration.toFixed(2)}ms`, metric.metadata);
    }
  }

  /**
   * Get performance statistics
   */
  getStats() {
    if (this.metrics.length === 0) {
      return null;
    }

    const operationStats = new Map<string, { count: number; totalDuration: number; avgDuration: number; maxDuration: number }>();

    for (const metric of this.metrics) {
      const existing = operationStats.get(metric.operation) || {
        count: 0,
        totalDuration: 0,
        avgDuration: 0,
        maxDuration: 0,
      };

      existing.count++;
      existing.totalDuration += metric.duration;
      existing.maxDuration = Math.max(existing.maxDuration, metric.duration);
      existing.avgDuration = existing.totalDuration / existing.count;

      operationStats.set(metric.operation, existing);
    }

    return {
      totalMetrics: this.metrics.length,
      operations: Object.fromEntries(operationStats),
      recentMetrics: this.metrics.slice(-10), // Last 10 metrics
    };
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
  }

  /**
   * Get metrics for a specific operation
   */
  getOperationMetrics(operation: string): PerformanceMetric[] {
    return this.metrics.filter(m => m.operation === operation);
  }
}

// Singleton instance
const performanceMonitor = new CustomizationPerformanceMonitor();

export { performanceMonitor };

/**
 * Hook to use performance monitoring in React components
 */
export function useCustomizationPerformance() {
  return {
    startTiming: (operation: string) => performanceMonitor.startTiming(operation),
    getStats: () => performanceMonitor.getStats(),
    clear: () => performanceMonitor.clear(),
    getOperationMetrics: (operation: string) => performanceMonitor.getOperationMetrics(operation),
  };
}

/**
 * Higher-order function to wrap functions with performance monitoring
 */
export function withPerformanceMonitoring<T extends (...args: any[]) => any>(
  fn: T,
  operationName: string
): T {
  return ((...args: any[]) => {
    const endTiming = performanceMonitor.startTiming(operationName);

    try {
      const result = fn(...args);

      // Handle async functions
      if (result instanceof Promise) {
        return result.finally(() => {
          endTiming();
        });
      }

      endTiming();
      return result;
    } catch (error) {
      endTiming();
      throw error;
    }
  }) as T;
}

/**
 * Decorator for class methods (if using TypeScript decorators)
 */
export function performanceMonitored(operationName?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const operation = operationName || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = function (...args: any[]) {
      const endTiming = performanceMonitor.startTiming(operation);

      try {
        const result = originalMethod.apply(this, args);

        if (result instanceof Promise) {
          return result.finally(() => {
            endTiming();
          });
        }

        endTiming();
        return result;
      } catch (error) {
        endTiming();
        throw error;
      }
    };

    return descriptor;
  };
}
