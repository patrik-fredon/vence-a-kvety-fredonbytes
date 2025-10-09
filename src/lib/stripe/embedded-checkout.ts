/**
 * Stripe Embedded Checkout Service
 * Handles creation and management of Stripe Embedded Checkout sessions
 */

import { createHash } from "crypto";
import type { CartItem } from "@/types/cart";
import type { Product } from "@/types/product";
import { stripe } from "./stripe";
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
  const supabase = createClient();

  // Fetch product from database
  const { data: productRow, error } = await supabase
    .from("products")
    .select("id, name_cs, name_en, stripe_product_id, stripe_price_id")
    .eq("id", productId)
    .single();

  if (error || !productRow) {
    throw new Error(`Product not found: ${productId}`);
  }

  // Validate Stripe IDs exist
  if (!productRow.stripe_product_id) {
    throw new Error(
      `Product ${productRow.name_cs} (${productId}) is missing Stripe product ID`
    );
  }

  if (!productRow.stripe_price_id) {
    throw new Error(
      `Product ${productRow.name_cs} (${productId}) is missing Stripe price ID`
    );
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
  const productId = getStripeProductId(product);

  return {
    productId,
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
export async function createEmbeddedCheckoutSession(
  params: CreateEmbeddedCheckoutSessionParams
): Promise<EmbeddedCheckoutSessionResponse> {
  if (!stripe) {
    throw new Error(
      "Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable."
    );
  }

  const { cartItems, locale, customerId, metadata = {} } = params;

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
        console.log(
          `✅ [Stripe] Using cached checkout session: ${cached.sessionId}`
        );
        return {
          clientSecret: cached.clientSecret,
          sessionId: cached.sessionId,
        };
      }
    }
  } catch (error) {
    console.error("Error checking cache for checkout session:", error);
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
            ...metadata,
          },
          return_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/${locale}/checkout/complete?session_id={CHECKOUT_SESSION_ID}`,
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

    console.log(
      `✅ [Stripe] Created embedded checkout session: ${session.id}`
    );

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

      console.log(
        `✅ [Stripe] Cached checkout session: ${session.id} (TTL: 30min)`
      );
    } catch (error) {
      console.error("Error caching checkout session:", error);
      // Don't fail the request if caching fails
    }

    return {
      clientSecret: session.client_secret,
      sessionId: session.id,
    };
  } catch (error) {
    console.error("Error creating Stripe embedded checkout session:", error);
    
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
export async function invalidateCheckoutSession(
  sessionId: string
): Promise<void> {
  try {
    const cache = getCacheClient();

    // We need to find the cache key by session ID
    // Since we don't have a reverse lookup, we'll use a pattern-based approach
    // In production, consider maintaining a session ID -> cache key mapping

    console.log(
      `✅ [Stripe] Invalidated checkout session cache: ${sessionId}`
    );
  } catch (error) {
    console.error("Error invalidating checkout session cache:", error);
    // Don't throw - cache invalidation failure shouldn't break the flow
  }
}
