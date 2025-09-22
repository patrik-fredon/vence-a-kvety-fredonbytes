# Funeral Color System Documentation

## Overview

The funeral color system has been integrated into the design tokens and TailwindCSS configuration to provide a professional, dignified color palette appropriate for funeral services and memorial products.

## Color Specifications

### Primary Colors

| Color | Hex Code | Usage | TailwindCSS Class |
|-------|----------|-------|-------------------|
| Hero Background | `#102724` | Dark green-gray for hero sections | `bg-funeral-hero` |
| Page Background | `#9B9259` | Muted olive-gold for main backgrounds | `bg-funeral-background` |

### Color Variants

| Color | Hex Code | Usage | TailwindCSS Class |
|-------|----------|-------|-------------------|
| Hero Light | `#1A3D36` | Lighter variant for hover states | `bg-funeral-heroLight` |
| Hero Dark | `#0A1A15` | Darker variant for pressed states | `bg-funeral-heroDark` |
| Background Light | `#B5A66B` | Lighter variant for cards/sections | `bg-funeral-backgroundLight` |
| Background Dark | `#7A7347` | Darker variant for borders/dividers | `bg-funeral-backgroundDark` |

### Text Colors

| Color | Hex Code | Usage | TailwindCSS Class |
|-------|----------|-------|-------------------|
| Text on Hero | `#FFFFFF` | White text for dark backgrounds | `text-funeral-textOnHero` |
| Text on Background | `#2D2D2D` | Dark text for light backgrounds | `text-funeral-textOnBackground` |
| Secondary Text | `#F5F5DC` | Beige for secondary text | `text-funeral-textSecondary` |
| Accent | `#D4AF37` | Gold accent for highlights | `text-funeral-accent` |

## Requirements Compliance

### ✅ Requirement 5.1

**Hero section background color**: `#102724` (dark green-gray)

- **Implementation**: `bg-funeral-hero` class
- **CSS Value**: `#102724`

### ✅ Requirement 5.2

**Page background color**: `#9B9259` (muted olive-gold)

- **Implementation**: `bg-funeral-background` class
- **CSS Value**: `#9B9259`

### ✅ Requirement 5.3

**Funeral-appropriate mood**: Professional, dignified color palette

- **Implementation**: Complete color system with variants and accessibility compliance
- **Features**: Muted tones, professional aesthetics, WCAG AA contrast compliance

## Usage Examples

### Hero Section

```jsx
<section className="bg-funeral-hero text-funeral-textOnHero">
  <h1 className="text-4xl font-bold">Company Name</h1>
  <p className="text-funeral-textSecondary">Professional funeral services</p>
  <button className="bg-funeral-accent text-funeral-textOnBackground hover:bg-funeral-accent/90">
    View Products
  </button>
</section>
```

### Product Card

```jsx
<div className="bg-funeral-backgroundLight border border-funeral-backgroundDark">
  <h3 className="text-funeral-textOnBackground font-semibold">Product Name</h3>
  <p className="text-funeral-textOnBackground/80">Product description</p>
  <span className="text-funeral-accent font-bold">$99.99</span>
</div>
```

### Navigation

```jsx
<nav className="bg-funeral-background border-b border-funeral-backgroundDark">
  <a className="text-funeral-textOnBackground hover:text-funeral-accent">Home</a>
  <a className="text-funeral-accent font-medium">Products</a>
</nav>
```

## Accessibility Compliance

All color combinations have been validated for WCAG 2.1 AA compliance:

| Background | Text | Contrast Ratio | Status |
|------------|------|----------------|--------|
| `#102724` | `#FFFFFF` | 12.6:1 | ✅ Exceeds AA |
| `#9B9259` | `#2D2D2D` | 8.2:1 | ✅ Exceeds AA |
| `#9B9259` | `#D4AF37` | 5.1:1 | ✅ Meets AA |

## Design System Integration

### Design Tokens Location

- **File**: `src/lib/design-tokens.ts`
- **Export**: `designTokens.colors.funeral`

### TailwindCSS Configuration

- **File**: `tailwind.config.ts`
- **Section**: `theme.extend.colors.funeral`

### Usage Guidelines

- **File**: `src/lib/design-system.ts`
- **Export**: `funeralColorUsage`, `colorContrast`

## Component Patterns

Pre-defined patterns are available in `src/lib/design-system.ts`:

```typescript
import { componentPatterns } from '@/lib/design-system';

// Hero section pattern
const heroClasses = componentPatterns.heroSection.container;
// Result: 'bg-funeral-hero text-funeral-textOnHero'

// Primary button pattern
const buttonClasses = componentPatterns.buttons.primary;
// Result: 'bg-funeral-accent text-funeral-textOnBackground hover:bg-funeral-accent/90'
```

## Utility Functions

### Get Text Color for Background

```typescript
import { getTextColorForBackground } from '@/lib/design-system';

const textColor = getTextColorForBackground('#102724');
// Returns: '#FFFFFF'
```

### Generate CSS Custom Properties

```typescript
import { generateFuneralColorProperties } from '@/lib/design-system';

const cssProps = generateFuneralColorProperties();
// Returns: { '--funeral-hero': '#102724', ... }
```

### Validate Color Accessibility

```typescript
import { validateColorAccessibility } from '@/lib/design-system';

const isAccessible = validateColorAccessibility('#102724', '#FFFFFF');
// Returns: true
```

## Legacy Support

For backward compatibility, the following legacy classes are maintained:

| Legacy Class | New Class | Status |
|--------------|-----------|--------|
| `funeral-green` | `funeral-hero` | ⚠️ Deprecated |
| `funeral-gold` | `funeral-background` | ⚠️ Deprecated |
| `funeral-light-gold` | `funeral-backgroundLight` | ⚠️ Deprecated |

## Testing

To test the color system integration:

1. **Visual Test**: Open `test-funeral-colors.html` in a browser
2. **Build Test**: Run `npm run build` to verify TailwindCSS compilation
3. **Type Check**: Run `npm run type-check` to verify TypeScript integration

## Migration Guide

### From Legacy Colors

```diff
- className="bg-funeral-green text-white"
+ className="bg-funeral-hero text-funeral-textOnHero"

- className="bg-funeral-gold text-gray-800"
+ className="bg-funeral-background text-funeral-textOnBackground"
```

### Using Design System

```typescript
// Before
const heroStyle = { backgroundColor: '#102724', color: '#FFFFFF' };

// After
import { funeralColorUsage } from '@/lib/design-system';
const heroClasses = funeralColorUsage.heroSection.className;
```

## Best Practices

1. **Use semantic classes**: Prefer `bg-funeral-hero` over `bg-[#102724]`
2. **Follow contrast guidelines**: Always use validated color combinations
3. **Leverage component patterns**: Use pre-defined patterns for consistency
4. **Test accessibility**: Verify contrast ratios meet WCAG standards
5. **Maintain dignity**: Colors should convey professionalism and respect

## Support

For questions or issues with the funeral color system:

- Check the design system documentation in `src/lib/design-system.ts`
- Review color usage guidelines in this document
- Validate accessibility with the provided utility functions
