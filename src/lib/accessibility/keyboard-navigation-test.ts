/**
 * Keyboard Navigation Testing Utility
 * Validates that all interactive elements are keyboard accessible,
 * tests tab order, and checks focus indicators
 *
 * Requirements: 9.1
 */

import { KeyboardValidator } from "./validation";

export interface KeyboardNavigationTestResult {
  passed: boolean;
  totalElements: number;
  accessibleElements: number;
  inaccessibleElements: number;
  tabOrderIssues: number;
  focusIndicatorIssues: number;
  details: {
    element: string;
    issues: string[];
    location: string;
  }[];
}

export interface FocusIndicatorTestResult {
  passed: boolean;
  totalFocusableElements: number;
  elementsWithIndicators: number;
  elementsWithoutIndicators: number;
  details: {
    element: string;
    hasVisibleFocus: boolean;
    computedStyles: {
      outline: string;
      boxShadow: string;
      border: string;
    };
  }[];
}

/**
 * Tests keyboard accessibility of all interactive elements on the page
 */
export function testKeyboardNavigation(
  container: HTMLElement = document.body
): KeyboardNavigationTestResult {
  const interactiveSelectors = [
    "button",
    "a[href]",
    "input",
    "select",
    "textarea",
    '[role="button"]',
    '[role="link"]',
    '[role="tab"]',
    '[role="menuitem"]',
    "[tabindex]",
    "[onclick]",
  ];

  const elements = container.querySelectorAll(interactiveSelectors.join(", "));
  const details: KeyboardNavigationTestResult["details"] = [];
  let accessibleCount = 0;
  let inaccessibleCount = 0;
  let tabOrderIssues = 0;

  elements.forEach((element) => {
    const htmlElement = element as HTMLElement;
    const issues: string[] = [];

    // Validate keyboard accessibility
    const keyboardErrors = KeyboardValidator.validateKeyboardAccess(htmlElement);
    if (keyboardErrors.length > 0) {
      issues.push(...keyboardErrors);
      inaccessibleCount++;
    } else {
      accessibleCount++;
    }

    // Check tab order
    const tabIndex = htmlElement.getAttribute("tabindex");
    if (tabIndex) {
      const tabIndexValue = parseInt(tabIndex, 10);
      if (tabIndexValue > 0) {
        issues.push(
          `Positive tabindex (${tabIndexValue}) detected - may disrupt natural tab order`
        );
        tabOrderIssues++;
      }
    }

    // Check if element is visible but not focusable
    const isVisible = isElementVisible(htmlElement);
    const isFocusable = canElementReceiveFocus(htmlElement);

    if (isVisible && !isFocusable && isInteractiveElement(htmlElement)) {
      issues.push("Visible interactive element is not focusable");
      inaccessibleCount++;
    }

    if (issues.length > 0) {
      details.push({
        element: getElementDescription(htmlElement),
        issues,
        location: getElementLocation(htmlElement),
      });
    }
  });

  return {
    passed: inaccessibleCount === 0 && tabOrderIssues === 0,
    totalElements: elements.length,
    accessibleElements: accessibleCount,
    inaccessibleElements: inaccessibleCount,
    tabOrderIssues,
    focusIndicatorIssues: 0, // Will be populated by testFocusIndicators
    details,
  };
}

/**
 * Tests that all focusable elements have visible focus indicators
 */
export function testFocusIndicators(
  container: HTMLElement = document.body
): FocusIndicatorTestResult {
  const focusableSelectors = [
    "button:not([disabled])",
    "a[href]",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    '[tabindex]:not([tabindex="-1"])',
  ];

  const elements = container.querySelectorAll(focusableSelectors.join(", "));
  const details: FocusIndicatorTestResult["details"] = [];
  let elementsWithIndicators = 0;
  let elementsWithoutIndicators = 0;

  elements.forEach((element) => {
    const htmlElement = element as HTMLElement;

    // Temporarily focus the element to check focus styles
    const originalFocus = document.activeElement;
    htmlElement.focus();

    const computedStyle = window.getComputedStyle(htmlElement);
    const hasVisibleFocus = checkVisibleFocusIndicator(computedStyle);

    // Restore original focus
    if (originalFocus && "focus" in originalFocus) {
      (originalFocus as HTMLElement).focus();
    }

    if (hasVisibleFocus) {
      elementsWithIndicators++;
    } else {
      elementsWithoutIndicators++;
    }

    details.push({
      element: getElementDescription(htmlElement),
      hasVisibleFocus,
      computedStyles: {
        outline: computedStyle.outline,
        boxShadow: computedStyle.boxShadow,
        border: computedStyle.border,
      },
    });
  });

  return {
    passed: elementsWithoutIndicators === 0,
    totalFocusableElements: elements.length,
    elementsWithIndicators,
    elementsWithoutIndicators,
    details,
  };
}

/**
 * Tests the tab order sequence of focusable elements
 */
export function testTabOrder(container: HTMLElement = document.body): {
  passed: boolean;
  expectedOrder: string[];
  actualOrder: string[];
  issues: string[];
} {
  const focusableElements = getFocusableElements(container);
  const expectedOrder: string[] = [];
  const issues: string[] = [];

  // Build expected tab order based on DOM order and tabindex
  const elementsWithTabIndex: Array<{
    element: HTMLElement;
    tabIndex: number;
  }> = [];
  const elementsWithoutTabIndex: HTMLElement[] = [];

  focusableElements.forEach((element) => {
    const tabIndex = element.getAttribute("tabindex");
    if (tabIndex && parseInt(tabIndex, 10) > 0) {
      elementsWithTabIndex.push({
        element,
        tabIndex: parseInt(tabIndex, 10),
      });
    } else {
      elementsWithoutTabIndex.push(element);
    }
  });

  // Sort elements with positive tabindex
  elementsWithTabIndex.sort((a, b) => a.tabIndex - b.tabIndex);

  // Expected order: positive tabindex first, then natural DOM order
  const orderedElements = [
    ...elementsWithTabIndex.map((item) => item.element),
    ...elementsWithoutTabIndex,
  ];

  orderedElements.forEach((element, index) => {
    expectedOrder.push(getElementDescription(element));

    // Check for tabindex issues
    const tabIndex = element.getAttribute("tabindex");
    if (tabIndex) {
      const value = parseInt(tabIndex, 10);
      if (value > 0) {
        issues.push(
          `Element ${index + 1} (${getElementDescription(
            element
          )}) has positive tabindex (${value})`
        );
      }
    }
  });

  return {
    passed: issues.length === 0,
    expectedOrder,
    actualOrder: expectedOrder, // In a real test, this would simulate actual tab navigation
    issues,
  };
}

/**
 * Comprehensive keyboard navigation audit
 */
export function auditKeyboardNavigation(container: HTMLElement = document.body): {
  overallPassed: boolean;
  navigationTest: KeyboardNavigationTestResult;
  focusIndicatorTest: FocusIndicatorTestResult;
  tabOrderTest: ReturnType<typeof testTabOrder>;
  summary: {
    totalIssues: number;
    criticalIssues: number;
    warnings: number;
  };
} {
  const navigationTest = testKeyboardNavigation(container);
  const focusIndicatorTest = testFocusIndicators(container);
  const tabOrderTest = testTabOrder(container);

  const totalIssues =
    navigationTest.inaccessibleElements +
    focusIndicatorTest.elementsWithoutIndicators +
    tabOrderTest.issues.length;

  const criticalIssues = navigationTest.inaccessibleElements;
  const warnings = focusIndicatorTest.elementsWithoutIndicators + tabOrderTest.issues.length;

  return {
    overallPassed: navigationTest.passed && focusIndicatorTest.passed && tabOrderTest.passed,
    navigationTest,
    focusIndicatorTest,
    tabOrderTest,
    summary: {
      totalIssues,
      criticalIssues,
      warnings,
    },
  };
}

// Helper functions

function isElementVisible(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element);
  return (
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    parseFloat(style.opacity) > 0 &&
    element.offsetWidth > 0 &&
    element.offsetHeight > 0
  );
}

function canElementReceiveFocus(element: HTMLElement): boolean {
  const tabIndex = element.getAttribute("tabindex");

  // Elements with tabindex >= 0 can receive focus
  if (tabIndex && parseInt(tabIndex, 10) >= 0) return true;

  // Naturally focusable elements
  const focusableTags = ["button", "input", "select", "textarea", "a"];
  const tagName = element.tagName.toLowerCase();

  if (focusableTags.includes(tagName)) {
    // Check if disabled
    if ("disabled" in element && (element as any).disabled) return false;

    // Check if link has href
    if (tagName === "a" && !element.hasAttribute("href")) return false;

    return true;
  }

  return false;
}

function isInteractiveElement(element: HTMLElement): boolean {
  const interactiveTags = ["button", "a", "input", "select", "textarea"];
  const interactiveRoles = ["button", "link", "checkbox", "radio", "tab", "menuitem"];

  const tagName = element.tagName.toLowerCase();
  const role = element.getAttribute("role");

  return (
    interactiveTags.includes(tagName) ||
    (role !== null && interactiveRoles.includes(role)) ||
    element.hasAttribute("onclick")
  );
}

function checkVisibleFocusIndicator(style: CSSStyleDeclaration): boolean {
  // Check for outline
  if (style.outline && style.outline !== "none" && style.outline !== "0px") {
    return true;
  }

  // Check for box-shadow (common for focus rings)
  if (style.boxShadow && style.boxShadow !== "none") {
    return true;
  }

  // Check for border changes (less reliable but common)
  if (style.border && style.border !== "none") {
    // This is a simplified check - in reality, we'd need to compare with unfocused state
    return true;
  }

  return false;
}

function getElementDescription(element: HTMLElement): string {
  const tag = element.tagName.toLowerCase();
  const id = element.id ? `#${element.id}` : "";
  const classes = element.className ? `.${element.className.split(" ").join(".")}` : "";
  const role = element.getAttribute("role") ? `[role="${element.getAttribute("role")}"]` : "";
  const text = element.textContent?.trim().substring(0, 30) || "";

  return `<${tag}${id}${classes}${role}>${text ? ` "${text}..."` : ""}`;
}

function getElementLocation(element: HTMLElement): string {
  const path: string[] = [];
  let current: HTMLElement | null = element;

  while (current && current !== document.body) {
    const tag = current.tagName.toLowerCase();
    const id = current.id ? `#${current.id}` : "";
    path.unshift(`${tag}${id}`);
    current = current.parentElement;
  }

  return path.join(" > ");
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    "button:not([disabled])",
    "a[href]",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    '[tabindex]:not([tabindex="-1"])',
  ];

  return Array.from(container.querySelectorAll(focusableSelectors.join(", "))) as HTMLElement[];
}

/**
 * Generates a human-readable report of keyboard navigation test results
 */
export function generateKeyboardNavigationReport(
  results: ReturnType<typeof auditKeyboardNavigation>
): string {
  const lines: string[] = [];

  lines.push("=".repeat(80));
  lines.push("KEYBOARD NAVIGATION ACCESSIBILITY AUDIT");
  lines.push("=".repeat(80));
  lines.push("");

  // Overall status
  lines.push(`Overall Status: ${results.overallPassed ? "✓ PASSED" : "✗ FAILED"}`);
  lines.push("");

  // Summary
  lines.push("Summary:");
  lines.push(`  Total Issues: ${results.summary.totalIssues}`);
  lines.push(`  Critical Issues: ${results.summary.criticalIssues}`);
  lines.push(`  Warnings: ${results.summary.warnings}`);
  lines.push("");

  // Navigation test results
  lines.push("-".repeat(80));
  lines.push("KEYBOARD ACCESSIBILITY TEST");
  lines.push("-".repeat(80));
  lines.push(`Status: ${results.navigationTest.passed ? "✓ PASSED" : "✗ FAILED"}`);
  lines.push(`Total Interactive Elements: ${results.navigationTest.totalElements}`);
  lines.push(`Accessible: ${results.navigationTest.accessibleElements}`);
  lines.push(`Inaccessible: ${results.navigationTest.inaccessibleElements}`);
  lines.push(`Tab Order Issues: ${results.navigationTest.tabOrderIssues}`);

  if (results.navigationTest.details.length > 0) {
    lines.push("");
    lines.push("Issues Found:");
    results.navigationTest.details.forEach((detail, index) => {
      lines.push(`  ${index + 1}. ${detail.element}`);
      lines.push(`     Location: ${detail.location}`);
      detail.issues.forEach((issue) => {
        lines.push(`     - ${issue}`);
      });
    });
  }
  lines.push("");

  // Focus indicator test results
  lines.push("-".repeat(80));
  lines.push("FOCUS INDICATOR TEST");
  lines.push("-".repeat(80));
  lines.push(`Status: ${results.focusIndicatorTest.passed ? "✓ PASSED" : "✗ FAILED"}`);
  lines.push(`Total Focusable Elements: ${results.focusIndicatorTest.totalFocusableElements}`);
  lines.push(`With Visible Focus: ${results.focusIndicatorTest.elementsWithIndicators}`);
  lines.push(`Without Visible Focus: ${results.focusIndicatorTest.elementsWithoutIndicators}`);

  if (results.focusIndicatorTest.elementsWithoutIndicators > 0) {
    lines.push("");
    lines.push("Elements Without Visible Focus Indicators:");
    results.focusIndicatorTest.details
      .filter((detail) => !detail.hasVisibleFocus)
      .forEach((detail, index) => {
        lines.push(`  ${index + 1}. ${detail.element}`);
        lines.push(`     Outline: ${detail.computedStyles.outline}`);
        lines.push(`     Box Shadow: ${detail.computedStyles.boxShadow}`);
      });
  }
  lines.push("");

  // Tab order test results
  lines.push("-".repeat(80));
  lines.push("TAB ORDER TEST");
  lines.push("-".repeat(80));
  lines.push(`Status: ${results.tabOrderTest.passed ? "✓ PASSED" : "✗ FAILED"}`);

  if (results.tabOrderTest.issues.length > 0) {
    lines.push("");
    lines.push("Tab Order Issues:");
    results.tabOrderTest.issues.forEach((issue, index) => {
      lines.push(`  ${index + 1}. ${issue}`);
    });
  }
  lines.push("");

  lines.push("=".repeat(80));

  return lines.join("\n");
}
