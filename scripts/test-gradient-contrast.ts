/**
 * Gradient Contrast Ratio Testing Script
 *
 * Tests text contrast on funeral-gold gradient background for WCAG 2.1 AA compliance
 * Task 11.2: Test text contrast on golden gradient background
 *
 * The funeral-gold gradient: linear-gradient(to right, #ae8625, #f7ef8a, #d2ac47)
 * Tests teal-900 text at multiple gradient positions (start, middle, end)
 */

import {
  getContrastRatio,
  meetsWCAG_AA,
  meetsWCAG_AAA,
  getComplianceLevel,
  formatContrastRatio,
} from "../src/lib/accessibility/contrast-checker";

// Gradient color stops from globals.css @theme directive
const GRADIENT_COLORS = {
  "funeral-gold-start": "#ae8625", // Dark amber/gold (left)
  "funeral-gold-middle": "#f7ef8a", // Light yellow (center)
  "funeral-gold-end": "#d2ac47", // Medium gold (right)
} as const;

// Text colors to test
const TEXT_COLORS = {
  "teal-900": "#134e4a",
  "teal-800": "#115e59",
  "teal-700": "#0f766e",
  white: "#ffffff",
  black: "#000000",
} as const;

interface ContrastTestResult {
  background: string;
  foreground: string;
  contrastRatio: number;
  formattedRatio: string;
  meetsAA: boolean;
  meetsAAA: boolean;
  complianceLevel: "AAA" | "AA" | "Fail";
  status: "✅ Pass" | "❌ Fail";
}

function testContrast(
  backgroundName: string,
  backgroundHex: string,
  foregroundName: string,
  foregroundHex: string
): ContrastTestResult {
  const ratio = getContrastRatio(backgroundHex, foregroundHex);
  const meetsAA = meetsWCAG_AA(ratio);
  const meetsAAA = meetsWCAG_AAA(ratio);
  const complianceLevel = getComplianceLevel(ratio);

  return {
    background: `${backgroundName} (${backgroundHex})`,
    foreground: `${foregroundName} (${foregroundHex})`,
    contrastRatio: ratio,
    formattedRatio: formatContrastRatio(ratio),
    meetsAA,
    meetsAAA,
    complianceLevel,
    status: meetsAA ? "✅ Pass" : "❌ Fail",
  };
}

function printTestResult(result: ContrastTestResult): void {
  console.log("\n" + "=".repeat(70));
  console.log(`Background: ${result.background}`);
  console.log(`Foreground: ${result.foreground}`);
  console.log(`Contrast Ratio: ${result.formattedRatio}`);
  console.log(`WCAG AA (4.5:1): ${result.meetsAA ? "✅ Pass" : "❌ Fail"}`);
  console.log(`WCAG AAA (7:1): ${result.meetsAAA ? "✅ Pass" : "❌ Fail"}`);
  console.log(`Compliance Level: ${result.complianceLevel}`);
  console.log(`Overall Status: ${result.status}`);
  console.log("=".repeat(70));
}

function main(): void {
  console.log("\n");
  console.log(
    "╔════════════════════════════════════════════════════════════════════╗"
  );
  console.log(
    "║  WCAG 2.1 Contrast Ratio Testing - Task 11.2                      ║"
  );
  console.log(
    "║  Testing text contrast on funeral-gold gradient background         ║"
  );
  console.log(
    "╚════════════════════════════════════════════════════════════════════╝"
  );
  console.log("\n");
  console.log("Gradient Definition:");
  console.log("  linear-gradient(to right, #ae8625, #f7ef8a, #d2ac47)");
  console.log("\n");
  console.log("Requirements:");
  console.log(
    "  - Verify teal-900 text meets WCAG AA on funeral-gold gradient"
  );
  console.log("  - Test at multiple gradient positions (start, middle, end)");
  console.log("  - Document contrast ratios in test results");
  console.log("\n");

  const results: ContrastTestResult[] = [];

  // Test teal-900 at each gradient position
  console.log("═".repeat(70));
  console.log("PRIMARY TESTS: teal-900 text on gradient positions");
  console.log("═".repeat(70));

  // Test 1: teal-900 on gradient start (dark gold)
  console.log("\nTest 1: teal-900 text on gradient START position");
  const test1 = testContrast(
    "funeral-gold-start",
    GRADIENT_COLORS["funeral-gold-start"],
    "teal-900",
    TEXT_COLORS["teal-900"]
  );
  printTestResult(test1);
  results.push(test1);

  // Test 2: teal-900 on gradient middle (light yellow)
  console.log("\nTest 2: teal-900 text on gradient MIDDLE position");
  const test2 = testContrast(
    "funeral-gold-middle",
    GRADIENT_COLORS["funeral-gold-middle"],
    "teal-900",
    TEXT_COLORS["teal-900"]
  );
  printTestResult(test2);
  results.push(test2);

  // Test 3: teal-900 on gradient end (medium gold)
  console.log("\nTest 3: teal-900 text on gradient END position");
  const test3 = testContrast(
    "funeral-gold-end",
    GRADIENT_COLORS["funeral-gold-end"],
    "teal-900",
    TEXT_COLORS["teal-900"]
  );
  printTestResult(test3);
  results.push(test3);

  // Additional tests for alternative text colors
  console.log("\n");
  console.log("═".repeat(70));
  console.log("ADDITIONAL TESTS: Alternative text colors (for reference)");
  console.log("═".repeat(70));

  // Test teal-800 on worst-case gradient position
  const worstCaseGradient = results.reduce((worst, current) =>
    current.contrastRatio < worst.contrastRatio ? current : worst
  );
  const worstCaseColor = worstCaseGradient.background.includes("start")
    ? GRADIENT_COLORS["funeral-gold-start"]
    : worstCaseGradient.background.includes("middle")
    ? GRADIENT_COLORS["funeral-gold-middle"]
    : GRADIENT_COLORS["funeral-gold-end"];
  const worstCaseName = worstCaseGradient.background.split(" ")[0] || "unknown";

  console.log(
    `\nAdditional Test 1: teal-800 on worst-case position (${worstCaseName})`
  );
  const test4 = testContrast(
    worstCaseName,
    worstCaseColor,
    "teal-800",
    TEXT_COLORS["teal-800"]
  );
  printTestResult(test4);

  console.log(
    `\nAdditional Test 2: teal-700 on worst-case position (${worstCaseName})`
  );
  const test5 = testContrast(
    worstCaseName,
    worstCaseColor,
    "teal-700",
    TEXT_COLORS["teal-700"]
  );
  printTestResult(test5);

  // Summary
  console.log("\n");
  console.log(
    "╔════════════════════════════════════════════════════════════════════╗"
  );
  console.log(
    "║  SUMMARY - PRIMARY TESTS                                           ║"
  );
  console.log(
    "╚════════════════════════════════════════════════════════════════════╝"
  );
  console.log("\n");

  console.log(
    "┌────────────────────────────────────────────────────────────────────┐"
  );
  console.log(
    "│ Gradient Position                    │ Ratio    │ AA    │ AAA    │"
  );
  console.log(
    "├────────────────────────────────────────────────────────────────────┤"
  );
  results.forEach((result) => {
    const position = (result.background.split(" ")[0] || "unknown").padEnd(36);
    const ratio = result.formattedRatio.padEnd(8);
    const aa = (result.meetsAA ? "✅" : "❌").padEnd(6);
    const aaa = (result.meetsAAA ? "✅" : "❌").padEnd(6);
    console.log(`│ ${position} │ ${ratio} │ ${aa} │ ${aaa} │`);
  });
  console.log(
    "└────────────────────────────────────────────────────────────────────┘"
  );

  console.log("\n");
  console.log("Task 11.2 Requirements Verification:");
  console.log(
    `  ✓ teal-900 on gradient start: ${test1.formattedRatio} ${
      test1.meetsAA ? "✅ PASS" : "❌ FAIL"
    }`
  );
  console.log(
    `  ✓ teal-900 on gradient middle: ${test2.formattedRatio} ${
      test2.meetsAA ? "✅ PASS" : "❌ FAIL"
    }`
  );
  console.log(
    `  ✓ teal-900 on gradient end: ${test3.formattedRatio} ${
      test3.meetsAA ? "✅ PASS" : "❌ FAIL"
    }`
  );
  console.log(`  ✓ Tested at multiple gradient positions: ✅ COMPLETE`);
  console.log(`  ✓ Contrast ratios documented: ✅ COMPLETE`);
  console.log("\n");

  const allPass = results.every((r) => r.meetsAA);
  const minRatio = Math.min(...results.map((r) => r.contrastRatio));
  const maxRatio = Math.max(...results.map((r) => r.contrastRatio));

  console.log("Analysis:");
  console.log(`  • Minimum contrast ratio: ${minRatio.toFixed(2)}:1`);
  console.log(`  • Maximum contrast ratio: ${maxRatio.toFixed(2)}:1`);
  console.log(
    `  • Worst-case position: ${worstCaseGradient.background.split(" ")[0]}`
  );
  console.log(
    `  • All positions meet WCAG AA: ${allPass ? "✅ YES" : "❌ NO"}`
  );
  console.log("\n");

  if (allPass) {
    console.log(
      "╔════════════════════════════════════════════════════════════════════╗"
    );
    console.log(
      "║  ✅ ALL TESTS PASSED - WCAG 2.1 AA COMPLIANT                      ║"
    );
    console.log(
      "║  teal-900 text is accessible on all gradient positions            ║"
    );
    console.log(
      "╚════════════════════════════════════════════════════════════════════╝"
    );
    console.log("\n");
    process.exit(0);
  } else {
    console.log(
      "╔════════════════════════════════════════════════════════════════════╗"
    );
    console.log(
      "║  ❌ SOME TESTS FAILED - NOT WCAG 2.1 AA COMPLIANT                 ║"
    );
    console.log(
      "║  Consider using alternative text colors on problematic positions  ║"
    );
    console.log(
      "╚════════════════════════════════════════════════════════════════════╝"
    );
    console.log("\n");
    process.exit(1);
  }
}

main();
