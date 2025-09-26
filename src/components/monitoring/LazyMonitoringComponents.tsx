"use client";

import dynamic from "next/dynamic";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

// Dynamic import for WebVitalsTracker to reduce initial bundle size
export const LazyWebVitalsTracker = dynamic(
  () => import("./WebVitalsTracker").then((mod) => ({ default: mod.WebVitalsTracker })),
  {
    loading: () => null, // No loading UI for performance tracker
    ssr: false, // Performance tracking is client-side only
  }
);

// Dynamic import for MonitoringProvider
export const LazyMonitoringProvider = dynamic(
  () => import("./MonitoringProvider").then((mod) => ({ default: mod.MonitoringProvider })),
  {
    loading: () => (
      <div className="flex items-center justify-center p-4">
        <LoadingSpinner size="sm" />
        <span className="ml-2 text-xs text-stone-500">Loading monitoring...</span>
      </div>
    ),
    ssr: false,
  }
);

// Dynamic import for performance monitoring example
export const LazyPerformanceMonitoringExample = dynamic(
  () => import("../examples/PerformanceMonitoringExample").then((mod) => ({ default: mod.PerformanceMonitoringExample })),
  {
    loading: () => (
      <div className="flex items-center justify-center p-6 border border-stone-200 rounded-lg">
        <LoadingSpinner size="md" />
        <span className="ml-2 text-stone-600">Loading performance example...</span>
      </div>
    ),
    ssr: false,
  }
);
