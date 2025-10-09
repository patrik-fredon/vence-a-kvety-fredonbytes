import { useCallback, useEffect, useRef, useState } from "react";

export interface ImagePerformanceMetrics {
  /** Time when image loading started */
  loadStartTime: number;
  /** Time when image finished loading */
  loadEndTime?: number;
  /** Total loading duration in milliseconds */
  loadDuration?: number;
  /** Whether the image loaded successfully */
  loadSuccess: boolean;
  /** Image file size in bytes (if available) */
  fileSize?: number;
  /** Image dimensions */
  dimensions: { width: number; height: number } | undefined;
}

export interface UseImagePerformanceOptions {
  /** Enable performance tracking */
  enabled?: boolean;
  /** Log metrics to console in development */
  logMetrics?: boolean;
  /** Callback for performance metrics */
  onMetrics?: (metrics: ImagePerformanceMetrics) => void;
}

export interface ImagePerformanceResult {
  /** Start tracking image performance */
  startTracking: () => void;
  /** Mark image as loaded successfully */
  markLoaded: (image?: HTMLImageElement) => void;
  /** Mark image as failed to load */
  markError: () => void;
  /** Current performance metrics */
  metrics: ImagePerformanceMetrics | null;
  /** Whether tracking is active */
  isTracking: boolean;
}

export const useImagePerformance = (
  imageSrc: string,
  options: UseImagePerformanceOptions = {}
): ImagePerformanceResult => {
  const {
    enabled = true,
    logMetrics = process.env["NODE_ENV"] === "development",
    onMetrics,
  } = options;

  const [metrics, setMetrics] = useState<ImagePerformanceMetrics | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const startTimeRef = useRef<number | null>(null);

  // Start performance tracking
  const startTracking = useCallback(() => {
    if (!enabled) return;

    const startTime = performance.now();
    startTimeRef.current = startTime;
    setIsTracking(true);

    const initialMetrics: ImagePerformanceMetrics = {
      loadStartTime: startTime,
      loadSuccess: false,
      dimensions: undefined,
    };

    setMetrics(initialMetrics);

    if (logMetrics) {
      console.log(`🖼️ [ImagePerformance] Started tracking: ${imageSrc}`);
    }
  }, [enabled, imageSrc, logMetrics]);

  // Mark image as successfully loaded
  const markLoaded = useCallback(
    (image?: HTMLImageElement) => {
      if (!(enabled && startTimeRef.current)) return;

      const endTime = performance.now();
      const duration = endTime - startTimeRef.current;

      const updatedMetrics: ImagePerformanceMetrics = {
        loadStartTime: startTimeRef.current,
        loadEndTime: endTime,
        loadDuration: duration,
        loadSuccess: true,
        dimensions: image
          ? {
              width: image.naturalWidth,
              height: image.naturalHeight,
            }
          : undefined,
      };

      setMetrics(updatedMetrics);
      setIsTracking(false);

      // Try to get file size from performance API
      if (typeof window !== "undefined" && window.performance) {
        const resourceEntries = performance.getEntriesByType(
          "resource"
        ) as PerformanceResourceTiming[];
        const imageEntry = resourceEntries.find((entry) => entry.name.includes(imageSrc));

        if (imageEntry?.transferSize) {
          updatedMetrics.fileSize = imageEntry.transferSize;
        }
      }

      if (logMetrics) {
        console.log(`🖼️ [ImagePerformance] Loaded successfully:`, {
          src: imageSrc,
          duration: `${duration.toFixed(2)}ms`,
          dimensions: updatedMetrics.dimensions,
          fileSize: updatedMetrics.fileSize
            ? `${(updatedMetrics.fileSize / 1024).toFixed(2)}KB`
            : "unknown",
        });
      }

      onMetrics?.(updatedMetrics);
    },
    [enabled, imageSrc, logMetrics, onMetrics]
  );

  // Mark image as failed to load
  const markError = useCallback(() => {
    if (!(enabled && startTimeRef.current)) return;

    const endTime = performance.now();
    const duration = endTime - startTimeRef.current;

    const updatedMetrics: ImagePerformanceMetrics = {
      loadStartTime: startTimeRef.current,
      loadEndTime: endTime,
      loadDuration: duration,
      loadSuccess: false,
      dimensions: undefined,
    };

    setMetrics(updatedMetrics);
    setIsTracking(false);

    if (logMetrics) {
      console.error(`🖼️ [ImagePerformance] Failed to load:`, {
        src: imageSrc,
        duration: `${duration.toFixed(2)}ms`,
      });
    }

    onMetrics?.(updatedMetrics);
  }, [enabled, imageSrc, logMetrics, onMetrics]);

  // Auto-start tracking when component mounts
  useEffect(() => {
    if (enabled && imageSrc) {
      startTracking();
    }
  }, [enabled, imageSrc, startTracking]);

  return {
    startTracking,
    markLoaded,
    markError,
    metrics,
    isTracking,
  };
};
export { default as useLighthouseOptimization } from "./useLighthouseOptimization";
export { default as usePerformanceMonitor } from "./usePerformanceMonitor";
export { default as usePerformanceProfiler } from "./usePerformanceProfiler";
