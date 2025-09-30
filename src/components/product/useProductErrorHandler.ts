"use client";

import { useCallback } from "react";
import { logError } from "@/lib/monitoring/error-logger";

interface ProductErrorContext {
  productId?: string;
  componentName?: string;
  action?: string;
  additionalData?: Record<string, any>;
}

/**
 * Hook for handling async errors in product components
 * Provides consistent error logging and reporting for product-related operations
 */
export function useProductErrorHandler() {
  const handleError = useCallback((error: Error, context?: ProductErrorContext) => {
    const errorId = `product_async_err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Log error with product-specific context
    logError(error, {
      level: "component",
      context: `product-async-${context?.componentName || "unknown"}`,
      errorId,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "unknown",
      url: typeof window !== "undefined" ? window.location.href : "unknown",
      productId: context?.productId,
      componentName: context?.componentName,
      action: context?.action,
      additionalData: context?.additionalData,
    });

    // In development, also log to console for debugging
    if (process.env['NODE_ENV'] === "development") {
      console.error("Product component async error:", {
        error,
        context,
        errorId,
      });
    }

    // Re-throw to trigger error boundary if needed
    throw error;
  }, []);

  const handleAsyncError = useCallback((error: Error, context?: ProductErrorContext) => {
    // For async errors, we don't want to throw immediately
    // Instead, log the error and optionally show a toast or notification
    const errorId = `product_async_err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    logError(error, {
      level: "component",
      context: `product-async-${context?.componentName || "unknown"}`,
      errorId,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "unknown",
      url: typeof window !== "undefined" ? window.location.href : "unknown",
      productId: context?.productId,
      componentName: context?.componentName,
      action: context?.action,
      additionalData: context?.additionalData,
    });

    if (process.env['NODE_ENV'] === "development") {
      console.error("Product component async error (non-throwing):", {
        error,
        context,
        errorId,
      });
    }

    return errorId;
  }, []);

  return {
    handleError,
    handleAsyncError,
  };
}

/**
 * Higher-order function to wrap async functions with error handling
 */
export function withProductErrorHandling<T extends (...args: any[]) => Promise<any>>(
  asyncFn: T,
  context?: ProductErrorContext
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await asyncFn(...args);
    } catch (error) {
      const errorId = `product_async_err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      logError(error as Error, {
        level: "component",
        context: `product-async-${context?.componentName || "unknown"}`,
        errorId,
        timestamp: new Date().toISOString(),
        userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "unknown",
        url: typeof window !== "undefined" ? window.location.href : "unknown",
        productId: context?.productId,
        componentName: context?.componentName,
        action: context?.action,
        additionalData: context?.additionalData,
      });

      if (process.env['NODE_ENV'] === "development") {
        console.error("Product async function error:", {
          error,
          context,
          errorId,
          args,
        });
      }

      throw error;
    }
  }) as T;
}
