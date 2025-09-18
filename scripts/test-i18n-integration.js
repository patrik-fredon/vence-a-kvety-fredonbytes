#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * i18n Integration Compatibility Test
 * Tests that new content sections work with existing i18n system
 * Verifies content loading and ensures no breaking changes
 */

// Mock Next.js environment for testing
process.env.NODE_ENV = 'test';

async function testMessageLoading() {
  console.log('🔍 Testing message loading compatibility...');

  try {
    // Test loading Czech messages
    const csMessages = require('../messages/cs.json');
    console.log('✅ Czech messages loaded successfully');

    // Test loading English messages
    const enMessages = require('../messages/en.json');
    console.log('✅ English messages loaded successfully');

    return { valid: true, csMessages, enMessages };
  } catch (error) {
    console.log(`❌ Message loading failed: ${error.message}`);
    return { valid: false, error: error.message };
  }
}

function testNewContentSections(messages, language) {
  console.log(`\n🔍 Testing new content sections for ${language}...`);

  const newSections = [
    'home.hero',
    'home.philosophy',
    'home.benefits',
    'faq',
    'about',
    'seo'
  ];

  const results = [];

  newSections.forEach(sectionPath => {
    const keys = sectionPath.split('.');
    let current = messages;
    let exists = true;

    for (const key of keys) {
      if (current && typeof current === 'object' && current[key]) {
        current = current[key];
      } else {
        exists = false;
        break;
      }
    }

    if (exists) {
      console.log(`✅ ${sectionPath} - accessible`);
      results.push({ section: sectionPath, accessible: true });
    } else {
      console.log(`❌ ${sectionPath} - not accessible`);
      results.push({ section: sectionPath, accessible: false });
    }
  });

  const allAccessible = results.every(r => r.accessible);
  return { valid: allAccessible, results };
}

function testContentStructureCompatibility(messages, language) {
  console.log(`\n🔍 Testing content structure compatibility for ${language}...`);

  const tests = [
    {
      name: 'Hero section structure',
      test: () => {
        const hero = messages.home?.hero;
        return hero && hero.title && hero.subtitle && hero.description && hero.cta;
      }
    },
    {
      name: 'Benefits array structure',
      test: () => {
        const benefits = messages.home?.benefits;
        return benefits && benefits.title && Array.isArray(benefits.items) && benefits.items.length > 0;
      }
    },
    {
      name: 'FAQ array structure',
      test: () => {
        const faq = messages.faq;
        return faq && faq.title && Array.isArray(faq.items) && faq.items.length > 0;
      }
    },
    {
      name: 'SEO metadata structure',
      test: () => {
        const seo = messages.seo;
        return seo && seo.home && seo.products && seo.about && seo.faq;
      }
    },
    {
      name: 'About section structure',
      test: () => {
        const about = messages.about;
        return about && about.title && about.mission && about.story && about.values;
      }
    }
  ];

  const results = [];

  tests.forEach(({ name, test }) => {
    try {
      const passed = test();
      if (passed) {
        console.log(`✅ ${name} - compatible`);
        results.push({ test: name, passed: true });
      } else {
        console.log(`❌ ${name} - incompatible`);
        results.push({ test: name, passed: false });
      }
    } catch (error) {
      console.log(`❌ ${name} - error: ${error.message}`);
      results.push({ test: name, passed: false, error: error.message });
    }
  });

  const allPassed = results.every(r => r.passed);
  return { valid: allPassed, results };
}

function testExistingFunctionality(messages, language) {
  console.log(`\n🔍 Testing existing functionality preservation for ${language}...`);

  const existingSections = [
    'navigation',
    'common',
    'product',
    'cart',
    'checkout',
    'auth',
    'footer',
    'delivery'
  ];

  const results = [];

  existingSections.forEach(section => {
    if (messages[section] && typeof messages[section] === 'object') {
      console.log(`✅ ${section} - preserved`);
      results.push({ section, preserved: true });
    } else {
      console.log(`❌ ${section} - missing or corrupted`);
      results.push({ section, preserved: false });
    }
  });

  const allPreserved = results.every(r => r.preserved);
  return { valid: allPreserved, results };
}

function simulateReactComponentUsage(messages, language) {
  console.log(`\n🔍 Simulating React component usage for ${language}...`);

  const simulations = [
    {
      name: 'Hero component data access',
      simulate: () => {
        const hero = messages.home.hero;
        return {
          title: hero.title,
          subtitle: hero.subtitle,
          description: hero.description,
          cta: hero.cta
        };
      }
    },
    {
      name: 'Benefits list rendering',
      simulate: () => {
        const benefits = messages.home.benefits;
        return benefits.items.map(item => ({
          title: item.title,
          description: item.description
        }));
      }
    },
    {
      name: 'FAQ accordion data',
      simulate: () => {
        const faq = messages.faq;
        return {
          title: faq.title,
          items: faq.items.map(item => ({
            question: item.question,
            answer: item.answer
          }))
        };
      }
    },
    {
      name: 'SEO metadata extraction',
      simulate: () => {
        const seo = messages.seo.home;
        return {
          title: seo.title,
          description: seo.description,
          keywords: seo.keywords,
          openGraph: seo.openGraph
        };
      }
    }
  ];

  const results = [];

  simulations.forEach(({ name, simulate }) => {
    try {
      const result = simulate();
      if (result && (typeof result === 'object' || Array.isArray(result))) {
        console.log(`✅ ${name} - simulation successful`);
        results.push({ simulation: name, success: true, data: result });
      } else {
        console.log(`❌ ${name} - simulation failed`);
        results.push({ simulation: name, success: false });
      }
    } catch (error) {
      console.log(`❌ ${name} - error: ${error.message}`);
      results.push({ simulation: name, success: false, error: error.message });
    }
  });

  const allSuccessful = results.every(r => r.success);
  return { valid: allSuccessful, results };
}

async function main() {
  console.log('🚀 Starting i18n Integration Compatibility Testing\n');

  let allValid = true;
  const testResults = {};

  // Test message loading
  console.log('=' .repeat(50));
  console.log('MESSAGE LOADING TEST');
  console.log('=' .repeat(50));

  const loadingTest = await testMessageLoading();
  testResults.loading = loadingTest;

  if (!loadingTest.valid) {
    allValid = false;
    console.log('❌ Cannot proceed with further tests due to loading failure');
    process.exit(1);
  }

  const { csMessages, enMessages } = loadingTest;

  // Test Czech integration
  console.log('\n' + '=' .repeat(50));
  console.log('CZECH i18n INTEGRATION TESTS');
  console.log('=' .repeat(50));

  testResults.cs = {
    sections: testNewContentSections(csMessages, 'Czech'),
    structure: testContentStructureCompatibility(csMessages, 'Czech'),
    existing: testExistingFunctionality(csMessages, 'Czech'),
    simulation: simulateReactComponentUsage(csMessages, 'Czech')
  };

  // Test English integration
  console.log('\n' + '=' .repeat(50));
  console.log('ENGLISH i18n INTEGRATION TESTS');
  console.log('=' .repeat(50));

  testResults.en = {
    sections: testNewContentSections(enMessages, 'English'),
    structure: testContentStructureCompatibility(enMessages, 'English'),
    existing: testExistingFunctionality(enMessages, 'English'),
    simulation: simulateReactComponentUsage(enMessages, 'English')
  };

  // Check all test results
  const allTestResults = [
    testResults.cs.sections.valid,
    testResults.cs.structure.valid,
    testResults.cs.existing.valid,
    testResults.cs.simulation.valid,
    testResults.en.sections.valid,
    testResults.en.structure.valid,
    testResults.en.existing.valid,
    testResults.en.simulation.valid
  ];

  allValid = allTestResults.every(result => result === true);

  // Final summary
  console.log('\n' + '=' .repeat(50));
  console.log('i18n INTEGRATION TEST SUMMARY');
  console.log('=' .repeat(50));

  if (allValid) {
    console.log('🎉 All i18n integration tests passed!');
    console.log('✅ New content sections are accessible');
    console.log('✅ Content structure is compatible');
    console.log('✅ Existing functionality is preserved');
    console.log('✅ React component simulation successful');
    console.log('✅ No breaking changes detected');
    process.exit(0);
  } else {
    console.log('❌ Some i18n integration tests failed. Please review the issues above.');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  testMessageLoading,
  testNewContentSections,
  testContentStructureCompatibility,
  testExistingFunctionality,
  simulateReactComponentUsage
};
