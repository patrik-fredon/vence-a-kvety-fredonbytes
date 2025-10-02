# Centralized Background Gradient System

## Overview

This document describes the centralized background gradient system implemented for consistent visual branding across the application.

## Gradient Definitions

Two gradient utility classes have been added to the Tailwind configuration:

### 1. Funeral Gold Gradient (`bg-funeral-gold`)

**CSS Value:** `linear-gradient(to right, #AE8625, #F7EF8A, #D2AC47)`

**Usage:** Default background for most pages (except Hero and page headers)

**Color Breakdown:**

- Start: `#AE8625` (Dark Gold)
- Middle: `#F7EF8A` (Light Gold)
- End: `#D2AC47` (Medium Gold)

**Text Recommendations:**

- Use dark text colors (e.g., `text-stone-900`, `text-stone-800`)
- Ensure WCAG AA contrast compliance

### 2. Funeral Teal Gradient (`bg-funeral-teal`)

**CSS Value:** `linear-gradient(to right, #0f766e, #14b8a6, #0d9488)`

**Usage:** Hero section and page headers (Checkout, Contact, Products, About Us)

**Color Breakdown:**

- Start: `#0f766e` (Dark Teal)
- Middle: `#14b8a6` (Bright Teal)
- End: `#0d9488` (Medium Teal)

**Text Recommendations:**

- Use light text colors (e.g., `text-white`, `text-stone-100`)
- Ensure WCAG AA contrast compliance

## Usage Examples

### Basic Usage

```tsx
// Gold gradient background
<div className="bg-funeral-gold">
  <h1 className="text-stone-900">Content with gold background</h1>
</div>

// Teal gradient background
<div className="bg-funeral-teal">
  <h1 className="text-white">Content with teal background</h1>
</div>
```

### Global Application

Apply to the body element in the root layout:

```tsx
// src/app/[locale]/layout.tsx
export default function LocaleLayout({ children }: Props) {
  return (
    <html lang={locale}>
      <body className="bg-funeral-gold">
        {children}
      </body>
    </html>
  );
}
```

### Override for Specific Sections

```tsx
// Hero section with teal background
<section className="bg-funeral-teal py-16">
  <div className="container mx-auto">
    <h1 className="text-white text-4xl">Hero Title</h1>
  </div>
</section>
```

## Testing

A test page has been created to verify gradient rendering:

**Location:** `src/app/[locale]/gradient-test/page.tsx`

**Access URLs:**

- Czech: `/cs/gradient-test`
- English: `/en/gradient-test`

**Test Component:** `src/components/test/GradientTest.tsx`

The test page displays:

1. Both gradients in isolation
2. Text readability tests
3. Side-by-side comparison

**Note:** Remove the test page and component after verification is complete.

## Implementation Checklist

- [x] Add gradient definitions to `tailwind.config.ts`
- [x] Create test component for gradient verification
- [x] Create test page for visual inspection
- [x] Document gradient usage and best practices
- [ ] Apply global gold gradient to body element
- [ ] Add teal gradient overrides to Hero section
- [ ] Add teal gradient overrides to page headers
- [ ] Remove inline gradient styles throughout codebase
- [ ] Remove test page and component after verification

## Best Practices

### Do's ✅

- Use `bg-funeral-gold` for general page backgrounds
- Use `bg-funeral-teal` for Hero sections and page headers
- Reference these utility classes instead of inline styles
- Test text contrast for accessibility
- Use consistent text colors across similar sections

### Don'ts ❌

- Don't use inline gradient styles (e.g., `bg-[linear-gradient(...)]`)
- Don't mix gradient backgrounds without purpose
- Don't use gradients that haven't been defined in the config
- Don't forget to test on different screen sizes
- Don't skip accessibility contrast checks

## Accessibility Considerations

### Color Contrast

Both gradients have been designed with text readability in mind:

- **Gold Gradient:** Use dark text (minimum contrast ratio 4.5:1)
- **Teal Gradient:** Use light text (minimum contrast ratio 4.5:1)

### Testing Tools

- Chrome DevTools Lighthouse
- WAVE Browser Extension
- Color Contrast Analyzer

### WCAG Compliance

Ensure all text on gradient backgrounds meets WCAG AA standards:

- Normal text: 4.5:1 contrast ratio
- Large text (18pt+): 3:1 contrast ratio

## Browser Compatibility

Linear gradients are supported in all modern browsers:

- Chrome 26+
- Firefox 16+
- Safari 6.1+
- Edge 12+

No fallback needed for the target browser support.

## Performance Considerations

- Gradients are CSS-based (no image files)
- No additional HTTP requests
- Minimal impact on rendering performance
- Hardware-accelerated in modern browsers

## Migration Guide

### Replacing Inline Gradients

**Before:**

```tsx
<div className="bg-[linear-gradient(to_right,_#AE8625,_#F7EF8A,_#D2AC47)]">
  Content
</div>
```

**After:**

```tsx
<div className="bg-funeral-gold">
  Content
</div>
```

### Search Pattern

To find inline gradients in the codebase:

```bash
# Search for inline gradient usage
grep -r "bg-\[linear-gradient" src/
```

## Related Files

- **Configuration:** `tailwind.config.ts`
- **Test Component:** `src/components/test/GradientTest.tsx`
- **Test Page:** `src/app/[locale]/gradient-test/page.tsx`
- **Design Tokens:** `src/lib/design-tokens.ts`

## Future Enhancements

Potential improvements for the gradient system:

1. Add gradient variants (vertical, diagonal)
2. Create gradient animation utilities
3. Add gradient opacity modifiers
4. Create gradient mesh patterns
5. Add dark mode gradient alternatives

## Support

For questions or issues with the gradient system:

1. Check this documentation
2. Review the test page for examples
3. Verify Tailwind configuration
4. Check browser console for CSS errors
5. Test in different browsers

## Changelog

### Version 1.0.0 (Current)

- Initial implementation of centralized gradient system
- Added `bg-funeral-gold` utility class
- Added `bg-funeral-teal` utility class
- Created test components and documentation
