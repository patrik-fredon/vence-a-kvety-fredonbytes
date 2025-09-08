# Design Document

## Overview

The "Pohřební věnce" e-commerce platform is designed as a modern, performant, and accessible web application built with Next.js 15, focusing on providing a dignified and seamless experience for customers purchasing funeral wreaths and floral arrangements. The architecture emphasizes performance, security, and maintainability while supporting complex product customization and multilingual requirements.

## Architecture

### High-Level Architecture

mermaid
graph TB
    A[Client Browser] --> B[Next.js 15 App Router]
    B --> C[API Routes]
    B --> D[Server Components]
    B --> E[Client Components]

    C --> F[Supabase Database]
    C --> G[Redis Cache]
    C --> H[Stripe API]
    C --> I[GoPay API]

    D --> J[Static Generation]
    D --> K[Server-Side Rendering]

    F --> L[PostgreSQL]
    F --> M[Row Level Security]
    F --> N[Real-time Subscriptions]

    G --> O[Session Storage]
    G --> P[Product Cache]
    G --> Q[Delivery Calendar Cache]

```

### Technology Stack

- **Frontend Framework**: Next.js 15 with App Router
- **Language**: TypeScript for type safety
- **Styling**: TailwindCSS 4 with custom design system
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Caching**: Redis for session management and performance
- **Authentication**: NextAuth.js v5 with Supabase adapter
- **Payments**: Stripe + GoPay integration
- **Internationalization**: next-intl for Czech/English support
- **Image Optimization**: Next.js Image component with Supabase Storage
- **Deployment**: Vercel with edge functions

## Components and Interfaces

### Core Component Architecture

#### 1. Layout Components
```typescript
// app/[locale]/layout.tsx
interface RootLayoutProps {
  children: React.ReactNode;
  params: { locale: 'cs' | 'en' };
}

// components/layout/Header.tsx
interface HeaderProps {
  locale: string;
  user?: User | null;
}

// components/layout/Navigation.tsx
interface NavigationProps {
  categories: Category[];
  locale: string;
}
```

#### 2. Product Components

```typescript
// components/product/ProductGrid.tsx
interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  onLoadMore?: () => void;
}

// components/product/ProductCard.tsx
interface ProductCardProps {
  product: Product;
  locale: string;
  onAddToCart: (product: Product, customizations: Customization[]) => void;
}

// components/product/ProductCustomizer.tsx
interface ProductCustomizerProps {
  product: Product;
  onCustomizationChange: (customizations: Customization[]) => void;
  onPriceUpdate: (price: number) => void;
}
```

#### 3. Cart and Checkout Components

```typescript
// components/cart/ShoppingCart.tsx
interface ShoppingCartProps {
  items: CartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
}

// components/checkout/CheckoutForm.tsx
interface CheckoutFormProps {
  cartItems: CartItem[];
  onPaymentSuccess: (orderId: string) => void;
  paymentMethods: ('stripe' | 'gopay')[];
}

// components/checkout/DeliveryCalendar.tsx
interface DeliveryCalendarProps {
  availableDates: Date[];
  onDateSelect: (date: Date) => void;
  selectedDate?: Date;
}
```

### Data Models

#### Core Entities

```typescript
// types/product.ts
interface Product {
  id: string;
  name: Record<'cs' | 'en', string>;
  description: Record<'cs' | 'en', string>;
  basePrice: number;
  category: Category;
  images: ProductImage[];
  customizationOptions: CustomizationOption[];
  availability: ProductAvailability;
  seoMetadata: SEOMetadata;
  createdAt: Date;
  updatedAt: Date;
}

interface CustomizationOption {
  id: string;
  type: 'size' | 'flowers' | 'ribbon' | 'message';
  name: Record<'cs' | 'en', string>;
  options: CustomizationChoice[];
  required: boolean;
  priceModifier: number;
}

interface CustomizationChoice {
  id: string;
  value: string;
  label: Record<'cs' | 'en', string>;
  priceModifier: number;
  available: boolean;
}

// types/order.ts
interface Order {
  id: string;
  userId?: string;
  items: OrderItem[];
  customerInfo: CustomerInfo;
  deliveryInfo: DeliveryInfo;
  paymentInfo: PaymentInfo;
  status: OrderStatus;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface OrderItem {
  productId: string;
  quantity: number;
  customizations: Customization[];
  unitPrice: number;
  totalPrice: number;
}

// types/user.ts
interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  addresses: Address[];
  orderHistory: Order[];
  preferences: UserPreferences;
  createdAt: Date;
}
```

### Database Schema (Supabase)

```sql
-- Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_cs TEXT NOT NULL,
  name_en TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description_cs TEXT,
  description_en TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES categories(id),
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_cs TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_cs TEXT,
  description_en TEXT,
  slug TEXT UNIQUE NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  category_id UUID REFERENCES categories(id),
  images JSONB DEFAULT '[]',
  customization_options JSONB DEFAULT '[]',
  availability JSONB DEFAULT '{}',
  seo_metadata JSONB DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  customer_info JSONB NOT NULL,
  delivery_info JSONB NOT NULL,
  payment_info JSONB NOT NULL,
  items JSONB NOT NULL,
  status TEXT DEFAULT 'pending',
  total_amount DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cart items table (for persistent cart)
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  customizations JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## API Design

### REST API Endpoints

#### Product Management

```typescript
// app/api/products/route.ts
GET /api/products
  Query: { category?, search?, page?, limit?, locale? }
  Response: { products: Product[], pagination: PaginationInfo }

GET /api/products/[slug]
  Response: { product: Product }

// app/api/categories/route.ts
GET /api/categories
  Query: { locale? }
  Response: { categories: Category[] }
```

#### Cart Management

```typescript
// app/api/cart/route.ts
GET /api/cart
  Response: { items: CartItem[], total: number }

POST /api/cart/items
  Body: { productId: string, quantity: number, customizations: Customization[] }
  Response: { success: boolean, cartItem: CartItem }

PUT /api/cart/items/[id]
  Body: { quantity: number }
  Response: { success: boolean }

DELETE /api/cart/items/[id]
  Response: { success: boolean }
```

#### Order Processing

```typescript
// app/api/orders/route.ts
POST /api/orders
  Body: { items: CartItem[], customerInfo: CustomerInfo, deliveryInfo: DeliveryInfo }
  Response: { orderId: string, paymentUrl: string }

GET /api/orders/[id]
  Response: { order: Order }

// app/api/orders/[id]/payment/route.ts
POST /api/orders/[id]/payment
  Body: { paymentMethod: 'stripe' | 'gopay', paymentData: any }
  Response: { success: boolean, redirectUrl?: string }
```

#### Delivery Management

```typescript
// app/api/delivery/calendar/route.ts
GET /api/delivery/calendar
  Query: { month: string, year: string }
  Response: { availableDates: Date[], holidays: Date[] }

POST /api/delivery/estimate
  Body: { address: Address, items: CartItem[] }
  Response: { estimatedDate: Date, cost: number, options: DeliveryOption[] }
```

## Error Handling

### Error Response Format

```typescript
interface APIError {
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
  };
}

// Example error responses
{
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Product with specified ID does not exist",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}

{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "fields": ["email", "phone"]
    },
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Error Handling Strategy

1. **Client-side**: React Error Boundaries for component-level errors
2. **API Routes**: Centralized error handling middleware
3. **Database**: Proper constraint handling and transaction rollbacks
4. **Payment**: Comprehensive error handling for payment failures
5. **Logging**: Structured logging with error tracking (Sentry integration)

## Testing Strategy

### Testing Pyramid

#### 1. Unit Tests (Jest + Testing Library)

```typescript
// __tests__/components/ProductCard.test.tsx
describe('ProductCard', () => {
  it('displays product information correctly', () => {
    render(<ProductCard product={mockProduct} locale="cs" onAddToCart={jest.fn()} />);
    expect(screen.getByText(mockProduct.name.cs)).toBeInTheDocument();
  });

  it('handles customization changes', () => {
    const onAddToCart = jest.fn();
    render(<ProductCard product={mockProduct} locale="cs" onAddToCart={onAddToCart} />);
    // Test customization interactions
  });
});

// __tests__/utils/pricing.test.ts
describe('Pricing calculations', () => {
  it('calculates total price with customizations correctly', () => {
    const result = calculateTotalPrice(basePrice, customizations);
    expect(result).toBe(expectedTotal);
  });
});
```

#### 2. Integration Tests (Playwright)

```typescript
// e2e/checkout-flow.spec.ts
test('complete checkout flow', async ({ page }) => {
  await page.goto('/products');
  await page.click('[data-testid="product-card"]:first-child');
  await page.click('[data-testid="add-to-cart"]');
  await page.click('[data-testid="cart-icon"]');
  await page.click('[data-testid="checkout-button"]');

  // Fill checkout form
  await page.fill('[data-testid="customer-email"]', 'test@example.com');
  await page.fill('[data-testid="customer-name"]', 'Test User');

  // Select delivery date
  await page.click('[data-testid="delivery-calendar"]');
  await page.click('[data-testid="available-date"]:first-child');

  // Complete payment (mock)
  await page.click('[data-testid="stripe-payment"]');
  await expect(page.locator('[data-testid="order-confirmation"]')).toBeVisible();
});
```

#### 3. API Tests (Supertest)

```typescript
// __tests__/api/products.test.ts
describe('/api/products', () => {
  it('returns products with pagination', async () => {
    const response = await request(app)
      .get('/api/products?page=1&limit=10')
      .expect(200);

    expect(response.body.products).toHaveLength(10);
    expect(response.body.pagination).toBeDefined();
  });

  it('filters products by category', async () => {
    const response = await request(app)
      .get('/api/products?category=wreaths')
      .expect(200);

    response.body.products.forEach(product => {
      expect(product.category.slug).toBe('wreaths');
    });
  });
});
```

### Performance Testing

- **Lighthouse CI**: Automated performance auditing
- **Load Testing**: Artillery.js for API endpoint testing
- **Core Web Vitals**: Monitoring LCP, FID, CLS metrics
- **Bundle Analysis**: webpack-bundle-analyzer for optimization

### Accessibility Testing

- **axe-core**: Automated accessibility testing
- **Manual Testing**: Screen reader and keyboard navigation
- **Color Contrast**: Automated contrast ratio validation
- **ARIA Compliance**: Proper semantic HTML and ARIA attributes

## Security Considerations

### Authentication & Authorization

- **NextAuth.js v5**: Secure session management
- **Supabase RLS**: Row-level security policies
- **JWT Tokens**: Secure token handling and refresh
- **CSRF Protection**: Built-in Next.js CSRF protection

### Data Protection

- **GDPR Compliance**: Data minimization and user consent
- **PCI DSS**: Secure payment processing (no card data storage)
- **Encryption**: TLS 1.3 for data in transit
- **Input Validation**: Comprehensive server-side validation

### Rate Limiting & DDoS Protection

```typescript
// middleware.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1';
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return new Response('Too Many Requests', { status: 429 });
  }

  return NextResponse.next();
}
```

## Performance Optimization

### Caching Strategy

1. **Static Generation**: Product pages and categories
2. **Incremental Static Regeneration**: Dynamic content updates
3. **Redis Caching**: Session data, cart contents, delivery calendar
4. **CDN Caching**: Static assets and images
5. **Browser Caching**: Optimized cache headers

### Image Optimization

```typescript
// components/OptimizedImage.tsx
import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
}

export function OptimizedImage({ src, alt, width, height, priority }: OptimizedImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      className="object-cover"
    />
  );
}
```

### Code Splitting & Lazy Loading

```typescript
// Dynamic imports for heavy components
const ProductCustomizer = dynamic(() => import('./ProductCustomizer'), {
  loading: () => <CustomizerSkeleton />,
  ssr: false
});

const PaymentForm = dynamic(() => import('./PaymentForm'), {
  loading: () => <PaymentSkeleton />
});
```

## Internationalization (i18n)

### Configuration

```typescript
// next.config.ts
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

export default withNextIntl({
  // Other Next.js config
});

// i18n/config.ts
export const locales = ['cs', 'en'] as const;
export const defaultLocale = 'cs' as const;

// messages/cs.json
{
  "navigation": {
    "home": "Domů",
    "products": "Produkty",
    "about": "O nás",
    "contact": "Kontakt"
  },
  "product": {
    "addToCart": "Přidat do košíku",
    "customize": "Přizpůsobit",
    "price": "Cena",
    "availability": "Dostupnost"
  }
}
```

### Usage in Components

```typescript
import { useTranslations } from 'next-intl';

export function ProductCard({ product }: ProductCardProps) {
  const t = useTranslations('product');

  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <button>{t('addToCart')}</button>
    </div>
  );
}
```

This comprehensive design document provides the foundation for implementing the funeral wreaths e-commerce platform with modern best practices, security considerations, and performance optimizations.
