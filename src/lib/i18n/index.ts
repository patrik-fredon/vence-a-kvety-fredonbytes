/**
 * Enhanced i18n utilities and hooks
 * Comprehensive internationalization system with TypeScript support
 */

// Core utilities
export {
  formatCurrency,
  formatCurrencyCustom,
  formatDate,
  formatDeliveryDate,
  getLocalizedContent,
  pluralize,
  getRelativeTime,
  isValidLocale,
  getValidLocale,
  setLocalePreference,
  getLocalePreference,
  setLocaleCookie,
  getLocaleCookie,
  translationValidation,
  detectBrowserLocale,
  getBestLocale,
} from "./utils";

// Enhanced hooks
export {
  useCurrency,
  useDate,
  useLocaleUtils,
  useLocaleSwitch,
  useSafeTranslations,
  useAccessibilityTranslations,
  useAdminTranslations,
  useUITranslations,
  useTranslationValidation,
  useTranslationContext,
  useTranslationPerformance,
  useLocalePersistence,
} from "./hooks";

// Advanced utilities
export {
  validateTranslationKey,
  interpolateTranslation,
  getTranslationAdvanced,
  pluralize as advancedPluralize,
  suggestTranslationKeys,
  checkTranslationCompleteness,
  exportTranslations,
  importTranslations,
  clearTranslationCache,
  getTranslationCacheStats,
  preloadTranslations,
} from "./advanced-utils";

// Provider components (commented out due to JSX compilation issues in some contexts)
// export {
//   EnhancedTranslationProvider,
//   useEnhancedTranslationContext,
//   useTranslationDebug,
//   withTranslationDebug,
// } from "./provider";

// TypeScript types
export type {
  TranslationFunction,
  SafeTranslationHook,
  AccessibilityTranslationHook,
  AdminTranslationHook,
  UITranslationHook,
  TranslationValidationHook,
  TranslationContextHook,
  TranslationPerformanceHook,
  LocaleSwitchHook,
  CurrencyHook,
  DateHook,
  LocaleUtilsHook,
  LocalePersistenceHook,
  OrderStatus,
  ProductStatus,
  AlertLevel,
  TranslationNamespace,
  TranslationKeyValidation,
  TranslationComparison,
  TranslationParams,
  FallbackConfig,
  TranslationProviderProps,
  TranslationUtilities,
  TranslationValidationError,
  TranslationStats,
  ValidationSummary,
} from "./types";
