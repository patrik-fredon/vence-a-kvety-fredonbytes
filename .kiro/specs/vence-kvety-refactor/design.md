# Design Document

## Overview

This design document outlines the technical approach for refactoring the Vence a kvety funeral wreath e-commerce website. The refactor addresses critical translation issues, implements consistent visual design patterns, and enhances user experience across all pages. The solution leverages Next.js 15 with App Router, TailwindCSS 4, and the existing teal/amber color system while introducing standardized typography and improved responsive layouts.

## Architecture

### System Context

The application is a Next.js 15 e-commerce platform with:

- **Frontend**: React 19 with Server Components
- **Styling**: TailwindCSS 4 with custom design tokens
- **Internationalization**: next-intl for Czech/English localization
- **Database**: Supabase (PostgreSQL)
- **Caching**: Redis (Upstash)
- **State Management**: React Context API for cart and auth

### Component Architecture

```
src/
├── app/
│   ├── [locale]/
│   │   ├── page.tsx (Home page with hero)
│   │   ├── products/
│   │   │   └── [slug]/page.tsx (Product detail)
│   │   └── about/page.tsx (About page)
│   └── globals.css (Color system & typography)
├── components/
│   ├── layout/
│   │   └── RefactoredHeroSection.tsx
│   └── product/
│       ├── ProductCard.tsx
│       ├── ProductDetail.tsx
│       └── ProductGrid.tsx
├── lib/
│   ├── design-tokens.ts
│   └── utils/
│       └── fallback-utils.ts
└── messages/
    ├── cs.json
    └── en.json
```

## Components and Interfaces

### 1. Translation System Enhancement

#### Current State Analysis

- Missing translation keys in Czech locale: `home.refactoredHero.subheading`, `home.refactoredHero.cta`, `home.refactoredHero.ctaAriaLabel`, `accessibility.accessibility`
- Fallback system exists but needs validation
- English translations are complete

#### Design Solution

**Translation Key Structure**:

```typescript
// messages/cs.json & messages/en.json
{
  "home": {
    "refactoredHero": {
      "heading": string,
      "subheading": string,  // NEW - Missing in CS
      "cta": string,          // NEW - Missing in CS
      "ctaAriaLabel": string, // NEW - Missing in CS
      "description": string,
      "ctaText": string,
      "ctaButton": string,
      // ... existing keys
    }
  },
  "accessibility": {
    "accessibility": string,  // NEW - Missing in CS
    // ... existing keys
  }
}
```

**Fallback Utility Enhancement**:

```typescript
// src/lib/utils/fallback-utils.ts
export function safeTranslate(
  translateFn: (key: string, values?: Record<string, any>) => string,
  key: string,
  locale: string,
  values?: Record<string, any>
): string {
  try {
    const translation = translateFn(key, values);
    if (translation === key || !translation) {
      return getFallbackTranslation(key, locale);
    }
    return translation;
  } catch (error) {
    logErrorWithContext(error, { key, locale });
    return getFallbackTranslation(key, locale);
  }
}
```

### 2. Typography Color Standardization

#### Color System Design

**Current State**:

- TailwindCSS 4 with `@theme` directive in `globals.css`
- Teal palette (50-950) for primary colors
- Amber palette (50-950) for accents
- Stone palette (50-950) for neutrals

**Typography Color Rules**:

| Element | Color     | Tailwind Class                        | Use Case                    |
| ------- | --------- | ------------------------------------- | --------------------------- |
| h1      | teal-800  | `text-teal-800`                       | Page titles, major headings |
| h2      | teal-800  | `text-teal-800`                       | Section headings            |
| h3      | amber-100 | `text-amber-100`                      | Subsection headings         |
| h4-h6   | amber-100 | `text-amber-100`                      | Minor headings              |
| p       | amber-100 | `text-amber-100`                      | Body text                   |
| Links   | amber-200 | `text-amber-200 hover:text-amber-300` | Interactive text            |

**Global CSS Implementation**:

```css
/* src/app/globals.css */
@layer base {
  h1,
  h2 {
    font-family: "Playfair Display", Georgia, serif;
    font-weight: 700;
    line-height: 1.4;
    color: var(--color-teal-800);
  }

  h3,
  h4,
  h5,
  h6 {
    font-family: "Playfair Display", Georgia, serif;
    font-weight: 700;
    line-height: 1.2;
    color: var(--color-amber-100);
  }

  p {
    color: var(--color-amber-100);
    line-height: 1.625;
  }
}
```

### 3. Hero Section Enhancement

#### Current Implementation

- Located in `src/components/layout/RefactoredHeroSection.tsx`
- Uses teal-800 background
- Responsive sizing with mobile-first approach
- Logo, heading, subheading, and CTA button

#### Design Changes

**Height Adjustments**:

```typescript
// Mobile-first responsive heights
className={cn(
  "bg-teal-800",
  // Mobile (320px-767px)
  "min-h-[600px]",      // Increased from min-h-screen
  "sm:min-h-[650px]",   // Small screens
  // Tablet (768px-1023px)
  "md:min-h-[700px]",   // Increased for impact
  // Desktop (1024px+)
  "lg:min-h-[750px]",   // Larger hero on desktop
  "xl:min-h-[800px]",   // Maximum height for large screens
  // ... other classes
)}
```

**Image Sizing**:

```typescript
// Logo sizing progression
className={cn(
  "mx-auto",
  "w-56 h-auto",      // Increased from w-48 (224px from 192px)
  "xs:w-64",          // 256px for 375px+
  "sm:w-72",          // 288px for 640px+
  "md:w-80",          // 320px for tablets
  "lg:w-96",          // 384px for desktop
  "xl:w-[28rem]",     // 448px for large screens (NEW)
)}
```

**Performance Considerations**:

- Maintain `priority` prop on hero image
- Use Next.js Image component with optimized quality (90)
- Implement lazy loading for non-critical images
- Monitor Core Web Vitals (LCP target: <2.5s)

### 4. Product Card Design Consistency

#### Current State

- Grid view uses teal-800 background with clip-corners
- List view has different styling
- Height fixed at h-96 (384px)
- Info overlay at bottom with amber-100 background

#### Design Standardization

**Cardre**:

```typescript
<article
  className={cn(
    // Base styles - consistent across all pages
    "group relative overflow-hidden transition-all duration-300 shadow-lg cursor-pointer",
    "bg-teal-800 clip-corners rounded-lg h-96",
    "hover:-translate-y-1 hover:shadow-xl"
  )}
>
  {/* Image Layer (z-0) */}
  <div className="absolute inset-0 z-0 bg-teal-800">
    <ProductImageHover {...imageProps} />
  </div>

  {/* Overlay Layer (z-10) - Badges */}
  <div className="absolute inset-0 z-10 pointer-events-none">
    {/* Featured badge, stock status */}
  </div>

  {/* Info Overlay (z-20) - Bottom positioned */}
  <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
    <div className="bg-amber-100/95 backdrop-blur-sm rounded-xl p-4 mx-2">
      {/* Product info */}
    </div>
  </div>
</article>
```

**Clip-Corners Utility**:

```css
/* src/app/globals.css */
.clip-corners {
  clip-path: polygon(
    15px 0%,
    calc(100% - 15px) 0%,
    100% 15px,
    100% calc(100% - 15px),
    calc(100% - 15px) 100%,
    15px 100%,
    0% calc(100% - 15px),
    0% 15px
  );
  box-shadow: 0 4px 20px -4px rgba(0, 0, 0, 0.1);
}
```

**Color Consistency**:

- Card background: `bg-teal-800`
- Info panel: `bg-amber-100/95` with backdrop blur
- Text on info panel: `text-teal-900`
- Hover state: Maintain teal-800, add subtle overlay

### 5. Product Detail Layout Optimization

#### Current Issues

- Left column has height restrictions
- Image gallery doesn't accommodate all photos on large monitors
- Fixed height causes scrolling issues

#### Design Solution

**Layout Structure**:

```typescript
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
  {/* Left Column - Images */}
  <div className="space-y-4">
    {/* Remove max-h restrictions */}
    <ProductDetailImageGrid
      images={product.images}
      className="w-full" // No height constraints
    />
  </div>

  {/* Right Column - Info */}
  <div className="space-y-6 lg:sticky lg:top-24">
    {/* Product info, customization, pricing */}
  </div>
</div>
```

**Image Grid Design**:

```typescript
// ProductDetailImageGrid.tsx
<div className="grid grid-cols-1 gap-4">
  {/* Main image - no height restriction */}
  <div className="relative w-full aspect-square">
    <Image fill className="object-cover rounded-lg" />
  </div>

  {/* Thumbnail grid - flexible height */}
  <div className="grid grid-cols-4 gap-2">
    {images.map((img) => (
      <div key={img.id} className="relative aspect-square">
        <Image fill className="object-cover rounded-md" />
      </div>
    ))}
  </div>
</div>
```

**Responsive Behavior**:

- Mobile: Single column, images stack naturally
- Tablet: Single column with larger images
- Desktop: Two columns, right column sticky
- Large monitors: Images expand to show all photos without scrolling

### 6. About Page Redesign

#### Current Structure

- Top image section
- Company story and values
- Bottom section with decorative elements

#### Design Changes

**Top Image Reduction**:

```typescript
// Reduce hero image height
<div
  className={cn(
    "relative w-full",
    "h-64", // Reduced from h-96 (256px from 384px)
    "sm:h-72", // 288px on small screens
    "md:h-80", // 320px on tablets
    "lg:h-96" // 384px on desktop (original mobile size)
  )}
>
  <Image src="/about-hero.jpg" fill className="object-cover" priority />
</div>
```

**Logo Integration**:

```typescript
// Add logo to About page design
<div className="flex items-center justify-center mb-8">
  <Image
    src="/logo.svg"
    alt="Company Logo"
    width={200}
    height={80}
    className="w-48 md:w-56 lg:w-64"
  />
</div>
```

**Bottom Section Redesign**:

```typescript
// Replace dots with gold-outlined elements
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {values.map((value) => (
    <div
      key={value.id}
      className={cn(
        "p-6 rounded-lg",
        "border-2 border-amber-300", // Gold outline
        "bg-teal-800/50", // Semi-transparent background
        "backdrop-blur-sm",
        "hover:border-amber-200", // Hover effect
        "transition-colors duration-300"
      )}
    >
      <h3 className="text-amber-100 mb-3">{value.title}</h3>
      <p className="text-amber-100">{value.description}</p>
    </div>
  ))}
</div>
```

## Data Models

### Translation Data Structure

```typescript
interface TranslationMessages {
  home: {
    refactoredHero: {
      heading: string;
      subheading: string;
      cta: string;
      ctaAriaLabel: string;
      description: string;
      // ... other keys
    };
  };
  accessibility: {
    accessibility: string;
    // ... other keys
  };
  // ... other sections
}
```

### Product Data Model (Existing)

```typescript
interface Product {
  id: string;
  slug: string;
  name: Record<string, string>; // Localized names
  basePrice: number;
  images: ProductImage[];
  category?: Category;
  availability: {
    inStock: boolean;
    stockQuantity?: number;
  };
  customizationOptions?: CustomizationOption[];
}

interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  sortOrder: number;
}
```

## Error Handling

### Translation Error Recovery

```typescript
// Fallback hierarchy
1. Try requested translation key
2. If missing, check fallback translations
3. If still missing, use English equivalent
4. If no English, use key name with formatting
5. Log error for monitoring

// Example implementation
function getFallbackTranslation(key: string, locale: string): string {
  const fallbacks = {
    'home.refactoredHero.subheading': {
      cs: 'Krásné květinové aranžmá pro důstojné rozloučení',
      en: 'Beautiful floral arrangements for dignified farewell'
    },
    // ... other fallbacks
  };

  return fallbacks[key]?.[locale] ||
         fallbacks[key]?.['en'] ||
         formatKeyAsText(key);
}
```

### Product Loading Error Handling

```typescript
// ProductGrid error states
enum ProductLoadingState {
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
  EMPTY = 'empty'
}

// Error recovery strategy
1. Show loading skeleton
2. Attempt data fetch
3. On error, show retry button
4. Log error details
5. Provide fallback empty state
```

### Image Loading Error Handling

```typescript
// Image fallback system
const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const fallbackImage = "/placeholder-product.jpg";
  e.currentTarget.src = fallbackImage;
  logErrorWithContext(new Error("Image load failed"), {
    originalSrc: e.currentTarget.src,
    component: "ProductCard",
  });
};
```

## Testing Strategy

### Unit Testing Focus

**Translation System**:

```typescript
describe("safeTranslate", () => {
  it("should return translation for valid key", () => {
    const result = safeTranslate(t, "home.refactoredHero.heading", "cs");
    expect(result).toBe("Pohřební věnce s láskou a úctou");
  });

  it("should return fallback for missing key", () => {
    const result = safeTranslate(t, "missing.key", "cs");
    expect(result).toContain("Missing Key");
  });

  it("should log error for missing translations", () => {
    const spy = jest.spyOn(console, "error");
    safeTranslate(t, "missing.key", "cs");
    expect(spy).toHaveBeenCalled();
  });
});
```

**Typography Color Application**:

```typescript
describe("Typography Colors", () => {
  it("should apply teal-800 to h1 elements", () => {
    render(<h1>Test Heading</h1>);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveClass("text-teal-800");
  });

  it("should apply amber-100 to h3 elements", () => {
    render(<h3>Test Subheading</h3>);
    const heading = screen.getByRole("heading", { level: 3 });
    expect(heading).toHaveClass("text-amber-100");
  });
});
```

### Integration Testing

**Product Card Rendering**:

```typescript
describe("ProductCard Integration", () => {
  it("should render with consistent styling across pages", () => {
    const { container } = render(
      <ProductCard product={mockProduct} locale="cs" />
    );

    expect(container.querySelector(".bg-teal-800")).toBeInTheDocument();
    expect(container.querySelector(".clip-corners")).toBeInTheDocument();
    expect(container.querySelector(".h-96")).toBeInTheDocument();
  });

  it("should handle image loading errors gracefully", async () => {
    render(<ProductCard product={mockProductWithBadImage} locale="cs" />);

    await waitFor(() => {
      const img = screen.getByRole("img");
      expect(img.src).toContain("placeholder-product.jpg");
    });
  });
});
```

**Hero Section Responsiveness**:

```typescript
describe("RefactoredHeroSection Responsive", () => {
  it("should adjust height for mobile", () => {
    global.innerWidth = 375;
    const { container } = render(
      <RefactoredHeroSection locale="cs" companyLogo={mockLogo} />
    );

    expect(container.firstChild).toHaveClass("min-h-[600px]");
  });

  it("should increase height for desktop", () => {
    global.innerWidth = 1920;
    const { container } = render(
      <RefactoredHeroSection locale="cs" companyLogo={mockLogo} />
    );

    expect(container.firstChild).toHaveClass("xl:min-h-[800px]");
  });
});
```

### Visual Regression Testing

**Approach**:

1. Capture screenshots of key pages before changes
2. Apply design changes
3. Capture screenshots after changes
4. Compare using visual diff tools (Percy, Chromatic)
5. Review and approve visual changes

**Key Pages to Test**:

- Home page (hero section)
- Products page (card grid)
- Product detail page (layout)
- About page (redesigned sections)

### Accessibility Testing

**Automated Tests**:

```typescript
describe("Accessibility Compliance", () => {
  it("should have no axe violations on home page", async () => {
    const { container } = render(<HomePage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("should maintain color contrast ratios", () => {
    // Test teal-800 on amber-100 background
    const contrast = getContrastRatio("#115e59", "#fef3c7");
    expect(contrast).toBeGreaterThan(4.5); // WCAG AA standard
  });
});
```

**Manual Testing Checklist**:

- [ ] Keyboard navigation works on all interactive elements
- [ ] Screen reader announces all content correctly
- [ ] Focus indicators are visible
- [ ] Color contrast meets WCAG AA standards
- [ ] Text remains readable at 200% zoom
- [ ] High contrast mode works properly

### Performance Testing

**Core Web Vitals Targets**:

- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

**Testing Approach**:

```typescript
describe("Performance Metrics", () => {
  it("should load hero image within LCP target", async () => {
    const metrics = await measurePageLoad("/");
    expect(metrics.lcp).toBeLessThan(2500);
  });

  it("should have minimal layout shift", async () => {
    const metrics = await measurePageLoad("/products");
    expect(metrics.cls).toBeLessThan(0.1);
  });
});
```

**Monitoring**:

- Use Lighthouse CI for automated performance checks
- Monitor real user metrics via Web Vitals API
- Set up alerts for performance regressions

## Implementation Notes

### Phase 1: Translation Fixes (Priority: Critical)

1. Add missing translation keys to `messages/cs.json`
2. Validate all translation keys exist in both locales
3. Test fallback system with missing keys
4. Verify console errors are resolved

### Phase 2: Typography Standardization (Priority: High)

1. Update `globals.css` with typography color rules
2. Remove inline color classes from components
3. Test color contrast ratios
4. Verify accessibility compliance

### Phase 3: Hero Section Enhancement (Priority: High)

1. Update height classes in `RefactoredHeroSection.tsx`
2. Increase logo sizing
3. Test responsive behavior across devices
4. Measure performance impact on LCP

### Phase 4: Product Card Consistency (Priority: High)

1. Standardize card styling across all pages
2. Ensure clip-corners utility is applied consistently
3. Test hover states and interactions
4. Verify image loading and error handling

### Phase 5: Product Detail Layout (Priority: Medium)

1. Remove height restrictions from image column
2. Implement flexible image grid
3. Test on various screen sizes
4. Ensure sticky sidebar works on desktop

### Phase 6: About Page Redesign (Priority: Medium)

1. Reduce top image height
2. Integrate logo into design
3. Replace decorative elements with gold-outlined cards
4. Test responsive layout

### Performance Considerations

**Image Optimization**:

- Use Next.js Image component with appropriate sizes
- Implement lazy loading for below-fold images
- Set priority flag for hero images
- Use WebP format with fallbacks

**CSS Optimization**:

- Leverage TailwindCSS 4 JIT compilation
- Minimize custom CSS
- Use CSS custom properties for theming
- Avoid inline styles where possible

**Bundle Size**:

- Monitor JavaScript bundle size
- Code-split heavy components
- Lazy load non-critical features
- Tree-shake unused dependencies

### Browser Compatibility

**Target Browsers**:

- Chrome/Edge: Last 2 versions
- Firefox: Last 2 versions
- Safari: Last 2 versions
- Mobile Safari: iOS 14+
- Chrome Mobile: Android 10+

**Fallbacks**:

- CSS Grid with flexbox fallback
- CSS custom properties with static fallbacks
- Modern image formats with JPEG/PNG fallbacks
- Intersection Observer with scroll fallback

### Deployment Strategy

**Pre-deployment Checklist**:

- [ ] All translation keys validated
- [ ] Visual regression tests passed
- [ ] Accessibility audit completed
- [ ] Performance benchmarks met
- [ ] Cross-browser testing completed
- [ ] Mobile testing on real devices

**Rollout Plan**:

1. Deploy to staging environment
2. Run full test suite
3. Conduct user acceptance testing
4. Monitor error logs and performance
5. Deploy to production with feature flags
6. Monitor real user metrics
7. Gradually enable for all users

**Rollback Plan**:

- Keep previous version deployable
- Monitor error rates post-deployment
- Have rollback script ready
- Document rollback procedure
- Test rollback in staging first

## Design Decisions and Rationale

### Why Teal-800 for H1/H2?

- Provides strong visual hierarchy
- Maintains funeral-appropriate aesthetic
- Offers excellent contrast on amber backgrounds
- Aligns with brand identity

### Why Amber-100 for H3/P?

- Creates clear distinction from primary headings
- Ensures readability on teal backgrounds
- Maintains warm, welcoming tone
- Consistent with existing design system

### Why Increase Hero Section Size?

- Hero is the first impression for visitors
- Larger size increases visual impact
- Better showcases company logo and branding
- Improves engagement metrics

### Why Standardize Product Cards?

- Consistency improves user experience
- Reduces cognitive load for users
- Easier maintenance and updates
- Professional appearance across site

### Why Remove Height Restrictions on Product Detail?

- Accommodates varying numbers of product images
- Better experience on large monitors
- Reduces unnecessary scrolling
- More flexible for future content

### Why Gold-Outlined Elements on About Page?

- More elegant than simple dots
- Better aligns with premium brand positioning
- Provides visual interest without distraction
- Maintains funeral-appropriate aesthetic

## Future Enhancements

### Potential Improvements

1. **Dark Mode Support**: Add dark theme option for user preference
2. **Animation Refinements**: Enhance transitions and micro-interactions
3. **Advanced Image Gallery**: Implement zoom and lightbox features
4. **Personalization**: Remember user preferences for layout and colors
5. **A/B Testing**: Test different hero sizes and card layouts
6. **Progressive Web App**: Add offline support and app-like features

### Technical Debt to Address

1. Consolidate duplicate styling code
2. Improve type safety in translation system
3. Optimize image loading strategy
4. Refactor legacy components to use design tokens
5. Implement comprehensive error boundary system

## Conclusion

This design provides a comprehensive solution to the identified issues while maintaining the existing architecture and design system. The phased approach allows for incremental implementation and testing, reducing risk and ensuring quality. The focus on accessibility, performance, and user experience ensures the refactored site will meet both business goals and user needs.
