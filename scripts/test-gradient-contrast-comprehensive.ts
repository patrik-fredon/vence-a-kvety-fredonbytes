/**
 * Comprehensive Gradient Contrast Testing
 *
 * Tests multiple text color options on funeral-gold gradient
 * to find WCAG 2.1 AA compliant combinations across all gradient positions
 */

import {
  getContrastRatio,
  meetsWCAG_AA,
  formatContrastRatio,
} from "../src/lib/accessibility/contrast-checker";

// Gradient color stops
const GRADIENT_COLORS = {
  start: "#ae8625",
  middle: "#f7ef8a",
  end: "#d2ac47",
} as const;

// Text colors to test
const TEXT_COLORS = {
  "teal-950": "#013029",
  "teal-900": "#134e4a",
  "teal-800": "#115e59",
  "stone-950": "#0c0a09",
  "stone-900": "#1c1917",
  "stone-800": "#292524",
  black: "#000000",
} as const;

interface TestResult {
  textColor: string;
  textHex: string;
  startRatio: number;
  middleRatio: number;
  endRatio: number;
  minRatio: number;
  allPass: boolean;
}

function testTextColor(colorName: string, colorHex: string): TestResult {
  const startRatio = getContrastRatio(GRADIENT_COLORS.start, colorHex);
  const middleRatio = getContrastRatio(GRADIENT_COLORS.middle, colorHex);
  const endRatio = getContrastRatio(GRADIENT_COLORS.end, colorHex);
  const minRatio = Math.min(startRatio, middleRatio, endRatio);
  const allPass =
    meetsWCAG_AA(startRatio) &&
    meetsWCAG_AA(middleRatio) &&
    meetsWCAG_AA(endRatio);

  return {
    textColor: colorName,
    textHex: colorHex,
    startRatio,
    middleRatio,
    endRatio,
    minRatio,
    allPass,
  };
}

function main(): void {
  console.log("\n");
  console.log("═".repeat(80));
  console.log("  COMPREHENSIVE GRADIENT CONTRAST TESTING");
  console.log(
    "  Finding WCAG AA compliant text colors for funeral-gold gradient"
  );
  console.log("═".repeat(80));
  console.log("\n");

  const results: TestResult[] = [];

  // Test all text colors
  for (const [name, hex] of Object.entries(TEXT_COLORS)) {
    results.push(testTextColor(name, hex));
  }

  // Sort by minimum ratio (best to worst)
  results.sort((a, b) => b.minRatio - a.minRatio);

  // Print results table
  console.log("┌" + "─".repeat(78) + "┐");
  console.log(
    "│ Text Color    │ Start   │ Middle  │ End     │ Min     │ Status      │"
  );
  console.log("├" + "─".repeat(78) + "┤");

  results.forEach((result) => {
    const name = result.textColor.padEnd(13);
    const start = formatContrastRatio(result.startRatio).padEnd(7);
    const middle = formatContrastRatio(result.middleRatio).padEnd(7);
    const end = formatContrastRatio(result.endRatio).padEnd(7);
    const min = formatContrastRatio(result.minRatio).padEnd(7);
    const status = (result.allPass ? "✅ PASS AA" : "❌ FAIL").padEnd(11);
    console.log(
      `│ ${name} │ ${start} │ ${middle} │ ${end} │ ${min} │ ${status} │`
    );
  });

  console.log("└" + "─".repeat(78) + "┘");
  console.log("\n");

  // Find compliant colors
  const compliantColors = results.filter((r) => r.allPass);

  if (compliantColors.length > 0) {
    console.log("✅ WCAG AA COMPLIANT TEXT COLORS:");
    console.log("─".repeat(80));
    compliantColors.forEach((result) => {
      console.log(
        `  • ${result.textColor} (${
          result.textHex
        }) - Min ratio: ${formatContrastRatio(result.minRatio)}`
      );
    });
    console.log("\n");
    console.log("RECOMMENDATION:");
    if (compliantColors[0]) {
      console.log(
        `  Use ${compliantColors[0].textColor} for text on funeral-gold gradient`
      );
      console.log(
        `  Minimum contrast ratio: ${formatContrastRatio(
          compliantColors[0].minRatio
        )}`
      );
    }
  } else {
    console.log("❌ NO FULLY COMPLIANT COLORS FOUND");
    console.log("\n");
    console.log("BEST ALTERNATIVE:");
    const best = results[0];
    if (best) {
      console.log(`  ${best.textColor} (${best.textHex})`);
      console.log(`  Minimum ratio: ${formatContrastRatio(best.minRatio)}`);
      console.log(
        "\n  Consider adjusting gradient colors or using solid backgrounds"
      );
    }
  }

  console.log("\n");
  console.log("═".repeat(80));
  console.log("\n");
}

main();
