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
const CART_SESSION_TTL = 30 * 24 * 60 * 60; // 30 days

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
  priceData: CachedPriceCalculation
): Promise<void> {
  try {
    const client = getCacheClient();
    const key = getPriceCalculationKey(productId, customizations);

    const dataToCache = {
      ...priceData,
      calculatedAt: new Date().toISOString()
    };

    await client.set(key, serializeForCache(dataToCache), PRICE_CALCULATION_TTL);

    console.log(`✅ [Cache] Price calculation cached for product:${productId}`);
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
