import { logPerformanceIssue } from "./error-logger";

interface PerformanceMetric {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  timestamp: number;
  url: string;
  id: string;
}

interface WebVitalsThresholds {
  LCP: { good: number; poor: number }; // Largest Contentful Paint
  INP: { good: number; poor: number }; // Interaction to Next Paint (replaces FID)
  CLS: { good: number; poor: number }; // Cumulative Layout Shift
  FCP: { good: number; poor: number }; // First Contentful Paint
  TTFB: { good: number; poor: number }; // Time to First Byte
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 100;
  private apiEndpoint = "/api/monitoring/performance";

  // Web Vitals thresholds (in milliseconds, except CLS which is unitless)
  private thresholds: WebVitalsThresholds = {
    LCP: { good: 2500, poor: 4000 },
    INP: { good: 200, poor: 500 }, // INP thresholds (replaces FID)
    CLS: { good: 0.1, poor: 0.25 },
    FCP: { good: 1800, poor: 3000 },
    TTFB: { good: 800, poor: 1800 },
  };

  constructor() {
    if (typeof window !== "undefined") {
      this.initializeWebVitals();
      this.initializeCustomMetrics();
    }
  }

  /**
   * Initialize Web Vitals monitoring
   */
  private async initializeWebVitals() {
    try {
      // Dynamic import to avoid SSR issues
      const webVitals = await import("web-vitals");

      // Use available functions from web-vitals v5+
      if (webVitals.onCLS) webVitals.onCLS(this.handleMetric.bind(this));
      if (webVitals.onINP) webVitals.onINP(this.handleMetric.bind(this)); // INP replaces FID in v5+
      if (webVitals.onFCP) webVitals.onFCP(this.handleMetric.bind(this));
      if (webVitals.onLCP) webVitals.onLCP(this.handleMetric.bind(this));
      if (webVitals.onTTFB) webVitals.onTTFB(this.handleMetric.bind(this));
    } catch (error) {
      console.warn("Web Vitals library not available:", error);
    }
  }

  /**
   * Initialize custom performance metrics
   */
  private initializeCustomMetrics() {
    // Monitor page load time
    window.addEventListener("load", () => {
      const loadTime = performance.now();
      this.recordMetric("PAGE_LOAD", loadTime);
    });

    // Monitor navigation timing
    if ("navigation" in performance) {
      const navigation = performance.getEntriesByType(
        "navigation"
      )[0] as PerformanceNavigationTiming;
      if (navigation) {
        // DNS lookup time
        const dnsTime = navigation.domainLookupEnd - navigation.domainLookupStart;
        this.recordMetric("DNS_LOOKUP", dnsTime);

        // Connection time
        const connectionTime = navigation.connectEnd - navigation.connectStart;
        this.recordMetric("CONNECTION", connectionTime);

        // Server response time
        const responseTime = navigation.responseEnd - navigation.requestStart;
        this.recordMetric("SERVER_RESPONSE", responseTime);

        // DOM processing time
        const domTime = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
        this.recordMetric("DOM_PROCESSING", domTime);
      }
    }

    // Monitor resource loading
    this.monitorResourceTiming();

    // Monitor long tasks
    this.monitorLongTasks();
  }

  /**
   * Handle Web Vitals metrics
   */
  private handleMetric(metric: any) {
    const rating = this.getRating(metric.name, metric.value);

    const performanceMetric: PerformanceMetric = {
      name: metric.name,
      value: metric.value,
      rating,
      timestamp: Date.now(),
      url: window.location.href,
      id: metric.id,
    };

    this.addMetric(performanceMetric);

    // Log performance issues for poor ratings
    if (rating === "poor") {
      const threshold = this.getThreshold(metric.name);
      logPerformanceIssue(metric.name, metric.value, threshold.poor, `Web Vitals - ${metric.name}`);
    }
  }

  /**
   * Record custom performance metric
   */
  recordMetric(name: string, value: number, context?: string) {
    const rating = this.getRating(name, value);

    const metric: PerformanceMetric = {
      name,
      value,
      rating,
      timestamp: Date.now(),
      url: typeof window !== "undefined" ? window.location.href : "unknown",
      id: `${name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    this.addMetric(metric);

    // Log performance issues
    if (rating === "poor") {
      const threshold = this.getThreshold(name);
      logPerformanceIssue(name, value, threshold.poor, context);
    }
  }

  /**
   * Monitor resource loading performance
   */
  private monitorResourceTiming() {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === "resource") {
          const resource = entry as PerformanceResourceTiming;

          // Monitor slow resources (> 2 seconds)
          if (resource.duration > 2000) {
            this.recordMetric("SLOW_RESOURCE", resource.duration, `Resource: ${resource.name}`);
          }

          // Monitor large resources
          if (resource.transferSize && resource.transferSize > 1024 * 1024) {
            // > 1MB
            this.recordMetric(
              "LARGE_RESOURCE",
              resource.transferSize,
              `Resource: ${resource.name}`
            );
          }
        }
      }
    });

    observer.observe({ entryTypes: ["resource"] });
  }

  /**
   * Monitor long tasks that block the main thread
   */
  private monitorLongTasks() {
    if ("PerformanceObserver" in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) {
              // Tasks longer than 50ms
              this.recordMetric("LONG_TASK", entry.duration, "Main thread blocking task");
            }
          }
        });

        observer.observe({ entryTypes: ["longtask"] });
      } catch (error) {
        // Long task API not supported
        console.warn("Long task monitoring not supported:", error);
      }
    }
  }

  /**
   * Get performance rating based on thresholds
   */
  private getRating(metricName: string, value: number): "good" | "needs-improvement" | "poor" {
    const threshold = this.getThreshold(metricName);

    if (value <= threshold.good) {
      return "good";
    } else if (value <= threshold.poor) {
      return "needs-improvement";
    } else {
      return "poor";
    }
  }

  /**
   * Get threshold for a metric
   */
  private getThreshold(metricName: string) {
    // Default thresholds for custom metrics
    const defaultThreshold = { good: 1000, poor: 3000 };

    switch (metricName) {
      case "LCP":
      case "INP":
      case "CLS":
      case "FCP":
      case "TTFB":
        return this.thresholds[metricName as keyof WebVitalsThresholds];
      case "PAGE_LOAD":
        return { good: 2000, poor: 5000 };
      case "DNS_LOOKUP":
        return { good: 50, poor: 200 };
      case "CONNECTION":
        return { good: 100, poor: 500 };
      case "SERVER_RESPONSE":
        return { good: 500, poor: 1500 };
      case "DOM_PROCESSING":
        return { good: 1000, poor: 3000 };
      case "SLOW_RESOURCE":
        return { good: 1000, poor: 2000 };
      case "LARGE_RESOURCE":
        return { good: 500 * 1024, poor: 1024 * 1024 }; // 500KB, 1MB
      case "LONG_TASK":
        return { good: 50, poor: 100 };
      default:
        return defaultThreshold;
    }
  }

  /**
   * Add metric to collection and send to server
   */
  private addMetric(metric: PerformanceMetric) {
    this.metrics.push(metric);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Send to server (debounced)
    this.debouncedSendToServer();
  }

  /**
   * Debounced server sending to avoid too many requests
   */
  private sendTimeout: NodeJS.Timeout | null = null;
  private debouncedSendToServer() {
    if (this.sendTimeout) {
      clearTimeout(this.sendTimeout);
    }

    this.sendTimeout = setTimeout(() => {
      this.sendMetricsToServer();
    }, 5000); // Send every 5 seconds
  }

  /**
   * Send metrics to server
   */
  private async sendMetricsToServer() {
    if (this.metrics.length === 0 || process.env.NODE_ENV === "development") {
      return;
    }

    try {
      const response = await fetch(this.apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          metrics: this.metrics,
          userAgent: navigator.userAgent,
          timestamp: Date.now(),
        }),
      });

      if (response.ok) {
        // Clear sent metrics
        this.metrics = [];
      }
    } catch (error) {
      console.warn("Failed to send performance metrics:", error);
    }
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary() {
    const summary = {
      totalMetrics: this.metrics.length,
      goodMetrics: this.metrics.filter((m) => m.rating === "good").length,
      needsImprovementMetrics: this.metrics.filter((m) => m.rating === "needs-improvement").length,
      poorMetrics: this.metrics.filter((m) => m.rating === "poor").length,
      averageValues: {} as Record<string, number>,
    };

    // Calculate averages for each metric type
    const metricTypes = [...new Set(this.metrics.map((m) => m.name))];
    metricTypes.forEach((type) => {
      const typeMetrics = this.metrics.filter((m) => m.name === type);
      const average = typeMetrics.reduce((sum, m) => sum + m.value, 0) / typeMetrics.length;
      summary.averageValues[type] = Math.round(average * 100) / 100;
    });

    return summary;
  }

  /**
   * Get recent metrics
   */
  getRecentMetrics(limit = 20): PerformanceMetric[] {
    return this.metrics.slice(-limit);
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

// Export functions
export const recordPerformanceMetric = performanceMonitor.recordMetric.bind(performanceMonitor);
export const getPerformanceSummary =
  performanceMonitor.getPerformanceSummary.bind(performanceMonitor);
export const getRecentMetrics = performanceMonitor.getRecentMetrics.bind(performanceMonitor);
export { performanceMonitor };
