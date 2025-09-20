#!/usr/bin/env node

/**
 * Export Optimization Script
 *
 * This script analyzes and optimizes barrel exports for better tree-shaking
 * and bundle size reduction. It ensures all exports are properly structured
 * for optimal performance.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  srcDir: path.join(process.cwd(), 'src'),
  componentsDir: path.join(process.cwd(), 'src', 'components'),
  libDir: path.join(process.cwd(), 'src', 'lib'),
  typesDir: path.join(process.cwd(), 'src', 'types'),
  outputFile: path.join(process.cwd(), 'export-analysis.json'),
};

// Analysis results
const analysis = {
  totalExports: 0,
  optimizedExports: 0,
  issues: [],
  recommendations: [],
  barrelFiles: [],
  treeShakingScore: 0,
};

/**
 * Recursively find all TypeScript files
 */
function findTSFiles(dir, files = []) {
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      findTSFiles(fullPath, files);
    } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Analyze a TypeScript file for exports
 */
function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(CONFIG.srcDir, filePath);

  const exports = {
    path: relativePath,
    namedExports: [],
    defaultExport: null,
    reExports: [],
    typeExports: [],
    issues: [],
  };

  // Find named exports
  const namedExportRegex = /export\s+(?:const|let|var|function|class|interface|type|enum)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
  let match;
  while ((match = namedExportRegex.exec(content)) !== null) {
    exports.namedExports.push(match[1]);
  }

  // Find export statements
  const exportStatementRegex = /export\s+\{\s*([^}]+)\s*\}/g;
  while ((match = exportStatementRegex.exec(content)) !== null) {
    const exportList = match[1].split(',').map(e => e.trim().split(' as ')[0]);
    exports.namedExports.push(...exportList);
  }

  // Find default export
  const defaultExportRegex = /export\s+default\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/;
  const defaultMatch = defaultExportRegex.exec(content);
  if (defaultMatch) {
    exports.defaultExport = defaultMatch[1];
  }

  // Find re-exports
  const reExportRegex = /export\s+\*\s+from\s+['"]([^'"]+)['"]/g;
  while ((match = reExportRegex.exec(content)) !== null) {
    exports.reExports.push(match[1]);
  }

  // Find type exports
  const typeExportRegex = /export\s+type\s+\*?\s*\{?\s*([^}]+)?\s*\}?\s*from\s+['"]([^'"]+)['"]/g;
  while ((match = typeExportRegex.exec(content)) !== null) {
    exports.typeExports.push({
      types: match[1] ? match[1].split(',').map(t => t.trim()) : ['*'],
      from: match[2],
    });
  }

  // Check for potential issues
  if (exports.reExports.length > 10) {
    exports.issues.push('Too many re-exports may hurt tree-shaking');
  }

  if (content.includes('export *') && !relativePath.includes('index.ts')) {
    exports.issues.push('Wildcard exports in non-index files can prevent tree-shaking');
  }

  if (exports.namedExports.length > 20) {
    exports.issues.push('Large number of exports may indicate module should be split');
  }

  analysis.totalExports += exports.namedExports.length;
  analysis.issues.push(...exports.issues.map(issue => ({ file: relativePath, issue })));

  return exports;
}

/**
 * Analyze barrel files (index.ts files)
 */
function analyzeBarrelFiles(files) {
  const barrelFiles = files.filter(file => file.endsWith('index.ts'));

  for (const barrelFile of barrelFiles) {
    const fileAnalysis = analyzeFile(barrelFile);
    fileAnalysis.isBarrel = true;

    // Check if barrel file is optimized
    const content = fs.readFileSync(barrelFile, 'utf8');

    // Good practices for barrel files
    const hasSelectiveExports = content.includes('export {') && !content.includes('export *');
    const hasTypeExports = content.includes('export type');
    const hasComments = content.includes('/**') || content.includes('//');

    let score = 0;
    if (hasSelectiveExports) score += 30;
    if (hasTypeExports) score += 20;
    if (hasComments) score += 10;
    if (fileAnalysis.reExports.length < 5) score += 20;
    if (fileAnalysis.namedExports.length < 15) score += 20;

    fileAnalysis.optimizationScore = score;
    fileAnalysis.optimized = score >= 70;

    if (fileAnalysis.optimized) {
      analysis.optimizedExports++;
    }

    analysis.barrelFiles.push(fileAnalysis);
  }
}

/**
 * Generate recommendations
 */
function generateRecommendations() {
  // Analyze component structure
  const componentFiles = findTSFiles(CONFIG.componentsDir);
  const componentAnalysis = componentFiles.map(analyzeFile);

  // Check for missing barrel files
  const directories = new Set();
  componentFiles.forEach(file => {
    const dir = path.dirname(file);
    directories.add(dir);
  });

  directories.forEach(dir => {
    const indexFile = path.join(dir, 'index.ts');
    if (!fs.existsSync(indexFile)) {
      analysis.recommendations.push({
        type: 'missing-barrel',
        message: `Consider adding index.ts barrel file to ${path.relative(CONFIG.srcDir, dir)}`,
        priority: 'medium',
      });
    }
  });

  // Check for large components that could be split
  componentAnalysis.forEach(comp => {
    if (comp.namedExports.length > 15) {
      analysis.recommendations.push({
        type: 'large-module',
        message: `${comp.path} has ${comp.namedExports.length} exports, consider splitting`,
        priority: 'low',
      });
    }
  });

  // Check for missing type exports
  componentAnalysis.forEach(comp => {
    if (comp.namedExports.length > 0 && comp.typeExports.length === 0) {
      analysis.recommendations.push({
        type: 'missing-types',
        message: `${comp.path} may be missing type exports`,
        priority: 'medium',
      });
    }
  });
}

/**
 * Calculate tree-shaking score
 */
function calculateTreeShakingScore() {
  const files = findTSFiles(CONFIG.srcDir);
  let totalScore = 0;
  let fileCount = 0;

  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    let fileScore = 100;

    // Penalties for poor tree-shaking practices
    if (content.includes('export *') && !file.endsWith('index.ts')) {
      fileScore -= 20;
    }

    if (content.includes('import *')) {
      fileScore -= 15;
    }

    if (content.includes('require(')) {
      fileScore -= 25;
    }

    if (content.includes('module.exports')) {
      fileScore -= 30;
    }

    // Bonuses for good practices
    if (content.includes('export type')) {
      fileScore += 5;
    }

    if (content.includes('export {')) {
      fileScore += 10;
    }

    totalScore += Math.max(0, fileScore);
    fileCount++;
  });

  analysis.treeShakingScore = Math.round(totalScore / fileCount);
}

/**
 * Generate optimization suggestions
 */
function generateOptimizationSuggestions() {
  const suggestions = [];

  if (analysis.treeShakingScore < 80) {
    suggestions.push({
      category: 'tree-shaking',
      message: 'Tree-shaking score is below optimal. Consider reducing wildcard exports and imports.',
      impact: 'high',
    });
  }

  if (analysis.issues.length > 10) {
    suggestions.push({
      category: 'code-quality',
      message: 'Multiple export issues detected. Review barrel files and export patterns.',
      impact: 'medium',
    });
  }

  const barrelOptimizationRate = (analysis.optimizedExports / analysis.barrelFiles.length) * 100;
  if (barrelOptimizationRate < 70) {
    suggestions.push({
      category: 'barrel-optimization',
      message: 'Barrel files need optimization for better tree-shaking.',
      impact: 'high',
    });
  }

  analysis.suggestions = suggestions;
}

/**
 * Main analysis function
 */
function runAnalysis() {
  console.log('🔍 Analyzing export structure...');

  const allFiles = findTSFiles(CONFIG.srcDir);
  console.log(`Found ${allFiles.length} TypeScript files`);

  // Analyze all files
  const fileAnalyses = allFiles.map(analyzeFile);

  // Analyze barrel files specifically
  analyzeBarrelFiles(allFiles);

  // Generate recommendations
  generateRecommendations();

  // Calculate tree-shaking score
  calculateTreeShakingScore();

  // Generate optimization suggestions
  generateOptimizationSuggestions();

  // Save analysis results
  fs.writeFileSync(CONFIG.outputFile, JSON.stringify(analysis, null, 2));

  console.log('\n📊 Analysis Results:');
  console.log(`Total exports: ${analysis.totalExports}`);
  console.log(`Optimized barrel files: ${analysis.optimizedExports}/${analysis.barrelFiles.length}`);
  console.log(`Tree-shaking score: ${analysis.treeShakingScore}/100`);
  console.log(`Issues found: ${analysis.issues.length}`);
  console.log(`Recommendations: ${analysis.recommendations.length}`);

  if (analysis.issues.length > 0) {
    console.log('\n⚠️  Issues:');
    analysis.issues.slice(0, 5).forEach(issue => {
      console.log(`  - ${issue.file}: ${issue.issue}`);
    });
    if (analysis.issues.length > 5) {
      console.log(`  ... and ${analysis.issues.length - 5} more`);
    }
  }

  if (analysis.suggestions.length > 0) {
    console.log('\n💡 Suggestions:');
    analysis.suggestions.forEach(suggestion => {
      console.log(`  - [${suggestion.impact.toUpperCase()}] ${suggestion.message}`);
    });
  }

  console.log(`\n📄 Full analysis saved to: ${CONFIG.outputFile}`);

  // Return exit code based on score
  if (analysis.treeShakingScore < 70) {
    console.log('\n❌ Tree-shaking score is below acceptable threshold');
    process.exit(1);
  } else {
    console.log('\n✅ Export structure looks good!');
    process.exit(0);
  }
}

// Run the analysis
if (require.main === module) {
  runAnalysis();
}

module.exports = {
  runAnalysis,
  analyzeFile,
  CONFIG,
};
