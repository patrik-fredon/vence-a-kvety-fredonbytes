import { i18nConfig, type Locale } from "@/i18n/config";

/**
 * Translation validation utilities for development and testing
 */

export interface TranslationValidationResult {
  isValid: boolean;
  missingKeys: string[];
  extraKeys: string[];
  errors: string[];
}

export interface TranslationMessages {
  [key: string]: string | TranslationMessages;
}

/**
 * Validate translation completeness between locales
 */
export function validateTranslationCompleteness(
  primaryMessages: TranslationMessages,
  secondaryMessages: TranslationMessages,
  primaryLocale: Locale,
  secondaryLocale: Locale
): TranslationValidationResult {
  const result: TranslationValidationResult = {
    isValid: true,
    missingKeys: [],
    extraKeys: [],
    errors: [],
  };

  try {
    const primaryKeys = extractAllKeys(primaryMessages);
    const secondaryKeys = extractAllKeys(secondaryMessages);

    // Find missing keys in secondary locale
    result.missingKeys = primaryKeys.filter((key) => !secondaryKeys.includes(key));

    // Find extra keys in secondary locale
    result.extraKeys = secondaryKeys.filter((key) => !primaryKeys.includes(key));

    // Validate structure consistency
    const structureErrors = validateStructureConsistency(primaryMessages, secondaryMessages);
    result.errors.push(...structureErrors);

    result.isValid = result.missingKeys.length === 0 && result.errors.length === 0;

    if (!result.isValid) {
      console.warn(`Translation validation failed for ${secondaryLocale}:`, {
        missingKeys: result.missingKeys,
        extraKeys: result.extraKeys,
        errors: result.errors,
      });
    }
  } catch (error) {
    result.isValid = false;
    result.errors.push(
      `Validation error: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }

  return result;
}

// Cache for extracted keys to improve performance
const keyCache = new WeakMap<TranslationMessages, string[]>();

/**
 * Extract all translation keys from nested messages object
 */
function extractAllKeys(messages: TranslationMessages, prefix = ""): string[] {
  // Use cache for root level extraction
  if (!prefix && keyCache.has(messages)) {
    return keyCache.get(messages)!;
  }

  const keys: string[] = [];

  for (const [key, value] of Object.entries(messages)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === "string") {
      keys.push(fullKey);
    } else if (typeof value === "object" && value !== null) {
      keys.push(...extractAllKeys(value, fullKey));
    }
  }

  // Cache root level results
  if (!prefix) {
    keyCache.set(messages, keys);
  }

  return keys;
}

/**
 * Validate that the structure of translation objects is consistent
 */
function validateStructureConsistency(
  primary: TranslationMessages,
  secondary: TranslationMessages,
  path = ""
): string[] {
  const errors: string[] = [];

  for (const [key, primaryValue] of Object.entries(primary)) {
    const currentPath = path ? `${path}.${key}` : key;
    const secondaryValue = secondary[key];

    if (secondaryValue === undefined) {
      continue; // Missing key, handled elsewhere
    }

    const primaryType = typeof primaryValue;
    const secondaryType = typeof secondaryValue;

    if (primaryType !== secondaryType) {
      errors.push(
        `Type mismatch at "${currentPath}": primary is ${primaryType}, secondary is ${secondaryType}`
      );
      continue;
    }

    if (primaryType === "object" && primaryValue !== null && secondaryValue !== null) {
      errors.push(
        ...validateStructureConsistency(
          primaryValue as TranslationMessages,
          secondaryValue as TranslationMessages,
          currentPath
        )
      );
    }
  }

  return errors;
}

/**
 * Validate translation key format
 */
export function validateTranslationKey(key: string): boolean {
  // Key should be dot-separated, alphanumeric with underscores
  const keyPattern = /^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*)*$/;
  return keyPattern.test(key);
}

/**
 * Validate translation value
 */
function validateTranslationValue(key: string, value: string): string[] {
  const errors: string[] = [];

  if (!value.trim()) {
    errors.push(`Empty translation value for key: ${key}`);
  }

  // Check for placeholder consistency (basic check for {variable} patterns)
  const placeholderPattern = /\{[a-zA-Z_0-9_]*\}/g;
  const placeholders = value.match(placeholderPattern) || [];

  // Check for unclosed placeholders
  const unclosePattern = /\{[^}]*$/;
  if (unclosePattern.test(value)) {
    errors.push(`Unclosed placeholder in translation for key: ${key}`);
  }

  // Check for malformed placeholders
  const malformedPattern = /\{[^a-zA-Z_0-9_}]/;
  if (malformedPattern.test(value)) {
    errors.push(`Malformed placeholder in translation for key: ${key}`);
  }

  return errors;
}

/**
 * Generate translation validation report
 */
export async function generateTranslationReport(): Promise<{
  overall: TranslationValidationResult;
  localeComparisons: Array<{
    primary: Locale;
    secondary: Locale;
    result: TranslationValidationResult;
  }>;
}> {
  const report = {
    overall: {
      isValid: true,
      missingKeys: [],
      extraKeys: [],
      errors: [],
    } as TranslationValidationResult,
    localeComparisons: [] as Array<{
      primary: Locale;
      secondary: Locale;
      result: TranslationValidationResult;
    }>,
  };

  try {
    // Load all translation files
    const translations: Record<Locale, TranslationMessages> = {} as any;

    for (const locale of i18nConfig.locales) {
      try {
        const messages = await import(`../../../messages/${locale}.json`);
        translations[locale] = messages.default;
      } catch (error) {
        report.overall.errors.push(`Failed to load translations for ${locale}: ${error}`);
        report.overall.isValid = false;
      }
    }

    // Compare each locale with the default locale
    const defaultLocale = i18nConfig.defaultLocale;
    const defaultMessages = translations[defaultLocale];

    if (!defaultMessages) {
      report.overall.errors.push(`Default locale ${defaultLocale} translations not found`);
      report.overall.isValid = false;
      return report;
    }

    for (const locale of i18nConfig.locales) {
      if (locale === defaultLocale) continue;

      const localeMessages = translations[locale];
      if (!localeMessages) continue;

      const comparison = validateTranslationCompleteness(
        defaultMessages,
        localeMessages,
        defaultLocale,
        locale
      );

      report.localeComparisons.push({
        primary: defaultLocale,
        secondary: locale,
        result: comparison,
      });

      // Aggregate results
      if (!comparison.isValid) {
        report.overall.isValid = false;
        report.overall.missingKeys.push(...comparison.missingKeys.map((key) => `${locale}.${key}`));
        report.overall.errors.push(...comparison.errors);
      }
    }
  } catch (error) {
    report.overall.isValid = false;
    report.overall.errors.push(`Report generation error: ${error}`);
  }

  return report;
}

/**
 * Development helper to check for missing translations at runtime
 */
export function createTranslationChecker() {
  if (!i18nConfig.validation.enabled) {
    return {
      checkKey: () => true,
      getReport: () => ({ missingKeys: [], checkedKeys: [] }),
    };
  }

  const missingKeys = new Set<string>();
  const checkedKeys = new Set<string>();

  return {
    checkKey: (key: string, locale: Locale, value?: string) => {
      checkedKeys.add(`${locale}.${key}`);

      if (!value || value === key || (value.startsWith("[") && value.endsWith("]"))) {
        missingKeys.add(`${locale}.${key}`);

        if (i18nConfig.fallback.logMissingKeys) {
          console.warn(`Missing translation: ${locale}.${key}`);
        }

        return false;
      }

      return true;
    },

    getReport: () => ({
      missingKeys: Array.from(missingKeys),
      checkedKeys: Array.from(checkedKeys),
    }),
  };
}

/**
 * Runtime translation validator (for development)
 */
export const runtimeTranslationChecker = createTranslationChecker();
