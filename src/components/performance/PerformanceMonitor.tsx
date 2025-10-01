"use client";

import { useEffect } from "react";

/**
 * Performance monitoring component for tracking Core Web Vitals
 * Addresses requirement 8.1 for Lighthouse performance score optimization
 */

interface WebVitalsMetric {
  name: "CLS" | "INP" | "FCP" | "LCP" | "TTFB";
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  id: string;
  timestamp: number;
}

interface PerformanceMonitorProps {
  /** Whether to enable performance monitoring */
  enabled?: boolean;
  /** Callback for handling performance metrics */
  onMetric?: (metric: WebVitalsMetric) => void;
  /** Whether to log metrics to console in development */
  debug?: boolean;
}

/**
 * Thresholds for Core Web Vitals ratings
 */
const VITALS_THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25 },
  INP: { good: 200, poor: 500 },
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 },
} as const;

/**
 * Get rating based on metric value and thresholds
 */
function getMetricRating(name: WebVitalsMetric["name"], value: number): WebVitalsMetric["rating"] {
  const thresholds = VITALS_THRESHOLDS[name];
  if (value <= thresholds.good) return "good";
  if (value <= thresholds.poor) return "needs-improvement";
  return "poor";
}

/**
 * Send metric to analytics or monitoring service
 */
function sendToAnalytics(metric: WebVitalsMetric) {
  // In a real implementation, this would send to your analytics service
  // For now, we'll just store in sessionStorage for debugging
  if (typeof window !== "undefined") {
    const metrics = JSON.parse(sessionStorage.getItem("webVitals") || "[]");
    metrics.push({
      ...metric,
      timestamp: Date.now(),
      url: window.location.pathname,
    });
    sessionStorage.setItem("webVitals", JSON.stringify(metrics));
  }
}

/**
 * Performance monitoring component
 */
export function PerformanceMonitor({
  enabled = true,
  onMetric,
  debug = process.env['NODE_ENV'] === "development",
}: PerformanceMonitorProps) {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    // Dynamic import of web-vitals to avoid SSR issues
    import("web-vitals")
      .then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
        const handleMetric = (metric: any) => {
          const webVitalsMetric: WebVitalsMetric = {
            name: metric.name,
            value: metric.value,
            rating: getMetricRating(metric.name, metric.value),
            delta: metric.delta,
            id: metric.id,
            timestamp: Date.now(),
          };

          // Log to console in debug mode
          if (debug) {
            console.log(`[Performance] ${metric.name}:`, {
              value: `${Math.round(metric.value)}${metric.name === "CLS" ? "" : "ms"}`,
              rating: webVitalsMetric.rating,
              delta: metric.delta,
            });
          }

          // Send to analytics
          sendToAnalytics(webVitalsMetric);

          // Call custom handler if provided
          onMetric?.(webVitalsMetric);
        };

        // Register metric observers
        onCLS(handleMetric);
        onINP(handleMetric);
        onFCP(handleMetric);
        onLCP(handleMetric);
        onTTFB(handleMetric);
      })
      .catch((error) => {
        console.warn("Failed to load web-vitals:", error);
      });
  }, [enabled, onMetric, debug]);

  // This component doesn't render anything
  return null;
}

/**
 * Hook for accessing performance metrics
 */
export function usePerformanceMetrics() {
  const getMetrics = (): WebVitalsMetric[] => {
    if (typeof window === "undefined") return [];

    try {
      return JSON.parse(sessionStorage.getItem("webVitals") || "[]");
    } catch {
      return [];
    }
  };

  const clearMetrics = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("webVitals");
    }
  };

  const getLatestMetrics = () => {
    const metrics = getMetrics();
    const latest: Partial<Record<WebVitalsMetric["name"], WebVitalsMetric>> = {};

    // Get the most recent metric for each type
    metrics.forEach((metric) => {
      if (!latest[metric.name] || metric.timestamp > latest[metric.name]!.timestamp) {
        latest[metric.name] = metric;
      }
    });

    return latest;
  };

  return {
    getMetrics,
    clearMetrics,
    getLatestMetrics,
  };
}

/**
 * Performance summary component for debugging
 */
export function PerformanceSummary() {
  const { getLatestMetrics } = usePerformanceMetrics();
  const metrics = getLatestMetrics();

  if (process.env['NODE_ENV'] !== "development") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs font-mono z-50">
      <div className="font-bold mb-2">Performance Metrics</div>
      {Object.entries(metrics).map(([name, metric]) => (
        <div key={name} className="flex justify-between gap-4">
          <span>{name}:</span>
          <span
            className={
              metric.rating === "good"
                ? "text-green-400"
                : metric.rating === "needs-improvement"
                  ? "text-yellow-400"
                  : "text-red-400"
            }
          >
            {Math.round(metric.value)}
            {name === "CLS" ? "" : "ms"}
          </span>
        </div>
      ))}
    </div>
  );
}
