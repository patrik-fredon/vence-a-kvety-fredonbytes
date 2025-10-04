import { NextResponse } from "next/server";
import type { Customization, CustomizationOption } from "@/types/product";
import {
  type EnhancedValidationError,
  type ErrorRecoveryStrategy,
  ValidationErrorSeverity,
  validateWreathConfiguration,
  validateWreathConfigurationEnhanced,
  WREATH_VALIDATION_MESSAGES,
} from "./wreath";

export interface ApiValidationError {
  field?: string;
  message: string;
  code: string;
}

export interface ApiValidationResult {
  isValid: boolean;
  errors: ApiValidationError[];
  warnings?: ApiValidationError[];
}

/**
 * Validates cart item data for API endpoints
 */
export function validateCartItemData(
  productId: string,
  quantity: number,
  customizations?: Customization[]
): ApiValidationResult {
  const errors: ApiValidationError[] = [];

  // Basic validation
  if (!productId || typeof productId !== "string") {
    errors.push({
      field: "productId",
      message: "Product ID is required and must be a string",
      code: "INVALID_PRODUCT_ID",
    });
  }

  if (!quantity || typeof quantity !== "number" || quantity <= 0) {
    errors.push({
      field: "quantity",
      message: "Quantity must be a positive number",
      code: "INVALID_QUANTITY",
    });
  }

  if (quantity > 10) {
    errors.push({
      field: "quantity",
      message: "Quantity cannot exceed 10 items",
      code: "QUANTITY_LIMIT_EXCEEDED",
    });
  }

  // Customizations validation
  if (customizations && !Array.isArray(customizations)) {
    errors.push({
      field: "customizations",
      message: "Customizations must be an array",
      code: "INVALID_CUSTOMIZATIONS_FORMAT",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates wreath customizations for API endpoints
 */
export function validateWreathCustomizationsForApi(
  customizations: Customization[],
  customizationOptions: CustomizationOption[],
  locale: string = "cs"
): ApiValidationResult {
  // Extract size from customizations
  const sizeCustomization = customizations.find(
    (c) =>
      c.optionId === "size" ||
      customizationOptions.find(
        (opt) => opt.id === c.optionId && (opt.type === "size" || opt.id === "size")
      )
  );
  const selectedSize = sizeCustomization?.choiceIds?.[0] || null;

  const validationResult = validateWreathConfiguration(
    customizations,
    customizationOptions,
    selectedSize,
    { locale, strictMode: true }
  );

  const errors: ApiValidationError[] = validationResult.errors.map((error) => ({
    field: "customizations",
    message: error,
    code: "CUSTOMIZATION_VALIDATION_FAILED",
  }));

  const warnings: ApiValidationError[] = validationResult.warnings.map((warning) => ({
    field: "customizations",
    message: warning,
    code: "CUSTOMIZATION_WARNING",
  }));

  return {
    isValid: validationResult.isValid,
    errors,
    ...(warnings.length > 0 && { warnings }),
  };
}

/**
 * Creates a standardized API error response for validation failures
 */
export function createValidationErrorResponse(
  validationResult: ApiValidationResult,
  message: string = "Validation failed"
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: message,
      validationErrors: validationResult.errors,
      validationWarnings: validationResult.warnings,
      details: {
        errorCount: validationResult.errors.length,
        warningCount: validationResult.warnings?.length || 0,
      },
    },
    { status: 400 }
  );
}

/**
 * Enhanced API validation with comprehensive error handling and recovery
 */
export function validateWreathCustomizationsForApiEnhanced(
  customizations: Customization[],
  customizationOptions: CustomizationOption[],
  locale: string = "cs",
  options: {
    enableRecovery?: boolean;
    enableFallback?: boolean;
    strictMode?: boolean;
  } = {}
): ApiValidationResult & {
  enhancedErrors: EnhancedValidationError[];
  recoveryStrategies: ErrorRecoveryStrategy[];
  fallbackConfiguration?: Customization[];
  canProceedWithWarnings: boolean;
} {
  const { enableRecovery = true, enableFallback = true, strictMode = true } = options;

  // Extract size from customizations
  const sizeCustomization = customizations.find(
    (c) =>
      c.optionId === "size" ||
      customizationOptions.find(
        (opt) => opt.id === c.optionId && (opt.type === "size" || opt.id === "size")
      )
  );
  const selectedSize = sizeCustomization?.choiceIds?.[0] || null;

  // Run enhanced validation
  const enhancedResult = validateWreathConfigurationEnhanced(
    customizations,
    customizationOptions,
    selectedSize,
    { locale, strictMode, enableRecovery, enableFallback }
  );

  // Convert to API format
  const errors: ApiValidationError[] = enhancedResult.enhancedErrors
    .filter((error) => error.severity === ValidationErrorSeverity.ERROR)
    .map((error) => ({
      field: error.field,
      message: error.message,
      code: error.code,
    }));

  const warnings: ApiValidationError[] = enhancedResult.enhancedErrors
    .filter((error) => error.severity === ValidationErrorSeverity.WARNING)
    .map((error) => ({
      field: error.field,
      message: error.message,
      code: error.code,
    }));

  return {
    isValid: enhancedResult.isValid,
    errors,
    ...(warnings.length > 0 && { warnings }),
    enhancedErrors: enhancedResult.enhancedErrors,
    recoveryStrategies: enhancedResult.recoveryStrategies,
    ...(enhancedResult.fallbackConfiguration !== undefined && {
      fallbackConfiguration: enhancedResult.fallbackConfiguration,
    }),
    canProceedWithWarnings: enhancedResult.canProceed,
  };
}

/**
 * Enhanced validation error response with recovery options
 */
export function createEnhancedValidationErrorResponse(
  validationResult: ApiValidationResult & {
    enhancedErrors?: EnhancedValidationError[];
    recoveryStrategies?: ErrorRecoveryStrategy[];
    fallbackConfiguration?: Customization[];
    canProceedWithWarnings?: boolean;
  },
  message: string = "Validation failed",
  locale: string = "cs"
): NextResponse {
  const messages = WREATH_VALIDATION_MESSAGES[locale as keyof typeof WREATH_VALIDATION_MESSAGES];

  const responseBody = {
    success: false,
    error: message,
    validationErrors: validationResult.errors,
    validationWarnings: validationResult.warnings,
    details: {
      errorCount: validationResult.errors.length,
      warningCount: validationResult.warnings?.length || 0,
      canProceedWithWarnings: validationResult.canProceedWithWarnings,
    },
    recovery: validationResult.recoveryStrategies
      ? {
          strategies: validationResult.recoveryStrategies,
          fallbackConfiguration: validationResult.fallbackConfiguration,
          fallbackMessage: messages.fallbackMessage,
        }
      : undefined,
    userFriendlyMessage: getLocalizedErrorMessage(validationResult.errors[0]?.code, locale),
  };

  return NextResponse.json(responseBody, { status: 400 });
}

/**
 * Get localized error message for user display
 */
function getLocalizedErrorMessage(errorCode: string | undefined, locale: string): string {
  const messages = WREATH_VALIDATION_MESSAGES[locale as keyof typeof WREATH_VALIDATION_MESSAGES];

  switch (errorCode) {
    case "SIZE_VALIDATION_ERROR":
      return messages.sizeRequired;
    case "RIBBON_VALIDATION_ERROR":
      return messages.ribbonColorRequired;
    case "CUSTOM_TEXT_ERROR":
      return messages.customTextInvalid;
    default:
      return messages.validationFailed;
  }
}

/**
 * Graceful error handling middleware for API routes
 */
export function withGracefulErrorHandling<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      console.error("API Error:", error);

      // Determine error type and provide appropriate response
      if (error instanceof Error) {
        if (error.message.includes("network") || error.message.includes("connection")) {
          return NextResponse.json(
            {
              success: false,
              error: "Network error occurred",
              code: "NETWORK_ERROR",
              retryable: true,
              userFriendlyMessage: "Connection error, please check your internet connection",
            },
            { status: 503 }
          );
        }

        if (error.message.includes("timeout")) {
          return NextResponse.json(
            {
              success: false,
              error: "Request timeout",
              code: "TIMEOUT_ERROR",
              retryable: true,
              userFriendlyMessage: "Request timed out, please try again",
            },
            { status: 408 }
          );
        }
      }

      // Generic server error with recovery options
      return NextResponse.json(
        {
          success: false,
          error: "Internal server error",
          code: "INTERNAL_ERROR",
          retryable: true,
          userFriendlyMessage: "A system error occurred, please try again",
          recovery: {
            strategies: [
              {
                canRecover: true,
                recoveryAction: "retry",
                recoveryMessage: "Try again",
              },
            ],
          },
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Validates product availability and pricing
 */
export function validateProductAvailability(
  product: any,
  requestedQuantity: number
): ApiValidationResult {
  const errors: ApiValidationError[] = [];

  if (!product.active) {
    errors.push({
      field: "product",
      message: "Product is not available for purchase",
      code: "PRODUCT_INACTIVE",
    });
  }

  if (!product.base_price || product.base_price <= 0) {
    errors.push({
      field: "product",
      message: "Product price is not available",
      code: "INVALID_PRODUCT_PRICE",
    });
  }

  // Check stock availability if available
  if (product.availability?.stock !== undefined && product.availability.stock < requestedQuantity) {
    errors.push({
      field: "quantity",
      message: `Only ${product.availability.stock} items available in stock`,
      code: "INSUFFICIENT_STOCK",
    });
  }

  // Check max order quantity
  if (
    product.availability?.maxOrderQuantity &&
    requestedQuantity > product.availability.maxOrderQuantity
  ) {
    errors.push({
      field: "quantity",
      message: `Maximum order quantity is ${product.availability.maxOrderQuantity}`,
      code: "MAX_ORDER_QUANTITY_EXCEEDED",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Comprehensive validation for cart operations
 */
export function validateCartOperation(
  productId: string,
  quantity: number,
  product: any,
  customizations?: Customization[]
): ApiValidationResult {
  // Validate basic cart item data
  const basicValidation = validateCartItemData(productId, quantity, customizations);
  if (!basicValidation.isValid) {
    return basicValidation;
  }

  // Validate product availability
  const availabilityValidation = validateProductAvailability(product, quantity);
  if (!availabilityValidation.isValid) {
    return availabilityValidation;
  }

  // Validate wreath customizations if present
  if (customizations && customizations.length > 0 && product.customization_options) {
    const customizationValidation = validateWreathCustomizationsForApi(
      customizations,
      product.customization_options
    );
    if (!customizationValidation.isValid) {
      return customizationValidation;
    }
  }

  return {
    isValid: true,
    errors: [],
  };
}

/**
 * Sanitizes and validates customization data
 */
export function sanitizeCustomizations(customizations: Customization[]): Customization[] {
  return customizations.map((customization) => {
    const sanitized: Customization = {
      ...customization,
      // Ensure choiceIds is an array
      choiceIds: Array.isArray(customization.choiceIds) ? customization.choiceIds : [],
    };

    // Only add customValue if it exists and is not empty
    if (customization.customValue?.trim()) {
      sanitized.customValue = customization.customValue.trim().substring(0, 50);
    }

    return sanitized;
  });
}
