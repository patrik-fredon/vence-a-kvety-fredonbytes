'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { performanceMonitor } from '@/lib/monitoring/performance-monitor';

/**
 * Core Web Vitals metrics interface
 */
export interface CoreWebVitalsMetrics {
  /** Largest Contentful Paint (LCP) in milliseconds */
  lcp?: number;
  /** First Input Delay (FID) in milliseconds */
  fid?: number;
  /** Interaction to Next Paint (INP) in milliseconds */
  inp?: number;
  /** Cumulative Layout Shift (CLS) score */
  cls?: number;
  /** First Contentful Paint (FCP) in milliseconds */
  fcp?: number;
  /** Time to First Byte (TTFB) in milliseconds */
  ttfb?: number;
  /** Component name for tracking */
  componentName: string;
  /** Timestamp when metrics were recorded */
  timestamp: number;
  /** Performance rating for each metric */
  ratings: {
    lcp?: 'good' | 'needs-improvement' | 'poor';
    fid?: 'good' | 'needs-improvement' | 'poor';
    inp?: 'good' | 'needs-improvement' | 'poor';
    cls?: 'good' | 'needs-improvement' | 'poor';
    fcp?: 'good' | 'needs-improvement' | 'poor';
    ttfb?: 'good' | 'needs-improvement' | 'poor';
  };
  /** Optimization recommendations */
  optimizations: {
    cls: string[];
    lcp: string[];
    fid: string[];
    inp: string[];
  };
}

/**
 * Options for Core Web Vitals optimization
 */
export interface CoreWebVitalsOptions {
  /** Component name for tracking */
  componentName: string;
  /** Enable Core Web Vitals tracking */
  enabled?: boolean;
  /** Enable CLS optimization tracking */
  trackCLS?: boolean;
  /** Enable LCP optimization tracking */
  trackLCP?: boolean;
  /** Enable FID/INP optimization tracking */
  trackFID?: boolean;
  /** Enable image space reservation for CLS */
  reserveImageSpace?: boolean;
  /** Enable JavaScript optimization for FID */
  optimizeJavaScript?: boolean;
  /** Enable image prioritization for LCP */
  prioritizeImages?: boolean;
  /** Callback when metrics are updated */
  onMetricsUpdate?: (metrics: CoreWebVitalsMetrics) => void;
  /** Callback when optimization opportunities are found */
  onOptimizationFound?: (optimization: string, metric: string) => void;
}

/**
 * Return type for Core Web Vitals hook
 */
export interface CoreWebVitalsResult {
  /** Current Core Web Vitals metrics */
  metrics: CoreWebVitalsMetrics | null;
  /** Start tracking Core Web Vitals */
  startTracking: () => void;
  /** Stop tracking Core Web Vitals */
  stopTracking: () => void;
  /** Record layout shift for CLS calculation */
  recordLayoutShift: (shift: number, element?: Element) => void;
  /** Record image load for LCP optimization */
  recordImageLoad: (src: string, loadTime: number, isLCP?: boolean) => void;
  /** Record JavaScript execution for FID optimization */
  recordJSExecution: (taskName: string, duration: number) => void;
  /** Reserve space for image to prevent CLS */
  reserveImageSpace: (width: number, height: number) => React.CSSProperties;
  /** Get optimization recommendations */
  getOptimizations: () => string[];
  /** Whether tracking is active */
  isTracking: boolean;
}

/**
 * Core Web Vitals optimization hook
 * Implements comprehensive tracking and optimization for all Core Web Vitals metrics
 */
export const useCoreWebVitals = (options: CoreWebVitalsOptions): CoreWebVitalsResult => {
  const {
    componentName,
    enabled = true,
    trackCLS = true,
    trackLCP = true,
    trackFID = true,
    reserveImageSpace = true,
    optimizeJavaScript = true,
    prioritizeImages = true,
    onMetricsUpdate,
    onOptimizationFound,
  } = options;

  const [metrics, setMetrics] = useState<CoreWebVitalsMetrics | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  // Refs for tracking data
  const layoutShiftsRef = useRef<Array<{ value: number; element?: Element; timestamp: number }>>([]);
  const imageLoadsRef = useRef<Array<{ src: string; loadTime: number; isLCP?: boolean; timestamp: number }>>([]);
  const jsExecutionsRef = useRef<Array<{ taskName: string; duration: number; timestamp: number }>>([]);
  const webVitalsObserverRef = useRef<PerformanceObserver | null>(null);
  const layoutShiftObserverRef = useRef<PerformanceObserver | null>(null);

  /**
   * Get performance rating based on thresholds
   */
  const getPerformanceRating = useCallback((metricName: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
    const thresholds = {
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      INP: { good: 200, poor: 500 },
      CLS: { good: 0.1, poor: 0.25 },
      FCP: { good: 1800, poor: 3000 },
      TTFB: { good: 800, poor: 1800 },
    };

    const threshold = thresholds[metricName as keyof typeof thresholds];
    if (!threshold) return 'good';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }, []);

  /**
   * Generate optimization recommendations based on metrics
   */
  const generateOptimizations = useCallback((currentMetrics: CoreWebVitalsMetrics): CoreWebVitalsMetrics['optimizations'] => {
    const optimizations: CoreWebVitalsMetrics['optimizations'] = {
      cls: [],
      lcp: [],
      fid: [],
      inp: [],
    };

    // CLS optimizations
    if (currentMetrics.cls && currentMetrics.cls > 0.1) {
      optimizations.cls.push('Reserve space for images and dynamic content');
      optimizations.cls.push('Avoid inserting content above existing content');
      optimizations.cls.push('Use CSS aspect-ratio or explicit dimensions for media');
      if (currentMetrics.cls > 0.25) {
        optimizations.cls.push('CRITICAL: Implement skeleton screens for loading states');
      }
    }

    // LCP optimizations
    if (currentMetrics.lcp && currentMetrics.lcp > 2500) {
      optimizations.lcp.push('Optimize and prioritize above-the-fold images');
      optimizations.lcp.push('Use preload for critical resources');
      optimizations.lcp.push('Minimize server response time');
      if (currentMetrics.lcp > 4000) {
        optimizations.lcp.push('CRITICAL: Implement image optimization and CDN');
        optimizations.lcp.push('CRITICAL: Use Next.js Image component with priority');
      }
    }

    // FID optimizations
    if (currentMetrics.fid && currentMetrics.fid > 100) {
      optimizations.fid.push('Break up long JavaScript tasks');
      optimizations.fid.push('Use code splitting and lazy loading');
      optimizations.fid.push('Defer non-critical JavaScript');
      if (currentMetrics.fid > 300) {
        optimizations.fid.push('CRITICAL: Implement web workers for heavy computations');
      }
    }

    // INP optimizations
    if (currentMetrics.inp && currentMetrics.inp > 200) {
      optimizations.inp.push('Optimize event handlers and reduce JavaScript execution time');
      optimizations.inp.push('Use React.memo and useCallback for expensive operations');
      optimizations.inp.push('Implement virtual scrolling for large lists');
      if (currentMetrics.inp > 500) {
        optimizations.inp.push('CRITICAL: Debounce user interactions and optimize render cycles');
      }
    }

    return optimizations;
  }, []);

  /**
   * Update metrics and trigger callbacks
   */
  const updateMetrics = useCallback((updates: Partial<CoreWebVitalsMetrics>) => {
    setMetrics(prev => {
      const newMetrics: CoreWebVitalsMetrics = {
        componentName,
        timestamp: Date.now(),
        ratings: {},
        optimizations: { cls: [], lcp: [], fid: [], inp: [] },
        ...prev,
        ...updates,
      };

      // Calculate ratings
      if (newMetrics.lcp) newMetrics.ratings.lcp = getPerformanceRating('LCP', newMetrics.lcp);
      if (newMetrics.fid) newMetrics.ratings.fid = getPerformanceRating('FID', newMetrics.fid);
      if (newMetrics.inp) newMetrics.ratings.inp = getPerformanceRating('INP', newMetrics.inp);
      if (newMetrics.cls) newMetrics.ratings.cls = getPerformanceRating('CLS', newMetrics.cls);
      if (newMetrics.fcp) newMetrics.ratings.fcp = getPerformanceRating('FCP', newMetrics.fcp);
      if (newMetrics.ttfb) newMetrics.ratings.ttfb = getPerformanceRating('TTFB', newMetrics.ttfb);

      // Generate optimizations
      newMetrics.optimizations = generateOptimizations(newMetrics);

      // Trigger callbacks
      onMetricsUpdate?.(newMetrics);

      // Check for new optimization opportunities
      Object.entries(newMetrics.optimizations).forEach(([metric, opts]) => {
        opts.forEach(opt => {
          if (opt.startsWith('CRITICAL:')) {
            onOptimizationFound?.(opt, metric);
          }
        });
      });

      return newMetrics;
    });
  }, [componentName, getPerformanceRating, generateOptimizations, onMetricsUpdate, onOptimizationFound]);

  /**
   * Initialize Web Vitals tracking
   */
  const initializeWebVitals = useCallback(async () => {
    if (typeof window === 'undefined' || process.env['NODE_ENV'] === 'development') return;

    try {
      // Dynamic import to avoid SSR issues
      const webVitals = await import('web-vitals');

      // Track Core Web Vitals
      if (webVitals.onLCP && trackLCP) {
        webVitals.onLCP((metric) => {
          updateMetrics({ lcp: metric.value });
          performanceMonitor.recordMetric('LCP', metric.value, `Component: ${componentName}`);
        });
      }

      if (webVitals.onFID && trackFID) {
        webVitals.onFID((metric) => {
          updateMetrics({ fid: metric.value });
          performanceMonitor.recordMetric('FID', metric.value, `Component: ${componentName}`);
        });
      }

      if (webVitals.onINP && trackFID) {
        webVitals.onINP((metric) => {
          updateMetrics({ inp: metric.value });
          performanceMonitor.recordMetric('INP', metric.value, `Component: ${componentName}`);
        });
      }

      if (webVitals.onCLS && trackCLS) {
        webVitals.onCLS((metric) => {
          updateMetrics({ cls: metric.value });
          performanceMonitor.recordMetric('CLS', metric.value, `Component: ${componentName}`);
        });
      }

      if (webVitals.onFCP) {
        webVitals.onFCP((metric) => {
          updateMetrics({ fcp: metric.value });
          performanceMonitor.recordMetric('FCP', metric.value, `Component: ${componentName}`);
        });
      }

      if (webVitals.onTTFB) {
        webVitals.onTTFB((metric) => {
          updateMetrics({ ttfb: metric.value });
          performanceMonitor.recordMetric('TTFB', metric.value, `Component: ${componentName}`);
        });
      }

    } catch (error) {
      console.warn('Web Vitals library not available:', error);
    }
  }, [trackLCP, trackFID, trackCLS, componentName, updateMetrics]);

  /**
   * Initialize layout shift observer for detailed CLS tracking
   */
  const initializeLayoutShiftObserver = useCallback(() => {
    if (!trackCLS || typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
            const shift = entry as PerformanceEntry & { value: number; sources?: Array<{ node?: Element }> };
            layoutShiftsRef.current.push({
              value: shift.value,
              element: shift.sources?.[0]?.node,
              timestamp: performance.now(),
            });

            // Log significant layout shifts
            if (shift.value > 0.1 && process.env['NODE_ENV'] === 'development') {
              console.warn(`🔄 [CoreWebVitals] Layout shift detected in ${componentName}:`, {
                value: shift.value,
                element: shift.sources?.[0]?.node,
              });
            }
          }
        }
      });

      observer.observe({ entryTypes: ['layout-shift'] });
      layoutShiftObserverRef.current = observer;
    } catch (error) {
      console.warn('Layout shift observer not supported:', error);
    }
  }, [trackCLS, componentName]);

  /**
   * Start Core Web Vitals tracking
   */
  const startTracking = useCallback(() => {
    if (!enabled || isTracking) return;

    setIsTracking(true);

    // Reset tracking data
    layoutShiftsRef.current = [];
    imageLoadsRef.current = [];
    jsExecutionsRef.current = [];

    // Initialize tracking
    initializeWebVitals();
    initializeLayoutShiftObserver();

    // Initialize metrics
    updateMetrics({
      componentName,
      timestamp: Date.now(),
      ratings: {},
      optimizations: { cls: [], lcp: [], fid: [], inp: [] },
    });

    // Reduced logging to prevent console spam and performance issues
    if (process.env['NODE_ENV'] === 'development' && componentName === 'ProductGrid') {
      console.log(`🚀 [CoreWebVitals] Started tracking: ${componentName}`);
    }
  }, [enabled, isTracking, componentName, initializeWebVitals, initializeLayoutShiftObserver, updateMetrics]);

  /**
   * Stop Core Web Vitals tracking
   */
  const stopTracking = useCallback(() => {
    if (!isTracking) return;

    setIsTracking(false);

    // Cleanup observers
    if (layoutShiftObserverRef.current) {
      layoutShiftObserverRef.current.disconnect();
      layoutShiftObserverRef.current = null;
    }

    // Reduced logging to prevent console spam and performance issues
    if (process.env['NODE_ENV'] === 'development' && componentName === 'ProductGrid') {
      console.log(`🛑 [CoreWebVitals] Stopped tracking: ${componentName}`);
    }
  }, [isTracking, componentName]);

  /**
   * Record layout shift for CLS calculation
   */
  const recordLayoutShift = useCallback((shift: number, element?: Element) => {
    if (!enabled || !trackCLS) return;

    layoutShiftsRef.current.push({
      value: shift,
      element,
      timestamp: performance.now(),
    });

    // Calculate cumulative CLS
    const totalCLS = layoutShiftsRef.current.reduce((sum, s) => sum + s.value, 0);
    updateMetrics({ cls: totalCLS });

    // Record in global performance monitor
    performanceMonitor.recordMetric('COMPONENT_LAYOUT_SHIFT', shift, `Component: ${componentName}`);

    if (process.env['NODE_ENV'] === 'development' && shift > 0.1) {
      console.warn(`🔄 [CoreWebVitals] Manual layout shift recorded in ${componentName}:`, {
        shift,
        element,
        totalCLS,
      });
    }
  }, [enabled, trackCLS, componentName, updateMetrics]);

  /**
   * Record image load for LCP optimization
   */
  const recordImageLoad = useCallback((src: string, loadTime: number, isLCP = false) => {
    if (!enabled || !trackLCP) return;

    imageLoadsRef.current.push({
      src,
      loadTime,
      isLCP,
      timestamp: performance.now(),
    });

    // If this is the LCP image, update LCP metric
    if (isLCP) {
      updateMetrics({ lcp: loadTime });
    }

    // Record in global performance monitor
    performanceMonitor.recordMetric('COMPONENT_IMAGE_LOAD', loadTime, `Component: ${componentName}, Image: ${src}, LCP: ${isLCP}`);

    if (process.env['NODE_ENV'] === 'development') {
      console.log(`🖼️ [CoreWebVitals] Image load recorded in ${componentName}:`, {
        src,
        loadTime: `${loadTime.toFixed(2)}ms`,
        isLCP,
      });
    }
  }, [enabled, trackLCP, componentName, updateMetrics]);

  /**
   * Record JavaScript execution for FID optimization
   */
  const recordJSExecution = useCallback((taskName: string, duration: number) => {
    if (!enabled || !trackFID) return;

    jsExecutionsRef.current.push({
      taskName,
      duration,
      timestamp: performance.now(),
    });

    // Record in global performance monitor
    performanceMonitor.recordMetric('COMPONENT_JS_EXECUTION', duration, `Component: ${componentName}, Task: ${taskName}`);

    if (process.env['NODE_ENV'] === 'development' && duration > 50) {
      console.warn(`⚡ [CoreWebVitals] Long JS task in ${componentName}:`, {
        taskName,
        duration: `${duration.toFixed(2)}ms`,
      });
    }
  }, [enabled, trackFID, componentName]);

  /**
   * Reserve space for image to prevent CLS
   */
  const reserveImageSpaceStyles = useCallback((width: number, height: number): React.CSSProperties => {
    if (!reserveImageSpace) return {};

    const aspectRatio = width / height;

    return {
      aspectRatio: aspectRatio.toString(),
      width: '100%',
      height: 'auto',
    };
  }, [reserveImageSpace]);

  /**
   * Get all optimization recommendations
   */
  const getOptimizations = useCallback((): string[] => {
    if (!metrics) return [];

    const allOptimizations: string[] = [];

    Object.values(metrics.optimizations).forEach(opts => {
      allOptimizations.push(...opts);
    });

    return allOptimizations;
  }, [metrics]);

  /**
   * Auto-start tracking when component mounts
   */
  useEffect(() => {
    if (enabled) {
      startTracking();
    }

    return () => {
      stopTracking();
    };
  }, [enabled, startTracking, stopTracking]);

  return {
    metrics,
    startTracking,
    stopTracking,
    recordLayoutShift,
    recordImageLoad,
    recordJSExecution,
    reserveImageSpace: reserveImageSpaceStyles,
    getOptimizations,
    isTracking,
  };
};

export default useCoreWebVitals;
