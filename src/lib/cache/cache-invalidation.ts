/**
 * Cache invalidation utilities
 * Handles cache invalidation for various data updates
 */

import {
  invalidatePaymentIntentCache,
  invalidatePaymentIntentCacheByOrderId,
} from "./payment-intent-cache";
import { invalidateCategoryCache, invalidateProductCache } from "./product-cache";
import { CACHE_KEYS, generateCacheKey, getCacheClient } from "./redis";

/**
 * Invalidate all product-related caches
 * Called when products are updated, created, or deleted
 */
export async function invalidateAllProductCaches(): Promise<void> {
  try {
    console.log("🗑️ [CacheInvalidation] Invalidating all product caches...");

    await invalidateProductCache(); // Invalidates all products
    await invalidateCategoryCache(); // Invalidates all categories

    console.log("✅ [CacheInvalidation] All product caches invalidated");
  } catch (error) {
    console.error("❌ [CacheInvalidation] Error invalidating product caches:", error);
  }
}

/**
 * Invalidate product cache after update
 * Called when a specific product is updated
 */
export async function invalidateProductOnUpdate(productId: string): Promise<void> {
  try {
    console.log(`🗑️ [CacheInvalidation] Invalidating product cache: ${productId}`);

    // Invalidate specific product
    await invalidateProductCache(productId);

    // Also invalidate product lists that might contain this product
    const client = getCacheClient();
    await client.flushPattern("products:list:*");

    console.log(`✅ [CacheInvalidation] Product cache invalidated: ${productId}`);
  } catch (error) {
    console.error("❌ [CacheInvalidation] Error invalidating product cache:", error);
  }
}

/**
 * Invalidate category cache after update
 * Called when a category is updated
 */
export async function invalidateCategoryOnUpdate(categorySlug?: string): Promise<void> {
  try {
    console.log(`🗑️ [CacheInvalidation] Invalidating category cache: ${categorySlug || "all"}`);

    await invalidateCategoryCache(categorySlug);

    // Also invalidate product lists filtered by this category
    if (categorySlug) {
      const client = getCacheClient();
      await client.flushPattern(`products:list:*categorySlug:${categorySlug}*`);
    }

    console.log(`✅ [CacheInvalidation] Category cache invalidated: ${categorySlug || "all"}`);
  } catch (error) {
    console.error("❌ [CacheInvalidation] Error invalidating category cache:", error);
  }
}

/**
 * Invalidate order-related caches
 * Called when an order is completed or updated
 */
export async function invalidateOrderCaches(orderId: string): Promise<void> {
  try {
    console.log(`🗑️ [CacheInvalidation] Invalidating order caches: ${orderId}`);

    // Invalidate payment intent cache for this order
    await invalidatePaymentIntentCacheByOrderId(orderId);

    // Invalidate cart cache if order was from a cart
    const client = getCacheClient();
    const cartKey = generateCacheKey(CACHE_KEYS.CART, orderId);
    await client.del(cartKey);

    console.log(`✅ [CacheInvalidation] Order caches invalidated: ${orderId}`);
  } catch (error) {
    console.error("❌ [CacheInvalidation] Error invalidating order caches:", error);
  }
}

/**
 * Invalidate cart cache after order completion
 * Called when a cart is converted to an order
 */
export async function invalidateCartOnOrderComplete(
  userId?: string,
  sessionId?: string
): Promise<void> {
  try {
    const identifier = userId || sessionId;
    if (!identifier) {
      console.warn("⚠️ [CacheInvalidation] No identifier provided for cart invalidation");
      return;
    }

    console.log(`🗑️ [CacheInvalidation] Invalidating cart cache: ${identifier}`);

    const client = getCacheClient();

    // Invalidate cart configuration
    const cartKey = generateCacheKey(CACHE_KEYS.CART, identifier);
    await client.del(cartKey);

    // Invalidate all price calculation caches for this cart
    await client.flushPattern(`cart:price:${identifier}:*`);

    console.log(`✅ [CacheInvalidation] Cart cache invalidated: ${identifier}`);
  } catch (error) {
    console.error("❌ [CacheInvalidation] Error invalidating cart cache:", error);
  }
}

/**
 * Invalidate payment cache after status change
 * Called when payment status changes (success, failure, etc.)
 */
export async function invalidatePaymentOnStatusChange(
  paymentIntentId: string,
  orderId?: string
): Promise<void> {
  try {
    console.log(`🗑️ [CacheInvalidation] Invalidating payment cache: ${paymentIntentId}`);

    await invalidatePaymentIntentCache(paymentIntentId);

    if (orderId) {
      await invalidatePaymentIntentCacheByOrderId(orderId);
    }

    console.log(`✅ [CacheInvalidation] Payment cache invalidated: ${paymentIntentId}`);
  } catch (error) {
    console.error("❌ [CacheInvalidation] Error invalidating payment cache:", error);
  }
}

/**
 * Invalidate API response cache
 * Called when underlying data changes
 */
export async function invalidateApiCache(pattern: string): Promise<void> {
  try {
    console.log(`🗑️ [CacheInvalidation] Invalidating API cache: ${pattern}`);

    const client = getCacheClient();
    await client.flushPattern(`api:${pattern}`);

    console.log(`✅ [CacheInvalidation] API cache invalidated: ${pattern}`);
  } catch (error) {
    console.error("❌ [CacheInvalidation] Error invalidating API cache:", error);
  }
}

/**
 * Invalidate all caches
 * Use with caution - only for major updates or maintenance
 */
export async function invalidateAllCaches(): Promise<void> {
  try {
    console.log("🗑️ [CacheInvalidation] Invalidating ALL caches...");

    const client = getCacheClient();

    // Invalidate all cache patterns
    await Promise.all([
      client.flushPattern("product:*"),
      client.flushPattern("products:*"),
      client.flushPattern("category:*"),
      client.flushPattern("categories:*"),
      client.flushPattern("cart:*"),
      client.flushPattern("payment:*"),
      client.flushPattern("api:*"),
      client.flushPattern("delivery:*"),
      client.flushPattern("customization:*"),
    ]);

    console.log("✅ [CacheInvalidation] All caches invalidated");
  } catch (error) {
    console.error("❌ [CacheInvalidation] Error invalidating all caches:", error);
  }
}

/**
 * Selective cache invalidation based on event type
 */
export async function invalidateCacheByEvent(
  event:
    | "product.updated"
    | "product.created"
    | "product.deleted"
    | "category.updated"
    | "order.completed"
    | "payment.succeeded"
    | "payment.failed"
    | "cart.cleared",
  data: {
    productId?: string;
    categorySlug?: string;
    orderId?: string;
    paymentIntentId?: string;
    userId?: string;
    sessionId?: string;
  }
): Promise<void> {
  try {
    console.log(`🗑️ [CacheInvalidation] Processing event: ${event}`);

    switch (event) {
      case "product.updated":
      case "product.deleted":
        if (data.productId) {
          await invalidateProductOnUpdate(data.productId);
        }
        break;

      case "product.created":
        await invalidateAllProductCaches();
        break;

      case "category.updated":
        await invalidateCategoryOnUpdate(data.categorySlug);
        break;

      case "order.completed":
        if (data.orderId) {
          await invalidateOrderCaches(data.orderId);
          await invalidateCartOnOrderComplete(data.userId, data.sessionId);
        }
        break;

      case "payment.succeeded":
      case "payment.failed":
        if (data.paymentIntentId) {
          await invalidatePaymentOnStatusChange(data.paymentIntentId, data.orderId);
        }
        break;

      case "cart.cleared":
        await invalidateCartOnOrderComplete(data.userId, data.sessionId);
        break;

      default:
        console.warn(`⚠️ [CacheInvalidation] Unknown event type: ${event}`);
    }

    console.log(`✅ [CacheInvalidation] Event processed: ${event}`);
  } catch (error) {
    console.error(`❌ [CacheInvalidation] Error processing event ${event}:`, error);
  }
}

/**
 * Get cache statistics
 * Useful for monitoring cache effectiveness
 */
export async function getCacheStatistics(): Promise<{
  productCacheKeys: number;
  categoryCacheKeys: number;
  cartCacheKeys: number;
  paymentCacheKeys: number;
  apiCacheKeys: number;
  totalKeys: number;
}> {
  try {
    // const client = getCacheClient();

    // Note: This is a simplified version
    // In production, you'd want to use Redis SCAN command
    // Upstash Redis has limitations on pattern scanning

    return {
      productCacheKeys: 0,
      categoryCacheKeys: 0,
      cartCacheKeys: 0,
      paymentCacheKeys: 0,
      apiCacheKeys: 0,
      totalKeys: 0,
    };
  } catch (error) {
    console.error("❌ [CacheInvalidation] Error getting cache statistics:", error);
    return {
      productCacheKeys: 0,
      categoryCacheKeys: 0,
      cartCacheKeys: 0,
      paymentCacheKeys: 0,
      apiCacheKeys: 0,
      totalKeys: 0,
    };
  }
}
