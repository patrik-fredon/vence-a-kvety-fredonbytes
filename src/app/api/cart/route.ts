import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { createServerClient } from "@/lib/supabase/server";
import { type CartSummary } from "@/types/cart";
import type { Product } from "@/types/product";

/**
 * GET /api/cart - Retrieve user's cart items
 */
export async function GET(request: NextRequest) {
  try {
    console.log("🛒 [API] GET /api/cart - Fetching cart items");

    const supabase = createServerClient();
    const session = await auth();

    // Get session ID from cookies if user is not authenticated
    const sessionId = request.cookies.get("cart-session")?.value;

    if (!(session?.user?.id || sessionId)) {
      return NextResponse.json({
        success: true,
        cart: {
          items: [],
          itemCount: 0,
          subtotal: 0,
          total: 0,
        },
      });
    }

    // Try to get cached cart configuration first
    try {
      const { getCachedCartConfiguration } = await import('@/lib/cache/cart-cache');
      const cachedCart = await getCachedCartConfiguration(session?.user?.id || null, sessionId);

      if (cachedCart) {
        // Validate cache age - if older than 5 minutes, fetch fresh data
        const cacheAge = Date.now() - new Date(cachedCart.lastUpdated).getTime();
        const maxCacheAge = 5 * 60 * 1000; // 5 minutes in milliseconds

        if (cacheAge < maxCacheAge) {
          console.log(`✅ [API] Returning cached cart configuration (age: ${Math.floor(cacheAge / 1000)}s)`);
          return NextResponse.json({
            success: true,
            cart: {
              items: cachedCart.items,
              itemCount: cachedCart.totalItems,
              subtotal: cachedCart.totalPrice,
              total: cachedCart.totalPrice,
            },
            fromCache: true,
            cacheAge: Math.floor(cacheAge / 1000)
          });
        } else {
          console.log(`⏰ [API] Cache is stale (age: ${Math.floor(cacheAge / 1000)}s), fetching fresh data`);
          // Clear stale cache and fetch fresh data
          const { invalidateCartCache } = await import('@/lib/cache/cart-cache');
          await invalidateCartCache(session?.user?.id || null, sessionId);
        }
      }
    } catch (cacheError) {
      console.error("⚠️ [API] Cache retrieval failed (non-critical):", cacheError);
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
      console.error("Error fetching cart items:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch cart items",
        },
        { status: 500 }
      );
    }

    // Use the new price calculation service for accurate pricing
    const { batchCalculateCartItemPrices } = await import('@/lib/services/cart-price-service');

    // Prepare items for batch price calculation
    const itemsForPriceCalculation = (cartItems || []).map((item: any) => ({
      productId: item.product_id,
      basePrice: Number.parseFloat(item.products.base_price.toString()),
      customizations: item.customizations || [],
      quantity: item.quantity
    }));

    // Calculate prices for all items
    const priceCalculations = await batchCalculateCartItemPrices(itemsForPriceCalculation);

    // Transform cart items with calculated prices
    const items = (cartItems || []).map((item: any, index: number) => {
      const product = item.products;
      const priceCalc = priceCalculations[index];

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
        unitPrice: priceCalc.unitPrice,
        totalPrice: priceCalc.totalPrice,
        priceBreakdown: priceCalc.priceBreakdown,
        basePrice: priceCalc.basePrice,
        customizationModifier: priceCalc.customizationModifier,
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
      const { cacheCartConfiguration } = await import('@/lib/cache/cart-cache');

      await cacheCartConfiguration(session?.user?.id || null, sessionId, {
        items: items as any[], // Type conversion for caching
        totalItems: itemCount,
        totalPrice: total,
        lastUpdated: new Date().toISOString(),
        version: 1
      });

      console.log("🗄️ [API] Cart configuration cached successfully");
    } catch (cacheError) {
      console.error("⚠️ [API] Cache storage failed (non-critical):", cacheError);
      // Don't fail the request if caching fails
    }

    console.log("✅ [API] Cart fetched successfully:", {
      itemCount,
      subtotal,
      total,
      itemsWithCustomizations: items.filter(item => item.customizations.length > 0).length
    });

    return NextResponse.json({
      success: true,
      cart: cartSummary,
      fromCache: false
    });
  } catch (error) {
    console.error("💥 [API] Cart API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
