#!/usr/bin/env node

/**
 * Bundle Analyzer Script
 *
 * Comprehensive bundle analysis tool for Next.js applications.
 * Analyzes bundle sizes, identifies optimization opportunities,
 * and tracks bundle size regression.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  buildDir: path.join(process.cwd(), '.next'),
  outputDir: path.join(process.cwd(), 'bundle-analysis'),
  baselineFile: path.join(process.cwd(), 'bundle-baseline.json'),
  thresholds: {
    totalSize: 500 * 1024, // 500KB
    chunkSize: 250 * 1024, // 250KB
    regressionPercent: 10, // 10% increase threshold
  },
};

// Analysis results
const analysis = {
  timestamp: new Date().toISOString(),
  totalSize: 0,
  chunks: [],
  assets: [],
  dependencies: {},
  recommendations: [],
  regressionCheck: null,
  score: 0,
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
 * Parse Next.js build output
 */
function parseBuildOutput() {
  const buildStatsPath = path.join(CONFIG.buildDir, 'build-manifest.json');
  const serverStatsPath = path.join(CONFIG.buildDir, 'server', 'pages-manifest.json');

  if (!fs.existsSync(buildStatsPath)) {
    throw new Error('Build manifest not found. Run "npm run build" first.');
  }

  // Parse client-side build manifest
  const buildManifest = JSON.parse(fs.readFileSync(buildStatsPath, 'utf8'));

  // Analyze static chunks
  const staticDir = path.join(CONFIG.buildDir, 'static');
  if (fs.existsSync(staticDir)) {
    analyzeStaticAssets(staticDir);
  }

  return buildManifest;
}

/**
 * Analyze static assets
 */
function analyzeStaticAssets(staticDir) {
  const chunksDir = path.join(staticDir, 'chunks');
  const cssDir = path.join(staticDir, 'css');
  const mediaDir = path.join(staticDir, 'media');

  // Analyze JavaScript chunks
  if (fs.existsSync(chunksDir)) {
    analyzeDirectory(chunksDir, 'js', 'JavaScript Chunk');
  }

  // Analyze CSS files
  if (fs.existsSync(cssDir)) {
    analyzeDirectory(cssDir, 'css', 'CSS File');
  }

  // Analyze media files
  if (fs.existsSync(mediaDir)) {
    analyzeDirectory(mediaDir, ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'], 'Media File');
  }
}

/**
 * Analyze files in a directory
 */
function analyzeDirectory(dir, extensions, type) {
  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    if (file.isFile()) {
      const filePath = path.join(dir, file.name);
      const ext = path.extname(file.name).slice(1);

      if (typeof extensions === 'string' ? ext === extensions : extensions.includes(ext)) {
        const stats = fs.statSync(filePath);
        const asset = {
          name: file.name,
          path: path.relative(CONFIG.buildDir, filePath),
          size: stats.size,
          type,
          extension: ext,
          gzipSize: null, // Will be calculated if needed
        };

        // Calculate gzip size for JavaScript and CSS
        if (['js', 'css'].includes(ext)) {
          try {
            const gzipSize = execSync(`gzip -c "${filePath}" | wc -c`, { encoding: 'utf8' });
            asset.gzipSize = parseInt(gzipSize.trim());
          } catch (error) {
            // Gzip calculation failed, skip
          }
        }

        analysis.assets.push(asset);
        analysis.totalSize += stats.size;

        // Categorize as chunk if it's a JavaScript file
        if (ext === 'js') {
          analysis.chunks.push({
            name: file.name,
            size: stats.size,
            gzipSize: asset.gzipSize,
            type: getChunkType(file.name),
          });
        }
      }
    } else if (file.isDirectory()) {
      analyzeDirectory(path.join(dir, file.name), extensions, type);
    }
  }
}

/**
 * Determine chunk type based on filename
 */
function getChunkType(filename) {
  if (filename.includes('framework')) return 'framework';
  if (filename.includes('main')) return 'main';
  if (filename.includes('webpack')) return 'webpack';
  if (filename.includes('commons')) return 'commons';
  if (filename.includes('vendors')) return 'vendors';
  if (filename.match(/^\d+\./)) return 'dynamic';
  return 'other';
}

/**
 * Analyze dependencies from package.json
 */
function analyzeDependencies() {
  const packagePath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

  const deps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };

  // Estimate bundle impact of dependencies
  for (const [name, version] of Object.entries(deps)) {
    analysis.dependencies[name] = {
      version,
      estimated: estimateDependencySize(name),
      category: categorizeDependency(name),
    };
  }
}

/**
 * Estimate dependency size (rough estimates)
 */
function estimateDependencySize(name) {
  const sizeEstimates = {
    'react': 45000,
    'react-dom': 130000,
    'next': 200000,
    '@supabase/supabase-js': 150000,
    'tailwindcss': 50000,
    'web-vitals': 5000,
    // Add more as needed
  };

  return sizeEstimates[name] || 10000; // Default 10KB estimate
}

/**
 * Categorize dependency
 */
function categorizeDependency(name) {
  if (name.includes('react')) return 'framework';
  if (name.includes('next')) return 'framework';
  if (name.includes('test') || name.includes('jest') || name.includes('playwright')) return 'testing';
  if (name.includes('typescript') || name.includes('biome')) return 'development';
  if (name.includes('ui') || name.includes('icon') || name.includes('headless')) return 'ui';
  if (name.includes('auth') || name.includes('supabase')) return 'backend';
  return 'utility';
}

/**
 * Generate recommendations
 */
function generateRecommendations() {
  const recommendations = [];

  // Check total bundle size
  if (analysis.totalSize > CONFIG.thresholds.totalSize) {
    recommendations.push({
      type: 'size',
      severity: 'high',
      message: `Total bundle size (${formatBytes(analysis.totalSize)}) exceeds threshold (${formatBytes(CONFIG.thresholds.totalSize)})`,
      suggestion: 'Consider code splitting, tree shaking, or removing unused dependencies',
    });
  }

  // Check individual chunk sizes
  const largeChunks = analysis.chunks.filter(chunk => chunk.size > CONFIG.thresholds.chunkSize);
  if (largeChunks.length > 0) {
    recommendations.push({
      type: 'chunks',
      severity: 'medium',
      message: `${largeChunks.length} chunks exceed size threshold`,
      suggestion: 'Split large chunks or optimize heavy dependencies',
      details: largeChunks.map(chunk => `${chunk.name}: ${formatBytes(chunk.size)}`),
    });
  }

  // Check for duplicate dependencies
  const duplicates = findDuplicateDependencies();
  if (duplicates.length > 0) {
    recommendations.push({
      type: 'duplicates',
      severity: 'medium',
      message: `Potential duplicate dependencies detected: ${duplicates.join(', ')}`,
      suggestion: 'Review and consolidate similar dependencies',
    });
  }

  // Check for unused dependencies
  const unused = findUnusedDependencies();
  if (unused.length > 0) {
    recommendations.push({
      type: 'unused',
      severity: 'low',
      message: `Potentially unused dependencies: ${unused.slice(0, 5).join(', ')}`,
      suggestion: 'Remove unused dependencies to reduce bundle size',
    });
  }

  analysis.recommendations = recommendations;
}

/**
 * Find duplicate dependencies
 */
function findDuplicateDependencies() {
  const deps = Object.keys(analysis.dependencies);
  const duplicates = [];

  // Simple heuristic: look for similar names
  for (let i = 0; i < deps.length; i++) {
    for (let j = i + 1; j < deps.length; j++) {
      const dep1 = deps[i];
      const dep2 = deps[j];

      // Check for similar names (e.g., lodash and lodash-es)
      if (dep1.includes(dep2) || dep2.includes(dep1)) {
        if (!duplicates.includes(dep1)) duplicates.push(dep1);
        if (!duplicates.includes(dep2)) duplicates.push(dep2);
      }
    }
  }

  return duplicates;
}

/**
 * Find potentially unused dependencies
 */
function findUnusedDependencies() {
  // This is a simplified check - in practice, you'd want to scan the codebase
  const devOnlyDeps = [
    '@types/',
    'eslint',
    'prettier',
    'jest',
    'playwright',
    'biome',
    'typescript',
  ];

  return Object.keys(analysis.dependencies).filter(dep =>
    devOnlyDeps.some(pattern => dep.includes(pattern)) &&
    analysis.dependencies[dep].category === 'development'
  );
}

/**
 * Check for bundle size regression
 */
function checkRegression() {
  if (!fs.existsSync(CONFIG.baselineFile)) {
    console.log('📊 No baseline found, creating new baseline...');
    saveBaseline();
    return null;
  }

  const baseline = JSON.parse(fs.readFileSync(CONFIG.baselineFile, 'utf8'));
  const currentSize = analysis.totalSize;
  const baselineSize = baseline.totalSize;

  const change = currentSize - baselineSize;
  const changePercent = (change / baselineSize) * 100;

  const regression = {
    baseline: baselineSize,
    current: currentSize,
    change,
    changePercent,
    isRegression: changePercent > CONFIG.thresholds.regressionPercent,
    timestamp: baseline.timestamp,
  };

  analysis.regressionCheck = regression;

  if (regression.isRegression) {
    analysis.recommendations.unshift({
      type: 'regression',
      severity: 'high',
      message: `Bundle size increased by ${formatBytes(change)} (${changePercent.toFixed(1)}%)`,
      suggestion: 'Review recent changes and optimize bundle size',
    });
  }

  return regression;
}

/**
 * Save current analysis as baseline
 */
function saveBaseline() {
  const baseline = {
    timestamp: analysis.timestamp,
    totalSize: analysis.totalSize,
    chunks: analysis.chunks.map(chunk => ({
      name: chunk.name,
      size: chunk.size,
      type: chunk.type,
    })),
  };

  fs.writeFileSync(CONFIG.baselineFile, JSON.stringify(baseline, null, 2));
  console.log(`📊 Baseline saved: ${formatBytes(baseline.totalSize)}`);
}

/**
 * Calculate bundle score
 */
function calculateScore() {
  let score = 100;

  // Size penalties
  const sizeRatio = analysis.totalSize / CONFIG.thresholds.totalSize;
  if (sizeRatio > 1) {
    score -= Math.min(30, (sizeRatio - 1) * 50);
  }

  // Chunk penalties
  const largeChunks = analysis.chunks.filter(chunk => chunk.size > CONFIG.thresholds.chunkSize);
  score -= largeChunks.length * 5;

  // Regression penalty
  if (analysis.regressionCheck?.isRegression) {
    score -= 20;
  }

  // Recommendation penalties
  const highSeverityRecs = analysis.recommendations.filter(r => r.severity === 'high');
  score -= highSeverityRecs.length * 10;

  analysis.score = Math.max(0, Math.round(score));
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
    <title>Bundle Analysis Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { padding: 20px; }
        .metric { display: inline-block; margin: 10px 20px 10px 0; padding: 15px; background: #f8fafc; border-radius: 6px; border-left: 4px solid #2563eb; }
        .metric-value { font-size: 24px; font-weight: bold; color: #1e40af; }
        .metric-label { font-size: 14px; color: #64748b; margin-top: 5px; }
        .section { margin: 30px 0; }
        .section h2 { color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
        .chunk { display: flex; justify-content: space-between; padding: 10px; margin: 5px 0; background: #f8fafc; border-radius: 4px; }
        .recommendation { padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 4px solid #ef4444; background: #fef2f2; }
        .recommendation.medium { border-left-color: #f59e0b; background: #fffbeb; }
        .recommendation.low { border-left-color: #10b981; background: #f0fdf4; }
        .score { font-size: 48px; font-weight: bold; text-align: center; padding: 20px; }
        .score.good { color: #10b981; }
        .score.warning { color: #f59e0b; }
        .score.poor { color: #ef4444; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Bundle Analysis Report</h1>
            <p>Generated on ${new Date(analysis.timestamp).toLocaleString()}</p>
        </div>
        <div class="content">
            <div class="score ${analysis.score >= 80 ? 'good' : analysis.score >= 60 ? 'warning' : 'poor'}">
                Score: ${analysis.score}/100
            </div>

            <div class="section">
                <div class="metric">
                    <div class="metric-value">${formatBytes(analysis.totalSize)}</div>
                    <div class="metric-label">Total Bundle Size</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${analysis.chunks.length}</div>
                    <div class="metric-label">JavaScript Chunks</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${analysis.assets.length}</div>
                    <div class="metric-label">Total Assets</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${Object.keys(analysis.dependencies).length}</div>
                    <div class="metric-label">Dependencies</div>
                </div>
            </div>

            ${analysis.regressionCheck ? `
            <div class="section">
                <h2>Bundle Size Regression</h2>
                <div class="metric">
                    <div class="metric-value ${analysis.regressionCheck.isRegression ? 'style="color: #ef4444;"' : 'style="color: #10b981;"'}">${analysis.regressionCheck.changePercent > 0 ? '+' : ''}${analysis.regressionCheck.changePercent.toFixed(1)}%</div>
                    <div class="metric-label">Change from baseline (${formatBytes(analysis.regressionCheck.change)})</div>
                </div>
            </div>
            ` : ''}

            <div class="section">
                <h2>Largest Chunks</h2>
                ${analysis.chunks.sort((a, b) => b.size - a.size).slice(0, 10).map(chunk => `
                    <div class="chunk">
                        <span>${chunk.name} (${chunk.type})</span>
                        <span>${formatBytes(chunk.size)}${chunk.gzipSize ? ` (${formatBytes(chunk.gzipSize)} gzipped)` : ''}</span>
                    </div>
                `).join('')}
            </div>

            ${analysis.recommendations.length > 0 ? `
            <div class="section">
                <h2>Recommendations</h2>
                ${analysis.recommendations.map(rec => `
                    <div class="recommendation ${rec.severity}">
                        <strong>${rec.type.toUpperCase()}</strong>: ${rec.message}
                        <br><em>Suggestion: ${rec.suggestion}</em>
                        ${rec.details ? `<br><small>${rec.details.join(', ')}</small>` : ''}
                    </div>
                `).join('')}
            </div>
            ` : ''}
        </div>
    </div>
</body>
</html>
  `;

  const reportPath = path.join(CONFIG.outputDir, 'bundle-report.html');
  fs.writeFileSync(reportPath, html);
  console.log(`📊 HTML report generated: ${reportPath}`);
}

/**
 * Main analysis function
 */
function runBundleAnalysis() {
  console.log('🔍 Starting bundle analysis...');

  ensureOutputDir();

  try {
    // Parse build output
    parseBuildOutput();

    // Analyze dependencies
    analyzeDependencies();

    // Generate recommendations
    generateRecommendations();

    // Check for regression
    checkRegression();

    // Calculate score
    calculateScore();

    // Save analysis results
    const analysisPath = path.join(CONFIG.outputDir, 'bundle-analysis.json');
    fs.writeFileSync(analysisPath, JSON.stringify(analysis, null, 2));

    // Generate HTML report
    generateHTMLReport();

    // Print summary
    console.log('\n📊 Bundle Analysis Results:');
    console.log(`Total Size: ${formatBytes(analysis.totalSize)}`);
    console.log(`Chunks: ${analysis.chunks.length}`);
    console.log(`Score: ${analysis.score}/100`);
    console.log(`Recommendations: ${analysis.recommendations.length}`);

    if (analysis.regressionCheck) {
      const { changePercent, isRegression } = analysis.regressionCheck;
      console.log(`Regression: ${isRegression ? '❌' : '✅'} ${changePercent > 0 ? '+' : ''}${changePercent.toFixed(1)}%`);
    }

    console.log(`\n📄 Full analysis saved to: ${analysisPath}`);

    // Exit with appropriate code
    if (analysis.score < 70 || analysis.regressionCheck?.isRegression) {
      console.log('\n❌ Bundle analysis failed quality gates');
      process.exit(1);
    } else {
      console.log('\n✅ Bundle analysis passed!');
      process.exit(0);
    }

  } catch (error) {
    console.error('❌ Bundle analysis failed:', error.message);
    process.exit(1);
  }
}

// CLI handling
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--save-baseline')) {
    runBundleAnalysis();
    saveBaseline();
  } else if (args.includes('--help')) {
    console.log(`
Bundle Analyzer Usage:
  node scripts/bundle-analyzer.js              Run analysis
  node scripts/bundle-analyzer.js --save-baseline  Save current as baseline
  node scripts/bundle-analyzer.js --help       Show this help
    `);
  } else {
    runBundleAnalysis();
  }
}

module.exports = {
  runBundleAnalysis,
  CONFIG,
};
