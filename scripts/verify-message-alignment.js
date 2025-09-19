#!/usr/bin/env node

/**
 * Message Alignment Verification
 *
 * This script verifies that Czech and English messages maintain the same conversion focus
 * and addresses the issues found in the cross-language consistency check.
 *
 * Requirements covered:
 * - 3.1: English content maintains same emotional tone and professional quality
 * - 3.3: Both language versions are consistent in structure and messaging approach
 * - 3.4: Cultural appropriateness for international audience
 */

const fs = require('fs');
const path = require('path');

class MessageAlignmentVerifier {
  constructor() {
    this.csPath = path.join(__dirname, '../messages/cs.json');
    this.enPath = path.join(__dirname, '../messages/en.json');
    this.alignmentIssues = [];
    this.recommendations = [];
  }

  async verifyAlignment() {
    console.log('🎯 Starting Message Alignment Verification...\n');

    try {
      // Load both language files
      const csContent = JSON.parse(fs.readFileSync(this.csPath, 'utf8'));
      const enContent = JSON.parse(fs.readFileSync(this.enPath, 'utf8'));

      // Verify different aspects of alignment
      this.verifyConversionFocusAlignment(csContent, enContent);
      this.verifyEmotionalToneAlignment(csContent, enContent);
      this.verifyTrustBuildingAlignment(csContent, enContent);
      this.verifyCTAAlignment(csContent, enContent);
      this.verifyValuePropositionAlignment(csContent, enContent);
      this.verifyCulturalAdaptation(csContent, enContent);

      // Generate alignment report
      this.generateAlignmentReport();

    } catch (error) {
      console.error('❌ Error during message alignment verification:', error.message);
      process.exit(1);
    }
  }

  verifyConversionFocusAlignment(csContent, enContent) {
    console.log('💰 Verifying conversion focus alignment...');

    // Check hero section conversion focus
    const csHero = csContent.home.hero;
    const enHero = enContent.home.hero;

    this.checkConversionElement('Hero Title', csHero.title, enHero.title, {
      shouldBeCompelling: true,
      shouldIncludeValueProp: true
    });

    this.checkConversionElement('Hero CTA', csHero.cta, enHero.cta, {
      shouldBeActionOriented: true,
      shouldCreateUrgency: false // Respectful for funeral context
    });

    // Check benefits conversion focus
    const csBenefits = csContent.home.benefits.items;
    const enBenefits = enContent.home.benefits.items;

    if (csBenefits && enBenefits) {
      csBenefits.forEach((csBenefit, index) => {
        const enBenefit = enBenefits[index];
        if (enBenefit) {
          this.checkConversionElement(
            `Benefit ${index + 1} Title`,
            csBenefit.title,
            enBenefit.title,
            { shouldHighlightValue: true }
          );

          this.checkConversionElement(
            `Benefit ${index + 1} Description`,
            csBenefit.description,
            enBenefit.description,
            { shouldBuildTrust: true, shouldBeSpecific: true }
          );
        }
      });
    }
  }

  verifyEmotionalToneAlignment(csContent, enContent) {
    console.log('💝 Verifying emotional tone alignment...');

    const emotionalSections = [
      { path: 'home.hero.description', name: 'Hero Description' },
      { path: 'home.philosophy.text', name: 'Philosophy Text' },
      { path: 'about.story', name: 'About Story' },
      { path: 'about.mission', name: 'Mission Statement' }
    ];

    emotionalSections.forEach(({ path, name }) => {
      const csText = this.getNestedValue(csContent, path);
      const enText = this.getNestedValue(enContent, path);

      if (csText && enText) {
        this.checkEmotionalAlignment(name, csText, enText);
      }
    });
  }

  verifyTrustBuildingAlignment(csContent, enContent) {
    console.log('🤝 Verifying trust-building alignment...');

    // Check benefits for trust-building elements
    const csBenefits = csContent.home.benefits.items;
    const enBenefits = enContent.home.benefits.items;

    if (csBenefits && enBenefits) {
      csBenefits.forEach((csBenefit, index) => {
        const enBenefit = enBenefits[index];
        if (enBenefit) {
          this.checkTrustBuilding(
            `Benefit ${index + 1}`,
            csBenefit.description,
            enBenefit.description
          );
        }
      });
    }

    // Check about section for credibility
    this.checkTrustBuilding('About Story', csContent.about.story, enContent.about.story);
    this.checkTrustBuilding('About Values', csContent.about.values, enContent.about.values);
  }

  verifyCTAAlignment(csContent, enContent) {
    console.log('🎯 Verifying CTA alignment...');

    const ctaPaths = [
      { path: 'home.hero.cta', name: 'Hero CTA' },
      { path: 'home.browseWreaths', name: 'Browse Wreaths CTA' },
      { path: 'product.addToCart', name: 'Add to Cart CTA' },
      { path: 'cart.checkout', name: 'Checkout CTA' }
    ];

    ctaPaths.forEach(({ path, name }) => {
      const csText = this.getNestedValue(csContent, path);
      const enText = this.getNestedValue(enContent, path);

      if (csText && enText) {
        this.checkCTAAlignment(name, csText, enText);
      }
    });
  }

  verifyValuePropositionAlignment(csContent, enContent) {
    console.log('💎 Verifying value proposition alignment...');

    // Check hero subtitle and description
    this.checkValueProposition(
      'Hero Subtitle',
      csContent.home.hero.subtitle,
      enContent.home.hero.subtitle
    );

    this.checkValueProposition(
      'Hero Description',
      csContent.home.hero.description,
      enContent.home.hero.description
    );

    // Check footer description
    this.checkValueProposition(
      'Footer Description',
      csContent.footer.description,
      enContent.footer.description
    );
  }

  verifyCulturalAdaptation(csContent, enContent) {
    console.log('🌍 Verifying cultural adaptation...');

    // Check for cultural elements that need adaptation
    const culturalChecks = [
      {
        name: 'Currency Format',
        csValue: csContent.currency.format,
        enValue: enContent.currency.format,
        shouldDiffer: false, // Both can use CZK for Czech business
        note: 'Consider adding currency explanation for international users'
      },
      {
        name: 'Company Legal Form',
        csValue: csContent.footer.company,
        enValue: enContent.footer.company,
        shouldDiffer: false, // Legal name should be consistent
        note: 'Consider adding explanation of s.r.o. for international users'
      },
      {
        name: 'Business Context',
        csValue: csContent.about.story,
        enValue: enContent.about.story,
        shouldDiffer: true, // Should be culturally adapted
        note: 'English version should be accessible to international audience'
      }
    ];

    culturalChecks.forEach(check => {
      this.checkCulturalAdaptation(check);
    });
  }

  // Helper methods for specific checks
  checkConversionElement(name, csText, enText, criteria) {
    const issues = [];

    if (criteria.shouldBeActionOriented) {
      const csAction = this.isActionOriented(csText, 'cs');
      const enAction = this.isActionOriented(enText, 'en');

      if (csAction !== enAction) {
        issues.push('Action orientation mismatch');
      }
    }

    if (criteria.shouldBeCompelling) {
      const csCompelling = this.isCompelling(csText, 'cs');
      const enCompelling = this.isCompelling(enText, 'en');

      if (!csCompelling || !enCompelling) {
        issues.push('Not sufficiently compelling');
      }
    }

    if (issues.length > 0) {
      this.alignmentIssues.push({
        type: 'CONVERSION_FOCUS',
        element: name,
        issues: issues,
        czech: csText,
        english: enText
      });
    }
  }

  checkEmotionalAlignment(name, csText, enText) {
    const csEmotional = this.countEmotionalWords(csText, 'cs');
    const enEmotional = this.countEmotionalWords(enText, 'en');

    // Allow some variance but flag significant differences
    const variance = Math.abs(csEmotional - enEmotional);

    if (variance > 2) {
      this.alignmentIssues.push({
        type: 'EMOTIONAL_TONE',
        element: name,
        issue: 'Significant emotional tone variance',
        czech: `${csEmotional} emotional words`,
        english: `${enEmotional} emotional words`,
        recommendation: 'Adjust emotional language to maintain consistent tone'
      });
    }
  }

  checkTrustBuilding(name, csText, enText) {
    const csTrust = this.countTrustBuildingWords(csText, 'cs');
    const enTrust = this.countTrustBuildingWords(enText, 'en');

    if (csTrust === 0 && enTrust === 0) {
      this.alignmentIssues.push({
        type: 'TRUST_BUILDING',
        element: name,
        issue: 'No trust-building language detected',
        recommendation: 'Add credibility indicators or quality assurances'
      });
    } else if (Math.abs(csTrust - enTrust) > 1) {
      this.alignmentIssues.push({
        type: 'TRUST_BUILDING',
        element: name,
        issue: 'Trust-building language imbalance',
        czech: `${csTrust} trust words`,
        english: `${enTrust} trust words`,
        recommendation: 'Balance trust-building elements between languages'
      });
    }
  }

  checkCTAAlignment(name, csText, enText) {
    const csAction = this.isActionOriented(csText, 'cs');
    const enAction = this.isActionOriented(enText, 'en');

    if (!csAction || !enAction) {
      this.alignmentIssues.push({
        type: 'CTA_ALIGNMENT',
        element: name,
        issue: 'CTA not action-oriented in one or both languages',
        czech: csText,
        english: enText,
        recommendation: 'Ensure both CTAs use action verbs'
      });
    }

    // Check length similarity for CTAs
    const lengthRatio = Math.min(csText.length, enText.length) / Math.max(csText.length, enText.length);
    if (lengthRatio < 0.6) {
      this.alignmentIssues.push({
        type: 'CTA_ALIGNMENT',
        element: name,
        issue: 'CTA length significantly different',
        czech: `${csText.length} chars`,
        english: `${enText.length} chars`,
        recommendation: 'Maintain similar CTA length for consistent UI'
      });
    }
  }

  checkValueProposition(name, csText, enText) {
    const csValue = this.hasValueProposition(csText, 'cs');
    const enValue = this.hasValueProposition(enText, 'en');

    if (!csValue || !enValue) {
      this.alignmentIssues.push({
        type: 'VALUE_PROPOSITION',
        element: name,
        issue: 'Weak value proposition in one or both languages',
        recommendation: 'Strengthen value proposition with specific benefits'
      });
    }
  }

  checkCulturalAdaptation(check) {
    if (check.shouldDiffer && check.csValue === check.enValue) {
      this.alignmentIssues.push({
        type: 'CULTURAL_ADAPTATION',
        element: check.name,
        issue: 'Content not culturally adapted',
        recommendation: check.note
      });
    }

    if (check.note) {
      this.recommendations.push({
        element: check.name,
        recommendation: check.note
      });
    }
  }

  // Utility methods
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current && current[key], obj);
  }

  isActionOriented(text, language) {
    const actionWords = {
      cs: ['vybrat', 'objednat', 'koupit', 'přidat', 'pokračovat', 'dokončit', 'kontaktovat', 'prohlédnout'],
      en: ['choose', 'select', 'order', 'buy', 'add', 'proceed', 'complete', 'contact', 'browse']
    };

    const words = actionWords[language] || [];
    return words.some(word => text.toLowerCase().includes(word.toLowerCase()));
  }

  isCompelling(text, language) {
    const compellingWords = {
      cs: ['nejlepší', 'jedinečný', 'výjimečný', 'prémiový', 'garantujeme', 'zaručujeme'],
      en: ['best', 'unique', 'exceptional', 'premium', 'guarantee', 'ensure', 'exclusive']
    };

    const words = compellingWords[language] || [];
    return words.some(word => text.toLowerCase().includes(word.toLowerCase())) || text.length > 20;
  }

  countEmotionalWords(text, language) {
    const emotionalWords = {
      cs: ['láska', 'úcta', 'cit', 'srdce', 'empatie', 'porozumění', 'důstojné', 'krásný', 'krásy', 'citem', 'pečlivostí'],
      en: ['love', 'respect', 'heart', 'empathy', 'understanding', 'dignified', 'beautiful', 'care', 'sensitivity', 'beauty']
    };

    const words = emotionalWords[language] || [];
    return words.reduce((count, word) => {
      return count + (text.toLowerCase().split(word.toLowerCase()).length - 1);
    }, 0);
  }

  countTrustBuildingWords(text, language) {
    const trustWords = {
      cs: ['garance', 'kvalita', 'spolehlivé', 'pečlivá', 'profesionální', 'zkušený', 'důvěra', 'zaručujeme'],
      en: ['guarantee', 'quality', 'reliable', 'careful', 'professional', 'experienced', 'trust', 'premium', 'ensure']
    };

    const words = trustWords[language] || [];
    return words.reduce((count, word) => {
      return count + (text.toLowerCase().split(word.toLowerCase()).length - 1);
    }, 0);
  }

  hasValueProposition(text, language) {
    const valueWords = {
      cs: ['rychlé', 'kvalitní', 'ruční', 'prémiové', 'nejlepší', 'výjimečný', 'garance'],
      en: ['fast', 'quality', 'handcrafted', 'premium', 'best', 'exceptional', 'guarantee', 'unique']
    };

    const words = valueWords[language] || [];
    return words.some(word => text.toLowerCase().includes(word.toLowerCase()));
  }

  generateAlignmentReport() {
    console.log('\n🎯 MESSAGE ALIGNMENT VERIFICATION REPORT');
    console.log('========================================\n');

    console.log('📊 ALIGNMENT STATISTICS:');
    console.log(`Total alignment issues found: ${this.alignmentIssues.length}`);
    console.log(`Recommendations provided: ${this.recommendations.length}\n`);

    if (this.alignmentIssues.length > 0) {
      console.log('⚠️  ALIGNMENT ISSUES:');

      const issuesByType = this.groupIssuesByType();

      Object.keys(issuesByType).forEach(type => {
        console.log(`\n${type}:`);
        issuesByType[type].forEach((issue, index) => {
          console.log(`  ${index + 1}. ${issue.element}: ${issue.issue || issue.issues?.join(', ')}`);
          if (issue.czech && issue.english) {
            console.log(`     Czech: "${issue.czech}"`);
            console.log(`     English: "${issue.english}"`);
          }
          if (issue.recommendation) {
            console.log(`     💡 ${issue.recommendation}`);
          }
        });
      });
    }

    if (this.recommendations.length > 0) {
      console.log('\n💡 GENERAL RECOMMENDATIONS:');
      this.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec.element}: ${rec.recommendation}`);
      });
    }

    console.log('\n📋 SUMMARY:');
    if (this.alignmentIssues.length === 0) {
      console.log('✅ Message alignment verification passed! Both language versions maintain consistent conversion focus.');
    } else {
      console.log(`⚠️  Found ${this.alignmentIssues.length} alignment issues that should be addressed.`);

      console.log('\n🔧 PRIORITY ACTIONS:');
      console.log('1. Address CTA alignment issues (highest priority)');
      console.log('2. Balance emotional tone between languages');
      console.log('3. Ensure consistent trust-building elements');
      console.log('4. Review value proposition clarity');
      console.log('5. Consider cultural adaptation recommendations');
    }

    // Save detailed report
    const reportData = {
      timestamp: new Date().toISOString(),
      totalIssues: this.alignmentIssues.length,
      totalRecommendations: this.recommendations.length,
      issues: this.alignmentIssues,
      recommendations: this.recommendations
    };

    fs.writeFileSync(
      path.join(__dirname, '../message-alignment-report.json'),
      JSON.stringify(reportData, null, 2)
    );

    console.log('\n📄 Detailed alignment report saved to: message-alignment-report.json');

    // Exit with appropriate code
    process.exit(this.alignmentIssues.filter(issue => issue.type === 'CTA_ALIGNMENT').length > 0 ? 1 : 0);
  }

  groupIssuesByType() {
    const grouped = {};
    this.alignmentIssues.forEach(issue => {
      if (!grouped[issue.type]) {
        grouped[issue.type] = [];
      }
      grouped[issue.type].push(issue);
    });
    return grouped;
  }
}

// Run the verification
if (require.main === module) {
  const verifier = new MessageAlignmentVerifier();
  verifier.verifyAlignment();
}

module.exports = MessageAlignmentVerifier;
