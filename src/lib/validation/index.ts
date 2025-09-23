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
  WreathValidationOptions
} from './wreath';

export type {
  UseWreathValidationProps,
  UseWreathValidationReturn
} from './hooks';

// Test utilities (development only)
export { testWreathValidation } from './test-utils';
