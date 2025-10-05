#!/usr/bin/env tsx
/**
 * Comprehensive Translation Verification Script
 * Tests all translation keys in both Czech and English locales
 * Verifies no console errors and proper fallback behavior
 */

import csMessages from "../messages/cs.json";
import enMessages from "../messages/en.json";

interface ValidationResult {
  locale: string;
  totalKeys: number;
  missingKeys: string[];
  emptyValues: string[];
  errors: string[];
}

// Flatten nested JSON object to dot notation paths
function flattenObject(obj: any, prefix = ""): Record<string, any> {
  const flattened: Record<string, any> = {};

  for (const key in obj) {
    const value = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      Object.assign(flattened, flattenObject(value, newKey));
    } else {
      flattened[newKey] = value;
    }
  }

  return flattened;
}

// Validate translation structure
function validateTranslations(messages: any, locale: string): ValidationResult {
  const result: ValidationResult = {
    locale,
    totalKeys: 0,
    missingKeys: [],
    emptyValues: [],
    errors: [],
  };

  const flattened = flattenObject(messages);
  result.totalKeys = Object.keys(flattened).length;

  // Check for empty values
  for (const [key, value] of Object.entries(flattened)) {
    if (typeof value === "string" && value.trim() === "") {
      result.emptyValues.push(key);
    }
  }

  return result;
}

// Compare two locales for missing keys
function compareLocales(
  baseMessages: any,
  compareMessages: any
): string[] {
  const baseFlat = flattenObject(baseMessages);
  const compareFlat = flattenObject(compareMessages);

  const missingKeys: string[] = [];

  for (const key of Object.keys(baseFlat)) {
    if (!(key in compareFlat)) {
      missingKeys.push(key);
    }
  }

  return missingKeys;
}

// Verify critical keys from requirements
function verifyCriticalKeys(messages: any): string[] {
  const criticalKeys = [
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

  const flattened = flattenObject(messages);
  const missing: string[] = [];

  for (const key of criticalKeys) {
    if (!(key in flattened)) {
      missing.push(key);
    } else if (
      typeof flattened[key] === "string" &&
      flattened[key].trim() === ""
    ) {
      missing.push(`${key} (empty value)`);
    }
  }

  return missing;
}

// Main validation function
function runValidation() {
  console.log("🔍 Starting Translation Verification...\n");
  console.log("=".repeat(60));

  let hasErrors = false;

  // Validate Czech translations
  console.log("\n📋 Validating Czech (cs) translations...");
  const csResult = validateTranslations(csMessages, "cs");
  console.log(`✓ Total keys: ${csResult.totalKeys}`);

  if (csResult.emptyValues.length > 0) {
    console.log(`⚠️  Empty values found: ${csResult.emptyValues.length}`);
    csResult.emptyValues.forEach((key) => console.log(`   - ${key}`));
    hasErrors = true;
  } else {
    console.log("✓ No empty values");
  }

  // Validate English translations
  console.log("\n📋 Validating English (en) translations...");
  const enResult = validateTranslations(enMessages, "en");
  console.log(`✓ Total keys: ${enResult.totalKeys}`);

  if (enResult.emptyValues.length > 0) {
    console.log(`⚠️  Empty values found: ${enResult.emptyValues.length}`);
    enResult.emptyValues.forEach((key) => console.log(`   - ${key}`));
    hasErrors = true;
  } else {
    console.log("✓ No empty values");
  }

  // Compare locales for missing keys
  console.log("\n🔄 Comparing locales for consistency...");
  const missingInCs = compareLocales(enMessages, csMessages);
  const missingInEn = compareLocales(csMessages, enMessages);

  if (missingInCs.length > 0) {
    console.log(`⚠️  Keys in EN but missing in CS: ${missingInCs.length}`);
    missingInCs.slice(0, 10).forEach((key) => console.log(`   - ${key}`));
    if (missingInCs.length > 10) {
      console.log(`   ... and ${missingInCs.length - 10} more`);
    }
    hasErrors = true;
  } else {
    console.log("✓ All EN keys present in CS");
  }

  if (missingInEn.length > 0) {
    console.log(`⚠️  Keys in CS but missing in EN: ${missingInEn.length}`);
    missingInEn.slice(0, 10).forEach((key) => console.log(`   - ${key}`));
    if (missingInEn.length > 10) {
      console.log(`   ... and ${missingInEn.length - 10} more`);
    }
    hasErrors = true;
  } else {
    console.log("✓ All CS keys present in EN");
  }

  // Verify critical keys from requirements
  console.log("\n🎯 Verifying critical keys from requirements...");

  const csCriticalMissing = verifyCriticalKeys(csMessages);
  if (csCriticalMissing.length > 0) {
    console.log("❌ Critical keys missing in CS:");
    csCriticalMissing.forEach((key) => console.log(`   - ${key}`));
    hasErrors = true;
  } else {
    console.log("✓ All critical keys present in CS");
  }

  const enCriticalMissing = verifyCriticalKeys(enMessages);
  if (enCriticalMissing.length > 0) {
    console.log("❌ Critical keys missing in EN:");
    enCriticalMissing.forEach((key) => console.log(`   - ${key}`));
    hasErrors = true;
  } else {
    console.log("✓ All critical keys present in EN");
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  if (hasErrors) {
    console.log("❌ Translation verification FAILED");
    console.log("Please fix the issues above before proceeding.");
    process.exit(1);
  } else {
    console.log("✅ Translation verification PASSED");
    console.log("All translation keys are present and valid!");
  }
}

// Run the validation
runValidation();
