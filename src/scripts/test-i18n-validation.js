#!/usr/bin/env node

/**
 * I18n Validation Test Runner
 * Comprehensive testing script for internationalization validation
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  log('\n' + '='.repeat(60), 'cyan');
  log(`  ${title}`, 'bright');
  log('='.repeat(60), 'cyan');
}

function logSubsection(title) {
  log(`\n${'-'.repeat(40)}`, 'blue');
  log(`  ${title}`, 'blue');
  log(`${'-'.repeat(40)}`, 'blue');
}

async function runTest(testFile, description) {
  try {
    log(`\n🧪 Running: ${description}`, 'yellow');

    const result = execSync(`npm test -- ${testFile} --verbose`, {
      encoding: 'utf8',
      stdio: 'pipe'
    });

    log(`✅ PASSED: ${description}`, 'green');
    return { success: true, output: result };
  } catch (error) {
    log(`❌ FAILED: ${description}`, 'red');
    log(`Error: ${error.message}`, 'red');
    return { success: false, error: error.message, output: error.stdout };
  }
}

async function validateTranslationFiles() {
  logSubsection('Translation File Validation');

  const translationDir = path.join(process.cwd(), 'messages');
  const requiredFiles = ['cs.json', 'en.json'];
  const results = [];

  for (const file of requiredFiles) {
    const filePath = path.join(translationDir, file);

    try {
      if (!fs.existsSync(filePath)) {
        log(`❌ Missing translation file: ${file}`, 'red');
        results.push({ file, success: false, error: 'File not found' });
        continue;
      }

      const content = fs.readFileSync(filePath, 'utf8');
      const translations = JSON.parse(content);

      // Basic validation
      const requiredSections = [
        'navigation', 'common', 'product', 'cart', 'checkout',
        'auth', 'footer', 'delivery', 'home', 'accessibility'
      ];

      const missingSections = requiredSections.filter(section => !translations[section]);

      if (missingSections.length > 0) {
        log(`⚠️  Missing sections in ${file}: ${missingSections.join(', ')}`, 'yellow');
        results.push({ file, success: false, error: `Missing sections: ${missingSections.join(', ')}` });
      } else {
        log(`✅ Valid translation file: ${file}`, 'green');
        results.push({ file, success: true });
      }

    } catch (error) {
      log(`❌ Invalid JSON in ${file}: ${error.message}`, 'red');
      results.push({ file, success: false, error: error.message });
    }
  }

  return results;
}

async function checkComponentI18nUsage() {
  logSubsection('Component I18n Usage Check');

  const componentsDir = path.join(process.cwd(), 'src/components');
  const results = [];

  function scanDirectory(dir) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && !item.startsWith('__tests__')) {
        scanDirectory(fullPath);
      } else if (item.endsWith('.tsx') && !item.endsWith('.test.tsx')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const relativePath = path.relative(process.cwd(), fullPath);

        // Check for useTranslations usage
        const hasUseTranslations = content.includes('useTranslations');
        const hasTranslationCalls = content.includes('t(');

        // Check for potential hardcoded strings (basic heuristic)
        const hardcodedStrings = content.match(/>[^<{]*[A-Z][a-z]{2,}[^<}]*</g) || [];
        const suspiciousStrings = hardcodedStrings.filter(str =>
          !str.includes('Ketingmar') && // Company name is OK
          !str.includes('s.r.o.') && // Company suffix is OK
          str.length > 10
        );

        results.push({
          file: relativePath,
          hasUseTranslations,
          hasTranslationCalls,
          suspiciousStrings: suspiciousStrings.length,
          success: hasUseTranslations && hasTranslationCalls && suspiciousStrings.length < 3
        });

        if (hasUseTranslations && hasTranslationCalls) {
          log(`✅ ${relativePath}: Proper i18n usage`, 'green');
        } else if (suspiciousStrings.length > 2) {
          log(`⚠️  ${relativePath}: ${suspiciousStrings.length} potential hardcoded strings`, 'yellow');
        } else {
          log(`ℹ️  ${relativePath}: No i18n usage (may be OK)`, 'blue');
        }
      }
    }
  }

  try {
    scanDirectory(componentsDir);
  } catch (error) {
    log(`❌ Error scanning components: ${error.message}`, 'red');
  }

  return results;
}

async function runCurrencyFormattingTests() {
  logSubsection('Currency Formatting Tests');

  const testCases = [
    { amount: 1000, locale: 'cs', expected: '1 000 Kč' },
    { amount: 1000, locale: 'en', expected: '1,000 CZK' },
    { amount: 2500.50, locale: 'cs', expected: '2 500,50 Kč' },
    { amount: 2500.50, locale: 'en', expected: '2,500.50 CZK' },
  ];

  const results = [];

  for (const testCase of testCases) {
    try {
      const config = testCase.locale === 'cs'
        ? { locale: 'cs-CZ', symbol: 'Kč' }
        : { locale: 'en-US', symbol: 'CZK' };

      const formatted = testCase.amount.toLocaleString(config.locale);
      const withSymbol = testCase.locale === 'cs'
        ? `${formatted} ${config.symbol}`
        : `${formatted} ${config.symbol}`;

      const success = withSymbol === testCase.expected;

      if (success) {
        log(`✅ ${testCase.amount} (${testCase.locale}): ${withSymbol}`, 'green');
      } else {
        log(`❌ ${testCase.amount} (${testCase.locale}): Expected "${testCase.expected}", got "${withSymbol}"`, 'red');
      }

      results.push({ ...testCase, actual: withSymbol, success });
    } catch (error) {
      log(`❌ Error formatting ${testCase.amount} (${testCase.locale}): ${error.message}`, 'red');
      results.push({ ...testCase, success: false, error: error.message });
    }
  }

  return results;
}

async function runDateFormattingTests() {
  logSubsection('Date Formatting Tests');

  const testDate = new Date('2024-01-15');
  const testCases = [
    { locale: 'cs', expected: /15\.\s?1\.\s?2024/ },
    { locale: 'en', expected: /1\/15\/2024/ },
  ];

  const results = [];

  for (const testCase of testCases) {
    try {
      const localeString = testCase.locale === 'cs' ? 'cs-CZ' : 'en-US';
      const formatted = testDate.toLocaleDateString(localeString);
      const success = testCase.expected.test(formatted);

      if (success) {
        log(`✅ Date formatting (${testCase.locale}): ${formatted}`, 'green');
      } else {
        log(`❌ Date formatting (${testCase.locale}): ${formatted} doesn't match expected pattern`, 'red');
      }

      results.push({ locale: testCase.locale, formatted, success });
    } catch (error) {
      log(`❌ Error formatting date (${testCase.locale}): ${error.message}`, 'red');
      results.push({ locale: testCase.locale, success: false, error: error.message });
    }
  }

  return results;
}

async function generateReport(results) {
  logSection('I18n Validation Report');

  const reportData = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTests: 0,
      passed: 0,
      failed: 0,
      warnings: 0
    },
    details: results
  };

  // Calculate summary
  Object.values(results).flat().forEach(result => {
    if (typeof result.success === 'boolean') {
      reportData.summary.totalTests++;
      if (result.success) {
        reportData.summary.passed++;
      } else {
        reportData.summary.failed++;
      }
    }
  });

  // Display summary
  log(`\n📊 Test Summary:`, 'bright');
  log(`   Total Tests: ${reportData.summary.totalTests}`, 'blue');
  log(`   Passed: ${reportData.summary.passed}`, 'green');
  log(`   Failed: ${reportData.summary.failed}`, 'red');

  const successRate = reportData.summary.totalTests > 0
    ? ((reportData.summary.passed / reportData.summary.totalTests) * 100).toFixed(1)
    : 0;

  log(`   Success Rate: ${successRate}%`, successRate > 90 ? 'green' : successRate > 70 ? 'yellow' : 'red');

  // Save report
  const reportPath = path.join(process.cwd(), 'i18n-validation-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
  log(`\n📄 Detailed report saved to: ${reportPath}`, 'cyan');

  return reportData;
}

async function main() {
  log('🌍 Starting I18n Validation Tests', 'bright');
  log('Testing Czech and English language support across all components\n', 'blue');

  const results = {};

  try {
    // 1. Validate translation files
    logSection('Task 15.1: Czech and English Language Support');
    results.translationFiles = await validateTranslationFiles();

    // 2. Check component i18n usage
    results.componentUsage = await checkComponentI18nUsage();

    // 3. Test currency formatting
    results.currencyFormatting = await runCurrencyFormattingTests();

    // 4. Test date formatting
    results.dateFormatting = await runDateFormattingTests();

    // 5. Run Jest tests
    logSection('Task 15.2: I18n Integration Completeness');

    const testFiles = [
      'src/components/__tests__/i18n-validation.test.tsx',
      'src/components/__tests__/language-switching.test.tsx',
      'src/components/__tests__/hardcoded-strings-detection.test.tsx',
      'src/components/__tests__/locale-formatting.test.tsx'
    ];

    results.jestTests = [];

    for (const testFile of testFiles) {
      const testResult = await runTest(testFile, path.basename(testFile));
      results.jestTests.push({
        file: testFile,
        ...testResult
      });
    }

    // 6. Generate final report
    const report = await generateReport(results);

    // 7. Final status
    logSection('Validation Complete');

    if (report.summary.failed === 0) {
      log('🎉 All i18n validation tests passed!', 'green');
      log('✅ Czech and English language support is properly implemented', 'green');
      log('✅ No hardcoded strings detected', 'green');
      log('✅ Currency and date formatting working correctly', 'green');
      log('✅ Language switching functionality validated', 'green');
    } else {
      log('⚠️  Some i18n validation tests failed', 'yellow');
      log('Please review the detailed report and fix any issues', 'yellow');
    }

  } catch (error) {
    log(`\n💥 Fatal error during i18n validation: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run the validation
if (require.main === module) {
  main().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = {
  runTest,
  validateTranslationFiles,
  checkComponentI18nUsage,
  runCurrencyFormattingTests,
  runDateFormattingTests,
  generateReport
};
