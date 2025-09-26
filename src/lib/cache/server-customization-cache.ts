/**
 * Server-side customization cache using Redis
 * This replaces the client-side cache for server environments
 */

import { getCacheClient, generateCacheKey, serializeForCache, deserializeFromCache, CACHE_KEYS } from './redis';
import type { CustomizationOption } from '@/types/product';

// Cache TTL for customization options (1 hour)
const CUSTOMIZATION_CACHE_TTL = 60 * 60; // 1 hour in seconds

/**
 * Get customization options from Redis cache
 */
export async function getCachedCustomizationOptions(
  productId: string
): Promise<CustomizationOption[] | null> {
  try {
    const client = getCacheClient();
    const key = generateCacheKey(CACHE_KEYS.CUSTOMIZATION, 'options', productId);

    const cached = await client.get(key);
    if (!cached) {
      return null;
    }

    const data = deserializeFromCache<CustomizationOption[]>(cached);
    if (!data) {
      return null;
    }

    console.log(`✅ [Cache] Customization options retrieved from cache for product:${productId}`);
    return data;
  } catch (error) {
    console.error('❌ [Cache] Error retrieving cached customization options:', error);
    return null;
  }
}

/**
 * Cache customization options in Redis
 */
export async function setCachedCustomizationOptions(
  productId: string,
  options: CustomizationOption[]
): Promise<void> {
  try {
    const client = getCacheClient();
    const key = generateCacheKey(CACHE_KEYS.CUSTOMIZATION, 'options', productId);

    await client.set(key, serializeForCache(options), CUSTOMIZATION_CACHE_TTL);

    console.log(`✅ [Cache] Customization options cached for product:${productId}`);
  } catch (error) {
    console.error('❌ [Cache] Error caching customization options:', error);
    // Don't throw - caching is not critical for functionality
  }
}

/**
 * Invalidate customization options cache for a product
 */
export async function invalidateCustomizationOptionsCache(productId: string): Promise<void> {
  try {
    const client = getCacheClient();
    const key = generateCacheKey(CACHE_KEYS.CUSTOMIZATION, 'options', productId);

    await client.del(key);

    console.log(`✅ [Cache] Customization options cache invalidated for product:${productId}`);
  } catch (error) {
    console.error('❌ [Cache] Error invalidating customization options cache:', error);
  }
}

/**
 * Batch cache customization options for multiple products
 */
export async function batchCacheCustomizationOptions(
  productOptions: Array<{ productId: string; options: CustomizationOption[] }>
): Promise<void> {
  try {
    const client = getCacheClient();
    const cacheData: Record<string, string> = {};

    for (const { productId, options } of productOptions) {
      const key = generateCacheKey(CACHE_KEYS.CUSTOMIZATION, 'options', productId);
      cacheData[key] = serializeForCache(options);
    }

    await client.mset(cacheData, CUSTOMIZATION_CACHE_TTL);

    console.log(`✅ [Cache] Batch cached customization options for ${productOptions.length} products`);
  } catch (error) {
    console.error('❌ [Cache] Error batch caching customization options:', error);
  }
}
