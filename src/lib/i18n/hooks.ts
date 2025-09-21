"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { useCallback, useEffect, useState, useMemo } from "react";
import {
  formatCurrency,
  formatCurrencyCustom,
  formatDate,
  formatDeliveryDate,
  setLocalePreference,
  setLocaleCookie,
  getValidLocale,
  isValidLocale,
} from "./utils";
import { type Locale, i18nConfig } from "@/i18n/config";

/**
 * Hook for currency formatting
 */
export function useCurrency() {
  const locale = useLocale() as Locale;

  return useMemo(() => ({
    format: (amount: number) => formatCurrency(amount, locale),
    formatCustom: (amount: number) => formatCurrencyCustom(amount, locale),
  }), [locale]);
}

/**
 * Hook for date formatting
 */
export function useDate() {
  const locale = useLocale() as Locale;

  return useMemo(() => ({
    format: (date: Date) => formatDate(date, locale),
    formatDelivery: (date: Date) => formatDeliveryDate(date, locale),
  }), [locale]);
}

/**
 * Hook for locale-aware utilities
 */
export function useLocaleUtils() {
  const locale = useLocale() as Locale;

  return {
    locale,
    isRTL: false, // Neither Czech nor English are RTL
    currency: locale === "cs" ? "CZK" : "CZK",
    currencySymbol: locale === "cs" ? "Kč" : "CZK",
  };
}

/**
 * Enhanced hook for locale switching with persistence
 */
export function useLocaleSwitch() {
  const currentLocale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const switchLocale = useCallback(async (newLocale: Locale) => {
    if (!isValidLocale(newLocale) || newLocale === currentLocale) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Save preference
      setLocalePreference(newLocale);
      setLocaleCookie(newLocale);

      // Navigate to new locale
      const pathnameWithoutLocale = pathname.replace(/^\/[a-z]{2}/, "");
      const newPath = `/${newLocale}${pathnameWithoutLocale}`;

      router.push(newPath);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to switch language";
      setError(errorMessage);
      console.error("Locale switch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentLocale, pathname, router]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    currentLocale,
    switchLocale,
    isLoading,
    error,
    clearError,
    availableLocales: i18nConfig.locales,
    localeNames: i18nConfig.localeNames,
  };
}

/**
 * Hook for safe translations with fallback
 */
export function useSafeTranslations(namespace?: string) {
  const t = useTranslations(namespace);
  const locale = useLocale() as Locale;

  const safeT = useCallback((key: string, params?: Record<string, any>) => {
    try {
      return t(key, params);
    } catch (error) {
      console.warn(`Translation error for key "${key}" in locale "${locale}":`, error);

      if (i18nConfig.fallback.showMissingKeys) {
        return `[${key}]`;
      }

      return key;
    }
  }, [t, locale]);

  const hasTranslation = useCallback((key: string) => {
    try {
      const translation = t(key);
      return translation !== key && !translation.startsWith('[') && !translation.endsWith(']');
    } catch {
      return false;
    }
  }, [t]);

  return {
    t: safeT,
    hasTranslation,
    locale,
  };
}

/**
 * Enhanced hook for accessibility translations
 */
export function useAccessibilityTranslations() {
  const t = useTranslations("accessibility");
  const locale = useLocale() as Locale;

  const getAriaLabel = useCallback((key: string, fallback?: string) => {
    try {
      return t(key);
    } catch (error) {
      console.warn(`Missing accessibility translation for key "${key}" in locale "${locale}"`);
      return fallback || key;
    }
  }, [t, locale]);

  return {
    getAriaLabel,
    t,
    locale,
  };
}

/**
 * Enhanced hook for admin translations
 */
export function useAdminTranslations() {
  const t = useTranslations("admin");
  const locale = useLocale() as Locale;

  const getStatusLabel = useCallback((status: string) => {
    try {
      return t(status);
    } catch (error) {
      console.warn(`Missing admin status translation for "${status}" in locale "${locale}"`);
      return status;
    }
  }, [t, locale]);

  return {
    getStatusLabel,
    t,
    locale,
  };
}

/**
 * Enhanced hook for UI translations
 */
export function useUITranslations() {
  const t = useTranslations("ui");
  const locale = useLocale() as Locale;

  const getUILabel = useCallback((key: string, fallback?: string) => {
    try {
      return t(key);
    } catch (error) {
      console.warn(`Missing UI translation for key "${key}" in locale "${locale}"`);
      return fallback || key;
    }
  }, [t, locale]);

  return {
    getUILabel,
    t,
    locale,
  };
}

/**
 * Hook for translation validation (development only)
 */
export function useTranslationValidation() {
  const locale = useLocale() as Locale;
  const [missingKeys, setMissingKeys] = useState<string[]>([]);
  const [validationEnabled] = useState(i18nConfig.validation.enabled);

  const validateTranslations = useCallback((requiredKeys: string[]) => {
    if (!validationEnabled) return;

    // This would need access to the messages object
    // For now, we'll just track keys that fail translation
    const missing: string[] = [];

    // In a real implementation, you'd check against the actual messages
    // For now, this is a placeholder for the validation logic

    setMissingKeys(missing);
  }, [validationEnabled]);

  const reportMissingKey = useCallback((key: string) => {
    if (!validationEnabled) return;

    setMissingKeys(prev => {
      if (!prev.includes(key)) {
        console.warn(`Missing translation key: "${key}" for locale: "${locale}"`);
        return [...prev, key];
      }
      return prev;
    });
  }, [validationEnabled, locale]);

  return {
    missingKeys,
    validateTranslations,
    reportMissingKey,
    validationEnabled,
  };
}

/**
 * Hook for locale persistence management
 */
export function useLocalePersistence() {
  const currentLocale = useLocale() as Locale;

  const saveLocalePreference = useCallback((locale: Locale) => {
    setLocalePreference(locale);
    setLocaleCookie(locale);
  }, []);

  const clearLocalePreference = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(i18nConfig.persistence.storageKey);
        // Clear cookie by setting it to expire in the past
        document.cookie = `${i18nConfig.persistence.cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      } catch (error) {
        console.warn("Failed to clear locale preference:", error);
      }
    }
  }, []);

  return {
    currentLocale,
    saveLocalePreference,
    clearLocalePreference,
  };
}
