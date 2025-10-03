# Design Document

## Overview

This design addresses five interconnected issues in the funeral wreaths e-commerce platform:

1. **Image Quality Configuration Error**: Next.js Image component throws runtime errors due to missing quality value (70) in configuration
2. **ProductCard/ProductGrid Rendering Issues**: Images not displaying properly or being blocked by overlays
3. **Color System Centralization**: Hardcoded Tailwind colors scattered throughout components need centralization
4. **Accessibility Toolbar Positioning**: Toolbar overlaps navigation bar instead of being positioned below it
5. **Home Page Product Navigation**: Clicking products in "Our Products" section doesn't navigate to correct product

The solution implements a systematic approach to fix configuration, refactor components, centralize styling, and ensure proper navigation flow.

## Architecture

### 1. Configuration Layer

**Next.js Image Configuration**

- Update `next.config.ts` to include quality value 70 in the `images.qualities` array
- Maintain existing quality values: [50, 75, 85, 90, 95]
- New configuration: [50, 70, 75, 85, 90, 95]
- Ensure webp format support remains intact

### 2. Component Layer

**ProductCard Refactoring**

- Maintain current h-96 height for visual consistency
- Ensure ProductImageHover component fills the card container
- Position product information overlay at the bottom with proper z-indexing
- Implement proper layering: Image (z-0) → Hover overlay (z-10) → Stock overlay (z-10) → Info overlay (z-20)
- Preserve rounded corners (clip-corners class)

**ProductGrid Refactoring**

- Maintain 4-column responsive grid layout
- Ensure proper spacing and gap configuration
- Preserve existing navigation and error handling logic
- Update grid container styling to use centralized colors

**AccessibilityToolbar Positioning**

- Change fixed positioning from `top-4` to `top-20` (below navbar)
- Add padding-top equal to navbar height (typically 64px or 80px)
- Ensure toolbar doesn't overlap with navigation
- Maintain z-index hierarchy: Navbar (z-50) → Toolbar (z-40)

**ProductTeaser Navigation**

- Ensure product slug is correctly passed to navigation
- Validate product data consistency between home page and detail page
- Implement proper error handling for navigation failures
- Add fallback to window.location if router navigation fails

### 3. Styling Layer

**Tailwind Configuration**

- Extend Tailwind config with centralized color definitions
- Define semantic color names following best practices
- Implement gradient backgrounds as utility classes
- Remove duplicate color definitions

**Color Mapping Strategy**

```typescript
// Primary colors
primary: teal-900 (boxes, cards, navbar)
primaryText: amber-100 (text on primary backgrounds)
accent: teal-800 (accent elements)
accentLight: amber-200 (accent text, hover states)

// Background colors
background: linear-gradient(to right, #AE8625, #F7EF8A, #D2AC47)
hero: teal-900 (hero section only)

// Interactive states
hoverNav: teal-400 (navigation hover)
hoverText: amber-200 (text hover)

// Shadows
shadow: xl (all visible elements)
```

## Components and Interfaces

### 1. Next.js Configuration

**File**: `next.config.ts`

```typescript
images: {
  formats: ["image/avif", "image/webp"],
  qualities: [50, 70, 75, 85, 90, 95], // Added 70 for OptimizedImage component
  // ... rest of configuration
}
```

### 2. Tailwind Configuration

**File**: `tailwind.config.ts`

```typescript
theme: {
  extend: {
    colors: {
      // Primary palette
      primary: {
        DEFAULT: '#134e4a', // teal-900
        light: '#14b8a6',   // teal-400
        dark: '#115e59',    // teal-800
      },
      // Accent palette
      accent: {
        DEFAULT: '#fef3c7', // amber-100
        light: '#fde68a',   // amber-200
        dark: '#f59e0b',    // amber-500
      },
      // Background gradients
      'bg-gradient': 'linear-gradient(to right, #AE8625, #F7EF8A, #D2AC47)',
    },
    backgroundImage: {
      'gradient-gold': 'linear-gradient(to right, #AE8625, #F7EF8A, #D2AC47)',
    },
  }
}
```

### 3. ProductCard Component

**File**: `src/components/product/ProductCard.tsx`

**Key Changes**:

- Ensure absolute positioning for image container
- Set proper z-index layering for overlays
- Maintain h-96 height constraint
- Use centralized color classes

**Structure**:

```tsx
<article className="relative h-96 clip-corners bg-primary">
  {/* Image Layer (z-0) */}
  <div className="absolute inset-0">
    <ProductImageHover fill priority={featured} />
  </div>

  {/* Stock Overlay (z-10) */}
  {!inStock && <div className="absolute inset-0 z-10">...</div>}

  {/* Info Overlay (z-20) */}
  <div className="absolute bottom-0 left-0 right-0 z-20">
    <div className="bg-accent/95 backdrop-blur-sm">{/* Product info */}</div>
  </div>
</article>
```

### 4. AccessibilityToolbar Component

**File**: `src/components/accessibility/AccessibilityToolbar.tsx`

**Key Changes**:

- Update fixed positioning: `top-20` instead of `top-4`
- Add responsive padding for navbar height
- Maintain z-index: z-40 (below navbar's z-50)

**Structure**:

```tsx
<button className="fixed top-20 right-4 z-40">
  {/* Toggle button */}
</button>

<div className="fixed top-24 right-4 z-40 pt-16">
  {/* Toolbar panel with padding for navbar */}
</div>
```

### 5. ProductTeaser Component

**File**: `src/components/product/ProductTeaser.tsx`

**Key Changes**:

- Validate product slug before navigation
- Use router.push with error handling
- Implement fallback to window.location
- Add navigation logging for debugging

**Navigation Logic**:

```tsx
const handleNavigation = async (product: Product) => {
  try {
    // Validate slug
    if (!product.slug) {
      throw new Error("Invalid product slug");
    }

    // Attempt router navigation
    await router.push(`/${locale}/products/${product.slug}`);
  } catch (error) {
    console.error("Navigation error:", error);
    // Fallback to window.location
    window.location.href = `/${locale}/products/${product.slug}`;
  }
};
```

## Data Models

### Color Configuration Model

```typescript
interface ColorConfig {
  primary: {
    DEFAULT: string;
    light: string;
    dark: string;
  };
  accent: {
    DEFAULT: string;
    light: string;
    dark: string;
  };
  background: {
    gradient: string;
    hero: string;
  };
  interactive: {
    hoverNav: string;
    hoverText: string;
  };
}
```

### Image Quality Configuration

```typescript
interface ImageConfig {
  formats: string[];
  qualities: number[]; // [50, 70, 75, 85, 90, 95]
  deviceSizes: number[];
  imageSizes: number[];
}
```

## Error Handling

### 1. Image Loading Errors

- OptimizedImage component already has error fallback
- Maintain existing error boundary implementation
- Log errors for monitoring

### 2. Navigation Errors

- Implement try-catch in navigation handlers
- Fallback to window.location on router failure
- Log navigation errors with context
- Display user-friendly error messages

### 3. Configuration Errors

- Validate quality values at build time
- Ensure all quality values are within valid range (1-100)
- TypeScript type checking for configuration

## Testing Strategy

### 1. Configuration Testing

- **Test**: Verify quality 70 is in next.config.ts
- **Test**: Build application without errors
- **Test**: Render OptimizedImage with quality 70

### 2. Component Testing

- **Test**: ProductCard renders with proper layering
- **Test**: Images fill card container without blocking
- **Test**: Info overlay appears at bottom with proper z-index
- **Test**: AccessibilityToolbar positioned below navbar
- **Test**: Toolbar doesn't overlap navigation

### 3. Navigation Testing

- **Test**: Click product in "Our Products" section
- **Test**: Verify navigation to correct product detail page
- **Test**: Validate product slug consistency
- **Test**: Test fallback navigation on router failure

### 4. Styling Testing

- **Test**: Verify centralized colors applied correctly
- **Test**: Check gradient background on non-hero sections
- **Test**: Validate teal-900 background on hero section
- **Test**: Test hover states (teal-400 on nav, amber-200 on text)
- **Test**: Verify xl shadow on visible elements

### 5. Visual Regression Testing

- **Test**: Compare ProductCard before/after refactoring
- **Test**: Verify ProductGrid layout consistency
- **Test**: Check AccessibilityToolbar positioning
- **Test**: Validate color consistency across pages

## Performance Considerations

### 1. Image Optimization

- Quality 70 provides good balance between file size and visual quality
- Webp format reduces file size by ~30% compared to JPEG
- Maintain existing lazy loading and priority loading strategies

### 2. Component Rendering

- ProductCard already uses React.memo
- ProductGrid uses useMemo for displayed products
- No additional performance impact from refactoring

### 3. CSS Performance

- Centralized colors reduce CSS bundle size
- Tailwind purges unused classes automatically
- Gradient backgrounds use CSS, not images

## Accessibility Considerations

### 1. Toolbar Positioning

- Positioned below navbar for better keyboard navigation flow
- Maintains proper focus order
- Doesn't obstruct navigation elements

### 2. Color Contrast

- Amber-100 on teal-900 meets WCAG AA standards
- Gradient background maintains sufficient contrast
- Hover states provide clear visual feedback

### 3. Navigation

- Proper ARIA labels maintained
- Keyboard navigation preserved
- Screen reader announcements for navigation

## Migration Strategy

### Phase 1: Configuration Updates

1. Update next.config.ts with quality 70
2. Update tailwind.config.ts with centralized colors
3. Test build process

### Phase 2: Component Refactoring

1. Update ProductCard layering and styling
2. Update ProductGrid styling
3. Update AccessibilityToolbar positioning
4. Test component rendering

### Phase 3: Navigation Fixes

1. Update ProductTeaser navigation logic
2. Add error handling and fallbacks
3. Test navigation flow

### Phase 4: Color System Migration

1. Replace hardcoded colors in components
2. Update design-tokens.ts if needed
3. Remove unused color definitions
4. Test visual consistency

### Phase 5: Validation

1. Run full test suite
2. Visual regression testing
3. Performance testing
4. Accessibility audit
