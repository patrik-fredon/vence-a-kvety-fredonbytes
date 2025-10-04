import { useCallback, useEffect, useRef, useState } from "react";
import { performanceMonitor as globalPerformanceMonitor } from "@/lib/monitoring/performance-monitor";
import { useLighthouseOptimization } from "./useLighthouseOptimization";
import { usePerformanceMonitor } from "./usePerformanceMonitor";

/**
 * Comprehensive performance profiling data
 */
export interface PerformanceProfile {
  componentName: string;
  renderMetrics: {
    averageRenderTime: number;
    slowestRender: number;
    fastestRender: number;
    totalRenders: number;
  };
  lighthouseMetrics: {
    performanceScore: number;
    optimizationOpportunities: string[];
    criticalIssues: string[];
  };
  memoryUsage:
    | {
        usedJSHeapSize: number;
        totalJSHeapSize: number;
        jsHeapSizeLimit: number;
      }
    | undefined;
  networkMetrics:
    | {
        resourceCount: number;
        totalTransferSize: number;
        slowResources: string[];
      }
    | undefined;
}

/**
 * Options for performance profiler
 */
export interface UsePerformanceProfilerOptions {
  /** Component name */
  componentName: string;
  /** Enable profiling */
  enabled?: boolean;
  /** Enable memory tracking */
  trackMemory?: boolean;
  /** Enable network tracking */
  trackNetwork?: boolean;
  /** Sample ror profiling (0-1) */
  sampleRate?: number;
  /** Callback when profile is complete */
  onProfileComplete?: (profile: PerformanceProfile) => void;
}

/**
 * Return type for the profiler hook
 */
export interface UsePerformanceProfilerResult {
  /** Current performance profile */
  profile: PerformanceProfile | null;
  /** Start profiling session */
  startProfiling: () => void;
  /** Stop profiling session */
  stopProfiling: () => void;
  /** Get performance report */
  getPerformanceReport: () => string;
  /** Export profile data */
  exportProfile: () => string;
  /** Whether profiling is active */
  isProfiling: boolean;
}

/**
 * Comprehensive performance profiler hook that combines render monitoring,
 * Lighthouse optimization, memory tracking, and network analysis
 */
export const usePerformanceProfiler = (
  options: UsePerformanceProfilerOptions
): UsePerformanceProfilerResult => {
  const {
    componentName,
    enabled = process.env.NODE_ENV === "development",
    trackMemory = true,
    trackNetwork = true,
    sampleRate = 1.0,
    onProfileComplete,
  } = options;

  const [profile, setProfile] = useState<PerformanceProfile | null>(null);
  const [isProfiling, setIsProfiling] = useState(false);

  // Tracking refs
  const renderTimesRef = useRef<number[]>([]);
  const profilingStartTimeRef = useRef<number | null>(null);
  const memorySnapshotsRef = useRef<
    Array<{
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
      timestamp: number;
    }>
  >([]);
  const networkResourcesRef = useRef<PerformanceResourceTiming[]>([]);

  // Use component performance monitoring
  const performanceMonitor = usePerformanceMonitor({
    componentName,
    enabled: enabled && isProfiling,
    logMetrics: false, // We'll handle logging in the profiler
    trackProps: true,
    onMetrics: (metrics) => {
      if (metrics.renderDuration) {
        renderTimesRef.current.push(metrics.renderDuration);
      }
    },
  });

  // Use Lighthouse optimization tracking
  const lighthouseOptimization = useLighthouseOptimization({
    componentName,
    enabled: enabled && isProfiling,
    trackImages: true,
    trackJavaScript: true,
    trackAccessibility: true,
  });

  /**
   * Start profiling session
   */
  const startProfiling = useCallback(() => {
    if (!enabled || Math.random() > sampleRate) return;

    setIsProfiling(true);
    profilingStartTimeRef.current = performance.now();

    // Reset tracking data
    renderTimesRef.current = [];
    memorySnapshotsRef.current = [];
    networkResourcesRef.current = [];

    // Start component tracking
    performanceMonitor.startTracking();
    lighthouseOptimization.startOptimizationTracking();

    if (process.env.NODE_ENV === "development") {
      console.log(`🔬 [PerformanceProfiler] Started profiling: ${componentName}`);
    }
  }, [enabled, sampleRate, componentName, performanceMonitor, lighthouseOptimization]);

  /**
   * Stop profiling session and generate profile
   */
  const stopProfiling = useCallback(() => {
    if (!(isProfiling && profilingStartTimeRef.current)) return;

    const profilingDuration = performance.now() - profilingStartTimeRef.current;
    setIsProfiling(false);

    // Calculate render metrics
    const renderTimes = renderTimesRef.current;
    const renderMetrics = {
      averageRenderTime:
        renderTimes.length > 0
          ? renderTimes.reduce((sum, time) => sum + time, 0) / renderTimes.length
          : 0,
      slowestRender: renderTimes.length > 0 ? Math.max(...renderTimes) : 0,
      fastestRender: renderTimes.length > 0 ? Math.min(...renderTimes) : 0,
      totalRenders: renderTimes.length,
    };

    // Get Lighthouse metrics
    const lighthouseMetrics = {
      performanceScore: calculatePerformanceScore(
        renderMetrics,
        lighthouseOptimization.metrics
          ? {
              ...(lighthouseOptimization.metrics.clsContribution !== undefined && {
                clsContribution: lighthouseOptimization.metrics.clsContribution,
              }),
              ...(lighthouseOptimization.metrics.lcpContribution !== undefined && {
                lcpContribution: lighthouseOptimization.metrics.lcpContribution,
              }),
              ...(lighthouseOptimization.metrics.tbtContribution !== undefined && {
                tbtContribution: lighthouseOptimization.metrics.tbtContribution,
              }),
            }
          : null
      ),
      optimizationOpportunities: lighthouseOptimization.getOptimizationRecommendations(),
      criticalIssues: getCriticalIssues(
        renderMetrics,
        lighthouseOptimization.metrics
          ? {
              ...(lighthouseOptimization.metrics.clsContribution !== undefined && {
                clsContribution: lighthouseOptimization.metrics.clsContribution,
              }),
              ...(lighthouseOptimization.metrics.lcpContribution !== undefined && {
                lcpContribution: lighthouseOptimization.metrics.lcpContribution,
              }),
              ...(lighthouseOptimization.metrics.tbtContribution !== undefined && {
                tbtContribution: lighthouseOptimization.metrics.tbtContribution,
              }),
            }
          : null
      ),
    };

    // Get memory metrics
    const memoryUsage = trackMemory ? getCurrentMemoryUsage() || undefined : undefined;

    // Get network metrics
    const networkMetrics = trackNetwork ? getNetworkMetrics() || undefined : undefined;

    const newProfile: PerformanceProfile = {
      componentName,
      renderMetrics,
      lighthouseMetrics,
      memoryUsage,
      networkMetrics,
    };

    setProfile(newProfile);

    // Log profile summary
    if (process.env.NODE_ENV === "development") {
      console.log(`📊 [PerformanceProfiler] Profile complete for ${componentName}:`, {
        profilingDuration: `${profilingDuration.toFixed(2)}ms`,
        averageRenderTime: `${renderMetrics.averageRenderTime.toFixed(2)}ms`,
        totalRenders: renderMetrics.totalRenders,
        performanceScore: lighthouseMetrics.performanceScore,
        optimizationOpportunities: lighthouseMetrics.optimizationOpportunities.length,
      });
    }

    // Record in global performance monitor
    globalPerformanceMonitor.recordMetric(
      `COMPONENT_PROFILE_${componentName.toUpperCase()}`,
      profilingDuration,
      `Profiling session: ${componentName}`
    );

    // Call completion callback
    onProfileComplete?.(newProfile);
  }, [
    isProfiling,
    componentName,
    trackMemory,
    trackNetwork,
    lighthouseOptimization,
    onProfileComplete,
  ]);

  /**
   * Get human-readable performance report
   */
  const getPerformanceReport = useCallback((): string => {
    if (!profile) return "No profile data available";

    const { renderMetrics, lighthouseMetrics, memoryUsage, networkMetrics } = profile;

    let report = `Performance Report for ${componentName}\n`;
    report += `${"=".repeat(50)}\n\n`;

    // Render performance
    report += "Render Performance:\n";
    report += `  Average render time: ${renderMetrics.averageRenderTime.toFixed(2)}ms\n`;
    report += `  Slowest render: ${renderMetrics.slowestRender.toFixed(2)}ms\n`;
    report += `  Fastest render: ${renderMetrics.fastestRender.toFixed(2)}ms\n`;
    report += `  Total renders: ${renderMetrics.totalRenders}\n\n`;

    // Lighthouse metrics
    report += "Lighthouse Analysis:\n";
    report += `  Performance score: ${lighthouseMetrics.performanceScore}/100\n`;
    report += `  Optimization opportunities: ${lighthouseMetrics.optimizationOpportunities.length}\n`;
    report += `  Critical issues: ${lighthouseMetrics.criticalIssues.length}\n\n`;

    // Optimization opportunities
    if (lighthouseMetrics.optimizationOpportunities.length > 0) {
      report += "Optimization Opportunities:\n";
      lighthouseMetrics.optimizationOpportunities.forEach((opp, index) => {
        report += `  ${index + 1}. ${opp}\n`;
      });
      report += "\n";
    }

    // Critical issues
    if (lighthouseMetrics.criticalIssues.length > 0) {
      report += "Critical Issues:\n";
      lighthouseMetrics.criticalIssues.forEach((issue, index) => {
        report += `  ${index + 1}. ${issue}\n`;
      });
      report += "\n";
    }

    // Memory usage
    if (memoryUsage) {
      report += "Memory Usage:\n";
      report += `  Used heap: ${(memoryUsage.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB\n`;
      report += `  Total heap: ${(memoryUsage.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB\n`;
      report += `  Heap limit: ${(memoryUsage.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB\n\n`;
    }

    // Network metrics
    if (networkMetrics) {
      report += "Network Performance:\n";
      report += `  Resources loaded: ${networkMetrics.resourceCount}\n`;
      report += `  Total transfer size: ${(networkMetrics.totalTransferSize / 1024).toFixed(2)}KB\n`;
      if (networkMetrics.slowResources.length > 0) {
        report += `  Slow resources: ${networkMetrics.slowResources.length}\n`;
      }
    }

    return report;
  }, [profile, componentName]);

  /**
   * Export profile data as JSON
   */
  const exportProfile = useCallback((): string => {
    if (!profile) return "{}";

    return JSON.stringify(
      {
        ...profile,
        timestamp: Date.now(),
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
      },
      null,
      2
    );
  }, [profile]);

  /**
   * Auto-start profiling when component mounts
   */
  useEffect(() => {
    if (enabled) {
      startProfiling();
    }

    return () => {
      if (isProfiling) {
        stopProfiling();
      }
    };
  }, [enabled, startProfiling, stopProfiling, isProfiling]);

  /**
   * Track memory usage periodically during profiling
   */
  useEffect(() => {
    if (!(isProfiling && trackMemory)) return;

    const interval = setInterval(() => {
      const memoryInfo = getCurrentMemoryUsage();
      if (memoryInfo) {
        memorySnapshotsRef.current.push({
          ...memoryInfo,
          timestamp: performance.now(),
        });
      }
    }, 1000); // Every second

    return () => clearInterval(interval);
  }, [isProfiling, trackMemory]);

  return {
    profile,
    startProfiling,
    stopProfiling,
    getPerformanceReport,
    exportProfile,
    isProfiling,
  };
};

/**
 * Calculate performance score based on metrics
 */
function calculatePerformanceScore(
  renderMetrics: PerformanceProfile["renderMetrics"],
  lighthouseMetrics: {
    clsContribution?: number;
    lcpContribution?: number;
    tbtContribution?: number;
  } | null
): number {
  let score = 100;

  // Deduct points for slow renders
  if (renderMetrics.averageRenderTime > 16) {
    score -= Math.min(30, (renderMetrics.averageRenderTime - 16) * 2);
  }

  // Deduct points for layout shifts
  if (lighthouseMetrics?.clsContribution && lighthouseMetrics.clsContribution > 0.1) {
    score -= Math.min(20, lighthouseMetrics.clsContribution * 100);
  }

  // Deduct points for slow LCP
  if (lighthouseMetrics?.lcpContribution && lighthouseMetrics.lcpContribution > 2500) {
    score -= Math.min(25, (lighthouseMetrics.lcpContribution - 2500) / 100);
  }

  return Math.max(0, Math.round(score));
}

/**
 * Get critical performance issues
 */
function getCriticalIssues(
  renderMetrics: PerformanceProfile["renderMetrics"],
  lighthouseMetrics: {
    clsContribution?: number;
    lcpContribution?: number;
    tbtContribution?: number;
  } | null
): string[] {
  const issues: string[] = [];

  if (renderMetrics.averageRenderTime > 50) {
    issues.push(`Slow average render time: ${renderMetrics.averageRenderTime.toFixed(2)}ms`);
  }

  if (renderMetrics.slowestRender > 100) {
    issues.push(`Very slow render detected: ${renderMetrics.slowestRender.toFixed(2)}ms`);
  }

  if (lighthouseMetrics?.clsContribution && lighthouseMetrics.clsContribution > 0.25) {
    issues.push(`High layout shift: ${lighthouseMetrics.clsContribution.toFixed(3)}`);
  }

  if (lighthouseMetrics?.lcpContribution && lighthouseMetrics.lcpContribution > 4000) {
    issues.push(`Poor LCP: ${lighthouseMetrics.lcpContribution.toFixed(0)}ms`);
  }

  return issues;
}

/**
 * Get current memory usage
 */
function getCurrentMemoryUsage() {
  if (typeof window === "undefined" || !("performance" in window)) return null;

  const memory = (
    performance as {
      memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number };
    }
  ).memory;
  if (!memory) return null;

  return {
    usedJSHeapSize: memory.usedJSHeapSize,
    totalJSHeapSize: memory.totalJSHeapSize,
    jsHeapSizeLimit: memory.jsHeapSizeLimit,
  };
}

/**
 * Get network performance metrics
 */
function getNetworkMetrics() {
  if (typeof window === "undefined" || !("performance" in window)) return null;

  const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
  const slowResources = resources
    .filter((resource) => resource.duration > 1000)
    .map((resource) => resource.name);

  const totalTransferSize = resources.reduce((sum, resource) => {
    return sum + (resource.transferSize || 0);
  }, 0);

  return {
    resourceCount: resources.length,
    totalTransferSize,
    slowResources,
  };
}

export default usePerformanceProfiler;
