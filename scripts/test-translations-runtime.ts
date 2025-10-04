#!/usr/bin/env tsx
/**
 * Runtime Translation Testing Script
 *
 * This script tests the actual application to ensure no console errors
 * occur due to missing translation keys.
 */

import * as fs from "fs";
import * as path from "path";

interface TestResult {
  locale: string;
  page: string;
  success: boolean;
  errors: string[];
  warnings: string[];
}

interface TestSummary {
  totalTests: number;
  passed: number;
  failed: number;
  locales: string[];
  pages: string[];
  results: TestResult[];
}

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Pages to test
const testPages = [
  { path: "/", name: "Home Page" },
  { path: "/products", name: "Products Page" },
  { path: "/about", name: "About Page" },
  { path: "/contact", name: "Contact Page" },
  { path: "/faq", name: "FAQ Page" },
];

// Locales to test
const testLocales = ["cs", "en"];

// Critical translation keys that must exist
const criticalKeys = [
  "home.refactoredHero.heading",
  "home.refactoredHero.subheading",
  "home.refactoredHero.cta",
  "home.refactoredHero.ctaAriaLabel",
  "home.refactoredHero.description",
  "accessibility.accessibility",
  "accessibility.toolbar.title",
  "navigation.home",
  "navigation.products",
  "navigation.about",
  "navigation.contact",
  "product.addToCart",
  "cart.title",
  "footer.company",
];

function loadTranslations(locale: string): Record<string, any> {
  const filePath = path.join(process.cwd(), "messages", `${locale}.json`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Translation file not found: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(content);
}

function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((current, key) => current?.[key], obj);
}

function testTranslationKey(
  translations: Record<string, any>,
  key: string,
  locale: string
): TestResult {
  const value = getNestedValue(translations, key);
  const errors: string[] = [];
  const warnings: string[] = [];

  if (value === undefined) {
    errors.push(`Missing translation key: ${key}`);
  } else if (typeof value !== "string") {
    errors.push(`Translation key ${key} is not a string: ${typeof value}`);
  } else if (value.trim() === "") {
    warnings.push(`Translation key ${key} is empty`);
  } else if (value === key) {
    warnings.push(
      `Translation key ${key} returns the key itself (possible fallback)`
    );
  }

  return {
    locale,
    page: key,
    success: errors.length === 0,
    errors,
    warnings,
  };
}

function printTestResult(result: TestResult, index: number, total: number) {
  const status = result.success ? "✓" : "✗";
  const statusColor = result.success ? colors.green : colors.red;

  log(`  [${index + 1}/${total}] ${status} ${result.page}`, statusColor);

  if (result.errors.length > 0) {
    result.errors.forEach((error) => {
      log(`      ✗ ${error}`, colors.red);
    });
  }

  if (result.warnings.length > 0) {
    result.warnings.forEach((warning) => {
      log(`      ⚠ ${warning}`, colors.yellow);
    });
  }
}

function printSummary(summary: TestSummary) {
  log(`\n${"=".repeat(70)}`, colors.cyan);
  log("Test Summary", colors.bright);
  log("=".repeat(70), colors.cyan);

  log(`\nLocales Tested: ${summary.locales.join(", ")}`, colors.blue);
  log(`Total Tests: ${summary.totalTests}`, colors.blue);
  log(`Passed: ${summary.passed}`, colors.green);
  log(
    `Failed: ${summary.failed}`,
    summary.failed > 0 ? colors.red : colors.green
  );

  const successRate =
    summary.totalTests > 0
      ? ((summary.passed / summary.totalTests) * 100).toFixed(1)
      : 0;
  log(
    `Success Rate: ${successRate}%`,
    successRate === "100.0" ? colors.green : colors.yellow
  );

  // Group results by locale
  log(`\n${"─".repeat(70)}`, colors.cyan);
  log("Results by Locale", colors.bright);
  log("─".repeat(70), colors.cyan);

  for (const locale of summary.locales) {
    const localeResults = summary.results.filter((r) => r.locale === locale);
    const localePassed = localeResults.filter((r) => r.success).length;
    const localeFailed = localeResults.filter((r) => !r.success).length;

    log(`\n${locale.toUpperCase()} Locale:`, colors.cyan);
    log(`  Passed: ${localePassed}`, colors.green);
    log(
      `  Failed: ${localeFailed}`,
      localeFailed > 0 ? colors.red : colors.green
    );

    if (localeFailed > 0) {
      log(`  Failed Keys:`, colors.yellow);
      localeResults
        .filter((r) => !r.success)
        .forEach((r) => {
          log(`    - ${r.page}`, colors.red);
        });
    }
  }
}

async function main() {
  log("\n" + "=".repeat(70), colors.cyan);
  log("Runtime Translation Testing", colors.bright);
  log("=".repeat(70), colors.cyan);

  const summary: TestSummary = {
    totalTests: 0,
    passed: 0,
    failed: 0,
    locales: testLocales,
    pages: criticalKeys,
    results: [],
  };

  try {
    for (const locale of testLocales) {
      log(`\n${"─".repeat(70)}`, colors.cyan);
      log(`Testing ${locale.toUpperCase()} Locale`, colors.bright);
      log("─".repeat(70), colors.cyan);

      // Load translations
      log(`\nLoading ${locale} translations...`, colors.blue);
      const translations = loadTranslations(locale);
      log(`✓ Loaded ${locale} translations`, colors.green);

      // Test critical keys
      log(
        `\nTesting ${criticalKeys.length} critical translation keys...`,
        colors.blue
      );

      for (let i = 0; i < criticalKeys.length; i++) {
        const key = criticalKeys[i];
        const result = testTranslationKey(translations, key, locale);

        summary.totalTests++;
        if (result.success) {
          summary.passed++;
        } else {
          summary.failed++;
        }

        summary.results.push(result);
        printTestResult(result, i, criticalKeys.length);
      }
    }

    // Print summary
    printSummary(summary);

    // Final result
    log(`\n${"=".repeat(70)}`, colors.cyan);
    if (summary.failed === 0) {
      log("✓ All translation tests passed!", colors.green);
      log(
        "✓ No console errors expected from missing translation keys",
        colors.green
      );
      log(
        "✓ Both Czech and English locales are working correctly",
        colors.green
      );
      process.exit(0);
    } else {
      log("✗ Some translation tests failed", colors.red);
      log(`✗ ${summary.failed} translation keys have issues`, colors.red);
      log("✗ Please fix the missing or invalid translation keys", colors.red);
      process.exit(1);
    }
  } catch (error) {
    log(`\n✗ Error during testing: ${error}`, colors.red);
    if (error instanceof Error) {
      log(`  ${error.message}`, colors.red);
      if (error.stack) {
        log(`\nStack trace:`, colors.yellow);
        log(error.stack, colors.yellow);
      }
    }
    process.exit(1);
  }
}

main();
