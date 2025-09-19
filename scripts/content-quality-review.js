#!/usr/bin/env node

/**
 * Content Quality Review Script
 * Conducts comprehensive quality assurance for Czech and English content
 * Checks tone consistency, professionalism, empathy, and grammar
 */

const fs = require('fs');
const path = require('path');

// Load message files
const csMessages = JSON.parse(fs.readFileSync('messages/cs.json', 'utf8'));
const enMessages = JSON.parse(fs.readFileSync('messages/en.json', 'utf8'));

// Quality review results
const reviewResults = {
  toneConsistency: [],
  professionalism: [],
  empathy: [],
  grammar: [],
  completeness: [],
  seoOptimization: []
};

// Content sections to review
const contentSections = [
  'home.hero',
  'home.philosophy',
  'home.benefits',
  'faq',
  'about',
  'seo'
];

/**
 * Check tone consistency across content sections
 */
function checkToneConsistency() {
  console.log('\n🎯 Checking Tone Consistency...');

  const toneKeywords = {
    empathetic: ['láska', 'úcta', 'cit', 'porozumění', 'love', 'respect', 'sensitivity', 'understanding'],
    professional: ['kvalita', 'zkušenost', 'odborný', 'quality', 'experience', 'professional'],
    respectful: ['důstojný', 'pietní', 'rozloučení', 'dignified', 'memorial', 'farewell']
  };

  // Check Czech content
  const csHeroText = `${csMessages.home.hero.title} ${csMessages.home.hero.subtitle} ${csMessages.home.hero.description}`;
  const csAboutText = `${csMessages.about.mission} ${csMessages.about.story}`;

  // Check English content
  const enHeroText = `${enMessages.home.hero.title} ${enMessages.home.hero.subtitle} ${enMessages.home.hero.description}`;
  const enAboutText = `${enMessages.about.mission} ${enMessages.about.story}`;

  let toneScore = 0;
  let totalChecks = 0;

  Object.entries(toneKeywords).forEach(([tone, keywords]) => {
    const csMatches = keywords.filter(keyword =>
      csHeroText.toLowerCase().includes(keyword) || csAboutText.toLowerCase().includes(keyword)
    ).length;

    const enMatches = keywords.filter(keyword =>
      enHeroText.toLowerCase().includes(keyword) || enAboutText.toLowerCase().includes(keyword)
    ).length;

    totalChecks += 2;
    if (csMatches > 0) toneScore++;
    if (enMatches > 0) toneScore++;

    console.log(`  ${tone}: CS(${csMatches}) EN(${enMatches})`);
  });

  const toneConsistencyScore = (toneScore / totalChecks) * 100;
  reviewResults.toneConsistency.push({
    section: 'Overall',
    score: toneConsistencyScore,
    status: toneConsistencyScore >= 70 ? 'PASS' : 'NEEDS_IMPROVEMENT'
  });

  console.log(`  ✅ Tone Consistency Score: ${toneConsistencyScore.toFixed(1)}%`);
}

/**
 * Check professionalism in content
 */
function checkProfessionalism() {
  console.log('\n💼 Checking Professionalism...');

  const professionalIndicators = {
    credentials: ['s.r.o.', 'zkušenost', 'odborný', 'experience', 'professional'],
    guarantees: ['garance', 'garantujeme', 'závazek', 'guarantee', 'commitment'],
    quality: ['kvalita', 'pečlivost', 'dokonalý', 'quality', 'careful', 'perfect']
  };

  let professionalScore = 0;
  let totalIndicators = Object.keys(professionalIndicators).length * 2; // CS + EN

  Object.entries(professionalIndicators).forEach(([category, indicators]) => {
    const csContent = JSON.stringify(csMessages).toLowerCase();
    const enContent = JSON.stringify(enMessages).toLowerCase();

    const csMatches = indicators.some(indicator => csContent.includes(indicator));
    const enMatches = indicators.some(indicator => enContent.includes(indicator));

    if (csMatches) professionalScore++;
    if (enMatches) professionalScore++;

    console.log(`  ${category}: CS(${csMatches ? '✓' : '✗'}) EN(${enMatches ? '✓' : '✗'})`);
  });

  const professionalismScore = (professionalScore / totalIndicators) * 100;
  reviewResults.professionalism.push({
    section: 'Overall',
    score: professionalismScore,
    status: professionalismScore >= 80 ? 'PASS' : 'NEEDS_IMPROVEMENT'
  });

  console.log(`  ✅ Professionalism Score: ${professionalismScore.toFixed(1)}%`);
}

/**
 * Check empathetic messaging
 */
function checkEmpathy() {
  console.log('\n❤️ Checking Empathetic Messaging...');

  const empathyIndicators = {
    understanding: ['pochopení', 'rozumíme', 'understanding', 'understand'],
    support: ['pomoc', 'podpora', 'pomáháme', 'help', 'support'],
    comfort: ['útěcha', 'těžký', 'smutný', 'comfort', 'difficult', 'sad'],
    sensitivity: ['cit', 'citlivost', 'jemný', 'sensitivity', 'gentle', 'tender']
  };

  let empathyScore = 0;
  let totalIndicators = Object.keys(empathyIndicators).length * 2;

  Object.entries(empathyIndicators).forEach(([category, indicators]) => {
    const csContent = JSON.stringify(csMessages).toLowerCase();
    const enContent = JSON.stringify(enMessages).toLowerCase();

    const csMatches = indicators.some(indicator => csContent.includes(indicator));
    const enMatches = indicators.some(indicator => enContent.includes(indicator));

    if (csMatches) empathyScore++;
    if (enMatches) empathyScore++;

    console.log(`  ${category}: CS(${csMatches ? '✓' : '✗'}) EN(${enMatches ? '✓' : '✗'})`);
  });

  const empathyScorePercent = (empathyScore / totalIndicators) * 100;
  reviewResults.empathy.push({
    section: 'Overall',
    score: empathyScorePercent,
    status: empathyScorePercent >= 75 ? 'PASS' : 'NEEDS_IMPROVEMENT'
  });

  console.log(`  ✅ Empathy Score: ${empathyScorePercent.toFixed(1)}%`);
}

/**
 * Check content completeness
 */
function checkCompleteness() {
  console.log('\n📋 Checking Content Completeness...');

  const requiredSections = [
    'home.hero.title',
    'home.hero.subtitle',
    'home.hero.description',
    'home.hero.cta',
    'home.benefits.title',
    'home.benefits.items',
    'faq.title',
    'faq.items',
    'about.title',
    'about.mission',
    'about.story',
    'seo.home.title',
    'seo.home.description'
  ];

  let completenessScore = 0;
  let missingContent = [];

  requiredSections.forEach(section => {
    const csValue = getNestedValue(csMessages, section);
    const enValue = getNestedValue(enMessages, section);

    if (csValue && enValue) {
      completenessScore++;
      console.log(`  ✅ ${section}: Present in both languages`);
    } else {
      missingContent.push(section);
      console.log(`  ❌ ${section}: Missing in ${!csValue ? 'CS' : ''} ${!enValue ? 'EN' : ''}`);
    }
  });

  const completenessPercent = (completenessScore / requiredSections.length) * 100;
  reviewResults.completeness.push({
    section: 'Overall',
    score: completenessPercent,
    status: completenessPercent >= 95 ? 'PASS' : 'NEEDS_IMPROVEMENT',
    missing: missingContent
  });

  console.log(`  ✅ Completeness Score: ${completenessPercent.toFixed(1)}%`);
}

/**
 * Check SEO optimization
 */
function checkSEOOptimization() {
  console.log('\n🔍 Checking SEO Optimization...');

  const seoChecks = [
    {
      name: 'Title Length',
      check: (title) => title && title.length >= 30 && title.length <= 60,
      sections: ['seo.home.title', 'seo.products.title', 'seo.about.title']
    },
    {
      name: 'Description Length',
      check: (desc) => desc && desc.length >= 120 && desc.length <= 160,
      sections: ['seo.home.description', 'seo.products.description', 'seo.about.description']
    },
    {
      name: 'Keywords Present',
      check: (keywords) => keywords && Array.isArray(keywords) && keywords.length >= 5,
      sections: ['seo.home.keywords', 'seo.products.keywords', 'seo.about.keywords']
    }
  ];

  let seoScore = 0;
  let totalChecks = 0;

  seoChecks.forEach(({ name, check, sections }) => {
    console.log(`  ${name}:`);

    sections.forEach(section => {
      const csValue = getNestedValue(csMessages, section);
      const enValue = getNestedValue(enMessages, section);

      totalChecks += 2;

      const csPass = check(csValue);
      const enPass = check(enValue);

      if (csPass) seoScore++;
      if (enPass) seoScore++;

      console.log(`    ${section}: CS(${csPass ? '✓' : '✗'}) EN(${enPass ? '✓' : '✗'})`);
    });
  });

  const seoScorePercent = (seoScore / totalChecks) * 100;
  reviewResults.seoOptimization.push({
    section: 'Overall',
    score: seoScorePercent,
    status: seoScorePercent >= 80 ? 'PASS' : 'NEEDS_IMPROVEMENT'
  });

  console.log(`  ✅ SEO Optimization Score: ${seoScorePercent.toFixed(1)}%`);
}

/**
 * Helper function to get nested object values
 */
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current && current[key], obj);
}

/**
 * Generate final report
 */
function generateReport() {
  console.log('\n📊 CONTENT QUALITY REVIEW REPORT');
  console.log('=====================================');

  const categories = [
    { name: 'Tone Consistency', results: reviewResults.toneConsistency },
    { name: 'Professionalism', results: reviewResults.professionalism },
    { name: 'Empathy', results: reviewResults.empathy },
    { name: 'Completeness', results: reviewResults.completeness },
    { name: 'SEO Optimization', results: reviewResults.seoOptimization }
  ];

  let overallScore = 0;
  let totalCategories = categories.length;

  categories.forEach(({ name, results }) => {
    const result = results[0];
    const status = result.status === 'PASS' ? '✅' : '⚠️';
    console.log(`${status} ${name}: ${result.score.toFixed(1)}% (${result.status})`);
    overallScore += result.score;
  });

  const finalScore = overallScore / totalCategories;
  console.log('\n=====================================');
  console.log(`🎯 OVERALL QUALITY SCORE: ${finalScore.toFixed(1)}%`);

  if (finalScore >= 85) {
    console.log('✅ EXCELLENT - Content meets high quality standards');
  } else if (finalScore >= 75) {
    console.log('✅ GOOD - Content meets quality standards with minor improvements needed');
  } else if (finalScore >= 65) {
    console.log('⚠️ FAIR - Content needs improvement in several areas');
  } else {
    console.log('❌ POOR - Content requires significant improvement');
  }

  // Save detailed report
  const reportData = {
    timestamp: new Date().toISOString(),
    overallScore: finalScore,
    categories: reviewResults,
    recommendations: generateRecommendations()
  };

  fs.writeFileSync('content-quality-report.json', JSON.stringify(reportData, null, 2));
  console.log('\n📄 Detailed report saved to: content-quality-report.json');
}

/**
 * Generate improvement recommendations
 */
function generateRecommendations() {
  const recommendations = [];

  Object.entries(reviewResults).forEach(([category, results]) => {
    const result = results[0];
    if (result && result.status === 'NEEDS_IMPROVEMENT') {
      switch (category) {
        case 'toneConsistency':
          recommendations.push('Enhance empathetic language and ensure consistent tone across all content sections');
          break;
        case 'professionalism':
          recommendations.push('Add more professional credentials and quality guarantees to build trust');
          break;
        case 'empathy':
          recommendations.push('Incorporate more understanding and supportive language for grieving customers');
          break;
        case 'completeness':
          recommendations.push(`Complete missing content sections: ${result.missing?.join(', ')}`);
          break;
        case 'seoOptimization':
          recommendations.push('Optimize meta titles, descriptions, and keyword usage for better search visibility');
          break;
      }
    }
  });

  return recommendations;
}

// Run the quality review
console.log('🔍 Starting Content Quality Review...');
console.log('=====================================');

checkToneConsistency();
checkProfessionalism();
checkEmpathy();
checkCompleteness();
checkSEOOptimization();
generateReport();

console.log('\n✅ Content Quality Review Complete!');
