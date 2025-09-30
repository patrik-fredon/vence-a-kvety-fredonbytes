import { useCallback, useEffect, useRef, useState } from "react";
import { performanceMonitor } from "@/lib/monitoring/performance-monitor";

/**
 * Performance metrics for component rendering
 */
export interface ComponentPerformanceMetrics {
  componentName: string;
  renderStartTime: number;
  renderEndTime?: number;
  renderDuration?: number;
  mountTime?: number;
  updateCount: number;
  lastUpdateTime?: number;
  isFirstRender: boolean;
  props?: Record<string, unknown>;
}

/**
 * Options for performance monitoring
 */
export interface UsePerformanceMonitorOptions {
  /** Enable/disable monitoring */
  enabled?: boolean;
  /** Log metrics to console in development */
  logMetrics?: boolean;
  /** Component name for identification */
  componentName: string;
  /** Track prop changes */
  trackProps?: boolean;
  /** Callback when metrics are collected */
  onMetrics?: (metrics: ComponentPerformanceMetrics) => void;
  /** Threshold for slow render warning (ms) */
  slowRenderThreshold?: number;
}

/**
 * Return type for the hook
 */
export interface UsePerformanceMonitorResult {
  /** Start performance tracking */
  startTracking: () => void;
  /** End performance tracking */
  endTracking: () => void;
  /** Mark component as mounted */
  markMounted: () => void;
  /** Current performance metrics */
  metrics: ComponentPerformanceMetrics | null;
  /** Whether tracking is active */
  isTracking: boolean;
}

/**
 * Custom hook for monitoring React component performance
 *
 * @example
 * ```tsx
 * function MyComponent(props) {
 *   const { startTracking, endTracking, markMounted, metrics } = usePerformanceMonitor({
 *     componentName: 'MyComponent',
 *     trackProps: true,
 *     slowRenderThreshold: 16 // 60fps target
 *   });
 *
 *   // Automatically track render performance
 *   useEffect(() => {
 *     markMounted();
 *   }, []);
 *
 *   return <div>Component content</div>;
 * }
 * ```
 */
export const usePerformanceMonitor = (
  options: UsePerformanceMonitorOptions
): UsePerformanceMonitorResult => {
  const {
    enabled = true,
    logMetrics = process.env['NODE_ENV'] === "development",
    componentName,
    trackProps = false,
    onMetrics,
    slowRenderThreshold = 16, // 60fps = 16.67ms per frame
  } = options;

  const [metrics, setMetrics] = useState<ComponentPerformanceMetrics | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  // Refs to persist values across renders
  const renderStartTimeRef = useRef<number | null>(null);
  const mountTimeRef = useRef<number | null>(null);
  const updateCountRef = useRef(0);
  const isFirstRenderRef = useRef(true);
  const previousPropsRef = useRef<Record<string, unknown> | null>(null);
  const autoTrackingRef = useRef(false);

  /**
   * Start tracking render performance
   */
  const startTracking = useCallback(() => {
    if (!enabled) return;

    const startTime = performance.now();
    renderStartTimeRef.current = startTime;
    setIsTracking(true);

    // Increment update count
    updateCountRef.current += 1;

    if (logMetrics) {
      console.log(`🔍 [PerformanceMonitor] Started tracking render: ${componentName}`);
    }
  }, [enabled, componentName, logMetrics]);

  /**
   * End tracking and calculate metrics
   */
  const endTracking = useCallback(() => {
    if (!(enabled && renderStartTimeRef.current)) return;

    const endTime = performance.now();
    const renderDuration = endTime - renderStartTimeRef.current;
    const isFirstRender = isFirstRenderRef.current;

    // Create metrics object
    const newMetrics: ComponentPerformanceMetrics = {
      componentName,
      renderStartTime: renderStartTimeRef.current,
      renderEndTime: endTime,
      renderDuration,
      mountTime: mountTimeRef.current || undefined,
      updateCount: updateCountRef.current,
      lastUpdateTime: endTime,
      isFirstRender,
      props: trackProps ? previousPropsRef.current : undefined,
    };

    setMetrics(newMetrics);
    setIsTracking(false);
    isFirstRenderRef.current = false;

    // Log performance metrics
    if (logMetrics) {
      const isSlowRender = renderDuration > slowRenderThreshold;
      const logLevel = isSlowRender ? "warn" : "log";

      console[logLevel](`⚡ [PerformanceMonitor] ${componentName} render completed:`, {
        duration: `${renderDuration.toFixed(2)}ms`,
        isFirstRender,
        updateCount: updateCountRef.current,
        isSlowRender,
        threshold: `${slowRenderThreshold}ms`,
      });

      if (isSlowRender) {
        console.warn(`🐌 [PerformanceMonitor] Slow render detected in ${componentName}!`);
      }
    }

    // Record metric in global performance monitor
    performanceMonitor.recordMetric(
      `COMPONENT_RENDER_${componentName.toUpperCase()}`,
      renderDuration,
      `Component: ${componentName} (${isFirstRender ? "mount" : "update"})`
    );

    // Call callback if provided
    onMetrics?.(newMetrics);

    // Reset tracking state
    renderStartTimeRef.current = null;
  }, [enabled, componentName, trackProps, logMetrics, slowRenderThreshold, onMetrics]);

  /**
   * Mark component as mounted
   */
  const markMounted = useCallback(() => {
    if (!enabled) return;

    const mountTime = performance.now();
    mountTimeRef.current = mountTime;

    if (logMetrics) {
      console.log(`🏗️ [PerformanceMonitor] ${componentName} mounted at ${mountTime.toFixed(2)}ms`);
    }

    // Record mount time in global performance monitor
    performanceMonitor.recordMetric(
      `COMPONENT_MOUNT_${componentName.toUpperCase()}`,
      mountTime,
      `Component: ${componentName} mount`
    );
  }, [enabled, componentName, logMetrics]);

  /**
   * Auto-track render cycles (only in non-test environments)
   */
  useEffect(() => {
    if (!enabled || process.env['NODE_ENV'] === "test") return;

    // Prevent multiple auto-tracking sessions
    if (autoTrackingRef.current) return;
    autoTrackingRef.current = true;

    // Start tracking at the beginning of each render cycle
    startTracking();

    // End tracking after render is complete (next tick)
    const timeoutId = setTimeout(() => {
      endTracking();
      autoTrackingRef.current = false;
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      autoTrackingRef.current = false;
    };
  });

  /**
   * Track prop changes if enabled
   */
  useEffect(() => {
    if (!(enabled && trackProps)) return;

    // Store current props for comparison
    // Note: This is a simplified prop tracking - in real scenarios,
    // you might want to pass props explicitly to the hook
    previousPropsRef.current = { timestamp: Date.now() };
  });

  return {
    startTracking,
    endTracking,
    markMounted,
    metrics,
    isTracking,
  };
};

export default usePerformanceMonitor;
