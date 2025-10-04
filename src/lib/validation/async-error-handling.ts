/**
 * Comprehensive async operation error handling
 * Provides robust error handling patterns for all async operations
 */

import { logError } from "@/lib/monitoring/error-logger";
import type { ValidationError, ValidationResult } from "./type-guards";

export interface AsyncOperationOptions {
  retries?: number;
  retryDelay?: number;
  timeout?: number;
  context?: string;
  fallback?: any;
  circuitBreaker?: boolean;
}

export interface CircuitBreakerState {
  failures: number;
  lastFailure: number;
  state: "closed" | "open" | "half-open";
}

// Circuit breaker storage
const circuitBreakers = new Map<string, CircuitBreakerState>();

/**
 * Execute async operation with comprehensive error handling
 */
export async function executeWithErrorHandling<T>(
  operation: () => Promise<T>,
  options: AsyncOperationOptions = {}
): Promise<ValidationResult<T>> {
  const {
    retries = 0,
    retryDelay = 1000,
    timeout = 30000,
    context = "unknown",
    fallback,
    circuitBreaker = false,
  } = options;

  // Check circuit breaker if enabled
  if (circuitBreaker && isCircuitOpen(context)) {
    const error: ValidationError = {
      field: "operation",
      message: "Circuit breaker is open - operation blocked",
      code: "CIRCUIT_BREAKER_OPEN",
      severity: "error",
    };

    return {
      isValid: false,
      data: fallback,
      errors: [error],
    };
  }

  let lastError: Error | null = null;
  let attempt = 0;

  while (attempt <= retries) {
    try {
      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Operation timeout")), timeout);
      });

      // Race between operation and timeout
      const result = await Promise.race([operation(), timeoutPromise]);

      // Reset circuit breaker on success
      if (circuitBreaker) {
        resetCircuitBreaker(context);
      }

      return {
        isValid: true,
        data: result,
        errors: [],
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      attempt++;

      // Log each attempt
      await logError(lastError, {
        level: "component",
        context: `async-operation-${context}`,
        additionalData: {
          attempt,
          maxRetries: retries,
          timeout,
          willRetry: attempt <= retries,
        },
      });

      // Update circuit breaker
      if (circuitBreaker) {
        recordFailure(context);
      }

      // Wait before retry (except on last attempt)
      if (attempt <= retries) {
        await sleep(retryDelay * attempt); // Exponential backoff
      }
    }
  }

  // All attempts failed
  const error: ValidationError = {
    field: "operation",
    message: lastError?.message || "Async operation failed",
    code: "ASYNC_OPERATION_FAILED",
    severity: "error",
  };

  return {
    isValid: false,
    data: fallback,
    errors: [error],
  };
}

/**
 * Execute multiple async operations with error handling
 */
export async function executeAllWithErrorHandling<T>(
  operations: Array<() => Promise<T>>,
  options: AsyncOperationOptions = {}
): Promise<ValidationResult<T[]>> {
  const { context = "batch-operation" } = options;
  const results: T[] = [];
  const errors: ValidationError[] = [];

  try {
    const promises = operations.map(async (operation, index) => {
      const result = await executeWithErrorHandling(operation, {
        ...options,
        context: `${context}-${index}`,
      });

      if (result.isValid && result.data !== undefined) {
        return { index, data: result.data, success: true };
      } else {
        return { index, errors: result.errors, success: false };
      }
    });

    const outcomes = await Promise.allSettled(promises);

    outcomes.forEach((outcome, index) => {
      if (outcome.status === "fulfilled") {
        if (outcome.value.success) {
          results[index] = outcome.value.data as T;
        } else {
          errors.push(...(outcome.value.errors || []));
        }
      } else {
        errors.push({
          field: `operation-${index}`,
          message: outcome.reason?.message || "Operation failed",
          code: "BATCH_OPERATION_FAILED",
          severity: "error",
        });
      }
    });

    return {
      isValid: errors.length === 0,
      data: results,
      errors,
    };
  } catch (error) {
    const validationError: ValidationError = {
      field: "batch",
      message: error instanceof Error ? error.message : "Batch operation failed",
      code: "BATCH_EXECUTION_ERROR",
      severity: "error",
    };

    await logError(error instanceof Error ? error : new Error("Batch operation error"), {
      level: "component",
      context: `batch-operation-${context}`,
      additionalData: { operationCount: operations.length },
    });

    return {
      isValid: false,
      errors: [validationError],
    };
  }
}

/**
 * Database operation with error handling
 */
export async function executeDatabaseOperation<T>(
  operation: () => Promise<{ data: T | null; error: any }>,
  context: string,
  options: AsyncOperationOptions = {}
): Promise<ValidationResult<T>> {
  return executeWithErrorHandling(
    async () => {
      const result = await operation();

      if (result.error) {
        throw new Error(result.error.message || "Database operation failed");
      }

      if (result.data === null) {
        throw new Error("No data returned from database");
      }

      return result.data;
    },
    {
      ...options,
      context: `database-${context}`,
    }
  );
}

/**
 * API request with error handling
 */
export async function executeApiRequest<T>(
  url: string,
  options: RequestInit = {},
  context: string,
  requestOptions: AsyncOperationOptions = {}
): Promise<ValidationResult<T>> {
  return executeWithErrorHandling(
    async () => {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `API request failed: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const data = await response.json();
      return data;
    },
    {
      ...requestOptions,
      context: `api-${context}`,
    }
  );
}

/**
 * File operation with error handling
 */
export async function executeFileOperation<T>(
  operation: () => Promise<T>,
  context: string,
  options: AsyncOperationOptions = {}
): Promise<ValidationResult<T>> {
  return executeWithErrorHandling(operation, {
    ...options,
    context: `file-${context}`,
    retries: options.retries || 2, // Default retries for file operations
    timeout: options.timeout || 10000, // Shorter timeout for file operations
  });
}

/**
 * Navigation operation with error handling
 */
export async function executeNavigationOperation(
  operation: () => Promise<void> | void,
  context: string,
  options: AsyncOperationOptions = {}
): Promise<ValidationResult<void>> {
  return executeWithErrorHandling(
    async () => {
      const result = operation();
      if (result instanceof Promise) {
        await result;
      }
    },
    {
      ...options,
      context: `navigation-${context}`,
      timeout: options.timeout || 5000, // Quick timeout for navigation
    }
  );
}

// Circuit breaker implementation
function isCircuitOpen(context: string): boolean {
  const breaker = circuitBreakers.get(context);
  if (!breaker) return false;

  const now = Date.now();
  const timeSinceLastFailure = now - breaker.lastFailure;

  // Reset to half-open after 60 seconds
  if (breaker.state === "open" && timeSinceLastFailure > 60000) {
    breaker.state = "half-open";
    breaker.failures = 0;
  }

  return breaker.state === "open";
}

function recordFailure(context: string): void {
  const breaker = circuitBreakers.get(context) || {
    failures: 0,
    lastFailure: 0,
    state: "closed" as const,
  };

  breaker.failures++;
  breaker.lastFailure = Date.now();

  // Open circuit after 5 failures
  if (breaker.failures >= 5) {
    breaker.state = "open";
  }

  circuitBreakers.set(context, breaker);
}

function resetCircuitBreaker(context: string): void {
  const breaker = circuitBreakers.get(context);
  if (breaker) {
    breaker.failures = 0;
    breaker.state = "closed";
    circuitBreakers.set(context, breaker);
  }
}

// Utility functions
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Debounced async operation to prevent rapid successive calls
 */
export function createDebouncedAsyncOperation<T extends any[], R>(
  operation: (...args: T) => Promise<R>,
  delay: number = 300
): (...args: T) => Promise<R> {
  let timeoutId: NodeJS.Timeout | null = null;
  let latestResolve: ((value: R) => void) | null = null;
  let latestReject: ((reason: any) => void) | null = null;

  return (...args: T): Promise<R> => {
    return new Promise<R>((resolve, reject) => {
      // Cancel previous timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Reject previous promise if it exists
      if (latestReject) {
        latestReject(new Error("Operation cancelled by newer request"));
      }

      latestResolve = resolve;
      latestReject = reject;

      timeoutId = setTimeout(async () => {
        try {
          const result = await operation(...args);
          if (latestResolve === resolve) {
            resolve(result);
          }
        } catch (error) {
          if (latestReject === reject) {
            reject(error);
          }
        } finally {
          if (latestResolve === resolve) {
            latestResolve = null;
            latestReject = null;
          }
        }
      }, delay);
    });
  };
}

/**
 * Throttled async operation to limit execution frequency
 */
export function createThrottledAsyncOperation<T extends any[], R>(
  operation: (...args: T) => Promise<R>,
  interval: number = 1000
): (...args: T) => Promise<R | null> {
  let lastExecution = 0;
  let isExecuting = false;

  return async (...args: T): Promise<R | null> => {
    const now = Date.now();

    if (isExecuting || now - lastExecution < interval) {
      return null; // Skip execution
    }

    isExecuting = true;
    lastExecution = now;

    try {
      const result = await operation(...args);
      return result;
    } finally {
      isExecuting = false;
    }
  };
}
