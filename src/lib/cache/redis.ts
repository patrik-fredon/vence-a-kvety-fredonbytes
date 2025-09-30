/**
 * Redis client configuration and utilities
 * Supports both Upstash Redis (serverless) and traditional Redis
 */

import { Redis } from "@upstash/redis";

// Redis client instance
let redis: Redis | null = null;

/**
 * Initialize Redis client
 */
export function getRedisClient(): Redis {
  if (!redis) {
    // Use Upstash standard environment variables
    const redisUrl = process.env['UPSTASH_REDIS_REST_URL'] || process.env['REDIS_URL'];
    const redisToken = process.env['UPSTASH_REDIS_REST_TOKEN'] || process.env['REDIS_TOKEN'];

    if (!redisUrl) {
      throw new Error("UPSTASH_REDIS_REST_URL or REDIS_URL environment variable is not set");
    }

    if (!redisToken) {
      throw new Error("UPSTASH_REDIS_REST_TOKEN or REDIS_TOKEN environment variable is not set");
    }

    // Initialize Upstash Redis client
    redis = new Redis({
      url: redisUrl,
      token: redisToken,
    });
  }

  return redis;
}

/**
 * Cache interface for consistent caching operations
 */
export interface CacheClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  mget(...keys: string[]): Promise<(string | null)[]>;
  mset(data: Record<string, string>, ttl?: number): Promise<void>;
  expire(key: string, ttl: number): Promise<void>;
  flushPattern(pattern: string): Promise<void>;
}

/**
 * Redis cache client implementation
 */
class RedisCacheClient implements CacheClient {
  private client: Redis;

  constructor() {
    this.client = getRedisClient();
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      console.error("Redis GET error:", error);
      return null;
    }
  }

  async set(key: string, value: string, ttl = 3600): Promise<void> {
    try {
      await this.client.setex(key, ttl, value);
    } catch (error) {
      console.error("Redis SET error:", error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      console.error("Redis DEL error:", error);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error("Redis EXISTS error:", error);
      return false;
    }
  }

  async mget(...keys: string[]): Promise<(string | null)[]> {
    try {
      return await this.client.mget(...keys);
    } catch (error) {
      console.error("Redis MGET error:", error);
      return keys.map(() => null);
    }
  }

  async mset(data: Record<string, string>, ttl = 3600): Promise<void> {
    try {
      const pipeline = this.client.pipeline();

      for (const [key, value] of Object.entries(data)) {
        pipeline.setex(key, ttl, value);
      }

      await pipeline.exec();
    } catch (error) {
      console.error("Redis MSET error:", error);
    }
  }

  async expire(key: string, ttl: number): Promise<void> {
    try {
      await this.client.expire(key, ttl);
    } catch (error) {
      console.error("Redis EXPIRE error:", error);
    }
  }

  async flushPattern(pattern: string): Promise<void> {
    try {
      // Note: Upstash Redis doesn't support SCAN, so we'll need to track keys manually
      // For now, we'll implement a simple pattern-based deletion
      console.warn("Pattern-based flush not fully supported with Upstash Redis");
    } catch (error) {
      console.error("Redis FLUSH PATTERN error:", error);
    }
  }
}

/**
 * In-memory cache fallback for development/testing
 */
class MemoryCacheClient implements CacheClient {
  private cache = new Map<string, { value: string; expires: number }>();

  async get(key: string): Promise<string | null> {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  async set(key: string, value: string, ttl = 3600): Promise<void> {
    const expires = Date.now() + ttl * 1000;
    this.cache.set(key, { value, expires });
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    const item = this.cache.get(key);
    if (!item) return false;

    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  async mget(...keys: string[]): Promise<(string | null)[]> {
    return Promise.all(keys.map((key) => this.get(key)));
  }

  async mset(data: Record<string, string>, ttl = 3600): Promise<void> {
    for (const [key, value] of Object.entries(data)) {
      await this.set(key, value, ttl);
    }
  }

  async expire(key: string, ttl: number): Promise<void> {
    const item = this.cache.get(key);
    if (item) {
      const expires = Date.now() + ttl * 1000;
      this.cache.set(key, { ...item, expires });
    }
  }

  async flushPattern(pattern: string): Promise<void> {
    const regex = new RegExp(pattern.replace("*", ".*"));
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }
}

// Global cache client instance
let cacheClient: CacheClient | null = null;

/**
 * Get cache client instance (Redis in production, memory in development)
 */
export function getCacheClient(): CacheClient {
  if (!cacheClient) {
    try {
      // Try to use Redis if available
      if (process.env['REDIS_URL']) {
        cacheClient = new RedisCacheClient();
      } else {
        console.warn("Redis not configured, using in-memory cache");
        cacheClient = new MemoryCacheClient();
      }
    } catch (error) {
      console.error("Failed to initialize Redis, falling back to memory cache:", error);
      cacheClient = new MemoryCacheClient();
    }
  }

  return cacheClient;
}

/**
 * Cache key utilities
 */
export const CACHE_KEYS = {
  // Product caching
  PRODUCT: "product",
  PRODUCTS_LIST: "products:list",
  PRODUCT_BY_SLUG: "product:slug",
  CATEGORIES: "categories",
  CATEGORY_BY_SLUG: "category:slug",

  // Delivery caching
  DELIVERY_CALENDAR: "delivery:calendar",
  DELIVERY_AVAILABILITY: "delivery:availability",
  DELIVERY_ZONES: "delivery:zones",
  DELIVERY_HOLIDAYS: "delivery:holidays",
  DELIVERY_PRICING: "delivery:pricing",

  // Cart and session
  CART: "cart",

  // Customization caching
  CUSTOMIZATION: "customization",
  SESSION: "session",

  // API responses
  API_RESPONSE: "api:response",
} as const;

/**
 * Cache TTL (Time To Live) in seconds
 */
export const CACHE_TTL = {
  // Short-term caching (5-30 minutes)
  SHORT: 300, // 5 minutes
  MEDIUM: 1800, // 30 minutes

  // Medium-term caching (1-6 hours)
  HOUR: 3600, // 1 hour
  LONG: 21600, // 6 hours

  // Long-term caching (1-7 days)
  DAY: 86400, // 24 hours
  WEEK: 604800, // 7 days

  // Specific use cases
  PRODUCTS: 3600, // 1 hour
  CATEGORIES: 21600, // 6 hours
  DELIVERY: 1800, // 30 minutes
  CART: 86400, // 24 hours
  SESSION: 3600, // 1 hour
} as const;

/**
 * Generate cache key with prefix
 */
export function generateCacheKey(prefix: string, ...parts: (string | number)[]): string {
  return [prefix, ...parts].join(":");
}

/**
 * Serialize data for caching
 */
export function serializeForCache(data: any): string {
  try {
    // Ensure we can serialize the data
    const serialized = JSON.stringify(data);

    // Validate that it's not "[object Object]"
    if (serialized === "[object Object]" || serialized.startsWith("[object ")) {
      console.error("Invalid serialization result:", serialized, "Original data:", data);
      throw new Error("Invalid serialization result");
    }

    return serialized;
  } catch (error) {
    console.error("Failed to serialize data for cache:", error, "Data:", data);
    // Return a safe fallback
    return JSON.stringify({ error: "serialization_failed", timestamp: Date.now() });
  }
}

/**
 * Deserialize data from cache
 */
export function deserializeFromCache<T>(data: string | null): T | null {
  if (!data) return null;

  try {
    // Check if data is already an object (shouldn't happen but let's be safe)
    if (typeof data === "object") {
      console.warn("Cache data is already an object, returning as-is:", data);
      return data as T;
    }

    // Check if data looks like "[object Object]" which indicates a serialization issue
    if (data === "[object Object]" || data.startsWith("[object ")) {
      console.error("Cache contains invalid serialized object:", data);
      return null;
    }

    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to deserialize cache data:", error, "Data:", data?.substring(0, 100));
    return null;
  }
}
