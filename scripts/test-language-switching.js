#!/usr/bin/env node

/**
 * Language Switching Functionality Test
 *
 * This script tests the language switching functionality with the new content
 * to ensure seamless transitions between Czech and English versions.
 *
 * Requirements covered:
 * - 3.1: English content maintains same emotional tone and professional quality
 * - 3.3: Both language versions are consistent in structure and messaging approach
 * - 3.4: Cultural appropriateness for international audience
 */

const fs = require('fs');
const path = require('path');

class LanguageSwitchingTester {
  constructor() {
    this.csPath = path.join(__dirname, '../messages/cs.json');
    this.enPath = path.join(__dirname, '../messages/en.json');
    this.testResults = [];
    this.passedTests = 0;
    this.failedTests = 0;
  }

  async runTests() {
    console.log('🔄 Starting Language Switching Functionality Tests...\n');

    try {
      // Load both language files
      const csContent = JSON.parse(fs.readFileSync(this.csPath, 'utf8'));
      const enContent = JSON.parse(fs.readFileSync(this.enPath, 'utf8'));

      // Run various switching tests
      this.testCriticalContentSwitching(csContent, enContent);
      this.testSEOMetadataSwitching(csContent, enContent);
      this.testNavigationSwitching(csContent, enContent);
      this.testConversionElementsSwitching(csContent, enContent);
      this.testEmotionalContentSwitching(csContent, enContent);
      this.testStructuralIntegrity(csContent, enContent);

      // Generate test report
      this.generateTestReport();

    } catch (error) {
      console.error('❌ Error during language switching tests:', error.message);
      process.exit(1);
    }
  }

  testCriticalContentSwitching(csContent, enContent) {
    console.log('🏠 Testing critical content switching...');

    const criticalPaths = [
      'home.hero.title',
      'home.hero.subtitle',
      'home.hero.description',
      'home.hero.cta',
      'home.benefits.title',
      'home.philosophy.quote',
      'faq.title',
      'about.title'
    ];

    criticalPaths.forEach(path => {
      const csValue = this.getNestedValue(csContent, path);
      const enValue = this.getNestedValue(enContent, path);

      this.runTest(
        `Critical content switching: ${path}`,
        () => {
          if (!csValue || !enValue) {
            throw new Error(`Missing content in one or both languages`);
          }

          if (csValue === enValue) {
            throw new Error(`Content appears to be identical (not translated)`);
          }

          // Check minimum length requirements
          if (csValue.length < 3 || enValue.length < 3) {
            throw new Error(`Content too short to be meaningful`);
          }

          return true;
        },
        `Czech: "${csValue?.substring(0, 50)}...", English: "${enValue?.substring(0, 50)}..."`
      );
    });
  }

  testSEOMetadataSwitching(csContent, enContent) {
    console.log('🔍 Testing SEO metadata switching...');

    const seoSections = ['home', 'products', 'about', 'faq'];

    seoSections.forEach(section => {
      const csSection = this.getNestedValue(csContent, `seo.${section}`);
      const enSection = this.getNestedValue(enContent, `seo.${section}`);

      this.runTest(
        `SEO metadata switching: ${section}`,
        () => {
          if (!csSection || !enSection) {
            throw new Error(`SEO section missing in one or both languages`);
          }

          // Check title
          if (!csSection.title || !enSection.title) {
            throw new Error(`SEO title missing`);
          }

          if (csSection.title === enSection.title) {
            throw new Error(`SEO titles are identical (not localized)`);
          }

          // Check description
          if (!csSection.description || !enSection.description) {
            throw new Error(`SEO description missing`);
          }

          // Check keywords
          if (!csSection.keywords || !enSection.keywords) {
            throw new Error(`SEO keywords missing`);
          }

          return true;
        },
        `Czech title: "${csSection?.title}", English title: "${enSection?.title}"`
      );
    });
  }

  testNavigationSwitching(csContent, enContent) {
    console.log('🧭 Testing navigation switching...');

    const navItems = ['home', 'products', 'about', 'contact', 'cart'];

    navItems.forEach(item => {
      const csNav = this.getNestedValue(csContent, `navigation.${item}`);
      const enNav = this.getNestedValue(enContent, `navigation.${item}`);

      this.runTest(
        `Navigation switching: ${item}`,
        () => {
          if (!csNav || !enNav) {
            throw new Error(`Navigation item missing`);
          }

          if (csNav === enNav) {
            throw new Error(`Navigation items are identical`);
          }

          return true;
        },
        `Czech: "${csNav}", English: "${enNav}"`
      );
    });
  }

  testConversionElementsSwitching(csContent, enContent) {
    console.log('💰 Testing conversion elements switching...');

    const conversionPaths = [
      'product.addToCart',
      'cart.checkout',
      'checkout.placeOrder',
      'home.hero.cta'
    ];

    conversionPaths.forEach(path => {
      const csValue = this.getNestedValue(csContent, path);
      const enValue = this.getNestedValue(enContent, path);

      this.runTest(
        `Conversion element switching: ${path}`,
        () => {
          if (!csValue || !enValue) {
            throw new Error(`Conversion element missing`);
          }

          // Check that both are action-oriented
          const csIsAction = this.isActionOriented(csValue, 'cs');
          const enIsAction = this.isActionOriented(enValue, 'en');

          if (!csIsAction || !enIsAction) {
            throw new Error(`Conversion element not action-oriented in one language`);
          }

          return true;
        },
        `Czech: "${csValue}", English: "${enValue}"`
      );
    });
  }

  testEmotionalContentSwitching(csContent, enContent) {
    console.log('💝 Testing emotional content switching...');

    const emotionalPaths = [
      'home.hero.description',
      'home.philosophy.text',
      'about.story',
      'about.mission'
    ];

    emotionalPaths.forEach(path => {
      const csValue = this.getNestedValue(csContent, path);
      const enValue = this.getNestedValue(enContent, path);

      this.runTest(
        `Emotional content switching: ${path}`,
        () => {
          if (!csValue || !enValue) {
            throw new Error(`Emotional content missing`);
          }

          // Check for emotional words presence
          const csEmotional = this.countEmotionalWords(csValue, 'cs');
          const enEmotional = this.countEmotionalWords(enValue, 'en');

          if (csEmotional === 0 && enEmotional === 0) {
            throw new Error(`No emotional words detected in either language`);
          }

          // Check length similarity (should be reasonably similar)
          const lengthRatio = Math.min(csValue.length, enValue.length) / Math.max(csValue.length, enValue.length);
          if (lengthRatio < 0.5) {
            throw new Error(`Content length too different between languages (ratio: ${lengthRatio.toFixed(2)})`);
          }

          return true;
        },
        `Czech emotional words: ${this.countEmotionalWords(csValue, 'cs')}, English: ${this.countEmotionalWords(enValue, 'en')}`
      );
    });
  }

  testStructuralIntegrity(csContent, enContent) {
    console.log('🏗️ Testing structural integrity...');

    // Test benefits array structure
    this.runTest(
      'Benefits array structure',
      () => {
        const csBenefits = this.getNestedValue(csContent, 'home.benefits.items');
        const enBenefits = this.getNestedValue(enContent, 'home.benefits.items');

        if (!Array.isArray(csBenefits) || !Array.isArray(enBenefits)) {
          throw new Error('Benefits items are not arrays');
        }

        if (csBenefits.length !== enBenefits.length) {
          throw new Error(`Benefits count mismatch: Czech ${csBenefits.length}, English ${enBenefits.length}`);
        }

        // Check each benefit has title and description
        csBenefits.forEach((benefit, index) => {
          const enBenefit = enBenefits[index];
          if (!benefit.title || !benefit.description || !enBenefit.title || !enBenefit.description) {
            throw new Error(`Benefit ${index + 1} missing title or description`);
          }
        });

        return true;
      },
      `Czech benefits: ${this.getNestedValue(csContent, 'home.benefits.items')?.length}, English benefits: ${this.getNestedValue(enContent, 'home.benefits.items')?.length}`
    );

    // Test FAQ array structure
    this.runTest(
      'FAQ array structure',
      () => {
        const csFaq = this.getNestedValue(csContent, 'faq.items');
        const enFaq = this.getNestedValue(enContent, 'faq.items');

        if (!Array.isArray(csFaq) || !Array.isArray(enFaq)) {
          throw new Error('FAQ items are not arrays');
        }

        if (csFaq.length !== enFaq.length) {
          throw new Error(`FAQ count mismatch: Czech ${csFaq.length}, English ${enFaq.length}`);
        }

        // Check each FAQ has question and answer
        csFaq.forEach((faq, index) => {
          const enFaq_item = enFaq[index];
          if (!faq.question || !faq.answer || !enFaq_item.question || !enFaq_item.answer) {
            throw new Error(`FAQ ${index + 1} missing question or answer`);
          }
        });

        return true;
      },
      `Czech FAQ: ${this.getNestedValue(csContent, 'faq.items')?.length}, English FAQ: ${this.getNestedValue(enContent, 'faq.items')?.length}`
    );
  }

  // Helper methods
  runTest(testName, testFunction, details = '') {
    try {
      const result = testFunction();
      if (result) {
        this.testResults.push({
          name: testName,
          status: 'PASS',
          details: details
        });
        this.passedTests++;
        console.log(`  ✅ ${testName}`);
      }
    } catch (error) {
      this.testResults.push({
        name: testName,
        status: 'FAIL',
        error: error.message,
        details: details
      });
      this.failedTests++;
      console.log(`  ❌ ${testName}: ${error.message}`);
    }
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current && current[key], obj);
  }

  isActionOriented(text, language) {
    const actionWords = {
      cs: ['vybrat', 'objednat', 'koupit', 'přidat', 'pokračovat', 'dokončit', 'kontaktovat', 'prohlédnout'],
      en: ['choose', 'select', 'order', 'buy', 'add', 'proceed', 'complete', 'contact', 'browse']
    };

    const words = actionWords[language] || [];
    return words.some(word => text.toLowerCase().includes(word.toLowerCase()));
  }

  countEmotionalWords(text, language) {
    const emotionalWords = {
      cs: ['láska', 'úcta', 'cit', 'srdce', 'empatie', 'porozumění', 'důstojné', 'krásný', 'krásy', 'citem', 'pečlivostí'],
      en: ['love', 'respect', 'heart', 'empathy', 'understanding', 'dignified', 'beautiful', 'care', 'sensitivity', 'beauty']
    };

    const words = emotionalWords[language] || [];
    return words.reduce((count, word) => {
      return count + (text.toLowerCase().split(word.toLowerCase()).length - 1);
    }, 0);
  }

  generateTestReport() {
    console.log('\n🧪 LANGUAGE SWITCHING TEST REPORT');
    console.log('==================================\n');

    const totalTests = this.passedTests + this.failedTests;
    const successRate = ((this.passedTests / totalTests) * 100).toFixed(1);

    console.log('📊 TEST STATISTICS:');
    console.log(`Total tests: ${totalTests}`);
    console.log(`Passed: ${this.passedTests}`);
    console.log(`Failed: ${this.failedTests}`);
    console.log(`Success rate: ${successRate}%\n`);

    if (this.failedTests > 0) {
      console.log('❌ FAILED TESTS:');
      this.testResults
        .filter(test => test.status === 'FAIL')
        .forEach((test, index) => {
          console.log(`${index + 1}. ${test.name}`);
          console.log(`   Error: ${test.error}`);
          if (test.details) {
            console.log(`   Details: ${test.details}`);
          }
          console.log('');
        });
    }

    console.log('📋 SUMMARY:');
    if (this.failedTests === 0) {
      console.log('✅ All language switching tests passed! The functionality works correctly with new content.');
    } else {
      console.log(`❌ ${this.failedTests} tests failed. Language switching may have issues.`);
      console.log('\n🔧 RECOMMENDED ACTIONS:');
      console.log('1. Fix failed test cases');
      console.log('2. Verify content completeness');
      console.log('3. Test language switching in the actual application');
      console.log('4. Ensure proper i18n integration');
    }

    // Save test results
    const reportData = {
      timestamp: new Date().toISOString(),
      totalTests: totalTests,
      passedTests: this.passedTests,
      failedTests: this.failedTests,
      successRate: parseFloat(successRate),
      testResults: this.testResults
    };

    fs.writeFileSync(
      path.join(__dirname, '../language-switching-test-report.json'),
      JSON.stringify(reportData, null, 2)
    );

    console.log('\n📄 Detailed test report saved to: language-switching-test-report.json');

    // Exit with appropriate code
    process.exit(this.failedTests > 0 ? 1 : 0);
  }
}

// Run the tests
if (require.main === module) {
  const tester = new LanguageSwitchingTester();
  tester.runTests();
}

module.exports = LanguageSwitchingTester;
