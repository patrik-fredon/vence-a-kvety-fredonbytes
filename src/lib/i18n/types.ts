/**
 * TypeScript interfaces and types for enhanced i18n system
 */

import type { Locale } from "@/i18n/config";

/**
 * Translation function signature with enhanced parameters
 */
export type TranslationFunction = (
  key: string,
  params?: Record<string, any>,
  fallback?: string
) => string;

/**
 * Safe translation hook return type
 */
export interface SafeTranslationHook {
  t: TranslationFunction;
  hasTranslation: (key: string) => boolean;
  getTranslationOrFallback: (key: string, fallback: string, params?: Record<string, any>) => string;
  formatMessage: (key: string, params?: Record<string, any>) => string;
  locale: Locale;
  namespace: string;
}

/**
 * Accessibility translation hook return type
 */
export interface AccessibilityTranslationHook {
  getAriaLabel: (key: string, fallback?: string) => string;
  getSkipLink: (target: string) => string;
  getNavigationLabel: (type: "main" | "mobile" | "footer") => string;
  t: TranslationFunction;
  hasTranslation: (key: string) => boolean;
  locale: Locale;
}

/**
 * Admin translation hook return type
 */
export interface AdminTranslationHook {
  getStatusLabel: (status: string) => string;
  getOrderStatus: (status: OrderStatus) => string;
  getProductStatus: (status: ProductStatus) => string;
  getAlertLevel: (level: AlertLevel) => string;
  t: TranslationFunction;
  hasTranslation: (key: string) => boolean;
  locale: Locale;
}

/**
 * UI translation hook return type
 */
export interface UITranslationHook {
  getUILabel: (key: string, fallback?: string) => string;
  getButtonLabel: (action: string) => string;
  getMenuLabel: (type: "main" | "mobile" | "user") => string;
  getLoadingText: (context?: string) => string;
  t: TranslationFunction;
  hasTranslation: (key: string) => boolean;
  locale: Locale;
}

/**
 * Translation validation error
 */
export interface TranslationValidationError {
  key: string;
  error: string;
  timestamp: Date;
  context?: string;
}

/**
 * Translation validation hook return type
 */
export interface TranslationValidationHook {
  missingKeys: string[];
  validationErrors: TranslationValidationError[];
  validateTranslations: (requiredKeys: string[], context?: string) => void;
  reportMissingKey: (key: string, context?: string) => void;
  clearValidationErrors: () => void;
  getValidationSummary: () => ValidationSummary;
  validationEnabled: boolean;
}

/**
 * Validation summary
 */
export interface ValidationSummary {
  totalMissingKeys: number;
  totalErrors: number;
  recentErrors: TranslationValidationError[];
  missingKeysList: string[];
}

/**
 * Translation context hook return type
 */
export interface TranslationContextHook {
  locale: Locale;
  currentNamespace: string;
  namespaceStack: string[];
  pushNamespace: (namespace: string) => void;
  popNamespace: () => void;
  resetNamespace: () => void;
  getNamespacedKey: (key: string, namespace?: string) => string;
}

/**
 * Translation performance statistics
 */
export interface TranslationStats {
  totalTranslations: number;
  cacheHits: number;
  cacheMisses: number;
  averageTime: number;
}

/**
 * Translation performance hook return type
 */
export interface TranslationPerformanceHook {
  translationStats: TranslationStats;
  trackTranslation: (key: string, startTime: number) => void;
  resetStats: () => void;
}

/**
 * Locale switching hook return type
 */
export interface LocaleSwitchHook {
  currentLocale: Locale;
  switchLocale: (newLocale: Locale) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  availableLocales: readonly Locale[];
  localeNames: Record<Locale, string>;
}

/**
 * Currency formatting hook return type
 */
export interface CurrencyHook {
  format: (amount: number) => string;
  formatCustom: (amount: number) => string;
}

/**
 * Date formatting hook return type
 */
export interface DateHook {
  format: (date: Date) => string;
  formatDelivery: (date: Date) => string;
}

/**
 * Locale utilities hook return type
 */
export interface LocaleUtilsHook {
  locale: Locale;
  isRTL: boolean;
  currency: string;
  currencySymbol: string;
}

/**
 * Locale persistence hook return type
 */
export interface LocalePersistenceHook {
  currentLocale: Locale;
  saveLocalePreference: (locale: Locale) => void;
  clearLocalePreference: () => void;
}

/**
 * Order status types
 */
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

/**
 * Product status types
 */
export type ProductStatus = "active" | "inactive";

/**
 * Alert level types
 */
export type AlertLevel = "waiting" | "warnings" | "unacknowledged";

/**
 * Translation namespace types
 */
export type TranslationNamespace =
  | "common"
  | "navigation"
  | "product"
  | "cart"
  | "checkout"
  | "auth"
  | "footer"
  | "delivery"
  | "accessibility"
  | "admin"
  | "ui"
  | "gdpr"
  | "home"
  | "faq"
  | "about"
  | "meta"
  | "seo"
  | "currency"
  | "date";

/**
 * Translation key validation result
 */
export interface TranslationKeyValidation {
  isValid: boolean;
  errors: string[];
  suggestions: string[] | undefined;
}

/**
 * Translation comparison result
 */
export interface TranslationComparison {
  missingInSecondary: string[];
  missingInPrimary: string[];
  different: string[];
}

/**
 * Translation interpolation parameters
 */
export type TranslationParams = Record<string, string | number | boolean | Date>;

/**
 * Fallback configuration
 */
export interface FallbackConfig {
  enabled: boolean;
  showMissingKeys: boolean;
  logMissingKeys: boolean;
  defaultLocale: Locale;
  fallbackChain: Locale[];
}

/**
 * Translation cache entry
 */
export interface TranslationCacheEntry {
  value: string;
  timestamp: number;
  locale: Locale;
  namespace: string;
}

/**
 * Translation provider props
 */
export interface TranslationProviderProps {
  locale: Locale;
  messages: Record<string, any>;
  fallbackMessages?: Record<string, any>;
  children: React.ReactNode;
  onMissingKey?: (key: string, locale: Locale, namespace?: string) => void;
  onError?: (error: Error, key: string, locale: Locale) => void;
}

/**
 * Enhanced translation utilities interface
 */
export interface TranslationUtilities {
  hasTranslation: (messages: Record<string, any>, key: string) => boolean;
  getMissingKeys: (messages: Record<string, any>, requiredKeys: string[]) => string[];
  logMissingKey: (key: string, locale: Locale, context?: string) => void;
  getTranslationWithFallback: (
    messages: Record<string, any>,
    fallbackMessages: Record<string, any>,
    key: string,
    locale: Locale,
    params?: Record<string, any>,
    context?: string
  ) => string;
  interpolateParams: (text: string, params?: Record<string, any>) => string;
  isValidTranslationKey: (key: string) => boolean;
  getNestedKeys: (obj: Record<string, any>, prefix?: string) => string[];
  compareTranslations: (
    primary: Record<string, any>,
    secondary: Record<string, any>
  ) => TranslationComparison;
  getNestedValue: (obj: Record<string, any>, key: string) => any;
}
