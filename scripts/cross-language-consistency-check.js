#!/usr/bin/env node

/**
 * Cross-Language Consistency Check
 *
 * This script performs a comprehensive comparison between Czech (cs.json) and English (en.json)
 * content files to ensure message alignment, conversion focus consistency, and structural integrity.
 *
 * Requirements covered:
 * - 3.1: English content maintains same emotional tone and professional quality
 * - 3.3: Both language versions are consistent in structure and messaging approach
 * - 3.4: Cultural appropriateness for international audience
 */

const fs = require('fs');
const path = require('path');

class CrossLanguageConsistencyChecker {
  constructor() {
    this.csPath = path.join(__dirname, '../messages/cs.json');
    this.enPath = path.join(__dirname, '../messages/en.json');
    this.issues = [];
    this.warnings = [];
    this.stats = {
      totalKeys: 0,
      matchingKeys: 0,
      missingInEnglish: 0,
      missingInCzech: 0,
      structuralMismatches: 0,
      conversionFocusIssues: 0
    };
  }

  async runCheck() {
    console.log('🔍 Starting Cross-Language Consistency Check...\n');

    try {
      // Load both language files
      const csContent = JSON.parse(fs.readFileSync(this.csPath, 'utf8'));
      const enContent = JSON.parse(fs.readFileSync(this.enPath, 'utf8'));

      // Perform various consistency checks
      this.checkStructuralConsistency(csContent, enContent);
      this.checkContentCompleteness(csContent, enContent);
      this.checkConversionFocus(csContent, enContent);
      this.checkSEOConsistency(csContent, enContent);
      this.checkEmotionalToneAlignment(csContent, enContent);
      this.checkCulturalAppropriateness(enContent);

      // Generate report
      this.generateReport();

    } catch (error) {
      console.error('❌ Error during consistency check:', error.message);
      process.exit(1);
    }
  }

  checkStructuralConsistency(csContent, enContent) {
    console.log('📋 Checking structural consistency...');

    const csKeys = this.getAllKeys(csContent);
    const enKeys = this.getAllKeys(enContent);

    this.stats.totalKeys = csKeys.length;

    // Check for missing keys in English
    const missingInEn = csKeys.filter(key => !enKeys.includes(key));
    const missingInCs = enKeys.filter(key => !csKeys.includes(key));

    this.stats.missingInEnglish = missingInEn.length;
    this.stats.missingInCzech = missingInCs.length;
    this.stats.matchingKeys = csKeys.filter(key => enKeys.includes(key)).length;

    if (missingInEn.length > 0) {
      this.issues.push({
        type: 'MISSING_TRANSLATIONS',
        severity: 'HIGH',
        message: `${missingInEn.length} keys missing in English translation`,
        details: missingInEn.slice(0, 10), // Show first 10
        requirement: '3.1'
      });
    }

    if (missingInCs.length > 0) {
      this.warnings.push({
        type: 'EXTRA_ENGLISH_KEYS',
        message: `${missingInCs.length} keys exist only in English`,
        details: missingInCs.slice(0, 10)
      });
    }

    // Check array structure consistency
    this.checkArrayStructures(csContent, enContent, '');
  }

  checkArrayStructures(csObj, enObj, path) {
    for (const key in csObj) {
      const currentPath = path ? `${path}.${key}` : key;

      if (Array.isArray(csObj[key]) && Array.isArray(enObj[key])) {
        if (csObj[key].length !== enObj[key].length) {
          this.issues.push({
            type: 'ARRAY_LENGTH_MISMATCH',
            severity: 'MEDIUM',
            message: `Array length mismatch at ${currentPath}`,
            details: `Czech: ${csObj[key].length} items, English: ${enObj[key].length} items`,
            requirement: '3.3'
          });
          this.stats.structuralMismatches++;
        }
      } else if (typeof csObj[key] === 'object' && typeof enObj[key] === 'object' &&
                 csObj[key] !== null && enObj[key] !== null) {
        this.checkArrayStructures(csObj[key], enObj[key], currentPath);
      }
    }
  }

  checkContentCompleteness(csContent, enContent) {
    console.log('📝 Checking content completeness...');

    // Check critical sections that must exist in both languages
    const criticalSections = [
      'home.hero',
      'home.benefits',
      'home.philosophy',
      'faq.items',
      'about',
      'seo.home',
      'seo.products'
    ];

    criticalSections.forEach(section => {
      const csValue = this.getNestedValue(csContent, section);
      const enValue = this.getNestedValue(enContent, section);

      if (!csValue) {
        this.issues.push({
          type: 'MISSING_CRITICAL_SECTION',
          severity: 'HIGH',
          message: `Critical section '${section}' missing in Czech`,
          requirement: '3.1'
        });
      }

      if (!enValue) {
        this.issues.push({
          type: 'MISSING_CRITICAL_SECTION',
          severity: 'HIGH',
          message: `Critical section '${section}' missing in English`,
          requirement: '3.1'
        });
      }
    });
  }

  checkConversionFocus(csContent, enContent) {
    console.log('🎯 Checking conversion focus consistency...');

    // Check CTA consistency
    const ctaKeys = [
      'home.hero.cta',
      'home.browseWreaths',
      'product.addToCart',
      'cart.checkout'
    ];

    ctaKeys.forEach(key => {
      const csValue = this.getNestedValue(csContent, key);
      const enValue = this.getNestedValue(enContent, key);

      if (csValue && enValue) {
        // Check if both CTAs are action-oriented (contain verbs)
        const csIsActionOriented = this.isActionOriented(csValue, 'cs');
        const enIsActionOriented = this.isActionOriented(enValue, 'en');

        if (csIsActionOriented !== enIsActionOriented) {
          this.issues.push({
            type: 'CTA_CONSISTENCY',
            severity: 'MEDIUM',
            message: `CTA action orientation mismatch at ${key}`,
            details: `Czech: "${csValue}", English: "${enValue}"`,
            requirement: '3.3'
          });
          this.stats.conversionFocusIssues++;
        }
      }
    });

    // Check benefits section consistency
    const csBenefits = this.getNestedValue(csContent, 'home.benefits.items');
    const enBenefits = this.getNestedValue(enContent, 'home.benefits.items');

    if (csBenefits && enBenefits && Array.isArray(csBenefits) && Array.isArray(enBenefits)) {
      if (csBenefits.length !== enBenefits.length) {
        this.issues.push({
          type: 'BENEFITS_COUNT_MISMATCH',
          severity: 'HIGH',
          message: 'Number of benefits differs between languages',
          details: `Czech: ${csBenefits.length}, English: ${enBenefits.length}`,
          requirement: '3.3'
        });
      }

      // Check if benefits maintain trust-building focus
      csBenefits.forEach((benefit, index) => {
        const enBenefit = enBenefits[index];
        if (enBenefit) {
          const csTrustWords = this.countTrustBuildingWords(benefit.description, 'cs');
          const enTrustWords = this.countTrustBuildingWords(enBenefit.description, 'en');

          if (Math.abs(csTrustWords - enTrustWords) > 1) {
            this.warnings.push({
              type: 'TRUST_FOCUS_VARIANCE',
              message: `Trust-building focus variance in benefit ${index + 1}`,
              details: `Czech trust words: ${csTrustWords}, English: ${enTrustWords}`
            });
          }
        }
      });
    }
  }

  checkSEOConsistency(csContent, enContent) {
    console.log('🔍 Checking SEO consistency...');

    const seoSections = ['home', 'products', 'about', 'faq'];

    seoSections.forEach(section => {
      const csSection = this.getNestedValue(csContent, `seo.${section}`);
      const enSection = this.getNestedValue(enContent, `seo.${section}`);

      if (csSection && enSection) {
        // Check title length consistency
        if (csSection.title && enSection.title) {
          const csTitleLength = csSection.title.length;
          const enTitleLength = enSection.title.length;

          if (Math.abs(csTitleLength - enTitleLength) > 20) {
            this.warnings.push({
              type: 'SEO_TITLE_LENGTH_VARIANCE',
              message: `SEO title length variance in ${section}`,
              details: `Czech: ${csTitleLength} chars, English: ${enTitleLength} chars`
            });
          }
        }

        // Check keywords consistency
        if (csSection.keywords && enSection.keywords) {
          if (csSection.keywords.length !== enSection.keywords.length) {
            this.warnings.push({
              type: 'SEO_KEYWORDS_COUNT_MISMATCH',
              message: `SEO keywords count mismatch in ${section}`,
              details: `Czech: ${csSection.keywords.length}, English: ${enSection.keywords.length}`
            });
          }
        }
      }
    });
  }

  checkEmotionalToneAlignment(csContent, enContent) {
    console.log('💝 Checking emotional tone alignment...');

    // Check key emotional content sections
    const emotionalSections = [
      'home.hero.description',
      'home.philosophy.text',
      'about.story',
      'about.mission'
    ];

    emotionalSections.forEach(section => {
      const csText = this.getNestedValue(csContent, section);
      const enText = this.getNestedValue(enContent, section);

      if (csText && enText) {
        const csEmotionalWords = this.countEmotionalWords(csText, 'cs');
        const enEmotionalWords = this.countEmotionalWords(enText, 'en');

        // Allow some variance but flag significant differences
        if (Math.abs(csEmotionalWords - enEmotionalWords) > 2) {
          this.warnings.push({
            type: 'EMOTIONAL_TONE_VARIANCE',
            message: `Emotional tone variance in ${section}`,
            details: `Czech emotional words: ${csEmotionalWords}, English: ${enEmotionalWords}`
          });
        }
      }
    });
  }

  checkCulturalAppropriateness(enContent) {
    console.log('🌍 Checking cultural appropriateness for international audience...');

    // Check for Czech-specific references that might not translate well
    const culturalChecks = [
      {
        path: 'currency.format',
        check: (value) => value.includes('CZK') || value.includes('Kč'),
        message: 'Currency format should be appropriate for international audience'
      },
      {
        path: 'footer.company',
        check: (value) => value.includes('s.r.o.'),
        message: 'Company legal form might need explanation for international audience'
      }
    ];

    culturalChecks.forEach(({ path, check, message }) => {
      const value = this.getNestedValue(enContent, path);
      if (value && check(value)) {
        this.warnings.push({
          type: 'CULTURAL_APPROPRIATENESS',
          message: `${message} at ${path}`,
          details: `Current value: "${value}"`
        });
      }
    });
  }

  // Helper methods
  getAllKeys(obj, prefix = '') {
    let keys = [];
    for (const key in obj) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        keys = keys.concat(this.getAllKeys(obj[key], fullKey));
      } else {
        keys.push(fullKey);
      }
    }
    return keys;
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current && current[key], obj);
  }

  isActionOriented(text, language) {
    const actionWords = {
      cs: ['vybrat', 'objednat', 'koupit', 'přidat', 'pokračovat', 'dokončit', 'kontaktovat'],
      en: ['choose', 'select', 'order', 'buy', 'add', 'proceed', 'complete', 'contact', 'browse']
    };

    const words = actionWords[language] || [];
    return words.some(word => text.toLowerCase().includes(word.toLowerCase()));
  }

  countTrustBuildingWords(text, language) {
    const trustWords = {
      cs: ['garance', 'kvalita', 'spolehlivé', 'pečlivá', 'profesionální', 'zkušený', 'důvěra'],
      en: ['guarantee', 'quality', 'reliable', 'careful', 'professional', 'experienced', 'trust', 'premium']
    };

    const words = trustWords[language] || [];
    return words.reduce((count, word) => {
      return count + (text.toLowerCase().split(word.toLowerCase()).length - 1);
    }, 0);
  }

  countEmotionalWords(text, language) {
    const emotionalWords = {
      cs: ['láska', 'úcta', 'cit', 'srdce', 'empatie', 'porozumění', 'důstojné', 'krásný'],
      en: ['love', 'respect', 'heart', 'empathy', 'understanding', 'dignified', 'beautiful', 'care']
    };

    const words = emotionalWords[language] || [];
    return words.reduce((count, word) => {
      return count + (text.toLowerCase().split(word.toLowerCase()).length - 1);
    }, 0);
  }

  generateReport() {
    console.log('\n📊 CROSS-LANGUAGE CONSISTENCY REPORT');
    console.log('=====================================\n');

    // Statistics
    console.log('📈 STATISTICS:');
    console.log(`Total keys checked: ${this.stats.totalKeys}`);
    console.log(`Matching keys: ${this.stats.matchingKeys}`);
    console.log(`Missing in English: ${this.stats.missingInEnglish}`);
    console.log(`Missing in Czech: ${this.stats.missingInCzech}`);
    console.log(`Structural mismatches: ${this.stats.structuralMismatches}`);
    console.log(`Conversion focus issues: ${this.stats.conversionFocusIssues}`);

    const completeness = ((this.stats.matchingKeys / this.stats.totalKeys) * 100).toFixed(1);
    console.log(`\n✅ Overall completeness: ${completeness}%\n`);

    // Issues
    if (this.issues.length > 0) {
      console.log('🚨 CRITICAL ISSUES:');
      this.issues.forEach((issue, index) => {
        console.log(`${index + 1}. [${issue.severity}] ${issue.message}`);
        if (issue.details) {
          console.log(`   Details: ${Array.isArray(issue.details) ? issue.details.join(', ') : issue.details}`);
        }
        if (issue.requirement) {
          console.log(`   Requirement: ${issue.requirement}`);
        }
        console.log('');
      });
    }

    // Warnings
    if (this.warnings.length > 0) {
      console.log('⚠️  WARNINGS:');
      this.warnings.forEach((warning, index) => {
        console.log(`${index + 1}. ${warning.message}`);
        if (warning.details) {
          console.log(`   Details: ${warning.details}`);
        }
        console.log('');
      });
    }

    // Summary
    console.log('📋 SUMMARY:');
    if (this.issues.length === 0 && this.warnings.length === 0) {
      console.log('✅ All consistency checks passed! Both language versions are well-aligned.');
    } else {
      console.log(`❌ Found ${this.issues.length} critical issues and ${this.warnings.length} warnings.`);

      if (this.issues.length > 0) {
        console.log('\n🔧 RECOMMENDED ACTIONS:');
        console.log('1. Address all critical issues before deployment');
        console.log('2. Ensure missing translations are added');
        console.log('3. Verify conversion focus consistency');
        console.log('4. Review structural mismatches');
      }
    }

    // Save detailed report
    const reportData = {
      timestamp: new Date().toISOString(),
      stats: this.stats,
      issues: this.issues,
      warnings: this.warnings,
      completeness: parseFloat(completeness)
    };

    fs.writeFileSync(
      path.join(__dirname, '../cross-language-consistency-report.json'),
      JSON.stringify(reportData, null, 2)
    );

    console.log('\n📄 Detailed report saved to: cross-language-consistency-report.json');

    // Exit with appropriate code
    process.exit(this.issues.length > 0 ? 1 : 0);
  }
}

// Run the check
if (require.main === module) {
  const checker = new CrossLanguageConsistencyChecker();
  checker.runCheck();
}

module.exports = CrossLanguageConsistencyChecker;
