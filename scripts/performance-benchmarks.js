#!/usr/bin/env node

/**
 * Performance Benchmarks Script
 *
 * Comprehensive performance testing utilities for measuring and tracking
 * application performance metrics, Core Web Vitals, and regression testing.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  outputDir: path.join(process.cwd(), 'performance-benchmarks'),
  baselineFile: path.join(process.cwd(), 'performance-baseline.json'),
  testUrls: [
    '/',
    '/products',
    '/cart',
    '/contact',
  ],
  thresholds: {
    LCP: { good: 2500, poor: 4000 },
    INP: { good: 200, poor: 500 },
    CLS: { good: 0.1, poor: 0.25 },
    FCP: { good: 1800, poor: 3000 },
    TTFB: { good: 800, poor: 1800 },
    loadTime: { good: 3000, poor: 5000 },
    bundleSize: { good: 500 * 1024, poor: 1024 * 1024 },
  },
  lighthouse: {
    categories: ['performance', 'accessibility', 'best-practices', 'seo'],
    device: 'mobile',
    throttling: 'simulated3G',
  },
};

// Benchmark results
const benchmarks = {
  timestamp: new Date().toISOString(),
  environment: {
    node: process.version,
    platform: process.platform,
    arch: process.arch,
  },
  metrics: {},
  lighthouse: {},
  webVitals: {},
  customMetrics: {},
  regressionCheck: null,
  score: 0,
  recommendations: [],
};

/**
 * Ensure output directory exists
 */
function ensureOutputDir() {
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }
}

/**
 * Run Lighthouse performance audit
 */
async function runLighthouseAudit() {
  console.log('🔍 Running Lighthouse performance audit...');

  const lighthouseResults = {};

  for (const url of CONFIG.testUrls) {
    console.log(`  Testing: ${url}`);

    try {
      // Run Lighthouse CLI
      const command = [
        'npx lighthouse',
        `http://localhost:3000${url}`,
        '--only-categories=performance,accessibility,best-practices,seo',
        '--form-factor=mobile',
        '--throttling-method=simulate',
        '--output=json',
        '--quiet',
      ].join(' ');

      const output = execSync(command, { encoding: 'utf8', timeout: 60000 });
      const result = JSON.parse(output);

      lighthouseResults[url] = {
        performance: result.categories.performance.score * 100,
        accessibility: result.categories.accessibility.score * 100,
        bestPractices: result.categories['best-practices'].score * 100,
        seo: result.categories.seo.score * 100,
        metrics: {
          LCP: result.audits['largest-contentful-paint'].numericValue,
          FCP: result.audits['first-contentful-paint'].numericValue,
          CLS: result.audits['cumulative-layout-shift'].numericValue,
          TTFB: result.audits['server-response-time'].numericValue,
          TBT: result.audits['total-blocking-time'].numericValue,
          SI: result.audits['speed-index'].numericValue,
        },
        opportunities: result.audits['unused-javascript'] ? {
          unusedJavaScript: result.audits['unused-javascript'].details?.overallSavingsBytes || 0,
          unusedCSS: result.audits['unused-css-rules'].details?.overallSavingsBytes || 0,
          unoptimizedImages: result.audits['uses-optimized-images'].details?.overallSavingsBytes || 0,
        } : {},
      };

    } catch (error) {
      console.warn(`  ⚠️  Lighthouse failed for ${url}:`, error.message);
      lighthouseResults[url] = {
        error: error.message,
        performance: 0,
        accessibility: 0,
        bestPractices: 0,
        seo: 0,
        metrics: {},
        opportunities: {},
      };
    }
  }

  benchmarks.lighthouse = lighthouseResults;
  return lighthouseResults;
}

/**
 * Run custom performance benchmarks
 */
async function runCustomBenchmarks() {
  console.log('🔍 Running custom performance benchmarks...');

  const customMetrics = {};

  // Build time benchmark
  console.log('  Measuring build time...');
  const buildStart = Date.now();
  try {
    execSync('npm run build', { stdio: 'pipe', timeout: 300000 }); // 5 min timeout
    customMetrics.buildTime = Date.now() - buildStart;
  } catch (error) {
    customMetrics.buildTime = null;
    customMetrics.buildError = error.message;
  }

  // Bundle size analysis
  console.log('  Analyzing bundle size...');
  try {
    const bundleAnalysis = require('./bundle-analyzer');
    const bundleResult = bundleAnalysis.runBundleAnalysis();
    customMetrics.bundleSize = bundleResult?.totalSize || 0;
  } catch (error) {
    customMetrics.bundleSize = null;
    customMetrics.bundleError = error.message;
  }

  // Memory usage benchmark
  console.log('  Measuring memory usage...');
  const memUsage = process.memoryUsage();
  customMetrics.memoryUsage = {
    rss: memUsage.rss,
    heapTotal: memUsage.heapTotal,
    heapUsed: memUsage.heapUsed,
    external: memUsage.external,
  };

  // TypeScript compilation time
  console.log('  Measuring TypeScript compilation...');
  const tscStart = Date.now();
  try {
    execSync('npm run type-check', { stdio: 'pipe', timeout: 120000 }); // 2 min timeout
    customMetrics.typeCheckTime = Date.now() - tscStart;
  } catch (error) {
    customMetrics.typeCheckTime = null;
    customMetrics.typeCheckError = error.message;
  }

  // Test execution time
  console.log('  Measuring test execution time...');
  const testStart = Date.now();
  try {
    execSync('npm run test -- --passWithNoTests', { stdio: 'pipe', timeout: 180000 }); // 3 min timeout
    customMetrics.testTime = Date.now() - testStart;
  } catch (error) {
    customMetrics.testTime = null;
    customMetrics.testError = error.message;
  }

  benchmarks.customMetrics = customMetrics;
  return customMetrics;
}

/**
 * Simulate Web Vitals collection
 */
function simulateWebVitals() {
  console.log('🔍 Simulating Web Vitals collection...');

  // This would typically be collected from real browser sessions
  // For now, we'll use Lighthouse data as a proxy
  const webVitals = {};

  for (const [url, data] of Object.entries(benchmarks.lighthouse)) {
    if (data.metrics) {
      webVitals[url] = {
        LCP: data.metrics.LCP,
        INP: data.metrics.INP || data.metrics.TBT, // Fallback to TBT if INP not available
        CLS: data.metrics.CLS,
        FCP: data.metrics.FCP,
        TTFB: data.metrics.TTFB,
        ratings: {
          LCP: getRating('LCP', data.metrics.LCP),
          INP: getRating('INP', data.metrics.INP || data.metrics.TBT),
          CLS: getRating('CLS', data.metrics.CLS),
          FCP: getRating('FCP', data.metrics.FCP),
          TTFB: getRating('TTFB', data.metrics.TTFB),
        },
      };
    }
  }

  benchmarks.webVitals = webVitals;
  return webVitals;
}

/**
 * Get performance rating based on thresholds
 */
function getRating(metric, value) {
  const threshold = CONFIG.thresholds[metric];
  if (!threshold || value === null || value === undefined) return 'unknown';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Generate performance recommendations
 */
function generateRecommendations() {
  const recommendations = [];

  // Analyze Lighthouse results
  for (const [url, data] of Object.entries(benchmarks.lighthouse)) {
    if (data.performance < 80) {
      recommendations.push({
        type: 'lighthouse-performance',
        severity: 'high',
        url,
        message: `Lighthouse performance score is ${data.performance}/100`,
        suggestion: 'Optimize Core Web Vitals and loading performance',
      });
    }

    if (data.opportunities?.unusedJavaScript > 50000) {
      recommendations.push({
        type: 'unused-javascript',
        severity: 'medium',
        url,
        message: `${formatBytes(data.opportunities.unusedJavaScript)} of unused JavaScript`,
        suggestion: 'Remove unused code and implement code splitting',
      });
    }
  }

  // Analyze Web Vitals
  for (const [url, vitals] of Object.entries(benchmarks.webVitals)) {
    Object.entries(vitals.ratings).forEach(([metric, rating]) => {
      if (rating === 'poor') {
        recommendations.push({
          type: 'web-vitals',
          severity: 'high',
          url,
          metric,
          message: `${metric} rating is poor (${vitals[metric]}ms)`,
          suggestion: getWebVitalsSuggestion(metric),
        });
      }
    });
  }

  // Analyze custom metrics
  const { customMetrics } = benchmarks;

  if (customMetrics.buildTime > 120000) { // 2 minutes
    recommendations.push({
      type: 'build-time',
      severity: 'medium',
      message: `Build time is ${Math.round(customMetrics.buildTime / 1000)}s`,
      suggestion: 'Optimize build configuration and dependencies',
    });
  }

  if (customMetrics.bundleSize > CONFIG.thresholds.bundleSize.poor) {
    recommendations.push({
      type: 'bundle-size',
      severity: 'high',
      message: `Bundle size is ${formatBytes(customMetrics.bundleSize)}`,
      suggestion: 'Implement code splitting and tree shaking',
    });
  }

  benchmarks.recommendations = recommendations;
  return recommendations;
}

/**
 * Get Web Vitals specific suggestions
 */
function getWebVitalsSuggestion(metric) {
  const suggestions = {
    LCP: 'Optimize server response time, preload key resources, and optimize images',
    INP: 'Reduce JavaScript execution time and optimize event handlers',
    CLS: 'Set explicit dimensions for images and avoid inserting content above existing content',
    FCP: 'Optimize server response time and eliminate render-blocking resources',
    TTFB: 'Optimize server configuration and use CDN',
  };

  return suggestions[metric] || 'Review performance best practices';
}

/**
 * Check for performance regression
 */
function checkRegression() {
  if (!fs.existsSync(CONFIG.baselineFile)) {
    console.log('📊 No performance baseline found, creating new baseline...');
    saveBaseline();
    return null;
  }

  const baseline = JSON.parse(fs.readFileSync(CONFIG.baselineFile, 'utf8'));
  const regression = {
    timestamp: baseline.timestamp,
    changes: {},
    isRegression: false,
  };

  // Compare Lighthouse scores
  for (const url of CONFIG.testUrls) {
    const current = benchmarks.lighthouse[url];
    const baselineData = baseline.lighthouse?.[url];

    if (current && baselineData) {
      const perfChange = current.performance - baselineData.performance;
      regression.changes[url] = {
        performance: perfChange,
        isRegression: perfChange < -10, // 10 point drop
      };

      if (perfChange < -10) {
        regression.isRegression = true;
      }
    }
  }

  // Compare custom metrics
  const currentBuild = benchmarks.customMetrics.buildTime;
  const baselineBuild = baseline.customMetrics?.buildTime;

  if (currentBuild && baselineBuild) {
    const buildChange = ((currentBuild - baselineBuild) / baselineBuild) * 100;
    regression.changes.buildTime = {
      change: buildChange,
      isRegression: buildChange > 20, // 20% increase
    };

    if (buildChange > 20) {
      regression.isRegression = true;
    }
  }

  benchmarks.regressionCheck = regression;
  return regression;
}

/**
 * Save current benchmarks as baseline
 */
function saveBaseline() {
  const baseline = {
    timestamp: benchmarks.timestamp,
    lighthouse: benchmarks.lighthouse,
    customMetrics: benchmarks.customMetrics,
    webVitals: benchmarks.webVitals,
  };

  fs.writeFileSync(CONFIG.baselineFile, JSON.stringify(baseline, null, 2));
  console.log('📊 Performance baseline saved');
}

/**
 * Calculate overall performance score
 */
function calculateScore() {
  let score = 100;
  let totalWeight = 0;

  // Lighthouse scores (40% weight)
  let lighthouseAvg = 0;
  let lighthouseCount = 0;

  for (const data of Object.values(benchmarks.lighthouse)) {
    if (typeof data.performance === 'number') {
      lighthouseAvg += data.performance;
      lighthouseCount++;
    }
  }

  if (lighthouseCount > 0) {
    lighthouseAvg /= lighthouseCount;
    score = (score * 0.6) + (lighthouseAvg * 0.4);
    totalWeight += 0.4;
  }

  // Web Vitals scores (30% weight)
  let webVitalsScore = 100;
  let vitalsCount = 0;

  for (const vitals of Object.values(benchmarks.webVitals)) {
    Object.values(vitals.ratings).forEach(rating => {
      vitalsCount++;
      if (rating === 'poor') webVitalsScore -= 20;
      else if (rating === 'needs-improvement') webVitalsScore -= 10;
    });
  }

  if (vitalsCount > 0) {
    webVitalsScore = Math.max(0, webVitalsScore);
    score = (score * 0.7) + (webVitalsScore * 0.3);
    totalWeight += 0.3;
  }

  // Custom metrics (30% weight)
  let customScore = 100;
  const { customMetrics } = benchmarks;

  if (customMetrics.buildTime > 120000) customScore -= 20;
  if (customMetrics.bundleSize > CONFIG.thresholds.bundleSize.poor) customScore -= 30;
  if (customMetrics.typeCheckTime > 30000) customScore -= 10;

  score = (score * 0.7) + (Math.max(0, customScore) * 0.3);
  totalWeight += 0.3;

  // Regression penalty
  if (benchmarks.regressionCheck?.isRegression) {
    score -= 20;
  }

  benchmarks.score = Math.max(0, Math.round(score));
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Generate HTML report
 */
function generateHTMLReport() {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Performance Benchmark Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: #059669; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { padding: 20px; }
        .metric { display: inline-block; margin: 10px 20px 10px 0; padding: 15px; background: #f8fafc; border-radius: 6px; border-left: 4px solid #059669; }
        .metric-value { font-size: 24px; font-weight: bold; color: #047857; }
        .metric-label { font-size: 14px; color: #64748b; margin-top: 5px; }
        .section { margin: 30px 0; }
        .section h2 { color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
        .url-section { margin: 20px 0; padding: 15px; background: #f8fafc; border-radius: 6px; }
        .score { font-size: 48px; font-weight: bold; text-align: center; padding: 20px; }
        .score.good { color: #10b981; }
        .score.warning { color: #f59e0b; }
        .score.poor { color: #ef4444; }
        .rating { padding: 5px 10px; border-radius: 4px; color: white; font-size: 12px; font-weight: bold; }
        .rating.good { background: #10b981; }
        .rating.needs-improvement { background: #f59e0b; }
        .rating.poor { background: #ef4444; }
        .recommendation { padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 4px solid #ef4444; background: #fef2f2; }
        .recommendation.medium { border-left-color: #f59e0b; background: #fffbeb; }
        .recommendation.low { border-left-color: #10b981; background: #f0fdf4; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Performance Benchmark Report</h1>
            <p>Generated on ${new Date(benchmarks.timestamp).toLocaleString()}</p>
        </div>
        <div class="content">
            <div class="score ${benchmarks.score >= 80 ? 'good' : benchmarks.score >= 60 ? 'warning' : 'poor'}">
                Performance Score: ${benchmarks.score}/100
            </div>

            <div class="section">
                <h2>Custom Metrics</h2>
                <div class="metric">
                    <div class="metric-value">${benchmarks.customMetrics.buildTime ? Math.round(benchmarks.customMetrics.buildTime / 1000) + 's' : 'N/A'}</div>
                    <div class="metric-label">Build Time</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${benchmarks.customMetrics.bundleSize ? formatBytes(benchmarks.customMetrics.bundleSize) : 'N/A'}</div>
                    <div class="metric-label">Bundle Size</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${benchmarks.customMetrics.typeCheckTime ? Math.round(benchmarks.customMetrics.typeCheckTime / 1000) + 's' : 'N/A'}</div>
                    <div class="metric-label">Type Check Time</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${benchmarks.customMetrics.testTime ? Math.round(benchmarks.customMetrics.testTime / 1000) + 's' : 'N/A'}</div>
                    <div class="metric-label">Test Time</div>
                </div>
            </div>

            <div class="section">
                <h2>Lighthouse Scores</h2>
                ${Object.entries(benchmarks.lighthouse).map(([url, data]) => `
                    <div class="url-section">
                        <h3>${url}</h3>
                        <div class="metric">
                            <div class="metric-value">${data.performance || 0}</div>
                            <div class="metric-label">Performance</div>
                        </div>
                        <div class="metric">
                            <div class="metric-value">${data.accessibility || 0}</div>
                            <div class="metric-label">Accessibility</div>
                        </div>
                        <div class="metric">
                            <div class="metric-value">${data.bestPractices || 0}</div>
                            <div class="metric-label">Best Practices</div>
                        </div>
                        <div class="metric">
                            <div class="metric-value">${data.seo || 0}</div>
                            <div class="metric-label">SEO</div>
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="section">
                <h2>Web Vitals</h2>
                ${Object.entries(benchmarks.webVitals).map(([url, vitals]) => `
                    <div class="url-section">
                        <h3>${url}</h3>
                        ${Object.entries(vitals.ratings).map(([metric, rating]) => `
                            <span class="rating ${rating}">${metric}: ${vitals[metric]}${metric === 'CLS' ? '' : 'ms'}</span>
                        `).join(' ')}
                    </div>
                `).join('')}
            </div>

            ${benchmarks.recommendations.length > 0 ? `
            <div class="section">
                <h2>Recommendations</h2>
                ${benchmarks.recommendations.map(rec => `
                    <div class="recommendation ${rec.severity}">
                        <strong>${rec.type.toUpperCase()}</strong>${rec.url ? ` (${rec.url})` : ''}: ${rec.message}
                        <br><em>Suggestion: ${rec.suggestion}</em>
                    </div>
                `).join('')}
            </div>
            ` : ''}
        </div>
    </div>
</body>
</html>
  `;

  const reportPath = path.join(CONFIG.outputDir, 'performance-report.html');
  fs.writeFileSync(reportPath, html);
  console.log(`📊 Performance report generated: ${reportPath}`);
}

/**
 * Main benchmark function
 */
async function runPerformanceBenchmarks() {
  console.log('🚀 Starting performance benchmarks...');

  ensureOutputDir();

  try {
    // Run all benchmarks
    await runLighthouseAudit();
    await runCustomBenchmarks();
    simulateWebVitals();

    // Generate analysis
    generateRecommendations();
    checkRegression();
    calculateScore();

    // Save results
    const resultsPath = path.join(CONFIG.outputDir, 'performance-benchmarks.json');
    fs.writeFileSync(resultsPath, JSON.stringify(benchmarks, null, 2));

    // Generate HTML report
    generateHTMLReport();

    // Print summary
    console.log('\n📊 Performance Benchmark Results:');
    console.log(`Overall Score: ${benchmarks.score}/100`);
    console.log(`Recommendations: ${benchmarks.recommendations.length}`);

    if (benchmarks.regressionCheck?.isRegression) {
      console.log('Regression: ❌ Performance regression detected');
    } else {
      console.log('Regression: ✅ No performance regression');
    }

    console.log(`\n📄 Full results saved to: ${resultsPath}`);

    // Exit with appropriate code
    if (benchmarks.score < 70 || benchmarks.regressionCheck?.isRegression) {
      console.log('\n❌ Performance benchmarks failed quality gates');
      process.exit(1);
    } else {
      console.log('\n✅ Performance benchmarks passed!');
      process.exit(0);
    }

  } catch (error) {
    console.error('❌ Performance benchmarks failed:', error.message);
    process.exit(1);
  }
}

// CLI handling
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--save-baseline')) {
    runPerformanceBenchmarks().then(() => saveBaseline());
  } else if (args.includes('--help')) {
    console.log(`
Performance Benchmarks Usage:
  node scripts/performance-benchmarks.js                Run benchmarks
  node scripts/performance-benchmarks.js --save-baseline  Save current as baseline
  node scripts/performance-benchmarks.js --help         Show this help
    `);
  } else {
    runPerformanceBenchmarks();
  }
}

module.exports = {
  runPerformanceBenchmarks,
  CONFIG,
};
