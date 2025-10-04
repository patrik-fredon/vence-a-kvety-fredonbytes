"use client";

import type React from "react";
import { useEffect, useState } from "react";

interface ImageLoadMetrics {
  url: string;
  loadTime: number;
  fileSize?: number;
  dimensions?: { width: number; height: number };
  format?: string;
}

interface ImagePerformanceMonitorProps {
  /** Enable performance monitoring */
  enabled?: boolean;
  /** Log metrics to console */
  logToConsole?: boolean;
  /** Callback for performance data */
  onMetrics?: (metrics: ImageLoadMetrics[]) => void;
  /** Maximum number of metrics to store */
  maxMetrics?: number;
}

interface PerformanceStats {
  totalImages: number;
  averageLoadTime: number;
  slowestImage: ImageLoadMetrics | null;
  fastestImage: ImageLoadMetrics | null;
  totalDataTransferred: number;
}

export const ImagePerformanceMonitor: React.FC<ImagePerformanceMonitorProps> = ({
  enabled = process.env.NODE_ENV === "development",
  logToConsole = true,
  onMetrics,
  maxMetrics = 100,
}) => {
  const [metrics, setMetrics] = useState<ImageLoadMetrics[]>([]);
  const [stats, setStats] = useState<PerformanceStats | null>(null);

  // Calculate performance statistics
  useEffect(() => {
    if (metrics.length === 0) {
      setStats(null);
      return;
    }

    const totalLoadTime = metrics.reduce((sum, metric) => sum + metric.loadTime, 0);
    const averageLoadTime = totalLoadTime / metrics.length;

    const slowestImage = metrics.reduce((slowest, current) =>
      current.loadTime > slowest.loadTime ? current : slowest
    );

    const fastestImage = metrics.reduce((fastest, current) =>
      current.loadTime < fastest.loadTime ? current : fastest
    );

    const totalDataTransferred = metrics.reduce((sum, metric) => sum + (metric.fileSize || 0), 0);

    const newStats: PerformanceStats = {
      totalImages: metrics.length,
      averageLoadTime,
      slowestImage,
      fastestImage,
      totalDataTransferred,
    };

    setStats(newStats);

    if (logToConsole && newStats.slowestImage && newStats.fastestImage) {
      console.group("🖼️ Image Performance Stats");
      console.log(`Total Images: ${newStats.totalImages}`);
      console.log(`Average Load Time: ${newStats.averageLoadTime.toFixed(2)}ms`);
      console.log(
        `Slowest Image: ${newStats.slowestImage.url} (${newStats.slowestImage.loadTime.toFixed(2)}ms)`
      );
      console.log(
        `Fastest Image: ${newStats.fastestImage.url} (${newStats.fastestImage.loadTime.toFixed(2)}ms)`
      );
      console.log(`Total Data: ${(newStats.totalDataTransferred / 1024).toFixed(2)}KB`);
      console.groupEnd();
    }

    onMetrics?.(metrics);
  }, [metrics, logToConsole, onMetrics]);

  // Monitor image loading performance
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();

      entries.forEach((entry) => {
        if (
          entry.entryType === "resource" &&
          entry.name.match(/\.(jpg|jpeg|png|gif|webp|avif)$/i)
        ) {
          const resourceEntry = entry as PerformanceResourceTiming;

          const metric: ImageLoadMetrics = {
            url: resourceEntry.name,
            loadTime: resourceEntry.responseEnd - resourceEntry.startTime,
            fileSize: resourceEntry.transferSize,
          };

          setMetrics((prev) => {
            const updated = [...prev, metric];
            // Keep only the most recent metrics
            return updated.slice(-maxMetrics);
          });
        }
      });
    });

    observer.observe({ entryTypes: ["resource"] });

    return () => {
      observer.disconnect();
    };
  }, [enabled, maxMetrics]);

  // Don't render anything in production unless explicitly enabled
  if (!enabled) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black/80 text-white p-4 rounded-lg text-xs font-mono max-w-sm">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        <span className="font-semibold">Image Performance</span>
      </div>

      {stats?.slowestImage && stats.fastestImage ? (
        <div className="space-y-1">
          <div>Images: {stats.totalImages}</div>
          <div>Avg Load: {stats.averageLoadTime.toFixed(1)}ms</div>
          <div>Data: {(stats.totalDataTransferred / 1024).toFixed(1)}KB</div>
          <div className="text-red-300">Slowest: {stats.slowestImage.loadTime.toFixed(1)}ms</div>
          <div className="text-green-300">Fastest: {stats.fastestImage.loadTime.toFixed(1)}ms</div>
        </div>
      ) : (
        <div className="text-gray-400">Monitoring images...</div>
      )}
    </div>
  );
};

export default ImagePerformanceMonitor;
