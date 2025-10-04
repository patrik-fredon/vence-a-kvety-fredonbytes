import { currencyConfig, i18nConfig, type Locale } from "@/i18n/config";

/**
 * Format currency based on locale
 */
export function formatCurrency(amount: number, locale: Locale): string {
  const config = currencyConfig[locale];

  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: config.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format currency with custom symbol placement for Czech locale
 */
export function formatCurrencyCustom(amount: number, locale: Locale): string {
  const config = currencyConfig[locale];

  if (locale === "cs") {
    // Czech format: "1 234 Kč"
    const formatted = new Intl.NumberFormat("cs-CZ").format(amount);
    return `${formatted} ${config.symbol}`;
  } else {
    // English format: "1,234 CZK"
    const formatted = new Intl.NumberFormat("en-US").format(amount);
    return `${formatted} ${config.symbol}`;
  }
}

/**
 * Format date based on locale
 */
export function formatDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(currencyConfig[locale].locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

/**
 * Format date for delivery calendar
 */
export function formatDeliveryDate(date: Date, locale: Locale): string {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

  // Check if date is today, tomorrow, or day after tomorrow
  if (date.toDateString() === today.toDateString()) {
    return locale === "cs" ? "Dnes" : "Today";
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return locale === "cs" ? "Zítra" : "Tomorrow";
  } else if (date.toDateString() === dayAfterTomorrow.toDateString()) {
    return locale === "cs" ? "Pozítří" : "Day After Tomorrow";
  }

  // Otherwise format normally
  return formatDate(date, locale);
}

/**
 * Get localized content from multilingual object
 */
export function getLocalizedContent<T>(
  content: Record<Locale, T>,
  locale: Locale,
  fallback?: Locale
): T {
  return content[locale] || content[fallback || "cs"];
}

/**
 * Pluralize based on count and locale
 */
export function pluralize(count: number, singular: string, plural: string, locale: Locale): string {
  if (locale === "cs") {
    // Czech pluralization rules (simplified)
    if (count === 1) return singular;
    if (count >= 2 && count <= 4) return plural;
    return plural; // for 5+ use plural form
  } else {
    // English pluralization
    return count === 1 ? singular : plural;
  }
}

/**
 * Get relative time string
 */
export function getRelativeTime(date: Date, locale: Locale): string {
  const rtf = new Intl.RelativeTimeFormat(currencyConfig[locale].locale, {
    numeric: "auto",
  });

  const now = new Date();
  const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (Math.abs(diffInDays) >= 1) {
    return rtf.format(diffInDays, "day");
  } else if (Math.abs(diffInHours) >= 1) {
    return rtf.format(diffInHours, "hour");
  } else if (Math.abs(diffInMinutes) >= 1) {
    return rtf.format(diffInMinutes, "minute");
  } else {
    return rtf.format(diffInSeconds, "second");
  }
}

/**
 * Validate locale
 */
export function isValidLocale(locale: string): locale is Locale {
  return i18nConfig.locales.includes(locale as Locale);
}

/**
 * Get locale with fallback
 */
export function getValidLocale(locale?: string | null): Locale {
  if (locale && isValidLocale(locale)) {
    return locale;
  }
  return i18nConfig.defaultLocale;
}

/**
 * Set locale preference in localStorage
 */
export function setLocalePreference(locale: Locale): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(i18nConfig.persistence.storageKey, locale);
    } catch (error) {
      console.warn("Failed to save locale preference:", error);
    }
  }
}

/**
 * Get locale preference from localStorage
 */
export function getLocalePreference(): Locale | null {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(i18nConfig.persistence.storageKey);
      return stored && isValidLocale(stored) ? stored : null;
    } catch (error) {
      console.warn("Failed to read locale preference:", error);
    }
  }
  return null;
}

/**
 * Set locale cookie
 */
export function setLocaleCookie(locale: Locale): void {
  if (typeof document !== "undefined") {
    const maxAge = i18nConfig.persistence.cookieMaxAge;
    const expires = new Date(Date.now() + maxAge * 1000).toUTCString();
    document.cookie = `${i18nConfig.persistence.cookieName}=${locale}; expires=${expires}; path=/; SameSite=Lax`;
  }
}

/**
 * Get locale cookie
 */
export function getLocaleCookie(): Locale | null {
  if (typeof document !== "undefined") {
    const cookies = document.cookie.split(";");
    const localeCookie = cookies.find((cookie) =>
      cookie.trim().startsWith(`${i18nConfig.persistence.cookieName}=`)
    );

    if (localeCookie) {
      const locale = localeCookie.split("=")[1]?.trim();
      return locale && isValidLocale(locale) ? locale : null;
    }
  }
  return null;
}

/**
 * Enhanced translation utilities with better error handling and fallback support
 */

/**
 * Check if a translation key exists in messages
 */
function hasTranslation(messages: Record<string, any>, key: string): boolean {
  if (!messages || typeof messages !== "object" || !key) {
    return false;
  }

  const keys = key.split(".");
  let current = messages;

  for (const k of keys) {
    if (typeof current !== "object" || current === null || !(k in current)) {
      return false;
    }
    current = current[k];
  }

  return typeof current === "string" && (current as string).length > 0;
}

/**
 * Get missing translation keys
 */
function getMissingKeys(messages: Record<string, any>, requiredKeys: string[]): string[] {
  if (!Array.isArray(requiredKeys)) {
    return [];
  }
  return requiredKeys.filter((key) => !hasTranslation(messages, key));
}

/**
 * Log missing translation key with enhanced context
 */
function logMissingKey(key: string, locale: Locale, context?: string): void {
  if (i18nConfig.fallback.logMissingKeys) {
    const contextInfo = context ? ` (context: ${context})` : "";
    console.warn(`Missing translation key: "${key}" for locale: "${locale}"${contextInfo}`);

    // In development, also log to help with debugging
    if (process.env.NODE_ENV === "development") {
      console.trace(`Translation key trace for: ${key}`);
    }
  }
}

/**
 * Get translation with enhanced fallback support
 */
function getTranslationWithFallback(
  messages: Record<string, any>,
  fallbackMessages: Record<string, any>,
  key: string,
  locale: Locale,
  params?: Record<string, any>,
  context?: string
): string {
  // Try primary messages first
  if (hasTranslation(messages, key)) {
    const keys = key.split(".");
    let current = messages;
    for (const k of keys) {
      current = current[k];
    }
    return interpolateParams(String(current), params);
  }

  // Try fallback messages
  if (i18nConfig.fallback.enabled && fallbackMessages && hasTranslation(fallbackMessages, key)) {
    const keys = key.split(".");
    let current = fallbackMessages;
    for (const k of keys) {
      current = current[k];
    }
    logMissingKey(key, locale, context);
    return interpolateParams(String(current), params);
  }

  // Log missing key
  logMissingKey(key, locale, context);

  // Return formatted missing key or fallback based on configuration
  if (i18nConfig.fallback.showMissingKeys) {
    return `[${key}]`;
  }

  // Return the key itself as last resort
  return key;
}

/**
 * Simple parameter interpolation for translations
 */
function interpolateParams(text: string, params?: Record<string, any>): string {
  if (!params || typeof params !== "object") {
    return text;
  }

  return text.replace(/\{(\w+)\}/g, (match, key) => {
    return params[key] !== undefined ? String(params[key]) : match;
  });
}

/**
 * Validate translation key format
 */
function isValidTranslationKey(key: string): boolean {
  if (!key || typeof key !== "string") {
    return false;
  }

  // Check for valid key format (alphanumeric, dots, underscores, hyphens)
  const validKeyPattern = /^[a-zA-Z0-9._-]+$/;
  return validKeyPattern.test(key) && key.length > 0 && key.length < 200;
}

/**
 * Get nested translation keys from an object
 */
function getNestedKeys(obj: Record<string, any>, prefix = ""): string[] {
  const keys: string[] = [];

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === "string") {
      keys.push(fullKey);
    } else if (typeof value === "object" && value !== null) {
      keys.push(...getNestedKeys(value, fullKey));
    }
  }

  return keys;
}

/**
 * Compare two translation objects and find differences
 */
function compareTranslations(
  primary: Record<string, any>,
  secondary: Record<string, any>
): {
  missingInSecondary: string[];
  missingInPrimary: string[];
  different: string[];
} {
  const primaryKeys = getNestedKeys(primary);
  const secondaryKeys = getNestedKeys(secondary);

  const missingInSecondary = primaryKeys.filter((key) => !hasTranslation(secondary, key));
  const missingInPrimary = secondaryKeys.filter((key) => !hasTranslation(primary, key));

  const commonKeys = primaryKeys.filter((key) => hasTranslation(secondary, key));
  const different = commonKeys.filter((key) => {
    const primaryValue = getNestedValue(primary, key);
    const secondaryValue = getNestedValue(secondary, key);
    return primaryValue !== secondaryValue;
  });

  return {
    missingInSecondary,
    missingInPrimary,
    different,
  };
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj: Record<string, any>, key: string): any {
  const keys = key.split(".");
  let current = obj;

  for (const k of keys) {
    if (typeof current !== "object" || current === null || !(k in current)) {
      return undefined;
    }
    current = current[k];
  }

  return current;
}

/**
 * Enhanced translation validation utilities
 */
export const translationValidation = {
  hasTranslation,
  getMissingKeys,
  logMissingKey,
  getTranslationWithFallback,
  interpolateParams,
  isValidTranslationKey,
  getNestedKeys,
  compareTranslations,
  getNestedValue,
};

/**
 * Detect browser locale
 */
export function detectBrowserLocale(): Locale {
  if (typeof navigator !== "undefined") {
    const browserLocales = navigator.languages || [navigator.language];

    for (const browserLocale of browserLocales) {
      if (typeof browserLocale === "string") {
        // Check exact match
        if (isValidLocale(browserLocale)) {
          return browserLocale;
        }

        // Check language part (e.g., "cs-CZ" -> "cs")
        const languageCode = browserLocale.split("-")[0];
        if (languageCode && isValidLocale(languageCode)) {
          return languageCode;
        }
      }
    }
  }

  return i18nConfig.defaultLocale;
}

/**
 * Get best locale based on preferences and browser detection
 */
export function getBestLocale(): Locale {
  // 1. Check localStorage preference
  const storedLocale = getLocalePreference();
  if (storedLocale) {
    return storedLocale;
  }

  // 2. Check cookie preference
  const cookieLocale = getLocaleCookie();
  if (cookieLocale) {
    return cookieLocale;
  }

  // 3. Detect from browser
  return detectBrowserLocale();
}
