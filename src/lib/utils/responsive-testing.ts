/**
 * Responsive Testing Utility
 *
 * This utility provides functions to test and validate responsive design
 * across different breakpoints for the Vence a kvety refactor project.
 *
 * Breakpoints:
 * - Mobile: 320px - 767px
 * - Tablet: 768px - 1023px
 * - Desktop: 1024px+
 */

export interface ResponsiveBreakpoint {
  name: string;
  minWidth: number;
  maxWidth?: number;
  description: string;
}

export const BREAKPOINTS: Record<string, ResponsiveBreakpoint> = {
  mobile: {
    name: "Mobile",
    minWidth: 320,
    maxWidth: 767,
    description: "Mobile devices (320px-767px)",
  },
  tablet: {
    name: "Tablet",
    minWidth: 768,
    maxWidth: 1023,
    description: "Tablet devices (768px-1023px)",
  },
  desktop: {
    name: "Desktop",
    minWidth: 1024,
    description: "Desktop devices (1024px+)",
  },
  largeDesktop: {
    name: "Large Desktop",
    minWidth: 1920,
    description: "Large desktop monitors (1920px+)",
  },
  extraLargeDesktop: {
    name: "Extra Large Desktop",
    minWidth: 2560,
    description: "Extra large monitors (2560px+)",
  },
};

export interface ComponentResponsiveTest {
  component: string;
  breakpoint: string;
  expectedBehavior: string[];
  testCriteria: string[];
}

/**
 * Responsive test definitions for refactored components
 */
export const RESPONSIVE_TESTS: ComponentResponsiveTest[] = [
  // Hero Section Tests
  {
    component: "RefactoredHeroSection",
    breakpoint: "mobile",
    expectedBehavior: [
      "min-h-[600px] height applied",
      "Logo width: w-56 (224px)",
      "Heading: text-2xl (24px)",
      "Subheading: text-base (16px)",
      "CTA button: px-6 py-3",
      "Padding: px-3 py-12",
    ],
    testCriteria: [
      "Hero section is visible and takes up appropriate viewport height",
      "Logo is clearly visible and properly sized",
      "Text is readable and properly sized",
      "CTA button is easily tappable (min 44x44px)",
      "No horizontal scrolling",
      "Content is centered",
    ],
  },
  {
    component: "RefactoredHeroSection",
    breakpoint: "tablet",
    expectedBehavior: [
      "md:min-h-[700px] height applied",
      "Logo width: md:w-80 (320px)",
      "Heading: md:text-5xl (48px)",
      "Subheading: md:text-2xl (24px)",
      "CTA button: md:px-10 md:py-5",
      "Padding: md:px-8 md:py-20",
    ],
    testCriteria: [
      "Hero section height increased for better impact",
      "Logo is larger and more prominent",
      "Typography scales appropriately",
      "Touch targets are adequate",
      "Layout adapts smoothly",
    ],
  },
  {
    component: "RefactoredHeroSection",
    breakpoint: "desktop",
    expectedBehavior: [
      "lg:min-h-[750px] height applied",
      "xl:min-h-[800px] on large screens",
      "Logo width: lg:w-96 (384px), xl:w-[28rem] (448px)",
      "Heading: lg:text-6xl (60px), xl:text-7xl (72px)",
      "Subheading: lg:text-3xl (30px), xl:text-4xl (36px)",
      "CTA button: lg:px-12 lg:py-6, xl:px-14 xl:py-7",
      "Padding: lg:px-12 lg:py-24, xl:px-16",
    ],
    testCriteria: [
      "Hero section fills viewport appropriately",
      "Logo is prominently displayed",
      "Typography is impactful and readable",
      "CTA button is prominent",
      "Proper use of whitespace",
      "Content is well-balanced",
    ],
  },
  // Product Card Tests
  {
    component: "ProductCard",
    breakpoint: "mobile",
    expectedBehavior: [
      "h-96 (384px) height maintained",
      "bg-teal-800 background applied",
      "clip-corners utility applied",
      "Info overlay: bg-amber-100/95",
      "Single column grid layout",
    ],
    testCriteria: [
      "Card is fully visible",
      "Image loads correctly",
      "Text is readable",
      "Hover states work (if applicable)",
      "Card maintains aspect ratio",
      "Cut corners are visible",
    ],
  },
  {
    component: "ProductCard",
    breakpoint: "tablet",
    expectedBehavior: [
      "h-96 height maintained",
      "bg-teal-800 background applied",
      "clip-corners utility applied",
      "2-column grid layout",
    ],
    testCriteria: [
      "Cards display in 2-column grid",
      "Spacing between cards is appropriate",
      "Touch interactions work smoothly",
      "Images load efficiently",
    ],
  },
  {
    component: "ProductCard",
    breakpoint: "desktop",
    expectedBehavior: [
      "h-96 height maintained",
      "bg-teal-800 background applied",
      "clip-corners utility applied",
      "4-column grid layout",
      "Hover effects: hover:-translate-y-1 hover:shadow-xl",
    ],
    testCriteria: [
      "Cards display in 4-column grid",
      "Hover effects are smooth",
      "Images are sharp and clear",
      "Layout is balanced",
    ],
  },
  // Product Detail Layout Tests
  {
    component: "ProductDetailImageGrid",
    breakpoint: "mobile",
    expectedBehavior: [
      "Single column layout",
      "Main image: aspect-square",
      "Thumbnails: grid-cols-2",
      "No height restrictions",
      "Images stack naturally",
    ],
    testCriteria: [
      "Main image is prominently displayed",
      "Thumbnails are visible and tappable",
      "No excessive scrolling within image container",
      "Images load progressively",
    ],
  },
  {
    component: "ProductDetailImageGrid",
    breakpoint: "tablet",
    expectedBehavior: [
      "Single column layout",
      "Main image: aspect-square",
      "Thumbnails: sm:grid-cols-3",
      "Larger images for better viewing",
    ],
    testCriteria: [
      "Images are larger and clearer",
      "Thumbnail grid adapts to 3 columns",
      "Touch interactions are smooth",
    ],
  },
  {
    component: "ProductDetailImageGrid",
    breakpoint: "desktop",
    expectedBehavior: [
      "Two-column layout (lg:grid-cols-2)",
      "Images on left, info on right",
      "Thumbnails: md:grid-cols-4",
      "No height restrictions - all photos visible",
      "Right column sticky",
    ],
    testCriteria: [
      "All product images visible without scrolling in image container",
      "Two-column layout is balanced",
      "Sticky sidebar works correctly",
      "Images expand to fill available space",
    ],
  },
  // About Page Tests
  {
    component: "AboutPage",
    breakpoint: "mobile",
    expectedBehavior: [
      "Hero image: h-64 (256px)",
      "Logo: w-48 (192px)",
      "Single column layout (grid-cols-1)",
      "Gold-outlined cards in single column",
    ],
    testCriteria: [
      "Hero image is appropriately sized",
      "Logo is visible and clear",
      "Content is readable",
      "Cards stack vertically",
      "No horizontal scrolling",
    ],
  },
  {
    component: "AboutPage",
    breakpoint: "tablet",
    expectedBehavior: [
      "Hero image: md:h-80 (320px)",
      "Logo: md:w-64 (256px)",
      "Two-column grid (md:grid-cols-2)",
      "Gold-outlined cards adapt to grid",
    ],
    testCriteria: [
      "Hero image is larger",
      "Logo scales appropriately",
      "Two-column grid is balanced",
      "Cards display side by side",
    ],
  },
  {
    component: "AboutPage",
    breakpoint: "desktop",
    expectedBehavior: [
      "Hero image: lg:h-96 (384px)",
      "Logo: lg:w-72 (288px)",
      "Three-column grid (lg:grid-cols-3)",
      "Gold-outlined cards in 3-column layout",
    ],
    testCriteria: [
      "Hero image is full size",
      "Logo is prominently displayed",
      "Three-column grid is well-balanced",
      "Cards display in row of three",
      "Proper use of whitespace",
    ],
  },
];

/**
 * Get tests for a specific component
 */
export function getTestsForComponent(componentName: string): ComponentResponsiveTest[] {
  return RESPONSIVE_TESTS.filter((test) => test.component === componentName);
}

/**
 * Get tests for a specific breakpoint
 */
export function getTestsForBreakpoint(breakpointName: string): ComponentResponsiveTest[] {
  return RESPONSIVE_TESTS.filter((test) => test.breakpoint === breakpointName);
}

/**
 * Generate a test report for a component at a specific breakpoint
 */
export function generateTestReport(
  component: string,
  breakpoint: string,
  results: { criterion: string; passed: boolean; notes?: string }[]
): string {
  const test = RESPONSIVE_TESTS.find(
    (t) => t.component === component && t.breakpoint === breakpoint
  );

  if (!test) {
    return `No test found for ${component} at ${breakpoint}`;
  }

  const passedCount = results.filter((r) => r.passed).length;
  const totalCount = results.length;
  const passRate = (passedCount / totalCount) * 100;

  let report = `\n## ${component} - ${BREAKPOINTS[breakpoint]?.name || breakpoint}\n\n`;
  report += `**Pass Rate:** ${passedCount}/${totalCount} (${passRate.toFixed(1)}%)\n\n`;
  report += `### Expected Behavior\n`;
  test.expectedBehavior.forEach((behavior) => {
    report += `- ${behavior}\n`;
  });
  report += `\n### Test Results\n`;
  results.forEach((result) => {
    const status = result.passed ? "✅" : "❌";
    report += `${status} ${result.criterion}`;
    if (result.notes) {
      report += ` - ${result.notes}`;
    }
    report += "\n";
  });

  return report;
}

/**
 * Validate responsive classes are present in component
 */
export function validateResponsiveClasses(
  componentCode: string,
  expectedClasses: string[]
): { valid: boolean; missing: string[] } {
  const missing = expectedClasses.filter((cls) => !componentCode.includes(cls));
  return {
    valid: missing.length === 0,
    missing,
  };
}
