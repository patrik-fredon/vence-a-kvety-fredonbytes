/**
 * Checkout completion service
 * Handles post-payment completion logic including cache invalidation and order updates
 */

import { CACHE_KEYS, generateCacheKey, getCacheClient } from "@/lib/cache/redis";
import { updateOrderStatus } from "./order-service";

/**
 * Handle checkout completion
 * Called after successful payment to clean up and finalize the order
 *
 * @param sessionId - Stripe checkout session ID
 * @param orderId - Order ID from database
 * @returns Success status and any error messages
 */
export async function handleCheckoutComplete(
  sessionId: string,
  orderId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Invalidate cached checkout session
    await invalidateCheckoutSession(sessionId);

    // 2. Update order status to confirmed/paid
    await updateOrderStatus(orderId, "confirmed", "Payment completed successfully");

    // 3. Log completion for monitoring
    console.info("Checkout completed successfully", {
      sessionId,
      orderId,
      timestamp: new Date().toISOString(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error handling checkout completion:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error during checkout completion",
    };
  }
}

/**
 * Invalidate a cached checkout session
 * Removes the session from Redis cache
 *
 * @param sessionId - Stripe session ID to invalidate
 */
export async function invalidateCheckoutSession(sessionId: string): Promise<void> {
  try {
    const cache = getCacheClient();
    const cacheKey = generateCacheKey(CACHE_KEYS.PAYMENT, "checkout", sessionId);

    await cache.del(cacheKey);

    console.info("Invalidated checkout session cache", { sessionId });
  } catch (error) {
    console.error("Error invalidating checkout session:", error);
    // Don't throw - cache invalidation failure shouldn't block completion
  }
}

/**
 * Handle checkout cancellation
 * Called when user cancels the payment
 *
 * @param sessionId - Stripe checkout session ID
 * @param orderId - Order ID from database (if created)
 * @returns Success status and any error messages
 */
export async function handleCheckoutCancel(
  sessionId: string,
  orderId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Invalidate cached checkout session
    await invalidateCheckoutSession(sessionId);

    // 2. Update order status to cancelled if order was created
    if (orderId) {
      await updateOrderStatus(orderId, "cancelled", "Payment cancelled by user");
    }

    // 3. Log cancellation for monitoring
    console.info("Checkout cancelled", {
      sessionId,
      orderId,
      timestamp: new Date().toISOString(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error handling checkout cancellation:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error during checkout cancellation",
    };
  }
}

/**
 * Get checkout session from cache
 * Used to retrieve cached session data
 *
 * @param sessionId - Stripe session ID
 * @returns Cached session data or null if not found
 */
export async function getCachedCheckoutSession(
  sessionId: string
): Promise<{ clientSecret: string; orderId: string } | null> {
  try {
    const cache = getCacheClient();
    const cacheKey = generateCacheKey(CACHE_KEYS.PAYMENT, "checkout", sessionId);

    const cachedData = await cache.get(cacheKey);
    if (!cachedData) {
      return null;
    }

    return JSON.parse(cachedData);
  } catch (error) {
    console.error("Error getting cached checkout session:", error);
    return null;
  }
}
