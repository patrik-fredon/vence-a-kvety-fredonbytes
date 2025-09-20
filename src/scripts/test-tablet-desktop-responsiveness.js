#!/usr/bin/env node

/**
 * Tablet and Desktop Responsiveness Testing Script
 *
 * This script tests responsive design across tablet and desktop breakpoints,
 * validates proper layout adaptation and optimal screen space usage.
 */

const fs = require('fs');
const path = require('path');

// Breakpoint definitions for testing
const BREAKPOINTS = {
  tablet: {
    min: 768,
    max: 1023,
    name: 'Tablet',
    testWidths: [768, 834, 1024]
  },
  desktop: {
    min: 1024,
    max: 1279,
    name: 'Desktop',
    testWidths: [1024, 1200, 1280]
  },
  desktopLarge: {
    min: 1280,
    max: 9999,
    name: 'Large Desktop',
    testWidths: [1280, 1440, 1920]
  }
};

// Responsive patterns to validate
constPATTERNS = {
  tabletLayout: {
    name: 'Tablet Layout Adaptation',
    description: 'Check for proper tablet-specific layout patterns',
    patterns: [
      /md:grid-cols-2/g,           // 2-column grid on tablet
      /md:flex-row/g,              // Horizontal flex on tablet
      /md:text-(lg|xl|2xl)/g,      // Larger text on tablet
      /md:p-\d+/g,                 // Tablet padding
      /md:gap-\d+/g,               // Tablet gap spacing
      /md:col-span-2/g,            // Column spanning on tablet
      /md:w-\d+/g,                 // Tablet width classes
      /md:h-\d+/g                  // Tablet height classes
    ]
  },

  desktopLayout: {
    name: 'Desktop Layout Optimization',
    description: 'Validate desktop-specific layout enhancements',
    patterns: [
      /lg:grid-cols-[3-6]/g,       // 3+ column grid on desktop
      /lg:text-(xl|2xl|3xl|4xl|5xl)/g, // Large text on desktop
      /lg:p-\d+/g,                 // Desktop padding
      /lg:gap-\d+/g,               // Desktop gap spacing
      /lg:max-w-\w+/g,             // Max width constraints
      /lg:container/g,             // Container usage
      /xl:text-/g,                 // Extra large breakpoint text
      /xl:p-\d+/g                  // Extra large breakpoint padding
    ]
  },

  containerUsage: {
    name: 'Container and Max-Width Usage',
    description: 'Check for proper container usage and width constraints',
    patterns: [
      /container/g,
      /max-w-(sm|md|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl)/g,
      /mx-auto/g,
      /w-full.*max-w-/g
    ]
  },

  spacingProgression: {
    name: 'Spacing Progression',
    description: 'Validate progressive spacing increases across breakpoints',
    patterns: [
      /p-\d+.*md:p-\d+.*lg:p-\d+/g,
      /gap-\d+.*md:gap-\d+.*lg:gap-\d+/g,
      /space-y-\d+.*md:space-y-\d+.*lg:space-y-\d+/g,
      /mb-\d+.*md:mb-\d+.*lg:mb-\d+/g
    ]
  },

  typographyScaling: {
    name: 'Typography Scaling',
    description: 'Check for proper typography scaling across breakpoints',
    patterns: [
      /text-(sm|base).*md:text-(lg|xl).*lg:text-(xl|2xl|3xl)/g,
      /text-(lg|xl).*md:text-(xl|2xl).*lg:text-(2xl|3xl|4xl)/g,
      /leading-\w+.*md:leading-\w+/g,
      /tracking-\w+.*md:tracking-\w+/g
    ]
  },

  imageOptimization: {
    name: 'Image Responsive Optimization',
    description: 'Validate responsive image sizing and optimization',
    patterns: [
      /sizes=.*\(max-width:.*\)/g,
      /aspect-\w+.*md:aspect-\w+/g,
      /object-cover/g,
      /w-full.*md:w-\d+/g
    ]
  }
};

// Cross-browser compatibility checks
const BROWSER_COMPATIBILITY = {
  flexbox: {
    name: 'Flexbox Compatibility',
    patterns: [
      /flex/g,
      /flex-col/g,
      /flex-row/g,
      /justify-/g,
      /items-/g,
      /flex-wrap/g
    ]
  },

  grid: {
    name: 'CSS Grid Compatibility',
    patterns: [
      /grid/g,
      /grid-cols-/g,
      /col-span-/g,
      /row-span-/g,
      /grid-flow-/g
    ]
  },

  transforms: {
    name: 'Transform Compatibility',
    patterns: [
      /scale-/g,
      /rotate-/g,
      /translate-/g,
      /transform/g
    ]
  },

  transitions: {
    name: 'Transition Compatibility',
    patterns: [
      /transition-/g,
      /duration-/g,
      /ease-/g,
      /animate-/g
    ]
  }
};

class TabletDesktopResponsivenessAnalyzer {
  constructor() {
    this.results = {
      components: {},
      summary: {
        total: 0,
        passed: 0,
        warnings: 0,
        failed: 0
      },
      breakpointCoverage: {},
      browserCompatibility: {}
    };
  }

  analyzeComponent(filePath) {
    console.log(`\n🖥️  Analyzing ${path.basename(filePath)}...`);

    if (!fs.existsSync(filePath)) {
      console.log(`❌ File not found: ${filePath}`);
      return { status: 'error', message: 'File not found' };
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const componentName = path.basename(filePath, '.tsx');

    const analysis = {
      component: componentName,
      filePath,
      responsivePatterns: {},
      browserCompatibility: {},
      breakpointCoverage: this.analyzeBreakpointCoverage(content),
      layoutAdaptation: this.analyzeLayoutAdaptation(content),
      screenSpaceUsage: this.analyzeScreenSpaceUsage(content),
      issues: [],
      score: 0
    };

    // Analyze responsive patterns
    Object.entries(RESPONSIVE_PATTERNS).forEach(([key, pattern]) => {
      analysis.responsivePatterns[key] = this.checkPattern(content, pattern);
    });

    // Analyze browser compatibility
    Object.entries(BROWSER_COMPATIBILITY).forEach(([key, pattern]) => {
      analysis.browserCompatibility[key] = this.checkPattern(content, pattern);
    });

    // Calculate score and identify issues
    this.calculateScore(analysis);

    return analysis;
  }

  checkPattern(content, pattern) {
    let totalMatches = 0;
    const matchDetails = [];

    pattern.patterns.forEach(regex => {
      const matches = content.match(regex) || [];
      totalMatches += matches.length;
      if (matches.length > 0) {
        matchDetails.push({
          pattern: regex.toString(),
          matches: matches.length,
          examples: matches.slice(0, 3)
        });
      }
    });

    return {
      passed: totalMatches > 0,
      matches: totalMatches,
      details: matchDetails,
      description: pattern.description
    };
  }

  analyzeBreakpointCoverage(content) {
    const breakpoints = {
      sm: (content.match(/sm:/g) || []).length,
      md: (content.match(/md:/g) || []).length,
      lg: (content.match(/lg:/g) || []).length,
      xl: (content.match(/xl:/g) || []).length,
      '2xl': (content.match(/2xl:/g) || []).length
    };

    const totalBreakpoints = Object.values(breakpoints).reduce((sum, count) => sum + count, 0);
    const usedBreakpoints = Object.values(breakpoints).filter(count => count > 0).length;

    return {
      breakpoints,
      totalUsage: totalBreakpoints,
      coverage: usedBreakpoints,
      coveragePercentage: Math.round((usedBreakpoints / 5) * 100),
      hasTabletSupport: breakpoints.md > 0,
      hasDesktopSupport: breakpoints.lg > 0,
      hasLargeDesktopSupport: breakpoints.xl > 0
    };
  }

  analyzeLayoutAdaptation(content) {
    // Check for layout changes across breakpoints
    const gridChanges = content.match(/grid-cols-\d+.*md:grid-cols-\d+.*lg:grid-cols-\d+/g) || [];
    const flexChanges = content.match(/flex-col.*md:flex-row/g) || [];
    const textChanges = content.match(/text-\w+.*md:text-\w+.*lg:text-\w+/g) || [];
    const spacingChanges = content.match(/p-\d+.*md:p-\d+.*lg:p-\d+/g) || [];

    return {
      hasGridAdaptation: gridChanges.length > 0,
      hasFlexAdaptation: flexChanges.length > 0,
      hasTextAdaptation: textChanges.length > 0,
      hasSpacingAdaptation: spacingChanges.length > 0,
      adaptationScore: [
        gridChanges.length > 0,
        flexChanges.length > 0,
        textChanges.length > 0,
        spacingChanges.length > 0
      ].filter(Boolean).length
    };
  }

  analyzeScreenSpaceUsage(content) {
    // Check for optimal screen space usage patterns
    const hasContainer = /container|max-w-/.test(content);
    const hasResponsiveWidth = /w-full.*md:w-\d+.*lg:w-\d+/.test(content);
    const hasResponsiveHeight = /h-\w+.*md:h-\w+.*lg:h-\w+/.test(content);
    const hasResponsiveSpacing = /gap-\d+.*md:gap-\d+.*lg:gap-\d+/.test(content);
    const hasResponsivePadding = /p-\d+.*md:p-\d+.*lg:p-\d+/.test(content);

    return {
      hasContainer,
      hasResponsiveWidth,
      hasResponsiveHeight,
      hasResponsiveSpacing,
      hasResponsivePadding,
      optimizationScore: [
        hasContainer,
        hasResponsiveWidth,
        hasResponsiveHeight,
        hasResponsiveSpacing,
        hasResponsivePadding
      ].filter(Boolean).length
    };
  }

  calculateScore(analysis) {
    const checks = [
      analysis.responsivePatterns.tabletLayout.passed,
      analysis.responsivePatterns.desktopLayout.passed,
      analysis.responsivePatterns.containerUsage.passed,
      analysis.responsivePatterns.spacingProgression.passed,
      analysis.responsivePatterns.typographyScaling.passed,
      analysis.breakpointCoverage.hasTabletSupport,
      analysis.breakpointCoverage.hasDesktopSupport,
      analysis.layoutAdaptation.adaptationScore >= 2,
      analysis.screenSpaceUsage.optimizationScore >= 3,
      analysis.browserCompatibility.flexbox.passed || analysis.browserCompatibility.grid.passed
    ];

    const passedChecks = checks.filter(Boolean).length;
    analysis.score = Math.round((passedChecks / checks.length) * 100);

    // Add issues for failed checks
    if (!analysis.responsivePatterns.tabletLayout.passed) {
      analysis.issues.push('Missing tablet-specific layout adaptations (md: breakpoint)');
    }
    if (!analysis.responsivePatterns.desktopLayout.passed) {
      analysis.issues.push('Missing desktop-specific layout optimizations (lg: breakpoint)');
    }
    if (!analysis.responsivePatterns.containerUsage.passed) {
      analysis.issues.push('No container or max-width constraints for large screens');
    }
    if (!analysis.responsivePatterns.spacingProgression.passed) {
      analysis.issues.push('Spacing does not scale progressively across breakpoints');
    }
    if (!analysis.responsivePatterns.typographyScaling.passed) {
      analysis.issues.push('Typography does not scale across breakpoints');
    }
    if (!analysis.breakpointCoverage.hasTabletSupport) {
      analysis.issues.push('No tablet breakpoint (md:) usage found');
    }
    if (!analysis.breakpointCoverage.hasDesktopSupport) {
      analysis.issues.push('No desktop breakpoint (lg:) usage found');
    }
    if (analysis.layoutAdaptation.adaptationScore < 2) {
      analysis.issues.push('Insufficient layout adaptation across screen sizes');
    }
    if (analysis.screenSpaceUsage.optimizationScore < 3) {
      analysis.issues.push('Poor screen space utilization on larger screens');
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('🖥️  TABLET & DESKTOP RESPONSIVENESS REPORT');
    console.log('='.repeat(80));

    // Summary
    const totalComponents = Object.keys(this.results.components).length;
    const passedComponents = Object.values(this.results.components).filter(c => c.score >= 80).length;
    const warningComponents = Object.values(this.results.components).filter(c => c.score >= 60 && c.score < 80).length;
    const failedComponents = totalComponents - passedComponents - warningComponents;

    console.log(`\n📊 SUMMARY:`);
    console.log(`Total Components: ${totalComponents}`);
    console.log(`✅ Excellent (≥80%): ${passedComponents}`);
    console.log(`⚠️  Good (60-79%): ${warningComponents}`);
    console.log(`❌ Needs Work (<60%): ${failedComponents}`);
    console.log(`Overall Success Rate: ${Math.round((passedComponents / totalComponents) * 100)}%`);

    // Breakpoint coverage analysis
    console.log(`\n📱 BREAKPOINT COVERAGE ANALYSIS:`);
    const allBreakpoints = Object.values(this.results.components).map(c => c.breakpointCoverage);
    const avgTabletSupport = Math.round((allBreakpoints.filter(b => b.hasTabletSupport).length / totalComponents) * 100);
    const avgDesktopSupport = Math.round((allBreakpoints.filter(b => b.hasDesktopSupport).length / totalComponents) * 100);
    const avgLargeDesktopSupport = Math.round((allBreakpoints.filter(b => b.hasLargeDesktopSupport).length / totalComponents) * 100);

    console.log(`Tablet Support (md:): ${avgTabletSupport}% of components`);
    console.log(`Desktop Support (lg:): ${avgDesktopSupport}% of components`);
    console.log(`Large Desktop Support (xl:): ${avgLargeDesktopSupport}% of components`);

    // Detailed results
    console.log(`\n📋 DETAILED COMPONENT RESULTS:`);
    Object.values(this.results.components).forEach(component => {
      const status = component.score >= 80 ? '✅' : component.score >= 60 ? '⚠️' : '❌';
      console.log(`\n${status} ${component.component} (${component.score}%)`);

      // Breakpoint coverage
      const bp = component.breakpointCoverage;
      console.log(`   📱 Breakpoints: md:${bp.breakpoints.md} lg:${bp.breakpoints.lg} xl:${bp.breakpoints.xl}`);

      // Layout adaptation
      const la = component.layoutAdaptation;
      console.log(`   🔄 Adaptation: Grid:${la.hasGridAdaptation ? '✅' : '❌'} Flex:${la.hasFlexAdaptation ? '✅' : '❌'} Text:${la.hasTextAdaptation ? '✅' : '❌'}`);

      // Issues
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
      const key = issue.split(' (')[0];
      issueFrequency[key] = (issueFrequency[key] || 0) + 1;
    });

    Object.entries(issueFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .forEach(([issue, count]) => {
        console.log(`   • ${issue} (${count} components)`);
      });

    return {
      totalComponents,
      passedComponents,
      warningComponents,
      failedComponents,
      successRate: Math.round((passedComponents / totalComponents) * 100),
      breakpointCoverage: {
        tablet: avgTabletSupport,
        desktop: avgDesktopSupport,
        largeDesktop: avgLargeDesktopSupport
      }
    };
  }

  async run() {
    console.log('🚀 Starting Tablet & Desktop Responsiveness Analysis...');

    const componentsToTest = [
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

    for (const componentPath of componentsToTest) {
      const analysis = this.analyzeComponent(componentPath);
      if (analysis.status !== 'error') {
        this.results.components[analysis.component] = analysis;
      }
    }

    const summary = this.generateReport();

    // Save detailed report
    const reportPath = 'tablet-desktop-responsiveness-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);

    return summary;
  }
}

// Run the analyzer
if (require.main === module) {
  const analyzer = new TabletDesktopResponsivenessAnalyzer();
  analyzer.run().then(summary => {
    console.log(`\n🎯 Tablet & Desktop responsiveness: ${summary.successRate}% success rate`);
    process.exit(summary.successRate >= 70 ? 0 : 1);
  }).catch(error => {
    console.error('❌ Analysis failed:', error);
    process.exit(1);
  });
}

module.exports = TabletDesktopResponsivenessAnalyzer;
