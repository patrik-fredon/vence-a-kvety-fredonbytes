/**
 * @jest-environment jsdom
 */

import { getPerformanceSummary, recordPerformanceMetric } from "../performance-monitor";

// Mock web-vitals
jest.mock("web-vitals", () => ({
  onCLS: jest.fn(),
  onINP: jest.fn(),
  onFCP: jest.fn(),
  onLCP: jest.fn(),
  onTTFB: jest.fn(),
  onFID: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

// Mock performance API
Object.defineProperty(window, "performance", {
  value: {
    now: jest.fn(() => 1000),
    getEntriesByType: jest.fn(() => [
      {
        entryType: "navigation",
        domainLookupStart: 0,
        domainLookupEnd: 50,
        connectStart: 50,
        connectEnd: 100,
        requestStart: 100,
        responseEnd: 200,
        domContentLoadedEventStart: 200,
        domContentLoadedEventEnd: 250,
      },
    ]),
    navigation: {},
  },
  writable: true,
});

// Mock PerformanceObserver
global.PerformanceObserver = jest.fn().mockImplementation((callback) => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
}));

describe("PerformanceMonitor", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
  });

  afterEach(() => {
    // Clean up any timers
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe("recordMetric", () => {
    it("should record a performance metric", () => {
      recordPerformanceMetric("TEST_METRIC", 1500, "Test context");

      const summary = getPerformanceSummary();
      expect(summary.totalMetrics).toBe(1);
      expect(summary.averageValues.TEST_METRIC).toBe(1500);
    });

    it("should categorize metrics by rating", () => {
      recordPerformanceMetric("LCP", 1000); // good
      recordPerformanceMetric("LCP", 3000); // needs-improvement
      recordPerformanceMetric("LCP", 5000); // poor

      const summary = getPerformanceSummary();
      expect(summary.totalMetrics).toBe(3);
      expect(summary.goodMetrics).toBe(1);
      expect(summary.needsImprovementMetrics).toBe(1);
      expect(summary.poorMetrics).toBe(1);
    });

    it("should calculate correct ratings for Web Vitals", () => {
      // Test LCP ratings
      recordPerformanceMetric("LCP", 2000); // good
      recordPerformanceMetric("LCP", 3000); // needs-improvement
      recordPerformanceMetric("LCP", 5000); // poor

      const summary = getPerformanceSummary();
      expect(summary.goodMetrics).toBeGreaterThan(0);
      expect(summary.needsImprovementMetrics).toBeGreaterThan(0);
      expect(summary.poorMetrics).toBeGreaterThan(0);
    });
  });

  describe("getPerformanceSummary", () => {
    it("should return correct summary statistics", () => {
      recordPerformanceMetric("LCP", 2000);
      recordPerformanceMetric("LCP", 3000);
      recordPerformanceMetric("FCP", 1500);

      const summary = getPerformanceSummary();
      expect(summary.totalMetrics).toBe(3);
      expect(summary.averageValues.LCP).toBe(2500);
      expect(summary.averageValues.FCP).toBe(1500);
    });

    it("should handle empty metrics", () => {
      const summary = getPerformanceSummary();
      expect(summary.totalMetrics).toBe(0);
      expect(summary.goodMetrics).toBe(0);
      expect(summary.needsImprovementMetrics).toBe(0);
      expect(summary.poorMetrics).toBe(0);
    });
  });

  describe("metric rating calculation", () => {
    it("should correctly rate LCP metrics", () => {
      recordPerformanceMetric("LCP", 2000); // good
      recordPerformanceMetric("LCP", 3500); // needs-improvement
      recordPerformanceMetric("LCP", 5000); // poor

      const summary = getPerformanceSummary();
      expect(summary.goodMetrics).toBe(1);
      expect(summary.needsImprovementMetrics).toBe(1);
      expect(summary.poorMetrics).toBe(1);
    });

    it("should correctly rate CLS metrics", () => {
      recordPerformanceMetric("CLS", 0.05); // good
      recordPerformanceMetric("CLS", 0.15); // needs-improvement
      recordPerformanceMetric("CLS", 0.3); // poor

      const summary = getPerformanceSummary();
      expect(summary.goodMetrics).toBe(1);
      expect(summary.needsImprovementMetrics).toBe(1);
      expect(summary.poorMetrics).toBe(1);
    });

    it("should correctly rate custom metrics", () => {
      recordPerformanceMetric("CUSTOM_METRIC", 500); // good (< 1000)
      recordPerformanceMetric("CUSTOM_METRIC", 2000); // needs-improvement (< 3000)
      recordPerformanceMetric("CUSTOM_METRIC", 4000); // poor (> 3000)

      const summary = getPerformanceSummary();
      expect(summary.goodMetrics).toBe(1);
      expect(summary.needsImprovementMetrics).toBe(1);
      expect(summary.poorMetrics).toBe(1);
    });
  });

  describe("server reporting", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    it("should debounce server requests", () => {
      recordPerformanceMetric("TEST_METRIC_1", 1000);
      recordPerformanceMetric("TEST_METRIC_2", 2000);
      recordPerformanceMetric("TEST_METRIC_3", 3000);

      // Should not have sent any requests yet
      expect(fetch).not.toHaveBeenCalled();

      // Fast-forward time to trigger debounced send
      jest.advanceTimersByTime(5000);

      // Should have sent one batched request
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        "/api/monitoring/performance",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: expect.stringContaining("TEST_METRIC"),
        })
      );
    });

    it("should not send requests in development mode", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      recordPerformanceMetric("TEST_METRIC", 1000);
      jest.advanceTimersByTime(5000);

      expect(fetch).not.toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });

    it("should handle server errors gracefully", async () => {
      (fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

      recordPerformanceMetric("TEST_METRIC", 1000);
      jest.advanceTimersByTime(5000);

      // Should not throw error
      expect(() => jest.runAllTimers()).not.toThrow();
    });
  });

  describe("Web Vitals integration", () => {
    it("should initialize Web Vitals listeners", async () => {
      const webVitals = await import("web-vitals");

      expect(webVitals.onCLS).toHaveBeenCalled();
      expect(webVitals.onINP).toHaveBeenCalled();
      expect(webVitals.onFCP).toHaveBeenCalled();
      expect(webVitals.onLCP).toHaveBeenCalled();
      expect(webVitals.onTTFB).toHaveBeenCalled();
    });
  });

  describe("resource timing monitoring", () => {
    it("should monitor slow resources", () => {
      const mockObserver = {
        observe: jest.fn(),
      };

      (global.PerformanceObserver as jest.Mock).mockImplementation((callback) => {
        // Simulate slow resource entry
        callback({
          getEntries: () => [
            {
              entryType: "resource",
              name: "slow-resource.js",
              duration: 3000, // 3 seconds
              transferSize: 500000, // 500KB
            },
          ],
        });
        return mockObserver;
      });

      // Create new performance monitor instance to trigger observer setup
      const { performanceMonitor: newMonitor } = require("../performance-monitor");

      expect(mockObserver.observe).toHaveBeenCalledWith({
        entryTypes: ["resource"],
      });
    });
  });

  describe("long task monitoring", () => {
    it("should monitor long tasks", () => {
      const mockObserver = {
        observe: jest.fn(),
      };

      (global.PerformanceObserver as jest.Mock).mockImplementation((callback) => {
        // Simulate long task entry
        callback({
          getEntries: () => [
            {
              entryType: "longtask",
              duration: 100, // 100ms
            },
          ],
        });
        return mockObserver;
      });

      // Create new performance monitor instance to trigger observer setup
      const { performanceMonitor: newMonitor } = require("../performance-monitor");

      expect(mockObserver.observe).toHaveBeenCalledWith({
        entryTypes: ["longtask"],
      });
    });
  });
});
