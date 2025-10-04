#!/usr/bin/env node
/**
 * Accessibility Testing CLI Script
 * Runs accessibility tests on the application
 *
 * Usage:
 *   npm run test:accessibility
 *   npm run test:accessibility -- --url=http://localhost:3000
 *   npm run test:accessibility -- --save-report
 */

import { JSDOM } from "jsdom";
import {
  runAccessibilityTests,
  generateAccessibilityReport,
  saveTestResults,
} from "../src/lib/accessibility/test-runner";

interface TestOptions {
  url?: string;
  saveReport?: boolean;
  outputFile?: string;
}

async function parseArgs(): Promise<TestOptions> {
  const args = process.argv.slice(2);
  const options: TestOptions = {
    url: "http://localhost:3000",
    saveReport: false,
    outputFile: "accessibility-report.json",
  };

  for (const arg of args) {
    if (arg.startsWith("--url=")) {
      options.url = arg.split("=")[1];
    } else if (arg === "--save-report") {
      options.saveReport = true;
    } else if (arg.startsWith("--output=")) {
      options.outputFile = arg.split("=")[1];
    }
  }

  return options;
}

async function fetchPage(url: string): Promise<JSDOM> {
  try {
    const response = await fetch(url);
    const html = await response.text();
    return new JSDOM(html, {
      url,
      runScripts: "outside-only",
      resources: "usable",
    });
  } catch (error) {
    console.error(`Failed to fetch page: ${error}`);
    throw error;
  }
}

async function main() {
  console.log("🔍 Starting Accessibility Tests...\n");

  const options = await parseArgs();
  console.log(`Testing URL: ${options.url}\n`);

  try {
    // Fetch the page
    const dom = await fetchPage(options.url!);
    const { document } = dom.window;

    // Set up global document for tests
    (global as any).document = document;
    (global as any).window = dom.window;

    // Run tests
    const results = await runAccessibilityTests(document.body as HTMLElement);

    // Generate and display report
    const report = generateAccessibilityReport(results);
    console.log(report);

    // Save report if requested
    if (options.saveReport) {
      saveTestResults(results, options.outputFile!);
      console.log(`\n📄 Report saved to ${options.outputFile}`);
    }

    // Exit with appropriate code
    if (!results.overallPassed) {
      console.error("\n❌ Accessibility tests failed");
      process.exit(1);
    } else {
      console.log("\n✅ All accessibility tests passed");
      process.exit(0);
    }
  } catch (error) {
    console.error("\n❌ Error running accessibility tests:", error);
    process.exit(1);
  }
}

main();
