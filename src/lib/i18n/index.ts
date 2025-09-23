/**
 * Enhanced i18n utilities and hooks
 * Comprehensive internationalization system with TypeScript support
 */

// Advanced utilities
export {
  checkTranslationCompleteness,
  clearTranslationCache,
  exportTranslations,
  getTranslationAdvanced,
  getTranslationCacheStats,
  importTranslations,
  interpolateTranslation,
  pluralize as advancedPluralize,
  preloadTranslations,
  suggestTranslationKeys,
  validateTranslationKey,
} from "./advanced-utils";

// Enhanced hooks
export {
  useAccessibilityTranslations,
  useAdminTranslations,
  useCurrency,
  useDate,
  useLocalePersistence,
  useLocaleSwitch,
  useLocaleUtils,
  useSafeTranslations,
  useTranslationContext,
  useTranslationPerformance,
  useTranslationValidation,
  useUITranslations,
} from "./hooks";
// Core utilities
export {
  detectBrowserLocale,
  formatCurrency,
  formatCurrencyCustom,
  formatDate,
  formatDeliveryDate,
  getBestLocale,
  getLocaleCookie,
  getLocalePreference,
  getLocalizedContent,
  getRelativeTime,
  getValidLocale,
  isValidLocale,
  pluralize,
  setLocaleCookie,
  setLocalePreference,
  translationValidation,
} from "./utils";

// Provider components (commented out due to JSX compilation issues in some contexts)
// export {
//   EnhancedTranslationProvider,
//   useEnhancedTranslationContext,
//   useTranslationDebug,
//   withTranslationDebug,
// } from "./provider";

// TypeScript types
export type {
  AccessibilityTranslationHook,
  AdminTranslationHook,
  AlertLevel,
  CurrencyHook,
  DateHook,
  FallbackConfig,
  LocalePersistenceHook,
  LocaleSwitchHook,
  LocaleUtilsHook,
  OrderStatus,
  ProductStatus,
  SafeTranslationHook,
  TranslationComparison,
  TranslationContextHook,
  TranslationFunction,
  TranslationKeyValidation,
  TranslationNamespace,
  TranslationParams,
  TranslationPerformanceHook,
  TranslationProviderProps,
  TranslationStats,
  TranslationUtilities,
  TranslationValidationError,
  TranslationValidationHook,
  UITranslationHook,
  ValidationSummary,
} from "./types";
