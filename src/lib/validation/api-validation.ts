import { NextResponse } from 'next/server';
import { validateWreathConfiguration } from './wreath';
import type { Customization, CustomizationOption } from '@/types/product';

export interface ApiValidationError {
  field?: string;
  message: string;
  code: string;
}

export interface ApiValidationResult {
  isValid: boolean;
  errors: ApiValidationError[];
  warnings?: ApiValidationError[] | undefined;
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
  if (!productId || typeof productId !== 'string') {
    errors.push({
      field: 'productId',
      message: 'Product ID is required and must be a string',
      code: 'INVALID_PRODUCT_ID'
    });
  }

  if (!quantity || typeof quantity !== 'number' || quantity <= 0) {
    errors.push({
      field: 'quantity',
      message: 'Quantity must be a positive number',
      code: 'INVALID_QUANTITY'
    });
  }

  if (quantity > 10) {
    errors.push({
      field: 'quantity',
      message: 'Quantity cannot exceed 10 items',
      code: 'QUANTITY_LIMIT_EXCEEDED'
    });
  }

  // Customizations validation
  if (customizations && !Array.isArray(customizations)) {
    errors.push({
      field: 'customizations',
      message: 'Customizations must be an array',
      code: 'INVALID_CUSTOMIZATIONS_FORMAT'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates wreath customizations for API endpoints
 */
export function validateWreathCustomizationsForApi(
  customizations: Customization[],
  customizationOptions: CustomizationOption[],
  locale: string = 'cs'
): ApiValidationResult {
  // Extract size from customizations
  const sizeCustomization = customizations.find(
    (c) => c.optionId === "size" ||
      customizationOptions.find((opt) => opt.id === c.optionId && (opt.type === "size" || opt.id === "size"))
  );
  const selectedSize = sizeCustomization?.choiceIds?.[0] || null;

  const validationResult = validateWreathConfiguration(
    customizations,
    customizationOptions,
    selectedSize,
    { locale, strictMode: true }
  );

  const errors: ApiValidationError[] = validationResult.errors.map(error => ({
    field: 'customizations',
    message: error,
    code: 'CUSTOMIZATION_VALIDATION_FAILED'
  }));

  const warnings: ApiValidationError[] = validationResult.warnings.map(warning => ({
    field: 'customizations',
    message: warning,
    code: 'CUSTOMIZATION_WARNING'
  }));

  return {
    isValid: validationResult.isValid,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

/**
 * Creates a standardized API error response for validation failures
 */
export function createValidationErrorResponse(
  validationResult: ApiValidationResult,
  message: string = 'Validation failed'
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: message,
      validationErrors: validationResult.errors,
      validationWarnings: validationResult.warnings,
      details: {
        errorCount: validationResult.errors.length,
        warningCount: validationResult.warnings?.length || 0
      }
    },
    { status: 400 }
  );
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
      field: 'product',
      message: 'Product is not available for purchase',
      code: 'PRODUCT_INACTIVE'
    });
  }

  if (!product.base_price || product.base_price <= 0) {
    errors.push({
      field: 'product',
      message: 'Product price is not available',
      code: 'INVALID_PRODUCT_PRICE'
    });
  }

  // Check stock availability if available
  if (product.availability?.stock !== undefined && product.availability.stock < requestedQuantity) {
    errors.push({
      field: 'quantity',
      message: `Only ${product.availability.stock} items available in stock`,
      code: 'INSUFFICIENT_STOCK'
    });
  }

  // Check max order quantity
  if (product.availability?.maxOrderQuantity && requestedQuantity > product.availability.maxOrderQuantity) {
    errors.push({
      field: 'quantity',
      message: `Maximum order quantity is ${product.availability.maxOrderQuantity}`,
      code: 'MAX_ORDER_QUANTITY_EXCEEDED'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
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
    errors: []
  };
}

/**
 * Sanitizes and validates customization data
 */
export function sanitizeCustomizations(customizations: Customization[]): Customization[] {
  return customizations.map(customization => {
    const sanitized: Customization = {
      ...customization,
      // Ensure choiceIds is an array
      choiceIds: Array.isArray(customization.choiceIds) ? customization.choiceIds : []
    };

    // Only add customValue if it exists and is not empty
    if (customization.customValue && customization.customValue.trim()) {
      sanitized.customValue = customization.customValue.trim().substring(0, 50);
    }

    return sanitized;
  });
}
