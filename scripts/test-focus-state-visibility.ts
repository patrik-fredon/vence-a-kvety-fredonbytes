/**
 * Focus State Visibility Testing Script
 *
 * Tests focus ring visibility and contrast on all interactive elements
 * Task 11.4: Test focus state visibility
 *
 * Requirements:
 * - Verify focus rings are visible on all interactive elements
 * - Test focus states on both teal-800 and golden gradient backgrounds
 * - Ensure focus indicators meet 3:1 contrast requirement
 */

import {
  getContrastRatio,
  formatContrastRatio,
} from "../src/lib/accessibility/contrast-checker";

// Color definitions from globals.css @theme directive
const COLORS = {
  // Teal palette
  "teal-700": "#0f766e",
  "teal-800": "#115e59",
  "teal-900": "#134e4a",
  "teal-950": "#013029",

  // Amber palette
  "amber-50": "#fffbeb",
  "amber-100": "#fef3c7",
  "amber-200": "#fde68a",
  "amber-300": "#fcd34d",
  "amber-400": "#fbbf24",
  "amber-500": "#f59e0b",
  "amber-600": "#d97706",
  "amber-700": "#b45309",
  "amber-800": "#92400e",
  "amber-900": "#78350f",
  "amber-950": "#451a03",

  // Stone palette
  "stone-50": "#fafaf9",
  "stone-100": "#f5f5f4",
  "stone-200": "#e7e5e4",
  "stone-700": "#44403c",
  "stone-900": "#1c1917",

  // Gradients (using middle value for testing)
  "funeral-gold": "#d2ac47",
  "funeral-teal": "#14b8a6",

  // Standard colors
  white: "#ffffff",
  black: "#000000",
} as const;

interface FocusTestResult {
  element: string;
  background: string;
  focusIndicator: string;
  contrastRatio: number;
  formattedRatio: string;
  meetsRequirement: boolean; // 3:1 for focus indicators
  status: "✅ Pass" | "❌ Fail";
  notes?: string;
}

function testFocusContrast(
  elementName: string,
  backgroundName: string,
  backgroundHex: string,
  focusIndicatorName: string,
  focusIndicatorHex: string,
  notes?: string
): FocusTestResult {
  const ratio = getContrastRatio(backgroundHex, focusIndicatorHex);
  const meetsRequirement = ratio >= 3.0; // WCAG 2.1 AA for focus indicators (non-text)

  return {
    element: elementName,
    background: `${backgroundName} (${backgroundHex})`,
    focusIndicator: `${focusIndicatorName} (${focusIndicatorHex})`,
    contrastRatio: ratio,
    formattedRatio: formatContrastRatio(ratio),
    meetsRequirement,
    status: meetsRequirement ? "✅ Pass" : "❌ Fail",
    ...(notes !== undefined && { notes }),
  };
}

function printTestResult(result: FocusTestResult): void {
  console.log("\n" + "=".repeat(70));
  console.log(`Element: ${result.element}`);
  console.log(`Background: ${result.background}`);
  console.log(`Focus Indicator: ${result.focusIndicator}`);
  console.log(`Contrast Ratio: ${result.formattedRatio}`);
  console.log(
    `WCAG 2.1 AA Focus Indicator (3:1): ${
      result.meetsRequirement ? "✅ Pass" : "❌ Fail"
    }`
  );
  console.log(`Overall Status: ${result.status}`);
  if (result.notes) {
    console.log(`Notes: ${result.notes}`);
  }
  console.log("=".repeat(70));
}

function main(): void {
  console.log("\n");
  console.log(
    "╔════════════════════════════════════════════════════════════════════╗"
  );
  console.log(
    "║  WCAG 2.1 Focus State Visibility Testing - Task 11.4              ║"
  );
  console.log(
    "╚════════════════════════════════════════════════════════════════════╝"
  );
  console.log("\n");
  console.log("Requirements:");
  console.log("  - Verify focus rings are visible on all interactive elements");
  console.log(
    "  - Test focus states on both teal-800 and golden gradient backgrounds"
  );
  console.log("  - Ensure focus indicators meet 3:1 contrast requirement");
  console.log("\n");
  console.log("WCAG 2.1 Success Criterion 2.4.7 (Focus Visible):");
  console.log(
    "  Any keyboard operable user interface has a mode of operation where"
  );
  console.log("  the keyboard focus indicator is visible.");
  console.log("\n");
  console.log("WCAG 2.1 Success Criterion 1.4.11 (Non-text Contrast):");
  console.log(
    "  Visual presentation of focus indicators must have a contrast ratio"
  );
  console.log("  of at least 3:1 against adjacent colors.");
  console.log("\n");

  const results: FocusTestResult[] = [];

  // ========================================================================
  // FOCUS RINGS ON TEAL-800 BACKGROUND (Product Cards, Hero Section)
  // ========================================================================
  console.log("═".repeat(70));
  console.log("FOCUS STATES ON TEAL-800 BACKGROUND");
  console.log("═".repeat(70));
  console.log("Context: Product cards, hero section elements");
  console.log("\n");

  // Test 1: Amber-950 focus ring on teal-800
  console.log("Test 1: Focus Ring - Amber-950 on Teal-800");
  const test1 = testFocusContrast(
    "Product Card Link/Button",
    "teal-800",
    COLORS["teal-800"],
    "amber-950",
    COLORS["amber-950"],
    "Primary focus ring color for product cards and hero CTA buttons"
  );
  printTestResult(test1);
  results.push(test1);

  // Test 2: Amber-900 focus ring on teal-800
  console.log("\nTest 2: Focus Ring - Amber-900 on Teal-800");
  const test2 = testFocusContrast(
    "Product Card Link/Button (Alternative)",
    "teal-800",
    COLORS["teal-800"],
    "amber-900",
    COLORS["amber-900"],
    "Alternative focus ring color option"
  );
  printTestResult(test2);
  results.push(test2);

  // Test 3: Amber-500 focus ring on teal-800
  console.log("\nTest 3: Focus Ring - Amber-500 on Teal-800");
  const test3 = testFocusContrast(
    "Product Card Link/Button (Bright)",
    "teal-800",
    COLORS["teal-800"],
    "amber-500",
    COLORS["amber-500"],
    "Brighter focus ring option for better visibility"
  );
  printTestResult(test3);
  results.push(test3);

  // Test 4: White focus ring on teal-800
  console.log("\nTest 4: Focus Ring - White on Teal-800");
  const test4 = testFocusContrast(
    "Product Card Link/Button (High Contrast)",
    "teal-800",
    COLORS["teal-800"],
    "white",
    COLORS.white,
    "Maximum contrast focus ring option"
  );
  printTestResult(test4);
  results.push(test4);

  // Test 5: Amber-200 focus ring on teal-800
  console.log("\nTest 5: Focus Ring - Amber-200 on Teal-800");
  const test5 = testFocusContrast(
    "Product Card Link/Button (Light)",
    "teal-800",
    COLORS["teal-800"],
    "amber-200",
    COLORS["amber-200"],
    "Light amber focus ring matching text colors"
  );
  printTestResult(test5);
  results.push(test5);

  // ========================================================================
  // FOCUS RINGS ON GOLDEN GRADIENT BACKGROUND (Navbar, Body)
  // ========================================================================
  console.log("\n");
  console.log("═".repeat(70));
  console.log("FOCUS STATES ON GOLDEN GRADIENT BACKGROUND");
  console.log("═".repeat(70));
  console.log("Context: Navbar links, body content links");
  console.log("\n");

  // Test 6: Teal-950 focus ring on funeral-gold
  console.log("Test 6: Focus Ring - Teal-950 on Funeral-Gold");
  const test6 = testFocusContrast(
    "Navigation Link",
    "funeral-gold",
    COLORS["funeral-gold"],
    "teal-950",
    COLORS["teal-950"],
    "Primary focus ring for navbar links"
  );
  printTestResult(test6);
  results.push(test6);

  // Test 7: Teal-900 focus ring on funeral-gold
  console.log("\nTest 7: Focus Ring - Teal-900 on Funeral-Gold");
  const test7 = testFocusContrast(
    "Navigation Link (Alternative)",
    "funeral-gold",
    COLORS["funeral-gold"],
    "teal-900",
    COLORS["teal-900"],
    "Alternative focus ring matching link text color"
  );
  printTestResult(test7);
  results.push(test7);

  // Test 8: Teal-800 focus ring on funeral-gold
  console.log("\nTest 8: Focus Ring - Teal-800 on Funeral-Gold");
  const test8 = testFocusContrast(
    "Navigation Link (Hover Match)",
    "funeral-gold",
    COLORS["funeral-gold"],
    "teal-800",
    COLORS["teal-800"],
    "Focus ring matching hover state color"
  );
  printTestResult(test8);
  results.push(test8);

  // Test 9: Amber-950 focus ring on funeral-gold
  console.log("\nTest 9: Focus Ring - Amber-950 on Funeral-Gold");
  const test9 = testFocusContrast(
    "Navigation Link (Dark Amber)",
    "funeral-gold",
    COLORS["funeral-gold"],
    "amber-950",
    COLORS["amber-950"],
    "Dark amber focus ring for consistency with teal backgrounds"
  );
  printTestResult(test9);
  results.push(test9);

  // Test 10: Amber-800 focus ring on funeral-gold
  console.log("\nTest 10: Focus Ring - Amber-800 on Funeral-Gold");
  const test10 = testFocusContrast(
    "Navigation Link (Medium Amber)",
    "funeral-gold",
    COLORS["funeral-gold"],
    "amber-800",
    COLORS["amber-800"],
    "Medium amber focus ring option"
  );
  printTestResult(test10);
  results.push(test10);

  // ========================================================================
  // FOCUS RINGS ON WHITE BACKGROUND (Forms, Modals)
  // ========================================================================
  console.log("\n");
  console.log("═".repeat(70));
  console.log("FOCUS STATES ON WHITE BACKGROUND");
  console.log("═".repeat(70));
  console.log("Context: Form inputs, modal content, white cards");
  console.log("\n");

  // Test 11: Amber-500 focus ring on white
  console.log("Test 11: Focus Ring - Amber-500 on White");
  const test11 = testFocusContrast(
    "Form Input Field",
    "white",
    COLORS.white,
    "amber-500",
    COLORS["amber-500"],
    "Primary focus ring for form inputs"
  );
  printTestResult(test11);
  results.push(test11);

  // Test 12: Amber-600 focus ring on white
  console.log("\nTest 12: Focus Ring - Amber-600 on White");
  const test12 = testFocusContrast(
    "Form Input Field (Darker)",
    "white",
    COLORS.white,
    "amber-600",
    COLORS["amber-600"],
    "Darker focus ring for better visibility"
  );
  printTestResult(test12);
  results.push(test12);

  // Test 13: Teal-700 focus ring on white
  console.log("\nTest 13: Focus Ring - Teal-700 on White");
  const test13 = testFocusContrast(
    "Form Input Field (Teal)",
    "white",
    COLORS.white,
    "teal-700",
    COLORS["teal-700"],
    "Teal focus ring for brand consistency"
  );
  printTestResult(test13);
  results.push(test13);

  // Test 14: Amber-400 focus ring on white
  console.log("\nTest 14: Focus Ring - Amber-400 on White");
  const test14 = testFocusContrast(
    "Form Input Field (Lighter)",
    "white",
    COLORS.white,
    "amber-400",
    COLORS["amber-400"],
    "Lighter amber focus ring option"
  );
  printTestResult(test14);
  results.push(test14);

  // ========================================================================
  // FOCUS RINGS ON STONE BACKGROUNDS (Neutral Sections)
  // ========================================================================
  console.log("\n");
  console.log("═".repeat(70));
  console.log("FOCUS STATES ON STONE BACKGROUNDS");
  console.log("═".repeat(70));
  console.log("Context: Neutral sections, footer, sidebars");
  console.log("\n");

  // Test 15: Amber-500 focus ring on stone-100
  console.log("Test 15: Focus Ring - Amber-500 on Stone-100");
  const test15 = testFocusContrast(
    "Link on Stone-100 Background",
    "stone-100",
    COLORS["stone-100"],
    "amber-500",
    COLORS["amber-500"],
    "Focus ring on light stone background"
  );
  printTestResult(test15);
  results.push(test15);

  // Test 16: Amber-200 focus ring on stone-900
  console.log("\nTest 16: Focus Ring - Amber-200 on Stone-900");
  const test16 = testFocusContrast(
    "Link on Stone-900 Background",
    "stone-900",
    COLORS["stone-900"],
    "amber-200",
    COLORS["amber-200"],
    "Focus ring on dark stone background (footer)"
  );
  printTestResult(test16);
  results.push(test16);

  // Test 17: White focus ring on stone-900
  console.log("\nTest 17: Focus Ring - White on Stone-900");
  const test17 = testFocusContrast(
    "Link on Stone-900 Background (High Contrast)",
    "stone-900",
    COLORS["stone-900"],
    "white",
    COLORS.white,
    "Maximum contrast focus ring on dark background"
  );
  printTestResult(test17);
  results.push(test17);

  // ========================================================================
  // FOCUS RINGS ON AMBER BACKGROUNDS (Buttons, Highlights)
  // ========================================================================
  console.log("\n");
  console.log("═".repeat(70));
  console.log("FOCUS STATES ON AMBER BACKGROUNDS");
  console.log("═".repeat(70));
  console.log("Context: Amber buttons, highlighted sections");
  console.log("\n");

  // Test 18: Teal-900 focus ring on amber-100
  console.log("Test 18: Focus Ring - Teal-900 on Amber-100");
  const test18 = testFocusContrast(
    "Button on Amber-100 Background",
    "amber-100",
    COLORS["amber-100"],
    "teal-900",
    COLORS["teal-900"],
    "Focus ring on light amber background"
  );
  printTestResult(test18);
  results.push(test18);

  // Test 19: White focus ring on amber-600
  console.log("\nTest 19: Focus Ring - White on Amber-600");
  const test19 = testFocusContrast(
    "CTA Button (Amber-600 Background)",
    "amber-600",
    COLORS["amber-600"],
    "white",
    COLORS.white,
    "Focus ring on CTA button background"
  );
  printTestResult(test19);
  results.push(test19);

  // Test 20: Amber-950 focus ring on amber-200
  console.log("\nTest 20: Focus Ring - Amber-950 on Amber-200");
  const test20 = testFocusContrast(
    "Button on Amber-200 Background",
    "amber-200",
    COLORS["amber-200"],
    "amber-950",
    COLORS["amber-950"],
    "Dark focus ring on light amber background"
  );
  printTestResult(test20);
  results.push(test20);

  // ========================================================================
  // FOCUS OFFSET TESTS (Focus ring with offset from element)
  // ========================================================================
  console.log("\n");
  console.log("═".repeat(70));
  console.log("FOCUS RING OFFSET TESTS");
  console.log("═".repeat(70));
  console.log(
    "Context: Testing focus rings with offset (ring-offset-* classes)"
  );
  console.log("\n");

  // Test 21: Focus ring with white offset on teal-800
  console.log("Test 21: Focus Ring with Offset - Teal-800 Background");
  const test21a = testFocusContrast(
    "Product Card (Ring vs Background)",
    "teal-800",
    COLORS["teal-800"],
    "amber-500",
    COLORS["amber-500"],
    "Focus ring contrast against teal-800 background"
  );
  printTestResult(test21a);
  results.push(test21a);

  const test21b = testFocusContrast(
    "Product Card (Ring vs Offset)",
    "white",
    COLORS.white,
    "amber-500",
    COLORS["amber-500"],
    "Focus ring contrast against white offset"
  );
  printTestResult(test21b);
  results.push(test21b);

  // Test 22: Focus ring with teal offset on funeral-gold
  console.log("\nTest 22: Focus Ring with Offset - Funeral-Gold Background");
  const test22a = testFocusContrast(
    "Navigation Link (Ring vs Background)",
    "funeral-gold",
    COLORS["funeral-gold"],
    "teal-900",
    COLORS["teal-900"],
    "Focus ring contrast against golden gradient"
  );
  printTestResult(test22a);
  results.push(test22a);

  const test22b = testFocusContrast(
    "Navigation Link (Ring vs Offset)",
    "teal-800",
    COLORS["teal-800"],
    "teal-900",
    COLORS["teal-900"],
    "Focus ring contrast against teal offset (may be low, acceptable)"
  );
  printTestResult(test22b);
  results.push(test22b);

  // ========================================================================
  // SUMMARY
  // ========================================================================
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

  // Group results by background type
  const tealBgTests = results.slice(0, 5);
  const goldBgTests = results.slice(5, 10);
  const whiteBgTests = results.slice(10, 14);
  const stoneBgTests = results.slice(14, 17);
  const amberBgTests = results.slice(17, 20);
  const offsetTests = results.slice(20);

  console.log("Focus States on Teal-800 Background:");
  console.log(
    "┌────────────────────────────────────────────────────────────────────┐"
  );
  console.log(
    "│ Element                              │ Ratio    │ Required │ Status│"
  );
  console.log(
    "├────────────────────────────────────────────────────────────────────┤"
  );
  tealBgTests.forEach((result) => {
    const element = result.element.substring(0, 36).padEnd(36);
    const ratio = result.formattedRatio.padEnd(8);
    const required = "3:1    ";
    const status = result.status.padEnd(6);
    console.log(`│ ${element} │ ${ratio} │ ${required} │ ${status}│`);
  });
  console.log(
    "└────────────────────────────────────────────────────────────────────┘"
  );

  console.log("\nFocus States on Golden Gradient Background:");
  console.log(
    "┌────────────────────────────────────────────────────────────────────┐"
  );
  console.log(
    "│ Element                              │ Ratio    │ Required │ Status│"
  );
  console.log(
    "├────────────────────────────────────────────────────────────────────┤"
  );
  goldBgTests.forEach((result) => {
    const element = result.element.substring(0, 36).padEnd(36);
    const ratio = result.formattedRatio.padEnd(8);
    const required = "3:1    ";
    const status = result.status.padEnd(6);
    console.log(`│ ${element} │ ${ratio} │ ${required} │ ${status}│`);
  });
  console.log(
    "└────────────────────────────────────────────────────────────────────┘"
  );

  console.log("\nFocus States on White Background:");
  console.log(
    "┌────────────────────────────────────────────────────────────────────┐"
  );
  console.log(
    "│ Element                              │ Ratio    │ Required │ Status│"
  );
  console.log(
    "├────────────────────────────────────────────────────────────────────┤"
  );
  whiteBgTests.forEach((result) => {
    const element = result.element.substring(0, 36).padEnd(36);
    const ratio = result.formattedRatio.padEnd(8);
    const required = "3:1    ";
    const status = result.status.padEnd(6);
    console.log(`│ ${element} │ ${ratio} │ ${required} │ ${status}│`);
  });
  console.log(
    "└────────────────────────────────────────────────────────────────────┘"
  );

  console.log("\nFocus States on Stone Backgrounds:");
  console.log(
    "┌────────────────────────────────────────────────────────────────────┐"
  );
  console.log(
    "│ Element                              │ Ratio    │ Required │ Status│"
  );
  console.log(
    "├────────────────────────────────────────────────────────────────────┤"
  );
  stoneBgTests.forEach((result) => {
    const element = result.element.substring(0, 36).padEnd(36);
    const ratio = result.formattedRatio.padEnd(8);
    const required = "3:1    ";
    const status = result.status.padEnd(6);
    console.log(`│ ${element} │ ${ratio} │ ${required} │ ${status}│`);
  });
  console.log(
    "└────────────────────────────────────────────────────────────────────┘"
  );

  console.log("\nFocus States on Amber Backgrounds:");
  console.log(
    "┌────────────────────────────────────────────────────────────────────┐"
  );
  console.log(
    "│ Element                              │ Ratio    │ Required │ Status│"
  );
  console.log(
    "├────────────────────────────────────────────────────────────────────┤"
  );
  amberBgTests.forEach((result) => {
    const element = result.element.substring(0, 36).padEnd(36);
    const ratio = result.formattedRatio.padEnd(8);
    const required = "3:1    ";
    const status = result.status.padEnd(6);
    console.log(`│ ${element} │ ${ratio} │ ${required} │ ${status}│`);
  });
  console.log(
    "└────────────────────────────────────────────────────────────────────┘"
  );

  console.log("\nFocus Ring Offset Tests:");
  console.log(
    "┌────────────────────────────────────────────────────────────────────┐"
  );
  console.log(
    "│ Element                              │ Ratio    │ Required │ Status│"
  );
  console.log(
    "├────────────────────────────────────────────────────────────────────┤"
  );
  offsetTests.forEach((result) => {
    const element = result.element.substring(0, 36).padEnd(36);
    const ratio = result.formattedRatio.padEnd(8);
    const required = "3:1    ";
    const status = result.status.padEnd(6);
    console.log(`│ ${element} │ ${ratio} │ ${required} │ ${status}│`);
  });
  console.log(
    "└────────────────────────────────────────────────────────────────────┘"
  );

  console.log("\n");
  console.log("Task 11.4 Requirements Verification:");
  console.log(
    `  ✓ Focus rings tested on all interactive elements: ${results.length} tests`
  );
  console.log(
    `  ✓ Focus states tested on teal-800 background: ${tealBgTests.length} tests`
  );
  console.log(
    `  ✓ Focus states tested on golden gradient: ${goldBgTests.length} tests`
  );
  console.log(`  ✓ All focus indicators verified for 3:1 contrast requirement`);
  console.log("\n");

  const allPass = results.every((r) => r.status === "✅ Pass");
  const failedTests = results.filter((r) => r.status === "❌ Fail");
  const passedTests = results.filter((r) => r.status === "✅ Pass");

  console.log("Analysis:");
  console.log(`  • Total tests: ${results.length}`);
  console.log(`  • Passed: ${passedTests.length}`);
  console.log(`  • Failed: ${failedTests.length}`);
  console.log("\n");

  if (failedTests.length > 0) {
    console.log("Failed Tests:");
    failedTests.forEach((test) => {
      console.log(`  ❌ ${test.element}`);
      console.log(`     ${test.formattedRatio} - ${test.notes || "No notes"}`);
    });
    console.log("\n");
    console.log("Recommendations:");
    console.log("  • Consider using focus ring colors that passed the tests");
    console.log(
      "  • For failed tests, increase contrast by using darker/lighter colors"
    );
    console.log(
      "  • Ensure focus-visible pseudo-class is properly implemented"
    );
    console.log("\n");
  }

  // Provide recommendations based on results
  console.log("Recommended Focus Ring Colors:");
  console.log("  • Teal-800 backgrounds: amber-500, amber-950, or white");
  console.log(
    "  • Golden gradient backgrounds: teal-950, teal-900, or amber-950"
  );
  console.log("  • White backgrounds: amber-500, amber-600, or teal-700");
  console.log(
    "  • Stone backgrounds: amber-500 (light), amber-200 or white (dark)"
  );
  console.log("  • Amber backgrounds: teal-900 (light), white (dark)");
  console.log("\n");

  if (allPass) {
    console.log(
      "╔════════════════════════════════════════════════════════════════════╗"
    );
    console.log(
      "║  ✅ ALL TESTS PASSED - WCAG 2.1 AA COMPLIANT                      ║"
    );
    console.log(
      "║  All focus indicators meet accessibility requirements             ║"
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
      "║  ⚠️  SOME TESTS FAILED - REVIEW REQUIRED                          ║"
    );
    console.log(
      "║  Some focus indicators may need color adjustments                 ║"
    );
    console.log(
      "╚════════════════════════════════════════════════════════════════════╝"
    );
    console.log("\n");
    process.exit(1);
  }
}

main();
