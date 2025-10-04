/**
 * Interactive Element Contrast Testing Script
 *
 * Tests contrast ratios for interactive elements (buttons, links, form inputs)
 * Task 11.3: Test interactive element contrast
 *
 * Requirements:
 * - Verify button borders and backgrounds meet 3:1 contrast
 * - Test link colors against their backgrounds
 * - Test form input borders and labels
 */

import {
  getContrastRatio,
  meetsWCAG_AA,
  formatContrastRatio,
} from "../src/lib/accessibility/contrast-checker";

// Color definitions from globals.css @theme directive
const COLORS = {
  // Teal palette
  "teal-700": "#0f766e",
  "teal-800": "#115e59",
  "teal-900": "#134e4a",

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
  "stone-200": "#e7e5e4",
  "stone-700": "#44403c",
  "stone-900": "#1c1917",

  // Gradients (using middle value for testing)
  "funeral-gold": "#d2ac47",

  // Standard colors
  white: "#ffffff",
  black: "#000000",

  // Error colors
  "error-500": "#ef4444",
  "error-600": "#dc2626",
} as const;

interface ContrastTestResult {
  element: string;
  background: string;
  foreground: string;
  contrastRatio: number;
  formattedRatio: string;
  meetsAA: boolean;
  meetsNonText: boolean; // 3:1 for non-text elements
  status: "✅ Pass" | "❌ Fail";
  notes?: string;
}

function testContrast(
  elementName: string,
  backgroundName: string,
  backgroundHex: string,
  foregroundName: string,
  foregroundHex: string,
  requiresNonTextOnly = false,
  notes?: string
): ContrastTestResult {
  const ratio = getContrastRatio(backgroundHex, foregroundHex);
  const meetsAA = meetsWCAG_AA(ratio);
  const meetsNonText = ratio >= 3.0; // WCAG 2.1 AA for non-text elements

  const passes = requiresNonTextOnly ? meetsNonText : meetsAA;

  return {
    element: elementName,
    background: `${backgroundName} (${backgroundHex})`,
    foreground: `${foregroundName} (${foregroundHex})`,
    contrastRatio: ratio,
    formattedRatio: formatContrastRatio(ratio),
    meetsAA,
    meetsNonText,
    status: passes ? "✅ Pass" : "❌ Fail",
    ...(notes !== undefined && { notes }),
  };
}

function printTestResult(result: ContrastTestResult): void {
  console.log("\n" + "=".repeat(70));
  console.log(`Element: ${result.element}`);
  console.log(`Background: ${result.background}`);
  console.log(`Foreground: ${result.foreground}`);
  console.log(`Contrast Ratio: ${result.formattedRatio}`);
  console.log(
    `WCAG AA Text (4.5:1): ${result.meetsAA ? "✅ Pass" : "❌ Fail"}`
  );
  console.log(
    `WCAG AA Non-Text (3:1): ${result.meetsNonText ? "✅ Pass" : "❌ Fail"}`
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
    "║  WCAG 2.1 Interactive Element Contrast Testing - Task 11.3        ║"
  );
  console.log(
    "╚════════════════════════════════════════════════════════════════════╝"
  );
  console.log("\n");
  console.log("Requirements:");
  console.log("  - Verify button borders and backgrounds meet 3:1 contrast");
  console.log("  - Test link colors against their backgrounds");
  console.log("  - Test form input borders and labels");
  console.log("\n");

  const results: ContrastTestResult[] = [];

  // ========================================================================
  // BUTTON TESTS
  // ========================================================================
  console.log("═".repeat(70));
  console.log("BUTTON CONTRAST TESTS");
  console.log("═".repeat(70));

  // Test 1: Default Button (amber-900 bg, white text)
  console.log("\nTest 1: Default Button - Text Contrast");
  const test1 = testContrast(
    "Button (default variant) - Text",
    "amber-900",
    COLORS["amber-900"],
    "white",
    COLORS.white,
    false,
    "Primary CTA button background and text"
  );
  printTestResult(test1);
  results.push(test1);

  // Test 2: Secondary Button (amber-100 bg, amber-900 text)
  console.log("\nTest 2: Secondary Button - Text Contrast");
  const test2 = testContrast(
    "Button (secondary variant) - Text",
    "amber-100",
    COLORS["amber-100"],
    "amber-900",
    COLORS["amber-900"],
    false,
    "Secondary button background and text"
  );
  printTestResult(test2);
  results.push(test2);

  // Test 3: Outline Button Border (amber-300 border on funeral-gold bg)
  console.log("\nTest 3: Outline Button - Border Contrast");
  const test3 = testContrast(
    "Button (outline variant) - Border",
    "funeral-gold",
    COLORS["funeral-gold"],
    "amber-300",
    COLORS["amber-300"],
    true,
    "Outline button border against gradient background (non-text, 3:1 required)"
  );
  printTestResult(test3);
  results.push(test3);

  // Test 4: Outline Button Text (amber-700 text on funeral-gold bg)
  console.log("\nTest 4: Outline Button - Text Contrast");
  const test4 = testContrast(
    "Button (outline variant) - Text",
    "funeral-gold",
    COLORS["funeral-gold"],
    "amber-700",
    COLORS["amber-700"],
    false,
    "Outline button text on gradient background"
  );
  printTestResult(test4);
  results.push(test4);

  // Test 5: Ghost Button Hover (amber-700 text on amber-100 hover bg)
  console.log("\nTest 5: Ghost Button - Hover State Text");
  const test5 = testContrast(
    "Button (ghost variant) - Hover Text",
    "amber-100",
    COLORS["amber-100"],
    "amber-700",
    COLORS["amber-700"],
    false,
    "Ghost button text on hover background"
  );
  printTestResult(test5);
  results.push(test5);

  // Test 6: CTA Button (amber-600 bg, white text)
  console.log("\nTest 6: CTA Button - Text Contrast");
  const test6 = testContrast(
    "CTAButton - Text",
    "amber-600",
    COLORS["amber-600"],
    "white",
    COLORS.white,
    false,
    "Hero section CTA button"
  );
  printTestResult(test6);
  results.push(test6);

  // Test 7: Destructive Button (error-600 bg, white text)
  console.log("\nTest 7: Destructive Button - Text Contrast");
  const test7 = testContrast(
    "Button (destructive variant) - Text",
    "error-600",
    COLORS["error-600"],
    "white",
    COLORS.white,
    false,
    "Destructive action button"
  );
  printTestResult(test7);
  results.push(test7);

  // ========================================================================
  // LINK TESTS
  // ========================================================================
  console.log("\n");
  console.log("═".repeat(70));
  console.log("LINK CONTRAST TESTS");
  console.log("═".repeat(70));

  // Test 8: Navigation Links on Gradient (teal-900 text on funeral-gold)
  console.log("\nTest 8: Navigation Links - Default State");
  const test8 = testContrast(
    "Navigation Link - Default",
    "funeral-gold",
    COLORS["funeral-gold"],
    "teal-900",
    COLORS["teal-900"],
    false,
    "Desktop navigation links on golden gradient navbar"
  );
  printTestResult(test8);
  results.push(test8);

  // Test 9: Navigation Links Hover (teal-800 text on funeral-gold)
  console.log("\nTest 9: Navigation Links - Hover State");
  const test9 = testContrast(
    "Navigation Link - Hover",
    "funeral-gold",
    COLORS["funeral-gold"],
    "teal-800",
    COLORS["teal-800"],
    false,
    "Desktop navigation links hover state"
  );
  printTestResult(test9);
  results.push(test9);

  // Test 10: Active Navigation Link (teal-900 text on amber-100 bg)
  console.log("\nTest 10: Navigation Links - Active State");
  const test10 = testContrast(
    "Navigation Link - Active",
    "amber-100",
    COLORS["amber-100"],
    "teal-900",
    COLORS["teal-900"],
    false,
    "Active navigation link with accent background"
  );
  printTestResult(test10);
  results.push(test10);

  // Test 11: Mobile Navigation Links (stone-700 text on white)
  console.log("\nTest 11: Mobile Navigation Links - Default");
  const test11 = testContrast(
    "Mobile Navigation Link - Default",
    "white",
    COLORS.white,
    "stone-700",
    COLORS["stone-700"],
    false,
    "Mobile navigation drawer links"
  );
  printTestResult(test11);
  results.push(test11);

  // Test 12: Link Button Variant (amber-900 text on transparent/white)
  console.log("\nTest 12: Link Button Variant");
  const test12 = testContrast(
    "Button (link variant) - Text",
    "white",
    COLORS.white,
    "amber-900",
    COLORS["amber-900"],
    false,
    "Link-styled button on white background"
  );
  printTestResult(test12);
  results.push(test12);

  // ========================================================================
  // FORM INPUT TESTS
  // ========================================================================
  console.log("\n");
  console.log("═".repeat(70));
  console.log("FORM INPUT CONTRAST TESTS");
  console.log("═".repeat(70));

  // Test 13: Input Border (amber-300 border on white bg)
  console.log("\nTest 13: Form Input - Border Contrast");
  const test13 = testContrast(
    "Input Field - Border",
    "white",
    COLORS.white,
    "amber-300",
    COLORS["amber-300"],
    true,
    "Input field border (non-text, 3:1 required)"
  );
  printTestResult(test13);
  results.push(test13);

  // Test 14: Input Text (amber-900 text on white bg)
  console.log("\nTest 14: Form Input - Text Contrast");
  const test14 = testContrast(
    "Input Field - Text",
    "white",
    COLORS.white,
    "amber-900",
    COLORS["amber-900"],
    false,
    "Input field text value"
  );
  printTestResult(test14);
  results.push(test14);

  // Test 15: Input Placeholder (amber-500 on white bg)
  console.log("\nTest 15: Form Input - Placeholder Text");
  const test15 = testContrast(
    "Input Field - Placeholder",
    "white",
    COLORS.white,
    "amber-500",
    COLORS["amber-500"],
    false,
    "Input field placeholder text"
  );
  printTestResult(test15);
  results.push(test15);

  // Test 16: Input Label (amber-700 on white bg)
  console.log("\nTest 16: Form Input - Label Text");
  const test16 = testContrast(
    "Input Field - Label",
    "white",
    COLORS.white,
    "amber-700",
    COLORS["amber-700"],
    false,
    "Input field label text"
  );
  printTestResult(test16);
  results.push(test16);

  // Test 17: Input Focus Border (amber-500 on white bg)
  console.log("\nTest 17: Form Input - Focus Border");
  const test17 = testContrast(
    "Input Field - Focus Border",
    "white",
    COLORS.white,
    "amber-500",
    COLORS["amber-500"],
    true,
    "Input field focus state border (non-text, 3:1 required)"
  );
  printTestResult(test17);
  results.push(test17);

  // Test 18: Error Input Border (error-500 on white bg)
  console.log("\nTest 18: Form Input - Error Border");
  const test18 = testContrast(
    "Input Field - Error Border",
    "white",
    COLORS.white,
    "error-500",
    COLORS["error-500"],
    true,
    "Input field error state border (non-text, 3:1 required)"
  );
  printTestResult(test18);
  results.push(test18);

  // Test 19: Error Message Text (error-600 on white bg)
  console.log("\nTest 19: Form Input - Error Message");
  const test19 = testContrast(
    "Input Field - Error Message",
    "white",
    COLORS.white,
    "error-600",
    COLORS["error-600"],
    false,
    "Input field error message text"
  );
  printTestResult(test19);
  results.push(test19);

  // Test 20: Disabled Input (amber-500 text on amber-50 bg)
  console.log("\nTest 20: Form Input - Disabled State");
  const test20 = testContrast(
    "Input Field - Disabled Text",
    "amber-50",
    COLORS["amber-50"],
    "amber-500",
    COLORS["amber-500"],
    false,
    "Disabled input field text (informational, may not meet AA)"
  );
  printTestResult(test20);
  results.push(test20);

  // ========================================================================
  // FOCUS STATE TESTS
  // ========================================================================
  console.log("\n");
  console.log("═".repeat(70));
  console.log("FOCUS STATE CONTRAST TESTS");
  console.log("═".repeat(70));

  // Test 21: Focus Ring on Teal Background (amber-950 ring on teal-800)
  console.log("\nTest 21: Focus Ring - Teal Background");
  const test21 = testContrast(
    "Focus Ring - Teal Background",
    "teal-800",
    COLORS["teal-800"],
    "amber-950",
    COLORS["amber-950"],
    true,
    "Focus ring on teal-800 product cards (non-text, 3:1 required)"
  );
  printTestResult(test21);
  results.push(test21);

  // Test 22: Focus Ring on Gradient Background (amber-950 ring on funeral-gold)
  console.log("\nTest 22: Focus Ring - Gradient Background");
  const test22 = testContrast(
    "Focus Ring - Gradient Background",
    "funeral-gold",
    COLORS["funeral-gold"],
    "amber-950",
    COLORS["amber-950"],
    true,
    "Focus ring on golden gradient background (non-text, 3:1 required)"
  );
  printTestResult(test22);
  results.push(test22);

  // Test 23: Focus Ring on White Background (amber-500 ring on white)
  console.log("\nTest 23: Focus Ring - White Background");
  const test23 = testContrast(
    "Focus Ring - White Background",
    "white",
    COLORS.white,
    "amber-500",
    COLORS["amber-500"],
    true,
    "Focus ring on white background (non-text, 3:1 required)"
  );
  printTestResult(test23);
  results.push(test23);

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

  // Group results by category
  const buttonTests = results.slice(0, 7);
  const linkTests = results.slice(7, 12);
  const inputTests = results.slice(12, 20);
  const focusTests = results.slice(20, 23);

  console.log("Button Tests:");
  console.log(
    "┌────────────────────────────────────────────────────────────────────┐"
  );
  console.log(
    "│ Element                              │ Ratio    │ Required │ Status│"
  );
  console.log(
    "├────────────────────────────────────────────────────────────────────┤"
  );
  buttonTests.forEach((result) => {
    const element = result.element.substring(0, 36).padEnd(36);
    const ratio = result.formattedRatio.padEnd(8);
    const required = result.element.includes("Border") ? "3:1    " : "4.5:1  ";
    const status = result.status.padEnd(6);
    console.log(`│ ${element} │ ${ratio} │ ${required} │ ${status}│`);
  });
  console.log(
    "└────────────────────────────────────────────────────────────────────┘"
  );

  console.log("\nLink Tests:");
  console.log(
    "┌────────────────────────────────────────────────────────────────────┐"
  );
  console.log(
    "│ Element                              │ Ratio    │ Required │ Status│"
  );
  console.log(
    "├────────────────────────────────────────────────────────────────────┤"
  );
  linkTests.forEach((result) => {
    const element = result.element.substring(0, 36).padEnd(36);
    const ratio = result.formattedRatio.padEnd(8);
    const required = "4.5:1  ";
    const status = result.status.padEnd(6);
    console.log(`│ ${element} │ ${ratio} │ ${required} │ ${status}│`);
  });
  console.log(
    "└────────────────────────────────────────────────────────────────────┘"
  );

  console.log("\nForm Input Tests:");
  console.log(
    "┌────────────────────────────────────────────────────────────────────┐"
  );
  console.log(
    "│ Element                              │ Ratio    │ Required │ Status│"
  );
  console.log(
    "├────────────────────────────────────────────────────────────────────┤"
  );
  inputTests.forEach((result) => {
    const element = result.element.substring(0, 36).padEnd(36);
    const ratio = result.formattedRatio.padEnd(8);
    const required = result.element.includes("Border") ? "3:1    " : "4.5:1  ";
    const status = result.status.padEnd(6);
    console.log(`│ ${element} │ ${ratio} │ ${required} │ ${status}│`);
  });
  console.log(
    "└────────────────────────────────────────────────────────────────────┘"
  );

  console.log("\nFocus State Tests:");
  console.log(
    "┌────────────────────────────────────────────────────────────────────┐"
  );
  console.log(
    "│ Element                              │ Ratio    │ Required │ Status│"
  );
  console.log(
    "├────────────────────────────────────────────────────────────────────┤"
  );
  focusTests.forEach((result) => {
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
  console.log("Task 11.3 Requirements Verification:");
  console.log(
    `  ✓ Button borders and backgrounds tested: ${buttonTests.length} tests`
  );
  console.log(`  ✓ Link colors tested: ${linkTests.length} tests`);
  console.log(
    `  ✓ Form input borders and labels tested: ${inputTests.length} tests`
  );
  console.log(`  ✓ Focus states tested: ${focusTests.length} tests`);
  console.log("\n");

  const allPass = results.every((r) => r.status === "✅ Pass");
  const failedTests = results.filter((r) => r.status === "❌ Fail");

  console.log("Analysis:");
  console.log(`  • Total tests: ${results.length}`);
  console.log(`  • Passed: ${results.length - failedTests.length}`);
  console.log(`  • Failed: ${failedTests.length}`);
  console.log("\n");

  if (failedTests.length > 0) {
    console.log("Failed Tests:");
    failedTests.forEach((test) => {
      console.log(`  ❌ ${test.element}`);
      console.log(`     ${test.formattedRatio} - ${test.notes || "No notes"}`);
    });
    console.log("\n");
  }

  if (allPass) {
    console.log(
      "╔════════════════════════════════════════════════════════════════════╗"
    );
    console.log(
      "║  ✅ ALL TESTS PASSED - WCAG 2.1 AA COMPLIANT                      ║"
    );
    console.log(
      "║  All interactive elements meet accessibility requirements         ║"
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
      "║  Some interactive elements may need color adjustments             ║"
    );
    console.log(
      "╚════════════════════════════════════════════════════════════════════╝"
    );
    console.log("\n");
    process.exit(1);
  }
}

main();
