/**
 * Advanced translation utilities with enhanced functionality
 */

import type {
  TranslationParams,
  TranslationKeyValidation,
} from "./types";
import type { Locale } from "@/i18n/config";
import { translationValidation } from "./utils";

/**
 * Translation cache for performance optimization
 */
class TranslationCache {
  private cache = new Map<string, { value: string; timestamp: number }>();
  private maxSize = 1000;
  private ttl = 5 * 60 * 1000; // 5 minutes

  private getCacheKey(key: string, locale: Locale, namespace?: string): string {
    return `${locale}:${namespace || "default"}:${key}`;
  }

  get(key: string, locale: Locale, namespace?: string): string | null {
    const cacheKey = this.getCacheKey(key, locale, namespace);
    const entry = this.cache.get(cacheKey);

    if (!entry) return null;

    // Check if entry is expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(cacheKey);
      return null;
    }

    return entry.value;
  }

  set(key: string, locale: Locale, value: string, namespace?: string): void {
    const cacheKey = this.getCacheKey(key, locale, namespace);

    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(cacheKey, {
      value,
      timestamp: Date.now(),
    });
  }

  clear(): void {
    this.cache.clear();
  }

  getStats(): { size: number; maxSize: number; hitRate: number } {
    // This would need to track hits/misses for accurate hit rate
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: 0, // Placeholder
    };
  }
}

// Global translation cache instance
const translationCache = new TranslationCache();

/**
 * Advanced translation key validator
 */
export function validateTranslationKey(key: string): TranslationKeyValidation {
  const errors: string[] = [];
  const suggestions: string[] = [];

  if (!key) {
    errors.push("Translation key cannot be empty");
    return { isValid: false, errors, suggestions: undefined };
  }

  if (typeof key !== "string") {
    errors.push("Translation key must be a string");
    return { isValid: false, errors, suggestions: undefined };
  }

  // Check length
  if (key.length > 200) {
    errors.push("Translation key is too long (max 200 characters)");
  }

  // Check for invalid characters
  const invalidChars = key.match(/[^a-zA-Z0-9._-]/g);
  if (invalidChars) {
    errors.push(`Invalid characters found: ${invalidChars.join(", ")}`);
    suggestions.push("Use only letters, numbers, dots, underscores, and hyphens");
  }

  // Check for consecutive dots
  if (key.includes("..")) {
    errors.push("Consecutive dots are not allowed");
    suggestions.push("Use single dots to separate namespaces");
  }

  // Check for leading/trailing dots
  if (key.startsWith(".") || key.endsWith(".")) {
    errors.push("Key cannot start or end with a dot");
    suggestions.push("Remove leading/trailing dots");
  }

  // Check for empty segments
  const segments = key.split(".");
  const emptySegments = segments.filter(segment => segment.length === 0);
  if (emptySegments.length > 0) {
    errors.push("Empty segments found in key");
    suggestions.push("Ensure all segments between dots have content");
  }

  // Suggest camelCase for segments
  const nonCamelCaseSegments = segments.filter(segment =>
    segment.length > 0 && !/^[a-z][a-zA-Z0-9]*$/.test(segment)
  );
  if (nonCamelCaseSegments.length > 0) {
    suggestions.push("Consider using camelCase for key segments");
  }

  return {
    isValid: errors.length === 0,
    errors,
    suggestions: suggestions.length > 0 ? suggestions : undefined,
  } as TranslationKeyValidation;
}

/**
 * Enhanced parameter interpolation with type safety
 */
export function interpolateTranslation(
  text: string,
  params?: TranslationParams,
  locale?: Locale
): string {
  if (!params || typeof params !== "object") {
    return text;
  }

  return text.replace(/\{(\w+)(?::([^}]+))?\}/g, (match, key, format) => {
    const value = params[key];

    if (value === undefined || value === null) {
      console.warn(`Missing parameter "${key}" for translation interpolation`);
      return match;
    }

    // Apply formatting if specified
    if (format && locale) {
      return formatValue(value, format, locale);
    }

    return String(value);
  });
}

/**
 * Format values based on type and locale
 */
function formatValue(value: any, format: string, locale: Locale): string {
  try {
    switch (format) {
      case "number":
        return new Intl.NumberFormat(locale === "cs" ? "cs-CZ" : "en-US").format(Number(value));

      case "currency":
        return new Intl.NumberFormat(locale === "cs" ? "cs-CZ" : "en-US", {
          style: "currency",
          currency: "CZK",
        }).format(Number(value));

      case "date":
        return new Intl.DateTimeFormat(locale === "cs" ? "cs-CZ" : "en-US").format(new Date(value));

      case "time":
        return new Intl.DateTimeFormat(locale === "cs" ? "cs-CZ" : "en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date(value));

      case "percent":
        return new Intl.NumberFormat(locale === "cs" ? "cs-CZ" : "en-US", {
          style: "percent",
        }).format(Number(value) / 100);

      case "uppercase":
        return String(value).toUpperCase();

      case "lowercase":
        return String(value).toLowerCase();

      case "capitalize":
        return String(value).charAt(0).toUpperCase() + String(value).slice(1).toLowerCase();

      default:
        return String(value);
    }
  } catch (error) {
    console.warn(`Error formatting value "${value}" with format "${format}":`, error);
    return String(value);
  }
}

/**
 * Advanced translation getter with caching and fallback
 */
export function getTranslationAdvanced(
  messages: Record<string, any>,
  key: string,
  locale: Locale,
  params?: TranslationParams,
  fallbackMessages?: Record<string, any>,
  namespace?: string
): string {
  // Check cache first
  const cacheKey = params ? `${key}:${JSON.stringify(params)}` : key;
  const cached = translationCache.get(cacheKey, locale, namespace);
  if (cached) {
    return cached;
  }

  // Get translation with fallback
  const translation = translationValidation.getTranslationWithFallback(
    messages,
    fallbackMessages || {},
    key,
    locale,
    params,
    namespace
  );

  // Interpolate parameters
  const result = interpolateTranslation(translation, params, locale);

  // Cache the result
  translationCache.set(cacheKey, locale, result, namespace);

  return result;
}

/**
 * Pluralization utility with locale-specific rules
 */
export function pluralize(
  count: number,
  translations: {
    zero?: string;
    one: string;
    few?: string;
    many?: string;
    other: string;
  },
  locale: Locale
): string {
  const rules = new Intl.PluralRules(locale === "cs" ? "cs-CZ" : "en-US");
  const rule = rules.select(count);

  switch (rule) {
    case "zero":
      return translations.zero || translations.other;
    case "one":
      return translations.one;
    case "few":
      return translations.few || translations.other;
    case "many":
      return translations.many || translations.other;
    case "other":
    default:
      return translations.other;
  }
}

/**
 * Translation key suggestion engine
 */
export function suggestTranslationKeys(
  partialKey: string,
  availableKeys: string[],
  maxSuggestions = 5
): string[] {
  if (!partialKey || !Array.isArray(availableKeys)) {
    return [];
  }

  const suggestions = availableKeys
    .filter(key => key.toLowerCase().includes(partialKey.toLowerCase()))
    .sort((a, b) => {
      // Prioritize exact matches and prefix matches
      const aStartsWith = a.toLowerCase().startsWith(partialKey.toLowerCase());
      const bStartsWith = b.toLowerCase().startsWith(partialKey.toLowerCase());

      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;

      // Then sort by length (shorter keys first)
      return a.length - b.length;
    })
    .slice(0, maxSuggestions);

  return suggestions;
}

/**
 * Translation completeness checker
 */
export function checkTranslationCompleteness(
  primaryMessages: Record<string, any>,
  secondaryMessages: Record<string, any>,
  _locale: Locale
): {
  completeness: number;
  missing: string[];
  extra: string[];
  suggestions: string[];
} {
  const comparison = translationValidation.compareTranslations(primaryMessages, secondaryMessages);
  const primaryKeys = translationValidation.getNestedKeys(primaryMessages);
  const secondaryKeys = translationValidation.getNestedKeys(secondaryMessages);

  const completeness = secondaryKeys.length > 0
    ? ((secondaryKeys.length - comparison.missingInSecondary.length) / primaryKeys.length) * 100
    : 0;

  const suggestions = comparison.missingInSecondary.map(key => {
    const suggested = suggestTranslationKeys(key, secondaryKeys, 1);
    return suggested.length > 0 ? `${key} -> ${suggested[0]}` : key;
  });

  return {
    completeness: Math.round(completeness * 100) / 100,
    missing: comparison.missingInSecondary,
    extra: comparison.missingInPrimary,
    suggestions,
  };
}

/**
 * Translation export utility
 */
export function exportTranslations(
  messages: Record<string, any>,
  format: "json" | "csv" | "xlsx" = "json"
): string | Blob {
  const flattenedKeys = translationValidation.getNestedKeys(messages);

  switch (format) {
    case "json":
      return JSON.stringify(messages, null, 2);

    case "csv":
      const csvRows = ["Key,Value"];
      flattenedKeys.forEach(key => {
        const value = translationValidation.getNestedValue(messages, key);
        const escapedValue = String(value).replace(/"/g, '""');
        csvRows.push(`"${key}","${escapedValue}"`);
      });
      return csvRows.join("\n");

    case "xlsx":
      // This would require a library like xlsx
      throw new Error("XLSX export not implemented. Use json or csv format.");

    default:
      return JSON.stringify(messages, null, 2);
  }
}

/**
 * Translation import utility
 */
export function importTranslations(
  data: string,
  format: "json" | "csv" = "json"
): Record<string, any> {
  switch (format) {
    case "json":
      try {
        return JSON.parse(data);
      } catch (error) {
        throw new Error(`Invalid JSON format: ${error instanceof Error ? error.message : "Unknown error"}`);
      }

    case "csv":
      const lines = data.split("\n");
      const result: Record<string, any> = {};

      // Skip header row
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i]?.trim();
        if (!line) continue;

        const match = line.match(/^"([^"]+)","(.*)"/);
        if (match) {
          const [, key, value] = match;
          if (key && value !== undefined) {
            const unescapedValue = value.replace(/""/g, '"');
            setNestedValue(result, key, unescapedValue);
          }
        }
      }

      return result;

    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

/**
 * Set nested value in object using dot notation
 */
function setNestedValue(obj: Record<string, any>, key: string, value: any): void {
  const keys = key.split(".");
  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    if (k && (!(k in current) || typeof current[k] !== "object")) {
      current[k] = {};
    }
    if (k) {
      current = current[k];
    }
  }

  const lastKey = keys[keys.length - 1];
  if (lastKey) {
    current[lastKey] = value;
  }
}

/**
 * Clear translation cache
 */
export function clearTranslationCache(): void {
  translationCache.clear();
}

/**
 * Get translation cache statistics
 */
export function getTranslationCacheStats() {
  return translationCache.getStats();
}

/**
 * Preload translations for better performance
 */
export async function preloadTranslations(
  locale: Locale,
  namespaces: string[] = []
): Promise<Record<string, any>> {
  try {
    const messages = await import(`../../../messages/${locale}.json`);

    // If specific namespaces are requested, filter the messages
    if (namespaces.length > 0) {
      const filtered: Record<string, any> = {};
      namespaces.forEach(namespace => {
        if (messages.default[namespace]) {
          filtered[namespace] = messages.default[namespace];
        }
      });
      return filtered;
    }

    return messages.default;
  } catch (error) {
    console.error(`Failed to preload translations for locale "${locale}":`, error);
    return {};
  }
}
