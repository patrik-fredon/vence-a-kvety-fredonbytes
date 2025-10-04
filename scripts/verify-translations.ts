#!/usr/bin/env tsx
/**
 * Translation Verification Script
 *
 * This script verifies that all translation keys are present in both Czech and English locales
 * and that there are no missing keys that would cause console errors.
 */

import * as fs from "fs";
import * as path from "path";

interface TranslationObject {
  [key: string]: string | TranslationObject;
}

interface ValidationResult {
  locale: string;
  missingKeys: string[];
  extraKeys: string[];
  totalKeys: number;
  isValid: boolean;
}

interface ComparisonResult {
  csValid: boolean;
  enValid: boolean;
  csOnly: string[];
  enOnly: string[];
  commonKeys: number;
  errors: string[];
}

// ANSI color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function loadTranslations(locale: string): TranslationObject {
  const filePath = path.join(process.cwd(), "messages", `${locale}.json`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Translation file not found: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(content);
}

function flattenKeys(obj: TranslationObject, prefix: string = ""): string[] {
  const keys: string[] = [];

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      keys.push(...flattenKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }

  return keys;
}

function compareTranslations(
  csKeys: string[],
  enKeys: string[]
): ComparisonResult {
  const csSet = new Set(csKeys);
  const enSet = new Set(enKeys);

  const csOnly = csKeys.filter((key) => !enSet.has(key));
  const enOnly = enKeys.filter((key) => !csSet.has(key));
  const commonKeys = csKeys.filter((key) => enSet.has(key)).length;

  const errors: string[] = [];

  if (csOnly.length > 0) {
    errors.push(`Found ${csOnly.length} keys only in Czech locale`);
  }

  if (enOnly.length > 0) {
    errors.push(`Found ${enOnly.length} keys only in English locale`);
  }

  return {
    csValid: csOnly.length === 0 && enOnly.length === 0,
    enValid: csOnly.length === 0 && enOnly.length === 0,
    csOnly,
    enOnly,
    commonKeys,
    errors,
  };
}

function checkRequiredKeys(keys: string[], locale: string): ValidationResult {
  // Critical keys that were mentioned in the requirements
  const requiredKeys = [
    "home.refactoredHero.heading",
    "home.refactoredHero.subheading",
    "home.refactoredHero.cta",
    "home.refactoredHero.ctaAriaLabel",
    "home.refactoredHero.description",
    "home.refactoredHero.ctaText",
    "home.refactoredHero.ctaButton",
    "accessibility.accessibility",
    "accessibility.toolbar.title",
    "accessibility.toolbar.footerLink",
  ];

  const keySet = new Set(keys);
  const missingKeys = requiredKeys.filter((key) => !keySet.has(key));
  const extraKeys: string[] = []; // Not checking for extra keys in this validation

  return {
    locale,
    missingKeys,
    extraKeys,
    totalKeys: keys.length,
    isValid: missingKeys.length === 0,
  };
}

function printValidationResult(result: ValidationResult) {
  log(`\n${"=".repeat(60)}`, colors.cyan);
  log(
    `Validation Results for ${result.locale.toUpperCase()} Locale`,
    colors.bright
  );
  log("=".repeat(60), colors.cyan);

  log(`\nTotal Keys: ${result.totalKeys}`, colors.blue);

  if (result.isValid) {
    log("\n✓ All required keys are present!", colors.green);
  } else {
    log(
      `\n✗ Found ${result.missingKeys.length} missing required keys`,
      colors.red
    );

    if (result.missingKeys.length > 0) {
      log("\nMissing Keys:", colors.yellow);
      result.missingKeys.forEach((key) => {
        log(`  - ${key}`, colors.red);
      });
    }
  }
}

function printComparisonResult(result: ComparisonResult) {
  log(`\n${"=".repeat(60)}`, colors.cyan);
  log("Locale Comparison Results", colors.bright);
  log("=".repeat(60), colors.cyan);

  log(`\nCommon Keys: ${result.commonKeys}`, colors.blue);

  if (result.csValid && result.enValid) {
    log("\n✓ Both locales have matching keys!", colors.green);
  } else {
    log("\n✗ Locales have mismatched keys", colors.red);

    if (result.csOnly.length > 0) {
      log(`\nKeys only in Czech (${result.csOnly.length}):`, colors.yellow);
      result.csOnly.slice(0, 10).forEach((key) => {
        log(`  - ${key}`, colors.red);
      });
      if (result.csOnly.length > 10) {
        log(`  ... and ${result.csOnly.length - 10} more`, colors.red);
      }
    }

    if (result.enOnly.length > 0) {
      log(`\nKeys only in English (${result.enOnly.length}):`, colors.yellow);
      result.enOnly.slice(0, 10).forEach((key) => {
        log(`  - ${key}`, colors.red);
      });
      if (result.enOnly.length > 10) {
        log(`  ... and ${result.enOnly.length - 10} more`, colors.red);
      }
    }
  }
}

async function main() {
  log("\n" + "=".repeat(60), colors.cyan);
  log("Translation Verification Script", colors.bright);
  log("=".repeat(60), colors.cyan);

  try {
    // Load translations
    log("\nLoading translation files...", colors.blue);
    const csTranslations = loadTranslations("cs");
    const enTranslations = loadTranslations("en");
    log("✓ Translation files loaded successfully", colors.green);

    // Flatten keys
    log("\nExtracting translation keys...", colors.blue);
    const csKeys = flattenKeys(csTranslations);
    const enKeys = flattenKeys(enTranslations);
    log(`✓ Extracted ${csKeys.length} Czech keys`, colors.green);
    log(`✓ Extracted ${enKeys.length} English keys`, colors.green);

    // Validate required keys for each locale
    const csValidation = checkRequiredKeys(csKeys, "cs");
    const enValidation = checkRequiredKeys(enKeys, "en");

    printValidationResult(csValidation);
    printValidationResult(enValidation);

    // Compare locales
    const comparison = compareTranslations(csKeys, enKeys);
    printComparisonResult(comparison);

    // Final summary
    log(`\n${"=".repeat(60)}`, colors.cyan);
    log("Final Summary", colors.bright);
    log("=".repeat(60), colors.cyan);

    const allValid =
      csValidation.isValid &&
      enValidation.isValid &&
      comparison.csValid &&
      comparison.enValid;

    if (allValid) {
      log("\n✓ All translation validations passed!", colors.green);
      log(
        "✓ No console errors expected from missing translation keys",
        colors.green
      );
      process.exit(0);
    } else {
      log("\n✗ Translation validation failed", colors.red);
      log("✗ Some translation keys are missing or mismatched", colors.red);
      process.exit(1);
    }
  } catch (error) {
    log(`\n✗ Error during validation: ${error}`, colors.red);
    process.exit(1);
  }
}

main();
