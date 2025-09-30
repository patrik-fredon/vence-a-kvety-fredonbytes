// Main validation functions
export {
  validateWreathConfiguration,
  validateCustomRibbonText,
  validateWreathSizeSelection,
  validateRibbonDependencies,
  sanitizeCustomText,
  getValidationMessage,
  WREATH_VALIDATION_MESSAGES
} from './wreath';

// Validation hooks
export {
  useWreathValidation,
  useRealtimeWreathValidation,
  useWreathSubmissionValidation,
  useValidationErrorFormatter
} from './hooks';

// Types
export type {
  WreathValidationResult,
  WreathValidationOptions,
  EnhancedValidationError,
  ErrorRecoveryStrategy,
  EnhancedWreathValidationResult
} from './wreath';

export {
  ValidationErrorSeverity
} from './wreath';

export type {
  UseWreathValidationProps,
  UseWreathValidationReturn
} from './hooks';

// Checkout validation
export {
  validateCustomerInfo,
  validateDeliveryInfo,
  validateCheckoutForm,
  hasValidationErrors,
  formatValidationErrors,
  sanitizeCustomerInfo,
  sanitizeDeliveryInfo
} from './checkout';

// API validation
export {
  validateCartItemData,
  createValidationErrorResponse,
  createEnhancedValidationErrorResponse,
  validateProductAvailability,
  sanitizeCustomizations
} from './api-validation';

export type {
  ApiValidationError,
  ApiValidationResult
} from './api-validation';

// Test utilities (development only)
export { testWreathValidation } from './test-utils';
