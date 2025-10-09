"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { performanceMonitor } from "@/lib/monitoring/performance-monitor";

// Performance configuration - inline to avoid build issues
const performanceConfig = {
  webVitals: {
    LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint (ms)
    INP: { good: 200, poor: 500 }, // Interaction to Next Paint (ms)
    CLS: { good: 0.1, poor: 0.25 }, // Cumulative Layout Shift (unitless)
    FCP: { good: 1800, poor: 3000 }, // First Contentful Paint (ms)
    TTFB: { good: 800, poor: 1800 }, // Time to First Byte (ms)
  },
  development: {
    debug: {
      showWebVitalsOverlay: process.env['NODE_ENV'] === "development",
    },
  },
  monitoring: {
    webVitalsTracking: {
      endpoint: "/api/monitoring/web-vitals",
      sampleRate: 0.1,
      autoReport: true,
    },
  },
};

interface WebVitalsMetric {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  id: string;
  navigationType: string;
}

interface WebVitalsData {
  LCP?: WebVitalsMetric;
  INP?: WebVitalsMetric;
  CLS?: WebVitalsMetric;
  FCP?: WebVitalsMetric;
  TTFB?: WebVitalsMetric;
}

interface WebVitalsTrackerProps {
  /** Enable debug mode to show metrics overlay */
  debug?: boolean;
  /** Custom endpoint for sending metrics */
  endpoint?: string;
  /** Sample rate (0-1) for sending metrics */
  sampleRate?: number;
  /** Enable automatic reporting to server */
  autoReport?: boolean;
  /** Callback when metrics are collected */
  onMetric?: (metric: WebVitalsMetric) => void;
}

export function WebVitalsTracker({
  debug = performanceConfig.development?.debug?.showWebVitalsOverlay ?? false,
  endpoint = performanceConfig.monitoring?.webVitalsTracking?.endpoint ??
    "/api/monitoring/web-vitals",
  sampleRate = performanceConfig.monitoring?.webVitalsTracking?.sampleRate ?? 0.1,
  autoReport = performanceConfig.monitoring?.webVitalsTracking?.autoReport ?? true,
  onMetric,
}: WebVitalsTrackerProps) {
  const [vitals, setVitals] = useState<WebVitalsData>({});
  const [isVisible, setIsVisible] = useState(debug);
  const reportedMetrics = useRef(new Set<string>());
  const metricsQueue = useRef<WebVitalsMetric[]>([]);

  /**
   * Queue metric for batch reporting
   */
  const queueMetricForReporting = useCallback((metric: WebVitalsMetric) => {
    const metricKey = `${metric.name}-${metric.id}`;

    if (!reportedMetrics.current.has(metricKey)) {
      metricsQueue.current.push(metric);
      reportedMetrics.current.add(metricKey);
    }
  }, []);

  /**
   * Get or create session ID
   */
  const getSessionId = () => {
    // Check if we're in the browser environment
    if (typeof window === "undefined" || typeof sessionStorage === "undefined") {
      return null; // Return null for server-side rendering
    }

    let sessionId = sessionStorage.getItem("webvitals_session_id");
    if (!sessionId) {
      sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem("webvitals_session_id", sessionId);
    }
    return sessionId;
  };

  /**
   * Send metrics to server
   */
  const sendMetricsToServer = useCallback(
    async (metrics: WebVitalsMetric[], useBeacon = false) => {
      if (metrics.length === 0) return;

      const payload = {
        metrics: metrics.map((metric) => ({
          name: metric.name,
          value: metric.value,
          rating: metric.rating,
          timestamp: Date.now(),
          url: window.location.href,
          id: metric.id,
          navigationType: metric.navigationType,
          userAgent: navigator.userAgent,
        })),
        timestamp: Date.now(),
        sessionId: getSessionId(),
      };

      try {
        if (useBeacon && "sendBeacon" in navigator) {
          // Use sendBeacon for reliable delivery on page unload
          navigator.sendBeacon(
            endpoint,
            new Blob([JSON.stringify(payload)], { type: "application/json" })
          );
        } else {
          // Use fetch for regular reporting
          await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
            keepalive: true,
          });
        }
      } catch (error) {
        console.warn("Failed to send Web Vitals metrics:", error);
      }
    },
    [endpoint, getSessionId]
  );

  useEffect(() => {
    let webVitalsModule: any = null;

    const initializeWebVitals = async () => {
      try {
        // Dynamic import to avoid SSR issues
        webVitalsModule = await import("web-vitals");

        // Handle each Web Vitals metric
        const handleMetric = (metric: any) => {
          const webVitalsMetric: WebVitalsMetric = {
            name: metric.name,
            value: metric.value,
            rating: metric.rating,
            delta: metric.delta,
            id: metric.id,
            navigationType: metric.navigationType || "unknown",
          };

          // Update state
          setVitals((prev) => ({
            ...prev,
            [metric.name]: webVitalsMetric,
          }));

          // Call custom callback
          onMetric?.(webVitalsMetric);

          // Report to performance monitor
          performanceMonitor.recordMetric(
            metric.name,
            metric.value,
            `Web Vitals - ${metric.navigationType}`
          );

          // Queue for batch reporting
          if (autoReport && Math.random() <= sampleRate) {
            queueMetricForReporting(webVitalsMetric);
          }

          console.log(`📊 Web Vitals - ${metric.name}:`, {
            value: metric.value,
            rating: metric.rating,
            delta: metric.delta,
          });
        };

        // Initialize all Web Vitals metrics
        if (webVitalsModule.onCLS) {
          webVitalsModule.onCLS(handleMetric);
        }
        if (webVitalsModule.onINP) {
          webVitalsModule.onINP(handleMetric);
        }
        if (webVitalsModule.onFCP) {
          webVitalsModule.onFCP(handleMetric);
        }
        if (webVitalsModule.onLCP) {
          webVitalsModule.onLCP(handleMetric);
        }
        if (webVitalsModule.onTTFB) {
          webVitalsModule.onTTFB(handleMetric);
        }

        // Also handle FID for backwards compatibility
        if (webVitalsModule.onFID) {
          webVitalsModule.onFID(handleMetric);
        }
      } catch (error) {
        console.warn("Web Vitals library not available:", error);
      }
    };

    initializeWebVitals();

    // Send queued metrics on page unload
    const handleBeforeUnload = () => {
      if (metricsQueue.current.length > 0) {
        sendMetricsToServer(metricsQueue.current, true);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // Periodic reporting
    const reportingInterval = setInterval(() => {
      if (metricsQueue.current.length > 0) {
        sendMetricsToServer([...metricsQueue.current]);
        metricsQueue.current = [];
      }
    }, 30000); // Report every 30 seconds

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      clearInterval(reportingInterval);
    };
  }, [sampleRate, autoReport, onMetric, queueMetricForReporting, sendMetricsToServer]);

  /**
   * Get rating color
   */
  const getRatingColor = (rating: string) => {
    switch (rating) {
      case "good":
        return "var(--success, #22c55e)";
      case "needs-improvement":
        return "var(--color-amber-500, #f59e0b)";
      case "poor":
        return "var(--error, #ef4444)";
      default:
        return "var(--color-stone-500, #78716c)";
    }
  };

  /**
   * Format metric value
   */
  const formatValue = (name: string, value: number) => {
    if (name === "CLS") {
      return value.toFixed(3);
    }
    return Math.round(value);
  };

  /**
   * Get metric unit
   */
  const getUnit = (name: string) => {
    return name === "CLS" ? "" : "ms";
  };

  // Debug overlay
  if (debug && isVisible) {
    return (
      <div
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          background: "rgba(0, 0, 0, 0.9)",
          color: "white",
          padding: "16px",
          borderRadius: "8px",
          fontFamily: "monospace",
          fontSize: "12px",
          zIndex: 9999,
          minWidth: "200px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "12px",
          }}
        >
          <strong>Web Vitals</strong>
          <button
            onClick={() => setIsVisible(false)}
            style={{
              background: "transparent",
              border: "none",
              color: "white",
              cursor: "pointer",
              padding: "0",
              fontSize: "16px",
            }}
          >
            ×
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {Object.entries(vitals).map(([name, metric]) => (
            <div
              key={name}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "4px 0",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <span style={{ fontWeight: "bold" }}>{name}</span>
              <span
                style={{
                  color: getRatingColor(metric.rating),
                  fontWeight: "bold",
                }}
              >
                {formatValue(name, metric.value)}
                {getUnit(name)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
