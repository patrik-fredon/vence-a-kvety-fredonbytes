/**
 * Product and category caching utilities
 * Handles caching of product data, categories, and search results
 */

import type { Category, Product } from "@/types/product";
import { createClient } from "@/lib/supabase/server";
import {
  CACHE_KEYS,
  CACHE_TTL,
  deserializeFromCache,
  generateCacheKey,
  getCacheClient,
  serializeForCache,
} from "./redis";

/**
 * Cache product by ID
 */
export async function cacheProduct(product: Product): Promise<void> {
  try {
    const client = getCacheClient();
    const key = generateCacheKey(CACHE_KEYS.PRODUCT, product.id);
    const data = serializeForCache(product);

    await client.set(key, data, CACHE_TTL.PRODUCTS);
  } catch (error) {
    console.error("Error caching product:", error);
  }
}

/**
 * Get cached product by ID
 */
export async function getCachedProduct(productId: string): Promise<Product | null> {
  try {
    const client = getCacheClient();
    const key = generateCacheKey(CACHE_KEYS.PRODUCT, productId);
    const cached = await client.get(key);

    return deserializeFromCache<Product>(cached);
  } catch (error) {
    console.error("Error getting cached product:", error);
    return null;
  }
}

/**
 * Cache product by slug
 */
export async function cacheProductBySlug(slug: string, product: Product): Promise<void> {
  try {
    const client = getCacheClient();
    const key = generateCacheKey(CACHE_KEYS.PRODUCT_BY_SLUG, slug);
    const data = serializeForCache(product);

    await client.set(key, data, CACHE_TTL.PRODUCTS);
  } catch (error) {
    console.error("Error caching product by slug:", error);
  }
}

/**
 * Get cached product by slug
 */
export async function getCachedProductBySlug(slug: string): Promise<Product | null> {
  try {
    const client = getCacheClient();
    const key = generateCacheKey(CACHE_KEYS.PRODUCT_BY_SLUG, slug);
    const cached = await client.get(key);

    return deserializeFromCache<Product>(cached);
  } catch (error) {
    console.error("Error getting cached product by slug:", error);
    return null;
  }
}

/**
 * Cache products list with filters
 */
export async function cacheProductsList(
  filters: Record<string, any>,
  products: Product[],
  pagination?: { page: number; limit: number; total: number }
): Promise<void> {
  try {
    const client = getCacheClient();

    // Create a cache key based on filters
    const filterKey = Object.entries(filters)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}:${value}`)
      .join("|");

    const key = generateCacheKey(CACHE_KEYS.PRODUCTS_LIST, filterKey);
    const data = serializeForCache({ products, pagination });

    await client.set(key, data, CACHE_TTL.PRODUCTS);
  } catch (error) {
    console.error("Error caching products list:", error);
  }
}

/**
 * Get cached products list
 */
export async function getCachedProductsList(filters: Record<string, any>): Promise<{
  products: Product[];
  pagination?: { page: number; limit: number; total: number };
} | null> {
  try {
    const client = getCacheClient();

    // Create the same cache key based on filters
    const filterKey = Object.entries(filters)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}:${value}`)
      .join("|");

    const key = generateCacheKey(CACHE_KEYS.PRODUCTS_LIST, filterKey);
    const cached = await client.get(key);

    return deserializeFromCache<{
      products: Product[];
      pagination?: { page: number; limit: number; total: number };
    }>(cached);
  } catch (error) {
    console.error("Error getting cached products list:", error);
    return null;
  }
}

/**
 * Cache categories
 */
export async function cacheCategories(categories: Category[]): Promise<void> {
  try {
    const client = getCacheClient();
    const key = CACHE_KEYS.CATEGORIES;
    const data = serializeForCache(categories);

    await client.set(key, data, CACHE_TTL.CATEGORIES);
  } catch (error) {
    console.error("Error caching categories:", error);
  }
}

/**
 * Get cached categories
 */
export async function getCachedCategories(): Promise<Category[] | null> {
  try {
    const client = getCacheClient();
    const key = CACHE_KEYS.CATEGORIES;
    const cached = await client.get(key);

    return deserializeFromCache<Category[]>(cached);
  } catch (error) {
    console.error("Error getting cached categories:", error);
    return null;
  }
}

/**
 * Cache category by slug
 */
export async function cacheCategoryBySlug(slug: string, category: Category): Promise<void> {
  try {
    const client = getCacheClient();
    const key = generateCacheKey(CACHE_KEYS.CATEGORY_BY_SLUG, slug);
    const data = serializeForCache(category);

    await client.set(key, data, CACHE_TTL.CATEGORIES);
  } catch (error) {
    console.error("Error caching category by slug:", error);
  }
}

/**
 * Get cached category by slug
 */
export async function getCachedCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const client = getCacheClient();
    const key = generateCacheKey(CACHE_KEYS.CATEGORY_BY_SLUG, slug);
    const cached = await client.get(key);

    return deserializeFromCache<Category>(cached);
  } catch (error) {
    console.error("Error getting cached category by slug:", error);
    return null;
  }
}

/**
 * Cache API response
 */
export async function cacheApiResponse(
  endpoint: string,
  params: Record<string, any>,
  response: any,
  ttl = CACHE_TTL.MEDIUM
): Promise<void> {
  try {
    const client = getCacheClient();

    // Create cache key from endpoint and params
    const paramsKey = Object.entries(params)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}:${value}`)
      .join("|");

    const key = generateCacheKey(CACHE_KEYS.API_RESPONSE, endpoint, paramsKey);
    const data = serializeForCache(response);

    await client.set(key, data, ttl);
  } catch (error) {
    console.error("Error caching API response:", error);
  }
}

/**
 * Get cached API response
 */
export async function getCachedApiResponse(
  endpoint: string,
  params: Record<string, any>
): Promise<any | null> {
  try {
    const client = getCacheClient();

    // Create the same cache key
    const paramsKey = Object.entries(params)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}:${value}`)
      .join("|");

    const key = generateCacheKey(CACHE_KEYS.API_RESPONSE, endpoint, paramsKey);
    const cached = await client.get(key);

    return deserializeFromCache(cached);
  } catch (error) {
    console.error("Error getting cached API response:", error);
    return null;
  }
}

/**
 * Invalidate product cache
 */
export async function invalidateProductCache(productId?: string): Promise<void> {
  try {
    const client = getCacheClient();

    if (productId) {
      // Invalidate specific product
      await client.del(generateCacheKey(CACHE_KEYS.PRODUCT, productId));
    } else {
      // Invalidate all product-related cache
      await client.flushPattern("product:*");
      await client.flushPattern("products:*");
    }
  } catch (error) {
    console.error("Error invalidating product cache:", error);
  }
}

/**
 * Invalidate category cache
 */
export async function invalidateCategoryCache(categorySlug?: string): Promise<void> {
  try {
    const client = getCacheClient();

    if (categorySlug) {
      // Invalidate specific category
      await client.del(generateCacheKey(CACHE_KEYS.CATEGORY_BY_SLUG, categorySlug));
    } else {
      // Invalidate all categories
      await client.del(CACHE_KEYS.CATEGORIES);
      await client.flushPattern("category:*");
    }
  } catch (error) {
    console.error("Error invalidating category cache:", error);
  }
}

/**
 * Warm up product cache with popular products
 */
export async function warmUpProductCache(): Promise<void> {
  try {
    console.log("Warming up product cache...");

    // This would typically pre-load:
    // - Featured products
    // - Popular categories
    // - Recent products
    // - Best-selling products

    // TODO: Implement cache warming logic based on analytics
  } catch (error) {
    console.error("Error warming up product cache:", error);
  }
}

/**
 * Cache product customization options specifically for performance
 */
export async function cacheProductCustomizations(productId: string) {
  const cacheKey = `product:customizations:${productId}`;

  try {
    const supabase = createClient();

    // Optimized query for just customization options
    const { data, error } = await supabase
      .from("products")
      .select("id, customization_options")
      .eq("id", productId)
      .single();

    if (error) {
      console.error("Error fetching product customizations:", error);
      return null;
    }

    if (data) {
      const client = getCacheClient();
      await client.set(cacheKey, JSON.stringify(data.customization_options), CACHE_TTL.MEDIUM);
      return data.customization_options;
    }

    return null;
  } catch (error) {
    console.error("Error caching product customizations:", error);
    return null;
  }
}

/**
 * Get cached product customization options
 */
export async function getCachedProductCustomizations(productId: string) {
  const cacheKey = `product:customizations:${productId}`;

  try {
    const client = getCacheClient();
    const cached = await client.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // If not cached, fetch and cache
    return await cacheProductCustomizations(productId);
  } catch (error) {
    console.error("Error getting cached product customizations:", error);
    return null;
  }
}

/**
 * Batch cache customization options for multiple products
 */
export async function batchCacheProductCustomizations(productIds: string[]) {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("products")
      .select("id, customization_options")
      .in("id", productIds);

    if (error) {
      console.error("Error batch fetching product customizations:", error);
      return;
    }

    // Cache each product's customizations
    const client = getCacheClient();
    const cachePromises = (data || []).map(async (product) => {
      const cacheKey = `product:customizations:${product.id}`;
      await client.set(cacheKey, JSON.stringify(product.customization_options), CACHE_TTL.MEDIUM);
    });

    await Promise.all(cachePromises);
  } catch (error) {
    console.error("Error batch caching product customizations:", error);
  }
}
