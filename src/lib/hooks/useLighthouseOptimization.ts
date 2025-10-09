import { useCallback, useEffect, useRef, useState } from "react";
import { performanceMonitor } from "@/lib/monitoring/performance-monitor";

/**
 * Lighthouse optimization metrics
 */
export interface LighthouseOptimizationMetrics {
  /** Component name */
  componentName: string;
  /** First Contentful Paint contribution */
  fcpContribution: number | undefined;
  /** Largest Contentful Paint contribution */
  lcpContribution: number | undefined;
  /** Cumulative Layout Shift contribution */
  clsContribution: number | undefined;
  /** Total Blocking Time contribution */
  tbtContribution: number | undefined;
  /** Bundle size impact (estimated) */
  bundleSizeImpact: number | undefined;
  /** Image optimization opportunities */
  imageOptimizations: string[] | undefined;
  /** JavaScript optimization opportunities */
  jsOptimizations: string[] | undefined;
  /** CSS optimization opportunities */
  cssOptimizations: string[] | undefined;
  /** Accessibility issues */
  accessibilityIssues: string[] | undefined;
  /** Performance score impact (estimated) */
  performanceScoreImpact: number | undefined;
}

/**
 * Options for Lighthouse optimization tracking
 */
export interface UseLighthouseOptimizationOptions {
  /** Enable/disable tracking */
  enabled?: boolean;
  /** Component name for identification */
  componentName: string;
  /** Track image loading performance */
  trackImages?: boolean;
  /** Track JavaScript execution time */
  trackJavaScript?: boolean;

  /** Track accessibility metrics */
  trackAccessibility?: boolean;
  /** Callback when optimization opportunities are found */
  onOptimizationFound?: (metrics: LighthouseOptimizationMetrics) => void;
}

/**
 * Return type for the hook
 */
export interface UseLighthouseOptimizationResult {
  /** Current optimization metrics */
  metrics: LighthouseOptimizationMetrics | null;
  /** Start optimization tracking */
  startOptimizationTracking: () => void;
  /** Record layout shift */
  recordLayoutShift: (shift: number) => void;
  /** Record image loading */
  recordImageLoad: (src: string, loadTime: number, size?: number) => void;
  /** Record JavaScript execution */
  recordJSExecution: (scriptName: string, executionTime: number) => void;
  /** Get optimization recommendations */
  getOptimizationRecommendations: () => string[];
}

/**
 * Hook for tracking Lighthouse optimization opportunities
 */
export const useLighthouseOptimization = (
  options: UseLighthouseOptimizationOptions
): UseLighthouseOptimizationResult => {
  const {
    enabled = true,
    componentName,
    trackImages = true,
    trackJavaScript = true,

    trackAccessibility = true,
    onOptimizationFound,
  } = options;

  const [metrics, setMetrics] = useState<LighthouseOptimizationMetrics | null>(null);

  // Refs for tracking various metrics
  const layoutShiftsRef = useRef<number[]>([]);
  const imageLoadsRef = useRef<Array<{ src: string; loadTime: number; size: number | undefined }>>(
    []
  );
  const jsExecutionsRef = useRef<Array<{ script: string; time: number }>>([]);
  const startTimeRef = useRef<number | null>(null);

  /**
   * Start optimization tracking
   */
  const startOptimizationTracking = useCallback(() => {
    if (!enabled) return;

    startTimeRef.current = performance.now();

    // Reset tracking arrays
    layoutShiftsRef.current = [];
    imageLoadsRef.current = [];
    jsExecutionsRef.current = [];

    // Initialize metrics
    const initialMetrics: LighthouseOptimizationMetrics = {
      componentName,
      fcpContribution: undefined,
      lcpContribution: undefined,
      clsContribution: undefined,
      tbtContribution: undefined,
      bundleSizeImpact: undefined,
      imageOptimizations: [],
      jsOptimizations: [],
      cssOptimizations: [],
      accessibilityIssues: [],
      performanceScoreImpact: undefined,
    };

    setMetrics(initialMetrics);

    if (process.env['NODE_ENV'] === "development") {
      console.log(`🔍 [LighthouseOptimization] Started tracking: ${componentName}`);
    }
  }, [enabled, componentName]);

  /**
   * Record layout shift for CLS calculation
   */
  const recordLayoutShift = useCallback(
    (shift: number) => {
      if (!enabled) return;

      layoutShiftsRef.current.push(shift);

      // Update CLS contribution
      setMetrics((prev) => {
        if (!prev) return prev;

        const totalCLS = layoutShiftsRef.current.reduce((sum, s) => sum + s, 0);
        return {
          ...prev,
          clsContribution: totalCLS,
        };
      });

      // Record in global performance monitor
      performanceMonitor.recordMetric(
        "COMPONENT_LAYOUT_SHIFT",
        shift,
        `Component: ${componentName}`
      );

      if (process.env['NODE_ENV'] === "development" && shift > 0.1) {
        console.warn(
          `📐 [LighthouseOptimization] Layout shift detected in ${componentName}: ${shift}`
        );
      }
    },
    [enabled, componentName]
  );

  /**
   * Record image loading performance
   */
  const recordImageLoad = useCallback(
    (src: string, loadTime: number, size?: number) => {
      if (!(enabled && trackImages)) return;

      imageLoadsRef.current.push({ src, loadTime, size });

      setMetrics((prev) => {
        if (!prev) return prev;

        const optimizations = [...(prev.imageOptimizations || [])];

        // Check for optimization opportunities
        if (loadTime > 2000) {
          optimizations.push(`Slow loading image: ${src} (${loadTime.toFixed(0)}ms)`);
        }

        if (size && size > 1024 * 1024) {
          optimizations.push(`Large image: ${src} (${(size / 1024 / 1024).toFixed(1)}MB)`);
        }

        // Estimate LCP contribution for images
        const avgImageLoadTime =
          imageLoadsRef.current.reduce((sum, img) => sum + img.loadTime, 0) /
          imageLoadsRef.current.length;

        return {
          ...prev,
          imageOptimizations: optimizations,
          lcpContribution: avgImageLoadTime > 2500 ? avgImageLoadTime : prev.lcpContribution,
        };
      });

      // Record in global performance monitor
      performanceMonitor.recordMetric(
        "COMPONENT_IMAGE_LOAD",
        loadTime,
        `Component: ${componentName}, Image: ${src}`
      );
    },
    [enabled, trackImages, componentName]
  );

  /**
   * Record JavaScript execution time
   */
  const recordJSExecution = useCallback(
    (scriptName: string, executionTime: number) => {
      if (!(enabled && trackJavaScript)) return;

      jsExecutionsRef.current.push({ script: scriptName, time: executionTime });

      setMetrics((prev) => {
        if (!prev) return prev;

        const optimizations = [...(prev.jsOptimizations || [])];

        // Check for optimization opportunities
        if (executionTime > 50) {
          optimizations.push(
            `Slow JavaScript execution: ${scriptName} (${executionTime.toFixed(0)}ms)`
          );
        }

        // Estimate TBT contribution
        const totalJSTime = jsExecutionsRef.current.reduce((sum, js) => sum + js.time, 0);

        return {
          ...prev,
          jsOptimizations: optimizations,
          tbtContribution: totalJSTime > 300 ? totalJSTime : prev.tbtContribution,
        };
      });

      // Record in global performance monitor
      performanceMonitor.recordMetric(
        "COMPONENT_JS_EXECUTION",
        executionTime,
        `Component: ${componentName}, Script: ${scriptName}`
      );
    },
    [enabled, trackJavaScript, componentName]
  );

  /**
   * Get optimization recommendations based on collected metrics
   */
  const getOptimizationRecommendations = useCallback((): string[] => {
    if (!metrics) return [];

    const recommendations: string[] = [];

    // Image optimizations
    if (metrics.imageOptimizations && metrics.imageOptimizations.length > 0) {
      recommendations.push(
        "🖼️ Optimize images: Use WebP format, implement lazy loading, and resize images appropriately"
      );
    }

    // JavaScript optimizations
    if (metrics.jsOptimizations && metrics.jsOptimizations.length > 0) {
      recommendations.push(
        "⚡ Optimize JavaScript: Use code splitting, minimize bundle size, and defer non-critical scripts"
      );
    }

    // Layout shift optimizations
    if (metrics.clsContribution && metrics.clsContribution > 0.1) {
      recommendations.push(
        "📐 Reduce layout shifts: Reserve space for images, avoid inserting content above existing content"
      );
    }

    // LCP optimizations
    if (metrics.lcpContribution && metrics.lcpContribution > 2500) {
      recommendations.push(
        "🚀 Improve LCP: Optimize critical resources, use preload for important assets, minimize server response time"
      );
    }

    // TBT optimizations
    if (metrics.tbtContribution && metrics.tbtContribution > 300) {
      recommendations.push(
        "🔧 Reduce Total Blocking Time: Break up long tasks, use web workers for heavy computations"
      );
    }

    return recommendations;
  }, [metrics]);

  /**
   * Auto-track component lifecycle
   */
  useEffect(() => {
    if (!enabled) return;

    startOptimizationTracking();

    // Cleanup function
    return () => {
      if (metrics && onOptimizationFound) {
        onOptimizationFound(metrics);
      }
    };
  }, [enabled, startOptimizationTracking, metrics, onOptimizationFound]);

  /**
   * Track accessibility issues
   */
  useEffect(() => {
    if (!(enabled && trackAccessibility)) return;

    // Simple accessibility checks (in a real implementation, you might use axe-core)
    const checkAccessibility = () => {
      const issues: string[] = [];

      // Check for missing alt attributes
      const images = document.querySelectorAll(
        `[data-component="${componentName}"] img:not([alt])`
      );
      if (images.length > 0) {
        issues.push(`Missing alt attributes on ${images.length} images`);
      }

      // Check for missing labels
      const inputs = document.querySelectorAll(
        `[data-component="${componentName}"] input:not([aria-label]):not([aria-labelledby])`
      );
      if (inputs.length > 0) {
        issues.push(`Missing labels on ${inputs.length} form inputs`);
      }

      // Update metrics with accessibility issues
      setMetrics((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          accessibilityIssues: issues,
        };
      });
    };

    // Run accessibility check after a short delay to allow DOM to settle
    const timeoutId = setTimeout(checkAccessibility, 100);

    return () => clearTimeout(timeoutId);
  }, [enabled, trackAccessibility, componentName]);

  return {
    metrics,
    startOptimizationTracking,
    recordLayoutShift,
    recordImageLoad,
    recordJSExecution,
    getOptimizationRecommendations,
  };
};

export default useLighthouseOptimization;
