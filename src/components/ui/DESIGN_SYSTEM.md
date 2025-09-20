# Funeral-Appropriate Design System

This document outlines the comprehensive design system implemented for the funeral wreaths e-commerce platform. The design system follows atomic design principles and ensures accessibility compliance while maintaining a respectful, professional appearance appropriate for funeral commerce.

## Overview

The design system is built with the following core principles:

- **Respectful & Professional**: Colors, typography, and interactions that convey empathy and trust
- **Accessible**: WCAG 2.1 AA compliant with high contrast support
- **Consistent**: Unified visual language across all components
- **Performant**: Optimized for fast loading and smooth interactions
- **Responsive**: Mobile-first design that works across all devices

## Color Palette

### Primary Colors (Deep Forest Green)

Represents nature, growth, and eternal life.

```css
--primary-50: #F0F7ED
--primary-100: #DDECD2
--primary-200: #BDDAA9
--primary-300: #94C176
--primary-400: #6FA64C
--primary-500: #2D5016  /* Main primary color */
--primary-600: #254012
--primary-700: #1E320E
--primary-800: #17240A
--primary-900: #101807
--primary-950: #0A0F04
```

### Secondary Colors (Muted Sage)

Provides subtle contrast and sophistication.

```css
--secondary-50: #F6F7F4
--secondary-100: #EBEEE6
--secondary-200: #D4DAC9
--secondary-300: #B8C2A6
--secondary-400: #9BA883
--secondary-500: #6F7752  /* Main secondary color */
--secondary-600: #565C42
--secondary-700: #3E4230
--secondary-800: #2A2D21
--secondary-900: #181A15
--secondary-950: #0F110D
```

### Accent Colors (Respectful Gold)

Used sparingly for important highlights.

```css
--accent-50: #FEFBF0
--accent-100: #FDF5D9
--accent-200: #FAEAB3
--accent-300: #F6DC82
--accent-400: #F1CB4F
--accent-500: #D4AF37  /* Main accent color */
--accent-600: #B8942A
--accent-700: #9A7A1F
--accent-800: #7A6118
--accent-900: #5C4912
--accent-950: #3D310C
```

### Neutral Colors

Foundation for text, backgrounds, and borders.

```css
--neutral-50: #F8F9FA
--neutral-100: #E9ECEF
--neutral-200: #DEE2E6
--neutral-300: #CED4DA
--neutral-400: #ADB5BD
--neutral-500: #6C757D
--neutral-600: #495057
--neutral-700: #343A40
--neutral-800: #212529
--neutral-900: #1A1D20
--neutral-950: #0F1114
```

### Semantic Colors

For states and feedback.

- **Success**: Green tones for positive actions
- **Warning**: Amber tones for caution
- **Error**: Red tones for errors and destructive actions
- **Info**: Blue tones for informational content

## Typography

### Font Family

- **Primary**: Inter (system fallback: system-ui, sans-serif)
- **Serif**: Georgia (for special occasions)
- **Mono**: Menlo, Monaco, Consolas (for code)

### Font Scale

Based on a modular scale with 1.25 ratio:

- **xs**: 0.75rem (12px)
- **sm**: 0.875rem (14px)
- **base**: 1rem (16px)
- **lg**: 1.125rem (18px)
- **xl**: 1.25rem (20px)
- **2xl**: 1.5rem (24px)
- **3xl**: 1.875rem (30px)
- **4xl**: 2.25rem (36px)
- **5xl**: 3rem (48px)

### Font Weights

- **Light**: 300
- **Normal**: 400
- **Medium**: 500
- **Semibold**: 600
- **Bold**: 700

## Spacing System

Based on 0.25rem (4px) increments for consistent spacing:

- **0**: 0px
- **1**: 0.25rem (4px)
- **2**: 0.5rem (8px)
- **3**: 0.75rem (12px)
- **4**: 1rem (16px)
- **6**: 1.5rem (24px)
- **8**: 2rem (32px)
- **12**: 3rem (48px)
- **16**: 4rem (64px)
- **20**: 5rem (80px)

## Component Library

### Atomic Components (Atoms)

#### Button

Professional button component with multiple variants:

```tsx
<Button variant="primary" size="md">
  Add to Cart
</Button>

<Button variant="outline" size="lg">
  View Details
</Button>

<Button variant="ghost" loading>
  Processing...
</Button>
```

**Variants:**

- `primary`: Main call-to-action buttons
- `secondary`: Secondary actions
- `outline`: Alternative actions
- `ghost`: Subtle actions
- `destructive`: Dangerous actions

**Sizes:**

- `sm`: Small buttons (32px height)
- `md`: Medium buttons (44px height)
- `lg`: Large buttons (52px height)

#### Input

Accessible form input with proper labeling:

```tsx
<Input
  label="Full Name"
  placeholder="Enter your full name"
  required
  error={errors.name}
/>
```

#### Text

Flexible text component with semantic variants:

```tsx
<Text variant="body" size="base" color="neutral">
  Body text content
</Text>

<Text variant="caption" color="muted">
  Caption text
</Text>
```

#### Heading

Semantic heading component:

```tsx
<Heading as="h1" size="4xl" color="primary">
  Page Title
</Heading>

<Heading as="h2" size="2xl">
  Section Title
</Heading>
```

#### Badge

Status and category indicators:

```tsx
<Badge variant="success">Available</Badge>
<Badge variant="warning">Limited Stock</Badge>
<Badge variant="outline">Premium</Badge>
```

#### Divider

Visual separation with memorial variant:

```tsx
<Divider />
<Divider variant="memorial" spacing="lg" />
```

### Molecular Components (Molecules)

#### Card

Flexible container component:

```tsx
<Card variant="memorial" padding="lg">
  <CardHeader>
    <CardTitle>Featured Arrangement</CardTitle>
    <CardDescription>
      Beautiful white lily arrangement
    </CardDescription>
  </CardHeader>
  <CardContent>
    <Text>Detailed description...</Text>
  </CardContent>
  <CardFooter>
    <Button variant="primary">Add to Cart</Button>
  </CardFooter>
</Card>
```

**Variants:**

- `default`: Standard white card
- `outlined`: Card with border emphasis
- `elevated`: Card with shadow
- `memorial`: Special gradient background

## Accessibility Features

### WCAG 2.1 AA Compliance

- **Color Contrast**: All text meets 4.5:1 contrast ratio minimum
- **Focus Management**: Visible focus indicators on all interactive elements
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Proper ARIA labels and semantic HTML

### High Contrast Mode

All components include high contrast mode support:

```css
.high-contrast:bg-ButtonText
.high-contrast:text-ButtonFace
.high-contrast:border-WindowText
```

### Reduced Motion

Respects user's motion preferences:

```tsx
const prefersReducedMotion = useReducedMotion();
// Conditionally apply animations
```

## Responsive Design

### Breakpoints

- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px

### Mobile-First Approach

All components are designed mobile-first with progressive enhancement:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* Responsive grid */}
</div>
```

## Animation & Transitions

### Respectful Animations

Gentle, respectful animations appropriate for funeral context:

- **Duration**: 200-300ms for micro-interactions
- **Easing**: `ease-in-out` for natural feel
- **Special**: `memorial-glow` for subtle emphasis

```css
.animate-gentle-fade {
  animation: gentleFade 0.8s ease-in-out;
}

.animate-memorial-glow {
  animation: memorialGlow 2s ease-in-out infinite;
}
```

## Usage Guidelines

### Do's

✅ Use primary colors for main actions
✅ Maintain consistent spacing using the spacing scale
✅ Ensure all text meets contrast requirements
✅ Use semantic HTML elements
✅ Include proper ARIA labels
✅ Test with keyboard navigation
✅ Respect reduced motion preferences

### Don'ts

❌ Use bright, flashy colors
❌ Create jarring animations
❌ Ignore accessibility requirements
❌ Use inconsistent spacing
❌ Forget focus indicators
❌ Use color alone to convey information

## Testing

### Accessibility Testing

```bash
npm test -- src/components/ui/__tests__/design-system.test.tsx
```

The test suite validates:

- Color contrast compliance
- Component accessibility
- Keyboard navigation
- Screen reader compatibility
- High contrast mode support

### Manual Testing Checklist

- [ ] Test with keyboard navigation only
- [ ] Test with screen reader (NVDA, JAWS, VoiceOver)
- [ ] Test in high contrast mode
- [ ] Test with reduced motion enabled
- [ ] Test on mobile devices
- [ ] Test in different browsers

## Implementation Examples

### Product Card Example

```tsx
<Card variant="memorial" interactive>
  <div className="aspect-square bg-neutral-100 rounded-t-lg overflow-hidden">
    <OptimizedImage
      src="/product-image.jpg"
      alt="White lily funeral arrangement"
      fill
      className="object-cover"
    />
  </div>
  <CardContent className="p-4">
    <Heading as="h3" size="lg" className="mb-2">
      White Lily Arrangement
    </Heading>
    <Text variant="body" color="muted" className="mb-4">
      Elegant white lilies with respectful presentation
    </Text>
    <div className="flex items-center justify-between">
      <Text size="lg" weight="semibold" color="primary">
        2,500 CZK
      </Text>
      <Badge variant="success">Available</Badge>
    </div>
  </CardContent>
  <CardFooter className="p-4 pt-0">
    <Button variant="primary" className="w-full">
      Add to Cart
    </Button>
  </CardFooter>
</Card>
```

### Form Example

```tsx
<form className="space-y-6">
  <Heading as="h2" size="2xl" className="mb-6">
    Contact Information
  </Heading>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <Input
      label="First Name"
      placeholder="Enter first name"
      required
    />
    <Input
      label="Last Name"
      placeholder="Enter last name"
      required
    />
  </div>

  <Input
    label="Email Address"
    type="email"
    placeholder="Enter email address"
    required
  />

  <Input
    label="Special Instructions"
    placeholder="Any special requests..."
    helpText="Optional: Include any specific requirements"
  />

  <Divider />

  <div className="flex gap-4">
    <Button variant="primary" type="submit">
      Submit Order
    </Button>
    <Button variant="outline" type="button">
      Save Draft
    </Button>
  </div>
</form>
```

## Maintenance

### Adding New Components

1. Follow atomic design principles
2. Include accessibility features from the start
3. Add comprehensive tests
4. Document usage examples
5. Validate color contrast
6. Test with assistive technologies

### Updating Colors

When updating colors, ensure:

1. Contrast ratios remain compliant
2. High contrast mode styles are updated
3. All variants are tested
4. Documentation is updated

This design system provides a solid foundation for building respectful, accessible, and professional interfaces for funeral commerce while maintaining consistency and usability across all touchpoints.
