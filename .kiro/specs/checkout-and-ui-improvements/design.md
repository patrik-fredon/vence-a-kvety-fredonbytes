# Design Document

## Overview

This design document outlines the technical approach for implementing critical UX improvements across the checkout flow, shopping cart, and product display components. The solution addresses form validation logic, image rendering consistency, layout optimization, and centralized background gradient management. The implementation will leverage Next.js 15 App Router patterns, React 19 hooks, TypeScript strict typing, and Tailwind CSS 4 for styling.

## Architecture

### High-Level Component Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    Tailwind Config Layer                     │
│  (Centralized gradient definitions & design tokens)          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Application Layout Layer                   │
│  (Global background application via className)               │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────────┐    ┌──────────────┐
│   Checkout   │    │  Shopping Cart   │    │   Product    │
│   Component  │    │    Component     │    │  Components  │
└──────────────┘    └──────────────────┘    └──────────────┘
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────────┐    ┌──────────────┐
│ Step-based   │    │  Cart API +      │    │ Image Grid   │
│ Validation   │    │  Redis Cache     │    │ Layout       │
└──────────────┘    └──────────────────┘    └──────────────┘
```

### Data Flow

#### Checkout Form Validation Flow

```
User Input → Current Step Validator → Step-Specific Schema
                                            ↓
                                    Validation Result
                                            ↓
                                    Error Display / Next Step
```

#### Cart Image Rendering Flow

```
Cart Item → Product Data Fetch → Image URL Resolution
                                        ↓
                                  Next.js Image Component
                                        ↓
                                  Optimized Display
```

#### Redis Cache Synchronization Flow

```
Cart Operation → Optimistic UI Update → API Call
                                            ↓
                                    Redis Update
                                            ↓
                                    State Reconciliation
```

## Components and Interfaces

### 1. Checkout Form Validation Enhancement

#### Modified Component: `CheckoutForm.tsx`

**Current Issue:**
The `validateCurrentStep()` function validates all form fields regardless of the current step, blocking progression.

**Solution:**
Implement step-scoped validation that only validates fields visible in the current step.

**Interface Changes:**

```typescript
// Enhanced validation function signature
type StepValidationSchema = {
  customer: (data: CustomerInfo) => ValidationErrors;
  delivery: (data: DeliveryInfo) => ValidationErrors;
  payment: (data: PaymentInfo) => ValidationErrors;
  review: (data: CheckoutFormData) => ValidationErrors;
};

// Step-specific field definitions
const STEP_FIELDS = {
  customer: ['email', 'firstName', 'lastName', 'phone'],
  delivery: ['address', 'city', 'postalCode', 'deliveryDate'],
  payment: ['paymentMethod'],
  review: [] // All fields validated in previous steps
} as const;
```

**Implementation Strategy:**

1. Create step-specific validation schemas
2. Modify `validateCurrentStep()` to only validate current step fields
3. Add progressive validation that accumulates validated data
4. Implement step completion tracking

### 2. Shopping Cart Image Display

#### Modified Component: `ShoppingCart.tsx`

**Current Issue:**
Product images are not rendering properly due to missing or incorrect image URL resolution.

**Solution:**
Enhance image rendering logic with proper fallbacks and loading states.

**Interface Changes:**

```typescript
interface CartItemImageProps {
  item: CartItem;
  locale: string;
  size?: 'sm' | 'md' | 'lg';
}

// Image resolution utility
function resolveCartItemImage(item: CartItem): string | null {
  // Priority: primary image → first image → fallback
  if (item.product?.images) {
    const primaryImage = item.product.images.find(img => img.isPrimary);
    if (primaryImage?.url) return primaryImage.url;

    if (item.product.images[0]?.url) return item.product.images[0].url;
  }

  return null;
}
```

**Implementation Strategy:**

1. Create `CartItemImage` component with proper error handling
2. Implement image URL resolution with fallback chain
3. Add loading skeleton for image loading states
4. Use Next.js Image component with proper sizing

### 3. Product Grid Primary Image Display

#### Modified Component: `ProductCard.tsx`

**Current Issue:**
Primary images are not being displayed on product cards in the grid.

**Solution:**
Implement robust primary image resolution with fallback logic.

**Interface Changes:**

```typescript
interface ProductImageResolution {
  url: string;
  alt: string;
  isPrimary: boolean;
  fallbackUsed: boolean;
}

function resolvePrimaryProductImage(
  product: Product,
  locale: string
): ProductImageResolution {
  // 1. Try to find explicitly marked primary image
  const primaryImage = product.images?.find(img => img.isPrimary);
  if (primaryImage) {
    return {
      url: primaryImage.url,
      alt: primaryImage.alt || product.name[locale],
      isPrimary: true,
      fallbackUsed: false
    };
  }

  // 2. Use first available image
  if (product.images?.[0]) {
    return {
      url: product.images[0].url,
      alt: product.images[0].alt || product.name[locale],
      isPrimary: false,
      fallbackUsed: false
    };
  }

  // 3. Use placeholder
  return {
    url: '/placeholder-product.jpg',
    alt: product.name[locale],
    isPrimary: false,
    fallbackUsed: true
  };
}
```

**Implementation Strategy:**

1. Add primary image resolution utility
2. Update ProductCard to use resolution utility
3. Add visual indicator for fallback images (optional)
4. Ensure consistent aspect ratios

### 4. Product Detail Image Layout Optimization

#### Modified Component: `ProductDetail.tsx`

**Current Issue:**
The main product image is too large and the layout is not professionally balanced.

**Solution:**
Implement a responsive masonry-style grid layout with size constraints.

**Layout Design:**

```
┌─────────────────────────────────────┐
│  Left Column (Image Gallery)        │
│  ┌───────────────┬───────┬───────┐  │
│  │               │       │       │  │
│  │   Main Image  │ Img 2 │ Img 3 │  │
│  │   (60% width) │       │       │  │
│  │               ├───────┼───────┤  │
│  │               │ Img 4 │ Img 5 │  │
│  └───────────────┴───────┴───────┘  │
│  Max Height: Match right column     │
└─────────────────────────────────────┘
```

**CSS Grid Configuration:**

```typescript
const imageGridConfig = {
  container: 'grid grid-cols-12 gap-2 max-h-[700px]',
  mainImage: 'col-span-7 row-span-2 relative aspect-[4/5]',
  secondaryImage: 'col-span-5 relative aspect-square',
  moreIndicator: 'absolute inset-0 bg-black/50 flex items-center justify-center'
};
```

**Implementation Strategy:**

1. Replace current grid layout with optimized configuration
2. Add max-height constraint matching right column
3. Implement responsive breakpoints for mobile
4. Add image gallery modal for full-size viewing (optional)

### 5. Clear Cart Functionality

#### Modified Component: `ShoppingCart.tsx`

**New Feature:**
Add "Clear Cart" button with confirmation dialog.

**Interface:**

```typescript
interface ClearCartButtonProps {
  onClear: () => Promise<void>;
  itemCount: number;
  locale: string;
}

// API endpoint
POST /api/cart/clear
Response: { success: boolean; message: string }
```

**Implementation Strategy:**

1. Add "Clear Cart" button to cart footer
2. Implement confirmation modal
3. Create API endpoint for bulk cart clearing
4. Update Redis cache on successful clear
5. Show success/error feedback

### 6. Redis Cache Synchronization Fix

#### Modified Files

- `src/lib/cart/context.tsx`
- `src/app/api/cart/items/[id]/route.ts`

**Current Issue:**
When the last item is removed, Redis cache is not properly cleared, causing the item to persist.

**Solution:**
Implement explicit cache clearing when cart becomes empty.

**Implementation Strategy:**

```typescript
// In removeItem function
const removeItem = async (itemId: string): Promise<boolean> => {
  // ... existing optimistic update logic

  const response = await fetch(`/api/cart/items/${itemId}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  const data = await response.json();

  if (data.success) {
    // Check if cart is now empty
    const remainingItems = state.items.filter(item => item.id !== itemId);

    if (remainingItems.length === 0) {
      // Explicitly clear Redis cache
      await fetch('/api/cart/clear-cache', {
        method: 'POST',
        credentials: 'include',
      });
    }

    await fetchCart();
    return true;
  }

  // ... error handling
};
```

**Redis Cache Operations:**

```typescript
// Clear cache utility
async function clearCartCache(sessionId: string, userId?: string) {
  const cacheKey = userId
    ? `cart:user:${userId}`
    : `cart:session:${sessionId}`;

  await redis.del(cacheKey);

  // Also clear any related cache keys
  await redis.del(`${cacheKey}:items`);
  await redis.del(`${cacheKey}:summary`);
}
```

### 7. Centralized Background Gradient System

#### Modified Files

- `tailwind.config.ts`
- `src/app/[locale]/layout.tsx`
- Various page components

**Solution:**
Define gradient as Tailwind utility class and apply globally with exceptions.

**Tailwind Configuration:**

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      backgroundImage: {
        'funeral-gold': 'linear-gradient(to right, #AE8625, #F7EF8A, #D2AC47)',
        'funeral-teal': 'linear-gradient(to right, #0f766e, #14b8a6, #0d9488)',
      },
      colors: {
        funeral: {
          // ... existing colors
          goldGradientStart: '#AE8625',
          goldGradientMid: '#F7EF8A',
          goldGradientEnd: '#D2AC47',
        }
      }
    }
  }
};
```

**Global Application:**

```typescript
// src/app/[locale]/layout.tsx
export default function LocaleLayout({ children }: Props) {
  return (
    <html lang={locale}>
      <body className="bg-funeral-gold">
        {children}
      </body>
    </html>
  );
}
```

**Exception Handling:**

```typescript
// Components that need Teal background
const tealBackgroundComponents = [
  'HeroSection',
  'CheckoutHeader',
  'ContactHeader',
  'ProductsHeader',
  'AboutHeader'
];

// Apply override class
<div className="bg-funeral-teal">
  {/* Teal background content */}
</div>
```

**Implementation Strategy:**

1. Add gradient definitions to Tailwind config
2. Apply global background to body element
3. Add override classes for Teal sections
4. Remove inline gradient styles throughout codebase
5. Update component documentation

### 8. Checkout Page Product Images

#### Modified Component: `CheckoutPageClient.tsx`

**Current Issue:**
Product images are not displaying in the checkout order summary.

**Solution:**
Reuse CartItemImage component from shopping cart.

**Implementation:**

```typescript
// In order summary section
{items.map((item) => (
  <div key={item.id} className="flex items-start gap-3">
    <CartItemImage
      item={item}
      locale={locale}
      size="sm"
    />
    <div className="flex-1">
      {/* Product details */}
    </div>
  </div>
))}
```

## Data Models

### Enhanced Cart Item Type

```typescript
interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  customizations?: Customization[];
  unitPrice: number;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;

  // Enhanced product data for image rendering
  product?: {
    id: string;
    name: LocalizedString;
    slug: string;
    images: ProductImage[];
    basePrice: number;
  };
}

interface ProductImage {
  id: string;
  url: string;
  alt?: string;
  isPrimary?: boolean;
  order?: number;
}
```

### Validation Error Structure

```typescript
interface ValidationErrors {
  [field: string]: string[];
}

interface StepValidationResult {
  isValid: boolean;
  errors: ValidationErrors;
  step: CheckoutStep;
}
```

## Error Handling

### Validation Errors

**Strategy:**

- Display errors inline next to relevant fields
- Show step-specific error summary at top of form
- Prevent navigation to next step until current step is valid
- Preserve error state when navigating back

**Error Messages:**

```typescript
const validationMessages = {
  cs: {
    required: 'Toto pole je povinné',
    email: 'Zadejte platnou e-mailovou adresu',
    phone: 'Zadejte platné telefonní číslo',
    postalCode: 'Zadejte platné PSČ',
  },
  en: {
    required: 'This field is required',
    email: 'Enter a valid email address',
    phone: 'Enter a valid phone number',
    postalCode: 'Enter a valid postal code',
  }
};
```

### Image Loading Errors

**Strategy:**

- Show loading skeleton during image load
- Display fallback image on load error
- Log errors for monitoring
- Provide retry mechanism for failed loads

**Implementation:**

```typescript
function CartItemImage({ item, locale, size = 'md' }: CartItemImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const imageUrl = resolveCartItemImage(item);

  if (!imageUrl || imageError) {
    return <FallbackImage size={size} />;
  }

  return (
    <div className={cn('relative', sizeClasses[size])}>
      {isLoading && <ImageSkeleton />}
      <Image
        src={imageUrl}
        alt={item.product?.name[locale] || 'Product'}
        fill
        className="object-cover"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setImageError(true);
          setIsLoading(false);
          console.error('Failed to load cart item image:', imageUrl);
        }}
      />
    </div>
  );
}
```

### Redis Cache Errors

**Strategy:**

- Implement retry logic with exponential backoff
- Fall back to database queries if Redis is unavailable
- Log cache misses and errors
- Provide user feedback for persistent errors

**Implementation:**

```typescript
async function getCartWithFallback(sessionId: string, userId?: string) {
  try {
    // Try Redis first
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch (error) {
    console.error('Redis cache error:', error);
    // Continue to database fallback
  }

  // Fallback to database
  const cart = await fetchCartFromDatabase(sessionId, userId);

  // Try to update cache (fire and forget)
  updateCacheAsync(cacheKey, cart).catch(console.error);

  return cart;
}
```

## Testing Strategy

### Unit Tests

**Validation Logic:**

```typescript
describe('Step-based validation', () => {
  it('should only validate customer fields in customer step', () => {
    const result = validateStep('customer', {
      customerInfo: { email: 'invalid' },
      deliveryInfo: { address: '' } // Should not be validated
    });

    expect(result.errors).toHaveProperty('email');
    expect(result.errors).not.toHaveProperty('address');
  });

  it('should validate all fields in review step', () => {
    const result = validateStep('review', incompleteData);
    expect(Object.keys(result.errors).length).toBeGreaterThan(0);
  });
});
```

**Image Resolution:**

```typescript
describe('Image resolution', () => {
  it('should return primary image when available', () => {
    const product = createMockProduct({
      images: [
        { url: '/img1.jpg', isPrimary: false },
        { url: '/img2.jpg', isPrimary: true }
      ]
    });

    const result = resolvePrimaryProductImage(product, 'cs');
    expect(result.url).toBe('/img2.jpg');
    expect(result.isPrimary).toBe(true);
  });

  it('should fallback to first image when no primary', () => {
    const product = createMockProduct({
      images: [{ url: '/img1.jpg' }]
    });

    const result = resolvePrimaryProductImage(product, 'cs');
    expect(result.url).toBe('/img1.jpg');
    expect(result.fallbackUsed).toBe(false);
  });
});
```

### Integration Tests

**Cart Operations:**

```typescript
describe('Cart Redis synchronization', () => {
  it('should clear Redis cache when last item removed', async () => {
    const cart = await createTestCart([createTestItem()]);
    await removeItem(cart.items[0].id);

    const cached = await redis.get(cacheKey);
    expect(cached).toBeNull();
  });

  it('should handle concurrent cart operations', async () => {
    // Test race conditions
  });
});
```

### Manual Testing Checklist

**Checkout Flow:**

- [ ] Can progress through each step with valid data
- [ ] Cannot progress with invalid data in current step
- [ ] Can navigate back without losing data
- [ ] Errors display correctly for each step
- [ ] Final submission validates all steps

**Image Display:**

- [ ] Cart images load correctly
- [ ] Checkout images load correctly
- [ ] Product grid images load correctly
- [ ] Product detail images display in optimized layout
- [ ] Fallback images display on error
- [ ] Loading states display correctly

**Cart Operations:**

- [ ] Clear cart button works
- [ ] Confirmation dialog appears
- [ ] Last item removal clears cache
- [ ] Cart state persists across page refresh
- [ ] Optimistic updates work correctly

**Background Gradient:**

- [ ] Gold gradient applies to all pages
- [ ] Teal gradient applies to Hero section
- [ ] Teal gradient applies to page headers
- [ ] No inline gradient styles remain
- [ ] Gradient is consistent across browsers

## Performance Considerations

### Image Optimization

**Strategy:**

- Use Next.js Image component for automatic optimization
- Implement lazy loading for below-fold images
- Use appropriate image sizes for different contexts
- Leverage CDN caching

**Configuration:**

```typescript
// next.config.ts
export default {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  }
};
```

### Redis Cache Optimization

**Strategy:**

- Set appropriate TTL for cart data (30 minutes)
- Use pipeline operations for bulk updates
- Implement cache warming for frequently accessed data
- Monitor cache hit rates

**Implementation:**

```typescript
const CART_CACHE_TTL = 30 * 60; // 30 minutes

async function updateCartCache(sessionId: string, cart: CartSummary) {
  const cacheKey = `cart:session:${sessionId}`;

  await redis.setex(
    cacheKey,
    CART_CACHE_TTL,
    JSON.stringify(cart)
  );
}
```

### Form Validation Performance

**Strategy:**

- Debounce inline validation
- Validate on blur rather than on every keystroke
- Cache validation results for unchanged fields
- Use memoization for expensive validations

**Implementation:**

```typescript
const debouncedValidate = useMemo(
  () => debounce((field: string, value: any) => {
    const errors = validateField(field, value);
    setFieldErrors(prev => ({ ...prev, [field]: errors }));
  }, 300),
  []
);
```

## Security Considerations

### Input Validation

- Validate all form inputs on both client and server
- Sanitize user input before storage
- Implement CSRF protection for cart operations
- Rate limit cart API endpoints

### Cache Security

- Use session-specific cache keys
- Implement cache key encryption for sensitive data
- Set appropriate cache expiration
- Clear cache on logout

### Image Security

- Validate image URLs before rendering
- Use Content Security Policy for image sources
- Implement image upload restrictions
- Scan uploaded images for malware

## Deployment Strategy

### Phased Rollout

**Phase 1: Validation & Images (Week 1)**

- Deploy checkout validation improvements
- Deploy cart and checkout image fixes
- Deploy product grid image fixes
- Monitor error rates and user feedback

**Phase 2: Layout & Cache (Week 2)**

- Deploy product detail layout optimization
- Deploy Redis cache synchronization fix
- Deploy clear cart functionality
- Monitor performance metrics

**Phase 3: Styling (Week 3)**

- Deploy centralized background gradient system
- Update all components to use new gradient classes
- Remove inline styles
- Verify visual consistency

### Rollback Plan

- Keep previous validation logic as fallback
- Maintain image URL resolution backwards compatibility
- Preserve old cache clearing logic
- Document rollback procedures

### Monitoring

**Metrics to Track:**

- Checkout completion rate
- Form validation error rates
- Image load success rate
- Cart operation success rate
- Redis cache hit rate
- Page load performance
- User session duration

**Alerts:**

- High validation error rate
- Image load failures > 5%
- Cart operation failures > 2%
- Redis cache unavailability
- Performance degradation > 20%

## Documentation Updates

### Developer Documentation

- Update component API documentation
- Document new validation patterns
- Document image resolution utilities
- Document cache synchronization patterns
- Update Tailwind configuration guide

### User Documentation

- Update checkout flow guide
- Document cart management features
- Update product browsing guide
- Document accessibility features

## Accessibility Compliance

### Form Validation

- Ensure error messages are announced by screen readers
- Provide clear focus management between steps
- Use ARIA labels for validation states
- Ensure keyboard navigation works correctly

### Image Display

- Provide meaningful alt text for all images
- Ensure fallback images have descriptive alt text
- Implement proper loading states for screen readers
- Use ARIA live regions for dynamic image updates

### Color Contrast

- Verify gradient backgrounds meet WCAG AA standards
- Ensure text is readable on all backgrounds
- Provide high contrast mode support
- Test with color blindness simulators
