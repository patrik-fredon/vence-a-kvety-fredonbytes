#!/usr/bin/env node

/**
 * Bundle Size Regression Testing Script
 *
 * Automated testing for bundle size regression detection.
 * Integrates with CI/CD pipelines to prevent bundle size increases.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  baselineFile: path.join(process.cwd(), 'bundle-baseline.json'),
  reportFile: path.join(process.cwd(), 'bundle-regression-report.json'),
  thresholds: {
    totalSizeIncrease: 10, // 10% increase threshold
    chunkSizeIncrease: 15, // 15% increase threshold for individual chunks
    newChunkThreshold: 50 * 1024, // 50KB threshold for new chunks
    criticalSizeLimit: 1024 * 1024, // 1MB critical limit
  },
  ci: {
    failOnRegression: process.env.CI === 'true',
    commentOnPR: process.env.GITHUB_ACTIONS === 'true',
    slackWebhook: process.env.SLACK_WEBHOOK_URL,
  },
};

// Test results
const testResults = {
  timestamp: new Date().toISOString(),
  baseline: null,
  current: null,
  regression: {
    detected: false,
    severity: 'none', // none, low, medium, high, critical
    totalSizeChange: 0,
    totalSizeChangePercent: 0,
    affectedChunks: [],
    newChunks: [],
    removedChunks: [],
    recommendations: [],
  },
  status: 'unknown', // pass, warning, fail
  details: {},
};

/**
 * Load baseline data
 */
function loadBaseline() {
  if (!fs.existsSync(CONFIG.baselineFile)) {
    throw new Error(`Baseline file not found: ${CONFIG.baselineFile}. Run with --create-baseline first.`);
  }

  const baseline = JSON.parse(fs.readFileSync(CONFIG.baselineFile, 'utf8'));
  testResults.baseline = baseline;
  return baseline;
}

/**
 * Analyze current bundle
 */
function analyzeCurrentBundle() {
  console.log('🔍 Analyzing current bundle...');

  try {
    // Run bundle analyzer
    const bundleAnalyzer = require('./bundle-analyzer');
    bundleAnalyzer.runBundleAnalysis();

    // Load analysis results
    const analysisFile = path.join(bundleAnalyzer.CONFIG.outputDir, 'bundle-analysis.json');
    if (fs.existsSync(analysisFile)) {
      const analysis = JSON.parse(fs.readFileSync(analysisFile, 'utf8'));
      testResults.current = {
        timestamp: analysis.timestamp,
        totalSize: analysis.totalSize,
        chunks: analysis.chunks,
        assets: analysis.assets,
      };
      return testResults.current;
    } else {
      throw new Error('Bundle analysis file not found');
    }
  } catch (error) {
    throw new Error(`Failed to analyze current bundle: ${error.message}`);
  }
}

/**
 * Compare current bundle with baseline
 */
function compareWithBaseline() {
  const { baseline, current } = testResults;

  if (!baseline || !current) {
    throw new Error('Missing baseline or current bundle data');
  }

  console.log('📊 Comparing with baseline...');

  const regression = testResults.regression;

  // Compare total size
  const totalSizeChange = current.totalSize - baseline.totalSize;
  const totalSizeChangePercent = (totalSizeChange / baseline.totalSize) * 100;

  regression.totalSizeChange = totalSizeChange;
  regression.totalSizeChangePercent = totalSizeChangePercent;

  // Check if total size regression exceeds threshold
  if (totalSizeChangePercent > CONFIG.thresholds.totalSizeIncrease) {
    regression.detected = true;
    regression.severity = determineSeverity(totalSizeChangePercent, current.totalSize);
  }

  // Compare individual chunks
  const baselineChunks = new Map(baseline.chunks.map(chunk => [chunk.name, chunk]));
  const currentChunks = new Map(current.chunks.map(chunk => [chunk.name, chunk]));

  // Find affected chunks
  for (const [name, currentChunk] of currentChunks) {
    const baselineChunk = baselineChunks.get(name);

    if (baselineChunk) {
      const chunkSizeChange = currentChunk.size - baselineChunk.size;
      const chunkSizeChangePercent = (chunkSizeChange / baselineChunk.size) * 100;

      if (chunkSizeChangePercent > CONFIG.thresholds.chunkSizeIncrease) {
        regression.affectedChunks.push({
          name,
          baselineSize: baselineChunk.size,
          currentSize: currentChunk.size,
          change: chunkSizeChange,
          changePercent: chunkSizeChangePercent,
        });

        if (!regression.detected) {
          regression.detected = true;
          regression.severity = 'low';
        }
      }
    } else {
      // New chunk
      regression.newChunks.push({
        name,
        size: currentChunk.size,
        type: currentChunk.type,
      });

      if (currentChunk.size > CONFIG.thresholds.newChunkThreshold) {
        if (!regression.detected) {
          regression.detected = true;
          regression.severity = 'medium';
        }
      }
    }
  }

  // Find removed chunks
  for (const [name, baselineChunk] of baselineChunks) {
    if (!currentChunks.has(name)) {
      regression.removedChunks.push({
        name,
        size: baselineChunk.size,
        type: baselineChunk.type,
      });
    }
  }

  // Generate recommendations
  generateRecommendations();

  // Determine overall status
  determineStatus();
}

/**
 * Determine regression severity
 */
function determineSeverity(changePercent, totalSize) {
  if (totalSize > CONFIG.thresholds.criticalSizeLimit) {
    return 'critical';
  }

  if (changePercent > 25) {
    return 'high';
  } else if (changePercent > 15) {
    return 'medium';
  } else {
    return 'low';
  }
}

/**
 * Generate recommendations based on regression analysis
 */
function generateRecommendations() {
  const { regression } = testResults;
  const recommendations = [];

  if (regression.totalSizeChangePercent > CONFIG.thresholds.totalSizeIncrease) {
    recommendations.push({
      type: 'total-size',
      priority: 'high',
      message: `Total bundle size increased by ${formatBytes(regression.totalSizeChange)} (${regression.totalSizeChangePercent.toFixed(1)}%)`,
      actions: [
        'Review recent changes for unnecessary dependencies',
        'Implement code splitting for large features',
        'Use dynamic imports for non-critical code',
        'Optimize images and assets',
      ],
    });
  }

  if (regression.affectedChunks.length > 0) {
    const largestIncrease = regression.affectedChunks.reduce((max, chunk) =>
      chunk.changePercent > max.changePercent ? chunk : max
    );

    recommendations.push({
      type: 'chunk-size',
      priority: 'medium',
      message: `${regression.affectedChunks.length} chunks increased in size. Largest: ${largestIncrease.name} (+${largestIncrease.changePercent.toFixed(1)}%)`,
      actions: [
        'Review changes in affected chunks',
        'Consider splitting large chunks',
        'Remove unused code and dependencies',
      ],
    });
  }

  if (regression.newChunks.length > 0) {
    const largeNewChunks = regression.newChunks.filter(chunk =>
      chunk.size > CONFIG.thresholds.newChunkThreshold
    );

    if (largeNewChunks.length > 0) {
      recommendations.push({
        type: 'new-chunks',
        priority: 'medium',
        message: `${largeNewChunks.length} new large chunks detected`,
        actions: [
          'Verify new chunks are necessary',
          'Consider lazy loading for new features',
          'Optimize new chunk contents',
        ],
      });
    }
  }

  regression.recommendations = recommendations;
}

/**
 * Determine overall test status
 */
function determineStatus() {
  const { regression } = testResults;

  if (!regression.detected) {
    testResults.status = 'pass';
  } else {
    switch (regression.severity) {
      case 'critical':
      case 'high':
        testResults.status = 'fail';
        break;
      case 'medium':
        testResults.status = CONFIG.ci.failOnRegression ? 'fail' : 'warning';
        break;
      case 'low':
        testResults.status = 'warning';
        break;
      default:
        testResults.status = 'pass';
    }
  }
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));
  const sign = bytes < 0 ? '-' : '+';
  return sign + parseFloat((Math.abs(bytes) / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Generate detailed report
 */
function generateReport() {
  const report = {
    ...testResults,
    summary: {
      status: testResults.status,
      regressionDetected: testResults.regression.detected,
      severity: testResults.regression.severity,
      totalSizeChange: formatBytes(testResults.regression.totalSizeChange),
      totalSizeChangePercent: testResults.regression.totalSizeChangePercent.toFixed(1) + '%',
      affectedChunksCount: testResults.regression.affectedChunks.length,
      newChunksCount: testResults.regression.newChunks.length,
      recommendationsCount: testResults.regression.recommendations.length,
    },
  };

  // Save detailed report
  fs.writeFileSync(CONFIG.reportFile, JSON.stringify(report, null, 2));

  return report;
}

/**
 * Print console summary
 */
function printSummary() {
  const { regression, status } = testResults;

  console.log('\n📊 Bundle Size Regression Test Results:');
  console.log('='.repeat(50));

  // Status
  const statusIcon = status === 'pass' ? '✅' : status === 'warning' ? '⚠️' : '❌';
  console.log(`Status: ${statusIcon} ${status.toUpperCase()}`);

  // Total size change
  if (regression.totalSizeChange !== 0) {
    const changeIcon = regression.totalSizeChange > 0 ? '📈' : '📉';
    console.log(`Total Size Change: ${changeIcon} ${formatBytes(regression.totalSizeChange)} (${regression.totalSizeChangePercent.toFixed(1)}%)`);
  }

  // Affected chunks
  if (regression.affectedChunks.length > 0) {
    console.log(`\n📦 Affected Chunks (${regression.affectedChunks.length}):`);
    regression.affectedChunks.slice(0, 5).forEach(chunk => {
      console.log(`  • ${chunk.name}: ${formatBytes(chunk.change)} (${chunk.changePercent.toFixed(1)}%)`);
    });
    if (regression.affectedChunks.length > 5) {
      console.log(`  ... and ${regression.affectedChunks.length - 5} more`);
    }
  }

  // New chunks
  if (regression.newChunks.length > 0) {
    console.log(`\n🆕 New Chunks (${regression.newChunks.length}):`);
    regression.newChunks.slice(0, 5).forEach(chunk => {
      console.log(`  • ${chunk.name}: ${formatBytes(chunk.size)}`);
    });
    if (regression.newChunks.length > 5) {
      console.log(`  ... and ${regression.newChunks.length - 5} more`);
    }
  }

  // Recommendations
  if (regression.recommendations.length > 0) {
    console.log(`\n💡 Recommendations:`);
    regression.recommendations.forEach(rec => {
      console.log(`  • [${rec.priority.toUpperCase()}] ${rec.message}`);
      rec.actions.forEach(action => {
        console.log(`    - ${action}`);
      });
    });
  }

  console.log(`\n📄 Detailed report saved to: ${CONFIG.reportFile}`);
}

/**
 * Send Slack notification (if configured)
 */
async function sendSlackNotification() {
  if (!CONFIG.ci.slackWebhook || testResults.status === 'pass') {
    return;
  }

  const { regression, status } = testResults;
  const color = status === 'fail' ? 'danger' : 'warning';
  const emoji = status === 'fail' ? '🚨' : '⚠️';

  const message = {
    text: `${emoji} Bundle Size Regression Detected`,
    attachments: [
      {
        color,
        fields: [
          {
            title: 'Status',
            value: status.toUpperCase(),
            short: true,
          },
          {
            title: 'Size Change',
            value: `${formatBytes(regression.totalSizeChange)} (${regression.totalSizeChangePercent.toFixed(1)}%)`,
            short: true,
          },
          {
            title: 'Affected Chunks',
            value: regression.affectedChunks.length.toString(),
            short: true,
          },
          {
            title: 'Severity',
            value: regression.severity.toUpperCase(),
            short: true,
          },
        ],
        footer: 'Bundle Size Monitor',
        ts: Math.floor(Date.now() / 1000),
      },
    ],
  };

  try {
    const response = await fetch(CONFIG.ci.slackWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      console.warn('Failed to send Slack notification');
    }
  } catch (error) {
    console.warn('Error sending Slack notification:', error.message);
  }
}

/**
 * Create baseline from current bundle
 */
function createBaseline() {
  console.log('📊 Creating new baseline...');

  const current = analyzeCurrentBundle();
  const baseline = {
    timestamp: current.timestamp,
    totalSize: current.totalSize,
    chunks: current.chunks.map(chunk => ({
      name: chunk.name,
      size: chunk.size,
      type: chunk.type,
    })),
    environment: {
      node: process.version,
      platform: process.platform,
      ci: process.env.CI === 'true',
    },
  };

  fs.writeFileSync(CONFIG.baselineFile, JSON.stringify(baseline, null, 2));
  console.log(`✅ Baseline created: ${formatBytes(baseline.totalSize)}`);
  console.log(`📄 Baseline saved to: ${CONFIG.baselineFile}`);
}

/**
 * Main test function
 */
async function runRegressionTest() {
  console.log('🚀 Starting bundle size regression test...');

  try {
    // Load baseline
    loadBaseline();

    // Analyze current bundle
    analyzeCurrentBundle();

    // Compare with baseline
    compareWithBaseline();

    // Generate report
    generateReport();

    // Print summary
    printSummary();

    // Send notifications
    await sendSlackNotification();

    // Exit with appropriate code
    if (testResults.status === 'fail') {
      console.log('\n❌ Bundle size regression test failed');
      process.exit(1);
    } else if (testResults.status === 'warning') {
      console.log('\n⚠️  Bundle size regression test passed with warnings');
      process.exit(0);
    } else {
      console.log('\n✅ Bundle size regression test passed');
      process.exit(0);
    }

  } catch (error) {
    console.error('❌ Bundle size regression test failed:', error.message);
    process.exit(1);
  }
}

// CLI handling
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--create-baseline')) {
    createBaseline();
  } else if (args.includes('--help')) {
    console.log(`
Bundle Size Regression Test Usage:
  node scripts/bundle-regression-test.js                Run regression test
  node scripts/bundle-regression-test.js --create-baseline  Create new baseline
  node scripts/bundle-regression-test.js --help         Show this help

Environment Variables:
  CI=true                    Enable CI mode (fail on regression)
  SLACK_WEBHOOK_URL         Slack webhook for notifications
  GITHUB_ACTIONS=true       Enable GitHub Actions integration
    `);
  } else {
    runRegressionTest();
  }
}

module.exports = {
  runRegressionTest,
  createBaseline,
  CONFIG,
};
