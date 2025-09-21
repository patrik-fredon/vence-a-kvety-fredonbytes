# Component Architecture - Atomic Design System

This document outlines the component architecture for the funeral wreaths e-commerce platform, following atomic design principles with enhanced TypeScript support and performance optimizations.

## Architecture Overview

Our component system is built on **Atomic Design** principles, providing a scalable, maintainable, and consistent approach to UI development:

```
Atoms → Molecules → Organisms → Templates → Pages
```

### Design Principles

1. **Atomic Design**: Clear hierarchy from basic building blocks to complex layouts
2. **TypeScript-First**: Strict typing with comprehensive interfaces
3. **Performance-Optimized**: Tree-shaking, lazy loading, and memoization
4. **Accessibility-First**: WCAG 2.1 AA compliance built-in
5. **Design Token Integration**: Consistent styling through design tokens
6. **Funeral-Appropriate**: Respectful, professional visual language

## Component Levels

### Atoms (Basic Building Blocks)

**Location**: `src/components/ui/`

Basic HTML elements with consistent styling and behavior:

- `Button` - Interactive buttons with variants
- `Input` - Form inputs with validation
- `LoadingSpinner` - Loading indicators
- `OptimizedImage` - Performance-optimized images
- `Text` - Typography components
- `Icon` - SVG icons with accessibility

**Characteristics**:

- Single responsibility
- No business logic
- Highly reusable
- Design token integration
- Accessibility built-in

### Molecules (Simple Combinations)

**Location**: `src/components/[feature]/`

Combinations of atoms that form simple UI components:

- `ProductCard` - Product display with image, title, price
- `SearchBox` - Input with search button
- `FormField` - Label, input, and error message
- `NavigationItem` - Link with active state

**Characteristics**:

- Combine 2-5 atoms
- Simple interactions
- Feature-specific logic
- Reusable within context

### Organisms (Complex Sections)

**Location**: `src/components/[feature]/`

Complex UI sections that combine molecules and atoms:

- `ProductGrid` - Grid of product cards with filtering
- `Header` - Navigation, logo, cart, language switcher
- `CheckoutForm` - Multi-step form with validation
- `Footer` - Links, legal information, contact

**Characteristics**:

- Business logic integration
- API data consumption
- Complex state management
- Feature-complete sections

### Templates (Page Layouts)

**Location**: `src/components/layout/`

Page-level layouts that define structure:

- `MainLayout` - Header, main content, footer
- `AuthLayout` - Centered forms with branding
- `CheckoutLayout` - Multi-step process layout
- `AdminLayout` - Dashboard with sidebar

**Characteristics**:

- Define page structure
- Handle global state
- SEO metadata integration
- Responsive behavior

### Pages (Route Components)

**Location**: `src/app/[locale]/`

Next.js page components that use templates:

- Homepage with product teasers
- Product listing and detail pages
- Cart and checkout flow
- User account pages

## TypeScript Integration

### Base Interfaces

All components extend base interfaces for consistency:

```typescript
interface BaseComponentProps {
  className?: string;
  "data-testid"?: string;
  "aria-label"?: string;
}

interface AtomProps extends BaseComponentProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: string;
  disabled?: boolean;
}
```

### Polymorphic Components

Components that can render as different HTML elements:

```typescript
type PolymorphicProps<T extends keyof JSX.IntrinsicElements> = {
  as?: T;
} & ComponentPropsWithoutRef<T>;
```

### Design Token Integration

Type-safe access to design tokens:

```typescript
interface FuneralColorScheme {
  primary: ColorScale;
  secondary: ColorScale;
  accent: ColorScale;
  neutral: ColorScale;
}
```

## Performance Optimizations

### Tree-Shaking

- Barrel exports with selective imports
- ESM module format
- Side-effect free components
- Webpack optimization configuration

### Code Splitting

- Dynamic imports for heavy components
- Route-based splitting
- Component-level lazy loading
- Suspense boundaries

### Memoization

- `React.memo` for expensive renders
- `useMemo` for computed values
- `useCallback` for event handlers
- Custom comparison functions

## Accessibility Features

### Built-in Accessibility

- Semantic HTML elements
- ARIA attributes and roles
- Keyboard navigation support
- Screen reader compatibility
- Focus management

### Testing Integration

- jest-axe for automated testing
- Accessibility test utilities
- WCAG compliance validation
- Screen reader testing

## Design Token System

### Color Palette

Funeral-appropriate colors with semantic meaning:

- **Primary**: Deep forest green (#2D5016) - Nature, growth, eternal life
- **Secondary**: Muted sage (#8B9467) - Subtle contrast, sophistication
- **Accent**: Respectful gold (#D4AF37) - Important highlights
- **Neutral**: Professional grays - Text, backgrounds, borders

### Typography Scale

- **Font Family**: Inter (primary), Georgia (serif), Menlo (mono)
- **Size Scale**: 12px to 128px with consistent ratios
- **Weight Scale**: 100 to 900 with semantic names
- **Line Height**: Optimized for readability

### Spacing System

- **Base Unit**: 4px (0.25rem)
- **Scale**: 0px to 384px with consistent increments
- **Grid System**: 8px grid for alignment
- **Responsive**: Breakpoint-specific spacing

## File Organization

```
src/
├── components/
│   ├── ui/                 # Atoms
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── index.ts
│   ├── product/            # Product-related molecules/organisms
│   │   ├── ProductCard.tsx
│   │   ├── ProductGrid.tsx
│   │   └── index.ts
│   ├── layout/             # Templates
│   │   ├── MainLayout.tsx
│   │   └── index.ts
│   ├── ARCHITECTURE.md     # This file
│   └── index.ts           # Main barrel export
├── lib/
│   ├── components/         # Component utilities
│   │   ├── base.ts
│   │   ├── factory.ts
│   │   └── index.ts
│   ├── design-tokens.ts    # Design system tokens
│   └── utils.ts           # Utility functions
└── types/
    └── components.ts       # Component type definitions
```

## Development Guidelines

### Component Creation

1. **Start with Types**: Define interfaces before implementation
2. **Use Factories**: Leverage component factories for consistency
3. **Include Tests**: Write tests alongside components
4. **Document Props**: Use JSDoc for prop documentation
5. **Accessibility First**: Include ARIA attributes and keyboard support

### Naming Conventions

- **Components**: PascalCase (`ProductCard`)
- **Props**: camelCase (`isLoading`)
- **Files**: PascalCase for components (`ProductCard.tsx`)
- **Directories**: kebab-case (`product-grid`)

### Import/Export Patterns

```typescript
// Barrel exports for tree-shaking
export { Button } from "./Button";
export { Input } from "./Input";
export type { ButtonProps, InputProps } from "@/types/components";

// Dynamic imports for code splitting
const HeavyComponent = lazy(() => import("./HeavyComponent"));
```

### Performance Best Practices

1. **Memoize Expensive Operations**: Use `useMemo` and `useCallback`
2. **Lazy Load Heavy Components**: Use `React.lazy` and `Suspense`
3. **Optimize Re-renders**: Use `React.memo` with custom comparison
4. **Bundle Analysis**: Regular bundle size monitoring
5. **Tree-shaking**: Ensure side-effect free exports

## Testing Strategy

### Unit Testing

- Component rendering tests
- Props validation tests
- Accessibility tests with jest-axe
- Interaction tests with user-event

### Integration Testing

- Component composition tests
- Context integration tests
- API integration tests
- Form submission tests

### Visual Testing

- Storybook for component documentation
- Visual regression testing
- Cross-browser compatibility
- Responsive design validation

## Migration Guide

### From Existing Components

1. **Audit Current Components**: Identify atoms, molecules, organisms
2. **Extract Common Patterns**: Create reusable base components
3. **Apply Design Tokens**: Replace hardcoded styles
4. **Add TypeScript**: Enhance with proper typing
5. **Optimize Performance**: Add memoization and lazy loading

### Breaking Changes

- Component prop interfaces may change
- CSS class names will be updated
- Import paths will be reorganized
- Some components may be deprecated

## Future Enhancements

### Planned Features

- [ ] Animation system integration
- [ ] Theme switching capabilities
- [ ] Advanced virtualization
- [ ] Micro-interaction library
- [ ] Component composition utilities

### Performance Goals

- [ ] 20%+ bundle size reduction
- [ ] Improved Core Web Vitals scores
- [ ] Faster component rendering
- [ ] Better tree-shaking efficiency
- [ ] Enhanced caching strategies

This architecture provides a solid foundation for building scalable, maintainable, and performant components while maintaining the respectful, professional tone appropriate for funeral wreath commerce.
