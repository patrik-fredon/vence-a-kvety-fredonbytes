# Accessibility Testing Suite

This directory contains comprehensive accessibility testing utilities for the Vence a kvety e-commerce platform.

## Overview

The accessibility testing suite validates WCAG 2.1 AA compliance across two main areas:

1. **Keyboard Navigation** (Task 9.1)

   - Verifies all interactive elements are keyboard accessible
   - Tests tab order
   - Checks focus indicators

2. **Screen Reader Compatibility** (Task 9.2)
   - Validates ARIA labels are meaningful
   - Tests semantic HTML structure
   - Checks screen reader support

## Files

- `keyboard-navigation-test.ts` - Keyboard accessibility validation
- `screen-reader-test.ts` - Screen reader compatibility validation
- `test-runner.ts` - Test orchestration and reporting
- `validation.ts` - Core validation utilities (ARIA, keyboard, color contrast)
- `utils.ts` - Accessibility helper functions
- `hooks.ts` - React hooks for accessibility features
- `context.tsx` - Accessibility context provider

## Usage

### Browser-Based Testing (Development)

Add the `AccessibilityTestPanel` component to your development layout:

```tsx
import { AccessibilityTestPanel } from "@/components/accessibility";

export default function DevLayout({ children }) {
  return (
    <>
      {children}
      {process.env.NODE_ENV === "development" && <AccessibilityTestPanel />}
    </>
  );
}
```

The panel provides a UI to:

- Run accessibility tests on the current page
- View test results and issues
- Download reports (text and JSON formats)

### Programmatic Testing

```typescript
import {
  runAccessibilityTests,
  generateAccessibilityReport,
} from "@/lib/accessibility";

// Run tests
const results = await runAccessibilityTests();

// Generate report
const report = generateAccessibilityReport(results);
console.log(report);

// Check if tests passed
if (!results.overallPassed) {
  console.error(`Found ${results.summary.criticalIssues} critical issues`);
}
```

### CLI Testing

Run accessibility tests from the command line:

```bash
# Test localhost
npm run test:accessibility

# Test specific URL
npm run test:accessibility -- --url=http://localhost:3000/products

# Save report to file
npm run test:accessibility -- --save-report --output=report.json
```

## Test Categories

### Keyboard Navigation Tests

1. **Keyboard Accessibility Test**

   - Validates all interactive elements can receive keyboard focus
   - Checks for proper tabindex usage
   - Identifies elements with click handlers but no keyboard support

2. **Focus Indicator Test**

   - Verifies all focusable elements have visible focus indicators
   - Checks outline, box-shadow, and border styles
   - Ensures focus is visible for keyboard users

3. **Tab Order Test**
   - Validates natural tab order follows DOM structure
   - Identifies problematic positive tabindex values
   - Ensures logical navigation flow

### Screen Reader Tests

1. **Screen Reader Compatibility Test**

   - Validates ARIA attributes on interactive elements
   - Checks for meaningful accessible names
   - Verifies proper ARIA roles and states

2. **Semantic HTML Test**

   - Checks for main landmark
   - Validates navigation landmarks
   - Verifies proper heading hierarchy
   - Checks for skip links

3. **ARIA Label Test**
   - Ensures all interactive elements have labels
   - Validates label sources (aria-label, aria-labelledby, etc.)
   - Checks label meaningfulness

## Test Results

Test results include:

```typescript
{
  timestamp: string;
  url: string;
  overallPassed: boolean;
  summary: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    totalIssues: number;
    criticalIssues: number;
    warnings: number;
  }
  keyboardNavigation: {
    /* detailed results */
  }
  screenReader: {
    /* detailed results */
  }
}
```

## Integration with CI/CD

Add to your CI pipeline:

```yaml
# .github/workflows/accessibility.yml
name: Accessibility Tests

on: [push, pull_request]

jobs:
  a11y:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run build
      - run: npm run start &
      - run: sleep 10
      - run: npm run test:accessibility
```

## Best Practices

1. **Run tests regularly** during development
2. **Fix critical issues** before merging
3. **Address warnings** to improve accessibility
4. **Test with real assistive technology** (NVDA, JAWS, VoiceOver)
5. **Include accessibility tests** in your CI/CD pipeline

## WCAG 2.1 AA Compliance

These tests validate compliance with:

- **Perceivable**: Alt text, color contrast, semantic structure
- **Operable**: Keyboard navigation, focus indicators, skip links
- **Understandable**: Clear labels, consistent navigation
- **Robust**: Valid ARIA, semantic HTML

## Requirements Mapping

- **Requirement 9.1**: Keyboard navigation tests
- **Requirement 9.2**: Screen reader compatibility tests
- **Requirement 9.5**: Semantic HTML structure validation

## Troubleshooting

### Common Issues

1. **"Interactive element is not keyboard focusable"**

   - Add `tabindex="0"` to custom interactive elements
   - Ensure buttons use `<button>` tag, not `<div>`

2. **"Missing accessible label"**

   - Add `aria-label` or `aria-labelledby`
   - Use associated `<label>` for form inputs
   - Add `alt` text to images

3. **"Positive tabindex detected"**

   - Remove positive tabindex values
   - Use natural DOM order for tab navigation
   - Use `tabindex="0"` for custom focusable elements

4. **"Missing main landmark"**
   - Wrap main content in `<main>` tag
   - Or add `role="main"` to container

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Keyboard Accessibility](https://webaim.org/techniques/keyboard/)
- [WebAIM Screen Reader Testing](https://webaim.org/articles/screenreader_testing/)

## Support

For questions or issues with the accessibility testing suite, please contact the development team or refer to the project documentation.
