"use client";

import type { CustomizationOption } from "@/types/product";

/**
 * In-memory cache for customization options to reduce database queries
 */
class CustomizationCache {
  private cache = new Map<string, CustomizationOption[]>();
  private cacheTimestamps = new Map<string, number>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Get cached customization options for a product
   */
  get(productId: string): CustomizationOption[] | null {
    const cached = this.cache.get(productId);
    const timestamp = this.cacheTimestamps.get(productId);

    if (!cached || !timestamp) {
      return null;
    }

    // Check if cache is expired
    if (Date.now() - timestamp > this.CACHE_TTL) {
      this.cache.delete(productId);
      this.cacheTimestamps.delete(productId);
      return null;
    }

    return cached;
  }

  /**
   * Set customization options in cache
   */
  set(productId: string, options: CustomizationOption[]): void {
    this.cache.set(productId, options);
    this.cacheTimestamps.set(productId, Date.now());
  }

  /**
   * Clear cache for a specific product
   */
  clear(productId: string): void {
    this.cache.delete(productId);
    this.cacheTimestamps.delete(productId);
  }

  /**
   * Clear all cached data
   */
  clearAll(): void {
    this.cache.clear();
    this.cacheTimestamps.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Cleanup expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, timestamp] of this.cacheTimestamps.entries()) {
      if (now - timestamp > this.CACHE_TTL) {
        this.cache.delete(key);
        this.cacheTimestamps.delete(key);
      }
    }
  }
}

// Singleton instance
const customizationCache = new CustomizationCache();

// Cleanup expired entries every 10 minutes
if (typeof window !== "undefined") {
  setInterval(() => {
    customizationCache.cleanup();
  }, 10 * 60 * 1000);
}

export { customizationCache };

/**
 * Hook to use customization cache with React components
 */
export function useCustomizationCache() {
  return {
    get: (productId: string) => customizationCache.get(productId),
    set: (productId: string, options: CustomizationOption[]) =>
      customizationCache.set(productId, options),
    clear: (productId: string) => customizationCache.clear(productId),
    clearAll: () => customizationCache.clearAll(),
    getStats: () => customizationCache.getStats(),
  };
}
