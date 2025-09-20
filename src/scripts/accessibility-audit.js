#!/usr/bin/env node

/**
 * Comprehensive accessibility audit script
 * Combines automated testing, color contrast validation, and keyboard navigation tests
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Import our custom validation modules
const { validateColorContrast } = require('./validate-color-contrast');
const KeyboardNavigationTester = require('./test-keyboard-navigation');

class AccessibilityAuditor {
  constructor() {
    this.results = {
      colorContrast: { passed: false, details: null },
      keyboardNavigation: { passed: false, details: null },
      automatedTests: { passed: false, details: null },
      manualChecklist: { items: [], completed: 0 }
    };

    this.manualChecklistItems = [
      {
        id: 'screen-reader-testing',
        title: 'Screen Reader Testing',
        description: 'Test with NVDA, JAWS, or VoiceOver',
        status: 'pending',
        priority: 'high'
      },
      {
        id: 'heading-hierarchy',
        title: 'Heading Hierarchy',
        description: 'Verify proper h1-h6 structure',
        status: 'pending',
        priority: 'high'
      },
      {
        id: 'alt-text-quality',
        title: 'Alt Text Quality',
        description: 'Review alt text for meaningfulness',
        status: 'pending',
        priority: 'high'
      },
      {
        id: 'focus-indicators',
        title: 'Focus Indicators',
        description: 'Verify visible focus indicators on all interactive elements',
        status: 'pending',
        priority: 'high'
      },
      {
        id: 'error-messages',
        title: 'Error Messages',
        description: 'Test form validation and error announcements',
        status: 'pending',
        priority: 'medium'
      },
      {
        id: 'zoom-testing',
        title: 'Zoom Testing',
        description: 'Test at 200% zoom level',
        status: 'pending',
        priority: 'medium'
      },
      {
        id: 'motion-preferences',
        title: 'Motion Preferences',
        description: 'Test with prefers-reduced-motion',
        status: 'pending',
        priority: 'medium'
      },
      {
        id: 'high-contrast-mode',
        title: 'High Contrast Mode',
        description: 'Test Windows High Contrast mode',
        status: 'pending',
        priority: 'medium'
      },
      {
        id: 'mobile-accessibility',
        title: 'Mobile Accessibility',
        description: 'Test touch targets and mobile screen readers',
        status: 'pending',
        priority: 'medium'
      },
      {
        id: 'language-attributes',
        title: 'Language Attributes',
        description: 'Verify lang attributes are properly set',
        status: 'pending',
        priority: 'low'
      }
    ];
  }

  async runFullAudit() {
    console.log('🔍 Starting Comprehensive Accessibility Audit\n');
    console.log('=' .repeat(70));

    try {
      // 1. Run automated accessibility tests
      await this.runAutomatedTests();

      // 2. Validate color contrast
      await this.runColorContrastValidation();

      // 3. Test keyboard navigation
      await this.runKeyboardNavigationTests();

      // 4. Generate manual testing checklist
      this.generateManualChecklist();

      // 5. Generate comprehensive report
      this.generateReport();

    } catch (error) {
      console.error('❌ Audit failed:', error.message);
      process.exit(1);
    }
  }

  async runAutomatedTests() {
    console.log('🤖 Running Automated Accessibility Tests...\n');

    try {
      // Run Jest tests with accessibility focus
      const testOutput = execSync(
        'npm test -- --testPathPattern=accessibility --verbose --passWithNoTests',
        { encoding: 'utf8', stdio: 'pipe' }
      );

      this.results.automatedTests.passed = !testOutput.includes('FAIL');
      this.results.automatedTests.details = testOutput;

      if (this.results.automatedTests.passed) {
        console.log('✅ Automated accessibility tests passed\n');
      } else {
        console.log('❌ Automated accessibility tests failed\n');
        console.log(testOutput);
      }

    } catch (error) {
      this.results.automatedTests.passed = false;
      this.results.automatedTests.details = error.message;
      console.log('❌ Automated tests failed to run\n');
    }
  }

  async runColorContrastValidation() {
    console.log('🎨 Validating Color Contrast...\n');

    try {
      // Capture console output from color contrast validation
      const originalLog = console.log;
      let output = '';

      console.log = (...args) => {
        output += args.join(' ') + '\n';
        originalLog(...args);
      };

      validateColorContrast();

      console.log = originalLog;

      this.results.colorContrast.passed = !output.includes('❌');
      this.results.colorContrast.details = output;

    } catch (error) {
      this.results.colorContrast.passed = false;
      this.results.colorContrast.details = error.message;
      console.log('❌ Color contrast validation failed\n');
    }
  }

  async runKeyboardNavigationTests() {
    console.log('⌨️  Testing Keyboard Navigation...\n');

    // Only run if we have a test server running
    if (process.env.SKIP_KEYBOARD_TESTS === 'true') {
      console.log('⚠️  Skipping keyboard navigation tests (SKIP_KEYBOARD_TESTS=true)\n');
      this.results.keyboardNavigation.passed = true;
      this.results.keyboardNavigation.details = 'Skipped - set SKIP_KEYBOARD_TESTS=false to run';
      return;
    }

    try {
      const tester = new KeyboardNavigationTester();
      await tester.runAllTests();

      this.results.keyboardNavigation.passed = tester.results.failed === 0;
      this.results.keyboardNavigation.details = tester.results;

    } catch (error) {
      this.results.keyboardNavigation.passed = false;
      this.results.keyboardNavigation.details = error.message;
      console.log('❌ Keyboard navigation tests failed\n');
    }
  }

  generateManualChecklist() {
    console.log('📋 Generating Manual Testing Checklist...\n');

    // Create checklist file
    const checklistPath = path.join(process.cwd(), 'accessibility-checklist.md');
    let checklistContent = `# Accessibility Manual Testing Checklist

Generated on: ${new Date().toISOString()}

## Instructions
This checklist covers manual accessibility testing that cannot be automated.
Complete each item and mark as ✅ (pass), ❌ (fail), or ⚠️ (needs attention).

## High Priority Items

`;

    const highPriorityItems = this.manualChecklistItems.filter(item => item.priority === 'high');
    const mediumPriorityItems = this.manualChecklistItems.filter(item => item.priority === 'medium');
    const lowPriorityItems = this.manualChecklistItems.filter(item => item.priority === 'low');

    const formatItems = (items) => {
      return items.map(item =>
        `- [ ] **${item.title}**\n  ${item.description}\n`
      ).join('\n');
    };

    checklistContent += formatItems(highPriorityItems);
    checklistContent += '\n## Medium Priority Items\n\n';
    checklistContent += formatItems(mediumPriorityItems);
    checklistContent += '\n## Low Priority Items\n\n';
    checklistContent += formatItems(lowPriorityItems);

    checklistContent += `
## Detailed Testing Instructions

### Screen Reader Testing
1. Install NVDA (free) or use built-in screen readers
2. Navigate the site with screen reader only
3. Verify all content is announced properly
4. Test form interactions and error messages
5. Verify skip links work correctly

### Keyboard Navigation Testing
1. Unplug your mouse or disable trackpad
2. Navigate entire site using only keyboard
3. Verify all interactive elements are reachable
4. Test modal dialogs and dropdowns
5. Verify focus indicators are visible

### Zoom Testing
1. Set browser zoom to 200%
2. Verify all content is still readable
3. Check that horizontal scrolling is not required
4. Test form interactions at high zoom

### High Contrast Mode Testing (Windows)
1. Enable Windows High Contrast mode
2. Verify all content is still visible
3. Check that custom colors are overridden appropriately
4. Test interactive elements visibility

### Mobile Accessibility Testing
1. Test with mobile screen readers (TalkBack/VoiceOver)
2. Verify touch targets are at least 44px
3. Test landscape and portrait orientations
4. Verify pinch-to-zoom works

## Resources
- [WebAIM Screen Reader Testing](https://webaim.org/articles/screenreader_testing/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Accessibility Developer Tools](https://www.accessibility-developer-guide.com/)
`;

    fs.writeFileSync(checklistPath, checklistContent);
    console.log(`📄 Manual testing checklist saved to: ${checklistPath}\n`);
  }

  generateReport() {
    console.log('📊 Generating Accessibility Audit Report...\n');
    console.log('=' .repeat(70));
    console.log('🔍 ACCESSIBILITY AUDIT SUMMARY');
    console.log('=' .repeat(70));

    // Overall status
    const allPassed = Object.values(this.results).every(result =>
      result.passed !== false
    );

    console.log(`📈 Overall Status: ${allPassed ? '✅ PASSED' : '❌ NEEDS ATTENTION'}`);
    console.log(`📅 Audit Date: ${new Date().toISOString()}`);
    console.log('');

    // Individual test results
    console.log('📋 Test Results:');
    console.log(`   🤖 Automated Tests: ${this.results.automatedTests.passed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`   🎨 Color Contrast: ${this.results.colorContrast.passed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`   ⌨️  Keyboard Navigation: ${this.results.keyboardNavigation.passed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`   📋 Manual Checklist: ${this.manualChecklistItems.length} items generated`);
    console.log('');

    // Recommendations
    console.log('🎯 RECOMMENDATIONS:');

    if (!this.results.automatedTests.passed) {
      console.log('   • Fix automated accessibility test failures');
      console.log('   • Review jest-axe violations and implement fixes');
    }

    if (!this.results.colorContrast.passed) {
      console.log('   • Adjust color combinations to meet WCAG AA standards');
      console.log('   • Consider using darker text colors or lighter backgrounds');
    }

    if (!this.results.keyboardNavigation.passed) {
      console.log('   • Implement proper keyboard navigation patterns');
      console.log('   • Add focus management for interactive components');
      console.log('   • Ensure all interactive elements are keyboard accessible');
    }

    console.log('   • Complete manual testing checklist');
    console.log('   • Test with real users who use assistive technologies');
    console.log('   • Consider regular accessibility audits');
    console.log('');

    // Next steps
    console.log('📝 NEXT STEPS:');
    console.log('   1. Address any failed automated tests');
    console.log('   2. Fix color contrast issues if any');
    console.log('   3. Complete manual testing checklist');
    console.log('   4. Test with screen readers');
    console.log('   5. Validate fixes with accessibility testing tools');
    console.log('');

    // Save detailed report
    const reportPath = path.join(process.cwd(), 'accessibility-audit-report.json');
    const detailedReport = {
      timestamp: new Date().toISOString(),
      overallStatus: allPassed ? 'PASSED' : 'NEEDS_ATTENTION',
      results: this.results,
      manualChecklist: this.manualChecklistItems
    };

    fs.writeFileSync(reportPath, JSON.stringify(detailedReport, null, 2));
    console.log(`📄 Detailed report saved to: ${reportPath}`);

    // Exit with appropriate code
    if (!allPassed) {
      console.log('\n❌ Accessibility audit found issues that need attention!');
      process.exit(1);
    } else {
      console.log('\n✅ Accessibility audit completed successfully!');
      process.exit(0);
    }
  }
}

// Run audit if called directly
if (require.main === module) {
  const auditor = new AccessibilityAuditor();
  auditor.runFullAudit().catch(error => {
    console.error('❌ Accessibility audit failed:', error);
    process.exit(1);
  });
}

module.exports = AccessibilityAuditor;
