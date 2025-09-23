"use client";

import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";
import { i18nConfig, type Locale } from "@/i18n/config";
import {
  formatCurrency,
  formatCurrencyCustom,
  formatDate,
  formatDeliveryDate,
  isValidLocale,
  setLocaleCookie,
  setLocalePreference,
} from "./utils";

/**
 * Hook for currency formatting
 */
export function useCurrency() {
  const locale = useLocale() as Locale;

  return useMemo(
    () => ({
      format: (amount: number) => formatCurrency(amount, locale),
      formatCustom: (amount: number) => formatCurrencyCustom(amount, locale),
    }),
    [locale]
  );
}

/**
 * Hook for date formatting
 */
export function useDate() {
  const locale = useLocale() as Locale;

  return useMemo(
    () => ({
      format: (date: Date) => formatDate(date, locale),
      formatDelivery: (date: Date) => formatDeliveryDate(date, locale),
    }),
    [locale]
  );
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

  const switchLocale = useCallback(
    async (newLocale: Locale) => {
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
    },
    [currentLocale, pathname, router]
  );

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
 * Enhanced hook for safe translations with comprehensive fallback handling
 */
export function useSafeTranslations(namespace?: string) {
  const t = useTranslations(namespace);
  const locale = useLocale() as Locale;

  const safeT = useCallback(
    (key: string, params?: Record<string, any>, fallback?: string) => {
      if (!key || typeof key !== "string") {
        console.warn(`Invalid translation key provided:`, key);
        return fallback || "[invalid-key]";
      }

      try {
        const translation = t(key, params);

        // Check if translation actually exists (not just returning the key)
        if (translation && translation !== key && !translation.startsWith("[")) {
          return translation;
        }

        // If we have a fallback, use it
        if (fallback) {
          console.warn(`Using fallback for missing translation key "${key}" in locale "${locale}"`);
          return fallback;
        }

        // Log missing key for development
        if (i18nConfig.fallback.logMissingKeys) {
          console.warn(
            `Missing translation key: "${key}" in namespace: "${namespace || "default"}" for locale: "${locale}"`
          );
        }

        // Return formatted missing key or the key itself
        return i18nConfig.fallback.showMissingKeys ? `[${key}]` : key;
      } catch (error) {
        console.error(`Translation error for key "${key}" in locale "${locale}":`, error);

        // Return fallback or formatted error
        if (fallback) {
          return fallback;
        }

        return i18nConfig.fallback.showMissingKeys ? `[${key}]` : key;
      }
    },
    [t, locale, namespace]
  );

  const hasTranslation = useCallback(
    (key: string) => {
      if (!key || typeof key !== "string") {
        return false;
      }

      try {
        const translation = t(key);
        return (
          translation &&
          translation !== key &&
          !translation.startsWith("[") &&
          !translation.endsWith("]") &&
          translation.trim().length > 0
        );
      } catch {
        return false;
      }
    },
    [t]
  );

  const getTranslationOrFallback = useCallback(
    (key: string, fallback: string, params?: Record<string, any>) => {
      return safeT(key, params, fallback);
    },
    [safeT]
  );

  const formatMessage = useCallback(
    (key: string, params?: Record<string, any>) => {
      const message = safeT(key, params);

      // Simple parameter interpolation if next-intl doesn't handle it
      if (params && typeof message === "string") {
        return message.replace(/\{(\w+)\}/g, (match, paramKey) => {
          return params[paramKey] !== undefined ? String(params[paramKey]) : match;
        });
      }

      return message;
    },
    [safeT]
  );

  return {
    t: safeT,
    hasTranslation,
    getTranslationOrFallback,
    formatMessage,
    locale,
    namespace: namespace || "default",
  };
}

/**
 * Enhanced hook for accessibility translations with comprehensive fallback
 */
export function useAccessibilityTranslations() {
  const { t: safeT, hasTranslation, locale } = useSafeTranslations("accessibility");

  const getAriaLabel = useCallback(
    (key: string, fallback?: string) => {
      if (!key) {
        console.warn("Empty accessibility key provided");
        return fallback || "";
      }

      const translation = safeT(key, undefined, fallback);

      // Ensure we always return a meaningful aria-label
      if (!translation || translation === key || translation.startsWith("[")) {
        const defaultFallback =
          fallback ||
          key
            .replace(/([A-Z])/g, " $1")
            .toLowerCase()
            .trim();
        console.warn(`Using fallback aria-label for "${key}": "${defaultFallback}"`);
        return defaultFallback;
      }

      return translation;
    },
    [safeT]
  );

  const getSkipLink = useCallback(
    (target: string) => {
      return safeT(
        `skipTo${target.charAt(0).toUpperCase() + target.slice(1)}`,
        undefined,
        `Skip to ${target}`
      );
    },
    [safeT]
  );

  const getNavigationLabel = useCallback(
    (type: "main" | "mobile" | "footer") => {
      const key = `${type}Navigation`;
      return safeT(key, undefined, `${type} navigation`);
    },
    [safeT]
  );

  return {
    getAriaLabel,
    getSkipLink,
    getNavigationLabel,
    t: safeT,
    hasTranslation,
    locale,
  };
}

/**
 * Enhanced hook for admin translations with status handling
 */
export function useAdminTranslations() {
  const { t: safeT, hasTranslation, locale } = useSafeTranslations("admin");

  const getStatusLabel = useCallback(
    (status: string) => {
      if (!status) {
        return "";
      }

      // Normalize status key (remove spaces, convert to camelCase)
      const normalizedStatus = status.toLowerCase().replace(/\s+/g, "");
      const translation = safeT(normalizedStatus, undefined, status);

      return translation;
    },
    [safeT]
  );

  const getOrderStatus = useCallback(
    (status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled") => {
      return safeT(status, undefined, status);
    },
    [safeT]
  );

  const getProductStatus = useCallback(
    (status: "active" | "inactive") => {
      return safeT(status, undefined, status);
    },
    [safeT]
  );

  const getAlertLevel = useCallback(
    (level: "waiting" | "warnings" | "unacknowledged") => {
      return safeT(level, undefined, level);
    },
    [safeT]
  );

  return {
    getStatusLabel,
    getOrderStatus,
    getProductStatus,
    getAlertLevel,
    t: safeT,
    hasTranslation,
    locale,
  };
}

/**
 * Enhanced hook for UI translations with component-specific helpers
 */
export function useUITranslations() {
  const { t: safeT, hasTranslation, locale } = useSafeTranslations("ui");

  const getUILabel = useCallback(
    (key: string, fallback?: string) => {
      if (!key) {
        return fallback || "";
      }

      return safeT(key, undefined, fallback);
    },
    [safeT]
  );

  const getButtonLabel = useCallback(
    (action: string) => {
      const key = `${action}Button`;
      return safeT(key, undefined, action);
    },
    [safeT]
  );

  const getMenuLabel = useCallback(
    (type: "main" | "mobile" | "user") => {
      const key = `${type}Menu`;
      return safeT(key, undefined, `${type} menu`);
    },
    [safeT]
  );

  const getLoadingText = useCallback(
    (context?: string) => {
      const key = context
        ? `loading${context.charAt(0).toUpperCase() + context.slice(1)}`
        : "loading";
      return safeT(key, undefined, "Loading...");
    },
    [safeT]
  );

  return {
    getUILabel,
    getButtonLabel,
    getMenuLabel,
    getLoadingText,
    t: safeT,
    hasTranslation,
    locale,
  };
}

/**
 * Enhanced hook for translation validation with comprehensive tracking
 */
export function useTranslationValidation() {
  const locale = useLocale() as Locale;
  const [missingKeys, setMissingKeys] = useState<Set<string>>(new Set());
  const [validationEnabled] = useState(i18nConfig.validation.enabled);
  const [validationErrors, setValidationErrors] = useState<
    Array<{
      key: string;
      error: string;
      timestamp: Date;
      context?: string;
    }>
  >([]);

  const validateTranslations = useCallback(
    (requiredKeys: string[], context?: string) => {
      if (!(validationEnabled && Array.isArray(requiredKeys))) return;

      const missing: string[] = [];
      const errors: typeof validationErrors = [];

      requiredKeys.forEach((key) => {
        if (!key || typeof key !== "string") {
          errors.push({
            key: String(key),
            error: "Invalid key format",
            timestamp: new Date(),
            ...(context && { context }),
          });
          return;
        }

        // In a real implementation, you'd check against actual messages
        // For now, we simulate validation
        if (key.length === 0) {
          missing.push(key);
          errors.push({
            key,
            error: "Empty translation key",
            timestamp: new Date(),
            ...(context && { context }),
          });
        }
      });

      setMissingKeys((prev) => new Set([...Array.from(prev), ...missing]));
      setValidationErrors((prev) => [...prev, ...errors]);
    },
    [validationEnabled]
  );

  const reportMissingKey = useCallback(
    (key: string, context?: string) => {
      if (!(validationEnabled && key)) return;

      setMissingKeys((prev) => {
        if (!prev.has(key)) {
          console.warn(
            `Missing translation key: "${key}" for locale: "${locale}"${context ? ` (context: ${context})` : ""}`
          );
          return new Set([...Array.from(prev), key]);
        }
        return prev;
      });

      setValidationErrors((prev) => [
        ...prev,
        {
          key,
          error: "Missing translation",
          timestamp: new Date(),
          ...(context && { context }),
        },
      ]);
    },
    [validationEnabled, locale]
  );

  const clearValidationErrors = useCallback(() => {
    setMissingKeys(new Set());
    setValidationErrors([]);
  }, []);

  const getValidationSummary = useCallback(() => {
    return {
      totalMissingKeys: missingKeys.size,
      totalErrors: validationErrors.length,
      recentErrors: validationErrors.slice(-10),
      missingKeysList: Array.from(missingKeys),
    };
  }, [missingKeys, validationErrors]);

  return {
    missingKeys: Array.from(missingKeys),
    validationErrors,
    validateTranslations,
    reportMissingKey,
    clearValidationErrors,
    getValidationSummary,
    validationEnabled,
  };
}

/**
 * Hook for managing translation context and namespaces
 */
export function useTranslationContext() {
  const locale = useLocale() as Locale;
  const [currentNamespace, setCurrentNamespace] = useState<string>("common");
  const [namespaceStack, setNamespaceStack] = useState<string[]>([]);

  const pushNamespace = useCallback(
    (namespace: string) => {
      setNamespaceStack((prev) => [...prev, currentNamespace]);
      setCurrentNamespace(namespace);
    },
    [currentNamespace]
  );

  const popNamespace = useCallback(() => {
    setNamespaceStack((prev) => {
      const newStack = [...prev];
      const previousNamespace = newStack.pop();
      if (previousNamespace) {
        setCurrentNamespace(previousNamespace);
      }
      return newStack;
    });
  }, []);

  const resetNamespace = useCallback(() => {
    setCurrentNamespace("common");
    setNamespaceStack([]);
  }, []);

  const getNamespacedKey = useCallback(
    (key: string, namespace?: string) => {
      const ns = namespace || currentNamespace;
      return ns === "common" ? key : `${ns}.${key}`;
    },
    [currentNamespace]
  );

  return {
    locale,
    currentNamespace,
    namespaceStack,
    pushNamespace,
    popNamespace,
    resetNamespace,
    getNamespacedKey,
  };
}

/**
 * Hook for translation performance monitoring
 */
export function useTranslationPerformance() {
  const [translationStats, setTranslationStats] = useState({
    totalTranslations: 0,
    cacheHits: 0,
    cacheMisses: 0,
    averageTime: 0,
  });

  const trackTranslation = useCallback((_key: string, startTime: number) => {
    const endTime = performance.now();
    const duration = endTime - startTime;

    setTranslationStats((prev) => ({
      totalTranslations: prev.totalTranslations + 1,
      cacheHits: prev.cacheHits, // Would be updated based on actual cache implementation
      cacheMisses: prev.cacheMisses + 1,
      averageTime:
        (prev.averageTime * prev.totalTranslations + duration) / (prev.totalTranslations + 1),
    }));
  }, []);

  const resetStats = useCallback(() => {
    setTranslationStats({
      totalTranslations: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageTime: 0,
    });
  }, []);

  return {
    translationStats,
    trackTranslation,
    resetStats,
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
