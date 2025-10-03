# Caching Strategy

## Overview

The funeral wreath e-commerce platform implements a comprehensive Redis-based caching strategy to optimize performance, reduce database load, and improve user experience. This document outlines the caching architecture, implementation patterns, and best practices.

## Architecture

### Technology Stack

- **Redis Provider**: Upstash Redis (serverless Redis)
- **Client Library**: `@upstash/redis` for serverless compatibility
- **Cache Location**: Distributed Redis cluster with global replication
- **Fallback**: Graceful degradation when Redis is unavailable

### Cache Layers

1. **API Response Cache** (`src/lib/cache/api-cache.ts`)

   - HTTP response caching
   - Configurable TTL per endpoint
   - Automatic invalidation on mutations

2. **Cart Cache** (`src/lib/cache/cart-cache.ts`)

   - Shopping cart state
   - Price calculations
   - Customization configurations

3. **Product Cache** (`src/lib/cache/product-cache.ts`)

   - Product catalog data
   - Category information
   - Search results

4. **Delivery Cache** (`src/lib/cache/delivery-cache.ts`)

   - Delivery cost calculations
   - Available time slots
   - Postal code lookups

5. **Customization Cache** (`src/lib/cache/customization-cache.ts`)
   - Product customization options
   - Price modifiers
   - Availability data

## Cache Configuration

### TTL (Time To Live) Settings

```typescript
// Cache TTL configuration
const CACHE_TTL = {
  // Cart caching
  CART_CONFIG: 24 * 60 * 60, // 24 hours
  PRICE_CALCULATION: 60 * 60, // 1 hour

  // Product caching
  PRODUCT_LIST: 5 * 60, // 5 minutes
  PRODUCT_DETAIL: 10 * 60, // 10 minutes
  PRODUCT_SEARCH: 5 * 60, // 5 minutes

  // Delivery caching
  DELIVERY_COST: 15 * 60, // 15 minutes
  DELIVERY_SLOTS: 5 * 60, // 5 minutes

  // Customization caching
  CUSTOMIZATION_OPTIONS: 30 * 60, // 30 minutes

  // API response caching
  API_RESPONSE: 5 * 60, // 5 minutes (default)
};
```

### Cache Key Patterns

```typescript
// Cart cache keys
cart:config:{userId|sessionId}
cart:price:{productId}:{customizationHash}
cart:price-keys:{userId|sessionId}

// Product cache keys
product:list:{page}:{limit}:{filters}
product:detail:{productId}
product:search:{query}:{filters}

// Delivery cache keys
delivery:cost:{postalCode}:{urgency}
delivery:slots:{date}:{postalCode}

// Customization cache keys
customization:options:{productId}
customization:price:{productId}:{optionId}
```

## Implementation Patterns

### 1. Cart Caching

#### Cart Configuration Cache

```typescript
import {
  getCartCache,
  setCartCache,
  clearCartCache,
} from "@/lib/cache/cart-cache";

// Get cart from cache
const cachedCart = await getCartCache(userId);
if (cachedCart) {
  return cachedCart;
}

// Fetch from database and cache
const cart = await fetchCartFromDatabase(ud);
await setCartCache(userId, cart);
return cart;
```

#### Price Calculation Cache

```typescript
import {
  getPriceCalculationCache,
  setPriceCalculationCache,
} from "@/lib/cache/cart-cache";

// Generate cache key from customizations
const cacheKey = generatePriceCalculationKey(productId, customizations);

// Check cache
const cachedPrice = await getPriceCalculationCache(cacheKey);
if (cachedPrice) {
  return cachedPrice;
}

// Calculate and cache
const price = calculatePrice(basePrice, customizations);
await setPriceCalculationCache(cacheKey, price);
return price;
```

#### Cache Invalidation

```typescript
import { forceClearCartCache } from "@/lib/cache/cart-cache";

// Clear cart cache when cart is modified
async function updateCart(userId: string, updates: CartUpdate) {
  // Update database
  await updateCartInDatabase(userId, updates);

  // Clear cache
  await forceClearCartCache(userId);

  // Fetch fresh data
  return await fetchCartFromDatabase(userId);
}
```

### 2. Product Caching

#### Product List Cache

```typescript
import {
  getProductListCache,
  setProductListCache,
} from "@/lib/cache/product-cache";

async function getProducts(params: ProductQueryParams) {
  const cacheKey = generateProductListKey(params);

  // Check cache
  const cached = await getProductListCache(cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch from database
  const products = await fetchProductsFromDatabase(params);

  // Cache results
  await setProductListCache(cacheKey, products);

  return products;
}
```

#### Cache Warming

```typescript
import { warmProductCache } from "@/lib/utils/cache-warming";

// Warm cache for popular products
async function warmCache() {
  const popularProducts = await getPopularProducts();

  for (const product of popularProducts) {
    await warmProductCache(product.id);
  }
}
```

### 3. API Response Caching

#### Cached API Route

```typescript
import { getCachedResponse, setCachedResponse } from "@/lib/cache/api-cache";

export async function GET(request: NextRequest) {
  const cacheKey = generateCacheKey(request.url);

  // Check cache
  const cached = await getCachedResponse(cacheKey);
  if (cached) {
    return NextResponse.json(cached, {
      headers: { "X-Cache": "HIT" },
    });
  }

  // Generate response
  const data = await fetchData();

  // Cache response
  await setCachedResponse(cacheKey, data, 300); // 5 minutes

  return NextResponse.json(data, {
    headers: { "X-Cache": "MISS" },
  });
}
```

### 4. Cache Synchronization

#### Explicit Cache Clearing

```typescript
// API endpoint for cache clearing
// POST /api/cart/clear-cache
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    const sessionId = await getSessionId(request);

    // Clear all cart-related cache
    await forceClearCartCache(userId || sessionId);

    return NextResponse.json({
      success: true,
      message: "Cache cleared successfully",
    });
  } catch (error) {
    console.error("Cache clear error:", error);
    return NextResponse.json(
      { error: "Failed to clear cache" },
      { status: 500 }
    );
  }
}
```

#### Automatic Cache Invalidation

```typescript
// Invalidate cache on cart item removal
async function removeCartItem(itemId: string) {
  // Remove from database
  await deleteCartItem(itemId);

  // Check if cart is empty
  const remainingItems = await getCartItems(userId);

  if (remainingItems.length === 0) {
    // Clear cache when cart becomes empty
    await fetch("/api/cart/clear-cache", {
      method: "POST",
      credentials: "include",
    });
  }

  // Refresh cart
  return await fetchCart();
}
```

## Cache Utilities

### Core Utilities

```typescript
// src/lib/cache/cart-cache.ts

// Get cart cache
export async function getCartCache(identifier: string): Promise<Cart | null>;

// Set cart cache
export async function setCartCache(
  identifier: string,
  cart: Cart
): Promise<void>;

// Clear cart cache
export async function clearCartCache(identifier: string): Promise<void>;

// Force clear with verification
export async function forceClearCartCache(identifier: string): Promise<void>;

// Clear all price calculation cache
export async function clearAllPriceCalculationCache(
  identifier: string
): Promise<void>;

// Verify cache operation
export async function verifyCacheOperation(key: string): Promise<boolean>;

// Debug cache state
export async function debugCacheState(identifier: string): Promise<object>;
```

### Cache Key Generation

```typescript
// Generate consistent cache keys
export function generateCacheKey(
  prefix: string,
  identifier: string,
  ...params: string[]
): string {
  return `${prefix}:${identifier}:${params.join(":")}`;
}

// Generate hash for complex objects
export function generateHash(obj: object): string {
  return crypto.createHash("md5").update(JSON.stringify(obj)).digest("hex");
}
```

## Error Handling

### Graceful Degradation

```typescript
async function getCachedData(key: string) {
  try {
    return await redis.get(key);
  } catch (error) {
    console.error("Redis error:", error);
    // Continue without cache
    return null;
  }
}
```

### Cache Operation Verification

```typescript
async function setCacheWithVerification(key: string, value: any) {
  try {
    await redis.set(key, value);

    // Verify write
    const verified = await redis.get(key);
    if (!verified) {
      throw new Error("Cache write verification failed");
    }

    return true;
  } catch (error) {
    console.error("Cache set error:", error);
    return false;
  }
}
```

## Monitoring

### Cache Hit Rate

```typescript
// Track cache performance
let cacheHits = 0;
let cacheMisses = 0;

async function getCachedWithMetrics(key: string) {
  const cached = await redis.get(key);

  if (cached) {
    cacheHits++;
  } else {
    cacheMisses++;
  }

  return cached;
}

// Calculate hit rate
function getCacheHitRate(): number {
  const total = cacheHits + cacheMisses;
  return total > 0 ? (cacheHits / total) * 100 : 0;
}
```

### Cache Size Monitoring

```typescript
// Monitor cache size
async function getCacheSize(): Promise<number> {
  const keys = await redis.keys("*");
  return keys.length;
}

// Monitor memory usage
async function getCacheMemoryUsage(): Promise<string> {
  const info = await redis.info("memory");
  return info;
}
```

## Best Practices

### 1. Cache Key Design

✅ **Do:**

- Use consistent naming conventions
- Include version numbers for schema changes
- Use hierarchical key structures
- Keep keys short but descriptive

❌ **Don't:**

- Use user-generated content in keys
- Create overly long keys
- Use special characters that need escaping
- Forget to namespace keys

### 2. TTL Management

✅ **Do:**

- Set appropriate TTL for each cache type
- Use shorter TTL for frequently changing data
- Implement cache warming for critical data
- Monitor and adjust TTL based on usage patterns

❌ **Don't:**

- Use infinite TTL (no expiration)
- Set TTL too short (cache thrashing)
- Forget to set TTL
- Use same TTL for all cache types

### 3. Cache Invalidation

✅ **Do:**

- Invalidate cache on data mutations
- Use explicit cache clearing when needed
- Implement cache versioning for schema changes
- Log cache invalidation operations

❌ **Don't:**

- Rely solely on TTL for invalidation
- Forget to clear related cache entries
- Invalidate cache too aggressively
- Ignore cache invalidation errors

### 4. Error Handling

✅ **Do:**

- Implement graceful degradation
- Log cache errors for monitoring
- Continue operation if cache fails
- Verify critical cache operations

❌ **Don't:**

- Fail requests if cache is unavailable
- Ignore cache errors silently
- Retry indefinitely on cache failures
- Block requests waiting for cache

## Performance Optimization

### 1. Cache Warming

```typescript
// Warm cache during off-peak hours
async function warmCache() {
  const popularProducts = await getPopularProducts();

  await Promise.all(
    popularProducts.map((product) => warmProductCache(product.id))
  );
}

// Schedule cache warming
cron.schedule("0 2 * * *", warmCache); // 2 AM daily
```

### 2. Batch Operations

```typescript
// Batch cache operations
async function batchGetCache(keys: string[]) {
  const pipeline = redis.pipeline();

  keys.forEach((key) => pipeline.get(key));

  const results = await pipeline.exec();
  return results;
}
```

### 3. Compression

```typescript
// Compress large cache values
import { compress, decompress } from "@/lib/utils/compression";

async function setCacheCompressed(key: string, value: any) {
  const compressed = await compress(JSON.stringify(value));
  await redis.set(key, compressed);
}

async function getCacheCompressed(key: string) {
  const compressed = await redis.get(key);
  if (!compressed) return null;

  const decompressed = await decompress(compressed);
  return JSON.parse(decompressed);
}
```

## Troubleshooting

### Cache Not Working

**Symptoms**: Data not being cached or retrieved

**Solutions**:

1. Check Redis connection configuration
2. Verify environment variables (UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN)
3. Check cache key generation
4. Verify TTL settings
5. Review error logs

### Stale Cache Data

**Symptoms**: Old data being served from cache

**Solutions**:

1. Implement proper cache invalidation
2. Reduce TTL for frequently changing data
3. Add cache versioning
4. Use explicit cache clearing
5. Monitor cache hit rate

### High Cache Miss Rate

**Symptoms**: Low cache hit rate, poor performance

**Solutions**:

1. Implement cache warming
2. Increase TTL for stable data
3. Optimize cache key generation
4. Review cache invalidation strategy
5. Monitor access patterns

### Memory Issues

**Symptoms**: Redis memory usage too high

**Solutions**:

1. Reduce TTL for less critical data
2. Implement cache size limits
3. Use compression for large values
4. Review cache key patterns
5. Implement cache eviction policies

## Migration Guide

### Adding New Cache Type

1. **Create cache utility file**

```typescript
// src/lib/cache/new-cache.ts
export async function getNewCache(key: string) {
  return await redis.get(`new:${key}`);
}

export async function setNewCache(key: string, value: any) {
  await redis.set(`new:${key}`, value, { ex: 300 });
}
```

2. **Update cache configuration**

```typescript
// Add TTL configuration
const NEW_CACHE_TTL = 5 * 60; // 5 minutes
```

3. **Implement in API route**

```typescript
// Use in API endpoint
const cached = await getNewCache(key);
if (cached) return cached;

const data = await fetchData();
await setNewCache(key, data);
return data;
```

4. **Add monitoring**

```typescript
// Track cache metrics
trackCacheMetrics("new-cache", { hit: !!cached });
```

## Resources

- [Upstash Redis Documentation](https://docs.upstash.com/redis)
- [Redis Best Practices](https://redis.io/docs/manual/patterns/)
- [Next.js Caching](https://nextjs.org/docs/app/building-your-application/caching)

## Support

For caching issues or questions:

1. Check Redis connection in Upstash dashboard
2. Review cache logs in monitoring dashboard
3. Verify environment configuration
4. Contact development team: dev@ketingmar.cz
