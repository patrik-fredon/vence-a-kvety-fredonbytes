"use client";

import { useEffect } from "react";
import { errorLogger } from "@/lib/monitoring/error-logger";
import { performanceMonitor } from "@/lib/monitoring/performance-monitor";
import { WebVitalsTracker } from "./WebVitalsTracker";

interface MonitoringProviderProps {
  children: React.ReactNode;
  userId?: string;
}

export function MonitoringProvider({ children, userId }: MonitoringProviderProps) {
  useEffect(() => {
    // Initialize monitoring only on client side
    if (typeof window === "undefined") return;

    // Set user context for error logging
    if (userId) {
      // Store user ID in session for error context
      sessionStorage.setItem("monitoring_user_id", userId);
    }

    // Initialize performance monitoring
    console.log("🔍 Monitoring initialized");

    // Monitor route changes for SPA navigation
    const handleRouteChange = () => {
      // Record navigation timing
      if (performance.navigation) {
        const navigation = performance.getEntriesByType(
          "navigation"
        )[0] as PerformanceNavigationTiming;
        if (navigation) {
          performanceMonitor.recordMetric("ROUTE_CHANGE", performance.now(), "Navigation");
        }
      }
    };

    // Listen for route changes (Next.js specific)
    window.addEventListener("popstate", handleRouteChange);

    // Monitor visibility changes to pause/resume monitoring
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log("🔍 Monitoring paused (tab hidden)");
      } else {
        console.log("🔍 Monitoring resumed (tab visible)");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Monitor network status
    const handleOnline = () => {
      console.log("🔍 Network: Online");
    };

    const handleOffline = () => {
      console.log("🔍 Network: Offline");
      errorLogger.logError(new Error("Network connection lost"), {
        level: "component",
        context: "Network Status",
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener("popstate", handleRouteChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [userId]);

  return (
    <>
      {children}
      <WebVitalsTracker />
    </>
  );
}

// Hook for manual error reporting
export function useErrorReporting() {
  const reportError = (error: Error, context?: string) => {
    errorLogger.logError(error, {
      level: "component",
      ...(context && { context }),
      ...(sessionStorage.getItem("monitoring_user_id") && { userId: sessionStorage.getItem("monitoring_user_id")! }),
    });
  };

  const reportApiError = (error: Error, request: any, response?: any) => {
    errorLogger.logApiError(error, request, response);
  };

  return { reportError, reportApiError };
}

// Hook for manual performance reporting
export function usePerformanceReporting() {
  const recordMetric = (name: string, value: number, context?: string) => {
    performanceMonitor.recordMetric(name, value, context);
  };

  return { recordMetric };
}
