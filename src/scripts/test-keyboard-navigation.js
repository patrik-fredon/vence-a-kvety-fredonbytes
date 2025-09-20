#!/usr/bin/env node

/**
 * Keyboard navigation testing script
 * Tests keyboard accessibility across all interactive elements
 */

const puppeteer = require('puppeteer');
const path = require('path');

// Test configuration
const TEST_CONFIG = {
  baseUrl: process.env.TEST_URL || 'http://localhost:3000',
  locale: 'cs',
  timeout: 30000,
  viewport: { width: 1280, height: 720 }
};

// Keyboard navigation test cases
const KEYBOARD_TESTS = [
  {
    name: 'Homepage Navigation',
    path: '/',
    tests: [
      'skip-links',
      'header-navigation',
      'product-grid',
      'footer-navigation'
    ]
  },
  {
    name: 'Product Listing',
    path: '/products',
    tests: [
      'product-filters',
      'product-grid-navigation',
      'pagination'
    ]
  },
  {
    name: 'Contact Form',
    path: '/contact',
    tests: [
      'form-navigation',
      'form-validation',
      'form-submission'
    ]
  },
  {
    name: 'Accessibility Toolbar',
    path: '/',
    tests: [
      'toolbar-toggle',
      'high-contrast-toggle',
      'skip-links-functionality'
    ]
  }
];

class KeyboardNavigationTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      details: []
    };
  }

  async initialize() {
    console.log('🚀 Initializing Keyboard Navigation Tests\n');

    this.browser = await puppeteer.launch({
      headless: process.env.HEADLESS !== 'false',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    this.page = await this.browser.newPage();
    await this.page.setViewport(TEST_CONFIG.viewport);

    // Enable accessibility features
    await this.page.evaluateOnNewDocument(() => {
      // Mock reduced motion preference for testing
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });
    });
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async runTest(testCase) {
    console.log(`📋 Testing: ${testCase.name}`);
    console.log(`   Path: ${testCase.path}`);

    const url = `${TEST_CONFIG.baseUrl}/${TEST_CONFIG.locale}${testCase.path}`;

    try {
      await this.page.goto(url, { waitUntil: 'networkidle0', timeout: TEST_CONFIG.timeout });

      for (const testName of testCase.tests) {
        await this.runSpecificTest(testName, testCase.name);
      }

    } catch (error) {
      this.recordResult('failed', testCase.name, 'Page Load', `Failed to load page: ${error.message}`);
    }
  }

  async runSpecificTest(testName, suiteName) {
    console.log(`   🧪 Running: ${testName}`);

    try {
      switch (testName) {
        case 'skip-links':
          await this.testSkipLinks(suiteName);
          break;
        case 'header-navigation':
          await this.testHeaderNavigation(suiteName);
          break;
        case 'product-grid':
          await this.testProductGrid(suiteName);
          break;
        case 'footer-navigation':
          await this.testFooterNavigation(suiteName);
          break;
        case 'product-filters':
          await this.testProductFilters(suiteName);
          break;
        case 'product-grid-navigation':
          await this.testProductGridNavigation(suiteName);
          break;
        case 'pagination':
          await this.testPagination(suiteName);
          break;
        case 'form-navigation':
          await this.testFormNavigation(suiteName);
          break;
        case 'form-validation':
          await this.testFormValidation(suiteName);
          break;
        case 'form-submission':
          await this.testFormSubmission(suiteName);
          break;
        case 'toolbar-toggle':
          await this.testToolbarToggle(suiteName);
          break;
        case 'high-contrast-toggle':
          await this.testHighContrastToggle(suiteName);
          break;
        case 'skip-links-functionality':
          await this.testSkipLinksFunctionality(suiteName);
          break;
        default:
          this.recordResult('warning', suiteName, testName, 'Test not implemented');
      }
    } catch (error) {
      this.recordResult('failed', suiteName, testName, error.message);
    }
  }

  async testSkipLinks(suiteName) {
    // Test skip links visibility and functionality
    const skipLinks = await this.page.$$('a[href^="#"]');

    if (skipLinks.length === 0) {
      this.recordResult('failed', suiteName, 'Skip Links', 'No skip links found');
      return;
    }

    // Test skip link focus
    await this.page.keyboard.press('Tab');
    const focusedElement = await this.page.evaluate(() => document.activeElement.textContent);

    if (focusedElement.includes('Přejít na hlavní obsah')) {
      this.recordResult('passed', suiteName, 'Skip Links', 'Skip links are keyboard accessible');
    } else {
      this.recordResult('failed', suiteName, 'Skip Links', 'Skip links not properly focused');
    }
  }

  async testHeaderNavigation(suiteName) {
    // Test header navigation keyboard accessibility
    const navLinks = await this.page.$$('header nav a, header nav button');

    if (navLinks.length === 0) {
      this.recordResult('failed', suiteName, 'Header Navigation', 'No navigation links found');
      return;
    }

    // Test tab navigation through header
    let tabCount = 0;
    const maxTabs = 10;

    while (tabCount < maxTabs) {
      await this.page.keyboard.press('Tab');
      tabCount++;

      const focusedElement = await this.page.evaluate(() => {
        const el = document.activeElement;
        return {
          tagName: el.tagName,
          role: el.getAttribute('role'),
          ariaLabel: el.getAttribute('aria-label'),
          textContent: el.textContent?.trim()
        };
      });

      // Check if we're in the header navigation
      if (focusedElement.tagName === 'A' || focusedElement.tagName === 'BUTTON') {
        const isInHeader = await this.page.evaluate(() => {
          const el = document.activeElement;
          return el.closest('header') !== null;
        });

        if (isInHeader) {
          this.recordResult('passed', suiteName, 'Header Navigation', 'Header navigation is keyboard accessible');
          return;
        }
      }
    }

    this.recordResult('failed', suiteName, 'Header Navigation', 'Could not navigate header with keyboard');
  }

  async testProductGrid(suiteName) {
    // Test product grid keyboard navigation
    const productCards = await this.page.$$('[role="article"], .product-card');

    if (productCards.length === 0) {
      this.recordResult('warning', suiteName, 'Product Grid', 'No product cards found on this page');
      return;
    }

    // Test arrow key navigation if grid component is present
    const grid = await this.page.$('[role="grid"]');

    if (grid) {
      await grid.focus();
      await this.page.keyboard.press('ArrowRight');

      const focusedAfterArrow = await this.page.evaluate(() => {
        return document.activeElement.getAttribute('role') === 'gridcell';
      });

      if (focusedAfterArrow) {
        this.recordResult('passed', suiteName, 'Product Grid', 'Grid navigation works with arrow keys');
      } else {
        this.recordResult('failed', suiteName, 'Product Grid', 'Arrow key navigation not working');
      }
    } else {
      // Test tab navigation through product cards
      let foundProductCard = false;
      let tabCount = 0;
      const maxTabs = 20;

      while (tabCount < maxTabs && !foundProductCard) {
        await this.page.keyboard.press('Tab');
        tabCount++;

        const isProductCard = await this.page.evaluate(() => {
          const el = document.activeElement;
          return el.closest('[role="article"]') !== null ||
                 el.closest('.product-card') !== null;
        });

        if (isProductCard) {
          foundProductCard = true;
        }
      }

      if (foundProductCard) {
        this.recordResult('passed', suiteName, 'Product Grid', 'Product cards are keyboard accessible');
      } else {
        this.recordResult('failed', suiteName, 'Product Grid', 'Product cards not keyboard accessible');
      }
    }
  }

  async testFooterNavigation(suiteName) {
    // Test footer navigation
    const footerLinks = await this.page.$$('footer a');

    if (footerLinks.length === 0) {
      this.recordResult('failed', suiteName, 'Footer Navigation', 'No footer links found');
      return;
    }

    // Navigate to footer and test links
    await this.page.keyboard.press('End'); // Go to end of page

    let foundFooterLink = false;
    let tabCount = 0;
    const maxTabs = 15;

    while (tabCount < maxTabs && !foundFooterLink) {
      await this.page.keyboard.press('Tab');
      tabCount++;

      const isFooterLink = await this.page.evaluate(() => {
        const el = document.activeElement;
        return el.tagName === 'A' && el.closest('footer') !== null;
      });

      if (isFooterLink) {
        foundFooterLink = true;
      }
    }

    if (foundFooterLink) {
      this.recordResult('passed', suiteName, 'Footer Navigation', 'Footer links are keyboard accessible');
    } else {
      this.recordResult('failed', suiteName, 'Footer Navigation', 'Footer links not keyboard accessible');
    }
  }

  async testFormNavigation(suiteName) {
    // Test form field navigation
    const formFields = await this.page.$$('input, textarea, select, button[type="submit"]');

    if (formFields.length === 0) {
      this.recordResult('warning', suiteName, 'Form Navigation', 'No form fields found on this page');
      return;
    }

    // Test tab navigation through form
    let fieldCount = 0;
    let tabCount = 0;
    const maxTabs = 20;

    while (tabCount < maxTabs) {
      await this.page.keyboard.press('Tab');
      tabCount++;

      const isFormField = await this.page.evaluate(() => {
        const el = document.activeElement;
        return ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(el.tagName);
      });

      if (isFormField) {
        fieldCount++;
        if (fieldCount >= 2) break; // Found multiple form fields
      }
    }

    if (fieldCount >= 2) {
      this.recordResult('passed', suiteName, 'Form Navigation', 'Form fields are keyboard accessible');
    } else {
      this.recordResult('failed', suiteName, 'Form Navigation', 'Form fields not properly keyboard accessible');
    }
  }

  async testToolbarToggle(suiteName) {
    // Test accessibility toolbar toggle
    const toolbarButton = await this.page.$('button[aria-label*="přístupnost"], button[aria-label*="accessibility"]');

    if (!toolbarButton) {
      this.recordResult('failed', suiteName, 'Toolbar Toggle', 'Accessibility toolbar button not found');
      return;
    }

    // Test keyboard activation
    await toolbarButton.focus();
    await this.page.keyboard.press('Enter');

    const isExpanded = await this.page.evaluate(() => {
      const button = document.querySelector('button[aria-label*="přístupnost"], button[aria-label*="accessibility"]');
      return button?.getAttribute('aria-expanded') === 'true';
    });

    if (isExpanded) {
      this.recordResult('passed', suiteName, 'Toolbar Toggle', 'Accessibility toolbar toggles with keyboard');
    } else {
      this.recordResult('failed', suiteName, 'Toolbar Toggle', 'Toolbar does not toggle with keyboard');
    }
  }

  async testHighContrastToggle(suiteName) {
    // Test high contrast mode toggle
    const toolbarButton = await this.page.$('button[aria-label*="přístupnost"]');

    if (!toolbarButton) {
      this.recordResult('warning', suiteName, 'High Contrast Toggle', 'Accessibility toolbar not found');
      return;
    }

    // Open toolbar first
    await toolbarButton.focus();
    await this.page.keyboard.press('Enter');

    // Find high contrast button
    const highContrastButton = await this.page.$('button[aria-pressed]');

    if (!highContrastButton) {
      this.recordResult('failed', suiteName, 'High Contrast Toggle', 'High contrast button not found');
      return;
    }

    // Test toggle
    await highContrastButton.focus();
    await this.page.keyboard.press('Enter');

    const hasHighContrastClass = await this.page.evaluate(() => {
      return document.documentElement.classList.contains('high-contrast');
    });

    if (hasHighContrastClass) {
      this.recordResult('passed', suiteName, 'High Contrast Toggle', 'High contrast mode toggles with keyboard');
    } else {
      this.recordResult('failed', suiteName, 'High Contrast Toggle', 'High contrast mode does not toggle');
    }
  }

  async testSkipLinksFunctionality(suiteName) {
    // Test skip links actually work
    const skipLink = await this.page.$('a[href="#main-content"]');

    if (!skipLink) {
      this.recordResult('failed', suiteName, 'Skip Links Functionality', 'Skip to main content link not found');
      return;
    }

    // Focus and activate skip link
    await skipLink.focus();
    await this.page.keyboard.press('Enter');

    // Check if main content is focused
    const mainContentFocused = await this.page.evaluate(() => {
      const mainContent = document.getElementById('main-content');
      return document.activeElement === mainContent;
    });

    if (mainContentFocused) {
      this.recordResult('passed', suiteName, 'Skip Links Functionality', 'Skip links properly focus main content');
    } else {
      this.recordResult('failed', suiteName, 'Skip Links Functionality', 'Skip links do not focus main content');
    }
  }

  recordResult(status, suite, test, message) {
    const result = { status, suite, test, message, timestamp: new Date().toISOString() };
    this.results.details.push(result);

    switch (status) {
      case 'passed':
        this.results.passed++;
        console.log(`      ✅ ${test}: ${message}`);
        break;
      case 'failed':
        this.results.failed++;
        console.log(`      ❌ ${test}: ${message}`);
        break;
      case 'warning':
        this.results.warnings++;
        console.log(`      ⚠️  ${test}: ${message}`);
        break;
    }
  }

  async runAllTests() {
    await this.initialize();

    try {
      for (const testCase of KEYBOARD_TESTS) {
        await this.runTest(testCase);
        console.log(''); // Add spacing between test suites
      }

      this.printSummary();

    } finally {
      await this.cleanup();
    }
  }

  printSummary() {
    console.log('=' .repeat(60));
    console.log('📊 KEYBOARD NAVIGATION TEST SUMMARY');
    console.log('=' .repeat(60));
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`⚠️  Warnings: ${this.results.warnings}`);

    const total = this.results.passed + this.results.failed;
    const successRate = total > 0 ? ((this.results.passed / total) * 100).toFixed(1) : 0;
    console.log(`📈 Success Rate: ${successRate}%`);

    if (this.results.failed > 0) {
      console.log('\n🚨 FAILED TESTS:');
      this.results.details
        .filter(r => r.status === 'failed')
        .forEach(r => {
          console.log(`   • ${r.suite} - ${r.test}: ${r.message}`);
        });
    }

    if (this.results.warnings > 0) {
      console.log('\n⚠️  WARNINGS:');
      this.results.details
        .filter(r => r.status === 'warning')
        .forEach(r => {
          console.log(`   • ${r.suite} - ${r.test}: ${r.message}`);
        });
    }

    console.log('\n🎯 RECOMMENDATIONS:');
    console.log('   • Ensure all interactive elements are keyboard accessible');
    console.log('   • Implement proper focus management in modals and dropdowns');
    console.log('   • Provide clear focus indicators for all focusable elements');
    console.log('   • Test with actual screen readers for comprehensive validation');
    console.log('   • Consider implementing roving tabindex for complex widgets');

    // Exit with appropriate code
    if (this.results.failed > 0) {
      console.log('\n❌ Keyboard navigation tests failed!');
      process.exit(1);
    } else {
      console.log('\n✅ All keyboard navigation tests passed!');
      process.exit(0);
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new KeyboardNavigationTester();
  tester.runAllTests().catch(error => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = KeyboardNavigationTester;
