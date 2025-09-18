#!/usr/bin/env node

/**
 * SEO Optimization Validation Script
 *
 * This script validates:
 * 1. Meta tag implementation across all pages
 * 2. Keyword density and placement
 * 3. OpenGraph data for social media sharing
 * 4. Structured data implementation
 */

const fs = require('fs');
const path = require('path');

// Load i18n messages
function loadMessages(locale) {
  const messagesPath = path.join(__dirname, '..', 'messages', `${locale}.json`);
  return JSON.parse(fs.readFileSync(messagesPath, 'utf8'));
}

// Validate SEO content structure
function validateSEOContent(messages, locale) {
  const results = {
    locale,
    passed: 0,
    failed: 0,
    warnings: 0,
    details: []
  };

  function addResult(type, test, status, message) {
    results.details.push({ type, test, status, message });
    if (status === 'PASS') results.passed++;
    else if (status === 'FAIL') results.failed++;
    else if (status === 'WARN') results.warnings++;
  }

  // Check if SEO section exists
  if (!messages.seo) {
    addResult('Structure', 'SEO section exists', 'FAIL', 'Missing seo section in messages');
    return results;
  }

  // Validate home page SEO
  if (messages.seo.home) {
    const home = messages.seo.home;

    // Title validation
    if (home.title && home.title.length >= 30 && home.title.length <= 60) {
      addResult('Home', 'Title length optimal', 'PASS', `Title: ${home.title.length} chars`);
    } else {
      addResult('Home', 'Title length optimal', 'WARN', `Title: ${home.title?.length || 0} chars (optimal: 30-60)`);
    }

    // Description validation
    if (home.description && home.description.length >= 120 && home.description.length <= 160) {
      addResult('Home', 'Description length optimal', 'PASS', `Description: ${home.description.length} chars`);
    } else {
      addResult('Home', 'Description length optimal', 'WARN', `Description: ${home.description?.length || 0} chars (optimal: 120-160)`);
    }

    // Keywords validation
    if (home.keywords && Array.isArray(home.keywords) && home.keywords.length >= 5) {
      addResult('Home', 'Keywords present', 'PASS', `${home.keywords.length} keywords found`);
    } else {
      addResult('Home', 'Keywords present', 'FAIL', `Only ${home.keywords?.length || 0} keywords (minimum: 5)`);
    }

    // OpenGraph validation
    if (home.openGraph && home.openGraph.title && home.openGraph.description) {
      addResult('Home', 'OpenGraph data complete', 'PASS', 'Title and description present');
    } else {
      addResult('Home', 'OpenGraph data complete', 'FAIL', 'Missing OpenGraph title or description');
    }
  } else {
    addResult('Home', 'SEO data exists', 'FAIL', 'Missing home SEO data');
  }

  // Validate products page SEO
  if (messages.seo.products) {
    const products = messages.seo.products;

    if (products.title && products.description && products.keywords) {
      addResult('Products', 'SEO data complete', 'PASS', 'All required fields present');
    } else {
      addResult('Products', 'SEO data complete', 'FAIL', 'Missing required SEO fields');
    }

    if (products.openGraph) {
      addResult('Products', 'OpenGraph data present', 'PASS', 'OpenGraph data found');
    } else {
      addResult('Products', 'OpenGraph data present', 'WARN', 'OpenGraph data missing');
    }
  } else {
    addResult('Products', 'SEO data exists', 'FAIL', 'Missing products SEO data');
  }

  // Validate FAQ page SEO
  if (messages.seo.faq) {
    const faq = messages.seo.faq;

    if (faq.title && faq.description && faq.keywords) {
      addResult('FAQ', 'SEO data complete', 'PASS', 'All required fields present');
    } else {
      addResult('FAQ', 'SEO data complete', 'FAIL', 'Missing required SEO fields');
    }
  } else {
    addResult('FAQ', 'SEO data exists', 'FAIL', 'Missing FAQ SEO data');
  }

  // Validate About page SEO
  if (messages.seo.about) {
    const about = messages.seo.about;

    if (about.title && about.description && about.keywords) {
      addResult('About', 'SEO data complete', 'PASS', 'All required fields present');
    } else {
      addResult('About', 'SEO data complete', 'FAIL', 'Missing required SEO fields');
    }
  } else {
    addResult('About', 'SEO data exists', 'FAIL', 'Missing About SEO data');
  }

  return results;
}

// Validate keyword density in content
function validateKeywordDensity(messages, locale) {
  const results = {
    locale,
    keywords: {},
    density: {},
    recommendations: []
  };

  const targetKeywords = locale === 'cs'
    ? ['pohřební věnce', 'květinové aranžmá', 'rozloučení', 'věnce', 'pohřeb']
    : ['funeral wreaths', 'floral arrangements', 'farewell', 'wreaths', 'funeral'];

  // Collect all text content
  let allContent = '';

  function collectText(obj) {
    if (typeof obj === 'string') {
      allContent += ' ' + obj.toLowerCase();
    } else if (typeof obj === 'object' && obj !== null) {
      Object.values(obj).forEach(collectText);
    }
  }

  // Collect content from home, about, and faq sections
  if (messages.home) collectText(messages.home);
  if (messages.about) collectText(messages.about);
  if (messages.faq) collectText(messages.faq);

  const totalWords = allContent.split(/\s+/).filter(word => word.length > 0).length;

  // Calculate keyword density
  targetKeywords.forEach(keyword => {
    const regex = new RegExp(keyword.toLowerCase(), 'gi');
    const matches = allContent.match(regex) || [];
    const density = (matches.length / totalWords) * 100;

    results.keywords[keyword] = matches.length;
    results.density[keyword] = density.toFixed(2) + '%';

    // Recommendations based on density
    if (density < 0.5) {
      results.recommendations.push(`Consider increasing usage of "${keyword}" (current: ${density.toFixed(2)}%)`);
    } else if (density > 3) {
      results.recommendations.push(`Consider reducing usage of "${keyword}" to avoid keyword stuffing (current: ${density.toFixed(2)}%)`);
    }
  });

  return results;
}

// Check if page components use SEO metadata
function validatePageComponents() {
  const results = {
    pages: [],
    passed: 0,
    failed: 0
  };

  const pagesToCheck = [
    { name: 'Homepage', path: 'src/app/[locale]/page.tsx' },
    { name: 'Products', path: 'src/app/[locale]/products/page.tsx' },
    { name: 'FAQ', path: 'src/app/[locale]/faq/page.tsx' },
    { name: 'About', path: 'src/app/[locale]/about/page.tsx' }
  ];

  pagesToCheck.forEach(page => {
    const fullPath = path.join(__dirname, '..', page.path);

    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');

      const hasGenerateMetadata = content.includes('generateMetadata');
      const hasStructuredData = content.includes('StructuredData');
      const hasOpenGraph = content.includes('openGraph') || content.includes('OpenGraph');

      const pageResult = {
        name: page.name,
        path: page.path,
        hasGenerateMetadata,
        hasStructuredData,
        hasOpenGraph,
        status: hasGenerateMetadata && hasStructuredData ? 'PASS' : 'FAIL'
      };

      results.pages.push(pageResult);

      if (pageResult.status === 'PASS') {
        results.passed++;
      } else {
        results.failed++;
      }
    } else {
      results.pages.push({
        name: page.name,
        path: page.path,
        status: 'FAIL',
        error: 'File not found'
      });
      results.failed++;
    }
  });

  return results;
}

// Main validation function
function runSEOValidation() {
  console.log('🔍 Starting SEO Optimization Validation...\n');

  const locales = ['cs', 'en'];
  const allResults = {
    seoContent: {},
    keywordDensity: {},
    pageComponents: null,
    summary: {
      totalTests: 0,
      passed: 0,
      failed: 0,
      warnings: 0
    }
  };

  // Validate SEO content for each locale
  locales.forEach(locale => {
    console.log(`📋 Validating ${locale.toUpperCase()} SEO content...`);

    try {
      const messages = loadMessages(locale);
      const seoResults = validateSEOContent(messages, locale);
      const keywordResults = validateKeywordDensity(messages, locale);

      allResults.seoContent[locale] = seoResults;
      allResults.keywordDensity[locale] = keywordResults;

      allResults.summary.totalTests += seoResults.passed + seoResults.failed + seoResults.warnings;
      allResults.summary.passed += seoResults.passed;
      allResults.summary.failed += seoResults.failed;
      allResults.summary.warnings += seoResults.warnings;

      // Print results for this locale
      console.log(`  ✅ Passed: ${seoResults.passed}`);
      console.log(`  ❌ Failed: ${seoResults.failed}`);
      console.log(`  ⚠️  Warnings: ${seoResults.warnings}`);

      if (seoResults.failed > 0) {
        console.log('  Failed tests:');
        seoResults.details
          .filter(d => d.status === 'FAIL')
          .forEach(d => console.log(`    - ${d.type}: ${d.test} - ${d.message}`));
      }

      if (keywordResults.recommendations.length > 0) {
        console.log('  Keyword recommendations:');
        keywordResults.recommendations.forEach(rec => console.log(`    - ${rec}`));
      }

      console.log('');
    } catch (error) {
      console.error(`❌ Error validating ${locale}: ${error.message}\n`);
      allResults.summary.failed++;
    }
  });

  // Validate page components
  console.log('🔧 Validating page components...');
  const componentResults = validatePageComponents();
  allResults.pageComponents = componentResults;

  console.log(`  ✅ Pages with proper SEO: ${componentResults.passed}`);
  console.log(`  ❌ Pages missing SEO: ${componentResults.failed}`);

  if (componentResults.failed > 0) {
    console.log('  Pages with issues:');
    componentResults.pages
      .filter(p => p.status === 'FAIL')
      .forEach(p => {
        console.log(`    - ${p.name}: ${p.error || 'Missing generateMetadata or StructuredData'}`);
      });
  }

  // Final summary
  console.log('\n📊 Final Summary:');
  console.log(`Total tests: ${allResults.summary.totalTests + componentResults.passed + componentResults.failed}`);
  console.log(`✅ Passed: ${allResults.summary.passed + componentResults.passed}`);
  console.log(`❌ Failed: ${allResults.summary.failed + componentResults.failed}`);
  console.log(`⚠️  Warnings: ${allResults.summary.warnings}`);

  const overallSuccess = (allResults.summary.failed + componentResults.failed) === 0;
  console.log(`\n${overallSuccess ? '🎉' : '⚠️'} SEO Validation ${overallSuccess ? 'PASSED' : 'COMPLETED WITH ISSUES'}`);

  // Save detailed results to file
  const resultsPath = path.join(__dirname, '..', 'seo-validation-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(allResults, null, 2));
  console.log(`\n📄 Detailed results saved to: ${resultsPath}`);

  return overallSuccess;
}

// Run validation if called directly
if (require.main === module) {
  const success = runSEOValidation();
  process.exit(success ? 0 : 1);
}

module.exports = { runSEOValidation, validateSEOContent, validateKeywordDensity, validatePageComponents };
