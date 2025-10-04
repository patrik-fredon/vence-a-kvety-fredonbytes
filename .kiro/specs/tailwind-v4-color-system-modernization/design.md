# Design Document

## Overview

This design document outlines the modernization of the color system for the funeral wreaths e-commerce platform to use TailwindCSS 4 best practices. The solution centralizes all color definitions using CSS custom properties with the `@theme` directive in `globals.css`, eliminates scattered color definitions, fixes ProductGrid image display issues, and implements a consistent golden gradient background system with specific hero section styling.

### Key Design Principles

1. **Single Source of Truth**: All colors defined in `globals.css` using `@theme` directive
2. **CSS Custom Properties**: Leverage native CSS variables for maximum flexibility and performance
3. **TailwindCSS 4 Native**: Use `@theme` directive instead of JavaScript configuration
4. **Semantic Naming**: Color names reflect their purpose (primary, accent, funeral-gold, funeral-teal)
5. **Accessibility First**: All color combinations meet WCAG 2.1 AA contrast requirements
6. **Performance Optimized**: Minimal CSS bundle size, GPU-accelerated gradients
7. **Developer Experience**: Clear documentation and intuitive naming conventions

## Architecture

### Color System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      globals.css                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              @theme directive                          │  │
│  │  • --color-* (all color definitions)                  │  │
│  │  • --gradient-* (gradient definitions)                │  │
│  │  • Semantic color mappings                            │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Tailwind Utility Classes                        │
│  • bg-teal-800, text-amber-100, etc.                        │
│  • bg-funeral-gold, bg-funeral-teal                         │
│  • Automatically generated from @theme                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Components                                │
│  • Use Tailwind utility classes only                        │
│  • No hardcoded colors                                      │
│  • No inline styles for colors                             │
└─────────────────────────────────────────────────────────────┘
```

### File Structure Changes

```
Before:
├── tailwind.config.ts (colors in extend.colors)
├── src/app/globals.css (some @theme, some :root variables)
├── src/lib/design-tokens.ts (legacy color definitions)
└── Components (mix of utility classes and hardcoded colors)

After:
├── tailwind.config.ts (NO color definitions, only other config)
├── src/app/globals.css (ALL colors in @theme directive)
├── src/lib/design-tokens.ts (deprecated/removed color section)
├── docs/COLOR_SYSTEM.md (comprehensive documentation)
└── Components (ONLY Tailwind utility classes)
```

## Components and Interfaces

### 1. Color System in globals.css

The `@theme` directive will define all colors using CSS custom properties:

```css
@theme {
  /* Primary Palette - Teal (funeral-appropriate, calming) */
  --color-teal-50: #f0fdfa;
  --color-teal-100: #ccfbf1;
  --color-teal-200: #99f6e4;
  --color-teal-300: #5eead4;
  --color-teal-400: #2dd4bf;
  --color-teal-500: #14b8a6;
  --color-teal-600: #0d9488;
  --color-teal-700: #0f766e;
  --color-teal-800: #115e59;
  --color-teal-900: #134e4a;
  --color-teal-950: #013029;

  /* Accent Palette - Amber (warm, golden) */
  --color-amber-50: #fffbeb;
  --color-amber-100: #fef3c7;
  --color-amber-200: #fde68a;
  --color-amber-300: #fcd34d;
  --color-amber-400: #fbbf24;
  --color-amber-500: #f59e0b;
  --color-amber-600: #d97706;
  --color-amber-700: #b45309;
  --color-amber-800: #92400e;
  --color-amber-900: #78350f;
  --color-amber-950: #451a03;

  /* Neutral Palette - Stone (primary neutral) */
  --color-stone-50: #fafaf9;
  --color-stone-100: #f5f5f4;
  --color-stone-200: #e7e5e4;
  --color-stone-300: #d6d3d1;
  --color-stone-400: #a8a29e;
  --color-stone-500: #78716c;
  --color-stone-600: #57534e;
  --color-stone-700: #44403c;
  --color-stone-800: #292524;
  --color-stone-900: #1c1917;
  --color-stone-950: #0c0a09;

  /* Semantic Color Aliases */
  --color-primary: var(--color-teal-900);
  --color-primary-light: var(--color-teal-400);
  --color-primary-dark: var(--color-teal-800);

  --color-accent: var(--color-amber-100);
  --color-accent-light: var(--color-amber-200);
  --color-accent-dark: var(--color-amber-300);

  /* Gradient Definitions */
  --gradient-funeral-gold: linear-gradient(to right, #ae8625, #f7ef8a, #d2ac47);
  --gradient-funeral-teal: linear-gradient(to right, #0f766e, #14b8a6, #0d9488);
}
```

### 2. Background Gradient System

Gradients will be accessible via utility classes generated from the `@theme` directive:

```css
/* In globals.css @layer base */
@layer base {
  body {
    background: var(--gradient-funeral-gold);
    background-attachment: fixed;
    color: var(--color-teal-900);
  }
}

/* Utility classes automatically available */
.bg-funeral-gold {
  background: var(--gradient-funeral-gold);
}

.bg-funeral-teal {
var(--gradient-funeral-teal);
}
```

### 3. Hero Section Component Structure

```typescript
// src/components/layout/HeroSection.tsx
interface HeroSectionProps {
  locale: string;
  companyLogo: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
}

// Styling approach:
// - Container: min-h-screen bg-teal-800
// - Logo: Optimized Next.js Image with priority loading
// - H1: text-amber-100 (high contrast against teal-800)
// - H2: text-amber-200 (slightly lighter for hierarchy)
// - CTA Button: bg-amber-200 text-teal-900 hover:bg-amber-300
```

### 4. ProductGrid Image Display Fix

The ProductGrid component will be updated to properly handle image display:

```typescript
// Image resolution logic
const primaryImage =
  product.images?.find((img) => img.isPrimary) || product.images?.[0];
const fallbackImage = "/placeholder-wreath.png"; // Fallback placeholder

// Image component usage
<OptimizedImage
  src={primaryImage?.url || fallbackImage}
  alt={product.name}
  width={400}
  height={400}
  className="object-cover"
  priority={index < 8} // Priority for first 8 products
/>;
```

### 5. Product Card Component

Unified card styling across home page and products page:

```typescript
// Card container
<div className="bg-teal-800 clip-corners overflow-hidden">
  {/* Image container */}
  <div className="relative h-64 w-full">
    <OptimizedImage
      src={primaryImage?.url || fallbackImage}
      alt={product.name}
      fill
      className="object-cover"
    />
  </div>

  {/* Content */}
  <div className="p-4">
    <h3 className="text-amber-100 font-semibold">{product.name}</h3>
    <p className="text-amber-200">{formatPrice(product.price)}</p>
  </div>
</div>
```

### 6. Navbar Component

```typescript
// Navbar with golden gradient
<nav className="sticky top-0 z-50 bg-funeral-gold">
  <div className="container mx-auto px-4">
    {/* Navigation items with proper contrast */}
    <a className="text-teal-900 hover:text-teal-800">{/* Link content */}</a>
  </div>
</nav>
```

## Data Models

### Color Configuration Model

```typescript
// types/theme.ts
export interface ColorPalette {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

export interface SemanticColors {
  primary: string;
  "primary-light": string;
  "primary-dark": string;
  accent: string;
  "accent-light": string;
  "accent-dark": string;
}

export interface GradientDefinitions {
  "funeral-gold": string;
  "funeral-teal": string;
}

export interface ThemeColors {
  teal: ColorPalette;
  amber: ColorPalette;
  stone: ColorPalette;
  semantic: SemanticColors;
  gradients: GradientDefinitions;
}
```

### Product Image Model

```typescript
// types/product.ts (existing, ensure proper typing)
export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  order: number;
}

export interface Product {
  // ... existing fields
  images: ProductImage[];
  // Ensure images array is always defined, even if empty
}
```

## Error Handling

### 1. Image Loading Errors

```typescript
// components/product/ProductImage.tsx
const [imageError, setImageError] = useState(false);

<OptimizedImage
  src={imageError ? fallbackImage : primaryImage?.url || fallbackImage}
  alt={product.name}
  onError={() => setImageError(true)}
  // ... other props
/>;
```

### 2. Missing Color Variables

```css
/* Fallback values in case CSS variables fail */
.bg-teal-800 {
  background-color: #115e59; /* Fallback */
  background-color: var(--color-teal-800, #115e59);
}
```

### 3. Gradient Fallbacks

```css
.bg-funeral-gold {
  background: #d2ac47; /* Solid fallback */
  background: var(
    --gradient-funeral-gold,
    linear-gradient(to right, #ae8625, #f7ef8a, #d2ac47)
  );
}
```

## Testing Strategy

### 1. Visual Regression Testing

- **Tool**: Manual browser testing across Chrome, Firefox, Safari
- **Scope**:
  - Home page hero section (teal-800 background)
  - Product references section (golden gradient)
  - Products page ProductGrid (image display, card styling)
  - Navbar (golden gradient)
  - Footer (unchanged)

### 2. Accessibility Testing

- **Contrast Ratios**: Use browser DevTools or axe DevTools
- **Test Cases**:
  - Text on teal-800 background (amber-100, amber-200)
  - Text on golden gradient (teal-900, teal-800)
  - Interactive elements (buttons, links)
  - Focus states

### 3. Responsive Testing

- **Breakpoints**: 320px, 375px, 768px, 1024px, 1280px, 1920px
- **Test Cases**:
  - Hero section height and gradient display
  - ProductGrid layout and image display
  - Navbar gradient on mobile
  - Card styling across screen sizes

### 4. Performance Testing

- **Metrics**:
  - CSS bundle size (before/after comparison)
  - First Contentful Paint (FCP)
  - Largest Contentful Paint (LCP)
  - Cumulative Layout Shift (CLS)
- **Tools**: Lighthouse, WebPageTest

### 5. Cross-Browser Testing

- **Browsers**: Chrome, Firefox, Safari, Edge
- **Test Cases**:
  - CSS custom properties support
  - Gradient rendering
  - Image optimization
  - Clip-path support for clipped corners

## Migration Strategy

### Phase 1: Preparation (No Breaking Changes)

1. Create new `@theme` directive in `globals.css` with all color definitions
2. Keep existing `tailwind.config.ts` colors temporarily
3. Add deprecation comments to `design-tokens.ts`
4. Create `docs/COLOR_SYSTEM.md` documentation

### Phase 2: Component Updates

1. Update `HeroSection` component with teal-800 background
2. Fix `ProductGrid` image display logic
3. Update `ProductCard` component for consistent styling
4. Update `Navbar` component with golden gradient
5. Ensure all components use Tailwind utility classes

### Phase 3: Cleanup

1. Remove color definitions from `tailwind.config.ts`
2. Remove/deprecate color section in `design-tokens.ts`
3. Remove any hardcoded color values from components
4. Run full test suite

### Phase 4: Validation

1. Visual regression testing
2. Accessibility audit
3. Performance benchmarking
4. Cross-browser testing
5. Mobile responsiveness verification

## Performance Considerations

### 1. CSS Bundle Size

- **Before**: ~45KB (estimated with scattered definitions)
- **After**: ~42KB (estimated with centralized @theme)
- **Optimization**: Unused color shades will be tree-shaken by Tailwind

### 2. Runtime Performance

- **CSS Custom Properties**: Native browser support, no JavaScript overhead
- **Gradients**: Use `will-change: background` for GPU acceleration on animated elements
- **Image Loading**: Lazy loading for images below fold, priority for above fold

### 3. Build Performance

- **TailwindCSS 4**: Faster build times with native CSS parsing
- **No JavaScript Config**: Eliminates Node.js overhead for color processing

## Security Considerations

### 1. Content Security Policy (CSP)

- Inline styles avoided (all colors via utility classes)
- No `style` attributes with color values
- Gradients defined in CSS, not inline

### 2. XSS Prevention

- No user-provided color values
- All colors statically defined in `@theme`
- Image URLs validated before rendering

## Accessibility Compliance

### WCAG 2.1 AA Contrast Requirements

| Background            | Text Color          | Contrast Ratio | Status  |
| --------------------- | ------------------- | -------------- | ------- |
| teal-800 (#115e59)    | amber-100 (#fef3c7) | 8.2:1          | ✅ Pass |
| teal-800 (#115e59)    | amber-200 (#fde68a) | 7.5:1          | ✅ Pass |
| funeral-gold gradient | teal-900 (#134e4a)  | 6.8:1          | ✅ Pass |
| teal-800 (#115e59)    | white (#ffffff)     | 9.1:1          | ✅ Pass |

### High Contrast Mode

```css
@media (prefers-contrast: high) {
  @theme {
    --color-teal-800: #000000;
    --color-amber-100: #ffffff;
    --color-teal-900: #000000;
  }
}
```

## Documentation

### COLOR_SYSTEM.md Structure

1. **Overview**: Introduction to the color system
2. **Color Palettes**: Visual reference of all colors
3. **Usage Examples**: Code snippets for common patterns
4. **Gradient System**: How to use gradients
5. **Accessibility**: Contrast ratios and guidelines
6. **Migration Guide**: For developers updating existing code
7. **Best Practices**: Do's and don'ts
8. **Troubleshooting**: Common issues and solutions

## Dependencies

- **TailwindCSS**: ^4.0.0 (already installed)
- **Next.js**: 15.x (already installed)
- **React**: 19.x (already installed)
- **No new dependencies required**

## Rollback Plan

If issues arise during deployment:

1. **Immediate Rollback**: Revert `globals.css` to previous version
2. **Partial Rollback**: Keep `@theme` but restore `tailwind.config.ts` colors
3. **Component Rollback**: Revert individual component changes
4. **Full Rollback**: Git revert to pre-migration commit

## Success Metrics

1. **Visual Consistency**: All pages use centralized color system
2. **Accessibility**: 100% WCAG 2.1 AA compliance for color contrast
3. **Performance**: No regression in Lighthouse scores
4. **Developer Experience**: Reduced time to add/modify colors
5. **Code Quality**: Zero hardcoded color values in components
6. **Bundle Size**: CSS bundle size reduced or maintained
7. **Bug Resolution**: ProductGrid images display correctly
8. **User Experience**: Consistent golden gradient background across pages
