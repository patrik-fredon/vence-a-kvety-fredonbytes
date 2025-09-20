#!/usr/bin/env node

/**
 * Tablet and Desktop Responsiveness Testing Script
 */

const fs = require('fs');
const path = require('path');

class TabletDesktopResponsivenessAnalyzer {
  constructor() {
    this.results = { components: {} };
  }

  analyzeComponent(filePath) {
    console.log(`\n🖥️  Analyzing ${path.basename(filePath)}...`);

    if (!fs.existsSync(filePath)) {
      return { status: 'error', message: 'File not found' };
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const componentName = path.basename(filePath, '.tsx');

    // Check for tablet and desktop responsive patterns
    const tabletPatterns = (content.match(/md:/g) || []).length;
    const desktopPatterns = (content.match(/lg:/g) || []).length;
    const largeDesktopPatterns = (content.match(/xl:/g) || []).length;

    // Check for container usage
    const hasContainer = /container|max-w-/.test(content);

    // Check for responsive grid
    const hasResponsiveGrid = /grid-cols-1.*md:grid-cols-2.*lg:grid-cols-3/.test(content);

    // Check for responsive text
    const hasResponsiveText = /text-\w+.*md:text-\w+/.test(content);

    // Check for responsive spacing
    const hasResponsiveSpacing = /p-\d+.*md:p-\d+/.test(content) || /gap-\d+.*md:gap-\d+/.test(content);

    const score = [
      tabletPatterns > 0,
      desktopPatterns > 0,
      hasContainer,
      hasResponsiveGrid,
      hasResponsiveText,
      hasResponsiveSpacing
    ].filter(Boolean).length;

    const analysis = {
      component: componentName,
      score: Math.round((score / 6) * 100),
      tabletPatterns,
      desktopPatterns,
      largeDesktopPatterns,
      hasContainer,
      hasResponsiveGrid,
      hasResponsiveText,
      hasResponsiveSpacing,
      issues: []
    };

    // Add issues
    if (tabletPatterns === 0) analysis.issues.push('No tablet breakpoint (md:) usage');
    if (desktopPatterns === 0) analysis.issues.push('No desktop breakpoint (lg:) usage');
    if (!hasContainer) analysis.issues.push('No container or max-width constraints');
    if (!hasResponsiveGrid) analysis.issues.push('No responsive grid layout');
    if (!hasResponsiveText) analysis.issues.push('No responsive typography');
    if (!hasResponsiveSpacing) analysis.issues.push('No responsive spacing');

    return analysis;
  }

  generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('🖥️  TABLET & DESKTOP RESPONSIVENESS REPORT');
    console.log('='.repeat(80));

    const components = Object.values(this.results.components);
    const totalComponents = components.length;
    const passedComponents = components.filter(c => c.score >= 80).length;
    const warningComponents = components.filter(c => c.score >= 60 && c.score < 80).length;
    const failedComponents = totalComponents - passedComponents - warningComponents;

    console.log(`\n📊 SUMMARY:`);
    console.log(`Total Components: ${totalComponents}`);
    console.log(`✅ Excellent (≥80%): ${passedComponents}`);
    console.log(`⚠️  Good (60-79%): ${warningComponents}`);
    console.log(`❌ Needs Work (<60%): ${failedComponents}`);
    console.log(`Overall Success Rate: ${Math.round((passedComponents / totalComponents) * 100)}%`);

    // Breakpoint usage
    const avgTablet = Math.round(components.reduce((sum, c) => sum + (c.tabletPatterns > 0 ? 1 : 0), 0) / totalComponents * 100);
    const avgDesktop = Math.round(components.reduce((sum, c) => sum + (c.desktopPatterns > 0 ? 1 : 0), 0) / totalComponents * 100);

    console.log(`\n📱 BREAKPOINT USAGE:`);
    console.log(`Tablet (md:): ${avgTablet}% of components`);
    console.log(`Desktop (lg:): ${avgDesktop}% of components`);

    console.log(`\n📋 COMPONENT RESULTS:`);
    components.forEach(component => {
      const status = component.score >= 80 ? '✅' : component.score >= 60 ? '⚠️' : '❌';
      console.log(`\n${status} ${component.component} (${component.score}%)`);
      console.log(`   📱 Breakpoints: md:${component.tabletPatterns} lg:${component.desktopPatterns} xl:${component.largeDesktopPatterns}`);

      if (component.issues.length > 0) {
        component.issues.forEach(issue => {
          console.log(`   • ${issue}`);
        });
      }
    });

    return {
      totalComponents,
      passedComponents,
      successRate: Math.round((passedComponents / totalComponents) * 100),
      breakpointCoverage: { tablet: avgTablet, desktop: avgDesktop }
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

    // Save report
    const reportPath = 'tablet-desktop-responsiveness-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 Report saved to: ${reportPath}`);

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
