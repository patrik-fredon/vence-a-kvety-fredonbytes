# Technical Architecture Documentation

## Overview

This document provides a comprehensive technical overview of the Pohřební věnce e-commerce platform, detailing the architecture, design decisions, and implementation patterns used throughout the application.

## Architecture Principles

### 1. Server-First Architecture

- **Next.js 15 App Router**: Leveraging Server Components for optimal performance
- **Server-Side Rendering (SSR)**: Dynamic content with SEO benefits
- **Static Site Generation (SSG)**: Pre-rendered pages where appropriate
- **Edge Runtime**: API routes optimized for global distribution

### 2. Type Safety

- **TypeScript Strict Mode**: Comprehensive type checking
- **Generated Types**: Supabase database types automatically generated
- **Runtime Validation**: Zod schemas for API validation
- **Component Props**: Strict interface definitions

### 3. Performance Optimization

- **Code Splitting**: Automatic route-based and manual component splitting
- **Tree Shaking**: Optimized bundle size with proper exports
- **Caching Strategy**: Multi-layer caching (Redis, CDN, browser)
- **Image Optimization**: Next.js Image component with WebP/AVIF support

### 4. Accessibility & Internationalization

- **WCAG 2.1 AA Compliance**: Built-in accessibility features
- **Internationalization**: Full Czech/English support with next-intl
- **Semantic HTML**: Proper markup structure
- **Keyboard Navigation**: Complete keyboard accessibility

## Database Architecture

### Supabase PostgreSQL Schema

#### Core Tables

**Products Table**

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_cs TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_cs TEXT,
  description_en TEXT,
  slug TEXT UNIQUE NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  category_id UUID REFERENCES categories(id),
  images JSONB DEFAULT '[]'::jsonb,
  customization_options JSONB DEFAULT '[]'::jsonb,
  availability JSONB DEFAULT '{}'::jsonb,
  seo_metadata JSONB DEFAULT '{}'::jsonb,
  active BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Orders Table**

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  customer_info JSONB NOT NULL,
  delivery_info JSONB NOT NULL,
  payment_info JSONB NOT NULL,
  items JSONB NOT NULL,
  status order_status DEFAULT 'pending',
  total_amount DECIMAL(10,2) NOT NULL,
  notes TEXT,
  internal_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Security Features

**Row Level Security (RLS)**

- User-specific data access control
- Admin role-based permissions
- Secure API access patterns

**Triggers and Functions**

- Automatic timestamp updates
- User profile creation on signup
- Data validation and constraints

### Caching Strategy

#### Redis Implementation

```typescript
// Cart caching example
export async function getCachedCart(sessionId: string) {
  const cached = await redis.get(`cart:${sessionId}`);
  if (cached) {
    return JSON.parse(cached);
  }

  const cart = await fetchCartFromDatabase(sessionId);
  await redis.setex(`cart:${sessionId}`, 3600, JSON.stringify(cart));
  return cart;
}
```

#### Cache Layers

1. **Browser Cache**: Static assets and API responses
2. **CDN Cache**: Vercel Edge Network for global distribution
3. **Redis Cache**: Session data, cart contents, frequently accessed data
4. **Database Cache**: Supabase connection pooling and query optimization

## Component Architecture

### Atomic Design Implementation

#### Atoms (Basic Building Blocks)

```typescript
// Button component example
interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className,
  children,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-colors';
  const variantClasses = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white',
    secondary: 'bg-secondary-600 hover:bg-secondary-700 text-white',
    outline: 'border-2 border-primary-600 text-primary-700 hover:bg-primary-50',
    ghost: 'text-primary-700 hover:bg-primary-50'
  };

  return (
    <button
      className={cn(baseClasses, variantClasses[variant], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <LoadingSpinner className="mr-2" />}
      {children}
    </button>
  );
};
```

#### Molecules (Component Combinations)

```typescript
// ProductCard component example
interface ProductCardProps {
  product: Product;
  locale: Locale;
  onAddToCart?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  locale,
  onAddToCart
}) => {
  const t = useTranslations('product');

  return (
    <div className="bg-white rounded-lg shadow-soft overflow-hidden">
      <OptimizedImage
        src={product.images[0]?.url}
        alt={product[`name_${locale}`]}
        width={300}
        height={200}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold text-primary-800">
          {product[`name_${locale}`]}
        </h3>
        <p className="text-neutral-600 mt-2">
          {product[`description_${locale}`]}
        </p>
        <div className="flex justify-between items-center mt-4">
          <span className="text-xl font-bold text-primary-700">
            {formatCurrency(product.base_price, locale)}
          </span>
          <Button
            onClick={() => onAddToCart?.(product)}
            size="sm"
          >
            {t('addToCart')}
          </Button>
        </div>
      </div>
    </div>
  );
};
```

### State Management

#### Context Providers

```typescript
// Cart context implementation
interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, customizations?: Customization[]) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  total: number;
  itemCount: number;
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const addItem = useCallback(async (product: Product, customizations?: Customization[]) => {
    setLoading(true);
    try {
      const response = await fetch('/api/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, customizations })
      });

      if (response.ok) {
        const newItem = await response.json();
        setItems(prev => [...prev, newItem]);
      }
    } catch (error) {
      console.error('Failed to add item to cart:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // ... other cart operations

  return (
    <CartContext.Provider value={{ items, addItem, /* ... */ }}>
      {children}
    </CartContext.Provider>
  );
};
```

## API Architecture

### Route Structure

#### RESTful API Design

```typescript
// Product API routes
GET    /api/products              # List products with filtering
GET    /api/products/[slug]       # Get specific product
POST   /api/products              # Create product (admin)
PUT    /api/products/[id]         # Update product (admin)
DELETE /api/products/[id]         # Delete product (admin)

// Cart API routes
GET    /api/cart                  # Get current cart
POST   /api/cart/items           # Add item to cart
PUT    /api/cart/items/[id]      # Update cart item
DELETE /api/cart/items/[id]      # Remove cart item
```

#### API Route Implementation

```typescript
// Example API route with validation and error handling
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category');

    // Validate parameters
    const validatedParams = ProductQuerySchema.parse({
      page,
      limit,
      category
    });

    // Fetch data with caching
    const cacheKey = `products:${JSON.stringify(validatedParams)}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return NextResponse.json(JSON.parse(cached));
    }

    const products = await getProducts(validatedParams);

    // Cache for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(products));

    return NextResponse.json(products);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: error.errors },
        { status: 400 }
      );
    }

    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Authentication & Authorization

#### NextAuth.js Configuration

```typescript
export const authConfig: NextAuthConfig = {
  providers: [
    {
      id: 'supabase',
      name: 'Supabase',
      type: 'oauth',
      // Supabase provider configuration
    }
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role;
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
    error: '/auth/error'
  }
};
```

#### Role-Based Access Control

```typescript
// Admin middleware
export function withAdminAuth(handler: NextApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getServerSession(req, res, authConfig);

    if (!session || session.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    return handler(req, res);
  };
}
```

## Payment Integration

### Multi-Provider Architecture

#### Stripe Integration

```typescript
export class StripePaymentProvider implements PaymentProvider {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }

  async createPaymentIntent(amount: number, currency: string = 'czk') {
    return await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      automatic_payment_methods: {
        enabled: true
      }
    });
  }

  async confirmPayment(paymentIntentId: string) {
    return await this.stripe.paymentIntents.retrieve(paymentIntentId);
  }
}
```

#### GoPay Integration

```typescript
export class GopayPaymentProvider implements PaymentProvider {
  private client: GopayClient;

  constructor() {
    this.client = new GopayClient({
      goid: process.env.GOPAY_GOID!,
      clientId: process.env.GOPAY_CLIENT_ID!,
      clientSecret: process.env.GOPAY_CLIENT_SECRET!,
      isProductionMode: process.env.NODE_ENV === 'production'
    });
  }

  async createPayment(order: Order) {
    return await this.client.createPayment({
      payer: {
        default_payment_instrument: 'BANK_ACCOUNT',
        allowed_payment_instruments: ['BANK_ACCOUNT', 'PAYMENT_CARD'],
        contact: {
          first_name: order.customer_info.firstName,
          last_name: order.customer_info.lastName,
          email: order.customer_info.email
        }
      },
      amount: Math.round(order.total_amount * 100),
      currency: 'CZK',
      order_number: order.id,
      order_description: `Objednávka ${order.id}`,
      callback: {
        return_url: `${process.env.NEXTAUTH_URL}/checkout/success`,
        notification_url: `${process.env.NEXTAUTH_URL}/api/payments/webhook/gopay`
      }
    });
  }
}
```

## Performance Optimization

### Bundle Optimization

#### Tree Shaking Configuration

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['@heroicons/react', '@headlessui/react']
  },
  webpack: (config) => {
    config.optimization.usedExports = true;
    config.optimization.sideEffects = false;
    return config;
  }
};
```

#### Dynamic Imports

```typescript
// Lazy loading heavy components
const AdminDashboard = lazy(() => import('@/components/admin/AdminDashboard'));
const ProductCustomizer = lazy(() => import('@/components/product/ProductCustomizer'));

// Usage with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <AdminDashboard />
</Suspense>
```

### Image Optimization

#### Next.js Image Component

```typescript
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  priority = false,
  className,
  ...props
}) => {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      className={className}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
      {...props}
    />
  );
};
```

## Security Implementation

### CSRF Protection

```typescript
// CSRF token generation and validation
export async function generateCSRFToken(): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  await redis.setex(`csrf:${token}`, 3600, 'valid');
  return token;
}

export async function validateCSRFToken(token: string): Promise<boolean> {
  const isValid = await redis.get(`csrf:${token}`);
  if (isValid) {
    await redis.del(`csrf:${token}`);
    return true;
  }
  return false;
}
```

### Rate Limiting

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true
});

export async function withRateLimit(
  request: NextRequest,
  identifier: string = 'anonymous'
) {
  const { success, limit, reset, remaining } = await ratelimit.limit(identifier);

  if (!success) {
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': new Date(reset).toISOString()
      }
    });
  }

  return null; // Continue processing
}
```

## Monitoring & Observability

### Error Tracking

```typescript
export class ErrorLogger {
  static async logError(error: Error, context?: Record<string, any>) {
    const errorLog = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      context,
      url: context?.url,
      userAgent: context?.userAgent
    };

    // Log to database
    await supabase
      .from('error_logs')
      .insert(errorLog);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', errorLog);
    }
  }
}
```

### Performance Monitoring

```typescript
export class PerformanceMonitor {
  static async trackWebVitals(metric: any) {
    const vitalsData = {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
      timestamp: new Date().toISOString()
    };

    await supabase
      .from('performance_metrics')
      .insert(vitalsData);
  }

  static async trackAPIPerformance(
    endpoint: string,
    duration: number,
    status: number
  ) {
    await supabase
      .from('api_performance')
      .insert({
        endpoint,
        duration,
        status,
        timestamp: new Date().toISOString()
      });
  }
}
```

## Testing Architecture

### Unit Testing Strategy

```typescript
// Component testing example
describe('ProductCard', () => {
  const mockProduct: Product = {
    id: '1',
    name_cs: 'Test věnec',
    name_en: 'Test wreath',
    base_price: 1500,
    images: [{ url: '/test-image.jpg', alt: 'Test' }]
  };

  it('renders product information correctly', () => {
    render(<ProductCard product={mockProduct} locale="cs" />);

    expect(screen.getByText('Test věnec')).toBeInTheDocument();
    expect(screen.getByText('1 500 Kč')).toBeInTheDocument();
  });

  it('meets accessibility requirements', async () => {
    const { container } = render(
      <ProductCard product={mockProduct} locale="cs" />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### E2E Testing Strategy

```typescript
// Playwright E2E test example
test('complete checkout flow', async ({ page }) => {
  // Navigate to product page
  await page.goto('/cs/products/test-product');

  // Add to cart
  await page.click('[data-testid="add-to-cart"]');
  await expect(page.locator('[data-testid="cart-count"]')).toContainText('1');

  // Go to checkout
  await page.click('[data-testid="cart-icon"]');
  await page.click('[data-testid="checkout-button"]');

  // Fill checkout form
  await page.fill('[name="firstName"]', 'Jan');
  await page.fill('[name="lastName"]', 'Novák');
  await page.fill('[name="email"]', 'jan@example.com');

  // Complete order (mock payment)
  await page.click('[data-testid="place-order"]');

  // Verify success
  await expect(page.locator('h1')).toContainText('Objednávka byla úspěšně vytvořena');
});
```

This technical architecture provides a solid foundation for building, maintaining, and scaling the funeral wreaths e-commerce platform while ensuring performance, security, and accessibility standards are met.
