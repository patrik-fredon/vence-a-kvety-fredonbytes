"use client";

import type { Metric } from "web-vitals";

interface WebVitalMetric {
  name: "CLS" | "INP" | "LCP" | "FCP" | "TTFB";
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  id: string;
  navigationType: string;
}

/**
 * Send Web Vitals metric to monitoring endpoint
 * Requirements: 7.1, 7.2
 */
export function sendToAnalytics(metric: Metric) {
  // Only send in production to avoid noise in development
  if (process.env['NODE_ENV'] !== "production") {
    console.log("[Web Vitals - Dev]", {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
    });
    return;
  }

  const body = {
    metric: {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
      navigationType: metric.navigationType,
    } as WebVitalMetric,
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: Date.now(),
  };

  // Use sendBeacon if available for reliability
  if (navigator.sendBeacon) {
    const blob = new Blob([JSON.stringify(body)], { type: "application/json" });
    navigator.sendBeacon("/api/monitoring/vitals", blob);
  } else {
    // Fallback to fetch with keepalive
    fetch("/api/monitoring/vitals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch((error) => {
      console.error("Failed to send Web Vital:", error);
    });
  }
}

/**
 * Initialize Web Vitals tracking
 * Call this in your root layout or app component
 */
export async function initWebVitals() {
  if (typeof window === "undefined") return;

  try {
    const { onCLS, onINP, onLCP, onFCP, onTTFB } = await import("web-vitals");

    onCLS(sendToAnalytics);
    onINP(sendToAnalytics);
    onLCP(sendToAnalytics);
    onFCP(sendToAnalytics);
    onTTFB(sendToAnalytics);
  } catch (error) {
    console.error("Failed to initialize Web Vitals:", error);
  }
}
