#!/usr/bin/env tsx
/**
 * Core Web Vitals Measurement Script
 *
 * Measures LCP, FID, and CLS for key pages using Lighthouse
 * Requirements: 10.3, 10.4
 *
 * Usage:
 *   npm run measure:vitals
 *   npm run measure:vitals -- --url=http://localhost:3000/cs
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

interface WebVitalsResult {
  url: string;
  timestamp: string;
  metrics: {
    lcp: number | null;
    fid: number | null;
    cls: number | null;
    fcp: number | null;
    ttfb: number | null;
    tbt: number | null;
  };
  performance: {
    score: number;
    category: string;
  };
  passed: {
    lcp: boolean;
    fid: boolean;
    cls: boolean;
  };
}

// Core Web Vitals thresholds
const THRESHOLDS = {
  LCP: 2500, // 2.5s
  FID: 100, // 100ms
  CLS: 0.1, // 0.1
};

// Key pages to test
const TEST_PAGES = [
  { path: "/cs", name: "Home (Czech)" },
  { path: "/en", name: "Home (English)" },
  { path: "/cs/products", name: "Products (Czech)" },
  { path: "/cs/about", name: "About (Czech)" },
];

/**
 * Run Lighthouse audit for a URL
 */
function runLighthouse(url: string): any {
  console.log(`\n📊 Running Lighthouse audit for: ${url}`);

  try {
    const result = execSync(
      `npx lighthouse ${url} --output=json --output-path=stdout --only-categories=performance --chrome-flags="--headless --no-sandbox" --quiet`,
      { encoding: "utf-8", maxBuffer: 10 * 1024 * 1024 }
    );

    return JSON.parse(result);
  } catch (error) {
    console.error(`❌ Failed to run Lighthouse for ${url}:`, error);
    return null;
  }
}

/**
 * Extract Core Web Vitals from Lighthouse result
 */
function extractWebVitals(lighthouseResult: any, url: string): WebVitalsResult {
  const audits = lighthouseResult?.audits || {};
  const performanceScore =
    lighthouseResult?.categories?.performance?.score || 0;

  // Extract metrics (values are in milliseconds or unitless)
  const lcp = audits["largest-contentful-paint"]?.numericValue || null;
  const fid = audits["max-potential-fid"]?.numericValue || null; // FID approximation
  const cls = audits["cumulative-layout-shift"]?.numericValue || null;
  const fcp = audits["first-contentful-paint"]?.numericValue || null;
  const ttfb = audits["server-response-time"]?.numericValue || null;
  const tbt = audits["total-blocking-time"]?.numericValue || null;

  return {
    url,
    timestamp: new Date().toISOString(),
    metrics: {
      lcp,
      fid,
      cls,
      fcp,
      ttfb,
      tbt,
    },
    performance: {
      score: Math.round(performanceScore * 100),
      category: getPerformanceCategory(performanceScore),
    },
    passed: {
      lcp: lcp !== null ? lcp < THRESHOLDS.LCP : false,
      fid: fid !== null ? fid < THRESHOLDS.FID : false,
      cls: cls !== null ? cls < THRESHOLDS.CLS : false,
    },
  };
}

/**
 * Get performance category based on score
 */
function getPerformanceCategory(score: number): string {
  if (score >= 0.9) return "Good";
  if (score >= 0.5) return "Needs Improvement";
  return "Poor";
}

/**
 * Format metric value for display
 */
function formatMetric(value: number | null, unit: string): string {
  if (value === null) return "N/A";

  if (unit === "ms") {
    return `${Math.round(value)}ms`;
  }

  return value.toFixed(3);
}

/**
 * Get status emoji based on pass/fail
 */
function getStatusEmoji(passed: boolean): string {
  return passed ? "✅" : "❌";
}

/**
 * Print results table
 */
function printResults(results: WebVitalsResult[]): void {
  console.log("\n" + "=".repeat(80));
  console.log("📈 CORE WEB VITALS MEASUREMENT RESULTS");
  console.log("=".repeat(80));

  for (const result of results) {
    console.log(`\n🔗 ${result.url}`);
    console.log(
      `⏰ Measured at: ${new Date(result.timestamp).toLocaleString()}`
    );
    console.log(
      `🎯 Performance Score: ${result.performance.score}/100 (${result.performance.category})`
    );
    console.log("\n📊 Core Web Vitals:");
    console.log(
      `  ${getStatusEmoji(result.passed.lcp)} LCP: ${formatMetric(
        result.metrics.lcp,
        "ms"
      )} (target: <${THRESHOLDS.LCP}ms)`
    );
    console.log(
      `  ${getStatusEmoji(result.passed.fid)} FID: ${formatMetric(
        result.metrics.fid,
        "ms"
      )} (target: <${THRESHOLDS.FID}ms)`
    );
    console.log(
      `  ${getStatusEmoji(result.passed.cls)} CLS: ${formatMetric(
        result.metrics.cls,
        ""
      )} (target: <${THRESHOLDS.CLS})`
    );

    console.log("\n📈 Additional Metrics:");
    console.log(`  FCP: ${formatMetric(result.metrics.fcp, "ms")}`);
    console.log(`  TTFB: ${formatMetric(result.metrics.ttfb, "ms")}`);
    console.log(`  TBT: ${formatMetric(result.metrics.tbt, "ms")}`);
    console.log("-".repeat(80));
  }

  // Summary
  const allPassed = results.every(
    (r) => r.passed.lcp && r.passed.fid && r.passed.cls
  );
  const avgScore = Math.round(
    results.reduce((sum, r) => sum + r.performance.score, 0) / results.length
  );

  console.log("\n📋 SUMMARY:");
  console.log(`  Average Performance Score: ${avgScore}/100`);
  console.log(
    `  All Core Web Vitals Passed: ${allPassed ? "✅ YES" : "❌ NO"}`
  );
  console.log("=".repeat(80) + "\n");
}

/**
 * Save results to file
 */
function saveResults(results: WebVitalsResult[]): void {
  const outputDir = path.join(
    process.cwd(),
    ".kiro",
    "specs",
    "vence-kvety-refactor"
  );
  const outputFile = path.join(outputDir, "core-web-vitals-results.json");

  // Ensure directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Save results
  fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
  console.log(`💾 Results saved to: ${outputFile}`);
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const customUrl = args.find((arg) => arg.startsWith("--url="))?.split("=")[1];
  const baseUrl = customUrl || "http://localhost:3000";

  console.log("🚀 Starting Core Web Vitals Measurement");
  console.log(`📍 Base URL: ${baseUrl}`);
  console.log(`📄 Testing ${TEST_PAGES.length} pages`);

  // Check if server is running
  try {
    execSync(`curl -s -o /dev/null -w "%{http_code}" ${baseUrl}`, {
      encoding: "utf-8",
    });
  } catch (error) {
    console.error(`\n❌ Error: Server is not running at ${baseUrl}`);
    console.error("Please start the development server with: npm run dev");
    process.exit(1);
  }

  const results: WebVitalsResult[] = [];

  // Run Lighthouse for each page
  for (const page of TEST_PAGES) {
    const url = `${baseUrl}${page.path}`;
    const lighthouseResult = runLighthouse(url);

    if (lighthouseResult) {
      const webVitals = extractWebVitals(lighthouseResult, url);
      results.push(webVitals);
    }
  }

  // Print and save results
  if (results.length > 0) {
    printResults(results);
    saveResults(results);
  } else {
    console.error("\n❌ No results collected. Please check the errors above.");
    process.exit(1);
  }
}

// Run the script
main().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
