/**
 * Cache warming utilities
 * Pre-loads frequently accessed data into Redis cache
 */

import { createClient } from "@/lib/supabase/server";
import {
  cacheProduct,
  cacheProductsList,
  cacheCategories,
} from "./product-cache";
import {
  transformProductRow,
  transformCategoryRow,
} from "@/lib/utils/product-transforms";
import type { Product, /* ProductRow, */ CategoryRow, Category } from "@/types/product";

/**
 * Warm up featured products cache
 */
export async function warmFeaturedProducts(): Promise<void> {
  try {
    console.log("🔥 [CacheWarming] Warming featured products cache...");

    const supabase = createClient();
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        categories (
          id,
          name_cs,
          name_en,
          slug,
          description_cs,
          description_en,
          image_url,
          parent_id,
          sort_order,
          active,
          created_at,
          updated_at
        )
      `)
      .eq("active", true)
      .eq("featured", true)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error || !data) {
      console.error("❌ [CacheWarming] Error fetching featured products:", error);
      return;
    }

    // Transform and cache each product
    const products: Product[] = [];
    for (const row of data) {
      const category = row.categories ? transformCategoryRow(row.categories) : undefined;
      const product = transformProductRow(row, category);
      products.push(product);
      await cacheProduct(product);
    }

    // Cache the list
    await cacheProductsList(
      { featured: true, active: true, limit: 10 },
      products,
      { page: 1, limit: 10, total: products.length, totalPages: 1 }
    );

    console.log(`✅ [CacheWarming] Warmed ${products.length} featured products`);
  } catch (error) {
    console.error("❌ [CacheWarming] Error warming featured products:", error);
  }
}

/**
 * Warm up popular products cache
 * In a real implementation, this would use analytics data
 */
export async function warmPopularProducts(): Promise<void> {
  try {
    console.log("🔥 [CacheWarming] Warming popular products cache...");

    const supabase = createClient();
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        categories (
          id,
          name_cs,
          name_en,
          slug,
          description_cs,
          description_en,
          image_url,
          parent_id,
          sort_order,
          active,
          created_at,
          updated_at
        )
      `)
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error || !data) {
      console.error("❌ [CacheWarming] Error fetching popular products:", error);
      return;
    }

    // Transform and cache each product
    const products: Product[] = [];
    for (const row of data) {
      const category = row.categories ? transformCategoryRow(row.categories) : undefined;
      const product = transformProductRow(row, category);
      products.push(product);
      await cacheProduct(product);
    }

    // Cache the list
    await cacheProductsList(
      { active: true, limit: 20 },
      products,
      { page: 1, limit: 20, total: products.length, totalPages: 1 }
    );

    console.log(`✅ [CacheWarming] Warmed ${products.length} popular products`);
  } catch (error) {
    console.error("❌ [CacheWarming] Error warming popular products:", error);
  }
}

/**
 * Warm up categories cache
 */
export async function warmCategories(): Promise<void> {
  try {
    console.log("🔥 [CacheWarming] Warming categories cache...");

    const supabase = createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("active", true)
      .order("sort_order", { ascending: true });

    if (error || !data) {
      console.error("❌ [CacheWarming] Error fetching categories:", error);
      return;
    }

    // Transform and cache categories
    const categories: Category[] = data.map((row: CategoryRow) => transformCategoryRow(row));
    await cacheCategories(categories);

    console.log(`✅ [CacheWarming] Warmed ${categories.length} categories`);
  } catch (error) {
    console.error("❌ [CacheWarming] Error warming categories:", error);
  }
}

/**
 * Warm up products by category
 */
export async function warmProductsByCategory(categoryId: string, limit = 12): Promise<void> {
  try {
    console.log(`🔥 [CacheWarming] Warming products for category ${categoryId}...`);

    const supabase = createClient();
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        categories (
          id,
          name_cs,
          name_en,
          slug,
          description_cs,
          description_en,
          image_url,
          parent_id,
          sort_order,
          active,
          created_at,
          updated_at
        )
      `)
      .eq("active", true)
      .eq("category_id", categoryId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data) {
      console.error("❌ [CacheWarming] Error fetching products by category:", error);
      return;
    }

    // Transform and cache each product
    const products: Product[] = [];
    for (const row of data) {
      const category = row.categories ? transformCategoryRow(row.categories) : undefined;
      const product = transformProductRow(row, category);
      products.push(product);
      await cacheProduct(product);
    }

    // Cache the list
    await cacheProductsList(
      { categoryId, active: true, limit },
      products,
      { page: 1, limit, total: products.length, totalPages: 1 }
    );

    console.log(`✅ [CacheWarming] Warmed ${products.length} products for category ${categoryId}`);
  } catch (error) {
    console.error("❌ [CacheWarming] Error warming products by category:", error);
  }
}

/**
 * Warm up all critical caches
 * This should be called on application startup or after cache clear
 */
export async function warmAllCaches(): Promise<void> {
  console.log("🔥 [CacheWarming] Starting cache warming...");

  const startTime = Date.now();

  try {
    // Warm caches in parallel for better performance
    await Promise.all([
      warmCategories(),
      warmFeaturedProducts(),
      warmPopularProducts(),
    ]);

    const duration = Date.now() - startTime;
    console.log(`✅ [CacheWarming] Cache warming completed in ${duration}ms`);
  } catch (error) {
    console.error("❌ [CacheWarming] Error during cache warming:", error);
  }
}

/**
 * Warm up caches for specific categories
 * Useful for warming popular category pages
 */
export async function warmPopularCategories(categoryIds: string[]): Promise<void> {
  console.log(`🔥 [CacheWarming] Warming ${categoryIds.length} popular categories...`);

  try {
    // Warm each category in parallel
    await Promise.all(
      categoryIds.map(categoryId => warmProductsByCategory(categoryId, 12))
    );

    console.log(`✅ [CacheWarming] Warmed ${categoryIds.length} popular categories`);
  } catch (error) {
    console.error("❌ [CacheWarming] Error warming popular categories:", error);
  }
}

/**
 * Schedule cache warming
 * This can be called periodically to keep caches fresh
 */
export async function scheduleWarmCache(intervalMs = 3600000): Promise<void> {
  console.log(`🔥 [CacheWarming] Scheduling cache warming every ${intervalMs}ms`);

  // Initial warming
  await warmAllCaches();

  // Schedule periodic warming
  setInterval(async () => {
    console.log("🔥 [CacheWarming] Running scheduled cache warming...");
    await warmAllCaches();
  }, intervalMs);
}
