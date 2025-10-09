interface ErrorContext {
  errorInfo?: any;
  level?: "component" | "page" | "critical" | "api" | "performance" | "navigation" | "business";
  context?: string;
  errorId?: string;
  timestamp?: string;
  userAgent?: string;
  url?: string;
  userId?: string;
  sessionId?: string;
  additionalData?: Record<string, any>;
}

interface ErrorLog {
  id: string;
  message: string;
  stack: string | undefined;
  name: string;
  level: string;
  context: string | undefined;
  timestamp: string;
  userAgent: string;
  url: string;
  userId: string | undefined;
  sessionId: string | undefined;
  additionalData: Record<string, any> | undefined;
  resolved: boolean;
}

class ErrorLogger {
  private errors: ErrorLog[] = [];
  private maxErrors = 100; // Keep last 100 errors in memory
  private apiEndpoint = "/api/monitoring/errors";
  private performanceErrorCount = 0;
  private maxPerformanceErrors = 3; // Reduced circuit breaker for performance errors
  private performanceErrorResetTime = 120000; // Reset after 2 minutes for better stability

  /**
   * Log an error with context information
   */
  async logError(error: Error, context: ErrorContext = {}) {
    const errorLog: ErrorLog = {
      id: context.errorId || this.generateErrorId(),
      message: error.message,
      stack: error.stack,
      name: error.name,
      level: context.level || "component",
      context: context.context,
      timestamp: context.timestamp || new Date().toISOString(),
      userAgent:
        context.userAgent ||
        (typeof window !== "undefined" ? window.navigator.userAgent : "unknown"),
      url: context.url || (typeof window !== "undefined" ? window.location.href : "unknown"),
      userId: context.userId,
      sessionId: context.sessionId || this.getSessionId(),
      additionalData: context.additionalData,
      resolved: false,
    };

    // Add to local storage
    this.addToLocalStorage(errorLog);

    // Send to server if not in development
    if (process.env['NODE_ENV'] !== "development") {
      try {
        await this.sendToServer(errorLog);
      } catch (serverError) {
        console.error("Failed to send error to server:", serverError);
      }
    }

    // Log to console in development with safe stack trace handling
    if (process.env['NODE_ENV'] === "development") {
      console.group(`🚨 Error [${errorLog.level}] - ${errorLog.id}`);
      console.error("Message:", errorLog.message);

      // Safe stack trace logging - check if stack exists and is valid
      if (errorLog.stack && typeof errorLog.stack === "string" && errorLog.stack.trim()) {
        try {
          console.error("Stack:", errorLog.stack);
        } catch (stackError) {
          console.error(
            "Stack trace unavailable (logging error):",
            stackError instanceof Error ? stackError.message : String(stackError)
          );
        }
      } else {
        console.error("Stack trace unavailable");
      }

      console.log("Context:", context);
      console.groupEnd();
    }

    return errorLog.id;
  }

  /**
   * Log API errors with additional context
   */
  async logApiError(
    error: Error,
    request: {
      method: string;
      url: string;
      body?: any;
      headers?: Record<string, string>;
    },
    response?: {
      status: number;
      statusText: string;
      body?: any;
    }
  ) {
    return this.logError(error, {
      level: "api",
      context: "API Request",
      additionalData: {
        request,
        response,
      },
    });
  }

  /**
   * Log performance issues
   */
  async logPerformanceIssue(
    metric: string,
    value: number,
    threshold: number,
    context?: string,
    unit: string = "ms"
  ) {
    // Circuit breaker: Stop logging performance errors in development after threshold
    if (process.env['NODE_ENV'] === "development") {
      if (this.performanceErrorCount >= this.maxPerformanceErrors) {
        return; // Stop logging to prevent cascading errors
      }
      this.performanceErrorCount++;

      // Reset counter after timeout
      setTimeout(() => {
        this.performanceErrorCount = Math.max(0, this.performanceErrorCount - 1);
      }, this.performanceErrorResetTime);
    }
    // Format the value and threshold based on the unit
    const formatValue = (val: number, unit: string): string => {
      switch (unit) {
        case "bytes":
          return val > 1024 * 1024
            ? `${(val / (1024 * 1024)).toFixed(2)}MB`
            : val > 1024
              ? `${(val / 1024).toFixed(2)}KB`
              : `${val}B`;
        default:
          return `${val}ms`;
      }
    };

    const formattedValue = formatValue(value, unit);
    const formattedThreshold = formatValue(threshold, unit);

    const error = new Error(
      `Performance threshold exceeded: ${metric} = ${formattedValue} (threshold: ${formattedThreshold})`
    );
    error.name = "PerformanceError";

    return this.logError(error, {
      level: "component",
      context: context || "Performance Monitoring",
      additionalData: {
        metric,
        value,
        threshold,
        unit,
        type: "performance",
      },
    });
  }

  /**
   * Get recent errors for debugging
   */
  getRecentErrors(limit = 10): ErrorLog[] {
    return this.errors.slice(-limit);
  }

  /**
   * Get errors by level
   */
  getErrorsByLevel(level: string): ErrorLog[] {
    return this.errors.filter((error) => error.level === level);
  }

  /**
   * Clear all stored errors
   */
  clearErrors() {
    this.errors = [];
    if (typeof window !== "undefined") {
      localStorage.removeItem("error_logs");
    }
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get or create session ID
   */
  private getSessionId(): string {
    if (typeof window === "undefined") return "server";

    let sessionId = sessionStorage.getItem("session_id");
    if (!sessionId) {
      sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem("session_id", sessionId);
    }
    return sessionId;
  }

  /**
   * Add error to local storage for persistence
   */
  private addToLocalStorage(errorLog: ErrorLog) {
    this.errors.push(errorLog);

    // Keep only the last maxErrors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Store in localStorage for persistence across page reloads
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("error_logs", JSON.stringify(this.errors));
      } catch (_e) {
        // localStorage might be full, clear old errors
        this.errors = this.errors.slice(-50);
        localStorage.setItem("error_logs", JSON.stringify(this.errors));
      }
    }
  }

  /**
   * Load errors from localStorage on initialization
   */
  private loadFromLocalStorage() {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("error_logs");
        if (stored) {
          this.errors = JSON.parse(stored);
        }
      } catch (e) {
        console.warn("Failed to load error logs from localStorage:", e);
      }
    }
  }

  /**
   * Send error to server for centralized logging
   */
  private async sendToServer(errorLog: ErrorLog) {
    try {
      const response = await fetch(this.apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(errorLog),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      // Don't log server errors to avoid infinite loops
      console.error("Failed to send error to server:", error);
    }
  }

  /**
   * Initialize the error logger
   */
  init() {
    this.loadFromLocalStorage();

    // Set up global error handlers
    if (typeof window !== "undefined") {
      // Handle unhandled promise rejections
      window.addEventListener("unhandledrejection", (event) => {
        this.logError(new Error(event.reason), {
          level: "critical",
          context: "Unhandled Promise Rejection",
        });
      });

      // Handle global JavaScript errors
      window.addEventListener("error", (event) => {
        this.logError(new Error(event.message), {
          level: "critical",
          context: "Global Error Handler",
          additionalData: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
          },
        });
      });
    }
  }
}

/**
 * Enhanced Production Error Logger with Core Web Vitals integration
 */
class ProductionErrorLogger extends ErrorLogger {
  private coreWebVitalsErrors: Array<{
    metric: string;
    value: number;
    threshold: number;
    timestamp: number;
  }> = [];
  private navigationErrors: Array<{ route: string; error: string; timestamp: number }> = [];
  private paymentErrors: Array<{
    step: string;
    error: string;
    amount?: number;
    timestamp: number;
  }> = [];
  private imageLoadErrors: Array<{ src: string; error: string; timestamp: number }> = [];

  /**
   * Log Core Web Vitals performance issues
   */
  async logCoreWebVitalsIssue(
    metric: "LCP" | "FID" | "CLS" | "INP" | "FCP" | "TTFB",
    value: number,
    threshold: number,
    context?: string
  ) {
    this.coreWebVitalsErrors.push({
      metric,
      value,
      threshold,
      timestamp: Date.now(),
    });

    // Keep only last 50 entries
    if (this.coreWebVitalsErrors.length > 50) {
      this.coreWebVitalsErrors = this.coreWebVitalsErrors.slice(-50);
    }

    const error = new Error(
      `Core Web Vitals threshold exceeded: ${metric} = ${value}ms (threshold: ${threshold}ms)`
    );
    error.name = "CoreWebVitalsError";

    return this.logError(error, {
      level: "performance",
      context: context || "Core Web Vitals Monitoring",
      additionalData: {
        metric,
        value,
        threshold,
        type: "core-web-vitals",
        rating: this.getPerformanceRating(metric, value),
      },
    });
  }

  /**
   * Log navigation and routing errors
   */
  async logNavigationError(route: string, error: Error, context?: string) {
    this.navigationErrors.push({
      route,
      error: error.message,
      timestamp: Date.now(),
    });

    // Keep only last 30 entries
    if (this.navigationErrors.length > 30) {
      this.navigationErrors = this.navigationErrors.slice(-30);
    }

    return this.logError(error, {
      level: "navigation",
      context: context || "Navigation Error",
      additionalData: {
        route,
        type: "navigation",
        userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "unknown",
      },
    });
  }

  /**
   * Log payment processing errors
   */
  async logPaymentError(
    step: "initialization" | "processing" | "confirmation" | "webhook",
    error: Error,
    amount?: number,
    paymentMethod?: string,
    context?: string
  ) {
    this.paymentErrors.push({
      step,
      error: error.message,
      ...(amount !== undefined && { amount }),
      timestamp: Date.now(),
    });

    // Keep only last 20 entries
    if (this.paymentErrors.length > 20) {
      this.paymentErrors = this.paymentErrors.slice(-20);
    }

    return this.logError(error, {
      level: "critical",
      context: context || "Payment Processing Error",
      additionalData: {
        step,
        amount,
        paymentMethod,
        type: "payment",
        // Don't log sensitive payment data
        sanitized: true,
      },
    });
  }

  /**
   * Log image loading performance and errors
   */
  async logImageLoadError(src: string, error: Error, loadTime?: number, context?: string) {
    this.imageLoadErrors.push({
      src: this.sanitizeImageUrl(src),
      error: error.message,
      timestamp: Date.now(),
    });

    // Keep only last 40 entries
    if (this.imageLoadErrors.length > 40) {
      this.imageLoadErrors = this.imageLoadErrors.slice(-40);
    }

    return this.logError(error, {
      level: "component",
      context: context || "Image Loading Error",
      additionalData: {
        src: this.sanitizeImageUrl(src),
        loadTime,
        type: "image-load",
      },
    });
  }

  /**
   * Log checkout flow optimization data
   */
  async logCheckoutFlowIssue(
    step: "cart" | "shipping" | "payment" | "confirmation",
    issue: string,
    userInteraction?: string,
    context?: string
  ) {
    const error = new Error(`Checkout flow issue at ${step}: ${issue}`);
    error.name = "CheckoutFlowError";

    return this.logError(error, {
      level: "business",
      context: context || "Checkout Flow Optimization",
      additionalData: {
        step,
        issue,
        userInteraction,
        type: "checkout-flow",
      },
    });
  }

  /**
   * Get performance insights for monitoring dashboard
   */
  getPerformanceInsights() {
    return {
      coreWebVitals: {
        errors: this.coreWebVitalsErrors.length,
        recentIssues: this.coreWebVitalsErrors.slice(-10),
        metrics: this.aggregateCoreWebVitalsMetrics(),
      },
      navigation: {
        errors: this.navigationErrors.length,
        recentErrors: this.navigationErrors.slice(-5),
        mostProblematicRoutes: this.getMostProblematicRoutes(),
      },
      payments: {
        errors: this.paymentErrors.length,
        recentErrors: this.paymentErrors.slice(-5),
        errorsByStep: this.getPaymentErrorsByStep(),
      },
      images: {
        errors: this.imageLoadErrors.length,
        recentErrors: this.imageLoadErrors.slice(-5),
        mostProblematicImages: this.getMostProblematicImages(),
      },
    };
  }

  /**
   * Private helper methods
   */
  private getPerformanceRating(
    metric: string,
    value: number
  ): "good" | "needs-improvement" | "poor" {
    const thresholds = {
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      INP: { good: 200, poor: 500 },
      CLS: { good: 0.1, poor: 0.25 },
      FCP: { good: 1800, poor: 3000 },
      TTFB: { good: 800, poor: 1800 },
    };

    const threshold = thresholds[metric as keyof typeof thresholds];
    if (!threshold) return "good";

    if (value <= threshold.good) return "good";
    if (value <= threshold.poor) return "needs-improvement";
    return "poor";
  }

  private sanitizeImageUrl(url: string | undefined): string {
    // Remove query parameters that might contain sensitive data
    if (!url || typeof url !== "string") return "";
    try {
      const urlObj = new URL(url);
      return `${urlObj.origin}${urlObj.pathname}`;
    } catch {
      // At this point, url is guaranteed to be a string due to the check above
      const safeUrl = url as string; // Type assertion since we know it's a string
      return safeUrl.includes("?") ? safeUrl.split("?")[0] || safeUrl : safeUrl;
    }
  }

  private aggregateCoreWebVitalsMetrics() {
    const metrics: Record<string, { count: number; avgValue: number; worstValue: number }> = {};

    this.coreWebVitalsErrors.forEach(({ metric, value }) => {
      if (!metrics[metric]) {
        metrics[metric] = { count: 0, avgValue: 0, worstValue: 0 };
      }
      metrics[metric].count++;
      metrics[metric].avgValue = (metrics[metric].avgValue + value) / metrics[metric].count;
      metrics[metric].worstValue = Math.max(metrics[metric].worstValue, value);
    });

    return metrics;
  }

  private getMostProblematicRoutes() {
    const routeCounts: Record<string, number> = {};
    this.navigationErrors.forEach(({ route }) => {
      routeCounts[route] = (routeCounts[route] || 0) + 1;
    });

    return Object.entries(routeCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([route, count]) => ({ route, count }));
  }

  private getPaymentErrorsByStep() {
    const stepCounts: Record<string, number> = {};
    this.paymentErrors.forEach(({ step }) => {
      stepCounts[step] = (stepCounts[step] || 0) + 1;
    });

    return stepCounts;
  }

  private getMostProblematicImages() {
    const imageCounts: Record<string, number> = {};
    this.imageLoadErrors.forEach(({ src }) => {
      imageCounts[src] = (imageCounts[src] || 0) + 1;
    });

    return Object.entries(imageCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([src, count]) => ({ src, count }));
  }
}

// Create singleton instance
const errorLogger = new ProductionErrorLogger();
// Enhanced production monitoring functions
export const logCoreWebVitalsIssue = (
  metric: "LCP" | "FID" | "CLS" | "INP" | "FCP" | "TTFB",
  value: number,
  threshold: number,
  context?: string
) =>
  (errorLogger as ProductionErrorLogger).logCoreWebVitalsIssue(metric, value, threshold, context);

export const logNavigationError = (route: string, error: Error, context?: string) =>
  (errorLogger as ProductionErrorLogger).logNavigationError(route, error, context);

export const logPaymentError = (
  step: "initialization" | "processing" | "confirmation" | "webhook",
  error: Error,
  amount?: number,
  paymentMethod?: string,
  context?: string
) =>
  (errorLogger as ProductionErrorLogger).logPaymentError(
    step,
    error,
    amount,
    paymentMethod,
    context
  );

export const logImageLoadError = (src: string, error: Error, loadTime?: number, context?: string) =>
  (errorLogger as ProductionErrorLogger).logImageLoadError(src, error, loadTime, context);

export const logCheckoutFlowIssue = (
  step: "cart" | "shipping" | "payment" | "confirmation",
  issue: string,
  userInteraction?: string,
  context?: string
) =>
  (errorLogger as ProductionErrorLogger).logCheckoutFlowIssue(
    step,
    issue,
    userInteraction,
    context
  );

export const getPerformanceInsights = () =>
  (errorLogger as ProductionErrorLogger).getPerformanceInsights();

// Initialize on import
if (typeof window !== "undefined") {
  errorLogger.init();
}

// Export the logging function and instance
export const logError = errorLogger.logError.bind(errorLogger);
export const logApiError = errorLogger.logApiError.bind(errorLogger);
export const logPerformanceIssue = errorLogger.logPerformanceIssue.bind(errorLogger);
export { errorLogger };
