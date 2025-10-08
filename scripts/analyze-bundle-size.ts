#!/usr/bin/env node
/**
 * Bundle Size Analysis Script
 * Requirements: 7.7, 5.5
 * 
 * This script analyzes Next.js build output and tracks bundle sizes
 * Run after build: npm run build && node scripts/analyze-bundle-size.ts
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";

interface BundleInfo {
  name: string;
  size: number;
  gzipSize?: number;
  type: "page" | "chunk" | "static";
}

interface BundleAnalysis {
  buildId: string;
  timestamp: string;
  totalSize: number;
  totalGzipSize: number;
  bundles: BundleInfo[];
  largestBundles: BundleInfo[];
  commitHash?: string;
  branch?: string;
}

const BUNDLE_SIZE_THRESHOLD = 200 * 1024; // 200KB warning threshold
const INCREASE_THRESHOLD = 0.1; // 10% increase warning

/**
 * Get git information
 */
function getGitInfo(): { commitHash?: string; branch?: string } {
  try {
    const commitHash = execSync("git rev-parse HEAD").toString().trim();
    const branch = execSync("git rev-parse --abbrev-ref HEAD").toString().trim();
    return { commitHash, branch };
  } catch (error) {
    console.warn("Could not get git information:", error);
    return {};
  }
}

/**
 * Parse Next.js build output
 */
function parseBuildOutput(): BundleInfo[] {
  const buildManifestPath = join(process.cwd(), ".next", "build-manifest.json");
  
  if (!existsSync(buildManifestPath)) {
    throw new Error("Build manifest not found. Please run 'npm run build' first.");
  }

  const manifest = JSON.parse(readFileSync(buildManifestPath, "utf-8"));
  const bundles: BundleInfo[] = [];

  // Parse pages
  for (const [page, files] of Object.entries(manifest.pages)) {
    if (Array.isArray(files)) {
      for (const file of files) {
        const filePath = join(process.cwd(), ".next", file);
        if (existsSync(filePath)) {
          const stats = require("fs").statSync(filePath);
          bundles.push({
            name: `${page} - ${file}`,
            size: stats.size,
            type: "page",
          });
        }
      }
    }
  }

  return bundles;
}

/**
 * Analyze bundle sizes
 */
function analyzeBundles(): BundleAnalysis {
  console.log("🔍 Analyzing bundle sizes...\n");

  const bundles = parseBuildOutput();
  const gitInfo = getGitInfo();

  const totalSize = bundles.reduce((sum, b) => sum + b.size, 0);
  const totalGzipSize = Math.round(totalSize * 0.3); // Estimate gzip as ~30% of original

  // Sort by size and get largest bundles
  const largestBundles = [...bundles].sort((a, b) => b.size - a.size).slice(0, 10);

  const analysis: BundleAnalysis = {
    buildId: Date.now().toString(),
    timestamp: new Date().toISOString(),
    totalSize,
    totalGzipSize,
    bundles,
    largestBundles,
    ...gitInfo,
  };

  return analysis;
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * Check for size warnings
 */
function checkWarnings(analysis: BundleAnalysis): string[] {
  const warnings: string[] = [];

  // Check total size
  if (analysis.totalSize > BUNDLE_SIZE_THRESHOLD * 5) {
    warnings.push(
      `⚠️  Total bundle size (${formatBytes(analysis.totalSize)}) exceeds recommended threshold`
    );
  }

  // Check individual bundles
  for (const bundle of analysis.largestBundles) {
    if (bundle.size > BUNDLE_SIZE_THRESHOLD) {
      warnings.push(
        `⚠️  Large bundle detected: ${bundle.name} (${formatBytes(bundle.size)})`
      );
    }
  }

  return warnings;
}

/**
 * Compare with previous build
 */
function compareWithPrevious(current: BundleAnalysis): void {
  const previousPath = join(process.cwd(), ".next", "bundle-analysis.json");
  
  if (!existsSync(previousPath)) {
    console.log("ℹ️  No previous build data found for comparison\n");
    return;
  }

  try {
    const previous: BundleAnalysis = JSON.parse(readFileSync(previousPath, "utf-8"));
    const sizeChange = current.totalSize - previous.totalSize;
    const percentChange = (sizeChange / previous.totalSize) * 100;

    console.log("📊 Comparison with previous build:");
    console.log(`   Previous: ${formatBytes(previous.totalSize)}`);
    console.log(`   Current:  ${formatBytes(current.totalSize)}`);
    console.log(`   Change:   ${sizeChange > 0 ? "+" : ""}${formatBytes(sizeChange)} (${percentChange.toFixed(2)}%)\n`);

    if (Math.abs(percentChange) > INCREASE_THRESHOLD * 100) {
      console.log(`⚠️  Bundle size changed by more than ${INCREASE_THRESHOLD * 100}%!\n`);
    }
  } catch (error) {
    console.warn("Could not compare with previous build:", error);
  }
}

/**
 * Save analysis results
 */
function saveAnalysis(analysis: BundleAnalysis): void {
  const outputPath = join(process.cwd(), ".next", "bundle-analysis.json");
  require("fs").writeFileSync(outputPath, JSON.stringify(analysis, null, 2));
  console.log(`✅ Analysis saved to ${outputPath}\n`);
}

/**
 * Send to monitoring endpoint (if in CI/CD)
 */
async function sendToMonitoring(analysis: BundleAnalysis): Promise<void> {
  if (process.env["CI"] !== "true") {
    console.log("ℹ️  Skipping monitoring upload (not in CI environment)\n");
    return;
  }

  try {
    const response = await fetch(`${process.env["NEXT_PUBLIC_SITE_URL"]}/api/monitoring/bundle-size`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        buildId: analysis.buildId,
        bundles: analysis.largestBundles.map((b) => ({
          name: b.name,
          size: b.size,
          gzipSize: b.gzipSize,
        })),
        totalSize: analysis.totalSize,
        totalGzipSize: analysis.totalGzipSize,
        commitHash: analysis.commitHash,
        branch: analysis.branch,
        timestamp: analysis.timestamp,
      }),
    });

    if (response.ok) {
      console.log("✅ Bundle size data sent to monitoring endpoint\n");
    } else {
      console.warn("⚠️  Failed to send bundle size data:", response.statusText);
    }
  } catch (error) {
    console.warn("⚠️  Could not send to monitoring endpoint:", error);
  }
}

/**
 * Main execution
 */
async function main() {
  try {
    const analysis = analyzeBundles();

    console.log("📦 Bundle Size Analysis");
    console.log("=".repeat(50));
    console.log(`Build ID:     ${analysis.buildId}`);
    console.log(`Timestamp:    ${analysis.timestamp}`);
    if (analysis.commitHash) {
      console.log(`Commit:       ${analysis.commitHash.substring(0, 7)}`);
    }
    if (analysis.branch) {
      console.log(`Branch:       ${analysis.branch}`);
    }
    console.log(`Total Size:   ${formatBytes(analysis.totalSize)}`);
    console.log(`Gzip Size:    ${formatBytes(analysis.totalGzipSize)} (estimated)`);
    console.log();

    console.log("🔝 Top 10 Largest Bundles:");
    console.log("-".repeat(50));
    for (const bundle of analysis.largestBundles) {
      console.log(`   ${formatBytes(bundle.size).padStart(10)} - ${bundle.name}`);
    }
    console.log();

    // Check warnings
    const warnings = checkWarnings(analysis);
    if (warnings.length > 0) {
      console.log("⚠️  Warnings:");
      for (const warning of warnings) {
        console.log(`   ${warning}`);
      }
      console.log();
    }

    // Compare with previous
    compareWithPrevious(analysis);

    // Save results
    saveAnalysis(analysis);

    // Send to monitoring (if in CI)
    await sendToMonitoring(analysis);

    // Exit with error if warnings exist and in CI
    if (process.env["CI"] === "true" && warnings.length > 0) {
      console.error("❌ Bundle size check failed due to warnings");
      process.exit(1);
    }

    console.log("✅ Bundle size analysis complete");
  } catch (error) {
    console.error("❌ Error analyzing bundle sizes:", error);
    process.exit(1);
  }
}

main();
