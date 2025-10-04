/**
 * Accessibility Testing Examples
 * Demonstrates how to use the accessibility testing utilities
 */

import {
  runAccessibilityTests,
  generateAccessibilityReport,
  testKeyboardNavigation,
  testFocusIndicators,
  testScreenReaderCompatibility,
  testSemanticHTML,
  testARIALabels,
} from "./test-runner";

/**
 * Example 1: Run all accessibility tests
 */
export async function example1_RunAllTests() {
  console.log("Example 1: Running all accessibility tests...\n");

  const results = await runAccessibilityTests();
  const report = generateAccessibilityReport(results);

  console.log(report);

  return results;
}

/**
 * Example 2: Test keyboard navigation only
 */
export function example2_TestKeyboardOnly() {
  console.log("Example 2: Testing keyboard navigation...\n");

  const results = testKeyboardNavigation();

  console.log("Keyboard Navigation Results:");
  console.log(`- Total Elements: ${results.totalElements}`);
  console.log(`- Accessible: ${results.accessibleElements}`);
  console.log(`- Inaccessible: ${results.inaccessibleElements}`);
  console.log(`- Tab Order Issues: ${results.tabOrderIssues}`);

  if (results.details.length > 0) {
    console.log("\nIssues Found:");
    results.details.forEach((detail, index) => {
      console.log(`${index + 1}. ${detail.element}`);
      detail.issues.forEach((issue) => console.log(`   - ${issue}`));
    });
  }

  return results;
}

/**
 * Example 3: Test focus indicators
 */
export function example3_TestFocusIndicators() {
  console.log("Example 3: Testing focus indicators...\n");

  const results = testFocusIndicators();

  console.log("Focus Indicator Results:");
  console.log(`- Total Focusable Elements: ${results.totalFocusableElements}`);
  console.log(`- With Indicators: ${results.elementsWithIndicators}`);
  console.log(`- Without Indicators: ${results.elementsWithoutIndicators}`);

  if (results.elementsWithoutIndicators > 0) {
    console.log("\nElements Without Focus Indicators:");
    results.details
      .filter((d) => !d.hasVisibleFocus)
      .forEach((detail, index) => {
        console.log(`${index + 1}. ${detail.element}`);
      });
  }

  return results;
}

/**
 * Example 4: Test screen reader compatibility
 */
export function example4_TestScreenReader() {
  console.log("Example 4: Testing screen reader compatibility...\n");

  const results = testScreenReaderCompatibility();

  console.log("Screen Reader Results:");
  console.log(`- Total Elements: ${results.totalElements}`);
  console.log(`- Compliant: ${results.compliantElements}`);
  console.log(`- Non-Compliant: ${results.nonCompliantElements}`);

  if (results.details.length > 0) {
    console.log("\nIssues Found:");
    results.details.forEach((detail, index) => {
      console.log(`${index + 1}. ${detail.element} [${detail.severity}]`);
      detail.issues.forEach((issue) => console.log(`   - ${issue}`));
    });
  }

  return results;
}

/**
 * Example 5: Test semantic HTML structure
 */
export function example5_TestSemanticHTML() {
  console.log("Example 5: Testing semantic HTML structure...\n");

  const results = testSemanticHTML();

  console.log("Semantic HTML Results:");
  console.log(`- Has Main Landmark: ${results.hasMainLandmark ? "✓" : "✗"}`);
  console.log(`- Has Nav Landmark: ${results.hasNavLandmark ? "✓" : "✗"}`);
  console.log(
    `- Proper Heading Structure: ${
      results.hasProperHeadingStructure ? "✓" : "✗"
    }`
  );
  console.log(`- Has Skip Links: ${results.hasSkipLinks ? "✓" : "✗"}`);

  if (results.issues.length > 0) {
    console.log("\nIssues:");
    results.issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`);
    });
  }

  if (results.warnings.length > 0) {
    console.log("\nWarnings:");
    results.warnings.forEach((warning, index) => {
      console.log(`${index + 1}. ${warning}`);
    });
  }

  return results;
}

/**
 * Example 6: Test ARIA labels
 */
export function example6_TestARIALabels() {
  console.log("Example 6: Testing ARIA labels...\n");

  const results = testARIALabels();

  console.log("ARIA Label Results:");
  console.log(
    `- Total Interactive Elements: ${results.totalInteractiveElements}`
  );
  console.log(`- With Labels: ${results.elementsWithLabels}`);
  console.log(`- Without Labels: ${results.elementsWithoutLabels}`);

  if (results.elementsWithoutLabels > 0) {
    console.log("\nElements Without Labels:");
    results.details
      .filter((d) => !d.hasLabel)
      .forEach((detail, index) => {
        console.log(`${index + 1}. ${detail.element}`);
      });
  }

  return results;
}

/**
 * Example 7: Test specific container
 */
export function example7_TestSpecificContainer(containerId: string) {
  console.log(`Example 7: Testing container #${containerId}...\n`);

  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container #${containerId} not found`);
    return null;
  }

  const results = testKeyboardNavigation(container as HTMLElement);

  console.log(`Results for #${containerId}:`);
  console.log(`- Total Elements: ${results.totalElements}`);
  console.log(`- Accessible: ${results.accessibleElements}`);
  console.log(`- Issues: ${results.inaccessibleElements}`);

  return results;
}

/**
 * Example 8: Continuous monitoring
 */
export function example8_ContinuousMonitoring(intervalMs: number = 30000) {
  console.log(
    `Example 8: Starting continuous monitoring (every ${intervalMs}ms)...\n`
  );

  const monitor = setInterval(async () => {
    console.log(
      `\n[${new Date().toISOString()}] Running accessibility check...`
    );

    const results = await runAccessibilityTests();

    if (!results.overallPassed) {
      console.warn(
        `⚠️  Accessibility issues detected: ${results.summary.criticalIssues} critical, ${results.summary.warnings} warnings`
      );
    } else {
      console.log("✓ All accessibility checks passed");
    }
  }, intervalMs);

  // Return cleanup function
  return () => {
    clearInterval(monitor);
    console.log("Continuous monitoring stopped");
  };
}

/**
 * Example 9: Integration with testing framework
 */
export async function example9_IntegrationTest() {
  console.log("Example 9: Integration test example...\n");

  const results = await runAccessibilityTests();

  // Assert tests pass
  if (!results.overallPassed) {
    throw new Error(
      `Accessibility tests failed: ${results.summary.criticalIssues} critical issues found`
    );
  }

  // Assert no critical issues
  if (results.summary.criticalIssues > 0) {
    throw new Error(
      `Found ${results.summary.criticalIssues} critical accessibility issues`
    );
  }

  // Assert keyboard navigation works
  if (!results.keyboardNavigation.overallPassed) {
    throw new Error("Keyboard navigation tests failed");
  }

  // Assert screen reader compatibility
  if (!results.screenReader.overallPassed) {
    throw new Error("Screen reader compatibility tests failed");
  }

  console.log("✓ All integration tests passed");
  return true;
}

/**
 * Example 10: Custom validation
 */
export function example10_CustomValidation() {
  console.log("Example 10: Custom validation example...\n");

  // Get all buttons
  const buttons = document.querySelectorAll("button");
  const issues: string[] = [];

  buttons.forEach((button, index) => {
    const htmlButton = button as HTMLElement;

    // Check if button has accessible name
    const hasLabel =
      htmlButton.getAttribute("aria-label") ||
      htmlButton.textContent?.trim() ||
      htmlButton.getAttribute("aria-labelledby");

    if (!hasLabel) {
      issues.push(`Button ${index + 1} missing accessible name`);
    }

    // Check if button is keyboard accessible
    const isDisabled = htmlButton.hasAttribute("disabled");
    const tabIndex = htmlButton.getAttribute("tabindex");

    if (!isDisabled && tabIndex === "-1") {
      issues.push(
        `Button ${index + 1} is not keyboard accessible (tabindex="-1")`
      );
    }
  });

  if (issues.length > 0) {
    console.log("Custom Validation Issues:");
    issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`);
    });
  } else {
    console.log("✓ All custom validations passed");
  }

  return { passed: issues.length === 0, issues };
}
