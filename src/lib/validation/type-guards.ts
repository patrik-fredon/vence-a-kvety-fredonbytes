/**
 * Comprehensive type guards and error handling utilities
 * Provides runtime type checking and validation for all data transformations
 */

import { logError } from "@/lib/monitoring/error-logger";

// Base types for validation
export interface ValidationResult<T = any> {
  isValid: boolean;
  data?: T;
  errors: ValidationError[];
  warnings?: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  severity: "error" | "warning" | "info";
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
}

// Product-related type guards
export function isValidProduct(value: unknown): value is Product {
  if (!value || typeof value !== "object") {
    return false;
  }

  const product = value as any;

  return (
    typeof product.id === "string" &&
    typeof product.slug === "string" &&
    typeof product.name_cs === "string" &&
    typeof product.name_en === "string" &&
    typeof product.price === "number" &&
    product.price >= 0 &&
    Array.isArray(product.images) &&
    (product.category === null || typeof product.category === "object")
  );
}

export function isValidProductArray(value: unknown): value is Product[] {
  return Array.isArray(value) && value.every(isValidProduct);
}

export function isValidProductImage(value: unknown): value is ProductImage {
  if (!value || typeof value !== "object") {
    return false;
  }

  const image = value as any;

  return (
    typeof image.id === "string" &&
    typeof image.url === "string" &&
    typeof image.alt_cs === "string" &&
    typeof image.alt_en === "string" &&
    typeof image.isPrimary === "boolean" &&
    typeof image.sortOrder === "number"
  );
}

// Navigation-related type guards
export function isValidLocale(value: unknown): value is "cs" | "en" {
  return value === "cs" || value === "en";
}

export function isValidProductSlug(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }

  // Product slug should be non-empty, contain only valid URL characters
  const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugPattern.test(value) && value.length > 0 && value.length <= 100;
}

export function isValidNavigationParams(value: unknown): value is { locale: string; slug: string } {
  if (!value || typeof value !== "object") {
    return false;
  }

  const params = value as any;

  return isValidLocale(params.locale) && isValidProductSlug(params.slug);
}

// API response type guards
export function isValidApiResponse<T>(
  value: unknown,
  dataValidator: (data: unknown) => data is T
): value is { data: T; success: boolean } {
  if (!value || typeof value !== "object") {
    return false;
  }

  const response = value as any;

  return (
    typeof response.success === "boolean" &&
    (response.success === false || dataValidator(response.data))
  );
}

export function isValidErrorResponse(value: unknown): value is { error: string; message?: string } {
  if (!value || typeof value !== "object") {
    return false;
  }

  const response = value as any;

  return typeof response.error === "string";
}

// Database query result type guards
export function isValidDatabaseResult<T>(
  value: unknown,
  dataValidator: (data: unknown) => data is T
): value is { data: T | null; error: null } | { data: null; error: Error } {
  if (!value || typeof value !== "object") {
    return false;
  }

  const result = value as any;

  // Valid success result
  if (result.error === null) {
    return result.data === null || dataValidator(result.data);
  }

  // Valid error result
  if (result.data === null) {
    return result.error instanceof Error || typeof result.error === "object";
  }

  return false;
}

// User input validation type guards
export function isValidEmail(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(value) && value.length <= 254;
}

export function isValidPhoneNumber(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }

  // Czech phone number pattern (simplified)
  const phonePattern = /^(\+420)?[0-9]{9}$/;
  return phonePattern.test(value.replace(/\s/g, ""));
}

export function isValidPostalCode(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }

  // Czech postal code pattern
  const postalPattern = /^[0-9]{3}\s?[0-9]{2}$/;
  return postalPattern.test(value);
}

// Async operation error handling
export async function safeAsyncOperation<T>(
  operation: () => Promise<T>,
  context: string,
  fallback?: T
): Promise<ValidationResult<T>> {
  try {
    const data = await operation();
    return {
      isValid: true,
      data,
      errors: [],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const validationError: ValidationError = {
      field: "operation",
      message: errorMessage,
      code: "ASYNC_OPERATION_FAILED",
      severity: "error",
    };

    // Log the error for monitoring
    await logError(error instanceof Error ? error : new Error(errorMessage), {
      level: "component",
      context: `async-operation-${context}`,
      additionalData: { context, fallback: fallback !== undefined },
    });

    return {
      isValid: false,
      data: fallback as T,
      errors: [validationError],
    };
  }
}

// Data transformation with validation
export function safeTransform<T, U>(
  data: T,
  transformer: (data: T) => U,
  validator: (result: unknown) => result is U,
  context: string
): ValidationResult<U> {
  try {
    const result = transformer(data);

    if (validator(result)) {
      return {
        isValid: true,
        data: result,
        errors: [],
      };
    } else {
      const validationError: ValidationError = {
        field: "transformation",
        message: "Transformation result failed validation",
        code: "TRANSFORMATION_VALIDATION_FAILED",
        severity: "error",
      };

      logError(new Error("Transformation validation failed"), {
        level: "component",
        context: `data-transformation-${context}`,
        additionalData: { originalData: data, transformedResult: result },
      });

      return {
        isValid: false,
        errors: [validationError],
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown transformation error";
    const validationError: ValidationError = {
      field: "transformation",
      message: errorMessage,
      code: "TRANSFORMATION_ERROR",
      severity: "error",
    };

    logError(error instanceof Error ? error : new Error(errorMessage), {
      level: "component",
      context: `data-transformation-${context}`,
      additionalData: { originalData: data },
    });

    return {
      isValid: false,
      errors: [validationError],
    };
  }
}

// API response validation with error handling
export async function validateApiResponse<T>(
  response: Response,
  dataValidator: (data: unknown) => data is T,
  context: string
): Promise<ValidationResult<T>> {
  try {
    if (!response.ok) {
      const errorText = await response.text();
      const validationError: ValidationError = {
        field: "response",
        message: `API request failed: ${response.status} ${response.statusText}`,
        code: "API_REQUEST_FAILED",
        severity: "error",
      };

      await logError(new Error(`API request failed: ${response.status}`), {
        level: "api",
        context: `api-response-${context}`,
        additionalData: {
          status: response.status,
          statusText: response.statusText,
          errorText,
          url: response.url,
        },
      });

      return {
        isValid: false,
        errors: [validationError],
      };
    }

    const data = await response.json();

    if (dataValidator(data)) {
      return {
        isValid: true,
        data,
        errors: [],
      };
    } else {
      const validationError: ValidationError = {
        field: "data",
        message: "API response data failed validation",
        code: "API_DATA_VALIDATION_FAILED",
        severity: "error",
      };

      await logError(new Error("API response validation failed"), {
        level: "api",
        context: `api-response-${context}`,
        additionalData: { responseData: data, url: response.url },
      });

      return {
        isValid: false,
        errors: [validationError],
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown API error";
    const validationError: ValidationError = {
      field: "response",
      message: errorMessage,
      code: "API_RESPONSE_ERROR",
      severity: "error",
    };

    await logError(error instanceof Error ? error : new Error(errorMessage), {
      level: "api",
      context: `api-response-${context}`,
      additionalData: { url: response.url },
    });

    return {
      isValid: false,
      errors: [validationError],
    };
  }
}

// Database query validation with error handling
export async function validateDatabaseQuery<T>(
  queryPromise: Promise<{ data: T | null; error: any }>,
  dataValidator: (data: unknown) => data is T,
  context: string
): Promise<ValidationResult<T>> {
  try {
    const result = await queryPromise;

    if (result.error) {
      const validationError: ValidationError = {
        field: "query",
        message: `Database query failed: ${result.error.message || "Unknown database error"}`,
        code: "DATABASE_QUERY_FAILED",
        severity: "error",
      };

      await logError(new Error(result.error.message || "Database query failed"), {
        level: "api",
        context: `database-query-${context}`,
        additionalData: { error: result.error },
      });

      return {
        isValid: false,
        errors: [validationError],
      };
    }

    if (result.data === null) {
      return {
        isValid: true,
        data: undefined as any, // null result is valid for some queries
        errors: [],
      };
    }

    if (dataValidator(result.data)) {
      return {
        isValid: true,
        data: result.data,
        errors: [],
      };
    } else {
      const validationError: ValidationError = {
        field: "data",
        message: "Database query result failed validation",
        code: "DATABASE_DATA_VALIDATION_FAILED",
        severity: "error",
      };

      await logError(new Error("Database query result validation failed"), {
        level: "api",
        context: `database-query-${context}`,
        additionalData: { queryResult: result.data },
      });

      return {
        isValid: false,
        errors: [validationError],
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown database error";
    const validationError: ValidationError = {
      field: "query",
      message: errorMessage,
      code: "DATABASE_QUERY_ERROR",
      severity: "error",
    };

    await logError(error instanceof Error ? error : new Error(errorMessage), {
      level: "api",
      context: `database-query-${context}`,
    });

    return {
      isValid: false,
      errors: [validationError],
    };
  }
}

// Utility function to collect validation errors
export function collectValidationErrors(...results: ValidationResult[]): ValidationError[] {
  return results.flatMap((result) => result.errors);
}

// Utility function to check if any validation failed
export function hasValidationErrors(...results: ValidationResult[]): boolean {
  return results.some((result) => !result.isValid);
}

// Import types from existing files
import type { Product, ProductImage } from "@/types/product";
