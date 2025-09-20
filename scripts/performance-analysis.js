#!/usr/bin/env node

/**
 * Performance Analysis Script for Task 14.1
 *
 * Analyzes bundle size and loading performance for the UI migration project
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting Performance Analysis for Task 14.1...\n');

// Configuration
const CONFIG = {
  outputDir: path.join(process.cwd(), 'performance-analysis'),
  buildDir: path.join(process.cwd(), '.next'),
  thresholds: {
    totalSize: 500 * 1024, // 500KB
    chunkSize: 250 * 1024, // 250KB
  }
};

// Ensure output directory exists
if (!fs.existsSync(CONFIG.outputDir)) {
  fs.mkdirSync(CONFIG.outputDir, { recursive: true });
}

const analysis = {
  timestamp: new Date().toISOString(),
  buildStatus: 'unknown',
  bundleSize: null,
  chunks: [],
  recommendations: [],
  nextJsOptimizations: [],
  imageOptimizations: [],
  coreWebVitals: null
};

/**
 * Check if build exists and analyze bundle
 */
function analyzeBundleSize() {
  console.log('📊 Analyzing bundle size...');

  try {
    // Check if build exists
    if (!fs.existsSync(CONFIG.buildDir)) {
      console.log('⚠️  No build found. Attempting to build...');

      try {
        execSync('npm run build', { stdio: 'pipe', timeout: 300000 });
        analysis.buildStatus = 'success';
        console.log('✅ Build completed successfully');
      } catch (buildError) {
        analysis.buildStatus = 'failed';
        analysis.buildError = buildError.message;
        console.log('❌ Build failed. Analyzing existing files...');
        return analyzeSourceFiles();
      }
    } else {
      analysis.buildStatus = 'existing';
      console.log('✅ Using existing build');
    }

    // Analyze .next directory
    const staticDir = path.join(CONFIG.buildDir, 'static');
    if (fs.existsSync(staticDir)) {
      analyzeStaticAssets(staticDir);
    }

    return true;
  } catch (error) {
    console.error('❌ Bundle analysis failed:', error.message);
    return analyzeSourceFiles();
  }
}

/**
 * Analyze static assets from .next/static
 */
function analyzeStaticAssets(staticDir) {
  console.log('  📁 Analyzing static assets...');

  const chunksDir = path.join(staticDir, 'chunks');
  const cssDir = path.join(staticDir, 'css');

  let totalSize = 0;

  // Analyze JavaScript chunks
  if (fs.existsSync(chunksDir)) {
    const files = fs.readdirSync(chunksDir, { recursive: true });
    files.forEach(file => {
      if (typeof file === 'string' && file.endsWith('.js')) {
        const filePath = path.join(chunksDir, file);
        if (fs.statSync(filePath).isFile()) {
          const size = fs.statSync(filePath).size;
          totalSize += size;

          analysis.chunks.push({
            name: file,
            size,
            type: getChunkType(file),
            path: path.relative(CONFIG.buildDir, filePath)
          });
        }
      }
    });
  }

  // Analyze CSS files
  if (fs.existsSync(cssDir)) {
    const files = fs.readdirSync(cssDir);
    files.forEach(file => {
      if (file.endsWith('.css')) {
        const filePath = path.join(cssDir, file);
        const size = fs.statSync(filePath).size;
        totalSize += size;

        analysis.chunks.push({
          name: file,
          size,
          type: 'css',
          path: path.relative(CONFIG.buildDir, filePath)
        });
      }
    });
  }

  analysis.bundleSize = totalSize;
  console.log(`  📊 Total bundle size: ${formatBytes(totalSize)}`);
}

/**
 * Analyze source files when build is not available
 */
function analyzeSourceFiles() {
  console.log('  📁 Analyzing source files...');

  const srcDir = path.join(process.cwd(), 'src');
  let totalSize = 0;
  let fileCount = 0;

  function analyzeDirectory(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });

    files.forEach(file => {
      const filePath = path.join(dir, file.name);

      if (file.isDirectory()) {
        analyzeDirectory(filePath);
      } else if (file.isFile() && (file.name.endsWith('.tsx') || file.name.endsWith('.ts') || file.name.endsWith('.css'))) {
        const size = fs.statSync(filePath).size;
        totalSize += size;
        fileCount++;

        if (size > 10000) { // Files larger than 10KB
          analysis.chunks.push({
            name: file.name,
            size,
            type: 'source',
            path: path.relative(process.cwd(), filePath)
          });
        }
      }
    });
  }

  if (fs.existsSync(srcDir)) {
    analyzeDirectory(srcDir);
  }

  analysis.bundleSize = totalSize;
  console.log(`  📊 Source files analyzed: ${fileCount} files, ${formatBytes(totalSize)}`);

  return true;
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
 * Analyze Next.js optimizations
 */
function analyzeNextJsOptimizations() {
  console.log('⚡ Analyzing Next.js optimizations...');

  const nextConfig = path.join(process.cwd(), 'next.config.ts');

  if (fs.existsSync(nextConfig)) {
    const config = fs.readFileSync(nextConfig, 'utf8');

    // Check for optimization features
    const optimizations = [];

    if (config.includes('optimizePackageImports')) {
      optimizations.push({
        feature: 'Package Import Optimization',
        status: 'enabled',
        description: 'Optimizes imports from specified packages'
      });
    }

    if (config.includes('optimizeCss')) {
      optimizations.push({
        feature: 'CSS Optimization',
        status: 'enabled',
        description: 'Enables CSS optimization in production builds'
      });
    }

    if (config.includes('splitChunks')) {
      optimizations.push({
        feature: 'Code Splitting',
        status: 'enabled',
        description: 'Custom webpack code splitting configuration'
      });
    }

    if (config.includes('usedExports')) {
      optimizations.push({
        feature: 'Tree Shaking',
        status: 'enabled',
        description: 'Removes unused code from bundles'
      });
    }

    analysis.nextJsOptimizations = optimizations;
    console.log(`  ✅ Found ${optimizations.length} optimization features`);
  }
}

/**
 * Analyze image optimizations
 */
function analyzeImageOptimizations() {
  console.log('🖼️  Analyzing image optimizations...');

  const publicDir = path.join(process.cwd(), 'public');
  const imageOptimizations = [];

  if (fs.existsSync(publicDir)) {
    const files = fs.readdirSync(publicDir);
    let totalImageSize = 0;
    let imageCount = 0;

    files.forEach(file => {
      if (file.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i)) {
        const filePath = path.join(publicDir, file);
        const size = fs.statSync(filePath).size;
        totalImageSize += size;
        imageCount++;

        if (size > 100000) { // Images larger than 100KB
          imageOptimizations.push({
            file,
            size,
            recommendation: 'Consider optimizing this large image'
          });
        }
      }
    });

    analysis.imageOptimizations = {
      totalSize: totalImageSize,
      count: imageCount,
      largeImages: imageOptimizations
    };

    console.log(`  📊 Found ${imageCount} images, total size: ${formatBytes(totalImageSize)}`);
  }
}

/**
 * Generate performance recommendations
 */
function generateRecommendations() {
  console.log('💡 Generating recommendations...');

  const recommendations = [];

  // Bundle size recommendations
  if (analysis.bundleSize > CONFIG.thresholds.totalSize) {
    recommendations.push({
      type: 'bundle-size',
      severity: 'high',
      message: `Bundle size (${formatBytes(analysis.bundleSize)}) exceeds recommended threshold (${formatBytes(CONFIG.thresholds.totalSize)})`,
      suggestions: [
        'Implement code splitting for large components',
        'Use dynamic imports for non-critical features',
        'Remove unused dependencies',
        'Optimize images and assets'
      ]
    });
  }

  // Large chunk recommendations
  const largeChunks = analysis.chunks.filter(chunk => chunk.size > CONFIG.thresholds.chunkSize);
  if (largeChunks.length > 0) {
    recommendations.push({
      type: 'large-chunks',
      severity: 'medium',
      message: `${largeChunks.length} chunks exceed size threshold`,
      suggestions: [
        'Split large components into smaller modules',
        'Use React.lazy() for component-level code splitting',
        'Consider moving large libraries to separate chunks'
      ],
      details: largeChunks.map(chunk => `${chunk.name}: ${formatBytes(chunk.size)}`)
    });
  }

  // Image optimization recommendations
  if (analysis.imageOptimizations?.largeImages?.length > 0) {
    recommendations.push({
      type: 'image-optimization',
      severity: 'medium',
      message: `${analysis.imageOptimizations.largeImages.length} large images found`,
      suggestions: [
        'Use Next.js Image component for automatic optimization',
        'Convert images to WebP format',
        'Implement responsive images with different sizes',
        'Use image compression tools'
      ]
    });
  }

  // Build status recommendations
  if (analysis.buildStatus === 'failed') {
    recommendations.push({
      type: 'build-issues',
      severity: 'high',
      message: 'Build failed - performance analysis limited',
      suggestions: [
        'Fix TypeScript/syntax errors',
        'Resolve import/export issues',
        'Check for missing dependencies',
        'Review component structure'
      ]
    });
  }

  analysis.recommendations = recommendations;
  console.log(`  💡 Generated ${recommendations.length} recommendations`);
}

/**
 * Simulate Core Web Vitals analysis
 */
function simulateCoreWebVitals() {
  console.log('📈 Simulating Core Web Vitals analysis...');

  // Since we can't run actual performance tests without a running server,
  // we'll provide estimates based on bundle size and optimizations
  const bundleSizeKB = analysis.bundleSize / 1024;

  let lcpEstimate = 1500; // Base LCP estimate
  let clsEstimate = 0.05; // Base CLS estimate
  let fidEstimate = 50; // Base FID estimate

  // Adjust estimates based on bundle size
  if (bundleSizeKB > 500) {
    lcpEstimate += (bundleSizeKB - 500) * 2;
    fidEstimate += (bundleSizeKB - 500) * 0.5;
  }

  // Adjust estimates based on optimizations
  const optimizationCount = analysis.nextJsOptimizations.length;
  if (optimizationCount > 0) {
    lcpEstimate -= optimizationCount * 100;
    fidEstimate -= optimizationCount * 10;
  }

  analysis.coreWebVitals = {
    lcp: {
      value: Math.max(1000, lcpEstimate),
      rating: lcpEstimate < 2500 ? 'good' : lcpEstimate < 4000 ? 'needs-improvement' : 'poor',
      description: 'Largest Contentful Paint (estimated)'
    },
    cls: {
      value: clsEstimate,
      rating: clsEstimate < 0.1 ? 'good' : clsEstimate < 0.25 ? 'needs-improvement' : 'poor',
      description: 'Cumulative Layout Shift (estimated)'
    },
    fid: {
      value: Math.max(10, fidEstimate),
      rating: fidEstimate < 100 ? 'good' : fidEstimate < 300 ? 'needs-improvement' : 'poor',
      description: 'First Input Delay (estimated)'
    }
  };

  console.log('  📈 Core Web Vitals estimates generated');
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
function generateReport() {
  console.log('📄 Generating performance report...');

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Performance Analysis Report - Task 14.1</title>
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
        .status { padding: 5px 10px; border-radius: 4px; color: white; font-size: 12px; font-weight: bold; }
        .status.success { background: #10b981; }
        .status.failed { background: #ef4444; }
        .status.existing { background: #f59e0b; }
        .vitals { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
        .vital { padding: 15px; background: #f8fafc; border-radius: 6px; text-align: center; }
        .vital-value { font-size: 32px; font-weight: bold; margin: 10px 0; }
        .vital-value.good { color: #10b981; }
        .vital-value.needs-improvement { color: #f59e0b; }
        .vital-value.poor { color: #ef4444; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Performance Analysis Report - Task 14.1</h1>
            <p>Bundle Size and Loading Performance Analysis</p>
            <p>Generated on ${new Date(analysis.timestamp).toLocaleString()}</p>
        </div>
        <div class="content">
            <div class="section">
                <h2>Build Status</h2>
                <span class="status ${analysis.buildStatus}">${analysis.buildStatus.toUpperCase()}</span>
                ${analysis.buildError ? `<p style="color: #ef4444; margin-top: 10px;">Build Error: ${analysis.buildError.substring(0, 200)}...</p>` : ''}
            </div>

            <div class="section">
                <h2>Bundle Analysis</h2>
                <div class="metric">
                    <div class="metric-value">${analysis.bundleSize ? formatBytes(analysis.bundleSize) : 'N/A'}</div>
                    <div class="metric-label">Total Bundle Size</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${analysis.chunks.length}</div>
                    <div class="metric-label">Chunks/Files Analyzed</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${analysis.nextJsOptimizations.length}</div>
                    <div class="metric-label">Next.js Optimizations</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${analysis.imageOptimizations?.count || 0}</div>
                    <div class="metric-label">Images Found</div>
                </div>
            </div>

            ${analysis.chunks.length > 0 ? `
            <div class="section">
                <h2>Largest Chunks/Files</h2>
                ${analysis.chunks.sort((a, b) => b.size - a.size).slice(0, 10).map(chunk => `
                    <div class="chunk">
                        <span>${chunk.name} (${chunk.type})</span>
                        <span>${formatBytes(chunk.size)}</span>
                    </div>
                `).join('')}
            </div>
            ` : ''}

            ${analysis.nextJsOptimizations.length > 0 ? `
            <div class="section">
                <h2>Next.js Optimizations</h2>
                ${analysis.nextJsOptimizations.map(opt => `
                    <div class="chunk">
                        <div>
                            <strong>${opt.feature}</strong>
                            <div style="font-size: 12px; color: #64748b;">${opt.description}</div>
                        </div>
                        <span class="status success">${opt.status}</span>
                    </div>
                `).join('')}
            </div>
            ` : ''}

            ${analysis.coreWebVitals ? `
            <div class="section">
                <h2>Core Web Vitals (Estimated)</h2>
                <div class="vitals">
                    <div class="vital">
                        <div class="vital-value ${analysis.coreWebVitals.lcp.rating}">${analysis.coreWebVitals.lcp.value}ms</div>
                        <div>LCP</div>
                        <div style="font-size: 12px; color: #64748b;">Largest Contentful Paint</div>
                    </div>
                    <div class="vital">
                        <div class="vital-value ${analysis.coreWebVitals.cls.rating}">${analysis.coreWebVitals.cls.value}</div>
                        <div>CLS</div>
                        <div style="font-size: 12px; color: #64748b;">Cumulative Layout Shift</div>
                    </div>
                    <div class="vital">
                        <div class="vital-value ${analysis.coreWebVitals.fid.rating}">${analysis.coreWebVitals.fid.value}ms</div>
                        <div>FID</div>
                        <div style="font-size: 12px; color: #64748b;">First Input Delay</div>
                    </div>
                </div>
            </div>
            ` : ''}

            ${analysis.recommendations.length > 0 ? `
            <div class="section">
                <h2>Recommendations</h2>
                ${analysis.recommendations.map(rec => `
                    <div class="recommendation ${rec.severity}">
                        <strong>${rec.type.toUpperCase()}</strong>: ${rec.message}
                        <ul style="margin: 10px 0;">
                            ${rec.suggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
                        </ul>
                        ${rec.details ? `<div style="font-size: 12px; color: #64748b;">Details: ${rec.details.join(', ')}</div>` : ''}
                    </div>
                `).join('')}
            </div>
            ` : ''}

            <div class="section">
                <h2>Next Steps</h2>
                <ul>
                    <li>Fix any build issues to enable accurate bundle analysis</li>
                    <li>Implement recommended optimizations</li>
                    <li>Use Next.js Image component for all images</li>
                    <li>Set up performance monitoring in production</li>
                    <li>Run Lighthouse audits on deployed application</li>
                </ul>
            </div>
        </div>
    </div>
</body>
</html>
  `;

  const reportPath = path.join(CONFIG.outputDir, 'performance-analysis-report.html');
  fs.writeFileSync(reportPath, html);

  // Also save JSON data
  const jsonPath = path.join(CONFIG.outputDir, 'performance-analysis.json');
  fs.writeFileSync(jsonPath, JSON.stringify(analysis, null, 2));

  console.log(`📄 Report generated: ${reportPath}`);
  console.log(`📊 Data saved: ${jsonPath}`);
}

/**
 * Main execution
 */
function main() {
  try {
    // Run all analyses
    analyzeBundleSize();
    analyzeNextJsOptimizations();
    analyzeImageOptimizations();
    simulateCoreWebVitals();
    generateRecommendations();
    generateReport();

    // Print summary
    console.log('\n📊 Performance Analysis Summary:');
    console.log(`Build Status: ${analysis.buildStatus}`);
    console.log(`Bundle Size: ${analysis.bundleSize ? formatBytes(analysis.bundleSize) : 'N/A'}`);
    console.log(`Chunks Analyzed: ${analysis.chunks.length}`);
    console.log(`Optimizations Found: ${analysis.nextJsOptimizations.length}`);
    console.log(`Recommendations: ${analysis.recommendations.length}`);

    if (analysis.coreWebVitals) {
      console.log('\nCore Web Vitals (Estimated):');
      console.log(`LCP: ${analysis.coreWebVitals.lcp.value}ms (${analysis.coreWebVitals.lcp.rating})`);
      console.log(`CLS: ${analysis.coreWebVitals.cls.value} (${analysis.coreWebVitals.cls.rating})`);
      console.log(`FID: ${analysis.coreWebVitals.fid.value}ms (${analysis.coreWebVitals.fid.rating})`);
    }

    console.log('\n✅ Performance analysis completed successfully!');

  } catch (error) {
    console.error('❌ Performance analysis failed:', error.message);
    process.exit(1);
  }
}

// Run the analysis
if (require.main === module) {
  main();
}

module.exports = { main, analysis };
