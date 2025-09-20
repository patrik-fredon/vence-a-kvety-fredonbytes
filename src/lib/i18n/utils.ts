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
 * Translation validation utilities
 */
export const translationValidation = {
  /**
   * Check if a translation key exists in messages
   */
  hasTranslation(messages: Record<string, any>, key: string): boolean {
    const keys = key.split(".");
    let current = messages;

    for (const k of keys) {
      if (typeof current !== "object" || current === null || !(k in current)) {
        return false;
      }
      current = current[k];
    }

    return typeof current === "string";
  },

  /**
   * Get missing translation keys
   */
  getMissingKeys(messages: Record<string, any>, requiredKeys: string[]): string[] {
    return requiredKeys.filter((key) => !this.hasTranslation(messages, key));
  },

  /**
   * Log missing translation key
   */
  logMissingKey(key: string, locale: Locale): void {
    if (i18nConfig.fallback.logMissingKeys) {
      console.warn(`Missing translation key: "${key}" for locale: "${locale}"`);
    }
  },

  /**
   * Get translation with fallback
   */
  getTranslationWithFallback(
    messages: Record<string, any>,
    fallbackMessages: Record<string, any>,
    key: string,
    locale: Locale
  ): string | null {
    if (this.hasTranslation(messages, key)) {
      const keys = key.split(".");
      let current = messages;
      for (const k of keys) {
        current = current[k];
      }
      return current as string;
    }

    // Try fallback messages
    if (i18nConfig.fallback.enabled && this.hasTranslation(fallbackMessages, key)) {
      const keys = key.split(".");
      let current = fallbackMessages;
      for (const k of keys) {
        current = current[k];
      }
      this.logMissingKey(key, locale);
      return current as string;
    }

    // Log missing key
    this.logMissingKey(key, locale);

    // Return key or null based on configuration
    if (i18nConfig.fallba.showMissingKeys) {
      return `[${key}]`;
    }

    return null;
  },
};

/**
 * Detect browser locale
 */
export function detectBrowserLocale(): Locale {
  if (typeof navigator !== "undefined") {
    const browserLocales = navigator.languages || [navigator.language];

    for (const browserLocale of browserLocales) {
      // Check exact match
      if (isValidLocale(browserLocale)) {
        return browserLocale;
      }

      // Check language part (e.g., "cs-CZ" -> "cs")
      const languageCode = browserLocale.split("-")[0];
      if (isValidLocale(languageCode)) {
        return languageCode;
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
