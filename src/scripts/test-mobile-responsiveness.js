#!/usr/bin/env node

/**
 * Mobile Responsiveness Testing Script
 *
 * This script tests mobile responsiveness across all components
 * and validates mobile-first design implementation.
 */

const fs = require('fs');
const path = require('path');

// Mobile breakpoints to test
const BREAKPOINTS = {
  mobile: { width: 375, height: 667, name: 'iPhone SE' },
  mobileLarge: { width: 414, height: 896, name: 'iPhone 11 Pro Max' },
  tablet: { width: 768, height: 1024, name: 'iPad' },
  tabletLarge: { width: 1024, height: 1366, name: 'iPad Pro' },
  desktop: { width: 1280, height: 720, name: 'Desktop' },
  desktopLarge: { width: 1920, height: 1080, name: 'Large Desktop' }
};

// Components to test for mobile responsiveness
const COMPONENTS_TO_TEST = [
  'src/components/layout/Header.tsx',
  'src/components/layout/Footer.tsx',
  'src/components/layout/HeroSection.tsx',
  'src/components/product/ProductGrid.tsx',
  'src/components/product/ProductCard.tsx',
  'src/components/contact/ContactForm.tsx',
  'src/components/cart/ShoppingCart.tsx',
  'src/components/ui/Button.tsx',
  'src/components/ui/Card.tsx',
  'src/components/ui/Input.tsx'
];

// Mobile-specific patterns to check
const MOBILE_PATTERNS = {
  responsiveGrid: /grid-cols-1.*md:grid-cols-2.*lg:grid-cols-3/,
  mobileFirst: /^(?!.*lg:|.*md:|.*sm:).*\b(w-|h-|p-|m-|text-|bg-)/,
  touchTargets: /p-[3-9]|py-[3-9]|px-[3-9]|min-h-\[44px\]|min-h-11/,
  mobileMenu: /md:hidden|lg:hidden|mobile|hamburger/i,
  responsiveText: /text-(sm|base|lg|xl|2xl|3xl|4xl|5xl).*md:text-|lg:text-/,
  responsivePadding: /p-\d+.*md:p-|lg:p-|px-\d+.*md:px-|lg:px-/,
  responsiveMargin: /m-\d+.*md:m-|lg:m-|mx-\d+.*md:mx-|lg:mx-/,
  flexDirection: /flex-col.*md:flex-row|lg:flex-row/,
  hiddenOnMobile: /hidden.*md:block|lg:block/,
  visibleOnMobile: /block.*md:hidden|lg:hidden/
};

// Touch interaction patterns
const TOUCH_PATTERNS = {
  touchTargets: /min-h-\[44px\]|min-h-11|p-[3-9]|py-[3-9]/,
  hoverStates: /:hover/g,
  focusStates: /:focus|focus:/g,
  activeStates: /:active|active:/g,
  touchCallouts: /touch-callout|user-select/
};

class MobileResponsivenessAnalyzer {
  constructor() {
    this.results = {
      components: {},
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        warnings: 0
      },
      issues: []
    };
  }

  analyzeComponent(filePath) {
    console.log(`\n📱 Analyzing ${filePath}...`);

    if (!fs.existsSync(filePath)) {
      console.log(`❌ File not found: ${filePath}`);
      return { status: 'error', message: 'File not found' };
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const componentName = path.basename(filePath, '.tsx');

    const analysis = {
      component: componentName,
      filePath,
      mobileFirst: this.checkMobileFirst(content),
      responsiveGrid: this.checkResponsiveGrid(content),
      touchTargets: this.checkTouchTargets(content),
      mobileMenu: this.checkMobileMenu(content),
      responsiveText: this.checkResponsiveText(content),
      responsiveSpacing: this.checkResponsiveSpacing(content),
      flexboxResponsive: this.checkFlexboxResponsive(content),
      imageOptimization: this.checkImageOptimization(content),
      touchInteractions: this.checkTouchInteractions(content),
      accessibilityMobile: this.checkMobileAccessibility(content),
      issues: [],
      score: 0
    };

    // Calculate score and identify issues
    this.calculateScore(analysis);
    this.results.components[componentName] = analysis;

    return analysis;
  }

  checkMobileFirst(content) {
    // Check for mobile-first approach (base classes without prefixes)
    const mobileFirstClasses = content.match(/className.*?["'`][^"'`]*["'`]/g) || [];
    let mobileFirstCount = 0;
    let totalClasses = 0;

    mobileFirstClasses.forEach(classString => {
      const classes = classString.match(/\b\w+(-\w+)*\b/g) || [];
      classes.forEach(cls => {
        if (cls.match(/^(w-|h-|p-|m-|text-|bg-|border-|rounded-)/)) {
          totalClasses++;
          if (!cls.match(/^(sm:|md:|lg:|xl:)/)) {
            mobileFirstCount++;
          }
        }
      });
    });

    const ratio = totalClasses > 0 ? mobileFirstCount / totalClasses : 0;
    return {
      passed: ratio > 0.6, // At least 60% mobile-first classes
      ratio: ratio.toFixed(2),
      mobileFirstCount,
      totalClasses
    };
  }

  checkResponsiveGrid(content) {
    const hasResponsiveGrid = MOBILE_PATTERNS.responsiveGrid.test(content);
    const gridClasses = content.match(/grid-cols-\d+/g) || [];

    return {
      passed: hasResponsiveGrid || gridClasses.length === 0,
      hasGrid: gridClasses.length > 0,
      hasResponsiveGrid,
      gridClasses
    };
  }

  checkTouchTargets(content) {
    // Check for adequate touch target sizes (44px minimum)
    const touchTargetPatterns = [
      /min-h-\[44px\]/g,
      /min-h-11/g, // 44px in Tailwind
      /p-[3-9]/g,  // Padding 12px+ (3*4px)
      /py-[3-9]/g,
      /px-[3-9]/g
    ];

    let touchTargetCount = 0;
    touchTargetPatterns.forEach(pattern => {
      const matches = content.match(pattern) || [];
      touchTargetCount += matches.length;
    });

    // Check for interactive elements
    const interactiveElements = [
      /button/gi,
      /onClick/g,
      /onTouchStart/g,
      /Link.*href/g
    ];

    let interactiveCount = 0;
    interactiveElements.forEach(pattern => {
      const matches = content.match(pattern) || [];
      interactiveCount += matches.length;
    });

    return {
      passed: touchTargetCount > 0 || interactiveCount === 0,
      touchTargetCount,
      interactiveCount,
      ratio: interactiveCount > 0 ? (touchTargetCount / interactiveCount).toFixed(2) : 'N/A'
    };
  }

  checkMobileMenu(content) {
    // Check for mobile menu implementation
    const hasMobileMenu = /mobile.*menu|hamburger|bars.*icon/i.test(content);
    const hasResponsiveNav = /md:hidden|lg:hidden.*nav|nav.*md:hidden/i.test(content);
    const hasMenuToggle = /menu.*toggle|toggle.*menu|setIs.*MenuOpen/i.test(content);

    return {
      passed: !content.includes('nav') || (hasMobileMenu && hasResponsiveNav),
      hasMobileMenu,
      hasResponsiveNav,
      hasMenuToggle,
      isNavComponent: content.includes('nav') || content.includes('Navigation')
    };
  }

  checkResponsiveText(content) {
    const responsiveTextPattern = /text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl).*?(sm:|md:|lg:|xl:)text-/g;
    const responsiveTextMatches = content.match(responsiveTextPattern) || [];
    const allTextClasses = content.match(/text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl)/g) || [];

    return {
      passed: responsiveTextMatches.length > 0 || allTextClasses.length === 0,
      responsiveCount: responsiveTextMatches.length,
      totalTextClasses: allTextClasses.length,
      ratio: allTextClasses.length > 0 ? (responsiveTextMatches.length / allTextClasses.length).toFixed(2) : 'N/A'
    };
  }

  checkResponsiveSpacing(content) {
    const responsivePadding = content.match(/p-\d+.*(sm:|md:|lg:|xl:)p-/g) || [];
    const responsiveMargin = content.match(/m-\d+.*(sm:|md:|lg:|xl:)m-/g) || [];
    const totalResponsiveSpacing = responsivePadding.length + responsiveMargin.length;

    return {
      passed: totalResponsiveSpacing > 0,
      responsivePadding: responsivePadding.length,
      responsiveMargin: responsiveMargin.length,
      total: totalResponsiveSpacing
    };
  }

  checkFlexboxResponsive(content) {
    const responsiveFlex = /flex-col.*(sm:|md:|lg:|xl:)flex-row/g.test(content);
    const hasFlexbox = /flex|flex-col|flex-row/.test(content);

    return {
      passed: !hasFlexbox || responsiveFlex,
      hasFlexbox,
      hasResponsiveFlex: responsiveFlex
    };
  }

  checkImageOptimization(content) {
    const hasNextImage = /import.*Image.*next\/image|from ['"]next\/image['"]/.test(content);
    const hasImageElements = /<img|<Image/.test(content);
    const hasSizes = /sizes=/.test(content);
    const hasPriority = /priority/.test(content);

    return {
      passed: !hasImageElements || (hasNextImage && hasSizes),
      hasImages: hasImageElements,
      usesNextImage: hasNextImage,
      hasSizes,
      hasPriority
    };
  }

  checkTouchInteractions(content) {
    const hasHoverStates = (content.match(/:hover/g) || []).length;
    const hasFocusStates = (content.match(/focus:|:focus/g) || []).length;
    const hasActiveStates = (content.match(/active:|:active/g) || []).length;
    const hasTouchEvents = /onTouchStart|onTouchEnd|onTouchMove/.test(content);

    return {
      passed: hasFocusStates >= hasHoverStates * 0.8, // At least 80% of hover states should have focus equivalents
      hoverStates: hasHoverStates,
      focusStates: hasFocusStates,
      activeStates: hasActiveStates,
      touchEvents: hasTouchEvents,
      focusHoverRatio: hasHoverStates > 0 ? (hasFocusStates / hasHoverStates).toFixed(2) : 'N/A'
    };
  }

  checkMobileAccessibility(content) {
    const hasAriaLabels = /aria-label|aria-labelledby/.test(content);
    const hasAriaExpanded = /aria-expanded/.test(content);
    const hasAriaControls = /aria-controls/.test(content);
    const hasScreenReaderText = /sr-only/.test(content);
    const hasSemanticHTML = /<(nav|main|section|article|header|footer|aside)/.test(content);

    const accessibilityScore = [
      hasAriaLabels,
      hasAriaExpanded,
      hasAriaControls,
      hasScreenReaderText,
      hasSemanticHTML
    ].filter(Boolean).length;

    return {
      passed: accessibilityScore >= 3,
      score: accessibilityScore,
      hasAriaLabels,
      hasAriaExpanded,
      hasAriaControls,
      hasScreenReaderText,
      hasSemanticHTML
    };
  }

  calculateScore(analysis) {
    const checks = [
      analysis.mobileFirst.passed,
      analysis.responsiveGrid.passed,
      analysis.touchTargets.passed,
      analysis.mobileMenu.passed,
      analysis.responsiveText.passed,
      analysis.responsiveSpacing.passed,
      analysis.flexboxResponsive.passed,
      analysis.imageOptimization.passed,
      analysis.touchInteractions.passed,
      analysis.accessibilityMobile.passed
    ];

    const passedChecks = checks.filter(Boolean).length;
    analysis.score = Math.round((passedChecks / checks.length) * 100);

    // Add issues for failed checks
    if (!analysis.mobileFirst.passed) {
      analysis.issues.push(`Mobile-first approach: Only ${analysis.mobileFirst.ratio * 100}% mobile-first classes`);
    }
    if (!analysis.responsiveGrid.passed && analysis.responsiveGrid.hasGrid) {
      analysis.issues.push('Grid layout is not responsive');
    }
    if (!analysis.touchTargets.passed && analysis.touchTargets.interactiveCount > 0) {
      analysis.issues.push(`Touch targets may be too small (ratio: ${analysis.touchTargets.ratio})`);
    }
    if (!analysis.mobileMenu.passed && analysis.mobileMenu.isNavComponent) {
      analysis.issues.push('Navigation component lacks mobile menu implementation');
    }
    if (!analysis.responsiveText.passed && analysis.responsiveText.totalTextClasses > 0) {
      analysis.issues.push('Text sizing is not responsive');
    }
    if (!analysis.responsiveSpacing.passed) {
      analysis.issues.push('Spacing is not responsive');
    }
    if (!analysis.flexboxResponsive.passed && analysis.flexboxResponsive.hasFlexbox) {
      analysis.issues.push('Flexbox layout is not responsive');
    }
    if (!analysis.imageOptimization.passed && analysis.imageOptimization.hasImages) {
      analysis.issues.push('Images are not optimized for mobile');
    }
    if (!analysis.touchInteractions.passed) {
      analysis.issues.push(`Touch interactions need improvement (focus/hover ratio: ${analysis.touchInteractions.focusHoverRatio})`);
    }
    if (!analysis.accessibilityMobile.passed) {
      analysis.issues.push(`Mobile accessibility needs improvement (score: ${analysis.accessibilityMobile.score}/5)`);
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📱 MOBILE RESPONSIVENESS TEST REPORT');
    console.log('='.repeat(80));

    // Summary
    const totalComponents = Object.keys(this.results.components).length;
    const passedComponents = Object.values(this.results.components).filter(c => c.score >= 80).length;
    const warningComponents = Object.values(this.results.components).filter(c => c.score >= 60 && c.score < 80).length;
    const failedComponents = totalComponents - passedComponents - warningComponents;

    console.log(`\n📊 SUMMARY:`);
    console.log(`Total Components: ${totalComponents}`);
    console.log(`✅ Passed (≥80%): ${passedComponents}`);
    console.log(`⚠️  Warnings (60-79%): ${warningComponents}`);
    console.log(`❌ Failed (<60%): ${failedComponents}`);
    console.log(`Overall Success Rate: ${Math.round((passedComponents / totalComponents) * 100)}%`);

    // Detailed results
    console.log(`\n📋 DETAILED RESULTS:`);
    Object.values(this.results.components).forEach(component => {
      const status = component.score >= 80 ? '✅' : component.score >= 60 ? '⚠️' : '❌';
      console.log(`\n${status} ${component.component} (${component.score}%)`);

      if (component.issues.length > 0) {
        component.issues.forEach(issue => {
          console.log(`   • ${issue}`);
        });
      }
    });

    // Recommendations
    console.log(`\n💡 RECOMMENDATIONS:`);
    const allIssues = Object.values(this.results.components).flatMap(c => c.issues);
    const issueFrequency = {};

    allIssues.forEach(issue => {
      const key = issue.split(':')[0];
      issueFrequency[key] = (issueFrequency[key] || 0) + 1;
    });

    Object.entries(issueFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .forEach(([issue, count]) => {
        console.log(`   • ${issue} (${count} components affected)`);
      });

    return {
      totalComponents,
      passedComponents,
      warningComponents,
      failedComponents,
      successRate: Math.round((passedComponents / totalComponents) * 100)
    };
  }

  async run() {
    console.log('🚀 Starting Mobile Responsiveness Analysis...');

    for (const componentPath of COMPONENTS_TO_TEST) {
      this.analyzeComponent(componentPath);
    }

    const summary = this.generateReport();

    // Save detailed report
    const reportPath = 'mobile-responsiveness-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);

    return summary;
  }
}

// Run the analyzer
if (require.main === module) {
  const analyzer = new MobileResponsivenessAnalyzer();
  analyzer.run().then(summary => {
    process.exit(summary.successRate >= 80 ? 0 : 1);
  }).catch(error => {
    console.error('❌ Analysis failed:', error);
    process.exit(1);
  });
}

module.exports = MobileResponsivenessAnalyzer;
