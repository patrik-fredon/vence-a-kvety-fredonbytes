/**
 * Cart-specific caching utilities for Redis
 * Handles cart configurations, price calculations, and session management
 */

import { getCacheClient, CACHE_KEYS, generateCacheKey, serializeForCache, deserializeFromCache } from './redis';
import type { Customization } from '@/types/product';
import type { CartItem } from '@/types/cart';

// Cache TTL constants (in seconds)
const CART_CONFIG_TTL = 24 * 60 * 60; // 24 hours
const PRICE_CALCULATION_TTL = 60 * 60; // 1 hour

/**
 * Generate cache key for cart configuration
 */
function getCartConfigKey(userId: string | null, sessionId: string | null): string {
  const identifier = userId || sessionId || 'anonymous';
  return generateCacheKey(CACHE_KEYS.CART, 'config', identifier);
}

/**
 * Generate cache key for price calculation
 */
function getPriceCalculationKey(productId: string, customizations: Customization[]): string {
  // Create a hash of customizations for consistent caching
  const customizationHash = Buffer.from(JSON.stringify(customizations)).toString('base64');
  return generateCacheKey(CACHE_KEYS.CART, 'price', productId, customizationHash);
}

/**
 * Cart configuration data structure
 */
export interface CachedCartConfig {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  lastUpdated: string;
  version: number;
}

/**
 * Price calculation result for caching
 */
export interface CachedPriceCalculation {
  unitPrice: number;
  totalPrice: number;
  basePrice: number;
  customizationModifier: number;
  calculatedAt: string;
}

/**
 * Cache complete cart configuration
 */
export async function cacheCartConfiguration(
  userId: string | null,
  sessionId: string | null,
  cartData: CachedCartConfig
): Promise<void> {
  try {
    const client = getCacheClient();
    const key = getCartConfigKey(userId, sessionId);

    const dataToCache = {
      ...cartData,
      lastUpdated: new Date().toISOString(),
      version: cartData.version || 1
    };

    await client.set(key, serializeForCache(dataToCache), CART_CONFIG_TTL);

    console.log(`✅ [Cache] Cart configuration cached for ${userId ? `user:${userId}` : `session:${sessionId}`}`);
  } catch (error) {
    console.error('❌ [Cache] Error caching cart configuration:', error);
    // Don't throw - caching is not critical for functionality
  }
}

/**
 * Get cached cart configuration
 */
export async function getCachedCartConfiguration(
  userId: string | null,
  sessionId: string | null
): Promise<CachedCartConfig | null> {
  try {
    const client = getCacheClient();
    const key = getCartConfigKey(userId, sessionId);

    const cached = await client.get(key);
    if (!cached) {
      return null;
    }

    const data = deserializeFromCache<CachedCartConfig>(cached);
    if (!data) {
      return null;
    }

    console.log(`✅ [Cache] Cart configuration retrieved from cache for ${userId ? `user:${userId}` : `session:${sessionId}`}`);
    return data;
  } catch (error) {
    console.error('❌ [Cache] Error retrieving cached cart configuration:', error);
    return null;
  }
}

/**
 * Cache price calculation result
 */
export async function cachePriceCalculation(
  productId: string,
  customizations: Customization[],
  priceData: CachedPriceCalculation,
  userId?: string | null,
  sessionId?: string | null
): Promise<void> {
  try {
    const client = getCacheClient();
    const key = getPriceCalculationKey(productId, customizations);

    const dataToCache = {
      ...priceData,
      calculatedAt: new Date().toISOString()
    };

    await client.set(key, serializeForCache(dataToCache), PRICE_CALCULATION_TTL);

    // Track this cache key for later cleanup
    const identifier = userId || sessionId || 'anonymous';
    await trackPriceCalculationKey(identifier, key);

    console.log(`✅ [Cache] Price calculation cached and tracked for product:${productId}`);
  } catch (error) {
    console.error('❌ [Cache] Error caching price calculation:', error);
    // Don't throw - caching is not critical for functionality
  }
}

/**
 * Get cached price calculation
 */
export async function getCachedPriceCalculation(
  productId: string,
  customizations: Customization[]
): Promise<CachedPriceCalculation | null> {
  try {
    const client = getCacheClient();
    const key = getPriceCalculationKey(productId, customizations);

    const cached = await client.get(key);
    if (!cached) {
      return null;
    }

    const data = deserializeFromCache<CachedPriceCalculation>(cached);
    if (!data) {
      return null;
    }

    console.log(`✅ [Cache] Price calculation retrieved from cache for product:${productId}`);
    return data;
  } catch (error) {
    console.error('❌ [Cache] Error retrieving cached price calculation:', error);
    return null;
  }
}

/**
 * Invalidate cart cache for user/session
 */
export async function invalidateCartCache(
  userId: string | null,
  sessionId: string | null
): Promise<void> {
  try {
    const client = getCacheClient();
    const key = getCartConfigKey(userId, sessionId);

    await client.del(key);

    console.log(`✅ [Cache] Cart cache invalidated for ${userId ? `user:${userId}` : `session:${sessionId}`}`);
  } catch (error) {
    console.error('❌ [Cache] Error invalidating cart cache:', error);
    // Don't throw - cache invalidation failure shouldn't break functionality
  }
}

/**
 * Clear all cart-related cache (for cleanup operations)
 */
export async function clearCartCache(
  userId: string | null,
  sessionId: string | null
): Promise<void> {
  try {
    await invalidateCartCache(userId, sessionId);

    console.log(`✅ [Cache] All cart cache cleared for ${userId ? `user:${userId}` : `session:${sessionId}`}`);
  } catch (error) {
    console.error('❌ [Cache] Error clearing cart cache:', error);
  }
}
/**
 * Update cached cart after item modification (add/update/remove)
 * This is more efficient than full cache invalidation for single item changes
 */
export async function updateCachedCartAfterItemChange(
  userId: string | null,
  sessionId: string | null,
  changeType: 'add' | 'update' | 'remove',
  itemId?: string
): Promise<void> {
  try {
    // Always invalidate cache to ensure consistency
    await invalidateCartCache(userId, sessionId);

    console.log(`🔄 [Cache] Cart cache invalidated after ${changeType} operation${itemId ? ` for item:${itemId}` : ''}`);
  } catch (error) {
    console.error(`❌ [Cache] Error updating cart cache after ${changeType}:`, error);
    // Re-throw to ensure calling code knows cache invalidation failed
    throw error;
  }
}

/**
 * Force clear all cart-related cache with verification
 * This ensures cache is actually cleared and not just marked for deletion
 */
export async function forceClearCartCache(
  userId: string | null,
  sessionId: string | null
): Promise<void> {
  try {
    const client = getCacheClient();
    const identifier = userId || sessionId || 'anonymous';

    // Clear cart configuration cache
    const configKey = getCartConfigKey(userId, sessionId);
    await client.del(configKey);

    // Clear all price calculation caches for this user/session
    // Since Upstash Redis doesn't support SCAN, we need to track and clear known patterns
    await clearAllPriceCalculationCache(identifier);

    // Verify configuration cache is actually deleted
    const configExists = await client.exists(configKey);
    if (configExists) {
      console.warn(`⚠️ [Cache] Config cache key still exists after deletion attempt: ${configKey}`);
      // Try again
      await client.del(configKey);
    }

    console.log(`✅ [Cache] Force cleared ALL cart cache (config + prices) for ${userId ? `user:${userId}` : `session:${sessionId}`}`);
  } catch (error) {
    console.error('❌ [Cache] Error force clearing cart cache:', error);
    throw error;
  }
}

/**
 * Clears all price calculation cache entries for a user/session
 * Since we can't use SCAN with Upstash Redis, we use a different approach:
 * 1. Track active price cache keys in a separate set
 * 2. Clear all keys from that set
 * 3. Clean up the tracking set itself
 */
export async function clearAllPriceCalculationCache(identifier: string): Promise<void> {
  try {
    const client = getCacheClient();

    // Get the tracking set key for this user/session
    const trackingKey = generateCacheKey(CACHE_KEYS.CART, 'price-keys', identifier);

    // Get all tracked price cache keys for this user/session
    const trackedKeys = await client.get(trackingKey);

    if (trackedKeys) {
      try {
        const keyList: string[] = JSON.parse(trackedKeys);

        // Delete all tracked price cache keys
        for (const key of keyList) {
          await client.del(key);
        }

        console.log(`🧹 [Cache] Cleared ${keyList.length} price calculation cache entries for ${identifier}`);
      } catch (parseError) {
        console.warn(`⚠️ [Cache] Could not parse tracked keys for ${identifier}:`, parseError);
      }
    }

    // Clear the tracking set itself
    await client.del(trackingKey);

    console.log(`✅ [Cache] Cleared price calculation tracking for ${identifier}`);
  } catch (error) {
    console.error('❌ [Cache] Error clearing price calculation cache:', error);
    // Don't throw - this is a cleanup operation
  }
}

/**
 * Tracks a price calculation cache key for later cleanup
 */
async function trackPriceCalculationKey(identifier: string, cacheKey: string): Promise<void> {
  try {
    const client = getCacheClient();
    const trackingKey = generateCacheKey(CACHE_KEYS.CART, 'price-keys', identifier);

    // Get existing tracked keys
    const existingKeys = await client.get(trackingKey);
    let keyList: string[] = [];

    if (existingKeys) {
      try {
        keyList = JSON.parse(existingKeys);
      } catch (parseError) {
        console.warn(`⚠️ [Cache] Could not parse existing tracked keys, starting fresh`);
        keyList = [];
      }
    }

    // Add new key if not already tracked
    if (!keyList.includes(cacheKey)) {
      keyList.push(cacheKey);

      // Store updated list with same TTL as price calculations
      await client.set(trackingKey, JSON.stringify(keyList), PRICE_CALCULATION_TTL);
    }
  } catch (error) {
    console.error('❌ [Cache] Error tracking price calculation key:', error);
    // Don't throw - tracking failure shouldn't break functionality
  }
}

/**
 * Check if cart cache exists
 */
export async function hasCartCache(
  userId: string | null,
  sessionId: string | null
): Promise<boolean> {
  try {
    const client = getCacheClient();
    const key = getCartConfigKey(userId, sessionId);

    return await client.exists(key);
  } catch (error) {
    console.error('❌ [Cache] Error checking cart cache existence:', error);
    return false;
  }
}

/**
 * Get cart cache statistics for monitoring
 */
export async function getCartCacheStats(
  userId: string | null,
  sessionId: string | null
): Promise<{
  hasCache: boolean;
  cacheAge?: number;
  itemCount?: number;
} | null> {
  try {
    const cachedCart = await getCachedCartConfiguration(userId, sessionId);

    if (!cachedCart) {
      return { hasCache: false };
    }

    const cacheAge = Date.now() - new Date(cachedCart.lastUpdated).getTime();

    return {
      hasCache: true,
      cacheAge: Math.floor(cacheAge / 1000), // Age in seconds
      itemCount: cachedCart.totalItems
    };
  } catch (error) {
    console.error('❌ [Cache] Error getting cart cache stats:', error);
    return null;
  }
}
/**
 * Verify cache operations are working correctly
 * This is useful for debugging cache issues
 */
export async function verifyCacheOperation(
  userId: string | null,
  sessionId: string | null,
  operation: string
): Promise<boolean> {
  try {
    const client = getCacheClient();
    const key = getCartConfigKey(userId, sessionId);

    const exists = await client.exists(key);

    console.log(`🔍 [Cache] Verification after ${operation}: Cache ${exists ? 'EXISTS' : 'DOES NOT EXIST'} for ${userId ? `user:${userId}` : `session:${sessionId}`}`);

    return exists;
  } catch (error) {
    console.error('❌ [Cache] Error verifying cache operation:', error);
    return false;
  }
}

/**
 * Debug cache state - useful for troubleshooting
 */
export async function debugCacheState(
  userId: string | null,
  sessionId: string | null
): Promise<void> {
  try {
    const client = getCacheClient();
    const key = getCartConfigKey(userId, sessionId);

    const exists = await client.exists(key);
    console.log(`🐛 [Cache Debug] Key: ${key}, Exists: ${exists}`);

    if (exists) {
      const cached = await client.get(key);
      if (cached) {
        const data = deserializeFromCache<CachedCartConfig>(cached);
        console.log(`🐛 [Cache Debug] Data:`, {
          itemCount: data?.totalItems || 0,
          totalPrice: data?.totalPrice || 0,
          lastUpdated: data?.lastUpdated,
          version: data?.version
        });
      }
    }
  } catch (error) {
    console.error('❌ [Cache Debug] Error debugging cache state:', error);
  }
}
