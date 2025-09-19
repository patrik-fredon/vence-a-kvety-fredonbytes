# Accessibility Implementation Guide

This document outlines the comprehensive accessibility features implemented in the funeral wreaths e-commerce platform, ensuring compliance with WCAG 2.1 AA standards and providing an inclusive experience for all users.

## Overview

The accessibility implementation includes:

- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Focus management
- Skip navigation links
- Reduced motion support

## Features Implemented

### 1. Semantic HTML Structure

All components use proper semantic HTML elements:

```tsx
// Proper heading hierarchy
<h1>Main Page Title</h1>
<h2>Section Title</h2>
<h3>Subsection Title</h3>

// Semantic landmarks
<header role="banner">
<nav role="navigation" aria-label="Main navigation">
<main role="main" id="main-content">
<footer role="contentinfo">

// Form elements with proper labels
<label htmlFor="email">Email Address</label>
<input id="email" type="email" aria-required="true" />
```

### 2. ARIA Labels and Roles

Components include comprehensive ARIA attributes:

```tsx
// Button with loading state
<button
  aria-disabled={loading}
  aria-describedby={loading ? `${id}-loading` : undefined}
>
  {loading && (
    <span className="sr-only" id={`${id}-loading`}>
      Loading...
    </span>
  )}
  Button Text
</button>

// Form validation
<input
  aria-invalid={hasError}
  aria-describedby={hasError ? `${id}-error` : undefined}
/>
{hasError && (
  <div id={`${id}-error`} role="alert">
    Error message
  </div>
)}
```

### 3. Keyboard Navigation

Full keyboard support is implemented:

#### Navigation Keys

- **Tab/Shift+Tab**: Navigate between focusable elements
- **Enter/Space**: Activate buttons and links
- **Arrow Keys**: Navigate within grids and lists
- **Escape**: Close modals and dropdowns
- **Home/End**: Jump to first/last item in lists

#### Product Grid Navigation

```tsx
<KeyboardNavigationGrid
  columns={4}
  orientation="both"
  onItemActivate={(index, element) => {
    const link = element.querySelector('a');
    if (link) link.click();
  }}
>
  {products.map((product, index) => (
    <div key={product.id} data-keyboard-nav-item tabIndex={index === 0 ? 0 : -1}>
      <ProductCard product={product} />
    </div>
  ))}
</KeyboardNavigationGrid>
```

### 4. Skip Navigation Links

Skip links allow keyboard users to quickly navigate to main content areas:

```tsx
<SkipLinks locale={locale} />
```

Available skip links:

- Skip to main content
- Skip to navigation
- Skip to search
- Skip to footer

### 5. Focus Management

Proper focus management is implemented throughout:

#### Focus Trap for Modals

```tsx
const focusTrapRef = useFocusTrap(isModalOpen);

<div ref={focusTrapRef} role="dialog" aria-modal="true">
  <button>First focusable element</button>
  <button>Last focusable element</button>
</div>
```

#### Focus Restoration

When modals close, focus returns to the triggering element.

### 6. High Contrast Mode Support

The application supports high contrast mode:

#### CSS Implementation

```css
.high-contrast {
  --color-primary-600: #000000;
  --color-primary-700: #000000;
  --color-neutral-100: #ffffff;
}

.high-contrast button {
  border: 2px solid currentColor !important;
  background: transparent !important;
}

.high-contrast button:hover,
.high-contrast button:focus {
  background: Highlight !important;
  color: HighlightText !important;
}
```

#### System Detection

```tsx
const { isHighContrast, toggleHighContrast } = useHighContrast();

// Automatically detects system preferences
useEffect(() => {
  const mediaQuery = window.matchMedia('(prefers-contrast: high)');
  const forcedColors = window.matchMedia('(forced-colors: active)');

  // Apply high contrast if system preference is set
}, []);
```

### 7. Screen Reader Support

#### Live Regions

```tsx
// Polite announcements
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>

// Urgent announcements
<div aria-live="assertive" role="alert">
  {errorMessage}
</div>
```

#### Screen Reader Only Content

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

### 8. Accessibility Toolbar

A comprehensive accessibility toolbar provides users with quick access to accessibility features:

```tsx
<AccessibilityToolbar locale={locale} />
```

Features:

- Toggle high contrast mode
- Skip navigation shortcuts
- Keyboard shortcuts reference
- Accessibility options panel

### 9. Form Accessibility

All forms include proper accessibility features:

#### Input Component

```tsx
<Input
  label="Email Address"
  id="email"
  required
  error={errors.email}
  helperText="We'll never share your email"
  aria-describedby="email-helper email-error"
/>
```

#### Validation Messages

- Error messages use `role="alert"`
- Success messages use `aria-live="polite"`
- Field validation is announced to screen readers

### 10. Reduced Motion Support

The application respects user motion preferences:

```tsx
const prefersReducedMotion = useReducedMotion();

// Conditionally apply animations
<div className={!prefersReducedMotion ? 'animate-fade-in' : ''}>
  Content
</div>
```

## Testing

### Automated Testing

Accessibility is tested using jest-axe:

```tsx
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('should not have accessibility violations', async () => {
  const { container } = render(<Component />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Manual Testing Checklist

#### Keyboard Navigation

- [ ] All interactive elements are focusable
- [ ] Focus order is logical
- [ ] Focus is visible
- [ ] No keyboard traps (except intentional ones)
- [ ] All functionality available via keyboard

#### Screen Reader Testing

- [ ] Content is announced correctly
- [ ] Form labels are associated properly
- [ ] Error messages are announced
- [ ] Status changes are communicated
- [ ] Heading structure is logical

#### High Contrast Mode

- [ ] All content is visible in high contrast
- [ ] Focus indicators are visible
- [ ] Interactive elements are distinguishable
- [ ] Text has sufficient contrast

## Browser Support

Accessibility features are tested and supported in:

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Screen readers: NVDA, JAWS, VoiceOver

## WCAG 2.1 Compliance

The implementation meets WCAG 2.1 AA standards:

### Level A Compliance

- ✅ 1.1.1 Non-text Content
- ✅ 1.3.1 Info and Relationships
- ✅ 1.3.2 Meaningful Sequence
- ✅ 1.4.1 Use of Color
- ✅ 2.1.1 Keyboard
- ✅ 2.1.2 No Keyboard Trap
- ✅ 2.4.1 Bypass Blocks
- ✅ 2.4.2 Page Titled
- ✅ 3.1.1 Language of Page
- ✅ 3.2.1 On Focus
- ✅ 3.2.2 On Input
- ✅ 4.1.1 Parsing
- ✅ 4.1.2 Name, Role, Value

### Level AA Compliance

- ✅ 1.4.3 Contrast (Minimum)
- ✅ 1.4.4 Resize text
- ✅ 1.4.5 Images of Text
- ✅ 2.4.3 Focus Order
- ✅ 2.4.4 Link Purpose (In Context)
- ✅ 2.4.5 Multiple Ways
- ✅ 2.4.6 Headings and Labels
- ✅ 2.4.7 Focus Visible
- ✅ 3.1.2 Language of Parts
- ✅ 3.2.3 Consistent Navigation
- ✅ 3.2.4 Consistent Identification
- ✅ 3.3.1 Error Identification
- ✅ 3.3.2 Labels or Instructions
- ✅ 3.3.3 Error Suggestion
- ✅ 3.3.4 Error Prevention

## Usage Examples

### Using Accessibility Hooks

```tsx
import { useAnnouncer, useKeyboardNavigation, useHighContrast } from '@/lib/accessibility';

function MyComponent() {
  const announce = useAnnouncer();
  const { isHighContrast, toggleHighContrast } = useHighContrast();

  const handleAction = () => {
    // Announce success to screen readers
    announce('Action completed successfully', 'polite');
  };

  return (
    <div>
      <button onClick={handleAction}>Perform Action</button>
      <button onClick={toggleHighContrast}>
        {isHighContrast ? 'Disable' : 'Enable'} High Contrast
      </button>
    </div>
  );
}
```

### Creating Accessible Components

```tsx
import { useId, useFormAccessibility } from '@/lib/accessibility';

function AccessibleForm() {
  const emailId = useId('email');
  const { getFieldProps, setFieldError } = useFormAccessibility();

  return (
    <form>
      <Input
        id={emailId}
        label="Email Address"
        required
        {...getFieldProps('email')}
      />
    </form>
  );
}
```

## Best Practices

1. **Always provide text alternatives** for images and icons
2. **Use semantic HTML** elements when possible
3. **Ensure sufficient color contrast** (4.5:1 for normal text)
4. **Make all functionality keyboard accessible**
5. **Provide clear focus indicators**
6. **Use ARIA labels** when semantic HTML isn't sufficient
7. **Test with actual screen readers**
8. **Respect user preferences** (reduced motion, high contrast)
9. **Provide multiple ways to access content**
10. **Keep accessibility in mind from the start** of development

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Screen Reader Testing](https://webaim.org/articles/screenreader_testing/)
- [Color Contrast Checker](https://webaim.org/resources/contrastchecker/)

## Maintenance

Regular accessibility audits should be performed:

- Run automated tests with jest-axe
- Manual keyboard navigation testing
- Screen reader testing
- High contrast mode verification
- User testing with people with disabilities

The accessibility implementation is an ongoing process that should be maintained and improved as the application evolves.
