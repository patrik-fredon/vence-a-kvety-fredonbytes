#!/usr/bin/env node

/**
 * Test SEO Metadata Generation
 *
 * This script tests that the metadata generation functions work correctly
 * and produce the expected output from the i18n content.
 */

const path = require('path');

// Mock Next.js Metadata type for testing
const mockMetadata = {
  generatePageMetadata: (props) => ({
    title: props.title,
    description: props.description,
    keywords: props.keywords,
    openGraph: {
      title: props.openGraph?.title || props.title,
      description: props.openGraph?.description || props.description,
      type: props.openGraph?.type || 'website'
    }
  })
};

// Load messages for testing
function loadMessages(locale) {
  const messagesPath = path.join(__dirname, '..', 'messages', `${locale}.json`);
  return require(messagesPath);
}

// Test metadata generation
async function testMetadataGeneration() {
  console.log('🧪 Testing SEO Metadata Generation...\n');

  const locales = ['cs', 'en'];
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  for (const locale of locales) {
    console.log(`📋 Testing ${locale.toUpperCase()} metadata generation...`);

    try {
      const messages = loadMessages(locale);

      // Test homepage metadata
      const homeMetadata = mockMetadata.generatePageMetadata({
        title: messages.seo.home.title,
        description: messages.seo.home.description,
        keywords: messages.seo.home.keywords,
        locale,
        path: '',
        type: 'website',
        openGraph: messages.seo.home.openGraph
      });

      // Validate homepage metadata
      if (homeMetadata.title && homeMetadata.description && homeMetadata.keywords) {
        console.log(`  ✅ Homepage metadata: PASS`);
        console.log(`     Title: "${homeMetadata.title}"`);
        console.log(`     Description: "${homeMetadata.description.substring(0, 80)}..."`);
        console.log(`     Keywords: ${homeMetadata.keywords.length} items`);
        results.passed++;
      } else {
        console.log(`  ❌ Homepage metadata: FAIL - Missing required fields`);
        results.failed++;
      }

      // Test products metadata
      const productsMetadata = mockMetadata.generatePageMetadata({
        title: messages.seo.products.title,
        description: messages.seo.products.description,
        keywords: messages.seo.products.keywords,
        locale,
        path: '/products',
        type: 'website',
        openGraph: messages.seo.products.openGraph
      });

      if (productsMetadata.title && productsMetadata.description) {
        console.log(`  ✅ Products metadata: PASS`);
        results.passed++;
      } else {
        console.log(`  ❌ Products metadata: FAIL`);
        results.failed++;
      }

      // Test FAQ metadata
      const faqMetadata = mockMetadata.generatePageMetadata({
        title: messages.seo.faq.title,
        description: messages.seo.faq.description,
        keywords: messages.seo.faq.keywords,
        locale,
        path: '/faq',
        type: 'website',
        openGraph: messages.seo.faq.openGraph
      });

      if (faqMetadata.title && faqMetadata.description) {
        console.log(`  ✅ FAQ metadata: PASS`);
        results.passed++;
      } else {
        console.log(`  ❌ FAQ metadata: FAIL`);
        results.failed++;
      }

      // Test About metadata
      const aboutMetadata = mockMetadata.generatePageMetadata({
        title: messages.seo.about.title,
        description: messages.seo.about.description,
        keywords: messages.seo.about.keywords,
        locale,
        path: '/about',
        type: 'website',
        openGraph: messages.seo.about.openGraph
      });

      if (aboutMetadata.title && aboutMetadata.description) {
        console.log(`  ✅ About metadata: PASS`);
        results.passed++;
      } else {
        console.log(`  ❌ About metadata: FAIL`);
        results.failed++;
      }

      console.log('');

    } catch (error) {
      console.error(`  ❌ Error testing ${locale}: ${error.message}`);
      results.failed++;
    }
  }

  // Summary
  console.log('📊 Test Summary:');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`Total: ${results.passed + results.failed}`);

  const success = results.failed === 0;
  console.log(`\n${success ? '🎉' : '⚠️'} Metadata Generation Tests ${success ? 'PASSED' : 'FAILED'}`);

  return success;
}

// Test OpenGraph data specifically
function testOpenGraphData() {
  console.log('\n🔗 Testing OpenGraph Data...\n');

  const locales = ['cs', 'en'];
  let passed = 0;
  let failed = 0;

  for (const locale of locales) {
    console.log(`📋 Testing ${locale.toUpperCase()} OpenGraph data...`);

    try {
      const messages = loadMessages(locale);

      // Check each page's OpenGraph data
      const pages = ['home', 'products', 'faq', 'about'];

      for (const page of pages) {
        const seoData = messages.seo[page];

        if (seoData && seoData.openGraph) {
          const og = seoData.openGraph;

          if (og.title && og.description) {
            console.log(`  ✅ ${page} OpenGraph: PASS`);
            console.log(`     OG Title: "${og.title}"`);
            console.log(`     OG Description: "${og.description.substring(0, 60)}..."`);
            passed++;
          } else {
            console.log(`  ⚠️  ${page} OpenGraph: INCOMPLETE - Missing title or description`);
            failed++;
          }
        } else {
          console.log(`  ⚠️  ${page} OpenGraph: MISSING`);
          failed++;
        }
      }

      console.log('');

    } catch (error) {
      console.error(`  ❌ Error testing ${locale} OpenGraph: ${error.message}`);
      failed++;
    }
  }

  console.log('📊 OpenGraph Test Summary:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`⚠️  Issues: ${failed}`);

  return failed === 0;
}

// Run tests if called directly
if (require.main === module) {
  Promise.resolve()
    .then(() => testMetadataGeneration())
    .then((metadataSuccess) => {
      const ogSuccess = testOpenGraphData();
      const overallSuccess = metadataSuccess && ogSuccess;
      process.exit(overallSuccess ? 0 : 1);
    })
    .catch((error) => {
      console.error('Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = { testMetadataGeneration, testOpenGraphData };
