# Component Architecture - Atomic Design System

This directory contains all UI components organized following atomic design principles for the funeral wreaths e-commerce platform.

## Architecture Overview

Our component system is built on **Atomic Design** methodology, providing a scalable and maintainable structure:

```
Atoms → Molecules → Organisms → Templates → Pages
```

### Design Principles

1. **Consistency**: All components follow the same patterns and interfaces
2. **Accessibility**: WCAG 2.1 AA compliance built-in
3. **Performance**: Tree-shaking optimized with selective exports
4. **Type Safety**: Full TypeScript support with strict typing
5. **Testability**: Components designed for easy testing
6. **Internationalization**: Built-in i18n support

## Directory Structure

```
src/components/
├── ui/                    # Atoms - Basic building blocks
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── LoadingSpinner.tsx
│   └── index.ts          # Barrel export
├── layout/               # Layout organisms
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── index.ts
├── product/              # Product-related organisms
├── cart/                 # Cart-related organisms
├── auth/                 # Authentication molecules
├── accessibility/        # Accessibility utilities
└── index.ts             # Main barrel export
```

## Component Levels

### Atoms (UI Components)

Basic building blocks that can't be broken down further:

- `Button` - Interactive buttons with variants
- `Input` - Form input fields
- `LoadingSpinner` - Loading indicators
- `OptimizedImage` - Performance-optimized images

**Usage:**

```tsx
import { Button, Input } from "@/components/ui";

<Button variant="primary" size="md">
  Click me
</Button>
```

### Molecules

Simple combinations of atoms:

- `FormField` - Input with label and validation
- `ProductCard` - Product display with image and details
- `SearchBox` - Input with search functionality

**Usage:**

```tsx
import { ProductCard } from "@/components/product";

<ProductCard
  product={product}
  onAddToCart={handleAddToCart}
  locale="cs"
/>
```

### Organisms

Complex UI sections combining molecules and atoms:

- `Header` - Site navigation and branding
- `ProductGrid` - Grid of product cards
- `CheckoutForm` - Complete checkout process
- `Footer` - Site footer with links

**Usage:**

```tsx
import { Header, ProductGrid } from "@/components";

<Header locale="cs" user={user} />
<ProductGrid products={products} loading={loading} />
```

## Component Guidelines

### 1. Component Structure

Every component should follow this structure:

```tsx
import type { ComponentProps } from "@/types/components";
import { cn } from "@/lib/utils";

interface MyComponentProps extends ComponentProps {
  // Component-specific props
}

export function MyComponent({
  className,
  children,
  ...props
}: MyComponentProps) {
  return (
    <div className={cn("base-styles", className)} {...props}>
      {children}
    </div>
  );
}
```

### 2. TypeScript Requirements

- All props must be properly typed
- Use `interface` for component props
- Extend base interfaces from `@/types/components`
- Export prop types for reuse

### 3. Accessibility Standards

- Include proper ARIA attributes
- Support keyboard navigation
- Provide screen reader support
- Test with accessibility tools

### 4. Performance Optimization

- Use `React.memo` for expensive components
- Implement proper `key` props in lists
- Lazy load heavy components
- Optimize re-renders with `useCallback` and `useMemo`

### 5. Styling Guidelines

- Use Tailwind CSS classes
- Follow the design system tokens
- Support responsive design
- Include dark mode support (future)

## Barrel Exports

Each directory includes an `index.ts` file for clean imports:

```tsx
// ✅ Good - Tree-shakeable
import { Button, Input } from "@/components/ui";

// ❌ Avoid - Imports entire module
import * as UI from "@/components/ui";
```

## Testing Strategy

### Unit Tests

Test individual components in isolation:

```tsx
import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui";

test("renders button with text", () => {
  render(<Button>Click me</Button>);
  expect(screen.getByRole("button")).toHaveTextContent("Click me");
});
```

### Integration Tests

Test component interactions:

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { ProductCard } from "@/components/product";

test("adds product to cart when button clicked", () => {
  const mockAddToCart = jest.fn();
  render(
    <ProductCard
      product={mockProduct}
      onAddToCart={mockAddToCart}
    />
  );

  fireEvent.click(screen.getByText("Add to Cart"));
  expect(mockAddToCart).toHaveBeenCalledWith(mockProduct);
});
```

### Accessibility Tests

Ensure components meet accessibility standards:

```tsx
import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";

expect.extend(toHaveNoViolations);

test("has no accessibility violations", async () => {
  const { container } = render(<Button>Accessible button</Button>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## Performance Considerations

### Code Splitting

Heavy components should be dynamically imported:

```tsx
import dynamic from "next/dynamic";

const HeavyComponent = dynamic(() => import("./HeavyComponent"), {
  loading: () => <LoadingSpinner />,
  ssr: false,
});
```

### Bundle Optimization

- Use barrel exports for tree-shaking
- Avoid default exports for better optimization
- Import only what you need from libraries
- Use `React.lazy` for route-based splitting

## Internationalization

Components support multiple languages:

```tsx
import { useTranslations } from "next-intl";

export function MyComponent({ locale }: { locale: Locale }) {
  const t = useTranslations("common");

  return (
    <button>{t("addToCart")}</button>
  );
}
```

## Future Enhancements

### Planned Components

- [ ] `DataTable` - Advanced table with sorting/filtering
- [ ] `Calendar` - Date picker component
- [ ] `Chart` - Data visualization components
- [ ] `Notification` - Toast notifications
- [ ] `Tooltip` - Contextual help tooltips
- [ ] `Modal` - Dialog and modal components
- [ ] `Tabs` - Tabbed interface component
- [ ] `Accordion` - Collapsible content sections

### Planned Features

- [ ] Dark mode support
- [ ] Animation system
- [ ] Advanced theming
- [ ] Component playground/Storybook
- [ ] Design tokens integration
- [ ] Advanced accessibility features

## Contributing

When adding new components:

1. Follow the atomic design principles
2. Include proper TypeScript types
3. Add comprehensive tests
4. Update barrel exports
5. Document component usage
6. Ensure accessibility compliance
7. Test performance impact

## Resources

- [Atomic Design Methodology](https://atomicdesign.bradfrost.com/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)
