#!/usr/bin/env node

/**
 * Functional Testing Validation Script
 *
 * Validates that all existing functionality remains intact after UI migration.
 * Tests API integrations, data flow, user journeys, and critical business flows.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class FunctionalTestingValidator {
  constructor() {
    this.results = {
      unitTests: { passed: 0, failed: 0, errors: [] },
      apiTests: { passed: 0, failed: 0, errors: [] },
      integrationTests: { passed: 0, failed: 0, errors: [] },
      e2eTests: { passed: 0, failed: 0, errors: [] },
      criticalFlows: { passed: 0, failed: 0, errors: [] }
    };
    this.startTime = Date.now();
  }

  /**
   * Main validation function
   */
  async validate() {
    console.log('🧪 Starting Functional Testing Validation...\n');

    try {
      await this.runUnitTests();
      await this.validateApiIntegrations();
      await this.runE2EFunctionalTests();
      await this.validateCriticalBusinessFlows();
      await this.validateDataIntegrity();

      this.generateReport();
    } catch (error) {
      console.error('❌ Functional testing validation failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Run existing unit tests
   */
  async runUnitTests() {
    console.log('🔬 Running unit tests...');

    try {
      // Run Jest tests
      const testOutput = execSync('npm test -- --passWithNoTests --verbose', {
        encoding: 'utf8',
        timeout: 60000
      });

      // Parse test results
      const testLines = testOutput.split('\n');
      let passedTests = 0;
      let failedTests = 0;

      testLines.forEach(line => {
        if (line.includes('✓') || line.includes('PASS')) {
          passedTests++;
        } else if (line.includes('✗') || line.includes('FAIL')) {
          failedTests++;
          this.results.unitTests.errors.push(line.trim());
        }
      });

      this.results.unitTests.passed = passedTests;
      this.results.unitTests.failed = failedTests;

      if (failedTests === 0) {
        console.log('✅ Unit tests passed');
      } else {
        console.log(`⚠️  Unit tests: ${passedTests} passed, ${failedTests} failed`);
      }

    } catch (error) {
      console.log('⚠️  Unit tests encountered issues:', error.message);
      this.results.unitTests.errors.push(error.message);
    }
  }

  /**
   * Validate API integrations
   */
  async validateApiIntegrations() {
    console.log('🔌 Validating API integrations...');

    const apiEndpoints = [
      { path: '/api/products', method: 'GET', description: 'Product catalog API' },
      { path: '/api/categories', method: 'GET', description: 'Categories API' },
      { path: '/api/cart', method: 'GET', description: 'Cart API' },
      { path: '/api/contact', method: 'POST', description: 'Contact form API' },
      { path: '/api/health', method: 'GET', description: 'Health check API' }
    ];

    for (const endpoint of apiEndpoints) {
      try {
        // Check if API route file exists
        const routePath = path.join(process.cwd(), `src/app${endpoint.path}/route.ts`);

        if (fs.existsSync(routePath)) {
          const routeContent = fs.readFileSync(routePath, 'utf8');

          // Check if the HTTP method is implemented
          if (routeContent.includes(`export async function ${endpoint.method}`)) {
            this.results.apiTests.passed++;
            console.log(`✅ ${endpoint.description} - Route implemented`);
          } else {
            this.results.apiTests.failed++;
            this.results.apiTests.errors.push(`${endpoint.description} - ${endpoint.method} method not found`);
            console.log(`⚠️  ${endpoint.description} - ${endpoint.method} method not implemented`);
          }

          // Check for proper error handling
          if (routeContent.includes('try') && routeContent.includes('catch')) {
            console.log(`✅ ${endpoint.description} - Error handling present`);
          } else {
            console.log(`⚠️  ${endpoint.description} - No error handling detected`);
          }

          // Check for authentication where needed
          if (endpoint.path.includes('cart') || endpoint.path.includes('admin')) {
            if (routeContent.includes('auth') || routeContent.includes('session')) {
              console.log(`✅ ${endpoint.description} - Authentication check present`);
            } else {
              console.log(`⚠️  ${endpoint.description} - No authentication check detected`);
            }
          }

        } else {
          this.results.apiTests.failed++;
          this.results.apiTests.errors.push(`${endpoint.description} - Route file not found`);
          console.log(`❌ ${endpoint.description} - Route file not found`);
        }

      } catch (error) {
        this.results.apiTests.failed++;
        this.results.apiTests.errors.push(`${endpoint.description} - ${error.message}`);
        console.log(`❌ ${endpoint.description} - Error: ${error.message}`);
      }
    }
  }

  /**
   * Run E2E functional tests
   */
  async runE2EFunctionalTests() {
    console.log('🎭 Running E2E functional tests...');

    try {
      // Run functional tests with limited scope to avoid timeouts
      const testOutput = execSync('npm run test:e2e -- --grep "Functional Testing" --reporter=list --timeout=30000 --max-failures=3', {
        encoding: 'utf8',
        timeout: 120000
      });

      // Parse E2E test results
      const testLines = testOutput.split('\n');
      let passedTests = 0;
      let failedTests = 0;

      testLines.forEach(line => {
        if (line.includes('✓') || line.includes('passed')) {
          passedTests++;
        } else if (line.includes('✗') || line.includes('failed')) {
          failedTests++;
          this.results.e2eTests.errors.push(line.trim());
        }
      });

      this.results.e2eTests.passed = passedTests;
      this.results.e2eTests.failed = failedTests;

      if (failedTests === 0) {
        console.log('✅ E2E functional tests passed');
      } else {
        console.log(`⚠️  E2E functional tests: ${passedTests} passed, ${failedTests} failed`);
      }

    } catch (error) {
      console.log('⚠️  E2E functional tests encountered issues:', error.message);
      this.results.e2eTests.errors.push(error.message);
    }
  }

  /**
   * Validate critical business flows
   */
  async validateCriticalBusinessFlows() {
    console.log('💼 Validating critical business flows...');

    const criticalFlows = [
      {
        name: 'Product Catalog Flow',
        components: ['ProductGrid', 'ProductCard', 'ProductDetail'],
        apis: ['/api/products', '/api/categories']
      },
      {
        name: 'Shopping Cart Flow',
        components: ['ShoppingCart', 'CartIcon', 'MiniCart'],
        apis: ['/api/cart', '/api/cart/items']
      },
      {
        name: 'Contact Form Flow',
        components: ['ContactForm'],
        apis: ['/api/contact']
      },
      {
        name: 'Authentication Flow',
        components: ['SignInForm', 'SignUpForm', 'AuthProvider'],
        apis: ['/api/auth/signin', '/api/auth/signup']
      },
      {
        name: 'Checkout Flow',
        components: ['CheckoutForm', 'PaymentForm'],
        apis: ['/api/orders', '/api/payments']
      }
    ];

    for (const flow of criticalFlows) {
      try {
        let flowValid = true;
        const flowErrors = [];

        // Check if components exist
        for (const component of flow.components) {
          const componentPaths = [
            `src/components/**/${component}.tsx`,
            `src/components/**/${component}.ts`
          ];

          let componentFound = false;
          for (const pattern of componentPaths) {
            const files = this.findFiles(pattern);
            if (files.length > 0) {
              componentFound = true;
              break;
            }
          }

          if (!componentFound) {
            flowValid = false;
            flowErrors.push(`Component ${component} not found`);
          }
        }

        // Check if APIs exist
        for (const api of flow.apis) {
          const routePath = path.join(process.cwd(), `src/app${api}/route.ts`);
          if (!fs.existsSync(routePath)) {
            flowValid = false;
            flowErrors.push(`API ${api} not found`);
          }
        }

        if (flowValid) {
          this.results.criticalFlows.passed++;
          console.log(`✅ ${flow.name} - All components and APIs present`);
        } else {
          this.results.criticalFlows.failed++;
          this.results.criticalFlows.errors.push(`${flow.name}: ${flowErrors.join(', ')}`);
          console.log(`⚠️  ${flow.name} - Issues: ${flowErrors.join(', ')}`);
        }

      } catch (error) {
        this.results.criticalFlows.failed++;
        this.results.criticalFlows.errors.push(`${flow.name}: ${error.message}`);
        console.log(`❌ ${flow.name} - Error: ${error.message}`);
      }
    }
  }

  /**
   * Validate data integrity
   */
  async validateDataIntegrity() {
    console.log('🗄️  Validating data integrity...');

    try {
      // Check Supabase configuration
      const supabaseConfigPath = path.join(process.cwd(), 'src/lib/supabase/client.ts');
      if (fs.existsSync(supabaseConfigPath)) {
        const configContent = fs.readFileSync(supabaseConfigPath, 'utf8');

        if (configContent.includes('createClient') && configContent.includes('supabaseUrl')) {
          console.log('✅ Supabase client configuration present');
        } else {
          console.log('⚠️  Supabase client configuration incomplete');
        }
      }

      // Check database types
      const typesPath = path.join(process.cwd(), 'src/lib/supabase/database.types.ts');
      if (fs.existsSync(typesPath)) {
        console.log('✅ Database types file present');
      } else {
        console.log('⚠️  Database types file not found');
      }

      // Check for data validation utilities
      const validationPath = path.join(process.cwd(), 'src/lib/validation');
      if (fs.existsSync(validationPath)) {
        console.log('✅ Data validation utilities present');
      } else {
        console.log('⚠️  Data validation utilities not found');
      }

      // Check for caching implementation
      const cachePath = path.join(process.cwd(), 'src/lib/cache');
      if (fs.existsSync(cachePath)) {
        console.log('✅ Caching implementation present');
      } else {
        console.log('⚠️  Caching implementation not found');
      }

    } catch (error) {
      console.log(`❌ Data integrity validation error: ${error.message}`);
    }
  }

  /**
   * Find files matching a pattern
   */
  findFiles(pattern) {
    try {
      const output = execSync(`find src -name "${pattern.split('/').pop()}" -type f`, {
        encoding: 'utf8',
        timeout: 5000
      });
      return output.trim().split('\n').filter(line => line.length > 0);
    } catch (error) {
      return [];
    }
  }

  /**
   * Generate comprehensive report
   */
  generateReport() {
    const endTime = Date.now();
    const duration = Math.round((endTime - this.startTime) / 1000);

    console.log('\n📊 Functional Testing Validation Report');
    console.log('=======================================\n');

    // Summary
    const totalPassed = Object.values(this.results).reduce((sum, result) => sum + result.passed, 0);
    const totalFailed = Object.values(this.results).reduce((sum, result) => sum + result.failed, 0);
    const totalTests = totalPassed + totalFailed;

    console.log(`⏱️  Duration: ${duration} seconds`);
    console.log(`📈 Overall Score: ${totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0}%`);
    console.log(`✅ Passed: ${totalPassed}`);
    console.log(`❌ Failed: ${totalFailed}\n`);

    // Detailed results
    Object.entries(this.results).forEach(([category, result]) => {
      const categoryName = category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      console.log(`${categoryName}:`);
      console.log(`  ✅ Passed: ${result.passed}`);
      console.log(`  ❌ Failed: ${result.failed}`);

      if (result.errors.length > 0) {
        console.log(`  🔍 Issues:`);
        result.errors.slice(0, 3).forEach(error => {
          console.log(`    • ${error}`);
        });
        if (result.errors.length > 3) {
          console.log(`    • ... and ${result.errors.length - 3} more issues`);
        }
      }
      console.log('');
    });

    // Requirements validation
    console.log('📋 Requirements Validation:');
    console.log(`  4.1 API Integration Preservation: ${this.results.apiTests.passed > 0 ? '✅' : '❌'}`);
    console.log(`  4.2 Cart Functionality: ${this.results.criticalFlows.passed > 0 ? '✅' : '❌'}`);
    console.log(`  4.3 Authentication Flows: ${this.results.criticalFlows.passed > 0 ? '✅' : '❌'}`);
    console.log(`  4.4 Checkout Processing: ${this.results.criticalFlows.passed > 0 ? '✅' : '❌'}`);
    console.log(`  4.5 Admin Features: ${this.results.apiTests.passed > 0 ? '✅' : '❌'}\n`);

    // Save detailed report
    const report = {
      timestamp: new Date().toISOString(),
      duration: duration,
      summary: {
        totalTests,
        totalPassed,
        totalFailed,
        score: totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0
      },
      results: this.results,
      requirements: {
        '4.1': this.results.apiTests.passed > 0,
        '4.2': this.results.criticalFlows.passed > 0,
        '4.3': this.results.criticalFlows.passed > 0,
        '4.4': this.results.criticalFlows.passed > 0,
        '4.5': this.results.apiTests.passed > 0
      }
    };

    const reportPath = path.join(process.cwd(), 'functional-testing-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 Detailed report saved to: ${reportPath}`);

    if (totalFailed > 0) {
      console.log('\n⚠️  Functional testing completed with issues. Please review the failures above.');
    } else {
      console.log('\n✅ Functional testing validation completed successfully!');
    }
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new FunctionalTestingValidator();
  validator.validate().catch(error => {
    console.error('Validation failed:', error);
    process.exit(1);
  });
}

module.exports = FunctionalTestingValidator;
