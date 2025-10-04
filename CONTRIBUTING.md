# Contributing to Pohřební věnce E-commerce Platform

Thank you for your interest in contributing to our funeral wreaths e-commerce platform! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)

## Code of Conduct

### Our Commitment

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of background, experience level, or identity.

### Expected Behavior

- **Be respectful**: Treat all community members with respect and kindness
- **Be collaborative**: Work together constructively and help others learn
- **Be inclusive**: Welcome newcomers and help them get started
- **Be professional**: Maintain a professional tone in all communications
- **Be patient**: Remember that everyone has different experience levels

### Unacceptable Behavior

- Harassment, discrimination, or offensive comments
- Personal attacks or trolling
- Publishing private information without consent
- Any behavior that would be inappropriate in a professional setting

## Getting Started

### Prerequisites

- **Node.js**: 18+ (recommended: 20+)
- **Git**: For version control
- **Code Editor**: VS Code recommended with suggested extensions
- **Basic Knowledge**: TypeScript, React, Next.js fundamentals

### Development Setup

1. **Fork and Clone**

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/pohrebni-vence.git
cd pohrebni-vence

# Add upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/pohrebni-vence.git
```

2. **Install Dependencies**

```bash
npm install
```

3. **Environment Configuration**

```bash
# Copy environment template
cp .env.example .env.local

# Configure required variables (see README.md for details)
# Minimum required for development:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - NEXTAUTH_SECRET
```

4. **Start Development Server**

```bash
npm run dev
```

5. **Verify Setup**

- Open <http://localhost:3000>
- Check that the homepage loads correctly
- Verify language switching works
- Test basic navigation

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "biomejs.biome",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "streetsidesoftware.code-spell-checker",
    "ms-playwright.playwright",
    "formulahendry.auto-rename-tag"
  ]
}
```

## Current Project Status

### Production Readiness - ACHIEVED ✅

The project has successfully completed all major optimization phases and is production-ready:

#### ✅ Foundation Phase (Completed)

- **TypeScript Optimization**: Resolved 294+ TypeScript errors across 52 files (31% reduction)
- **Strict Type Checking**: Enabled production-ready TypeScript configuration with `ignoreBuildErrors: false`
- **Database Type Safety**: Complete Supabase integration with proper RLS policies
- **Build Process**: Zero errors in production builds with strict mode enabled

#### ✅ Cleanup Phase (Completed)

- **Bundle Optimization**: 15-20% reduction in bundle size achieved
- **Dynamic Imports**: Lazy loading for admin, payment, monitoring, and accessibility components
- **Tree Shaking**: Optimized imports with centralized icon management in `@/lib/icons`
- **Dependency Cleanup**: Removed unused dependencies and optimized all imports
- **Chunk Optimization**: All chunks under 244KB target (largest: 54.2KB)

#### ✅ Performance Phase (Completed)

- **Advanced Code Splitting**: Route-based optimization with granular cache groups
- **Modern Build Features**: Next.js 15 `optimizePackageImports` for 15+ libraries
- **Performance Monitoring**: Complete Core Web Vitals integration with real-time tracking
- **Image Optimization**: Enhanced Next.js Image configuration with quality presets (50-95)
- **Caching Strategy**: Production-ready Redis caching with comprehensive synchronization

#### ✅ Additional Achievements

- **Accessibility**: WCAG 2.1 AA compliant with comprehensive features
- **Monitoring Dashboard**: Admin interface for performance insights and error analysis
- **Cache Management**: Redis caching with automatic invalidation and explicit clearing
- **Error Tracking**: Production-grade error logging with categorization
- **Documentation**: Comprehensive technical documentation for all systems

### Development Standards

All new contributions must maintain the achieved production-ready standards:

- **Zero TypeScript Errors**: Production builds must pass strict type checking (no exceptions)
- **Bundle Size Awareness**: Monitor impact with `npm run analyze` before submitting
- **Dynamic Loading**: Use lazy imports for non-critical components (>50KB)
- **Centralized Icons**: Import icons from `@/lib/icons` for optimal tree-shaking
- **Performance Monitoring**: Add `usePerformanceMonitor` to complex components
- **Cache Strategy**: Follow established TTL patterns and invalidation rules
- **Accessibility**: Maintain WCAG 2.1 AA compliance in all new features
- **Documentation**: Update relevant docs for any architectural changes

## Development Workflow

### Branch Strategy

- **main**: Production-ready code
- **develop**: Integration branch for features
- **feature/**: New features (`feature/product-customization`)
- **fix/**: Bug fixes (`fix/cart-quantity-update`)
- **docs/**: Documentation updates (`docs/api-reference`)

### Workflow Steps

1. **Create Feature Branch**

```bash
# Update main branch
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name
```

2. **Make Changes**

- Follow coding standards (see below)
- Write tests for new functionality
- Update documentation as needed
- Commit changes with clear messages

3. **Test Your Changes**

```bash
# Run all quality checks
npm run test:all

# Run specific test suites
npm run test           # Unit tests
npm run test:e2e       # End-to-end tests
npm run lint           # Code linting (Biome - zero errors/warnings required)
npm run type-check     # TypeScript checking (strict mode enabled)

# Performance and bundle analysis
npm run analyze        # Bundle size analysis
npm run analyze:imports # Import optimization analysis
```

4. **Commit Guidelines**

```bash
# Use conventional commit format
git commit -m "feat: add product customization options"
git commit -m "fix: resolve cart quantity update issue"
git commit -m "docs: update API documentation"
git commit -m "test: add unit tests for cart functionality"
```

5. **Push and Create PR**

```bash
# Push to your fork
git push origin feature/your-feature-name

# Create pull request on GitHub
```

### Commit Message Format

We use [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**

```
feat(cart): add persistent cart functionality
fix(checkout): resolve payment validation error
docs(api): update product endpoints documentation
test(product): add unit tests for product filtering
```

## Coding Standards

### TypeScript Guidelines

#### Strict Type Safety

```typescript
// ✅ Good: Explicit types
interface ProductProps {
  product: Product;
  locale: Locale;
  onAddToCart?: (product: Product) => void;
}

// ❌ Bad: Any types
function handleProduct(product: any) {
  // ...
}

// ✅ Good: Proper error handling
try {
  const result = await apiCall();
  return result;
} catch (error) {
  if (error instanceof ApiError) {
    throw new Error(`API Error: ${error.message}`);
  }
  throw error;
}
```

#### Component Patterns

```typescript
// ✅ Good: Proper component structure
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  loading = false,
  children,
  className,
  disabled,
  ...props
}) => {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-medium transition-colors",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <LoadingSpinner className="mr-2" />}
      {children}
    </button>
  );
};
```

### React Best Practices

#### Component Organization

```typescript
// ✅ Good: Organized imports
import React, { useState, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/lib/cart/context";
import type { Product } from "@/types/product";

// ✅ Good: Custom hooks for logic
function useProductCustomization(product: Product) {
  const [customizations, setCustomizations] = useState<Customization[]>([]);

  const totalPrice = useMemo(() => {
    return calculatePrice(product.base_price, customizations);
  }, [product.base_price, customizations]);

  const addCustomization = useCallback((customization: Customization) => {
    setCustomizations((prev) => [...prev, customization]);
  }, []);

  return { customizations, totalPrice, addCustomization };
}
```

#### Performance Optimization

```typescript
// ✅ Good: Memoized components
export const ProductCard = React.memo<ProductCardProps>(
  ({ product, locale, onAddToCart }) => {
    // Component implementation
  },
  (prevProps, nextProps) => {
    return (
      prevProps.product.id === nextProps.product.id &&
      prevProps.locale === nextProps.locale
    );
  }
);

// ✅ Good: Dynamic imports for large components
const AdminDashboard = lazy(() => import("@/components/admin/AdminDashboard"));
const PaymentForm = lazy(() => import("@/components/payments/PaymentForm"));

// Usage with Suspense and proper loading states
<Suspense fallback={<LoadingSpinner />}>
  <AdminDashboard />
</Suspense>;

// ✅ Good: Centralized icon imports for tree-shaking
import { XMarkIcon, ShoppingCartIcon } from "@/lib/icons";

// ❌ Bad: Direct heroicons imports
import { XMarkIcon } from "@heroicons/react/24/outline";
```

### CSS and Styling

#### Tailwind CSS Guidelines

```typescript
// ✅ Good: Semantic class organization
const buttonClasses = {
  base: 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
  variants: {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500',
    secondary: 'bg-secondary-600 hover:bg-secondary-700 text-white focus:ring-secondary-500',
    outline: 'border-2 border-primary-600 text-primary-700 hover:bg-primary-50 focus:ring-primary-500'
  },
  sizes: {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }
};

// ✅ Good: Responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
```

#### Design System Usage

```typescript
// ✅ Good: Use design tokens
const colors = {
  primary: {
    50: '#f0f9f0',
    600: '#2d5016',
    700: '#1f3a0f'
  }
};

// ✅ Good: Consistent spacing
<div className="p-4 md:p-6 lg:p-8"> {/* 4px base unit */}
```

### API Development

#### Route Structure

```typescript
// ✅ Good: Proper error handling and validation
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Validate input
    const params = ProductQuerySchema.parse({
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "12"),
    });

    // Business logic
    const products = await getProducts(params);

    return NextResponse.json({
      data: products,
      success: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid parameters", details: error.errors },
        { status: 400 }
      );
    }

    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

#### Database Operations

```typescript
// ✅ Good: Type-safe database operations
export async function getProducts(
  params: ProductQueryParams
): Promise<ProductsResponse> {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      category:categories(id, name_cs, name_en, slug)
    `
    )
    .eq("active", true)
    .range(params.offset, params.offset + params.limit - 1)
    .order("created_at", { ascending: false });

  if (error) {
    throw new DatabaseError(`Failed to fetch products: ${error.message}`);
  }

  return {
    products: data || [],
    total: data?.length || 0,
  };
}
```

## Testing Guidelines

### Unit Testing

#### Component Tests

```typescript
// ✅ Good: Comprehensive component testing
describe("ProductCard", () => {
  const mockProduct: Product = {
    id: "1",
    name_cs: "Test věnec",
    name_en: "Test wreath",
    base_price: 1500,
    images: [{ url: "/test.jpg", alt: "Test" }],
  };

  it("renders product information correctly", () => {
    render(<ProductCard product={mockProduct} locale="cs" />);

    expect(screen.getByText("Test věnec")).toBeInTheDocument();
    expect(screen.getByText("1 500 Kč")).toBeInTheDocument();
  });

  it("handles add to cart interaction", async () => {
    const mockAddToCart = jest.fn();
    render(
      <ProductCard
        product={mockProduct}
        locale="cs"
        onAddToCart={mockAddToCart}
      />
    );

    await user.click(screen.getByRole("button", { name: /přidat do košíku/i }));
    expect(mockAddToCart).toHaveBeenCalledWith(mockProduct);
  });

  it("meets accessibility requirements", async () => {
    const { container } = render(
      <ProductCard product={mockProduct} locale="cs" />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

#### API Tests

```typescript
// ✅ Good: API endpoint testing
describe("/api/products", () => {
  it("returns products with valid parameters", async () => {
    const response = await GET(
      new NextRequest("http://localhost/api/products?page=1&limit=12")
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data.products)).toBe(true);
  });

  it("validates query parameters", async () => {
    const response = await GET(
      new NextRequest("http://localhost/api/products?page=invalid")
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid parameters");
  });
});
```

### End-to-End Testing

#### User Journey Tests

```typescript
// ✅ Good: Complete user flow testing
test("complete product purchase flow", async ({ page }) => {
  // Navigate to product
  await page.goto("/cs/products/funeral-wreath-roses");

  // Customize product
  await page.selectOption('[data-testid="size-select"]', "medium");
  await page.selectOption('[data-testid="ribbon-select"]', "gold");

  // Add to cart
  await page.click('[data-testid="add-to-cart"]');
  await expect(page.locator('[data-testid="cart-count"]')).toContainText("1");

  // Proceed to checkout
  await page.click('[data-testid="cart-icon"]');
  await page.click('[data-testid="checkout-button"]');

  // Fill customer information
  await page.fill('[name="firstName"]', "Jan");
  await page.fill('[name="lastName"]', "Novák");
  await page.fill('[name="email"]', "jan@example.com");

  // Complete order
  await page.click('[data-testid="place-order"]');

  // Verify success
  await expect(page.locator("h1")).toContainText(
    "Objednávka byla úspěšně vytvořena"
  );
});
```

### Accessibility Testing

#### Automated Testing

```typescript
// ✅ Good: Accessibility testing integration
import { axe, toHaveNoViolations } from "jest-axe";

expect.extend(toHaveNoViolations);

describe("Accessibility", () => {
  it("homepage meets WCAG standards", async () => {
    render(<HomePage />);
    const results = await axe(document.body);
    expect(results).toHaveNoViolations();
  });
});
```

#### Manual Testing Checklist

- [ ] Keyboard navigation works for all interactive elements
- [ ] Screen reader announces content correctly
- [ ] Color contrast meets WCAG AA standards
- [ ] Focus indicators are visible
- [ ] Form labels are properly associated
- [ ] Error messages are accessible

## Documentation

### Code Documentation

#### JSDoc Comments

````typescript
/**
 * Calculates the total price for a product with customizations
 * @param basePrice - The base price of the product
 * @param customizations - Array of customization options
 * @returns The calculated total price including all customizations
 * @example
 * ```typescript
 * const price = calculatePrice(1500, [
 *   { type: 'size', value: 'large', price_modifier: 500 }
 * ]);
 * // Returns: 2000
 * ```
 */
export function calculatePrice(
  basePrice: number,
  customizations: Customization[]
): number {
  return customizations.reduce(
    (total, customization) => total + customization.price_modifier,
    basePrice
  );
}
````

#### README Updates

When adding new features, update relevant documentation:

- API endpoints in `docs/API_REFERENCE.md`
- Component usage in component README files
- Configuration changes in main `README.md`
- Deployment steps in `docs/DEPLOYMENT_GUIDE.md`

### Internationalization

#### Adding New Translations

```typescript
// 1. Add keys to both language files
// messages/cs.json
{
  "product": {
    "newFeature": "Nová funkce"
  }
}

// messages/en.json
{
  "product": {
    "newFeature": "New feature"
  }
}

// 2. Use in components
const t = useTranslations('product');
return <span>{t('newFeature')}</span>;
```

## Pull Request Process

### Before Submitting

1. **Self Review**

   - [ ] Code follows project standards
   - [ ] All tests pass locally
   - [ ] TypeScript build succeeds with zero errors
   - [ ] Bundle size impact analyzed (if applicable)
   - [ ] Documentation is updated
   - [ ] No console errors or warnings
   - [ ] Accessibility requirements met

2. **Testing Checklist**
   - [ ] Unit tests written for new functionality
   - [ ] E2E tests updated if needed
   - [ ] Manual testing completed
   - [ ] Cross-browser testing (Chrome, Firefox, Safari)
   - [ ] Mobile responsiveness verified
   - [ ] Performance impact assessed (Core Web Vitals)

### PR Template

```markdown
## Description

Brief description of changes and motivation.

## Type of Change

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing

- [ ] Unit tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed
- [ ] Accessibility testing completed

## Screenshots (if applicable)

Add screenshots for UI changes.

## Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] No breaking changes (or clearly documented)
```

### Review Process

1. **Automated Checks**: All CI checks must pass
2. **Code Review**: At least one maintainer review required
3. **Testing**: Reviewer tests functionality manually
4. **Approval**: Maintainer approves and merges

### After Merge

- Delete feature branch
- Update local main branch
- Monitor deployment for any issues

## Issue Reporting

### Bug Reports

Use the bug report template:

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:

1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**

- OS: [e.g. iOS]
- Browser: [e.g. chrome, safari]
- Version: [e.g. 22]

**Additional context**
Any other context about the problem.
```

### Feature Requests

Use the feature request template:

```markdown
**Is your feature request related to a problem?**
A clear description of what the problem is.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Alternative solutions or features you've considered.

**Additional context**
Any other context or screenshots about the feature request.
```

### Security Issues

For security vulnerabilities:

1. **Do not** create a public issue
2. Email security concerns to: <security@ketingmar.cz>
3. Include detailed description and reproduction steps
4. Allow time for investigation and fix before disclosure

## Community

### Getting Help

- **Documentation**: Check README and docs folder first
- **Discussions**: Use GitHub Discussions for questions
- **Issues**: Create issues for bugs and feature requests
- **Email**: Contact maintainers at <dev@ketingmar.cz>

### Recognition

Contributors are recognized in:

- GitHub contributors list
- Release notes for significant contributions
- Annual contributor acknowledgments

Thank you for contributing to the Pohřební věnce e-commerce platform! Your contributions help us provide a better service during difficult times for our customers.
