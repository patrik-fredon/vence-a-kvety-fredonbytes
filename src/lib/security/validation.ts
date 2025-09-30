/**
 * Comprehensive input validation and sanitization utilities
 * Provides CSRF protection, input validation, and data sanitization
 */

import { headers } from "next/headers";
import type { NextRequest } from "next/server";

// Common validation patterns
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^(\+420)?[0-9]{9}$/,
  postalCode: /^[0-9]{3}\s?[0-9]{2}$/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  safeString: /^[a-zA-Z0-9\s\-_.,!?()]+$/,
} as const;

// Input length limits
export const INPUT_LIMITS = {
  name: 100,
  email: 254,
  phone: 20,
  address: 200,
  city: 100,
  postalCode: 10,
  country: 100,
  company: 100,
  note: 500,
  message: 1000,
  description: 2000,
  title: 200,
} as const;

/**
 * Validation error interface
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

/**
 * Validation result interface
 */
export interface ValidationResult<T = any> {
  isValid: boolean;
  data?: T | undefined;
  errors: ValidationError[];
}

/**
 * CSRF Token validation
 */
export async function validateCSRFToken(request: NextRequest): Promise<boolean> {
  try {
    const headersList = await headers();
    const csrfToken = headersList.get("x-csrf-token");
    const sessionToken = headersList.get("authorization");

    if (!(csrfToken && sessionToken)) {
      return false;
    }

    // In a real implementation, you wofy the CSRF token
    // against a stored value or generate it based on session data
    // For now, we'll implement a basic check
    return csrfToken.length > 0 && sessionToken.length > 0;
  } catch (error) {
    console.error("CSRF validation error:", error);
    return false;
  }
}

/**
 * Generate CSRF token
 */
export function generateCSRFToken(): string {
  return Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString("base64");
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string, maxLength?: number): string {
  if (!input || typeof input !== "string") {
    return "";
  }

  // Remove potentially dangerous characters
  let sanitized = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove script tags
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "") // Remove event handlers with quotes
    .replace(/on\w+\s*=\s*[^"'\s>]+/gi, "") // Remove event handlers without quotes
    .trim();

  // Apply length limit if specified
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}

/**
 * Validate email address
 */
export function validateEmail(email: string): ValidationResult<string> {
  const sanitized = sanitizeString(email, INPUT_LIMITS.email).toLowerCase();

  if (!sanitized) {
    return {
      isValid: false,
      errors: [{ field: "email", message: "Email is required", code: "REQUIRED" }],
    };
  }

  if (!VALIDATION_PATTERNS.email.test(sanitized)) {
    return {
      isValid: false,
      errors: [{ field: "email", message: "Invalid email format", code: "INVALID_FORMAT" }],
    };
  }

  return {
    isValid: true,
    data: sanitized,
    errors: [],
  };
}

/**
 * Validate phone number
 */
export function validatePhone(phone: string): ValidationResult<string> {
  const sanitized = sanitizeString(phone, INPUT_LIMITS.phone).replace(/\s/g, "");

  if (!sanitized) {
    return {
      isValid: false,
      errors: [{ field: "phone", message: "Phone number is required", code: "REQUIRED" }],
    };
  }

  if (!VALIDATION_PATTERNS.phone.test(sanitized)) {
    return {
      isValid: false,
      errors: [{ field: "phone", message: "Invalid phone format", code: "INVALID_FORMAT" }],
    };
  }

  return {
    isValid: true,
    data: sanitized,
    errors: [],
  };
}

/**
 * Validate required string field
 */
export function validateRequiredString(
  value: string,
  fieldName: string,
  maxLength?: number,
  pattern?: RegExp
): ValidationResult<string> {
  const sanitized = sanitizeString(value, maxLength);

  if (!sanitized) {
    return {
      isValid: false,
      errors: [{ field: fieldName, message: `${fieldName} is required`, code: "REQUIRED" }],
    };
  }

  if (pattern && !pattern.test(sanitized)) {
    return {
      isValid: false,
      errors: [
        { field: fieldName, message: `Invalid ${fieldName} format`, code: "INVALID_FORMAT" },
      ],
    };
  }

  return {
    isValid: true,
    data: sanitized,
    errors: [],
  };
}

/**
 * Validate optional string field
 */
export function validateOptionalString(
  value: string | undefined,
  fieldName: string,
  maxLength?: number,
  pattern?: RegExp
): ValidationResult<string | undefined> {
  if (!value) {
    return {
      isValid: true,
      data: undefined,
      errors: [],
    };
  }

  return validateRequiredString(value, fieldName, maxLength, pattern);
}

/**
 * Validate UUID
 */
export function validateUUID(uuid: string, fieldName: string = "id"): ValidationResult<string> {
  const sanitized = sanitizeString(uuid);

  if (!sanitized) {
    return {
      isValid: false,
      errors: [{ field: fieldName, message: `${fieldName} is required`, code: "REQUIRED" }],
    };
  }

  if (!VALIDATION_PATTERNS.uuid.test(sanitized)) {
    return {
      isValid: false,
      errors: [
        { field: fieldName, message: `Invalid ${fieldName} format`, code: "INVALID_FORMAT" },
      ],
    };
  }

  return {
    isValid: true,
    data: sanitized,
    errors: [],
  };
}

/**
 * Validate numeric input
 */
export function validateNumber(
  value: any,
  fieldName: string,
  min?: number,
  max?: number
): ValidationResult<number> {
  const num = Number(value);

  if (isNaN(num)) {
    return {
      isValid: false,
      errors: [
        { field: fieldName, message: `${fieldName} must be a number`, code: "INVALID_TYPE" },
      ],
    };
  }

  if (min !== undefined && num < min) {
    return {
      isValid: false,
      errors: [
        { field: fieldName, message: `${fieldName} must be at least ${min}`, code: "MIN_VALUE" },
      ],
    };
  }

  if (max !== undefined && num > max) {
    return {
      isValid: false,
      errors: [
        { field: fieldName, message: `${fieldName} must be at most ${max}`, code: "MAX_VALUE" },
      ],
    };
  }

  return {
    isValid: true,
    data: num,
    errors: [],
  };
}

/**
 * Validate date input
 */
export function validateDate(
  value: any,
  fieldName: string,
  minDate?: Date,
  maxDate?: Date
): ValidationResult<Date> {
  const date = new Date(value);

  if (isNaN(date.getTime())) {
    return {
      isValid: false,
      errors: [
        { field: fieldName, message: `${fieldName} must be a valid date`, code: "INVALID_DATE" },
      ],
    };
  }

  if (minDate && date < minDate) {
    return {
      isValid: false,
      errors: [
        {
          field: fieldName,
          message: `${fieldName} must be after ${minDate.toISOString()}`,
          code: "MIN_DATE",
        },
      ],
    };
  }

  if (maxDate && date > maxDate) {
    return {
      isValid: false,
      errors: [
        {
          field: fieldName,
          message: `${fieldName} must be before ${maxDate.toISOString()}`,
          code: "MAX_DATE",
        },
      ],
    };
  }

  return {
    isValid: true,
    data: date,
    errors: [],
  };
}

/**
 * Validate array input
 */
export function validateArray<T>(
  value: any,
  fieldName: string,
  itemValidator: (item: any, index: number) => ValidationResult<T>,
  minLength?: number,
  maxLength?: number
): ValidationResult<T[]> {
  if (!Array.isArray(value)) {
    return {
      isValid: false,
      errors: [
        { field: fieldName, message: `${fieldName} must be an array`, code: "INVALID_TYPE" },
      ],
    };
  }

  if (minLength !== undefined && value.length < minLength) {
    return {
      isValid: false,
      errors: [
        {
          field: fieldName,
          message: `${fieldName} must have at least ${minLength} items`,
          code: "MIN_LENGTH",
        },
      ],
    };
  }

  if (maxLength !== undefined && value.length > maxLength) {
    return {
      isValid: false,
      errors: [
        {
          field: fieldName,
          message: `${fieldName} must have at most ${maxLength} items`,
          code: "MAX_LENGTH",
        },
      ],
    };
  }

  const validatedItems: T[] = [];
  const errors: ValidationError[] = [];

  for (let i = 0; i < value.length; i++) {
    const itemResult = itemValidator(value[i], i);
    if (itemResult.isValid && itemResult.data !== undefined) {
      validatedItems.push(itemResult.data);
    } else {
      errors.push(
        ...itemResult.errors.map((error) => ({
          ...error,
          field: `${fieldName}[${i}].${error.field}`,
        }))
      );
    }
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      errors,
    };
  }

  return {
    isValid: true,
    data: validatedItems,
    errors: [],
  };
}

/**
 * Combine multiple validation results
 */
export function combineValidationResults<T extends Record<string, any>>(
  results: Record<keyof T, ValidationResult>
): ValidationResult<T> {
  const data: Partial<T> = {};
  const errors: ValidationError[] = [];

  for (const [key, result] of Object.entries(results)) {
    if (result.isValid && result.data !== undefined) {
      data[key as keyof T] = result.data;
    }
    errors.push(...result.errors);
  }

  return {
    isValid: errors.length === 0,
    data: errors.length === 0 ? (data as T) : undefined,
    errors,
  };
}

/**
 * Validate request body against schema
 */
export async function validateRequestBody<T>(
  request: NextRequest,
  validator: (body: any) => ValidationResult<T>
): Promise<ValidationResult<T>> {
  try {
    const body = await request.json();
    return validator(body);
  } catch (error) {
    return {
      isValid: false,
      errors: [{ field: "body", message: "Invalid JSON body", code: "INVALID_JSON" }],
    };
  }
}

/**
 * Create API error response
 */
export function createValidationErrorResponse(errors: ValidationError[]) {
  return new Response(
    JSON.stringify({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid input data",
        details: errors,
        timestamp: new Date().toISOString(),
      },
    }),
    {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
