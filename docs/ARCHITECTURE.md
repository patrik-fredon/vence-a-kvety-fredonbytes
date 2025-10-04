# Architecture Documentation

## Overview

The funeral wreath e-commerce platform is built with a modern, scalable architecture using Next.js 15, React 19, and TypeScript. This document outlines the architectural decisions, patterns, and best practices used throughout the application.

## Technology Stack

### Frontend

- **Framework**: Next.js 15 with App Router
- **UI Library**: React 19 with Server Components
- **Language**: TypeScript 5 with strict mode
- **Styling**: TailwindCSS 4 with custom design system
- **State Management**: React Context API
- **Internationalization**: next-intl

### Backend

- **Runtime**: Node.js 20+
- **API**: Next.js API Routes (App Router)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: NextAuth.js v5
- **Caching**: Redis (Upstash
  ile Storage\*\*: Supabase Storage

### External Services

- **Payments**: Stripe, GoPay
- **Email**: Resend
- **Monitoring**: Custom performance monitoring
- **Rate Limiting**: Upstash Rate Limit

## Architecture Patterns

### 1. Server-First Architecture

The application leverages Next.js 15 Server Components for optimal performance:

```
┌─────────────────────────────────────────┐
│         Client Browser                   │
│  ┌────────────────────────────────────┐ │
│  │   Client Components (Minimal)      │ │
│  │   - Interactive UI                 │ │
│  │   - Form handling                  │ │
│  │   - Client-side state              │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────┐
│         Next.js Server                   │
│  ┌────────────────────────────────────┐ │
│  │   Server Components (Default)      │ │
│  │   - Data fetching                  │ │
│  │   - Business logic                 │ │
│  │   - Database queries               │ │
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │   API Routes                       │ │
│  │   - REST endpoints                 │ │
│  │   - Webhooks                       │ │
│  │   - Server actions                 │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────┐
│         Data Layer                       │
│  ┌────────────────────────────────────┐ │
│  │   Supabase (PostgreSQL)            │ │
│  │   - Products, Orders, Users        │ │
│  │   - Row Level Security             │ │
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │   Redis (Upstash)                  │ │
│  │   - Cart cache                     │ │
│  │   - API response cache             │ │
│  │   - Session storage                │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### 2. Atomic Design Component Architecture

Components are organized following Atomic Design principles:

```
src/components/
├── ui/                    # Atoms
│   ├── Button.tsx        # Basic button component
│   ├── Input.tsx         # Form input
│   ├── Card.tsx          # Card container
│   └── ...
├── product/              # Molecules & Organisms
│   ├── ProductCard.tsx   # Product display card
│   ├── ProductGrid.tsx   # Product grid layout
│   └── ...
├── layout/               # Templates
│   ├── Header.tsx        # Site header
│   ├── Footer.tsx        # Site footer
│   └── ...
└── pages/                # Pages (in app/ directory)
```

### 3. Data Flow Architecture

#### Read Operations

```
User Request
    ↓
Server Component
    ↓
Check Redis Cache ──→ Cache Hit ──→ Return Cached Data
    ↓ Cache Miss
Query Supabase
    ↓
Store in Redis Cache
    ↓
Return Fresh Data
```

#### Write Operations

```
User Action
    ↓
Client Component (Form)
    ↓
API Route Handler
    ↓
Validate Input (Zod)
    ↓
Update Supabase
    ↓
Invalidate Redis Cache
    ↓
Return Success Response
    ↓
Revalidate UI
```

### 4. Authentication Flow

```
┌─────────────────────────────────────────┐
│         User Authentication              │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         NextAuth.js v5                   │
│  ┌────────────────────────────────────┐ │
│  │   Credentials Provider             │ │
│  │   - Email/Password                 │ │
│  │   - Supabase integration           │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         Session Management               │
│  ┌────────────────────────────────────┐ │
│  │   JWT Token                        │ │
│  │   - Stored in HTTP-only cookie     │ │
│  │   - Automatic refresh              │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         Authorization                    │
│  ┌────────────────────────────────────┐ │
│  │   Middleware                       │ │
│  │   - Route protection               │ │
│  │   - Role-based access              │ │
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │   Row Level Security (RLS)         │ │
│  │   - Database-level security        │ │
│  │   - User data isolation            │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## Directory Structure

### Application Structure

```
src/
├── app/                          # Next.js 15 App Router
│   ├── [locale]/                # Internationalized routes
│   │   ├── page.tsx            # Homepage
│   │   ├── layout.tsx          # Locale layout
│   │   ├── products/           # Product pages
│   │   ├── cart/               # Shopping cart
│   │   ├── checkout/           # Checkout flow
│   │   ├── auth/               # Authentication
│   │   └── admin/              # Admin dashboard
│   ├── api/                    # API routes
│   │   ├── products/           # Product API
│   │   ├── cart/               # Cart API
│   │   ├── orders/             # Order API
│   │   ├── payments/           # Payment API
│   │   ├── admin/              # Admin API
│   │   └── monitoring/         # Monitoring API
│   ├── layout.tsx              # Root layout
│   └── globals.css             # Global styles
├── components/                  # React components
│   ├── ui/                     # Atomic UI components
│   ├── product/                # Product components
│   ├── cart/                   # Cart components
│   ├── checkout/               # Checkout components
│   ├── auth/                   # Auth components
│   ├── admin/                  # Admin components
│   ├── layout/                 # Layout components
│   ├── accessibility/          # Accessibility features
│   ├── monitoring/             # Performance monitoring
│   └── seo/                    # SEO components
├── lib/                        # Utilities and services
│   ├── supabase/              # Database client
│   ├── auth/                  # Authentication
│   ├── cache/                 # Redis caching
│   ├── payments/              # Payment providers
│   ├── monitoring/            # Error & performance
│   ├── security/              # Security utilities
│   ├── i18n/                  # Internationalization
│   ├── hooks/                 # Custom React hooks
│   ├── utils/                 # Utility functions
│   └── validation/            # Input validation
├── types/                      # TypeScript types
│   ├── product.ts             # Product types
│   ├── cart.ts                # Cart types
│   ├── order.ts               # Order types
│   └── user.ts                # User types
└── middleware.ts               # Next.js middleware
```

## Design Patterns

### 1. Repository Pattern

Database operations are abstracted through repository-like functions:

```typescript
// src/lib/supabase/repositories/products.ts
export async function getProducts(params: ProductQueryParams) {
  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .eq("active", true)
    .range(params.offset, params.offset + params.limit - 1);

  if (error) throw new DatabaseError(error.message);
  return data;
}
```

### 2. Service Layer Pattern

Business logic is encapsulated in service functions:

```typescript
// src/lib/services/cart-price-service.ts
export async function calculateCartTotal(
  items: CartItem[]
): Promise<CartTotal> {
  const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);

  const deliveryCost = await calculateDeliveryCost();
  const total = subtotal + deliveryCost;

  return { subtotal, deliveryCost, total };
}
```

### 3. Context Provider Pattern

Global state is managed through React Context:

```typescript
// src/lib/cart/context.tsx
export function CartProvider({ children }: Props) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const addItem = useCallback(async (item: CartItem) => {
    // Add item logic
  }, []);

  return (
    <CartContext.Provider value={{ state, addItem }}>
      {children}
    </CartContext.Provider>
  );
}
```

### 4. Custom Hooks Pattern

Reusable logic is extracted into custom hooks:

```typescript
// src/lib/hooks/usePerformanceMonitor.ts
export function usePerformanceMonitor(options: Options) {
  const [metrics, setMetrics] = useState<Metrics>({});

  useEffect(() => {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      setMetrics({ renderTime });
    };
  }, []);

  return metrics;
}
```

### 5. Factory Pattern

Dynamic component creation:

```typescript
// src/lib/components/factory.ts
export function createLazyComponent<T>(
  importFn: () => Promise<{ default: ComponentType<T> }>
) {
  return lazy(importFn);
}

// Usage
const LazyProductQuickView = createLazyComponent(
  () => import("./ProductQuickView")
);
```

## Performance Optimization

### 1. Code Splitting

```typescript
// Dynamic imports for non-critical components
const AdminDashboard = lazy(() => import("@/components/admin/AdminDashboard"));
const PaymentForm = lazy(
  () => import("@/components/payments/StripePaymentForm")
);

// Route-based splitting
export const RouteComponents = {
  admin: () => import("@/components/admin"),
  checkout: () => import("@/components/checkout"),
  monitoring: () => import("@/components/monitoring"),
};
```

### 2. Image Optimization

```typescript
// Next.js Image component with optimization
<Image
  src={product.image}
  alt={product.name}
  width={400}
  height={400}
  quality={70}
  loading="lazy"
  fetchpriority={isPriority ? "high" : "auto"}
/>
```

### 3. Caching Strategy

```typescript
// Multi-layer caching
const data = await getCachedData(key, async () => {
  // Check Redis cache
  const cached = await redis.get(key);
  if (cached) return cached;

  // Fetch from database
  const fresh = await database.query();

  // Store in Redis
  await redis.set(key, fresh, { ex: 300 });

  return fresh;
});
```

### 4. Bundle Optimization

```typescript
// next.config.ts
export default {
  experimental: {
    optimizePackageImports: [
      "@/components",
      "@/lib",
      "@heroicons/react",
      "@supabase/supabase-js",
    ],
  },
  webpack: (config) => {
    config.optimization.splitChunks = {
      chunks: "all",
      maxSize: 244000,
      cacheGroups: {
        vendor: {
          /* vendor libs */
        },
        react: {
          /* React */
        },
        ui: {
          /* UI libs */
        },
      },
    };
    return config;
  },
};
```

## Security Architecture

### 1. Authentication & Authorization

```
Request
    ↓
Middleware (src/middleware.ts)
    ↓
Check Session ──→ No Session ──→ Redirect to Login
    ↓ Valid Session
Check Authorization
    ↓
Route Handler
    ↓
Row Level Security (RLS)
    ↓
Response
```

### 2. Input Validation

```typescript
// Zod schema validation
import { z } from "zod";

const ProductSchema = z.object({
  name: z.string().min(1).max(255),
  price: z.number().positive(),
  category: z.string().uuid(),
});

// Validate in API route
const validated = ProductSchema.parse(requestBody);
```

### 3. CSRF Protection

```typescript
// CSRF token validation
import { validateCsrfToken } from "@/lib/security/csrf";

export async function POST(request: NextRequest) {
  const token = request.headers.get("x-csrf-token");

  if (!validateCsrfToken(token)) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }

  // Process request
}
```

### 4. Rate Limiting

```typescript
// Rate limiting with Upstash
import { Ratelimit } from "@upstash/ratelimit";

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "15 m"),
});

const { success } = await ratelimit.limit(identifier);
if (!success) {
  return NextResponse.json({ error: "Too many requests" }, { status: 429 });
}
```

## Database Architecture

### Schema Design

```sql
-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_cs TEXT NOT NULL,
  name_en TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  category_id UUID REFERENCES categories(id),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public products are viewable by everyone"
  ON products FOR SELECT
  USING (active = true);

CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');
```

### Relationships

```
categories (1) ──→ (N) products
products (1) ──→ (N) cart_items
products (1) ──→ (N) order_items
users (1) ──→ (N) orders
users (1) ──→ (1) cart
cart (1) ──→ (N) cart_items
orders (1) ──→ (N) order_items
```

## Monitoring & Observability

### 1. Performance Monitoring

```typescript
// Component-level monitoring
usePerformanceMonitor({
  componentName: "ProductCard",
  threshold: 16,
  onSlowRender: (time) => {
    logPerformanceIssue({
      component: "ProductCard",
      renderTime: time,
    });
  },
});
```

### 2. Error Tracking

```typescript
// Centralized error logging
try {
  await performOperation();
} catch (error) {
  logErrorWithContext(error, {
    component: "ProductCard",
    operation: "addToCart",
    userId: user?.id,
  });
}
```

### 3. Core Web Vitals

```typescript
// Automatic Web Vitals tracking
import { onCLS, onFID, onLCP } from "web-vitals";

onCLS((metric) => sendToAnalytics(metric));
onFID((metric) => sendToAnalytics(metric));
onLCP((metric) => sendToAnalytics(metric));
```

## Deployment Architecture

### Production Environment

```
┌─────────────────────────────────────────┐
│         Vercel Edge Network              │
│  ┌────────────────────────────────────┐ │
│  │   CDN & Edge Functions             │ │
│  │   - Static assets                  │ │
│  │   - Image optimization             │ │
│  │   - Edge middleware                │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         Next.js Application              │
│  ┌────────────────────────────────────┐ │
│  │   Server Components                │ │
│  │   API Routes                       │ │
│  │   Serverless Functions             │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         External Services                │
│  ┌────────────────────────────────────┐ │
│  │   Supabase (Database + Storage)    │ │
│  │   Upstash (Redis)                  │ │
│  │   Stripe (Payments)                │ │
│  │   Resend (Email)                   │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## Best Practices

### 1. Component Development

- Use Server Components by default
- Add 'use client' only when necessary
- Implement proper error boundaries
- Use TypeScript strict mode
- Follow Atomic Design principles

### 2. Data Fetching

- Fetch data in Server Components
- Use React Suspense for loading states
- Implement proper error handling
- Cache responses appropriately
- Use parallel data fetching when possible

### 3. Performance

- Lazy load non-critical components
- Optimize images with Next.js Image
- Implement code splitting
- Monitor Core Web Vitals
- Use React.memo for expensive components

### 4. Security

- Validate all inputs with Zod
- Implement CSRF protection
- Use rate limiting
- Enable Row Level Security
- Sanitize user content

### 5. Testing

- Write unit tests for utilities
- Test components with React Testing Library
- Implement E2E tests for critical flows
- Test accessibility with jest-axe
- Monitor bundle size

## Migration Guides

### Adding New Feature

1. **Define Types** (`src/types/`)
2. **Create Database Schema** (Supabase migration)
3. **Implement Repository** (`src/lib/supabase/`)
4. **Create Service Layer** (`src/lib/services/`)
5. **Build Components** (`src/components/`)
6. **Add API Routes** (`src/app/api/`)
7. **Create Pages** (`src/app/[locale]/`)
8. **Add Tests**
9. **Update Documentation**

### Upgrading Dependencies

1. Check breaking changes in changelog
2. Update package.json
3. Run `npm install`
4. Update code for breaking changes
5. Run tests (`npm run test:all`)
6. Check TypeScript errors (`npm run type-check`)
7. Test locally
8. Deploy to preview environment
9. Verify in production

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

## Support

For architecture questions or guidance:

1. Review this documentation
2. Check related documentation files
3. Review code examples in the codebase
4. Contact development team: dev@ketingmar.cz
