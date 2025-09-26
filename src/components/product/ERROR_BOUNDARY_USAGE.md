# Product Component Error Boundary Usage Guide

This document explains how to use the ProductComponentErrorBoundary system for graceful error handling in product components.

## Overview

The ProductComponentErrorBoundary provides specialized error handling for product-related components with:

- **Graceful degradation** - Components fail safely without breaking the entire page
- **Accessibility compliance** - Error states maintain WCAG 2.1 AA standards
- **Production debugging** - Comprehensive error logging with context
- **User-friendly recovery** - Retry functionality and clear error messages

## Components

### 1. ProductComponentErrorBoundary

Main error boundary class component for wrapping product components.

```tsx
import { ProductComponentErrorBoundary } from "@/components/product";

<ProductComponentErrorBoundary
  componentName="ProductCard"
  onError={(error, errorInfo) => {
    // Custom error handling
    console.error("Product component error:", error);
  }}
>
  <ProductCard product={product} />
</ProductComponentErrorBoundary>
```

### 2. Specialized Fallback Components

#### ProductErrorFallback

General-purpose error fallback for product components.

```tsx
<ProductErrorFallback
  error={error}
  onRetry={() => window.location.reload()}
  componentName="ProductCustomizer"
  errorId="error-123"
/>
```

#### ProductCardErrorFallback

Optimized for product card layouts in grids.

```tsx
<ProductCardErrorFallback
  error={error}
  onRetry={handleRetry}
  errorId="card-error-456"
/>
```

#### ProductFiltersErrorFallback

Minimal fallback for filter components that don't break the main product flow.

```tsx
<ProductFiltersErrorFallback
  error={error}
  onRetry={handleRetry}
  errorId="filters-error-789"
/>
```

### 3. Higher-Order Component

Wrap components with error boundaries using the HOC pattern:

```tsx
import { withProductErrorBoundary } from "@/components/product";

const SafeProductCard = withProductErrorBoundary(
  ProductCard,
  "ProductCard",
  <ProductCardErrorFallback />
);

// Use like a normal component
<SafeProductCard product={product} locale={locale} />
```

### 4. Error Handler Hook

Handle async errors in product components:

```tsx
import { useProductErrorHandler } from "@/components/product";

function ProductComponent() {
  const { handleAsyncError } = useProductErrorHandler();

  const handleAddToCart = async (product) => {
    try {
      await addToCartAPI(product);
    } catch (error) {
      handleAsyncError(error, {
        componentName: "ProductComponent",
        action: "addToCart",
        productId: product.id,
      });
    }
  };

  return <button onClick={() => handleAddToCart(product)}>Add to Cart</button>;
}
```

## Integration Examples

### 1. ProductGrid with Error Boundaries

```tsx
import {
  ProductGridWithErrorBoundary,
  ProductFiltersWithErrorBoundary
} from "@/components/product";

function ProductPage() {
  return (
    <div>
      {/* Filters with error boundary */}
      <ProductFiltersWithErrorBoundary
        categories={categories}
        filters={filters}
        sortOptions={sortOptions}
        onFiltersChange={setFilters}
        onSortChange={setSortOptions}
        locale={locale}
      />

      {/* Product grid with error boundary */}
      <ProductGridWithErrorBoundary
        initialProducts={products}
        locale={locale}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}
```

### 2. Individual Product Cards

```tsx
import { ProductComponentErrorBoundary, ProductCardErrorFallback } from "@/components/product";

function ProductGrid({ products }) {
  return (
    <div className="grid grid-cols-3 gap-6">
      {products.map(product => (
        <ProductComponentErrorBoundary
          key={product.id}
          componentName="ProductCard"
          fallbackComponent={<ProductCardErrorFallback />}
        >
          <ProductCard product={product} />
        </ProductComponentErrorBoundary>
      ))}
    </div>
  );
}
```

### 3. Resilient Product Page

```tsx
import { ResilientProductPage } from "@/components/product";

// Complete product page with error boundaries for all components
<ResilientProductPage
  initialProducts={products}
  initialCategories={categories}
  locale={locale}
  onAddToCart={handleAddToCart}
/>
```

## Error Logging and Monitoring

### Automatic Error Logging

All errors are automatically logged with context:

```typescript
{
  level: "component",
  context: "product-component-ProductCard",
  errorId: "product_err_1234567890_abc123",
  timestamp: "2024-01-01T12:00:00.000Z",
  userAgent: "Mozilla/5.0...",
  url: "https://example.com/products",
  productComponent: "ProductCard",
  productId: "product-123", // if available
  action: "addToCart", // if available
}
```

### Custom Error Handling

```tsx
<ProductComponentErrorBoundary
  componentName="ProductCustomizer"
  onError={(error, errorInfo) => {
    // Send to analytics
    if (window.gtag) {
      window.gtag("event", "exception", {
        description: `Product component error: ${error.message}`,
        fatal: false,
      });
    }

    // Send to error reporting service
    if (window.Sentry) {
      window.Sentry.captureException(error, {
        contexts: {
          errorInfo,
          component: "ProductCustomizer",
        },
      });
    }
  }}
>
  <ProductCustomizer />
</ProductComponentErrorBoundary>
```

## Accessibility Features

### ARIA Attributes

All error fallbacks include proper ARIA attributes:

- `role="alert"` - Announces errors to screen readers
- `aria-live="polite"` - Non-intrusive announcements
- `aria-label` - Descriptive labels for retry buttons

### Keyboard Navigation

- Retry buttons are focusable and keyboard accessible
- Tab order is maintained in error states
- Focus management during error recovery

### Color Contrast

All error states meet WCAG 2.1 AA contrast requirements:

- Error text: Sufficient contrast against backgrounds
- Interactive elements: Clear focus indicators
- Icons and symbols: Accessible color combinations

## Testing Error Scenarios

### Development Testing

Use the ErrorTestingDashboard component in development:

```tsx
import { ErrorTestingDashboard } from "@/components/product";

// Only available in development
if (process.env.NODE_ENV === "development") {
  return <ErrorTestingDashboard />;
}
```

### Manual Testing

1. **Synchronous Errors**: Modify components to throw errors
2. **Async Errors**: Simulate network failures
3. **Recovery Testing**: Test retry functionality
4. **Accessibility Testing**: Use screen readers and keyboard navigation

### Automated Testing

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { ProductComponentErrorBoundary } from "@/components/product";

test("should handle component errors gracefully", () => {
  const ThrowingComponent = () => {
    throw new Error("Test error");
  };

  render(
    <ProductComponentErrorBoundary componentName="TestComponent">
      <ThrowingComponent />
    </ProductComponentErrorBoundary>
  );

  expect(screen.getByText("Komponenta se nepodařila načíst")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /zkusit znovu/i })).toBeInTheDocument();
});
```

## Best Practices

### 1. Component Granularity

- Wrap individual components rather than large sections
- Use specific error boundaries for different component types
- Avoid wrapping the entire application in a single boundary

### 2. Error Context

- Always provide meaningful component names
- Include relevant product IDs and action context
- Add custom error handlers for analytics and monitoring

### 3. Fallback UI

- Design fallbacks that match the expected component size
- Provide clear error messages in the user's language
- Include retry functionality where appropriate

### 4. Performance

- Error boundaries don't impact performance when no errors occur
- Fallback components are lightweight and fast to render
- Error logging is optimized for production use

## Production Considerations

### Error Reporting

Set up error reporting to monitor production issues:

```tsx
const handleProductError = (error, errorInfo) => {
  // Production error reporting
  fetch("/api/errors", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      error: error.message,
      stack: error.stack,
      errorInfo,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    }),
  });
};
```

### Monitoring

- Track error rates by component type
- Monitor retry success rates
- Alert on critical component failures

### User Experience

- Provide helpful error messages in Czech and English
- Include contact information for persistent issues
- Maintain site functionality even with component failures

## Troubleshooting

### Common Issues

1. **Error boundary not catching errors**
   - Ensure errors occur during render, not in event handlers
   - Use the error handler hook for async errors

2. **Retry not working**
   - Check that the error condition has been resolved
   - Verify the retry handler resets component state

3. **Accessibility issues**
   - Test with screen readers
   - Verify keyboard navigation works
   - Check color contrast ratios

### Debug Mode

In development, error boundaries show technical details:

- Full error stack traces
- Component hierarchy information
- Error boundary state information

This helps developers identify and fix issues quickly while providing a polished experience for users.
