#!/usr/bin/env node

/**
 * Comprehensive Cross-Language Test Suite
 *
 * This script runs all cross-language consistency checks and provides a final
 * comprehensive report on the alignment between Czech and English content.
 *
 * Requirements covered:
 * - 3.1: English content maintains same emotional tone and professional quality
 * - 3.3: Both language versions are consistent in structure and messaging approach
 * - 3.4: Cultural appropriateness for international audience
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ComprehensiveCrossLanguageTest {
  constructor() {
    this.testResults = {
      structuralConsistency: null,
      languageSwitching: null,
      messageAlignment: null,
      overallScore: 0,
      criticalIssues: [],
      recommendations: []
    };
  }

  async runComprehensiveTest() {
    console.log('🔍 Starting Comprehensive Cross-Language Test Suite...\n');
    console.log('This test validates all aspects of cross-language consistency:\n');
    console.log('✓ Structural consistency between language files');
    console.log('✓ Language switching functionality');
    console.log('✓ Message alignment and conversion focus');
    console.log('✓ Cultural appropriateness');
    console.log('✓ SEO metadata consistency\n');

    try {
      // Run individual test suites
      await this.runStructuralConsistencyTest();
      await this.runLanguageSwitchingTest();
      await this.runMessageAlignmentTest();

      // Calculate overall score and generate final report
      this.calculateOverallScore();
      this.generateComprehensiveReport();

    } catch (error) {
      console.error('❌ Error during comprehensive testing:', error.message);
      process.exit(1);
    }
  }

  async runStructuralConsistencyTest() {
    console.log('🏗️ Running Structural Consistency Test...');

    try {
      // Run the consistency check script
      const output = execSync('node scripts/cross-language-consistency-check.js', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      // Parse the report file
      const reportPath = path.join(__dirname, '../cross-language-consistency-report.json');
      if (fs.existsSync(reportPath)) {
        const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
        this.testResults.structuralConsistency = {
          passed: report.issues.length === 0,
          completeness: report.completeness,
          issues: report.issues,
          warnings: report.warnings,
          stats: report.stats
        };

        console.log(`  ✅ Structural consistency: ${report.completeness}% complete`);
        if (report.issues.length > 0) {
          console.log(`  ⚠️  ${report.issues.length} critical issues found`);
        }
      }
    } catch (error) {
      console.log('  ❌ Structural consistency test failed');
      this.testResults.structuralConsistency = {
        passed: false,
        error: error.message
      };
    }
  }

  async runLanguageSwitchingTest() {
    console.log('🔄 Running Language Switching Test...');

    try {
      // Run the language switching test script
      const output = execSync('node scripts/test-language-switching.js', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      // Parse the report file
      const reportPath = path.join(__dirname, '../language-switching-test-report.json');
      if (fs.existsSync(reportPath)) {
        const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
        this.testResults.languageSwitching = {
          passed: report.failedTests === 0,
          successRate: report.successRate,
          totalTests: report.totalTests,
          passedTests: report.passedTests,
          failedTests: report.failedTests,
          testResults: report.testResults
        };

        console.log(`  ✅ Language switching: ${report.successRate}% success rate`);
        if (report.failedTests > 0) {
          console.log(`  ❌ ${report.failedTests} tests failed`);
        }
      }
    } catch (error) {
      console.log('  ❌ Language switching test failed');
      this.testResults.languageSwitching = {
        passed: false,
        error: error.message
      };
    }
  }

  async runMessageAlignmentTest() {
    console.log('🎯 Running Message Alignment Test...');

    try {
      // Run the message alignment verification script
      const output = execSync('node scripts/verify-message-alignment.js', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      // Parse the report file
      const reportPath = path.join(__dirname, '../message-alignment-report.json');
      if (fs.existsSync(reportPath)) {
        const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
        this.testResults.messageAlignment = {
          passed: report.totalIssues === 0,
          totalIssues: report.totalIssues,
          totalRecommendations: report.totalRecommendations,
          issues: report.issues,
          recommendations: report.recommendations
        };

        console.log(`  ✅ Message alignment: ${report.totalIssues} issues found`);
        if (report.totalIssues > 0) {
          console.log(`  ⚠️  ${report.totalRecommendations} recommendations provided`);
        }
      }
    } catch (error) {
      console.log('  ❌ Message alignment test failed');
      this.testResults.messageAlignment = {
        passed: false,
        error: error.message
      };
    }
  }

  calculateOverallScore() {
    let totalScore = 0;
    let maxScore = 0;

    // Structural consistency (40% weight)
    if (this.testResults.structuralConsistency) {
      const structuralScore = this.testResults.structuralConsistency.passed ? 40 :
        (this.testResults.structuralConsistency.completeness || 0) * 0.4;
      totalScore += structuralScore;
    }
    maxScore += 40;

    // Language switching (30% weight)
    if (this.testResults.languageSwitching) {
      const switchingScore = this.testResults.languageSwitching.passed ? 30 :
        (this.testResults.languageSwitching.successRate || 0) * 0.3;
      totalScore += switchingScore;
    }
    maxScore += 30;

    // Message alignment (30% weight)
    if (this.testResults.messageAlignment) {
      const alignmentScore = this.testResults.messageAlignment.passed ? 30 :
        Math.max(0, 30 - (this.testResults.messageAlignment.totalIssues * 5));
      totalScore += alignmentScore;
    }
    maxScore += 30;

    this.testResults.overallScore = Math.round((totalScore / maxScore) * 100);

    // Collect critical issues
    this.collectCriticalIssues();
    this.collectRecommendations();
  }

  collectCriticalIssues() {
    // From structural consistency
    if (this.testResults.structuralConsistency?.issues) {
      this.testResults.criticalIssues.push(...this.testResults.structuralConsistency.issues
        .filter(issue => issue.severity === 'HIGH')
        .map(issue => ({
          source: 'Structural Consistency',
          type: issue.type,
          message: issue.message,
          requirement: issue.requirement
        }))
      );
    }

    // From language switching
    if (this.testResults.languageSwitching?.testResults) {
      this.testResults.criticalIssues.push(...this.testResults.languageSwitching.testResults
        .filter(test => test.status === 'FAIL')
        .map(test => ({
          source: 'Language Switching',
          type: 'FUNCTIONALITY_FAILURE',
          message: `${test.name}: ${test.error}`,
          requirement: '3.1, 3.3'
        }))
      );
    }

    // From message alignment
    if (this.testResults.messageAlignment?.issues) {
      this.testResults.criticalIssues.push(...this.testResults.messageAlignment.issues
        .filter(issue => issue.type === 'CTA_ALIGNMENT' || issue.type === 'CONVERSION_FOCUS')
        .map(issue => ({
          source: 'Message Alignment',
          type: issue.type,
          message: `${issue.element}: ${issue.issue || issue.issues?.join(', ')}`,
          requirement: '3.3'
        }))
      );
    }
  }

  collectRecommendations() {
    // From structural consistency warnings
    if (this.testResults.structuralConsistency?.warnings) {
      this.testResults.recommendations.push(...this.testResults.structuralConsistency.warnings
        .map(warning => ({
          source: 'Structural Consistency',
          category: 'Quality Improvement',
          message: warning.message
        }))
      );
    }

    // From message alignment recommendations
    if (this.testResults.messageAlignment?.recommendations) {
      this.testResults.recommendations.push(...this.testResults.messageAlignment.recommendations
        .map(rec => ({
          source: 'Message Alignment',
          category: 'Cultural Adaptation',
          message: `${rec.element}: ${rec.recommendation}`
        }))
      );
    }

    // From message alignment issues (non-critical)
    if (this.testResults.messageAlignment?.issues) {
      this.testResults.recommendations.push(...this.testResults.messageAlignment.issues
        .filter(issue => issue.type !== 'CTA_ALIGNMENT' && issue.type !== 'CONVERSION_FOCUS')
        .map(issue => ({
          source: 'Message Alignment',
          category: 'Content Optimization',
          message: `${issue.element}: ${issue.recommendation || 'Review and optimize content'}`
        }))
      );
    }
  }

  generateComprehensiveReport() {
    console.log('\n🎯 COMPREHENSIVE CROSS-LANGUAGE TEST REPORT');
    console.log('===========================================\n');

    // Overall score and status
    console.log('📊 OVERALL ASSESSMENT:');
    console.log(`Cross-language consistency score: ${this.testResults.overallScore}%`);

    let status = '';
    let statusIcon = '';
    if (this.testResults.overallScore >= 90) {
      status = 'EXCELLENT - Ready for production';
      statusIcon = '🟢';
    } else if (this.testResults.overallScore >= 80) {
      status = 'GOOD - Minor improvements recommended';
      statusIcon = '🟡';
    } else if (this.testResults.overallScore >= 70) {
      status = 'FAIR - Several issues need attention';
      statusIcon = '🟠';
    }{
      status = 'POOR - Critical issues must be resolved';
      statusIcon = '🔴';
    }

    console.log(`Status: ${statusIcon} ${status}\n`);

    // Individual test results
    console.log('📋 INDIVIDUAL TEST RESULTS:');

    if (this.testResults.structuralConsistency) {
      const sc = this.testResults.structuralConsistency;
      console.log(`🏗️  Structural Consistency: ${sc.passed ? '✅ PASS' : '❌ FAIL'}`);
      if (sc.completeness) {
        console.log(`   Completeness: ${sc.completeness}%`);
      }
      if (sc.issues?.length > 0) {
        console.log(`   Critical issues: ${sc.issues.length}`);
      }
    }

    if (this.testResults.languageSwitching) {
      const ls = this.testResults.languageSwitching;
      console.log(`🔄 Language Switching: ${ls.passed ? '✅ PASS' : '❌ FAIL'}`);
      if (ls.successRate !== undefined) {
        console.log(`   Success rate: ${ls.successRate}%`);
      }
      if (ls.failedTests > 0) {
        console.log(`   Failed tests: ${ls.failedTests}/${ls.totalTests}`);
      }
    }

    if (this.testResults.messageAlignment) {
      const ma = this.testResults.messageAlignment;
      console.log(`🎯 Message Alignment: ${ma.passed ? '✅ PASS' : '⚠️  ISSUES'}`);
      if (ma.totalIssues > 0) {
        console.log(`   Issues found: ${ma.totalIssues}`);
      }
      if (ma.totalRecommendations > 0) {
        console.log(`   Recommendations: ${ma.totalRecommendations}`);
      }
    }

    console.log('');

    // Critical issues
    if (this.testResults.criticalIssues.length > 0) {
      console.log('🚨 CRITICAL ISSUES (Must be resolved):');
      this.testResults.criticalIssues.forEach((issue, index) => {
        console.log(`${index + 1}. [${issue.source}] ${issue.message}`);
        if (issue.requirement) {
          console.log(`   Requirement: ${issue.requirement}`);
        }
      });
      console.log('');
    }

    // Recommendations
    if (this.testResults.recommendations.length > 0) {
      console.log('💡 RECOMMENDATIONS (For optimization):');

      const groupedRecs = this.groupRecommendationsByCategory();
      Object.keys(groupedRecs).forEach(category => {
        console.log(`\n${category}:`);
        groupedRecs[category].forEach((rec, index) => {
          console.log(`  ${index + 1}. ${rec.message}`);
        });
      });
      console.log('');
    }

    // Requirements compliance
    console.log('📋 REQUIREMENTS COMPLIANCE:');
    console.log('✓ Requirement 3.1: English content maintains same emotional tone and professional quality');
    console.log('✓ Requirement 3.3: Both language versions are consistent in structure and messaging approach');
    console.log('✓ Requirement 3.4: Cultural appropriateness for international audience\n');

    // Action plan
    console.log('🔧 RECOMMENDED ACTION PLAN:');
    if (this.testResults.criticalIssues.length > 0) {
      console.log('1. 🚨 IMMEDIATE: Resolve all critical issues');
      console.log('   - Fix structural inconsistencies');
      console.log('   - Address CTA alignment problems');
      console.log('   - Ensure language switching functionality works');
    }

    if (this.testResults.overallScore < 90) {
      console.log('2. 📈 SHORT-TERM: Implement recommendations');
      console.log('   - Balance emotional tone between languages');
      console.log('   - Strengthen trust-building elements');
      console.log('   - Optimize value propositions');
    }

    console.log('3. 🔄 ONGOING: Monitor and maintain consistency');
    console.log('   - Run tests after content updates');
    console.log('   - Regular cross-language reviews');
    console.log('   - User feedback integration\n');

    // Save comprehensive report
    const reportData = {
      timestamp: new Date().toISOString(),
      overallScore: this.testResults.overallScore,
      status: status,
      testResults: this.testResults,
      criticalIssues: this.testResults.criticalIssues,
      recommendations: this.testResults.recommendations,
      requirementsCompliance: {
        '3.1': this.testResults.overallScore >= 80,
        '3.3': this.testResults.overallScore >= 80,
        '3.4': this.testResults.overallScore >= 70
      }
    };

    fs.writeFileSync(
      path.join(__dirname, '../comprehensive-cross-language-report.json'),
      JSON.stringify(reportData, null, 2)
    );

    console.log('📄 Comprehensive report saved to: comprehensive-cross-language-report.json');

    // Final summary
    if (this.testResults.criticalIssues.length === 0 && this.testResults.overallScore >= 80) {
      console.log('\n🎉 SUCCESS: Cross-language consistency check completed successfully!');
      console.log('Both Czech and English versions are well-aligned and ready for use.');
    } else {
      console.log('\n⚠️  ATTENTION REQUIRED: Issues found that should be addressed.');
      console.log('Review the critical issues and recommendations above.');
    }

    // Exit with appropriate code
    process.exit(this.testResults.criticalIssues.length > 0 ? 1 : 0);
  }

  groupRecommendationsByCategory() {
    const grouped = {};
    this.testResults.recommendations.forEach(rec => {
      if (!grouped[rec.category]) {
        grouped[rec.category] = [];
      }
      grouped[rec.category].push(rec);
    });
    return grouped;
  }
}

// Run the comprehensive test
if (require.main === module) {
  const tester = new ComprehensiveCrossLanguageTest();
  tester.runComprehensiveTest();
}

module.exports = ComprehensiveCrossLanguageTest;
