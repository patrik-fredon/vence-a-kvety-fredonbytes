/**
 * API caching middleware for Next.js API routes
 * Provides Redis-based caching for API responses
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getCacheClient,
  CACHE_TTL,
  generateCacheKey,
  serializeForCache,
  deserializeFromCache,
} from "./redis";

interface CacheOptions {
  ttl?: number;
  keyPrefix?: string;
  skipCache?: boolean;
  varyBy?: string[]; // Headers or query params to vary cache by
}

/**
 * Cache wrapper for API route handlers
 */
export function withCache<T = any>(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse<T>>,
  options: CacheOptions = {}
) {
  return async function cachedHandler(
    request: NextRequest,
    context?: any
  ): Promise<NextResponse<T>> {
    const { ttl = CACHE_TTL.MEDIUM, keyPrefix = "api", skipCache = false, varyBy = [] } = options;

    // Skip caching for non-GET requests or when explicitly disabled
    if (request.method !== "GET" || skipCache) {
      return handler(request, context);
    }

    try {
      const client = getCacheClient();

      // Generate cache key based on URL, query params, and vary headers
      const url = new URL(request.url);
      const cacheKeyParts = [keyPrefix, url.pathname, url.search];

      // Add vary headers to cache key
      for (const header of varyBy) {
        const value = request.headers.get(header);
        if (value) {
          cacheKeyParts.push(`${header}:${value}`);
        }
      }

      const cacheKey = generateCacheKey(...cacheKeyParts);

      // Try to get cached response
      const cached = await client.get(cacheKey);
      if (cached) {
        const cachedResponse = deserializeFromCache<{
          data: T;
          status: number;
          headers: Record<string, string>;
        }>(cached);

        if (cachedResponse) {
          const response = NextResponse.json(cachedResponse.data, {
            status: cachedResponse.status,
          });

          // Set cached headers
          Object.entries(cachedResponse.headers).forEach(([key, value]) => {
            response.headers.set(key, value);
          });

          // Add cache hit header
          response.headers.set("X-Cache", "HIT");
          response.headers.set("X-Cache-Key", cacheKey);

          return response;
        }
      }

      // Execute handler if not cached
      const response = await handler(request, context);

      // Cache successful responses
      if (response.status >= 200 && response.status < 300) {
        const responseData = await response.json();

        const cacheData = {
          data: responseData,
          status: response.status,
          headers: Object.fromEntries(response.headers.entries()),
        };

        await client.set(cacheKey, serializeForCache(cacheData), ttl);

        // Create new response with cache headers
        const newResponse = NextResponse.json(responseData, {
          status: response.status,
        });

        // Copy original headers
        response.headers.forEach((value, key) => {
          newResponse.headers.set(key, value);
        });

        // Add cache miss header
        newResponse.headers.set("X-Cache", "MISS");
        newResponse.headers.set("X-Cache-Key", cacheKey);

        return newResponse;
      }

      return response;
    } catch (error) {
      console.error("Cache middleware error:", error);
      // Fallback to handler without caching
      return handler(request, context);
    }
  };
}

/**
 * Cache invalidation helper
 */
export async function invalidateApiCache(pattern: string): Promise<void> {
  try {
    const client = getCacheClient();
    await client.flushPattern(`api:${pattern}`);
  } catch (error) {
    console.error("Cache invalidation error:", error);
  }
}

/**
 * Conditional caching based on request/response characteristics
 */
export function withConditionalCache<T = any>(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse<T>>,
  options: CacheOptions & {
    condition?: (request: NextRequest, response?: NextResponse<T>) => boolean;
  } = {}
) {
  return async function conditionalCachedHandler(
    request: NextRequest,
    context?: any
  ): Promise<NextResponse<T>> {
    const { condition, ...cacheOptions } = options;

    // Check condition before caching
    if (condition && !condition(request)) {
      return handler(request, context);
    }

    return withCache(handler, cacheOptions)(request, context);
  };
}

/**
 * Cache warming utility for popular endpoints
 */
export async function warmApiCache(
  endpoints: Array<{
    path: string;
    params?: Record<string, string>;
    headers?: Record<string, string>;
  }>
): Promise<void> {
  console.log("Warming API cache...");

  for (const endpoint of endpoints) {
    try {
      const url = new URL(endpoint.path, process.env.NEXTAUTH_URL || "http://localhost:3000");

      if (endpoint.params) {
        Object.entries(endpoint.params).forEach(([key, value]) => {
          url.searchParams.set(key, value);
        });
      }

      const headers = new Headers(endpoint.headers || {});

      // Make request to warm cache
      await fetch(url.toString(), {
        method: "GET",
        headers,
      });

      console.log(`Warmed cache for: ${endpoint.path}`);
    } catch (error) {
      console.error(`Failed to warm cache for ${endpoint.path}:`, error);
    }
  }
}

/**
 * Cache statistics helper
 */
export async function getCacheStats(): Promise<{
  hits: number;
  misses: number;
  hitRate: number;
}> {
  // This would require Redis to track statistics
  // For now, return placeholder data
  return {
    hits: 0,
    misses: 0,
    hitRate: 0,
  };
}

/**
 * Response compression helper
 */
export function compressResponse<T>(data: T): string {
  // Simple JSON compression - in production, consider using gzip
  return JSON.stringify(data);
}

/**
 * Cache headers helper
 */
export function setCacheHeaders(
  response: NextResponse,
  options: {
    maxAge?: number;
    staleWhileRevalidate?: number;
    mustRevalidate?: boolean;
  } = {}
): NextResponse {
  const { maxAge = 3600, staleWhileRevalidate = 86400, mustRevalidate = false } = options;

  const cacheControl = [
    `max-age=${maxAge}`,
    `s-maxage=${maxAge}`,
    `stale-while-revalidate=${staleWhileRevalidate}`,
  ];

  if (mustRevalidate) {
    cacheControl.push("must-revalidate");
  }

  response.headers.set("Cache-Control", cacheControl.join(", "));
  response.headers.set("Vary", "Accept-Encoding, Accept-Language");

  return response;
}
