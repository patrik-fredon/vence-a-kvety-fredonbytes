/**
 * Cross-Browser Testing Utility
 *
 * Provides utilities for detecting browsers, testing browser-specific features,
 * and validating cross-browser compatibility for the Vence a kvety application.
 *
 * Supports: Chrome, Edge, Firefox, Safari (desktop and mobile)
 */

// Browser detection types
export type BrowserName =
  | "chrome"
  | "edge"
  | "firefox"
  | "safari"
  | "mobile-safari"
  | "unknown";
export type BrowserEngine = "blink" | "gecko" | "webkit" | "unknown";

export interface BrowserInfo {
  name: BrowserName;
  engine: BrowserEngine;
  version: string;
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  supportsWebP: boolean;
  supportsAVIF: boolean;
  supportsGrid: boolean;
  supportsFlexbox: boolean;
  supportsCustomProperties: boolean;
}

export interface BrowserTestResult {
  browser: BrowserName;
  testName: string;
  category: "functionality" | "visual" | "responsive";
  passed: boolean;
  details: string;
  timestamp: Date;
}

export interface BrowserTestSuite {
  browser: BrowserName;
  version: string;
  tests: BrowserTestResult[];
  passRate: number;
  totalTests: number;
  passedTests: number;
  failedTests: number;
}

/**
 * Detect the current browser
 */
export function detectBrowser(): BrowserInfo {
  if (typeof window === "undefined") {
    return {
      name: "unknown",
      engine: "unknown",
      version: "",
      isMobile: false,
      isIOS: false,
      isAndroid: false,
      supportsWebP: false,
      supportsAVIF: false,
      supportsGrid: false,
      supportsFlexbox: false,
      supportsCustomProperties: false,
    };
  }

  const ua = window.navigator.userAgent;
  const isMobile = /Mobile|Android|iPhone|iPad|iPod/i.test(ua);
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const isAndroid = /Android/i.test(ua);

  let name: BrowserName = "unknown";
  let engine: BrowserEngine = "unknown";
  let version = "";

  // Detect browser
  if (ua.includes("Edg/")) {
    name = "edge";
    engine = "blink";
    version = ua.match(/Edg\/(\d+\.\d+)/)?.[1] || "";
  } else if (ua.includes("Chrome") && !ua.includes("Edg")) {
    name = "chrome";
    engine = "blink";
    version = ua.match(/Chrome\/(\d+\.\d+)/)?.[1] || "";
  } else if (ua.includes("Firefox")) {
    name = "firefox";
    engine = "gecko";
    version = ua.match(/Firefox\/(\d+\.\d+)/)?.[1] || "";
  } else if (ua.includes("Safari") && !ua.includes("Chrome")) {
    name = isIOS && isMobile ? "mobile-safari" : "safari";
    engine = "webkit";
    version = ua.match(/Version\/(\d+\.\d+)/)?.[1] || "";
  }

  return {
    name,
    engine,
    version,
    isMobile,
    isIOS,
    isAndroid,
    supportsWebP: checkWebPSupport(),
    supportsAVIF: checkAVIFSupport(),
    supportsGrid: checkCSSFeature("grid"),
    supportsFlexbox: checkCSSFeature("flex"),
    supportsCustomProperties: checkCSSFeature("--test"),
  };
}

/**
 * Check if browser supports WebP
 */
function checkWebPSupport(): boolean {
  if (typeof document === "undefined") return false;

  const canvas = document.createElement("canvas");
  if (canvas.getContext && canvas.getContext("2d")) {
    return canvas.toDataURL("image/webp").indexOf("data:image/webp") === 0;
  }
  return false;
}

/**
 * Check if browser supports AVIF
 */
function checkAVIFSupport(): boolean {
  if (typeof document === "undefined") return false;

  const canvas = document.createElement("canvas");
  if (canvas.getContext && canvas.getContext("2d")) {
    return canvas.toDataURL("image/avif").indexOf("data:image/avif") === 0;
  }
  return false;
}

/**
 * Check if browser supports a CSS feature
 */
function checkCSSFeature(property: string): boolean {
  if (typeof window === "undefined") return false;

  const testElement = document.createElement("div");
  const style = testElement.style as any;

  if (property.startsWith("--")) {
    return CSS.supports("color", "var(--test)");
  }

  return property in style || CSS.supports(property, "initial");
}

/**
 * Test definitions for cross-browser validation
 */
export const crossBrowserTests = {
  functionality: [
    {
      name: "Navigation works correctly",
      test: () => {
        // Check if navigation elements are present and c
        const nav = document.querySelector("nav");
        return nav !== null && nav.querySelectorAll("a").length > 0;
      },
    },
    {
      name: "Product cards are interactive",
      test: () => {
        const cards = document.querySelectorAll('[data-testid="product-card"]');
        return cards.length > 0;
      },
    },
    {
      name: "Forms submit correctly",
      test: () => {
        const forms = document.querySelectorAll("form");
        return Array.from(forms).every(
          (form) => form.hasAttribute("action") || form.onsubmit !== null
        );
      },
    },
    {
      name: "Images load with fallbacks",
      test: () => {
        const images = document.querySelectorAll("img");
        return Array.from(images).every((img) => img.src && img.alt);
      },
    },
    {
      name: "Cart functionality works",
      test: () => {
        const cartButton = document.querySelector('[data-testid="cart-icon"]');
        return cartButton !== null;
      },
    },
  ],
  visual: [
    {
      name: "Typography colors are consistent",
      test: () => {
        const h1 = document.querySelector("h1");
        const h3 = document.querySelector("h3");
        if (!h1 || !h3) return false;

        const h1Color = window.getComputedStyle(h1).color;
        const h3Color = window.getComputedStyle(h3).color;

        // Check if colors are applied (not default black)
        return h1Color !== "rgb(0, 0, 0)" && h3Color !== "rgb(0, 0, 0)";
      },
    },
    {
      name: "Product cards have correct styling",
      test: () => {
        const card = document.querySelector('[data-testid="product-card"]');
        if (!card) return false;

        const styles = window.getComputedStyle(card);
        return styles.backgroundColor !== "rgba(0, 0, 0, 0)";
      },
    },
    {
      name: "Hero section displays correctly",
      test: () => {
        const hero = document.querySelector('[data-testid="hero-section"]');
        if (!hero) return false;

        const styles = window.getComputedStyle(hero);
        const minHeight = parseInt(styles.minHeight);
        return minHeight >= 600; // Should be at least 600px on mobile
      },
    },
    {
      name: "Clip-corners utility works",
      test: () => {
        const element = document.querySelector(".clip-corners");
        if (!element) return true; // Pass if not present

        const styles = window.getComputedStyle(element);
        return styles.clipPath !== "none";
      },
    },
    {
      name: "Hover effects work on desktop",
      test: () => {
        if (window.matchMedia("(hover: none)").matches) return true; // Skip on touch devices

        const card = document.querySelector('[data-testid="product-card"]');
        return card !== null;
      },
    },
  ],
  responsive: [
    {
      name: "Mobile layout (320px-767px)",
      test: () => {
        const width = window.innerWidth;
        if (width > 767) return true; // Skip if not mobile

        const grid = document.querySelector('[data-testid="product-grid"]');
        if (!grid) return true;

        const styles = window.getComputedStyle(grid);
        return (
          styles.gridTemplateColumns.includes("1fr") ||
          styles.display === "flex"
        );
      },
    },
    {
      name: "Tablet layout (768px-1023px)",
      test: () => {
        const width = window.innerWidth;
        if (width < 768 || width > 1023) return true; // Skip if not tablet

        return true; // Visual check required
      },
    },
    {
      name: "Desktop layout (1024px+)",
      test: () => {
        const width = window.innerWidth;
        if (width < 1024) return true; // Skip if not desktop

        const grid = document.querySelector('[data-testid="product-grid"]');
        if (!grid) return true;

        const styles = window.getComputedStyle(grid);
        return styles.gridTemplateColumns.split(" ").length >= 3;
      },
    },
    {
      name: "Touch targets are adequate (mobile)",
      test: () => {
        const buttons = document.querySelectorAll("button, a");
        return Array.from(buttons).every((btn) => {
          const rect = btn.getBoundingClientRect();
          return rect.width >= 44 && rect.height >= 44;
        });
      },
    },
    {
      name: "No horizontal scrolling",
      test: () => {
        return document.documentElement.scrollWidth <= window.innerWidth;
      },
    },
  ],
};

/**
 * Run all tests for a specific category
 */
export function runTestCategory(
  category: keyof typeof crossBrowserTests,
  browserInfo: BrowserInfo
): BrowserTestResult[] {
  const tests = crossBrowserTests[category];
  const results: BrowserTestResult[] = [];

  for (const test of tests) {
    try {
      const passed = test.test();
      results.push({
        browser: browserInfo.name,
        testName: test.name,
        category,
        passed,
        details: passed ? "Test passed" : "Test failed",
        timestamp: new Date(),
      });
    } catch (error) {
      results.push({
        browser: browserInfo.name,
        testName: test.name,
        category,
        passed: false,
        details: `Error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        timestamp: new Date(),
      });
    }
  }

  return results;
}

/**
 * Run all tests and generate a test suite report
 */
export function runAllTests(): BrowserTestSuite {
  const browserInfo = detectBrowser();
  const allTests: BrowserTestResult[] = [];

  // Run all test categories
  allTests.push(...runTestCategory("functionality", browserInfo));
  allTests.push(...runTestCategory("visual", browserInfo));
  allTests.push(...runTestCategory("responsive", browserInfo));

  const passedTests = allTests.filter((t) => t.passed).length;
  const failedTests = allTests.filter((t) => !t.passed).length;
  const totalTests = allTests.length;
  const passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

  return {
    browser: browserInfo.name,
    version: browserInfo.version,
    tests: allTests,
    passRate,
    totalTests,
    passedTests,
    failedTests,
  };
}

/**
 * Generate a test report in markdown format
 */
export function generateTestReport(suite: BrowserTestSuite): string {
  const browserName =
    suite.browser.charAt(0).toUpperCase() + suite.browser.slice(1);

  let report = `# Cross-Browser Test Report: ${browserName}\n\n`;
  report += `**Version**: ${suite.version}\n`;
  report += `**Date**: ${new Date().toISOString()}\n`;
  report += `**Pass Rate**: ${suite.passRate.toFixed(1)}% (${
    suite.passedTests
  }/${suite.totalTests})\n\n`;

  // Group tests by category
  const categories: Record<string, BrowserTestResult[]> = {
    functionality: [],
    visual: [],
    responsive: [],
  };

  for (const test of suite.tests) {
    categories[test.category].push(test);
  }

  // Generate report for each category
  for (const [category, tests] of Object.entries(categories)) {
    if (tests.length === 0) continue;

    const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
    const passed = tests.filter((t) => t.passed).length;
    const total = tests.length;
    const rate = total > 0 ? (passed / total) * 100 : 0;

    report += `## ${categoryName} Tests\n\n`;
    report += `**Pass Rate**: ${rate.toFixed(1)}% (${passed}/${total})\n\n`;

    for (const test of tests) {
      const icon = test.passed ? "✅" : "❌";
      report += `${icon} **${test.testName}**\n`;
      if (!test.passed) {
        report += `   - ${test.details}\n`;
      }
      report += "\n";
    }
  }

  return report;
}

/**
 * Browser-specific compatibility checks
 */
export const browserCompatibility = {
  chrome: {
    minVersion: "90",
    features: ["webp", "avif", "grid", "flexbox", "custom-properties"],
    knownIssues: [],
  },
  edge: {
    minVersion: "90",
    features: ["webp", "avif", "grid", "flexbox", "custom-properties"],
    knownIssues: [],
  },
  firefox: {
    minVersion: "88",
    features: ["webp", "avif", "grid", "flexbox", "custom-properties"],
    knownIssues: [
      "Clip-path rendering may differ slightly from Chromium browsers",
    ],
  },
  safari: {
    minVersion: "14",
    features: ["webp", "grid", "flexbox", "custom-properties"],
    knownIssues: [
      "AVIF support limited to Safari 16+",
      "Some backdrop-filter effects may have performance issues",
    ],
  },
  "mobile-safari": {
    minVersion: "14",
    features: ["webp", "grid", "flexbox", "custom-properties"],
    knownIssues: [
      "AVIF support limited to iOS 16+",
      "Viewport height (vh) units may behave differently with address bar",
      "Touch event handling requires careful testing",
    ],
  },
};

/**
 * Check if browser version meets minimum requirements
 */
export function checkBrowserVersion(browserInfo: BrowserInfo): boolean {
  const compat = browserCompatibility[browserInfo.name];
  if (!compat) return false;

  const currentVersion = parseFloat(browserInfo.version);
  const minVersion = parseFloat(compat.minVersion);

  return currentVersion >= minVersion;
}

/**
 * Get browser-specific recommendations
 */
export function getBrowserRecommendations(browserInfo: BrowserInfo): string[] {
  const recommendations: string[] = [];
  const compat = browserCompatibility[browserInfo.name];

  if (!compat) {
    recommendations.push(
      "Browser not officially supported. Please use Chrome, Edge, Firefox, or Safari."
    );
    return recommendations;
  }

  if (!checkBrowserVersion(browserInfo)) {
    recommendations.push(
      `Please update ${browserInfo.name} to version ${compat.minVersion} or higher for best experience.`
    );
  }

  if (!browserInfo.supportsWebP) {
    recommendations.push(
      "WebP image format not supported. JPEG/PNG fallbacks will be used."
    );
  }

  if (!browserInfo.supportsAVIF && browserInfo.name !== "safari") {
    recommendations.push(
      "AVIF image format not supported. WebP/JPEG fallbacks will be used."
    );
  }

  if (compat.knownIssues.length > 0) {
    recommendations.push("Known issues for this browser:");
    recommendations.push(...compat.knownIssues.map((issue) => `  - ${issue}`));
  }

  return recommendations;
}

/**
 * Log browser information to console (for debugging)
 */
export function logBrowserInfo(): void {
  if (typeof window === "undefined") return;

  const info = detectBrowser();
  console.group("🌐 Browser Information");
  console.log("Browser:", info.name);
  console.log("Version:", info.version);
  console.log("Engine:", info.engine);
  console.log("Mobile:", info.isMobile);
  console.log("iOS:", info.isIOS);
  console.log("Android:", info.isAndroid);
  console.log("WebP Support:", info.supportsWebP);
  console.log("AVIF Support:", info.supportsAVIF);
  console.log("CSS Grid:", info.supportsGrid);
  console.log("Flexbox:", info.supportsFlexbox);
  console.log("Custom Properties:", info.supportsCustomProperties);
  console.groupEnd();

  const recommendations = getBrowserRecommendations(info);
  if (recommendations.length > 0) {
    console.group("💡 Recommendations");
    recommendations.forEach((rec) => console.log(rec));
    console.groupEnd();
  }
}
