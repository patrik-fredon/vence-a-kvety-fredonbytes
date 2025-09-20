#!/usr/bin/env node

/**
 * Design Accuracy Validation Script
 *
 * Validates the migrated UI components against the pohrebni-vence-layout design system.
 * Checks color palette, typography, spacing, and component structure.
 */

const fs = require('fs');
const path = require('path');

// Expected design tokens from pohrebni-vence-layout
const EXPECTED_DESIGN_TOKENS = {
  colors: {
    stone: {
      50: '#fafaf9',
      100: '#f5f5f4',
      200: '#e7e5e4',
      300: '#d6d3d1',
      400: '#a8a29e',
      500: '#78716c',
      600: '#57534e',
      700: '#44403c',
      800: '#292524',
      900: '#1c1917'
    },
    amber: {
      200: '#fde68a',
      600: '#d97706',
      700: '#b45309'
    },
    white: '#ffffff'
  },
  typography: {
    fontSizes: {
      'sm': '0.875rem',
      'base': '1rem',
      'lg': '1.125rem',
      'xl': '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem'
    }
  },
  spacing: {
    container: '1280px',
    sections: {
      sm: '2rem',
      md: '4rem',
      lg: '6rem'
    }
  }
};

// Component structure expectations
const EXPECTED_COMPONENTS = {
  'Header': {
    file: 'src/components/layout/Header.tsx',
    expectedClasses: ['stone-200', 'border-b'],
    expectedElements: ['nav', 'button', 'a']
  },
  'Hero': {
    file: 'src/components/layout/HeroSection.tsx',
    expectedClasses: ['h-[70vh]', 'bg-cover', 'stone-900/40'],
    expectedElements: ['section', 'h1', 'button']
  },
  'ProductCard': {
    file: 'src/components/product/ProductCard.tsx',
    expectedClasses: ['hover:shadow', 'transition', 'card'],
    expectedElements: ['article', 'img', 'button']
  },
  'Button': {
    file: 'src/components/ui/Button.tsx',
    expectedClasses: ['amber-600', 'hover:', 'focus:ring'],
    expectedElements: ['button']
  },
  'ContactForm': {
    file: 'src/components/contact/ContactForm.tsx',
    expectedClasses: ['form', 'input', 'focus:'],
    expectedElements: ['form', 'input', 'textarea', 'button']
  }
};

class DesignAccuracyValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.successes = [];
  }

  /**
   * Main validation function
   */
  async validate() {
    console.log('🎨 Starting Design Accuracy Validation...\n');

    try {
      await this.validateTailwindConfig();
      await this.validateDesignTokens();
      await this.validateComponentStructure();
      await this.validateColorUsage();
      await this.validateTypography();
      await this.validateResponsiveDesign();

      this.generateReport();
    } catch (error) {
      console.error('❌ Validation failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Validate Tailwind configuration matches design system
   */
  async validateTailwindConfig() {
    console.log('📋 Validating Tailwind configuration...');

    const tailwindConfigPath = path.join(process.cwd(), 'tailwind.config.ts');

    if (!fs.existsSync(tailwindConfigPath)) {
      this.errors.push('Tailwind config file not found');
      return;
    }

    try {
      const configContent = fs.readFileSync(tailwindConfigPath, 'utf8');

      // Check for stone color palette
      if (configContent.includes('stone')) {
        this.successes.push('Stone color palette found in Tailwind config');
      } else {
        this.errors.push('Stone color palette missing from Tailwind config');
      }

      // Check for amber colors
      if (configContent.includes('amber')) {
        this.successes.push('Amber accent colors found in Tailwind config');
      } else {
        this.errors.push('Amber accent colors missing from Tailwind config');
      }

      // Check for custom container
      if (configContent.includes('container') || configContent.includes('1280px')) {
        this.successes.push('Custom container configuration found');
      } else {
        this.warnings.push('Custom container configuration not explicitly found');
      }

    } catch (error) {
      this.errors.push(`Failed to read Tailwind config: ${error.message}`);
    }
  }

  /**
   * Validate design tokens implementation
   */
  async validateDesignTokens() {
    console.log('🎯 Validating design tokens...');

    const designTokensPath = path.join(process.cwd(), 'src/lib/design-tokens.ts');

    if (!fs.existsSync(designTokensPath)) {
      this.warnings.push('Design tokens file not found - may be using Tailwind defaults');
      return;
    }

    try {
      const tokensContent = fs.readFileSync(designTokensPath, 'utf8');

      // Check for stone colors
      Object.keys(EXPECTED_DESIGN_TOKENS.colors.stone).forEach(shade => {
        if (tokensContent.includes(`stone-${shade}`) || tokensContent.includes(EXPECTED_DESIGN_TOKENS.colors.stone[shade])) {
          this.successes.push(`Stone-${shade} color token found`);
        } else {
          this.warnings.push(`Stone-${shade} color token not explicitly found`);
        }
      });

      // Check for amber colors
      Object.keys(EXPECTED_DESIGN_TOKENS.colors.amber).forEach(shade => {
        if (tokensContent.includes(`amber-${shade}`) || tokensContent.includes(EXPECTED_DESIGN_TOKENS.colors.amber[shade])) {
          this.successes.push(`Amber-${shade} color token found`);
        } else {
          this.warnings.push(`Amber-${shade} color token not explicitly found`);
        }
      });

    } catch (error) {
      this.errors.push(`Failed to read design tokens: ${error.message}`);
    }
  }

  /**
   * Validate component structure and classes
   */
  async validateComponentStructure() {
    console.log('🧩 Validating component structure...');

    for (const [componentName, config] of Object.entries(EXPECTED_COMPONENTS)) {
      const componentPath = path.join(process.cwd(), config.file);

      if (!fs.existsSync(componentPath)) {
        this.warnings.push(`${componentName} component not found at expected path: ${config.file}`);
        continue;
      }

      try {
        const componentContent = fs.readFileSync(componentPath, 'utf8');

        // Check for expected CSS classes
        let classesFound = 0;
        config.expectedClasses.forEach(className => {
          if (componentContent.includes(className)) {
            classesFound++;
          }
        });

        if (classesFound > 0) {
          this.successes.push(`${componentName}: ${classesFound}/${config.expectedClasses.length} expected classes found`);
        } else {
          this.warnings.push(`${componentName}: No expected design classes found`);
        }

        // Check for expected HTML elements
        let elementsFound = 0;
        config.expectedElements.forEach(element => {
          if (componentContent.includes(`<${element}`) || componentContent.includes(`"${element}"`)) {
            elementsFound++;
          }
        });

        if (elementsFound === config.expectedElements.length) {
          this.successes.push(`${componentName}: All expected HTML elements found`);
        } else {
          this.warnings.push(`${componentName}: ${elementsFound}/${config.expectedElements.length} expected elements found`);
        }

      } catch (error) {
        this.errors.push(`Failed to read ${componentName} component: ${error.message}`);
      }
    }
  }

  /**
   * Validate color usage across components
   */
  async validateColorUsage() {
    console.log('🎨 Validating color usage...');

    const componentsDir = path.join(process.cwd(), 'src/components');

    if (!fs.existsSync(componentsDir)) {
      this.errors.push('Components directory not found');
      return;
    }

    try {
      const colorUsage = {
        stone: 0,
        amber: 0,
        other: 0
      };

      const scanDirectory = (dir) => {
        const files = fs.readdirSync(dir);

        files.forEach(file => {
          const filePath = path.join(dir, file);
          const stat = fs.statSync(filePath);

          if (stat.isDirectory() && !file.startsWith('.') && file !== '__tests__') {
            scanDirectory(filePath);
          } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            const content = fs.readFileSync(filePath, 'utf8');

            // Count stone color usage
            const stoneMatches = content.match(/stone-\d+/g);
            if (stoneMatches) {
              colorUsage.stone += stoneMatches.length;
            }

            // Count amber color usage
            const amberMatches = content.match(/amber-\d+/g);
            if (amberMatches) {
              colorUsage.amber += amberMatches.length;
            }

            // Count other color usage (potential issues)
            const otherColors = content.match(/(blue|red|green|purple|yellow|pink|indigo|gray)-\d+/g);
            if (otherColors) {
              colorUsage.other += otherColors.length;
            }
          }
        });
      };

      scanDirectory(componentsDir);

      if (colorUsage.stone > 0) {
        this.successes.push(`Stone colors used ${colorUsage.stone} times across components`);
      } else {
        this.warnings.push('No stone color usage found in components');
      }

      if (colorUsage.amber > 0) {
        this.successes.push(`Amber colors used ${colorUsage.amber} times across components`);
      } else {
        this.warnings.push('No amber color usage found in components');
      }

      if (colorUsage.other > 0) {
        this.warnings.push(`${colorUsage.other} non-design-system colors found - consider replacing with stone/amber`);
      }

    } catch (error) {
      this.errors.push(`Failed to scan color usage: ${error.message}`);
    }
  }

  /**
   * Validate typography implementation
   */
  async validateTypography() {
    console.log('📝 Validating typography...');

    const componentsDir = path.join(process.cwd(), 'src/components');

    try {
      let typographyUsage = {
        textSizes: 0,
        fontWeights: 0,
        headings: 0
      };

      const scanDirectory = (dir) => {
        const files = fs.readdirSync(dir);

        files.forEach(file => {
          const filePath = path.join(dir, file);
          const stat = fs.statSync(filePath);

          if (stat.isDirectory() && !file.startsWith('.') && file !== '__tests__') {
            scanDirectory(filePath);
          } else if (file.endsWith('.tsx')) {
            const content = fs.readFileSync(filePath, 'utf8');

            // Count text size usage
            const textSizes = content.match(/text-(sm|base|lg|xl|2xl|3xl|4xl|5xl)/g);
            if (textSizes) {
              typographyUsage.textSizes += textSizes.length;
            }

            // Count font weight usage
            const fontWeights = content.match(/font-(light|medium|semibold|bold)/g);
            if (fontWeights) {
              typographyUsage.fontWeights += fontWeights.length;
            }

            // Count heading elements
            const headings = content.match(/<h[1-6]/g);
            if (headings) {
              typographyUsage.headings += headings.length;
            }
          }
        });
      };

      scanDirectory(componentsDir);

      if (typographyUsage.textSizes > 0) {
        this.successes.push(`Typography sizes used ${typographyUsage.textSizes} times`);
      } else {
        this.warnings.push('No Tailwind text size classes found');
      }

      if (typographyUsage.fontWeights > 0) {
        this.successes.push(`Font weights used ${typographyUsage.fontWeights} times`);
      } else {
        this.warnings.push('No font weight classes found');
      }

      if (typographyUsage.headings > 0) {
        this.successes.push(`${typographyUsage.headings} heading elements found`);
      } else {
        this.warnings.push('No heading elements found in components');
      }

    } catch (error) {
      this.errors.push(`Failed to validate typography: ${error.message}`);
    }
  }

  /**
   * Validate responsive design implementation
   */
  async validateResponsiveDesign() {
    console.log('📱 Validating responsive design...');

    const componentsDir = path.join(process.cwd(), 'src/components');

    try {
      let responsiveUsage = {
        breakpoints: 0,
        gridCols: 0,
        hiddenClasses: 0
      };

      const scanDirectory = (dir) => {
        const files = fs.readdirSync(dir);

        files.forEach(file => {
          const filePath = path.join(dir, file);
          const stat = fs.statSync(filePath);

          if (stat.isDirectory() && !file.startsWith('.') && file !== '__tests__') {
            scanDirectory(filePath);
          } else if (file.endsWith('.tsx')) {
            const content = fs.readFileSync(filePath, 'utf8');

            // Count responsive breakpoint usage
            const breakpoints = content.match(/(sm|md|lg|xl):/g);
            if (breakpoints) {
              responsiveUsage.breakpoints += breakpoints.length;
            }

            // Count grid column usage
            const gridCols = content.match(/grid-cols-\d+/g);
            if (gridCols) {
              responsiveUsage.gridCols += gridCols.length;
            }

            // Count responsive visibility
            const hiddenClasses = content.match(/(hidden|block|flex)\s+(sm|md|lg|xl):(hidden|block|flex)/g);
            if (hiddenClasses) {
              responsiveUsage.hiddenClasses += hiddenClasses.length;
            }
          }
        });
      };

      scanDirectory(componentsDir);

      if (responsiveUsage.breakpoints > 0) {
        this.successes.push(`Responsive breakpoints used ${responsiveUsage.breakpoints} times`);
      } else {
        this.warnings.push('No responsive breakpoint classes found');
      }

      if (responsiveUsage.gridCols > 0) {
        this.successes.push(`Grid columns used ${responsiveUsage.gridCols} times`);
      } else {
        this.warnings.push('No grid column classes found');
      }

    } catch (error) {
      this.errors.push(`Failed to validate responsive design: ${error.message}`);
    }
  }

  /**
   * Generate validation report
   */
  generateReport() {
    console.log('\n📊 Design Accuracy Validation Report');
    console.log('=====================================\n');

    if (this.successes.length > 0) {
      console.log('✅ Successes:');
      this.successes.forEach(success => console.log(`  • ${success}`));
      console.log('');
    }

    if (this.warnings.length > 0) {
      console.log('⚠️  Warnings:');
      this.warnings.forEach(warning => console.log(`  • ${warning}`));
      console.log('');
    }

    if (this.errors.length > 0) {
      console.log('❌ Errors:');
      this.errors.forEach(error => console.log(`  • ${error}`));
      console.log('');
    }

    // Calculate score
    const totalChecks = this.successes.length + this.warnings.length + this.errors.length;
    const score = totalChecks > 0 ? Math.round((this.successes.length / totalChecks) * 100) : 0;

    console.log(`📈 Design Accuracy Score: ${score}%`);
    console.log(`   Successes: ${this.successes.length}`);
    console.log(`   Warnings: ${this.warnings.length}`);
    console.log(`   Errors: ${this.errors.length}`);

    // Save detailed report
    const report = {
      timestamp: new Date().toISOString(),
      score,
      summary: {
        successes: this.successes.length,
        warnings: this.warnings.length,
        errors: this.errors.length
      },
      details: {
        successes: this.successes,
        warnings: this.warnings,
        errors: this.errors
      }
    };

    const reportPath = path.join(process.cwd(), 'design-accuracy-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);

    if (this.errors.length > 0) {
      console.log('\n❌ Validation completed with errors. Please address the issues above.');
      process.exit(1);
    } else {
      console.log('\n✅ Design accuracy validation completed successfully!');
    }
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new DesignAccuracyValidator();
  validator.validate().catch(error => {
    console.error('Validation failed:', error);
    process.exit(1);
  });
}

module.exports = DesignAccuracyValidator;
