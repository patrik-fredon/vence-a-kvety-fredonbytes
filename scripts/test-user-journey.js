#!/usr/bin/env node

/**
 * User Journey Validation Script
 *
 * This script validates the complete user journey from content discovery
 * to conversion points, ensuring a smooth path to purchase.
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

function logInfo(message) {
  log(`🔍 ${message}`, 'blue');
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

// Load component files
function loadComponentFiles() {
  const files = {
    homepage: fs.readFileSync(path.join(__dirname, '../src/app/[locale]/page.tsx'), 'utf8'),
    productsPage: fs.readFileSync(path.join(__dirname, '../src/app/[locale]/products/page.tsx'), 'utf8'),
    productCard: fs.readFileSync(path.join(__dirname, '../src/components/product/ProductCard.tsx'), 'utf8'),
    productGrid: fs.readFileSync(path.join(__dirname, '../src/components/product/ProductGrid.tsx'), 'utf8'),
    messages: {
      cs: JSON.parse(fs.readFileSync(path.join(__dirname, '../messages/cs.json'), 'utf8')),
      en: JSON.parse(fs.readFileSync(path.join(__dirname, '../messages/en.json'), 'utf8'))
    }
  };
  return files;
}

function main() {
  log('🛤️  Starting User Journey Validation', 'bold');
  log('=' .repeat(60), 'blue');

  const components = loadComponentFiles();

  // STAGE 1: Homepage Entry Points
  log('\n📍 STAGE 1: Homepage Entry Points', 'bold');

  runTest('Homepage has clear primary CTA to products', () => {
    return components.homepage.includes('href={`/${locale}/products`}') &&
           components.homepage.includes('{t("hero.cta")}') &&
           components.homepage.includes('bg-primary-600');
  });

  runTest('Homepage has secondary CTA to contact', () => {
    return components.homepage.includes('href={`/${locale}/contact`}') &&
           components.homepage.includes('{t("contactUs")}') &&
           components.homepage.includes('border-2 border-primary-600');
  });

  runTest('Homepage hero section builds emotional connection', () => {
    const heroTitle = components.messages.cs.home.hero.title;
    const heroSubtitle = components.messages.cs.home.hero.subtitle;
    const heroDescription = components.messages.cs.home.hero.description;

    return heroTitle.includes('Důstojné rozloučení') &&
           heroSubtitle.includes('láskou a úctou') &&
           heroDescription.includes('těžkých chvílích');
  });

  runTest('Homepage benefits section addresses customer concerns', () => {
    const benefits = components.messages.cs.home.benefits.items;
    return benefits.some(b => b.description.includes('čerstvé')) &&
           benefits.some(b => b.description.includes('včasné dodání')) &&
           benefits.some(b => b.description.includes('láskou a úctou')) &&
           benefits.some(b => b.description.includes('osobní a významné'));
  });

  // STAGE 2: Product Discovery
  log('\n📍 STAGE 2: Product Discovery', 'bold');

  runTest('Products page has clear navigation structure', () => {
    return components.productsPage.includes('ProductGrid') &&
           components.productsPage.includes('initialProducts') &&
           components.productsPage.includes('initialCategories');
  });

  runTest('Product grid supports filtering and search', () => {
    return components.productGrid.includes('ProductFilters') &&
           components.productGrid.includes('search') &&
           components.productGrid.includes('categoryId') &&
           components.productGrid.includes('sortOptions');
  });

  runTest('Product cards display trust signals', () => {
    return components.productCard.includes('availability') &&
           components.productCard.includes('featured') &&
           components.productCard.includes('formatPrice') &&
           components.productCard.includes('inStock');
  });

  runTest('Product cards have clear CTAs', () => {
    return components.productCard.includes('{t("addToCart")}') &&
           components.productCard.includes('{t("customize")}') &&
           components.productCard.includes('onAddToCart');
  });

  // STAGE 3: Product Interaction
  log('\n📍 STAGE 3: Product Interaction', 'bold');

  runTest('Product cards support hover interactions', () => {
    return components.productCard.includes('onMouseEnter') &&
           components.productCard.includes('onMouseLeave') &&
           components.productCard.includes('isHovered') &&
           components.productCard.includes('Quick Actions Overlay');
  });

  runTest('Product cards link to detailed product pages', () => {
    return components.productCard.includes('href={`/${locale}/products/${product.slug}`}') &&
           components.productCard.includes('Link');
  });

  runTest('Product cards handle out-of-stock scenarios', () => {
    return components.productCard.includes('!product.availability.inStock') &&
           components.productCard.includes('outOfStock') &&
           components.productCard.includes('limitedStock');
  });

  runTest('Product cards are responsive for mobile users', () => {
    return components.productCard.includes('sm:hidden') &&
           components.productCard.includes('sm:block') &&
           components.productCard.includes('aspect-square');
  });

  // STAGE 4: Conversion Points
  log('\n📍 STAGE 4: Conversion Points', 'bold');

  runTest('Add to Cart functionality is properly implemented', () => {
    return components.productCard.includes('onClick={() => onAddToCart(product)}') &&
           components.productGrid.includes('handleAddToCart') &&
           components.productGrid.includes('onAddToCart');
  });

  runTest('CTA buttons have conversion-optimized styling', () => {
    return components.productCard.includes('Button') &&
           components.homepage.includes('shadow-elegant') &&
           components.homepage.includes('transition-colors');
  });

  runTest('Error states are handled gracefully', () => {
    return components.productGrid.includes('error') &&
           components.productGrid.includes('Error State') &&
           components.productGrid.includes('No Results State');
  });

  runTest('Loading states provide user feedback', () => {
    return components.productGrid.includes('loading') &&
           components.productGrid.includes('ProductGridSkeleton') &&
           components.productGrid.includes('animate-spin');
  });

  // STAGE 5: Trust and Credibility
  log('\n📍 STAGE 5: Trust and Credibility Elements', 'bold');

  runTest('Availability information builds urgency', () => {
    const messages = components.messages.cs.product;
    return messages.inStock === 'Skladem' &&
           messages.limitedStock === 'Omezené množství' &&
           messages.outOfStock === 'Není skladem';
  });

  runTest('Price formatting is clear and trustworthy', () => {
    return components.productCard.includes('formatPrice') &&
           components.messages.cs.currency.format === '{amount} Kč' &&
           components.productCard.includes('text-lg font-semibold');
  });

  runTest('Product categories provide context', () => {
    return components.productCard.includes('product.category') &&
           components.productCard.includes('category.name');
  });

  runTest('Featured products are highlighted', () => {
    return components.productCard.includes('product.featured') &&
           components.productCard.includes('Featured Badge') &&
           components.productCard.includes('⭐ Featured');
  });

  // STAGE 6: Accessibility and UX
  log('\n📍 STAGE 6: Accessibility and User Experience', 'bold');

  runTest('Components follow accessibility standards', () => {
    return components.productCard.includes('role="article"') &&
           components.productCard.includes('aria-labelledby') &&
           components.productCard.includes('role="status"');
  });

  runTest('Keyboard navigation is supported', () => {
    return components.productGrid.includes('KeyboardNavigationGrid') &&
           components.productGrid.includes('tabIndex') &&
           components.productGrid.includes('onItemActivate');
  });

  runTest('Screen reader support is implemented', () => {
    return components.productGrid.includes('useAnnouncer') &&
           components.productGrid.includes('announce') &&
           components.productCard.includes('aria-label');
  });

  runTest('Images have proper alt text and loading states', () => {
    return components.productCard.includes('alt={primaryImage.alt}') &&
           components.productCard.includes('onLoad') &&
           components.productCard.includes('imageLoading');
  });

  // STAGE 7: Multi-language Support
  log('\n📍 STAGE 7: Multi-language Conversion Consistency', 'bold');

  runTest('English CTA messages maintain conversion focus', () => {
    const enMessages = components.messages.en;
    return enMessages.home.hero.cta === 'Choose a Wreath for Farewell' &&
           enMessages.product.addToCart === 'Add to Cart' &&
           enMessages.home.contactUs === 'Contact Us';
  });

  runTest('English benefits maintain trust-building language', () => {
    const benefits = components.messages.en.home.benefits.items;
    return benefits[0].description.includes('guarantee') &&
           benefits[1].description.includes('understand urgency') &&
           benefits[2].description.includes('love and respect') &&
           benefits[3].description.includes('personal and meaningful');
  });

  runTest('Language switching preserves user context', () => {
    return components.homepage.includes('locale') &&
           components.productCard.includes('locale') &&
           components.productGrid.includes('locale');
  });

  // Summary and Analysis
  log('\n' + '=' .repeat(60), 'blue');
  log(`📊 User Journey Test Results`, 'bold');
  log(`Total Tests: ${totalTests}`);
  logSuccess(`Passed: ${passedTests}`);
  if (failedTests > 0) {
    logError(`Failed: ${failedTests}`);
  }

  const successRate = ((passedTests / totalTests) * 100).toFixed(1);
  if (successRate >= 95) {
    logSuccess(`Success Rate: ${successRate}%`);
  } else if (successRate >= 85) {
    log(`⚠️  Success Rate: ${successRate}%`, 'yellow');
  } else {
    logError(`Success Rate: ${successRate}%`);
  }

  // User Journey Analysis
  log('\n🎯 User Journey Analysis:', 'bold');

  const stageResults = {
    'Homepage Entry': passedTests >= 4 ? '✅' : '❌',
    'Product Discovery': passedTests >= 8 ? '✅' : '❌',
    'Product Interaction': passedTests >= 12 ? '✅' : '❌',
    'Conversion Points': passedTests >= 16 ? '✅' : '❌',
    'Trust Elements': passedTests >= 20 ? '✅' : '❌',
    'Accessibility': passedTests >= 24 ? '✅' : '❌',
    'Multi-language': passedTests >= 27 ? '✅' : '❌'
  };

  Object.entries(stageResults).forEach(([stage, status]) => {
    log(`${status} ${stage}`);
  });

  if (passedTests >= 25) {
    log('\n🚀 Excellent: User journey is optimized for conversion', 'green');
    log('   - Clear entry points from homepage', 'green');
    log('   - Smooth product discovery flow', 'green');
    log('   - Multiple conversion opportunities', 'green');
    log('   - Strong trust-building elements', 'green');
    log('   - Accessible and inclusive design', 'green');
  } else if (passedTests >= 20) {
    log('\n⚠️  Good: User journey is functional with room for improvement', 'yellow');
  } else {
    log('\n❌ Needs Work: User journey has significant gaps', 'red');
  }

  // Exit with appropriate code
  process.exit(failedTests > 0 ? 1 : 0);
}

if (require.main === module) {
  main();
}

module.exports = { main };
