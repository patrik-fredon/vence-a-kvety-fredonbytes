#!/usr/bin/env node

/**
 * Deployment Setup Verification Script
 * Verifies that all deployment components are properly configured
 */

const fs = require('fs');
const path = require('path');

// Colors for output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFileExists(filePath, description) {
  const exists = fs.existsSync(filePath);
  if (exists) {
    log(`✅ ${description}: ${filePath}`, 'green');
  } else {
    log(`❌ Missing ${description}: ${filePath}`, 'red');
  }
  return exists;
}

function checkPackageScript(scriptName, description) {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const exists = packageJson.scripts && packageJson.scripts[scriptName];
  if (exists) {
    log(`✅ ${description}: npm run ${scriptName}`, 'green');
  } else {
    log(`❌ Missing ${description}: ${scriptName}`, 'red');
  }
  return exists;
}

function checkEnvironmentTemplate() {
  const envExample = '.env.example';
  if (!fs.existsSync(envExample)) {
    log(`❌ Missing environment template: ${envExample}`, 'red');
    return false;
  }

  const content = fs.readFileSync(envExample, 'utf8');
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXTAUTH_SECRET',
    'STRIPE_SECRET_KEY',
    'GOPAY_CLIENT_ID'
  ];

  let allPresent = true;
  for (const varName of requiredVars) {
    if (!content.includes(varName)) {
      log(`❌ Missing environment variable in template: ${varName}`, 'red');
      allPresent = false;
    }
  }

  if (allPresent) {
    log(`✅ Environment template complete: ${envExample}`, 'green');
  }
  return allPresent;
}

function checkVercelConfig() {
  const vercelJson = 'vercel.json';
  if (!fs.existsSync(vercelJson)) {
    log(`❌ Missing Vercel configuration: ${vercelJson}`, 'red');
    return false;
  }

  try {
    const config = JSON.parse(fs.readFileSync(vercelJson, 'utf8'));

    const checks = [
      { key: 'buildCommand', description: 'Build command' },
      { key: 'functions', description: 'Function configuration' },
      { key: 'crons', description: 'Cron jobs' }
    ];

    let allPresent = true;
    for (const check of checks) {
      if (!config[check.key]) {
        log(`❌ Missing in vercel.json: ${check.description}`, 'red');
        allPresent = false;
      } else {
        log(`✅ Vercel config has: ${check.description}`, 'green');
      }
    }

    return allPresent;
  } catch (error) {
    log(`❌ Invalid Vercel configuration: ${error.message}`, 'red');
    return false;
  }
}

function checkGitHubActions() {
  const workflowPath = '.github/workflows/ci.yml';
  if (!fs.existsSync(workflowPath)) {
    log(`❌ Missing GitHub Actions workflow: ${workflowPath}`, 'red');
    return false;
  }

  const content = fs.readFileSync(workflowPath, 'utf8');
  const requiredJobs = ['quality', 'e2e', 'security', 'deploy'];

  let allPresent = true;
  for (const job of requiredJobs) {
    if (!content.includes(`${job}:`)) {
      log(`❌ Missing CI job: ${job}`, 'red');
      allPresent = false;
    } else {
      log(`✅ CI job configured: ${job}`, 'green');
    }
  }

  return allPresent;
}

function main() {
  log('🔍 Verifying deployment setup...', 'blue');
  log('', 'reset');

  let allChecksPass = true;

  // Check configuration files
  log('📁 Configuration Files:', 'blue');
  allChecksPass = checkFileExists('vercel.json', 'Vercel configuration') && allChecksPass;
  allChecksPass = checkFileExists('.env.example', 'Environment template') && allChecksPass;
  allChecksPass = checkFileExists('.env.production.example', 'Production environment template') && allChecksPass;
  allChecksPass = checkFileExists('docs/DEPLOYMENT.md', 'Deployment documentation') && allChecksPass;
  log('', 'reset');

  // Check scripts
  log('📜 Deployment Scripts:', 'blue');
  allChecksPass = checkFileExists('scripts/deploy.sh', 'Deployment script') && allChecksPass;
  allChecksPass = checkFileExists('scripts/migrate.js', 'Migration script') && allChecksPass;
  allChecksPass = checkFileExists('scripts/seed-production.js', 'Production seeding script') && allChecksPass;
  allChecksPass = checkFileExists('scripts/verify-deployment-setup.js', 'Verification script') && allChecksPass;
  log('', 'reset');

  // Check API routes
  log('🔌 API Routes:', 'blue');
  allChecksPass = checkFileExists('src/app/api/health/route.ts', 'Health check endpoint') && allChecksPass;
  allChecksPass = checkFileExists('src/app/api/monitoring/cleanup/route.ts', 'Cleanup cron job') && allChecksPass;
  allChecksPass = checkFileExists('src/app/api/orders/cleanup-abandoned/route.ts', 'Abandoned orders cleanup') && allChecksPass;
  log('', 'reset');

  // Check package.json scripts
  log('📦 Package Scripts:', 'blue');
  allChecksPass = checkPackageScript('build', 'Build script') && allChecksPass;
  allChecksPass = checkPackageScript('db:migrate', 'Database migration') && allChecksPass;
  allChecksPass = checkPackageScript('db:seed:production', 'Production seeding') && allChecksPass;
  allChecksPass = checkPackageScript('deploy:production', 'Production deployment') && allChecksPass;
  allChecksPass = checkPackageScript('test:all', 'Complete test suite') && allChecksPass;
  log('', 'reset');

  // Check CI/CD
  log('🚀 CI/CD Configuration:', 'blue');
  allChecksPass = checkGitHubActions() && allChecksPass;
  log('', 'reset');

  // Check configurations
  log('⚙️  Configuration Validation:', 'blue');
  allChecksPass = checkEnvironmentTemplate() && allChecksPass;
  allChecksPass = checkVercelConfig() && allChecksPass;
  log('', 'reset');

  // Final result
  if (allChecksPass) {
    log('🎉 All deployment setup checks passed!', 'green');
    log('✅ Ready for production deployment', 'green');
    log('', 'reset');
    log('Next steps:', 'blue');
    log('1. Configure environment variables in Vercel dashboard', 'reset');
    log('2. Set up GitHub repository secrets', 'reset');
    log('3. Run: npm run deploy:production', 'reset');
  } else {
    log('❌ Some deployment setup checks failed', 'red');
    log('Please fix the issues above before deploying', 'yellow');
    process.exit(1);
  }
}

// Run verification
if (require.main === module) {
  main();
}

module.exports = { main };
