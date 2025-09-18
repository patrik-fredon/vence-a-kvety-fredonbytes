#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Content Completeness and Consistency Validation
 * Validates:
 * - All Czech content has corresponding English translations
 * - Tone consistency across all content sections
 * - Character limits for SEO optimization
 * - Content structure alignment between languages
 */

// SEO character limits
const SEO_LIMITS = {
  title: 60,
  description: 160,
  keywords: 10 // max number of keywords
};

// Tone keywords for consistency checking
const TONE_KEYWORDS = {
  empathetic: ['láska', 'úcta', 'cit', 'porozumění', 'soucit', 'love', 'respect', 'sensitivity', 'understanding', 'compassion'],
  professional: ['kvalita', 'zkušenost', 'odbornost', 'spolehlivost', 'quality', 'experience', 'expertise', 'reliability'],
  trustBuilding: ['garance', 'spolehlivé', 'pečlivě', 'důvěra', 'guarantee', 'reliable', 'carefully', 'trust'],
  respectful: ['důstojné', 'pietní', 'rozloučení', 'památka', 'dignified', 'memorial', 'farewell', 'memory']
};

function loadMessages() {
  console.log('🔍 Loading message files...');

  try {
    const csPath = path.join(process.cwd(), 'messages', 'cs.json');
    const enPath = path.join(process.cwd(), 'messages', 'en.json');

    const csMessages = JSON.parse(fs.readFileSync(csPath, 'utf8'));
    const enMessages = JSON.parse(fs.readFileSync(enPath, 'utf8'));

    console.log('✅ Message files loaded successfully');
    return { csMessages, enMessages };
  } catch (error) {
    console.log(`❌ Failed to load message files: ${error.message}`);
    return null;
  }
}

function validateTranslationCompleteness(csMessages, enMessages) {
  console.log('\n🔍 Validating translation completeness...');

  const missing = [];
  const present = [];

  function checkPath(csObj, enObj, path = '') {
    if (typeof csObj !== 'object' || csObj === null) return;

    for (const key in csObj) {
      const currentPath = path ? `${path}.${key}` : key;

      if (typeof csObj[key] === 'object' && csObj[key] !== null && !Array.isArray(csObj[key])) {
        // Recursive check for nested objects
        if (!enObj[key] || typeof enObj[key] !== 'object') {
          missing.push(currentPath);
        } else {
          checkPath(csObj[key], enObj[key], currentPath);
        }
      } else {
        // Check leaf values (strings, arrays, etc.)
        if (enObj[key] === undefined) {
          missing.push(currentPath);
        } else {
          present.push(currentPath);
        }
      }
    }
  }

  checkPath(csMessages, enMessages);

  console.log(`✅ Present translations: ${present.length} items`);

  if (missing.length > 0) {
    console.log(`❌ Missing translations (${missing.length}):`);
    missing.forEach(path => console.log(`   - ${path}`));
    return { valid: false, missing, present };
  }

  console.log('✅ All Czech content has corresponding English translations');
  return { valid: true, missing: [], present };
}

function validateContentStructureAlignment(csMessages, enMessages) {
  console.log('\n🔍 Validating content structure alignment...');

  const misalignments = [];

  // Check array lengths for structured content
  const arrayPaths = [
    'home.benefits.items',
    'faq.items',
    'seo.home.keywords',
    'seo.products.keywords',
    'seo.about.keywords',
    'seo.faq.keywords'
  ];

  arrayPaths.forEach(pathStr => {
    const keys = pathStr.split('.');
    let csValue = csMessages;
    let enValue = enMessages;

    // Navigate to the nested value
    for (const key of keys) {
      csValue = csValue?.[key];
      enValue = enValue?.[key];
    }

    if (Array.isArray(csValue) && Array.isArray(enValue)) {
      if (csValue.length !== enValue.length) {
        misalignments.push(`${pathStr}: CS=${csValue.length}, EN=${enValue.length}`);
      } else {
        console.log(`✅ ${pathStr}: Both have ${csValue.length} items`);
      }
    } else if (csValue && enValue) {
      console.log(`✅ ${pathStr}: Both present (non-array)`);
    } else {
      misalignments.push(`${pathStr}: Missing in one or both languages`);
    }
  });

  if (misalignments.length > 0) {
    console.log(`❌ Structure misalignments found:`);
    misalignments.forEach(issue => console.log(`   - ${issue}`));
    return { valid: false, misalignments };
  }

  console.log('✅ Content structure alignment validated');
  return { valid: true, misalignments: [] };
}

function validateSEOCharacterLimits(messages, language) {
  console.log(`\n🔍 Validating SEO character limits for ${language}...`);

  const violations = [];
  const warnings = [];

  if (!messages.seo) {
    violations.push('SEO section missing');
    return { valid: false, violations, warnings };
  }

  const seoPages = ['home', 'products', 'about', 'faq'];

  seoPages.forEach(page => {
    if (!messages.seo[page]) {
      violations.push(`SEO section missing for ${page}`);
      return;
    }

    const seoData = messages.seo[page];

    // Check title length
    if (seoData.title) {
      if (seoData.title.length > SEO_LIMITS.title) {
        violations.push(`${page} title exceeds ${SEO_LIMITS.title} chars: ${seoData.title.length}`);
      } else if (seoData.title.length > SEO_LIMITS.title - 10) {
        warnings.push(`${page} title near limit: ${seoData.title.length}/${SEO_LIMITS.title}`);
      } else {
        console.log(`✅ ${page} title: ${seoData.title.length}/${SEO_LIMITS.title} chars`);
      }
    }

    // Check description length
    if (seoData.description) {
      if (seoData.description.length > SEO_LIMITS.description) {
        violations.push(`${page} description exceeds ${SEO_LIMITS.description} chars: ${seoData.description.length}`);
      } else if (seoData.description.length > SEO_LIMITS.description - 20) {
        warnings.push(`${page} description near limit: ${seoData.description.length}/${SEO_LIMITS.description}`);
      } else {
        console.log(`✅ ${page} description: ${seoData.description.length}/${SEO_LIMITS.description} chars`);
      }
    }

    // Check keywords count
    if (seoData.keywords && Array.isArray(seoData.keywords)) {
      if (seoData.keywords.length > SEO_LIMITS.keywords) {
        warnings.push(`${page} has many keywords: ${seoData.keywords.length} (consider reducing)`);
      } else {
        console.log(`✅ ${page} keywords: ${seoData.keywords.length}/${SEO_LIMITS.keywords}`);
      }
    }
  });

  if (warnings.length > 0) {
    console.log(`⚠️  SEO warnings for ${language}:`);
    warnings.forEach(warning => console.log(`   - ${warning}`));
  }

  if (violations.length > 0) {
    console.log(`❌ SEO violations for ${language}:`);
    violations.forEach(violation => console.log(`   - ${violation}`));
    return { valid: false, violations, warnings };
  }

  console.log(`✅ SEO character limits validated for ${language}`);
  return { valid: true, violations: [], warnings };
}

function validateToneConsistency(messages, language) {
  console.log(`\n🔍 Validating tone consistency for ${language}...`);

  const toneAnalysis = {
    empathetic: 0,
    professional: 0,
    trustBuilding: 0,
    respectful: 0
  };

  const contentSections = [
    'home.hero.title',
    'home.hero.subtitle',
    'home.hero.description',
    'home.philosophy.quote',
    'home.philosophy.text',
    'home.benefits.title',
    'about.mission',
    'about.story',
    'about.values',
    'about.commitment'
  ];

  // Extract text content for analysis
  const textContent = [];

  contentSections.forEach(pathStr => {
    const keys = pathStr.split('.');
    let value = messages;

    for (const key of keys) {
      value = value?.[key];
    }

    if (typeof value === 'string') {
      textContent.push(value.toLowerCase());
    }
  });

  // Add benefits items
  if (messages.home?.benefits?.items) {
    messages.home.benefits.items.forEach(item => {
      if (item.title) textContent.push(item.title.toLowerCase());
      if (item.description) textContent.push(item.description.toLowerCase());
    });
  }

  // Add FAQ content
  if (messages.faq?.items) {
    messages.faq.items.forEach(item => {
      if (item.question) textContent.push(item.question.toLowerCase());
      if (item.answer) textContent.push(item.answer.toLowerCase());
    });
  }

  // Analyze tone keywords
  const allText = textContent.join(' ');

  Object.keys(TONE_KEYWORDS).forEach(toneType => {
    const keywords = TONE_KEYWORDS[toneType];
    keywords.forEach(keyword => {
      const regex = new RegExp(keyword.toLowerCase(), 'g');
      const matches = allText.match(regex);
      if (matches) {
        toneAnalysis[toneType] += matches.length;
      }
    });
  });

  console.log(`📊 Tone analysis for ${language}:`);
  Object.keys(toneAnalysis).forEach(tone => {
    console.log(`   - ${tone}: ${toneAnalysis[tone]} occurrences`);
  });

  // Check if tone is balanced and appropriate
  const totalToneWords = Object.values(toneAnalysis).reduce((sum, count) => sum + count, 0);

  if (totalToneWords === 0) {
    console.log(`⚠️  No tone keywords found - content may lack emotional connection`);
    return { valid: true, analysis: toneAnalysis, warning: 'No tone keywords found' };
  }

  // Check for appropriate balance
  const hasEmpathetic = toneAnalysis.empathetic > 0;
  const hasProfessional = toneAnalysis.professional > 0;
  const hasRespectful = toneAnalysis.respectful > 0;

  if (hasEmpathetic && hasProfessional && hasRespectful) {
    console.log(`✅ Tone consistency validated - balanced empathetic, professional, and respectful content`);
    return { valid: true, analysis: toneAnalysis };
  } else {
    const missing = [];
    if (!hasEmpathetic) missing.push('empathetic');
    if (!hasProfessional) missing.push('professional');
    if (!hasRespectful) missing.push('respectful');

    console.log(`⚠️  Tone may need improvement - missing: ${missing.join(', ')}`);
    return { valid: true, analysis: toneAnalysis, warning: `Missing tone elements: ${missing.join(', ')}` };
  }
}

function validateContentQuality(messages, language) {
  console.log(`\n🔍 Validating content quality for ${language}...`);

  const issues = [];
  const checks = [];

  // Check for empty or very short content
  const criticalContent = [
    'home.hero.title',
    'home.hero.description',
    'about.mission',
    'about.story'
  ];

  criticalContent.forEach(pathStr => {
    const keys = pathStr.split('.');
    let value = messages;

    for (const key of keys) {
      value = value?.[key];
    }

    if (!value || typeof value !== 'string') {
      issues.push(`${pathStr}: Missing or invalid content`);
    } else if (value.length < 20) {
      issues.push(`${pathStr}: Content too short (${value.length} chars)`);
    } else {
      checks.push(`${pathStr}: ${value.length} chars`);
    }
  });

  // Check benefits items quality
  if (messages.home?.benefits?.items) {
    messages.home.benefits.items.forEach((item, index) => {
      if (!item.title || item.title.length < 10) {
        issues.push(`Benefits item ${index + 1}: Title too short or missing`);
      }
      if (!item.description || item.description.length < 30) {
        issues.push(`Benefits item ${index + 1}: Description too short or missing`);
      }
    });
  }

  // Check FAQ quality
  if (messages.faq?.items) {
    messages.faq.items.forEach((item, index) => {
      if (!item.question || item.question.length < 10) {
        issues.push(`FAQ item ${index + 1}: Question too short or missing`);
      }
      if (!item.answer || item.answer.length < 50) {
        issues.push(`FAQ item ${index + 1}: Answer too short or missing`);
      }
    });
  }

  console.log(`✅ Quality checks passed: ${checks.length}`);

  if (issues.length > 0) {
    console.log(`❌ Content quality issues found:`);
    issues.forEach(issue => console.log(`   - ${issue}`));
    return { valid: false, issues, checks };
  }

  console.log(`✅ Content quality validated for ${language}`);
  return { valid: true, issues: [], checks };
}

function main() {
  console.log('🚀 Starting Content Completeness and Consistency Validation\n');

  const messageData = loadMessages();
  if (!messageData) {
    process.exit(1);
  }

  const { csMessages, enMessages } = messageData;
  let allValid = true;
  const results = {};

  // Test translation completeness
  console.log('=' .repeat(60));
  console.log('TRANSLATION COMPLETENESS VALIDATION');
  console.log('=' .repeat(60));

  results.completeness = validateTranslationCompleteness(csMessages, enMessages);
  if (!results.completeness.valid) allValid = false;

  // Test content structure alignment
  console.log('\n' + '=' .repeat(60));
  console.log('CONTENT STRUCTURE ALIGNMENT VALIDATION');
  console.log('=' .repeat(60));

  results.alignment = validateContentStructureAlignment(csMessages, enMessages);
  if (!results.alignment.valid) allValid = false;

  // Test SEO character limits
  console.log('\n' + '=' .repeat(60));
  console.log('SEO CHARACTER LIMITS VALIDATION');
  console.log('=' .repeat(60));

  results.seoCs = validateSEOCharacterLimits(csMessages, 'Czech');
  results.seoEn = validateSEOCharacterLimits(enMessages, 'English');

  if (!results.seoCs.valid || !results.seoEn.valid) allValid = false;

  // Test tone consistency
  console.log('\n' + '=' .repeat(60));
  console.log('TONE CONSISTENCY VALIDATION');
  console.log('=' .repeat(60));

  results.toneCs = validateToneConsistency(csMessages, 'Czech');
  results.toneEn = validateToneConsistency(enMessages, 'English');

  // Test content quality
  console.log('\n' + '=' .repeat(60));
  console.log('CONTENT QUALITY VALIDATION');
  console.log('=' .repeat(60));

  results.qualityCs = validateContentQuality(csMessages, 'Czech');
  results.qualityEn = validateContentQuality(enMessages, 'English');

  if (!results.qualityCs.valid || !results.qualityEn.valid) allValid = false;

  // Final summary
  console.log('\n' + '=' .repeat(60));
  console.log('CONTENT VALIDATION SUMMARY');
  console.log('=' .repeat(60));

  if (allValid) {
    console.log('🎉 All content validation checks passed!');
    console.log('✅ Translation completeness verified');
    console.log('✅ Content structure alignment confirmed');
    console.log('✅ SEO character limits optimized');
    console.log('✅ Tone consistency maintained');
    console.log('✅ Content quality standards met');

    // Show summary statistics
    console.log('\n📊 Summary Statistics:');
    console.log(`   - Translated items: ${results.completeness.present.length}`);
    console.log(`   - SEO warnings (Czech): ${results.seoCs.warnings?.length || 0}`);
    console.log(`   - SEO warnings (English): ${results.seoEn.warnings?.length || 0}`);
    console.log(`   - Quality checks passed: ${(results.qualityCs.checks?.length || 0) + (results.qualityEn.checks?.length || 0)}`);

    process.exit(0);
  } else {
    console.log('❌ Some content validation checks failed. Please review the issues above.');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  validateTranslationCompleteness,
  validateContentStructureAlignment,
  validateSEOCharacterLimits,
  validateToneConsistency,
  validateContentQuality
};
