/**
 * Contrast Ratio Testing Script
 *
 * Tests text contrast on teal-800 background for WCAG 2.1 AA compliance
 * Task 11.1: Test text contrast on teal-800 background
 */

import {
  getContrastRatio,
  meetsWCAG_AA,
  meetsWCAG_AAA,
  getComplianceLevel,
  formatContrastRatio,
} from "../src/lib/accessibility/contrast-checker";

// Color definitions from globals.css @theme directive
const COLORS = {
  "teal-800": "#115e59",
  "amber-100": "#fef3c7",
  "amber-200": "#fde68a",
  white: "#ffffff",
  "teal-900": "#134e4a",
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
    "║  WCAG 2.1 Contrast Ratio Testing - Task 11.1                      ║"
  );
  console.log(
    "║  Testing text contrast on teal-800 background                      ║"
  );
  console.log(
    "╚════════════════════════════════════════════════════════════════════╝"
  );
  console.log("\n");
  console.log("Requirements:");
  console.log("  - Verify amber-100 text meets WCAG AA (4.5:1) on teal-800");
  console.log("  - Verify amber-200 text meets WCAG AA (4.5:1) on teal-800");
  console.log("  - Document contrast ratios in test results");
  console.log("\n");

  const results: ContrastTestResult[] = [];

  // Test 1: amber-100 on teal-800
  console.log("Test 1: amber-100 text on teal-800 background");
  const test1 = testContrast(
    "teal-800",
    COLORS["teal-800"],
    "amber-100",
    COLORS["amber-100"]
  );
  printTestResult(test1);
  results.push(test1);

  // Test 2: amber-200 on teal-800
  console.log("\nTest 2: amber-200 text on teal-800 background");
  const test2 = testContrast(
    "teal-800",
    COLORS["teal-800"],
    "amber-200",
    COLORS["amber-200"]
  );
  printTestResult(test2);
  results.push(test2);

  // Additional test: white on teal-800 (for reference)
  console.log(
    "\nAdditional Test: white text on teal-800 background (for reference)"
  );
  const test3 = testContrast(
    "teal-800",
    COLORS["teal-800"],
    "white",
    COLORS["white"]
  );
  printTestResult(test3);
  results.push(test3);

  // Summary
  console.log("\n");
  console.log(
    "╔════════════════════════════════════════════════════════════════════╗"
  );
  console.log(
    "║  SUMMARY                                                           ║"
  );
  console.log(
    "╚════════════════════════════════════════════════════════════════════╝"
  );
  console.log("\n");

  const allPass = results.slice(0, 2).every((r) => r.meetsAA);

  console.log(
    "┌────────────────────────────────────────────────────────────────────┐"
  );
  console.log(
    "│ Color Combination                    │ Ratio    │ AA    │ AAA    │"
  );
  console.log(
    "├────────────────────────────────────────────────────────────────────┤"
  );
  results.forEach((result) => {
    const bg = result.background.split(" ")[0];
    const fg = result.foreground.split(" ")[0];
    const combo = `${fg} on ${bg}`.padEnd(36);
    const ratio = result.formattedRatio.padEnd(8);
    const aa = (result.meetsAA ? "✅" : "❌").padEnd(6);
    const aaa = (result.meetsAAA ? "✅" : "❌").padEnd(6);
    console.log(`│ ${combo} │ ${ratio} │ ${aa} │ ${aaa} │`);
  });
  console.log(
    "└────────────────────────────────────────────────────────────────────┘"
  );

  console.log("\n");
  console.log("Task 11.1 Requirements Verification:");
  console.log(
    `  ✓ amber-100 on teal-800: ${test1.formattedRatio} ${
      test1.meetsAA ? "✅ PASS" : "❌ FAIL"
    }`
  );
  console.log(
    `  ✓ amber-200 on teal-800: ${test2.formattedRatio} ${
      test2.meetsAA ? "✅ PASS" : "❌ FAIL"
    }`
  );
  console.log(`  ✓ Contrast ratios documented: ✅ COMPLETE`);
  console.log("\n");

  if (allPass) {
    console.log(
      "╔════════════════════════════════════════════════════════════════════╗"
    );
    console.log(
      "║  ✅ ALL TESTS PASSED - WCAG 2.1 AA COMPLIANT                      ║"
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
      "╚════════════════════════════════════════════════════════════════════╝"
    );
    console.log("\n");
    process.exit(1);
  }
}

main();
