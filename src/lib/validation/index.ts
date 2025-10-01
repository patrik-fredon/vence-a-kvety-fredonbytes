// Main validation functions
export {
  validateWreathConfiguration,
  validateWreathConfigurationEnhanced,
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

// Type guards and comprehensive error handling
export {
  isValidProduct,
  isValidProductArray,
  isValidProductImage,
  isValidLocale,
  isValidProductSlug,
  isValidNavigationParams,
  isValidApiResponse,
  isValidErrorResponse,
  isValidDatabaseResult,
  isValidEmail,
  isValidPhoneNumber,
  isValidPostalCode,
  safeAsyncOperation,
  safeTransform,
  validateApiResponse,
  validateDatabaseQuery,
  collectValidationErrors,
  hasValidationErrors
} from './type-guards';

export type {
  ValidationResult,
  ValidationError,
  ValidationWarning
} from './type-guards';

// Navigation validation
export {
  validateNavigationParams,
  validateProductNavigation,
  validateSearchParams,
  createSafeNavigationUrl,
  validateFormData
} from './navigation-validation';

export type {
  NavigationValidationContext,
  NavigationParams,
  NavigationValidationResult
} from './navigation-validation';

// Async error handling
export {
  executeWithErrorHandling,
  executeAllWithErrorHandling,
  executeDatabaseOperation,
  executeApiRequest,
  executeFileOperation,
  executeNavigationOperation,
  createDebouncedAsyncOperation,
  createThrottledAsyncOperation
} from './async-error-handling';

export type {
  AsyncOperationOptions,
  CircuitBreakerState
} from './async-error-handling';
