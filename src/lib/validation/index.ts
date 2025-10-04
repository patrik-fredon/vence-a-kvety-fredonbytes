// Main validation functions

export type {
  ApiValidationError,
  ApiValidationResult,
} from "./api-validation";
// API validation
export {
  createEnhancedValidationErrorResponse,
  createValidationErrorResponse,
  sanitizeCustomizations,
  validateCartItemData,
  validateProductAvailability,
} from "./api-validation";
export type {
  AsyncOperationOptions,
  CircuitBreakerState,
} from "./async-error-handling";
// Async error handling
export {
  createDebouncedAsyncOperation,
  createThrottledAsyncOperation,
  executeAllWithErrorHandling,
  executeApiRequest,
  executeDatabaseOperation,
  executeFileOperation,
  executeNavigationOperation,
  executeWithErrorHandling,
} from "./async-error-handling";
// Checkout validation
export {
  formatValidationErrors,
  sanitizeCustomerInfo,
  sanitizeDeliveryInfo,
  validateCheckoutForm,
  validateCustomerInfo,
  validateDeliveryInfo,
} from "./checkout";
export type { StepValidationSchema } from "./checkout-steps";

// Step-specific checkout validation
export {
  formatStepValidationErrors,
  hasStepValidationErrors,
  STEP_FIELDS,
  stepValidationSchema,
  validateCustomerStep,
  validateDeliveryStep,
  validatePaymentStep,
  validateReviewStep,
} from "./checkout-steps";
export type {
  UseWreathValidationProps,
  UseWreathValidationReturn,
} from "./hooks";
// Validation hooks
export {
  useRealtimeWreathValidation,
  useValidationErrorFormatter,
  useWreathSubmissionValidation,
  useWreathValidation,
} from "./hooks";
export type {
  NavigationParams,
  NavigationValidationContext,
  NavigationValidationResult,
} from "./navigation-validation";
// Navigation validation
export {
  createSafeNavigationUrl,
  validateFormData,
  validateNavigationParams,
  validateProductNavigation,
  validateSearchParams,
} from "./navigation-validation";
// Test utilities (development only)
export { testWreathValidation } from "./test-utils";

export type {
  ValidationError,
  ValidationResult,
  ValidationWarning,
} from "./type-guards";
// Type guards and comprehensive error handling
export {
  collectValidationErrors,
  hasValidationErrors,
  isValidApiResponse,
  isValidDatabaseResult,
  isValidEmail,
  isValidErrorResponse,
  isValidLocale,
  isValidNavigationParams,
  isValidPhoneNumber,
  isValidPostalCode,
  isValidProduct,
  isValidProductArray,
  isValidProductImage,
  isValidProductSlug,
  safeAsyncOperation,
  safeTransform,
  validateApiResponse,
  validateDatabaseQuery,
} from "./type-guards";
// Types
export type {
  EnhancedValidationError,
  EnhancedWreathValidationResult,
  ErrorRecoveryStrategy,
  WreathValidationOptions,
  WreathValidationResult,
} from "./wreath";
export {
  getValidationMessage,
  sanitizeCustomText,
  ValidationErrorSeverity,
  validateCustomRibbonText,
  validateRibbonDependencies,
  validateWreathConfiguration,
  validateWreathConfigurationEnhanced,
  validateWreathSizeSelection,
  WREATH_VALIDATION_MESSAGES,
} from "./wreath";
