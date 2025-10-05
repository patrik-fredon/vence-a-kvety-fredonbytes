#!/usr/bin/env tsx
/**
 * Bundle Size Analysis Script
 *
 * Analyzes Next.js bundle sizes and compares with baseline
 * Requirements: 10.4
 *
 * Usage:
 *   npm run build
 *   npx tsx scripts/analyze-bundle-size.ts
 *   npx tsx scripts/analyze-bundle-size.ts --save-baseline
 */

import fs from "node:fs";
import path from "node:path";

interface BundleStats {
  timestamp: string;
  totalSize: number;
  pages: Record<string, PageStats>;
  chunks: Record<string, ChunkStats>;
  summary: {
    totalPages: number;
    totalChunks: number;
    largestPage: string;
    largestPageSize: number;
    largestChunk: string;
    largestChunkSize: number;
  };
}

interface PageStats {
  path: string;
  size: number;
  firstLoad: number;
  chunks: string[];
}

interface ChunkStats {
  name: string;
  size: number;
  type: "shared" | "page" | "framework";
}

const BASELINE_FILE = path.join(
  process.cwd(),
  ".kiro",
  "specs",
  "vence-kvety-refactor",
  "bundle-baseline.json"
);

// Size thresholds (in KB)
const THRESHOLDS = {
  PAGE_SIZE_WARNING: 200, // 200 KB
  PAGE_SIZE_ERROR: 300, // 300 KB
  CHUNK_SIZE_WARNING: 150, // 150 KB
  CHUNK_SIZE_ERROR: 250, // 250 KB
  TOTAL_INCREASE_WARNING: 10, // 10% increase
  TOTAL_INCREASE_ERROR: 25, // 25% increase
};

/**
 * Format bytes to human-readable size
 */
function formatSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * Parse Next.js build output
 */
function parseBuildOutput(): BundleStats | null {
  const nextDir = path.join(process.cwd(), ".next");

  if (!fs.existsSync(nextDir)) {
    console.error(
      '❌ .next directory not found. Please run "npm run build" first.'
    );
    return null;
  }

  const stats: BundleStats = {
    timestamp: new Date().toISOString(),
    totalSize: 0,
    pages: {},
    chunks: {},
    summary: {
      totalPages: 0,
      totalChunks: 0,
      largestPage: "",
      largestPageSize: 0,
      largestChunk: "",
      largestChunkSize: 0,
    },
  };

  // Analyze pages
  const pagesDir = path.join(nextDir, "server", "pages");
  if (fs.existsSync(pagesDir)) {
    analyzeDirectory(pagesDir, "", stats, "page");
  }

  // Analyze app directory
  const appDir = path.join(nextDir, "server", "app");
  if (fs.existsSync(appDir)) {
    analyzeDirectory(appDir, "", stats, "page");
  }

  // Analyze chunks
  const chunksDir = path.join(nextDir, "static", "chunks");
  if (fs.existsSync(chunksDir)) {
    analyzeDirectory(chunksDir, "", stats, "chunk");
  }

  // Calculate summary
  stats.summary.totalPages = Object.keys(stats.pages).length;
  stats.summary.totalChunks = Object.keys(stats.chunks).length;

  // Find largest page
  for (const [path, pageStats] of Object.entries(stats.pages)) {
    if (pageStats.size > stats.summary.largestPageSize) {
      stats.summary.largestPage = path;
      stats.summary.largestPageSize = pageStats.size;
    }
  }

  // Find largest chunk
  for (const [name, chunkStats] of Object.entries(stats.chunks)) {
    if (chunkStats.size > stats.summary.largestChunkSize) {
      stats.summary.largestChunk = name;
      stats.summary.largestChunkSize = chunkStats.size;
    }
  }

  return stats;
}

/**
 * Recursively analyze directory
 */
function analyzeDirectory(
  dir: string,
  relativePath: string,
  stats: BundleStats,
  type: "page" | "chunk"
): void {
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const itemRelativePath = path.join(relativePath, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      analyzeDirectory(fullPath, itemRelativePath, stats, type);
    } else if (item.endsWith(".js") || item.endsWith(".css")) {
      const size = stat.size;
      stats.totalSize += size;

      if (type === "page") {
        stats.pages[itemRelativePath] = {
          path: itemRelativePath,
          size,
          firstLoad: size,
          chunks: [],
        };
      } else {
        stats.chunks[itemRelativePath] = {
          name: itemRelativePath,
          size,
          type: determineChunkType(item),
        };
      }
    }
  }
}

/**
 * Determine chunk type from filename
 */
function determineChunkType(filename: string): "shared" | "page" | "framework" {
  if (filename.includes("framework") || filename.includes("webpack")) {
    return "framework";
  }
  if (filename.includes("shared") || filename.includes("common")) {
    return "shared";
  }
  return "page";
}

/**
 * Load baseline stats
 */
function loadBaseline(): BundleStats | null {
  if (!fs.existsSync(BASELINE_FILE)) {
    return null;
  }

  try {
    const data = fs.readFileSync(BASELINE_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("❌ Failed to load baseline:", error);
    return null;
  }
}

/**
 * Save baseline stats
 */
function saveBaseline(stats: BundleStats): void {
  const dir = path.dirname(BASELINE_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(BASELINE_FILE, JSON.stringify(stats, null, 2));
  console.log(`\n💾 Baseline saved to: ${BASELINE_FILE}`);
}

/**
 * Compare current stats with baseline
 */
function compareWithBaseline(
  current: BundleStats,
  baseline: BundleStats
): void {
  console.log("\n" + "=".repeat(80));
  console.log("📊 BUNDLE SIZE COMPARISON");
  console.log("=".repeat(80));

  const totalDiff = current.totalSize - baseline.totalSize;
  const totalDiffPercent = (totalDiff / baseline.totalSize) * 100;

  console.log("\n📦 Total Bundle Size:");
  console.log(`  Current:  ${formatSize(current.totalSize)}`);
  console.log(`  Baseline: ${formatSize(baseline.totalSize)}`);
  console.log(
    `  Diff:     ${totalDiff >= 0 ? "+" : ""}${formatSize(
      totalDiff
    )} (${totalDiffPercent.toFixed(2)}%)`
  );

  // Status indicator
  if (Math.abs(totalDiffPercent) < THRESHOLDS.TOTAL_INCREASE_WARNING) {
    console.log(
      `  Status:   ✅ Good (within ${THRESHOLDS.TOTAL_INCREASE_WARNING}% threshold)`
    );
  } else if (Math.abs(totalDiffPercent) < THRESHOLDS.TOTAL_INCREASE_ERROR) {
    console.log(
      `  Status:   ⚠️  Warning (${THRESHOLDS.TOTAL_INCREASE_WARNING}%-${THRESHOLDS.TOTAL_INCREASE_ERROR}% increase)`
    );
  } else {
    console.log(
      `  Status:   ❌ Error (>${THRESHOLDS.TOTAL_INCREASE_ERROR}% increase)`
    );
  }

  // Page comparison
  console.log("\n📄 Page Size Changes:");
  const pageChanges: Array<{
    path: string;
    diff: number;
    diffPercent: number;
  }> = [];

  for (const [pagePath, currentPage] of Object.entries(current.pages)) {
    const baselinePage = baseline.pages[pagePath];
    if (baselinePage) {
      const diff = currentPage.size - baselinePage.size;
      const diffPercent = (diff / baselinePage.size) * 100;
      pageChanges.push({ path: pagePath, diff, diffPercent });
    }
  }

  // Sort by absolute difference
  pageChanges.sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));

  // Show top 10 changes
  for (const change of pageChanges.slice(0, 10)) {
    const status =
      Math.abs(change.diffPercent) < 5
        ? "✅"
        : Math.abs(change.diffPercent) < 15
        ? "⚠️"
        : "❌";
    console.log(`  ${status} ${change.path}`);
    console.log(
      `     ${change.diff >= 0 ? "+" : ""}${formatSize(
        change.diff
      )} (${change.diffPercent.toFixed(2)}%)`
    );
  }

  // Chunk comparison
  console.log("\n🧩 Chunk Size Changes:");
  const chunkChanges: Array<{
    name: string;
    diff: number;
    diffPercent: number;
  }> = [];

  for (const [chunkName, currentChunk] of Object.entries(current.chunks)) {
    const baselineChunk = baseline.chunks[chunkName];
    if (baselineChunk) {
      const diff = currentChunk.size - baselineChunk.size;
      const diffPercent = (diff / baselineChunk.size) * 100;
      chunkChanges.push({ name: chunkName, diff, diffPercent });
    }
  }

  // Sort by absolute difference
  chunkChanges.sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));

  // Show top 10 changes
  for (const change of chunkChanges.slice(0, 10)) {
    const status =
      Math.abs(change.diffPercent) < 5
        ? "✅"
        : Math.abs(change.diffPercent) < 15
        ? "⚠️"
        : "❌";
    console.log(`  ${status} ${change.name}`);
    console.log(
      `     ${change.diff >= 0 ? "+" : ""}${formatSize(
        change.diff
      )} (${change.diffPercent.toFixed(2)}%)`
    );
  }

  console.log("\n" + "=".repeat(80));
}

/**
 * Print current stats
 */
function printStats(stats: BundleStats): void {
  console.log("\n" + "=".repeat(80));
  console.log("📊 BUNDLE SIZE ANALYSIS");
  console.log("=".repeat(80));

  console.log(
    `\n⏰ Analyzed at: ${new Date(stats.timestamp).toLocaleString()}`
  );
  console.log(`\n📦 Total Bundle Size: ${formatSize(stats.totalSize)}`);

  console.log("\n📄 Pages:");
  console.log(`  Total: ${stats.summary.totalPages}`);
  console.log(
    `  Largest: ${stats.summary.largestPage} (${formatSize(
      stats.summary.largestPageSize
    )})`
  );

  // Show top 10 largest pages
  const sortedPages = Object.values(stats.pages).sort(
    (a, b) => b.size - a.size
  );
  console.log("\n  Top 10 Largest Pages:");
  for (const page of sortedPages.slice(0, 10)) {
    const sizeKB = page.size / 1024;
    const status =
      sizeKB < THRESHOLDS.PAGE_SIZE_WARNING
        ? "✅"
        : sizeKB < THRESHOLDS.PAGE_SIZE_ERROR
        ? "⚠️"
        : "❌";
    console.log(`    ${status} ${page.path}: ${formatSize(page.size)}`);
  }

  console.log("\n🧩 Chunks:");
  console.log(`  Total: ${stats.summary.totalChunks}`);
  console.log(
    `  Largest: ${stats.summary.largestChunk} (${formatSize(
      stats.summary.largestChunkSize
    )})`
  );

  // Show top 10 largest chunks
  const sortedChunks = Object.values(stats.chunks).sort(
    (a, b) => b.size - a.size
  );
  console.log("\n  Top 10 Largest Chunks:");
  for (const chunk of sortedChunks.slice(0, 10)) {
    const sizeKB = chunk.size / 1024;
    const status =
      sizeKB < THRESHOLDS.CHUNK_SIZE_WARNING
        ? "✅"
        : sizeKB < THRESHOLDS.CHUNK_SIZE_ERROR
        ? "⚠️"
        : "❌";
    console.log(
      `    ${status} ${chunk.name}: ${formatSize(chunk.size)} (${chunk.type})`
    );
  }

  console.log("\n" + "=".repeat(80));
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const shouldSaveBaseline = args.includes("--save-baseline");

  console.log("🚀 Starting Bundle Size Analysis");

  // Parse current build
  const currentStats = parseBuildOutput();
  if (!currentStats) {
    process.exit(1);
  }

  // Print current stats
  printStats(currentStats);

  // Load and compare with baseline
  const baseline = loadBaseline();
  if (baseline) {
    compareWithBaseline(currentStats, baseline);
  } else {
    console.log(
      "\n⚠️  No baseline found. Run with --save-baseline to create one."
    );
  }

  // Save baseline if requested
  if (shouldSaveBaseline) {
    saveBaseline(currentStats);
  }

  // Save current stats
  const currentStatsFile = path.join(
    process.cwd(),
    ".kiro",
    "specs",
    "vence-kvety-refactor",
    "bundle-current.json"
  );
  const dir = path.dirname(currentStatsFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(currentStatsFile, JSON.stringify(currentStats, null, 2));
  console.log(`\n💾 Current stats saved to: ${currentStatsFile}`);
}

// Run the script
main().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
