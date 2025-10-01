import {
  batchCacheProductCustomizations,
  // Removed unused getCachedProductCustomizations
} from "@/lib/cache/product-cache";
import { getFrequentCustomizationOptions } from "./customization-queries";
import { customizationCache } from "@/lib/cache/customization-cache";

/**
 * Cache warming utilities for performance optimization
 */

/**
 * Warm up cache for wreath products on application start
 */
export async function warmUpWreathCache(): Promise<void> {
  try {
    // Pre-load frequent customization options
    await getFrequentCustomizationOptions();

    console.log("Wreath customization cache warmed up successfully");
  } catch (error) {
    console.error("Error warming up wreath cache:", error);
  }
}

/**
 * Warm up cache for specific product categories
 */
export async function warmUpCategoryCache(category: string): Promise<void> {
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = createClient();

    // Get products in category
    const { data: products, error } = await supabase
      .from("products")
      .select("id")
      .eq("category", category)
      .limit(10); // Limit to avoid overwhelming the cache

    if (error) {
      console.error(`Error fetching ${category} products for cache warming:`, error);
      return;
    }

    if (products && products.length > 0) {
      const productIds = products.map(p => p.id);
      await batchCacheProductCustomizations(productIds);

      console.log(`Cache warmed up for ${products.length} ${category} products`);
    }
  } catch (error) {
    console.error(`Error warming up ${category} cache:`, error);
  }
}

/**
 * Warm up cache based on user behavior patterns
 */
export async function warmUpUserBasedCache(userId?: string): Promise<void> {
  if (!userId) return;

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = createClient();

    // Get user's recently viewed or purchased products
    const { data: recentProducts, error } = await supabase
      .from("cart_items")
      .select("product_id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      console.error("Error fetching user's recent products:", error);
      return;
    }

    if (recentProducts && recentProducts.length > 0) {
      const productIds = [...new Set(recentProducts.map(item => item.product_id).filter(id => id !== null))];
      await batchCacheProductCustomizations(productIds);

      console.log(`Cache warmed up for ${productIds.length} user-specific products`);
    }
  } catch (error) {
    console.error("Error warming up user-based cache:", error);
  }
}

/**
 * Schedule periodic cache warming
 */
export function schedulePeriodicCacheWarming(): void {
  if (typeof window === "undefined") {
    // Only run on server side
    return;
  }

  // Warm up cache every 30 minutes
  setInterval(async () => {
    try {
      await warmUpWreathCache();
      await warmUpCategoryCache("wreaths");

      // Clean up expired cache entries
      customizationCache.cleanup();

      console.log("Periodic cache warming completed");
    } catch (error) {
      console.error("Error during periodic cache warming:", error);
    }
  }, 30 * 60 * 1000); // 30 minutes
}

/**
 * Get cache warming statistics
 */
export function getCacheWarmingStats() {
  return {
    customizationCache: customizationCache.getStats(),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Manual cache warming trigger (for admin use)
 */
export async function triggerManualCacheWarming(): Promise<{
  success: boolean;
  message: string;
  stats?: any;
}> {
  try {
    await Promise.all([
      warmUpWreathCache(),
      warmUpCategoryCache("wreaths"),
      warmUpCategoryCache("flowers"),
    ]);

    const stats = getCacheWarmingStats();

    return {
      success: true,
      message: "Cache warming completed successfully",
      stats,
    };
  } catch (error) {
    return {
      success: false,
      message: `Cache warming failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}
