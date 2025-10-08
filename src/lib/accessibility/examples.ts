/**
 * Accessibility Testing Examples
 * Demonstrates how to use the accessibility testing utilities
 *
 * Note: These examples are currently disabled as they depend on a test-runner
 * module that needs to be implemented. They serve as documentation for future
 * accessibility testing implementation.
 */

/**
 * Example 1: Run all accessibility tests
 */
export async function example1_RunAllTests() {
  console.log("Example 1: Running all accessibility tests...\n");
  console.warn("Accessibility test runner not yet implemented");
  return null;
}

/**
 * Example 2: Test keyboard navigation only
 */
export function example2_TestKeyboardOnly() {
  console.log("Example 2: Testing keyboard navigation...\n");
  console.warn("Accessibility test runner not yet implemented");
  return null;
}

/**
 * Example 3: Test focus indicators
 */
export function example3_TestFocusIndicators() {
  console.log("Example 3: Testing focus indicators...\n");
  console.warn("Accessibility test runner not yet implemented");
  return null;
}

/**
 * Example 4: Test screen reader compatibility
 */
export function example4_TestScreenReader() {
  console.log("Example 4: Testing screen reader compatibility...\n");
  console.warn("Accessibility test runner not yet implemented");
  return null;
}

/**
 * Example 5: Test semantic HTML structure
 */
export function example5_TestSemanticHTML() {
  console.log("Example 5: Testing semantic HTML structure...\n");
  console.warn("Accessibility test runner not yet implemented");
  return null;
}

/**
 * Example 6: Test ARIA labels
 */
export function example6_TestARIALabels() {
  console.log("Example 6: Testing ARIA labels...\n");
  console.warn("Accessibility test runner not yet implemented");
  return null;
}

/**
 * Example 7: Test specific container
 */
export function example7_TestSpecificContainer(containerId: string) {
  console.log(`Example 7: Testing container #${containerId}...\n`);
  console.warn("Accessibility test runner not yet implemented");
  return null;
}

/**
 * Example 8: Continuous monitoring
 */
export function example8_ContinuousMonitoring(intervalMs: number = 30000) {
  console.log(`Example 8: Starting continuous monitoring (every ${intervalMs}ms)...\n`);
  console.warn("Accessibility test runner not yet implemented");

  // Return cleanup function
  return () => {
    console.log("Continuous monitoring stopped");
  };
}

/**
 * Example 9: Integration with testing framework
 */
export async function example9_IntegrationTest() {
  console.log("Example 9: Integration test example...\n");
  console.warn("Accessibility test runner not yet implemented");
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

  buttons.forEach((button, buttonIndex) => {
    const htmlButton = button as HTMLElement;

    // Check if button has accessible name
    const hasLabel =
      htmlButton.getAttribute("aria-label") ||
      htmlButton.textContent?.trim() ||
      htmlButton.getAttribute("aria-labelledby");

    if (!hasLabel) {
      issues.push(`Button ${buttonIndex + 1} missing accessible name`);
    }

    // Check if button is keyboard accessible
    const isDisabled = htmlButton.hasAttribute("disabled");
    const tabIndex = htmlButton.getAttribute("tabindex");

    if (!isDisabled && tabIndex === "-1") {
      issues.push(`Button ${buttonIndex + 1} is not keyboard accessible (tabindex="-1")`);
    }
  });

  if (issues.length > 0) {
    console.log("Custom Validation Issues:");
    issues.forEach((issue, issueIndex) => {
      console.log(`${issueIndex + 1}. ${issue}`);
    });
  } else {
    console.log("✓ All custom validations passed");
  }

  return { passed: issues.length === 0, issues };
}
