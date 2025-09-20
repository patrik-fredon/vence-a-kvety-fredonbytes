#!/usr/bin/env node

/**
 * Translation validation script
 * Validates translation completeness and consistency across locales
 */

const fs = require('fs');
const path = require('path');

// Configuration
const LOCALES = ['cs', 'en'];
const DEFAULT_LOCALE = 'cs';
const MESSAGES_DIR = path.join(__dirname, '..', 'messages');

/**
 * Load translation file
 */
function loadTranslations(locale) {
  const filePath = path.join(MESSAGES_DIR, `${locale}.json`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Translation file not found: ${filePath}`);
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to parse translation file ${filePath}: ${error.message}`);
  }
}

/**
 * Extract all keys from nested object
 */
function extractKeys(obj, prefix = '') {
  const keys = [];

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'string') {
      keys.push(fullKey);
    } else if (typeof value === 'object' && value !== null) {
      keys.push(...extractKeys(value, fullKey));
    }
  }

  return keys;
}

/**
 * Validate translation key format
 */
function validateKeyFormat(key) {
  // Allow array indices (numbers) in addition to regular keys
  const keyPattern = /^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z0-9_]+)*$/;
  return keyPattern.test(key);
}

/**
 * Validate translation value
 */
function validateValue(value, key) {
  const errors = [];

  // Check for empty values
  if (!value.trim()) {
    errors.push(`Empty translation value for key: ${key}`);
  }

  // Check for unclosed placeholders
  const unclosePattern = /\{[^}]*$/;
  if (unclosePattern.test(value)) {
    errors.push(`Unclosed placeholder in translation: ${key}`);
  }

  // Check for potential HTML content
  const htmlPattern = /<[^>]*>/g;
  if (htmlPattern.test(value)) {
    errors.push(`Potential HTML content in translation: ${key}`);
  }

  return errors;
}

/**
 * Compare translations between locales
 */
function compareTranslations(primaryTranslations, secondaryTranslations, primaryLocale, secondaryLocale) {
  const primaryKeys = extractKeys(primaryTranslations);
  const secondaryKeys = extractKeys(secondaryTranslations);

  const missingKeys = primaryKeys.filter(key => !secondaryKeys.includes(key));
  const extraKeys = secondaryKeys.filter(key => !primaryKeys.includes(key));

  return {
    missingKeys,
    extraKeys,
    totalPrimaryKeys: primaryKeys.length,
    totalSecondaryKeys: secondaryKeys.length,
    completeness: ((primaryKeys.length - missingKeys.length) / primaryKeys.length * 100).toFixed(2)
  };
}

/**
 * Validate all translations
 */
function validateTranslations() {
  console.log('🔍 Validating translations...\n');

  let hasErrors = false;
  const translations = {};

  // Load all translation files
  for (const locale of LOCALES) {
    try {
      translations[locale] = loadTranslations(locale);
      console.log(`✅ Loaded translations for ${locale}`);
    } catch (error) {
      console.error(`❌ Failed to load translations for ${locale}: ${error.message}`);
      hasErrors = true;
    }
  }

  if (hasErrors) {
    console.log('\n❌ Translation loading failed. Aborting validation.');
    process.exit(1);
  }

  console.log('\n📊 Translation Statistics:');
  console.log('─'.repeat(50));

  // Validate key formats and values
  for (const locale of LOCALES) {
    const keys = extractKeys(translations[locale]);
    console.log(`${locale.toUpperCase()}: ${keys.length} keys`);

    // Validate key formats
    const invalidKeys = keys.filter(key => !validateKeyFormat(key));
    if (invalidKeys.length > 0) {
      console.error(`❌ Invalid key formats in ${locale}:`, invalidKeys);
      hasErrors = true;
    }

    // Validate values
    const valueErrors = [];
    function validateNestedValues(obj, prefix = '') {
      for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;

        if (typeof value === 'string') {
          const errors = validateValue(value, fullKey);
          valueErrors.push(...errors);
        } else if (typeof value === 'object' && value !== null) {
          validateNestedValues(value, fullKey);
        }
      }
    }

    validateNestedValues(translations[locale]);

    if (valueErrors.length > 0) {
      console.error(`❌ Value validation errors in ${locale}:`);
      valueErrors.forEach(error => console.error(`   ${error}`));
      hasErrors = true;
    }
  }

  console.log('\n🔄 Comparing translations:');
  console.log('─'.repeat(50));

  // Compare each locale with default locale
  const defaultTranslations = translations[DEFAULT_LOCALE];

  for (const locale of LOCALES) {
    if (locale === DEFAULT_LOCALE) continue;

    const comparison = compareTranslations(
      defaultTranslations,
      translations[locale],
      DEFAULT_LOCALE,
      locale
    );

    console.log(`\n${DEFAULT_LOCALE.toUpperCase()} → ${locale.toUpperCase()}:`);
    console.log(`  Completeness: ${comparison.completeness}%`);
    console.log(`  Missing keys: ${comparison.missingKeys.length}`);
    console.log(`  Extra keys: ${comparison.extraKeys.length}`);

    if (comparison.missingKeys.length > 0) {
      console.error(`  ❌ Missing keys in ${locale}:`);
      comparison.missingKeys.slice(0, 10).forEach(key => {
        console.error(`     - ${key}`);
      });
      if (comparison.missingKeys.length > 10) {
        console.error(`     ... and ${comparison.missingKeys.length - 10} more`);
      }
      hasErrors = true;
    }

    if (comparison.extraKeys.length > 0) {
      console.warn(`  ⚠️  Extra keys in ${locale}:`);
      comparison.extraKeys.slice(0, 5).forEach(key => {
        console.warn(`     + ${key}`);
      });
      if (comparison.extraKeys.length > 5) {
        console.warn(`     ... and ${comparison.extraKeys.length - 5} more`);
      }
    }
  }

  console.log('\n' + '─'.repeat(50));

  if (hasErrors) {
    console.log('❌ Translation validation failed!');
    console.log('\nPlease fix the issues above before proceeding.');
    process.exit(1);
  } else {
    console.log('✅ All translations are valid!');
    console.log('🎉 Translation validation completed successfully.');
  }
}

/**
 * Generate missing keys template
 */
function generateMissingKeysTemplate() {
  const defaultTranslations = loadTranslations(DEFAULT_LOCALE);
  const defaultKeys = extractKeys(defaultTranslations);

  for (const locale of LOCALES) {
    if (locale === DEFAULT_LOCALE) continue;

    const localeTranslations = loadTranslations(locale);
    const localeKeys = extractKeys(localeTranslations);
    const missingKeys = defaultKeys.filter(key => !localeKeys.includes(key));

    if (missingKeys.length > 0) {
      console.log(`\n📝 Missing keys template for ${locale}:`);
      console.log('─'.repeat(30));

      const template = {};
      missingKeys.forEach(key => {
        const parts = key.split('.');
        let current = template;

        for (let i = 0; i < parts.length - 1; i++) {
          if (!current[parts[i]]) {
            current[parts[i]] = {};
          }
          current = current[parts[i]];
        }

        current[parts[parts.length - 1]] = `TODO: Translate "${key}"`;
      });

      console.log(JSON.stringify(template, null, 2));
    }
  }
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--template')) {
    generateMissingKeysTemplate();
  } else {
    validateTranslations();
  }
}

module.exports = {
  validateTranslations,
  generateMissingKeysTemplate,
  loadTranslations,
  extractKeys,
  compareTranslations,
};
