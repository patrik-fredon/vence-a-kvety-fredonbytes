// Performance monitoring hooks

// Core Web Vitals optimization hook
export {
  type CoreWebVitalsMetrics,
  type CoreWebVitalsOptions,
  type CoreWebVitalsResult,
  useCoreWebVitals,
} from "./useCoreWebVitals";
// Image performance hooks
export {
  type ImageOptimizationResult,
  type UseImageOptimizationOptions,
  useImageOptimization,
} from "./useImageOptimization";
export {
  type ImagePerformanceMetrics,
  type ImagePerformanceResult,
  type UseImagePerformanceOptions,
  useImagePerformance,
} from "./useImagePerformance";
export {
  type LighthouseOptimizationMetrics,
  type UseLighthouseOptimizationOptions,
  type UseLighthouseOptimizationResult,
  useLighthouseOptimization,
} from "./useLighthouseOptimization";
export {
  type ComponentPerformanceMetrics,
  type UsePerformanceMonitorOptions,
  type UsePerformanceMonitorResult,
  usePerformanceMonitor,
} from "./usePerformanceMonitor";
export {
  type PerformanceProfile,
  type UsePerformanceProfilerOptions,
  type UsePerformanceProfilerResult,
  usePerformanceProfiler,
} from "./usePerformanceProfiler";
