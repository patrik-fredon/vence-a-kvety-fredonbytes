"use client";

import { NextIntlClientProvider } from "next-intl";
import type React from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Locale } from "@/i18n/config";
import { i18nConfig } from "@/i18n/config";
import type {
  TranslationProviderProps,
  TranslationStats,
  TranslationValidationError,
} from "./types";
import { translationValidation } from "./utils";

/**
 * Enhanced translation context
 */
interface EnhancedTranslationContext {
  locale: Locale;
  messages: Record<string, any>;
  fallbackMessages: Record<string, any> | undefined;
  validationErrors: TranslationValidationError[];
  translationStats: TranslationStats;
  reportMissingKey: (key: string, namespace?: string) => void;
  reportError: (error: Error, key: string) => void;
  clearValidationErrors: () => void;
  getValidationSummary: () => {
    totalErrors: number;
    recentErrors: TranslationValidationError[];
  };
}

const EnhancedTranslationContext = createContext<EnhancedTranslationContext | null>(null);

/**
 * Enhanced translation provider with validation and error tracking
 */
export function EnhancedTranslationProvider({
  locale,
  messages,
  fallbackMessages,
  children,
  onMissingKey,
  onError,
}: TranslationProviderProps) {
  const [validationErrors, setValidationErrors] = useState<TranslationValidationError[]>([]);
  const [translationStats] = useState<TranslationStats>({
    totalTranslations: 0,
    cacheHits: 0,
    cacheMisses: 0,
    averageTime: 0,
  });

  const reportMissingKey = useCallback(
    (key: string, namespace?: string) => {
      const error: TranslationValidationError = {
        key,
        error: "Missing translation",
        timestamp: new Date(),
        ...(namespace && { context: namespace }),
      };

      setValidationErrors((prev) => [...prev, error]);

      // Call external handler if provided
      if (onMissingKey) {
        onMissingKey(key, locale, namespace);
      }

      // Log in development
      if (i18nConfig.fallback.logMissingKeys) {
        console.warn(
          `Missing translation key: "${key}" in locale: "${locale}"${namespace ? ` (namespace: ${namespace})` : ""}`
        );
      }
    },
    [locale, onMissingKey]
  );

  const reportError = useCallback(
    (error: Error, key: string) => {
      const validationError: TranslationValidationError = {
        key,
        error: error.message,
        timestamp: new Date(),
      };

      setValidationErrors((prev) => [...prev, validationError]);

      // Call external handler if provided
      if (onError) {
        onError(error, key, locale);
      }

      // Log error
      console.error(`Translation error for key "${key}" in locale "${locale}":`, error);
    },
    [locale, onError]
  );

  const clearValidationErrors = useCallback(() => {
    setValidationErrors([]);
  }, []);

  const getValidationSummary = useCallback(() => {
    return {
      totalErrors: validationErrors.length,
      recentErrors: validationErrors.slice(-10),
    };
  }, [validationErrors]);

  // Update translation stats (for future use)
  // const updateStats = useCallback((duration: number, cacheHit: boolean = false) => {
  //   setTranslationStats(prev => ({
  //     totalTranslations: prev.totalTranslations + 1,
  //     cacheHits: cacheHit ? prev.cacheHits + 1 : prev.cacheHits,
  //     cacheMisses: cacheHit ? prev.cacheMisses : prev.cacheMisses + 1,
  //     averageTime: (prev.averageTime * prev.totalTranslations + duration) / (prev.totalTranslations + 1),
  //   }));
  // }, []);

  // Validate messages on mount and when they change
  useEffect(() => {
    if (i18nConfig.validation.enabled && messages) {
      const requiredKeys = translationValidation.getNestedKeys(messages);
      const missingKeys = translationValidation.getMissingKeys(messages, requiredKeys);

      if (missingKeys.length > 0) {
        console.warn(
          `Found ${missingKeys.length} missing translation keys in locale "${locale}":`,
          missingKeys
        );
      }
    }
  }, [messages, locale]);

  const contextValue = useMemo<EnhancedTranslationContext>(
    () => ({
      locale,
      messages,
      fallbackMessages,
      validationErrors,
      translationStats,
      reportMissingKey,
      reportError,
      clearValidationErrors,
      getValidationSummary,
    }),
    [
      locale,
      messages,
      fallbackMessages,
      validationErrors,
      translationStats,
      reportMissingKey,
      reportError,
      clearValidationErrors,
      getValidationSummary,
    ]
  );

  return (
    <EnhancedTranslationContext.Provider value={contextValue}>
      <NextIntlClientProvider
        locale={locale}
        messages={messages}
        onError={(error) => {
          // Extract key from error if possible
          const key = error.message.match(/key "([^"]+)"/)?.[1] || "unknown";
          reportError(error, key);
        }}
      >
        {children}
      </NextIntlClientProvider>
    </EnhancedTranslationContext.Provider>
  );
}

/**
 * Hook to access enhanced translation context
 */
export function useEnhancedTranslationContext() {
  const context = useContext(EnhancedTranslationContext);

  if (!context) {
    throw new Error(
      "useEnhancedTranslationContext must be used within an EnhancedTranslationProvider"
    );
  }

  return context;
}

/**
 * Hook for translation debugging (development only)
 */
export function useTranslationDebug() {
  const context = useEnhancedTranslationContext();
  const [debugMode, setDebugMode] = useState(process.env['NODE_ENV'] === "development");

  const logTranslationUsage = useCallback(
    (key: string, namespace?: string, value?: string) => {
      if (!debugMode) return;

      console.log(`Translation used: ${namespace ? `${namespace}.` : ""}${key} = "${value}"`);
    },
    [debugMode]
  );

  const validateKey = useCallback(
    (key: string) => {
      if (!debugMode) return true;

      const isValid = translationValidation.isValidTranslationKey(key);
      if (!isValid) {
        console.warn(`Invalid translation key format: "${key}"`);
      }
      return isValid;
    },
    [debugMode]
  );

  const checkKeyExists = useCallback(
    (key: string, namespace?: string) => {
      if (!debugMode) return true;

      const fullKey = namespace ? `${namespace}.${key}` : key;
      const exists = translationValidation.hasTranslation(context.messages, fullKey);

      if (!exists) {
        console.warn(`Translation key not found: "${fullKey}"`);
        context.reportMissingKey(key, namespace);
      }

      return exists;
    },
    [debugMode, context]
  );

  return {
    debugMode,
    setDebugMode,
    logTranslationUsage,
    validateKey,
    checkKeyExists,
    validationErrors: context.validationErrors,
    translationStats: context.translationStats,
    clearValidationErrors: context.clearValidationErrors,
    getValidationSummary: context.getValidationSummary,
  };
}

/**
 * Higher-order component for translation debugging
 */
export function withTranslationDebug<P extends object>(
  Component: React.ComponentType<P>,
  namespace?: string
) {
  const WrappedComponent = (props: P) => {
    const { logTranslationUsage } = useTranslationDebug();

    // Log component mount with namespace
    useEffect(() => {
      if (namespace) {
        logTranslationUsage(
          "component_mounted",
          namespace,
          Component.displayName || Component.name
        );
      }
    }, [logTranslationUsage, Component.displayName, Component.name, namespace]);

    return <Component {...props} />;
  };

  WrappedComponent.displayName = `withTranslationDebug(${Component.displayName || Component.name})`;

  return WrappedComponent;
}
