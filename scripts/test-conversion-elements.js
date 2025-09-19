#!/usr/bin/env node

/**
 * Conversion Optimization Elements Validation Script
 *
 * This script validates:
 * - CTA buttons display correctly with new text
 * - Trust-building elements and value propositions
 * - User journey from content to conversion points
 *
 * Requirements: 6.1, 6.2, 6.3
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Test results tracking
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function runTest(testName, testFunction) {
  totalTests++;
  try {
    const result = testFunction();
    if (result) {
      passedTests++;
      logSuccess(`${testName}`);
    } else {
      failedTests++;
      logError(`${testName}`);
    }
  } catch (error) {
    failedTests++;
    logError(`${testName} - ${error.message}`);
  }
}

// Load localization files
function loadMessages() {
  try {
    const csMessages = JSON.parse(fs.readFileSync(path.join(__dirname, '../messages/cs.json'), 'utf8'));
    const enMessages = JSON.parse(fs.readFileSync(path.join(__dirname, '../messages/en.json'), 'utf8'));
    return { cs: csMessages, en: enMessages };
  } catch (error) {
    throw new Error(`Failed to load messages: ${error.message}`);
  }
}

// Load homepage component
function loadHomepageComponent() {
  try {
    const homepageContent = fs.readFileSync(path.join(__dirname, '../src/app/[locale]/page.tsx'), 'utf8');
    return homepageContent;
  } catch (error) {
    throw new Error(`Failed to load homepage component: ${error.message}`);
  }
}

// Load ProductCard component
function loadProductCardComponent() {
  try {
    const productCardContent = fs.readFileSync(path.join(__dirname, '../src/components/product/ProductCard.tsx'), 'utf8');
    return productCardContent;
  } catch (error) {
    throw new Error(`Failed to load ProductCard component: ${error.message}`);
  }
}

function main() {
  log('🧪 Starting Conversion Optimization Elements Validation', 'bold');
  log('=' .repeat(60), 'blue');

  const messages = loadMessages();
  const homepageContent = loadHomepageComponent();
  const productCardContent = loadProductCardComponent();

  // Test 1: CTA Button Text Content (Czech)
  runTest('Czech CTA button text is empathetic and conversion-focused', () => {
    const ctaText = messages.cs.home.hero.cta;
    return ctaText === 'Vybrat věnec pro rozloučení' &&
           ctaText.includes('rozloučení') &&
           ctaText.length > 10; // Ensure it's descriptive
  });

  // Test 2: CTA Button Text Content (English)
  runTest('English CTA button text maintains empathetic tone', () => {
    const ctaText = messages.en.home.hero.cta;
    return ctaText === 'Choose a Wreath for Farewell' &&
           ctaText.includes('Farewell') &&
           ctaText.length > 10;
  });

  // Test 3: Hero Title is Dignified and Professional
  runTest('Hero title conveys dignity and professionalism (Czech)', () => {
    const heroTitle = messages.cs.home.hero.title;
    return heroTitle === 'Důstojné rozloučení s krásou květin' &&
           heroTitle.includes('Důstojné') &&
           heroTitle.includes('rozloučení');
  });

  // Test 4: Hero Title English Translation
  runTest('Hero title maintains dignity in English', () => {
    const heroTitle = messages.en.home.hero.title;
    return heroTitle === 'A Dignified Farewell with the Beauty of Flowers' &&
           heroTitle.includes('Dignified') &&
           heroTitle.includes('Farewell');
  });

  // Test 5: Trust-Building Benefits Content
  runTest('All four trust-building benefits are present (Czech)', () => {
    const benefits = messages.cs.home.benefits.items;
    return benefits.length === 4 &&
           benefits[0].title === 'Garance čerstvosti květin' &&
           benefits[1].title === 'Spolehlivé doručení na míru' &&
           benefits[2].title === 'Pečlivá ruční práce' &&
           benefits[3].title === 'Možnost personalizace';
  });

  // Test 6: Trust-Building Benefits English
  runTest('All four trust-building benefits are present (English)', () => {
    const benefits = messages.en.home.benefits.items;
    return benefits.length === 4 &&
           benefits[0].title === 'Fresh Flower Guarantee' &&
           benefits[1].title === 'Reliable Custom Delivery' &&
           benefits[2].title === 'Careful Handcrafted Work' &&
           benefits[3].title === 'Personalization Options';
  });

  // Test 7: Benefits Descriptions Include Trust Language
  runTest('Benefits descriptions include trust-building language (Czech)', () => {
    const benefits = messages.cs.home.benefits.items;
    return benefits[0].description.includes('Garantujeme') &&
           benefits[1].description.includes('Rozumíme naléhavosti') &&
           benefits[2].description.includes('s láskou a úctou') &&
           benefits[3].description.includes('osobní a významné');
  });

  // Test 8: Product Add to Cart Button Text
  runTest('Product "Add to Cart" button has correct text (Czech)', () => {
    const addToCartText = messages.cs.product.addToCart;
    return addToCartText === 'Přidat do košíku';
  });

  // Test 9: Product Add to Cart Button Text English
  runTest('Product "Add to Cart" button has correct text (English)', () => {
    const addToCartText = messages.en.product.addToCart;
    return addToCartText === 'Add to Cart';
  });

  // Test 10: Homepage Component Contains CTA Links
  runTest('Homepage component contains proper CTA link structure', () => {
    return homepageContent.includes('href={`/${locale}/products`}') &&
           homepageContent.includes('href={`/${locale}/contact`}') &&
           homepageContent.includes('{t("hero.cta")}') &&
           homepageContent.includes('{t("contactUs")}');
  });

  // Test 11: Homepage Component Has Proper Button Styling
  runTest('Homepage CTA buttons have conversion-optimized styling', () => {
    return homepageContent.includes('bg-primary-600') &&
           homepageContent.includes('hover:bg-primary-700') &&
           homepageContent.includes('text-white') &&
           homepageContent.includes('px-8 py-4') &&
           homepageContent.includes('shadow-elegant');
  });

  // Test 12: ProductCard Component Has Add to Cart Functionality
  runTest('ProductCard component implements Add to Cart functionality', () => {
    return productCardContent.includes('onAddToCart') &&
           productCardContent.includes('{t("addToCart")}') &&
           productCardContent.includes('onClick={() => onAddToCart(product)}') &&
           productCardContent.includes('product.availability.inStock');
  });

  // Test 13: ProductCard Component Shows Trust Signals
  runTest('ProductCard component displays trust-building elements', () => {
    return productCardContent.includes('availability') &&
           productCardContent.includes('inStock') &&
           productCardContent.includes('featured') &&
           productCardContent.includes('formatPrice');
  });

  // Test 14: SEO Metadata Includes Conversion Keywords
  runTest('SEO metadata includes conversion-focused keywords (Czech)', () => {
    const seoHome = messages.cs.seo.home;
    return seoHome.title.includes('Pohřební věnce') &&
           seoHome.description.includes('rychlým doručením') &&
           seoHome.keywords.includes('pohřební věnce') &&
           seoHome.keywords.includes('ruční výroba věnců');
  });

  // Test 15: SEO Metadata English Keywords
  runTest('SEO metadata includes conversion-focused keywords (English)', () => {
    const seoHome = messages.en.seo.home;
    return seoHome.title.includes('Funeral Wreaths') &&
           seoHome.description.includes('fast delivery') &&
           seoHome.keywords.includes('funeral wreaths') &&
           seoHome.keywords.includes('handcrafted wreaths');
  });

  // Test 16: Philosophy Section Content
  runTest('Philosophy section maintains empathetic tone', () => {
    const philosophy = messages.cs.home.philosophy;
    return philosophy.quote.includes('motýlí prach') &&
           philosophy.quote.includes('krása a láska zůstávají navždy') &&
           philosophy.text.includes('transformace');
  });

  // Test 17: Contact CTA Text
  runTest('Contact CTA uses appropriate language', () => {
    const contactText = messages.cs.home.contactUs;
    return contactText === 'Kontaktovat nás';
  });

  // Test 18: Features Section Value Propositions
  runTest('Features section includes key value propositions', () => {
    const features = messages.cs.home.features;
    return features.handcrafted.title === 'Ruční výroba' &&
           features.fastDelivery.title === 'Rychlé dodání' &&
           features.personalApproach.title === 'Osobní přístup';
  });

  // Test 19: Availability Status Messages
  runTest('Product availability messages build trust', () => {
    return messages.cs.product.inStock === 'Skladem' &&
           messages.cs.product.outOfStock === 'Není skladem' &&
           messages.cs.product.limitedStock === 'Omezené množství';
  });

  // Test 20: Currency Formatting
  runTest('Currency formatting is user-friendly', () => {
    return messages.cs.currency.format === '{amount} Kč' &&
           messages.en.currency.format === '{amount} CZK';
  });

  // Summary
  log('\n' + '=' .repeat(60), 'blue');
  log(`📊 Test Results Summary`, 'bold');
  log(`Total Tests: ${totalTests}`);
  logSuccess(`Passed: ${passedTests}`);
  if (failedTests > 0) {
    logError(`Failed: ${failedTests}`);
  }

  const successRate = ((passedTests / totalTests) * 100).toFixed(1);
  if (successRate >= 90) {
    logSuccess(`Success Rate: ${successRate}%`);
  } else if (successRate >= 70) {
    logWarning(`Success Rate: ${successRate}%`);
  } else {
    logError(`Success Rate: ${successRate}%`);
  }

  // Conversion optimization recommendations
  log('\n🎯 Conversion Optimization Analysis:', 'bold');

  if (passedTests >= 18) {
    logSuccess('Excellent: All major conversion elements are properly implemented');
  } else if (passedTests >= 15) {
    logWarning('Good: Most conversion elements are in place, minor improvements needed');
  } else {
    logError('Needs Improvement: Several conversion elements require attention');
  }

  // Exit with appropriate code
  process.exit(failedTests > 0 ? 1 : 0);
}

if (require.main === module) {
  main();
}

module.exports = { main, runTest, loadMessages };
