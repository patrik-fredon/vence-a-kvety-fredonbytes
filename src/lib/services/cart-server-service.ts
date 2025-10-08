/**
 * Server-side cart service for fetching cart data in Server Components
 * This provides optimized cart fetching with caching support
 */

import { cookies } from "next/headers";
import { auth } from "@/lib/auth/config";
import { createServerClient } from "@/lib/supabase/server";
import type { CartSummary } from "@/types/cart";
import type { Product } from "@/types/product";

/**
 * Get cart items server-side with caching support
 * This function can be used in Server Components and Server Actions
 */
export async function getServerCart(): Promise<CartSummary> {
  try {
    console.log("🛒 [ServerCart] Fetching cart items server-side");

    const supabase = createServerClient();
    const session = await auth();

    // Get session ID from cookies if user is not authenticated
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("cart-session")?.value || null;

    // Return empty cart if no user or session
    if (!(session?.user?.id || sessionId)) {
      console.log("ℹ️ [ServerCart] No user or session, returning empty cart");
      return {
        items: [],
        itemCount: 0,
        subtotal: 0,
        total: 0,
      };
    }

    // Try to get cached cart configuration first
    try {
      const { getCachedCartConfiguration } = await import("@/lib/cache/cart-cache");
      const cachedCart = await getCachedCartConfiguration(session?.user?.id || null, sessionId);

      if (cachedCart) {
        // Validate cache age - if older than 5 minutes, fetch fresh data
        const cacheAge = Date.now() - new Date(cachedCart.lastUpdated).getTime();
        const maxCacheAge = 5 * 60 * 1000; // 5 minutes in milliseconds

        if (cacheAge < maxCacheAge) {
          console.log(
            `✅ [ServerCart] Returning cached cart (age: ${Math.floor(cacheAge / 1000)}s)`
          );
          return {
            items: cachedCart.items,
            itemCount: cachedCart.totalItems,
            subtotal: cachedCart.totalPrice,
            total: cachedCart.totalPrice,
          };
        } else {
          console.log(
            `⏰ [ServerCart] Cache is stale (age: ${Math.floor(cacheAge / 1000)}s), fetching fresh data`
          );
          // Clear stale cache and fetch fresh data
          const { invalidateCartCache } = await import("@/lib/cache/cart-cache");
          await invalidateCartCache(session?.user?.id || null, sessionId);
        }
      }
    } catch (cacheError) {
      console.error("⚠️ [ServerCart] Cache retrieval failed (non-critical):", cacheError);
      // Continue with database fetch
    }

    // Build query based on authentication status
    let query = supabase.from("cart_items").select(`
        *,
        products (
          id,
          name_cs,
          name_en,
          slug,
          base_price,
          images,
          customization_options,
          availability
        )
      `);

    if (session?.user?.id) {
      query = query.eq("user_id", session.user.id);
    } else if (sessionId) {
      query = query.eq("session_id", sessionId);
    }

    const { data: cartItems, error } = await query.order("created_at", { ascending: false });

    if (error) {
      console.error("❌ [ServerCart] Error fetching cart items:", error);
      throw new Error("Failed to fetch cart items");
    }

    // Use the price calculation service for accurate pricing
    const { batchCalculateCartItemPrices } = await import("@/lib/services/cart-price-service");

    // Prepare items for batch price calculation
    const itemsForPriceCalculation = (cartItems || []).map((item: any) => ({
      productId: item.product_id,
      basePrice: Number.parseFloat(item.products.base_price.toString()),
      customizations: item.customizations || [],
      quantity: item.quantity,
    }));

    // Calculate prices for all items
    const priceCalculations = await batchCalculateCartItemPrices(itemsForPriceCalculation);

    // Transform cart items with calculated prices
    const items = (cartItems || []).map((item: any, index: number) => {
      const product = item.products;
      const priceCalc = priceCalculations[index];

      // Ensure priceCalc exists with fallback values
      const safePrice = priceCalc || {
        unitPrice: Number.parseFloat(product.base_price.toString()),
        totalPrice: Number.parseFloat(product.base_price.toString()) * item.quantity,
        basePrice: Number.parseFloat(product.base_price.toString()),
        customizationModifier: 0,
        priceBreakdown: [],
      };

      return {
        id: item.id,
        userId: item.user_id,
        sessionId: item.session_id,
        productId: item.product_id,
        quantity: item.quantity,
        customizations: item.customizations || [],
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
        product: {
          id: product.id,
          nameCs: product.name_cs,
          nameEn: product.name_en,
          name: {
            cs: product.name_cs,
            en: product.name_en,
          },
          slug: product.slug,
          basePrice: product.base_price,
          images: product.images || [],
          customizationOptions: product.customization_options || [],
          availability: product.availability || {},
          seoMetadata: { title: { cs: "", en: "" }, description: { cs: "", en: "" } },
          active: true,
          featured: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Product,
        unitPrice: safePrice.unitPrice,
        totalPrice: safePrice.totalPrice,
        priceBreakdown: safePrice.priceBreakdown,
        basePrice: safePrice.basePrice,
        customizationModifier: safePrice.customizationModifier,
      };
    });

    // Calculate cart summary
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
    const total = subtotal; // Add delivery costs, taxes, etc. later

    const cartSummary: CartSummary = {
      items,
      itemCount,
      subtotal,
      total,
    };

    // Cache the cart configuration for future requests
    try {
      const { cacheCartConfiguration } = await import("@/lib/cache/cart-cache");

      await cacheCartConfiguration(session?.user?.id || null, sessionId, {
        items: items as any[], // Type conversion for caching
        totalItems: itemCount,
        totalPrice: total,
        lastUpdated: new Date().toISOString(),
        version: 1,
      });

      console.log("✅ [ServerCart] Cart configuration cached successfully");
    } catch (cacheError) {
      console.error("⚠️ [ServerCart] Cache storage failed (non-critical):", cacheError);
      // Don't fail the request if caching fails
    }

    console.log("✅ [ServerCart] Cart fetched successfully:", {
      itemCount,
      subtotal,
      total,
      itemsWithCustomizations: items.filter((item) => item.customizations.length > 0).length,
    });

    return cartSummary;
  } catch (error) {
    console.error("💥 [ServerCart] Error fetching cart:", error);
    // Return empty cart on error to prevent page crashes
    return {
      items: [],
      itemCount: 0,
      subtotal: 0,
      total: 0,
    };
  }
}

/**
 * Check if cart has items server-side
 * Lightweight check without fetching full cart data
 */
export async function hasCartItems(): Promise<boolean> {
  try {
    const supabase = createServerClient();
    const session = await auth();
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("cart-session")?.value || null;

    if (!(session?.user?.id || sessionId)) {
      return false;
    }

    let query = supabase.from("cart_items").select("id", { count: "exact", head: true });

    if (session?.user?.id) {
      query = query.eq("user_id", session.user.id);
    } else if (sessionId) {
      query = query.eq("session_id", sessionId);
    }

    const { count, error } = await query;

    if (error) {
      console.error("❌ [ServerCart] Error checking cart items:", error);
      return false;
    }

    return (count || 0) > 0;
  } catch (error) {
    console.error("💥 [ServerCart] Error checking cart items:", error);
    return false;
  }
}
