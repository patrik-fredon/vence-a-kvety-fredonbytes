/**
 * Payment Intent caching service
 * Implements React cache and Redis caching for payment intents
 */

import { cache } from "react";
import type Stripe from "stripe";
import { CACHE_KEYS, generateCacheKey, getCacheClient } from "./redis";

// Cache TTL for payment intents (15 minutes)
const PAYMENT_INTENT_TTL = 15 * 60; // 15 minutes in seconds

/**
 * Cached payment intent data structure
 */
export interface CachedPaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: string;
  orderId: string;
  customerEmail: string;
  createdAt: string;
  expiresAt: string;
}

/**
 * Cache payment intent in Redis
 */
export async function cachePaymentIntent(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  try {
    const client = getCacheClient();
    const key = generateCacheKey(CACHE_KEYS.PAYMENT, "intent", paymentIntent.id);

    const cachedData: CachedPaymentIntent = {
      id: paymentIntent.id,
      clientSecret: paymentIntent.client_secret || "",
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      orderId: paymentIntent.metadata.orderId || "",
      customerEmail: paymentIntent.metadata.customerEmail || "",
      createdAt: new Date(paymentIntent.created * 1000).toISOString(),
      expiresAt: new Date(Date.now() + PAYMENT_INTENT_TTL * 1000).toISOString(),
    };

    await client.set(key, JSON.stringify(cachedData), PAYMENT_INTENT_TTL);

    // Also cache by order ID for quick lookup
    if (paymentIntent.metadata.orderId) {
      const orderKey = generateCacheKey(
        CACHE_KEYS.PAYMENT,
        "order-intent",
        paymentIntent.metadata.orderId
      );
      await client.set(orderKey, paymentIntent.id, PAYMENT_INTENT_TTL);
    }

    console.log(`✅ [PaymentCache] Cached payment intent: ${paymentIntent.id}`);
  } catch (error) {
    console.error("❌ [PaymentCache] Error caching payment intent:", error);
    // Don't throw - caching is not critical for functionality
  }
}

/**
 * Get cached payment intent from Redis
 */
export async function getCachedPaymentIntent(
  paymentIntentId: string
): Promise<CachedPaymentIntent | null> {
  try {
    const client = getCacheClient();
    const key = generateCacheKey(CACHE_KEYS.PAYMENT, "intent", paymentIntentId);

    const cached = await client.get(key);
    if (!cached) {
      return null;
    }

    const data = JSON.parse(cached) as CachedPaymentIntent;

    // Check if cache has expired
    if (new Date(data.expiresAt) < new Date()) {
      console.log(`⏰ [PaymentCache] Payment intent cache expired: ${paymentIntentId}`);
      await invalidatePaymentIntentCache(paymentIntentId);
      return null;
    }

    console.log(`✅ [PaymentCache] Retrieved cached payment intent: ${paymentIntentId}`);
    return data;
  } catch (error) {
    console.error("❌ [PaymentCache] Error retrieving cached payment intent:", error);
    return null;
  }
}

/**
 * Get payment intent by order ID from cache
 */
export async function getCachedPaymentIntentByOrderId(
  orderId: string
): Promise<CachedPaymentIntent | null> {
  try {
    const client = getCacheClient();
    const orderKey = generateCacheKey(CACHE_KEYS.PAYMENT, "order-intent", orderId);

    const paymentIntentId = await client.get(orderKey);
    if (!paymentIntentId) {
      return null;
    }

    return await getCachedPaymentIntent(paymentIntentId);
  } catch (error) {
    console.error("❌ [PaymentCache] Error retrieving payment intent by order ID:", error);
    return null;
  }
}

/**
 * Invalidate payment intent cache
 */
export async function invalidatePaymentIntentCache(paymentIntentId: string): Promise<void> {
  try {
    const client = getCacheClient();
    const key = generateCacheKey(CACHE_KEYS.PAYMENT, "intent", paymentIntentId);

    // Get the cached data to find the order ID
    const cached = await client.get(key);
    if (cached) {
      const data = JSON.parse(cached) as CachedPaymentIntent;
      if (data.orderId) {
        const orderKey = generateCacheKey(CACHE_KEYS.PAYMENT, "order-intent", data.orderId);
        await client.del(orderKey);
      }
    }

    await client.del(key);

    console.log(`✅ [PaymentCache] Invalidated payment intent cache: ${paymentIntentId}`);
  } catch (error) {
    console.error("❌ [PaymentCache] Error invalidating payment intent cache:", error);
    // Don't throw - cache invalidation failure shouldn't break functionality
  }
}

/**
 * Invalidate payment intent cache by order ID
 */
export async function invalidatePaymentIntentCacheByOrderId(orderId: string): Promise<void> {
  try {
    const client = getCacheClient();
    const orderKey = generateCacheKey(CACHE_KEYS.PAYMENT, "order-intent", orderId);

    const paymentIntentId = await client.get(orderKey);
    if (paymentIntentId) {
      await invalidatePaymentIntentCache(paymentIntentId);
    }

    await client.del(orderKey);

    console.log(`✅ [PaymentCache] Invalidated payment intent cache for order: ${orderId}`);
  } catch (error) {
    console.error("❌ [PaymentCache] Error invalidating payment intent cache by order ID:", error);
    // Don't throw - cache invalidation failure shouldn't break functionality
  }
}

/**
 * React cache wrapper for payment intent retrieval
 * This provides automatic deduplication of payment intent fetches within a single request
 */
export const getCachedPaymentIntentReact = cache(async (paymentIntentId: string) => {
  return await getCachedPaymentIntent(paymentIntentId);
});

/**
 * React cache wrapper for payment intent retrieval by order ID
 */
export const getCachedPaymentIntentByOrderIdReact = cache(async (orderId: string) => {
  return await getCachedPaymentIntentByOrderId(orderId);
});
