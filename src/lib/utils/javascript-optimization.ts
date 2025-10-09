"use client";

/**
 * JavaScript optimization utilities for improving FID and INP
 */

/**
 * Break up long tasks using scheduler.postTask or setTimeout
 */
export function yieldToMain(): Promise<void> {
  return new Promise((resolve) => {
    // Use scheduler.postTask if available (Chrome 94+)
    if ("scheduler" in window && "postTask" in (window as any).scheduler) {
      (window as any).scheduler.postTask(() => resolve(), { priority: "user-blocking" });
    } else {
      // Fallback to setTimeout
      setTimeout(resolve, 0);
    }
  });
}

/**
 * Execute a function with automatic yielding for long tasks
 */
export async function executeWithYielding<T>(
  fn: () => T | Promise<T>,
  yieldThreshold: number = 5
): Promise<T> {
  const startTime = performance.now();

  try {
    const result = await fn();

    // Check if we've exceeded the threshold
    const duration = performance.now() - startTime;
    if (duration > yieldThreshold) {
      await yieldToMain();
    }

    return result;
  } catch (error) {
    // Still yield even if there's an error
    const duration = performance.now() - startTime;
    if (duration > yieldThreshold) {
      await yieldToMain();
    }
    throw error;
  }
}

/**
 * Process array items with yielding to prevent blocking
 */
export async function processArrayWithYielding<T, R>(
  items: T[],
  processor: (item: T, index: number) => R | Promise<R>,
  batchSize: number = 10
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);

    // Process batch
    const batchResults = await Promise.all(
      batch.map((item, batchIndex) => processor(item, i + batchIndex))
    );

    results.push(...batchResults);

    // Yield to main thread after each batch
    if (i + batchSize < items.length) {
      await yieldToMain();
    }
  }

  return results;
}

/**
 * Debounce function with immediate execution option
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate: boolean = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };

    const callNow = immediate && !timeout;

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) func(...args);
  };
}

/**
 * Throttle function to limit execution frequency
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Request idle callback with fallback
 */
export function requestIdleCallback(
  callback: (deadline: { timeRemaining: () => number; didTimeout: boolean }) => void,
  options: { timeout?: number } = {}
): number {
  if ("requestIdleCallback" in window) {
    return (window as any).requestIdleCallback(callback, options);
  } else {
    // Fallback for browsers without requestIdleCallback
    const startTime = performance.now();
    return setTimeout(() => {
      callback({
        timeRemaining: () => Math.max(0, 50 - (performance.now() - startTime)),
        didTimeout: false,
      });
    }, 1) as any;
  }
}

/**
 * Cancel idle callback with fallback
 */
export function cancelIdleCallback(id: number): void {
  if ("cancelIdleCallback" in window) {
    (window as any).cancelIdleCallback(id);
  } else {
    clearTimeout(id);
  }
}

/**
 * Optimize event handlers to reduce INP
 */
export function optimizeEventHandler<T extends Event>(
  handler: (event: T) => void | Promise<void>,
  options: {
    debounce?: number;
    throttle?: number;
    passive?: boolean;
  } = {}
): (event: T) => void {
  let optimizedHandler = handler;

  // Apply debouncing if specified
  if (options.debounce) {
    optimizedHandler = debounce(handler, options.debounce);
  }

  // Apply throttling if specified (takes precedence over debounce)
  if (options.throttle) {
    optimizedHandler = throttle(handler, options.throttle);
  }

  // Wrap with yielding for long tasks
  return async (event: T) => {
    await executeWithYielding(() => optimizedHandler(event));
  };
}

/**
 * Preload critical resources to improve LCP
 */
export function preloadResource(
  href: string,
  as: "script" | "style" | "image" | "font" | "fetch",
  options: {
    crossorigin?: "anonymous" | "use-credentials";
    type?: string;
    media?: string;
  } = {}
): void {
  if (typeof document === "undefined") return;

  // Check if already preloaded
  const existing = document.querySelector(`link[rel="preload"][href="${href}"]`);
  if (existing) return;

  const link = document.createElement("link");
  link.rel = "preload";
  link.href = href;
  link.as = as;

  if (options.crossorigin) {
    link.crossOrigin = options.crossorigin;
  }

  if (options.type) {
    link.type = options.type;
  }

  if (options.media) {
    link.media = options.media;
  }

  document.head.appendChild(link);
}

/**
 * Prefetch resources for future navigation
 */
export function prefetchResource(href: string): void {
  if (typeof document === "undefined") return;

  // Check if already prefetched
  const existing = document.querySelector(`link[rel="prefetch"][href="${href}"]`);
  if (existing) return;

  const link = document.createElement("link");
  link.rel = "prefetch";
  link.href = href;

  document.head.appendChild(link);
}

/**
 * Measure and optimize JavaScript execution time
 */
export class JavaScriptProfiler {
  private measurements: Map<string, number[]> = new Map();

  /**
   * Measure execution time of a function
   */
  async measure<T>(name: string, fn: () => T | Promise<T>): Promise<T> {
    const startTime = performance.now();

    try {
      const result = await fn();
      const duration = performance.now() - startTime;

      // Store measurement
      if (!this.measurements.has(name)) {
        this.measurements.set(name, []);
      }
      this.measurements.get(name)?.push(duration);

      // Log slow executions in development
      if (process.env["NODE_ENV"] === "development" && duration > 50) {
        console.warn(`🐌 [JSProfiler] Slow execution: ${name} took ${duration.toFixed(2)}ms`);
      }

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;

      // Still record the measurement for failed executions
      if (!this.measurements.has(name)) {
        this.measurements.set(name, []);
      }
      this.measurements.get(name)?.push(duration);

      throw error;
    }
  }

  /**
   * Get performance statistics for a measurement
   */
  getStats(name: string): {
    count: number;
    average: number;
    min: number;
    max: number;
    total: number;
  } | null {
    const measurements = this.measurements.get(name);
    if (!measurements || measurements.length === 0) return null;

    const total = measurements.reduce((sum, time) => sum + time, 0);
    const average = total / measurements.length;
    const min = Math.min(...measurements);
    const max = Math.max(...measurements);

    return {
      count: measurements.length,
      average,
      min,
      max,
      total,
    };
  }

  /**
   * Get all measurements
   */
  getAllStats(): Record<string, ReturnType<JavaScriptProfiler["getStats"]>> {
    const stats: Record<string, ReturnType<JavaScriptProfiler["getStats"]>> = {};

    for (const [name] of this.measurements) {
      stats[name] = this.getStats(name);
    }

    return stats;
  }

  /**
   * Clear all measurements
   */
  clear(): void {
    this.measurements.clear();
  }
}

// Global profiler instance
export const jsProfiler = new JavaScriptProfiler();

/**
 * React hook for optimizing component JavaScript execution
 */
export function useJavaScriptOptimization(componentName: string) {
  const measureExecution = async <T>(taskName: string, fn: () => T | Promise<T>): Promise<T> => {
    return jsProfiler.measure(`${componentName}_${taskName}`, fn);
  };

  const optimizedEventHandler = <T extends Event>(
    handler: (event: T) => void | Promise<void>,
    options: Parameters<typeof optimizeEventHandler>[1] = {}
  ) => {
    return optimizeEventHandler(handler, options);
  };

  return {
    measureExecution,
    optimizedEventHandler,
    getStats: () => jsProfiler.getStats(componentName),
  };
}
