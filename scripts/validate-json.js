#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * JSON Structure Validation Script
 * Validates both cs.json and en.json files for:
 * - JSON syntax errors
 * - Required field completion
 * - Proper nesting structure
 * - Content completeness and consistency
 */

const REQUIRED_SECTIONS = [
  'navigation',
  'common',
  'product',
  'cart',
  'checkout',
  'auth',
  'footer',
  'delivery',
  'meta',
  'seo',
  'currency',
  'date',
  'home',
  'faq',
  'about',
  'gdpr',
  'accessibility'
];

const REQUIRED_HOME_SUBSECTIONS = [
  'hero',
  'philosophy',
  'benefits'
];

const REQUIRED_SEO_PAGES = [
  'home',
  'products',
  'about',
  'faq'
];

function validateJSONSyntax(filePath) {
  console.log(`\n🔍 Validating JSON syntax: ${filePath}`);

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(content);
    console.log(`✅ Valid JSON syntax`);
    return { valid: true, data: parsed };
  } catch (error) {
    console.log(`❌ JSON syntax error: ${error.message}`);
    return { valid: false, error: error.message };
  }
}

function validateRequiredSections(data, language) {
  console.log(`\n🔍 Validating required sections for ${language}`);

  const missing = [];
  const present = [];

  REQUIRED_SECTIONS.forEach(section => {
    if (data[section]) {
      present.push(section);
    } else {
      missing.push(section);
    }
  });

  console.log(`✅ Present sections (${present.length}): ${present.join(', ')}`);

  if (missing.length > 0) {
    console.log(`❌ Missing sections (${missing.length}): ${missing.join(', ')}`);
    return { valid: false, missing };
  }

  return { valid: true, present };
}

function validateHomeSection(data, language) {
  console.log(`\n🔍 Validating home section structure for ${language}`);

  if (!data.home) {
    console.log(`❌ Home section missing`);
    return { valid: false, error: 'Home section missing' };
  }

  const missing = [];
  const present = [];

  REQUIRED_HOME_SUBSECTIONS.forEach(subsection => {
    if (data.home[subsection]) {
      present.push(subsection);
    } else {
      missing.push(subsection);
    }
  });

  console.log(`✅ Present home subsections: ${present.join(', ')}`);

  if (missing.length > 0) {
    console.log(`❌ Missing home subsections: ${missing.join(', ')}`);
    return { valid: false, missing };
  }

  // Validate hero section structure
  const hero = data.home.hero;
  const requiredHeroFields = ['title', 'subtitle', 'description', 'cta'];
  const missingHeroFields = requiredHeroFields.filter(field => !hero[field]);

  if (missingHeroFields.length > 0) {
    console.log(`❌ Missing hero fields: ${missingHeroFields.join(', ')}`);
    return { valid: false, missing: missingHeroFields };
  }

  // Validate benefits section structure
  const benefits = data.home.benefits;
  if (!benefits.title || !benefits.items || !Array.isArray(benefits.items)) {
    console.log(`❌ Benefits section missing title or items array`);
    return { valid: false, error: 'Benefits section structure invalid' };
  }

  if (benefits.items.length === 0) {
    console.log(`❌ Benefits items array is empty`);
    return { valid: false, error: 'Benefits items array is empty' };
  }

  // Validate each benefit item
  benefits.items.forEach((item, index) => {
    if (!item.title || !item.description) {
      console.log(`❌ Benefit item ${index + 1} missing title or description`);
      return { valid: false, error: `Benefit item ${index + 1} incomplete` };
    }
  });

  console.log(`✅ Home section structure valid`);
  return { valid: true };
}

function validateSEOSection(data, language) {
  console.log(`\n🔍 Validating SEO section for ${language}`);

  if (!data.seo) {
    console.log(`❌ SEO section missing`);
    return { valid: false, error: 'SEO section missing' };
  }

  const missing = [];
  const present = [];

  REQUIRED_SEO_PAGES.forEach(page => {
    if (data.seo[page]) {
      present.push(page);

      // Validate required SEO fields
      const seoPage = data.seo[page];
      const requiredFields = ['title', 'description', 'keywords'];
      const missingFields = requiredFields.filter(field => !seoPage[field]);

      if (missingFields.length > 0) {
        console.log(`❌ SEO page ${page} missing fields: ${missingFields.join(', ')}`);
        return { valid: false, missing: missingFields };
      }

      // Validate keywords array
      if (!Array.isArray(seoPage.keywords) || seoPage.keywords.length === 0) {
        console.log(`❌ SEO page ${page} keywords must be non-empty array`);
        return { valid: false, error: `${page} keywords invalid` };
      }

      // Validate character limits for SEO optimization
      if (seoPage.title.length > 60) {
        console.log(`⚠️  SEO title for ${page} exceeds 60 characters (${seoPage.title.length})`);
      }

      if (seoPage.description.length > 160) {
        console.log(`⚠️  SEO description for ${page} exceeds 160 characters (${seoPage.description.length})`);
      }

    } else {
      missing.push(page);
    }
  });

  console.log(`✅ Present SEO pages: ${present.join(', ')}`);

  if (missing.length > 0) {
    console.log(`❌ Missing SEO pages: ${missing.join(', ')}`);
    return { valid: false, missing };
  }

  return { valid: true };
}

function validateFAQSection(data, language) {
  console.log(`\n🔍 Validating FAQ section for ${language}`);

  if (!data.faq) {
    console.log(`❌ FAQ section missing`);
    return { valid: false, error: 'FAQ section missing' };
  }

  if (!data.faq.title || !data.faq.items || !Array.isArray(data.faq.items)) {
    console.log(`❌ FAQ section missing title or items array`);
    return { valid: false, error: 'FAQ section structure invalid' };
  }

  if (data.faq.items.length === 0) {
    console.log(`❌ FAQ items array is empty`);
    return { valid: false, error: 'FAQ items array is empty' };
  }

  // Validate each FAQ item
  data.faq.items.forEach((item, index) => {
    if (!item.question || !item.answer) {
      console.log(`❌ FAQ item ${index + 1} missing question or answer`);
      return { valid: false, error: `FAQ item ${index + 1} incomplete` };
    }
  });

  console.log(`✅ FAQ section structure valid (${data.faq.items.length} items)`);
  return { valid: true };
}

function validateAboutSection(data, language) {
  console.log(`\n🔍 Validating About section for ${language}`);

  if (!data.about) {
    console.log(`❌ About section missing`);
    return { valid: false, error: 'About section missing' };
  }

  const requiredFields = ['title', 'mission', 'story', 'values'];
  const missingFields = requiredFields.filter(field => !data.about[field]);

  if (missingFields.length > 0) {
    console.log(`❌ About section missing fields: ${missingFields.join(', ')}`);
    return { valid: false, missing: missingFields };
  }

  console.log(`✅ About section structure valid`);
  return { valid: true };
}

function compareLanguageConsistency(csData, enData) {
  console.log(`\n🔍 Comparing Czech and English content consistency`);

  const inconsistencies = [];

  // Check if both languages have the same top-level sections
  const csSections = Object.keys(csData);
  const enSections = Object.keys(enData);

  const missingSectionsInEn = csSections.filter(section => !enSections.includes(section));
  const missingSectionsInCs = enSections.filter(section => !csSections.includes(section));

  if (missingSectionsInEn.length > 0) {
    inconsistencies.push(`Missing in English: ${missingSectionsInEn.join(', ')}`);
  }

  if (missingSectionsInCs.length > 0) {
    inconsistencies.push(`Missing in Czech: ${missingSectionsInCs.join(', ')}`);
  }

  // Check home section consistency
  if (csData.home && enData.home) {
    // Check benefits items count
    const csBenefitsCount = csData.home.benefits?.items?.length || 0;
    const enBenefitsCount = enData.home.benefits?.items?.length || 0;

    if (csBenefitsCount !== enBenefitsCount) {
      inconsistencies.push(`Benefits items count mismatch: CS=${csBenefitsCount}, EN=${enBenefitsCount}`);
    }
  }

  // Check FAQ items consistency
  if (csData.faq && enData.faq) {
    const csFaqCount = csData.faq.items?.length || 0;
    const enFaqCount = enData.faq.items?.length || 0;

    if (csFaqCount !== enFaqCount) {
      inconsistencies.push(`FAQ items count mismatch: CS=${csFaqCount}, EN=${enFaqCount}`);
    }
  }

  // Check SEO pages consistency
  if (csData.seo && enData.seo) {
    const csSeoPages = Object.keys(csData.seo);
    const enSeoPages = Object.keys(enData.seo);

    const missingSeoInEn = csSeoPages.filter(page => !enSeoPages.includes(page));
    const missingSeoInCs = enSeoPages.filter(page => !csSeoPages.includes(page));

    if (missingSeoInEn.length > 0) {
      inconsistencies.push(`Missing SEO pages in English: ${missingSeoInEn.join(', ')}`);
    }

    if (missingSeoInCs.length > 0) {
      inconsistencies.push(`Missing SEO pages in Czech: ${missingSeoInCs.join(', ')}`);
    }
  }

  if (inconsistencies.length > 0) {
    console.log(`❌ Language inconsistencies found:`);
    inconsistencies.forEach(issue => console.log(`   - ${issue}`));
    return { valid: false, inconsistencies };
  }

  console.log(`✅ Language consistency validated`);
  return { valid: true };
}

function main() {
  console.log('🚀 Starting JSON Structure Validation and Testing\n');

  const csPath = path.join(process.cwd(), 'messages', 'cs.json');
  const enPath = path.join(process.cwd(), 'messages', 'en.json');

  let allValid = true;
  const results = {
    cs: {},
    en: {},
    consistency: {}
  };

  // Validate Czech JSON
  console.log('=' .repeat(50));
  console.log('CZECH (cs.json) VALIDATION');
  console.log('=' .repeat(50));

  const csValidation = validateJSONSyntax(csPath);
  results.cs.syntax = csValidation;

  if (csValidation.valid) {
    results.cs.sections = validateRequiredSections(csValidation.data, 'Czech');
    results.cs.home = validateHomeSection(csValidation.data, 'Czech');
    results.cs.seo = validateSEOSection(csValidation.data, 'Czech');
    results.cs.faq = validateFAQSection(csValidation.data, 'Czech');
    results.cs.about = validateAboutSection(csValidation.data, 'Czech');
  } else {
    allValid = false;
  }

  // Validate English JSON
  console.log('\n' + '=' .repeat(50));
  console.log('ENGLISH (en.json) VALIDATION');
  console.log('=' .repeat(50));

  const enValidation = validateJSONSyntax(enPath);
  results.en.syntax = enValidation;

  if (enValidation.valid) {
    results.en.sections = validateRequiredSections(enValidation.data, 'English');
    results.en.home = validateHomeSection(enValidation.data, 'English');
    results.en.seo = validateSEOSection(enValidation.data, 'English');
    results.en.faq = validateFAQSection(enValidation.data, 'English');
    results.en.about = validateAboutSection(enValidation.data, 'English');
  } else {
    allValid = false;
  }

  // Compare language consistency
  if (csValidation.valid && enValidation.valid) {
    console.log('\n' + '=' .repeat(50));
    console.log('LANGUAGE CONSISTENCY VALIDATION');
    console.log('=' .repeat(50));

    results.consistency = compareLanguageConsistency(csValidation.data, enValidation.data);
  }

  // Check if all validations passed
  const allResults = [
    results.cs.syntax?.valid,
    results.cs.sections?.valid,
    results.cs.home?.valid,
    results.cs.seo?.valid,
    results.cs.faq?.valid,
    results.cs.about?.valid,
    results.en.syntax?.valid,
    results.en.sections?.valid,
    results.en.home?.valid,
    results.en.seo?.valid,
    results.en.faq?.valid,
    results.en.about?.valid,
    results.consistency?.valid
  ];

  allValid = allResults.every(result => result === true);

  // Final summary
  console.log('\n' + '=' .repeat(50));
  console.log('VALIDATION SUMMARY');
  console.log('=' .repeat(50));

  if (allValid) {
    console.log('🎉 All validations passed successfully!');
    console.log('✅ JSON syntax is valid for both languages');
    console.log('✅ All required sections are present');
    console.log('✅ Content structure is properly nested');
    console.log('✅ Language consistency is maintained');
    console.log('✅ SEO optimization requirements are met');
    process.exit(0);
  } else {
    console.log('❌ Some validations failed. Please review the issues above.');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  validateJSONSyntax,
  validateRequiredSections,
  validateHomeSection,
  validateSEOSection,
  validateFAQSection,
  validateAboutSection,
  compareLanguageConsistency
};
