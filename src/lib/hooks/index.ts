// Performance monitoring hooks
export {
  usePerformanceMonitor,
  type ComponentPerformanceMetrics,
  type UsePerformanceMonitorOptions,
  type UsePerformanceMonitorResult,
} from './usePerformanceMonitor';

export {
  useLighthouseOptimization,
  type LighthouseOptimizationMetrics,
  type UseLighthouseOptimizationOptions,
  type UseLighthouseOptimizationResult,
} from './useLighthouseOptimization';

export {
  usePerformanceProfiler,
  type PerformanceProfile,
  type UsePerformanceProfilerOptions,
  type UsePerformanceProfilerResult,
} from './usePerformanceProfiler';

// Image performance hooks
export {
  useImageOptimization,
  type UseImageOptimizationOptions,
  type ImageOptimizationResult,
} from './useImageOptimization';

export {
  useImagePerformance,
  type ImagePerformanceMetrics,
  type ImagePerformanceResult,
  type UseImagePerformanceOptions,
} from './useImagePerformance';

// Core Web Vitals optimization hook
export {
  useCoreWebVitals,
  type CoreWebVitalsMetrics,
  type CoreWebVitalsOptions,
  type CoreWebVitalsResult,
} from './useCoreWebVitals';
