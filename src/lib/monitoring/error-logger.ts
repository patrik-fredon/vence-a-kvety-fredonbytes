interface ErrorContext {
  errorInfo?: any;
  level?: 'component' | 'page' | 'critical' | 'api';
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
  stack?: string;
  name: string;
  level: string;
  context?: string;
  timestamp: string;
  userAgent: string;
  url: string;
  userId?: string;
  sessionId?: string;
  additionalData?: Record<string, any>;
  resolved: boolean;
}

class ErrorLogger {
  private errors: ErrorLog[] = [];
  private maxErrors = 100; // Keep last 100 errors in memory
  private apiEndpoint = '/api/monitoring/errors';

  /**
   * Log an error with context information
   */
  async logError(error: Error, context: ErrorContext = {}) {
    const errorLog: ErrorLog = {
      id: context.errorId || this.generateErrorId(),
      message: error.message,
      stack: error.stack,
      name: error.name,
      level: context.level || 'component',
      context: context.context,
      timestamp: context.timestamp || new Date().toISOString(),
      userAgent: context.userAgent || (typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown'),
      url: context.url || (typeof window !== 'undefined' ? window.location.href : 'unknown'),
      userId: context.userId,
      sessionId: context.sessionId || this.getSessionId(),
      additionalData: context.additionalData,
      resolved: false,
    };

    // Add to local storage
    this.addToLocalStorage(errorLog);

    // Send to server if not in development
    if (process.env.NODE_ENV !== 'development') {
      try {
        await this.sendToServer(errorLog);
      } catch (serverError) {
        console.error('Failed to send error to server:', serverError);
      }
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Error [${errorLog.level}] - ${errorLog.id}`);
      console.error('Message:', errorLog.message);
      console.error('Stack:', errorLog.stack);
      console.log('Context:', context);
      console.groupEnd();
    }

    return errorLog.id;
  }

  /**
   * Log API errors with additional context
   */
  async logApiError(error: Error, request: {
    method: string;
    url: string;
    body?: any;
    headers?: Record<string, string>;
  }, response?: {
    status: number;
    statusText: string;
    body?: any;
  }) {
    return this.logError(error, {
      level: 'api',
      context: 'API Request',
      additionalData: {
        request,
        response,
      },
    });
  }

  /**
   * Log performance issues
   */
  async logPerformanceIssue(metric: string, value: number, threshold: number, context?: string) {
    const error = new Error(`Performance threshold exceeded: ${metric} = ${value}ms (threshold: ${threshold}ms)`);
    error.name = 'PerformanceError';

    return this.logError(error, {
      level: 'component',
      context: context || 'Performance Monitoring',
      additionalData: {
        metric,
        value,
        threshold,
        type: 'performance',
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
    return this.errors.filter(error => error.level === level);
  }

  /**
   * Clear all stored errors
   */
  clearErrors() {
    this.errors = [];
    if (typeof window !== 'undefined') {
      localStorage.removeItem('error_logs');
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
    if (typeof window === 'undefined') return 'server';

    let sessionId = sessionStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('session_id', sessionId);
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
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('error_logs', JSON.stringify(this.errors));
      } catch (e) {
        // localStorage might be full, clear old errors
        this.errors = this.errors.slice(-50);
        localStorage.setItem('error_logs', JSON.stringify(this.errors));
      }
    }
  }

  /**
   * Load errors from localStorage on initialization
   */
  private loadFromLocalStorage() {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('error_logs');
        if (stored) {
          this.errors = JSON.parse(stored);
        }
      } catch (e) {
        console.warn('Failed to load error logs from localStorage:', e);
      }
    }
  }

  /**
   * Send error to server for centralized logging
   */
  private async sendToServer(errorLog: ErrorLog) {
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorLog),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      // Don't log server errors to avoid infinite loops
      console.error('Failed to send error to server:', error);
    }
  }

  /**
   * Initialize the error logger
   */
  init() {
    this.loadFromLocalStorage();

    // Set up global error handlers
    if (typeof window !== 'undefined') {
      // Handle unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        this.logError(new Error(event.reason), {
          level: 'critical',
          context: 'Unhandled Promise Rejection',
        });
      });

      // Handle global JavaScript errors
      window.addEventListener('error', (event) => {
        this.logError(new Error(event.message), {
          level: 'critical',
          context: 'Global Error Handler',
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

// Create singleton instance
const errorLogger = new ErrorLogger();

// Initialize on import
if (typeof window !== 'undefined') {
  errorLogger.init();
}

// Export the logging function and instance
export const logError = errorLogger.logError.bind(errorLogger);
export const logApiError = errorLogger.logApiError.bind(errorLogger);
export const logPerformanceIssue = errorLogger.logPerformanceIssue.bind(errorLogger);
export { errorLogger };
