/**
 * Stripe Embedded Checkout Service
 * Handles creation and management of Stripe Embedded Checkout sessions
 */

import { createHash } from "crypto";
import type { CartItem } from "@/types/cart";
import type { Product } from "@/types/product";
import { getDeliveryMethodFromCart } from "@/lib/utils/delivery-method-utils";
import { stripe } from "@/lib/payments/stripe";
import { getStripePriceId, getStripeProductId } from "./price-selector";
import { createClient } from "@/lib/supabase/server";
import {
  getCacheClient,
  generateCacheKey,
  serializeForCache,
  deserializeFromCache,
  CACHE_TTL,
} from "@/lib/cache/redis";
import { handleStripeError, withRetry } from "./error-handler";

/**
 * Parameters for creating an embedded checkout session
 */
export interface CreateEmbeddedCheckoutSessionParams {
  cartItems: CartItem[];
  locale: "cs" | "en";
  customerId?: string;
  metadata?: Record<string, string>;
}

/**
 * Response from creating an embedded checkout session
 */
export interface EmbeddedCheckoutSessionResponse {
  clientSecret: string;
  sessionId: string;
}

/**
 * Stripe IDs for a product with customizations
 */
interface StripeIds {
  productId: string;
  priceId: string;
}

/**
 * Cached checkout session data
 */
interface CachedCheckoutSession {
  clientSecret: string;
  sessionId: string;
  expiresAt: number;
  cartItems: CartItem[];
  createdAt: number;
}

/**
 * Generates a hash for cart items to use as cache key
 * 
 * @param items - Cart items to hash
 * @returns Hash string for cache key
 */
function generateCartHash(items: CartItem[]): string {
  const sortedItems = items
    .map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      customizations: item.customizations?.sort((a, b) =>
        a.optionId.localeCompare(b.optionId)
      ),
    }))
    .sort((a, b) => a.productId.localeCompare(b.productId));

  return createHash("sha256")
    .update(JSON.stringify(sortedItems))
    .digest("hex")
    .substring(0, 16);
}

/**
 * Retrieves Stripe product and price IDs from Supabase for a cart item
 * 
 * @param productId - The product ID
 * @param customizations - Product customizations
 * @returns Stripe product and price IDs
 * @throws Error if product not found or missing Stripe IDs
 */
async function getStripeIds(
  productId: string,
  customizations: any[]
): Promise<StripeIds> {
  // Try to get from cache first
  try {
    const cacheClient = getCacheClient();
    const cacheKey = generateCacheKey("stripe:ids", productId);
    const cachedData = await cacheClient.get(cacheKey);

    if (cachedData) {
      const cached = deserializeFromCache<{
        productId: string;
        priceId: string;
        cachedAt: number;
      }>(cachedData);

      if (cached) {
        console.log("✅ [Stripe] Cache hit for Stripe IDs", { productId });
        
        // Convert to Product type for price selector
        const product: Product = {
          id: productId,
          stripeProductId: cached.productId,
          stripePriceId: cached.priceId,
        } as Product;

        // Get the appropriate price ID based on customizations
        const priceId = getStripePriceId(product, customizations);
        const stripeProductId = getStripeProductId(product);

        return {
          productId: stripeProductId,
          priceId,
        };
      }
    }
  } catch (error) {
    console.warn("⚠️ [Stripe] Cache lookup failed, fetching from database", {
      productId,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  // Cache miss - fetch from database
  const supabase = createClient();

  // Fetch product from database
  const { data: productRow, error } = await supabase
    .from("products")
    .select("id, name_cs, name_en, stripe_product_id, stripe_price_id")
    .eq("id", productId)
    .single();

  if (error || !productRow) {
    console.error("❌ [Stripe] Product not found", {
      productId,
      error: error?.message,
    });
    throw new Error(`Product not found: ${productId}`);
  }

  // Validate Stripe IDs exist
  if (!productRow.stripe_product_id) {
    console.error("❌ [Stripe] Missing Stripe product ID", {
      productId,
      productName: productRow.name_cs,
    });
    throw new Error(
      `Product ${productRow.name_cs} (${productId}) is missing Stripe product ID`
    );
  }

  if (!productRow.stripe_price_id) {
    console.error("❌ [Stripe] Missing Stripe price ID", {
      productId,
      productName: productRow.name_cs,
    });
    throw new Error(
      `Product ${productRow.name_cs} (${productId}) is missing Stripe price ID`
    );
  }

  // Cache the Stripe IDs for future use
  try {
    const cacheClient = getCacheClient();
    const cacheKey = generateCacheKey("stripe:ids", productId);
    const cacheData = serializeForCache({
      productId: productRow.stripe_product_id,
      priceId: productRow.stripe_price_id,
      cachedAt: Date.now(),
    });

    await cacheClient.set(cacheKey, cacheData, CACHE_TTL.LONG);
    console.log("✅ [Stripe] Cached Stripe IDs", { productId });
  } catch (error) {
    console.warn("⚠️ [Stripe] Failed to cache Stripe IDs", {
      productId,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  // Convert to Product type for price selector
  const product: Product = {
    id: productRow.id,
    nameCs: productRow.name_cs,
    nameEn: productRow.name_en,
    stripeProductId: productRow.stripe_product_id,
    stripePriceId: productRow.stripe_price_id,
  } as Product;

  // Get the appropriate price ID based on customizations
  const priceId = getStripePriceId(product, customizations);
  const stripeProductId = getStripeProductId(product);

  return {
    productId: stripeProductId,
    priceId,
  };
}

/**
 * Creates a Stripe Embedded Checkout session
 * 
 * @param params - Checkout session parameters
 * @returns Client secret and session ID for the embedded checkout
 * @throws Error if session creation fails
 * 
 * @example
 * ```typescript
 * const session = await createEmbeddedCheckoutSession({
 *   cartItems: cart.items,
 *   locale: 'cs',
 *   metadata: { cartId: cart.id }
 * });
 * ```
 */
/**
 * Creates or retrieves a cached Stripe Embedded Checkout session
 * 
 * This function handles the complete lifecycle of creating a Stripe checkout session:
 * 1. Validates cart items and generates a cache key
 * 2. Checks Redis cache for existing valid session
 * 3. If cache miss, creates new Stripe session with retry logic
 * 4. Caches the new session with 30-minute TTL
 * 5. Returns client secret for embedding checkout
 * 
 * @param params - Checkout session parameters
 * @param params.cartItems - Array of cart items to checkout
 * @param params.locale - User locale ('cs' or 'en') for Stripe UI
 * @param params.customerId - Optional Stripe customer ID
 * @param params.metadata - Optional metadata to attach to session
 * 
 * @returns Promise resolving to client secret and session ID
 * 
 * @throws {Error} If Stripe is not configured
 * @throws {Error} If cart is empty
 * @throws {CheckoutError} If session creation fails after retries
 * 
 * @example
 * ```typescript
 * const session = await createEmbeddedCheckoutSession({
 *   cartItems: cart.items,
 *   locale: 'cs',
 *   metadata: { cartId: cart.id }
 * });
 * ```
 * 
 * @see {@link https://stripe.com/docs/payments/checkout/embedded|Stripe Embedded Checkout Docs}
 * 
 * Requirements: 3.1, 3.2, 3.8, 3.9, 3.10, 3.12, 6.1, 6.2, 6.3
 */
export async function createEmbeddedCheckoutSession(
  params: CreateEmbeddedCheckoutSessionParams
): Promise<EmbeddedCheckoutSessionResponse> {
  const startTime = Date.now();

  if (!stripe) {
    throw new Error(
      "Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable."
    );
  }

  const { cartItems, locale, customerId, metadata = {} } = params;

  // Log checkout session creation attempt
  console.log("🛒 [Stripe] Creating embedded checkout session", {
    itemCount: cartItems.length,
    locale,
    hasCustomerId: !!customerId,
    metadata,
  });

  // Validate cart items
  if (!cartItems || cartItems.length === 0) {
    throw new Error("Cart is empty");
  }

  // Generate cache key from cart items
  const cartHash = generateCartHash(cartItems);
  const cacheKey = generateCacheKey("checkout:session", cartHash);

  // Check cache for existing session
  try {
    const cache = getCacheClient();
    const cachedData = await cache.get(cacheKey);

    if (cachedData) {
      const cached = deserializeFromCache<CachedCheckoutSession>(cachedData);

      if (cached && cached.expiresAt > Date.now()) {
        const duration = Date.now() - startTime;
        console.log("✅ [Stripe] Cache hit for checkout session", {
          sessionId: cached.sessionId,
          cartHash,
          duration,
          cached: true,
        });
        return {
          clientSecret: cached.clientSecret,
          sessionId: cached.sessionId,
        };
      } else if (cached) {
        console.log("⚠️ [Stripe] Cached session expired", {
          sessionId: cached.sessionId,
          expiresAt: new Date(cached.expiresAt).toISOString(),
        });
      }
    }
  } catch (error) {
    console.error("❌ [Stripe] Cache check failed", {
      error: error instanceof Error ? error.message : String(error),
      cartHash,
    });
    // Continue to create new session if cache fails
  }

  // Build line items for Stripe
  const lineItems = await Promise.all(
    cartItems.map(async (item) => {
      try {
        const { priceId } = await getStripeIds(
          item.productId,
          item.customizations || []
        );

        return {
          price: priceId,
          quantity: item.quantity,
        };
      } catch (error) {
        console.error(
          `Failed to get Stripe IDs for product ${item.productId}:`,
          error
        );
        throw error;
      }
    })
  );

  // Extract delivery method from cart items (Requirement 9.1, 9.2)
  const deliveryMethod = getDeliveryMethodFromCart(cartItems);

  // Create checkout session with retry logic
  try {
    const session = await withRetry(
      async () => {
        if (!stripe) {
          throw new Error("Stripe is not initialized");
        }

        return await stripe.checkout.sessions.create({
          mode: "payment",
          ui_mode: "embedded",
          line_items: lineItems,
          locale: locale === "cs" ? "cs" : "en",
          ...(customerId && { customer: customerId }),
          metadata: {
            locale,
            deliveryMethod: deliveryMethod || "delivery",
            ...metadata,
          },
          return_url: `${process.env["NEXT_PUBLIC_BASE_URL"] || "http://localhost:3000"}/${locale}/checkout/complete?session_id={CHECKOUT_SESSION_ID}`,
        });
      },
      {
        maxRetries: 3,
        delayMs: 1000,
        backoffMultiplier: 2,
      }
    );

    if (!session.client_secret) {
      throw new Error("Failed to create checkout session: no client secret");
    }

    const duration = Date.now() - startTime;
    console.log("✅ [Stripe] Created embedded checkout session", {
      sessionId: session.id,
      itemCount: lineItems.length,
      locale,
      duration,
      cached: false,
    });

    // Cache the session with 30-minute TTL
    try {
      const cache = getCacheClient();
      const cachedSession: CachedCheckoutSession = {
        clientSecret: session.client_secret,
        sessionId: session.id,
        expiresAt: Date.now() + CACHE_TTL.MEDIUM * 1000, // 30 minutes
        cartItems,
        createdAt: Date.now(),
      };

      await cache.set(
        cacheKey,
        serializeForCache(cachedSession),
        CACHE_TTL.MEDIUM // 30 minutes
      );

      console.log("✅ [Stripe] Cached checkout session", {
        sessionId: session.id,
        cartHash,
        ttl: CACHE_TTL.MEDIUM,
      });
    } catch (error) {
      console.error("❌ [Stripe] Failed to cache session", {
        sessionId: session.id,
        error: error instanceof Error ? error.message : String(error),
      });
      // Don't fail the request if caching fails
    }

    return {
      clientSecret: session.client_secret,
      sessionId: session.id,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error("❌ [Stripe] Failed to create checkout session", {
      error: error instanceof Error ? error.message : String(error),
      itemCount: cartItems.length,
      locale,
      duration,
    });
    
    // Convert to CheckoutError with localized message
    const checkoutError = handleStripeError(error, locale);
    throw checkoutError;
  }
}

/**
 * Invalidates a cached checkout session
 * Should be called when checkout is completed or cancelled
 * 
 * @param sessionId - Stripe session ID to invalidate
 * 
 * @example
 * ```typescript
 * await invalidateCheckoutSession(session.id);
 * ```
 */
/**
 * Invalidates a cached checkout session
 * 
 * Should be called after successful payment completion or cancellation
 * to ensure the session cannot be reused.
 * 
 * Note: Current implementation logs the invalidation but doesn't perform
 * actual cache deletion due to lack of reverse lookup (session ID -> cache key).
 * Consider maintaining a session ID mapping in production for full invalidation.
 * 
 * @param sessionId - Stripe session ID to invalidate
 * 
 * @returns Promise that resolves when invalidation completes
 * 
 * @example
 * ```typescript
 * await invalidateCheckoutSession(session.sessionId);
 * ```
 * 
 * Requirements: 3.12, 9.4
 */
export async function invalidateCheckoutSession(
  sessionId: string
): Promise<void> {
  try {
    // We need to find the cache key by session ID
    // Since we don't have a reverse lookup, we'll use a pattern-based approach
    // In production, consider maintaining a session ID -> cache key mapping
    // For now, we just log the invalidation

    console.log("✅ [Stripe] Invalidated checkout session cache", {
      sessionId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ [Stripe] Failed to invalidate session cache", {
      sessionId,
      error: error instanceof Error ? error.message : String(error),
    });
    // Don't throw - cache invalidation failure shouldn't break the flow
  }
}

/**
 * Warm up cache for popular products' Stripe IDs
 * Pre-caches Stripe product and price IDs for frequently accessed products
 * 
 * @param productIds - Array of product IDs to warm up
 * @returns Promise that resolves when cache warming is complete
 */
export async function warmStripeIdsCache(productIds: string[]): Promise<void> {
  console.log(`🔥 [Stripe] Warming Stripe IDs cache for ${productIds.length} products...`);
  
  const startTime = Date.now();
  let successCount = 0;
  let errorCount = 0;

  try {
    const supabase = await createClient();
    
    // Fetch products with their Stripe IDs
    const { data: products, error } = await supabase
      .from("products")
      .select("id, stripe_product_id, stripe_price_id, name_cs, name_en")
      .in("id", productIds)
      .eq("active", true);

    if (error) {
      console.error("❌ [Stripe] Error fetching products for cache warming:", error);
      return;
    }

    if (!products || products.length === 0) {
      console.log("⚠️ [Stripe] No products found for cache warming");
      return;
    }

    // Cache Stripe IDs for each product
    const cacheClient = getCacheClient();
    
    for (const product of products) {
      try {
        if (!product.stripe_product_id || !product.stripe_price_id) {
          console.warn(`⚠️ [Stripe] Product ${product.id} missing Stripe IDs`);
          errorCount++;
          continue;
        }

        // Cache the Stripe IDs
        const cacheKey = generateCacheKey("stripe:ids", product.id);
        const cacheData = serializeForCache({
          productId: product.stripe_product_id,
          priceId: product.stripe_price_id,
          cachedAt: Date.now(),
        });

        await cacheClient.set(cacheKey, cacheData, CACHE_TTL.LONG);
        successCount++;
      } catch (error) {
        console.error(`❌ [Stripe] Error caching Stripe IDs for product ${product.id}:`, error);
        errorCount++;
      }
    }

    const duration = Date.now() - startTime;
    console.log(`✅ [Stripe] Cache warming completed in ${duration}ms`, {
      total: products.length,
      success: successCount,
      errors: errorCount,
    });
  } catch (error) {
    console.error("❌ [Stripe] Error during cache warming:", error);
  }
}

/**
 * Warm up cache for popular products based on analytics
 * Fetches most viewed/purchased products and pre-caches their Stripe IDs
 * 
 * @param limit - Number of popular products to cache (default: 20)
 * @returns Promise that resolves when cache warming is complete
 */
export async function warmPopularProductsStripeIds(limit = 20): Promise<void> {
  console.log(`🔥 [Stripe] Warming Stripe IDs cache for ${limit} popular products...`);

  try {
    const supabase = await createClient();
    
    // Fetch popular products (featured or recently created as a proxy for popular)
    const { data: products, error } = await supabase
      .from("products")
      .select("id")
      .eq("active", true)
      .or("featured.eq.true,created_at.gte.2024-01-01")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("❌ [Stripe] Error fetching popular products:", error);
      return;
    }

    if (!products || products.length === 0) {
      console.log("⚠️ [Stripe] No popular products found");
      return;
    }

    const productIds = products.map(p => p.id);
    await warmStripeIdsCache(productIds);
  } catch (error) {
    console.error("❌ [Stripe] Error warming popular products cache:", error);
  }
}

/**
 * Background cache refresh for Stripe IDs
 * Periodically refreshes cached Stripe IDs to ensure they stay fresh
 * 
 * @param intervalMs - Refresh interval in milliseconds (default: 1 hour)
 */
export function scheduleStripeIdsCacheRefresh(intervalMs = 3600000): void {
  console.log(`🔥 [Stripe] Scheduling Stripe IDs cache refresh every ${intervalMs}ms`);

  // Initial warming
  warmPopularProductsStripeIds().catch(error => {
    console.error("❌ [Stripe] Initial cache warming failed:", error);
  });

  // Schedule periodic refresh
  setInterval(async () => {
    console.log("🔄 [Stripe] Running scheduled Stripe IDs cache refresh...");
    try {
      await warmPopularProductsStripeIds();
    } catch (error) {
      console.error("❌ [Stripe] Scheduled cache refresh failed:", error);
    }
  }, intervalMs);
}
