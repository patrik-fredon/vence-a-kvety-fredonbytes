import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { createServerClient } from "@/lib/supabase/server";
import type { UpdateCartItemRequest } from "@/types/cart";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PUT /api/cart/items/[id] - Update cart item quantity
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = createServerClient();
    const session = await auth();
    const body: UpdateCartItemRequest = await request.json();

    console.log(`🛒 [CartUpdate] PUT /api/cart/items/${id} - Update cart item request`);

    // Validate request body
    if (!body.quantity || body.quantity <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid quantity",
        },
        { status: 400 }
      );
    }

    // Get session ID for guest users
    const sessionId = request.cookies.get("cart-session")?.value;

    if (!(session?.user?.id || sessionId)) {
      return NextResponse.json(
        {
          success: false,
          error: "No valid session",
        },
        { status: 401 }
      );
    }

    // Verify ownership of cart item and get product info for price recalculation
    let query = supabase.from("cart_items").select(`
      *,
      products (
        id,
        base_price,
        customization_options
      )
    `).eq("id", id);

    if (session?.user?.id) {
      query = query.eq("user_id", session.user.id);
    } else if (sessionId) {
      query = query.eq("session_id", sessionId);
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "No valid session",
        },
        { status: 401 }
      );
    }

    const { data: existingItem, error: fetchError } = await query.single();

    if (fetchError || !existingItem) {
      return NextResponse.json(
        {
          success: false,
          error: "Cart item not found",
        },
        { status: 404 }
      );
    }

    // Recalculate price for the new quantity using the price service
    let unitPrice = existingItem.unit_price;
    let totalPrice = unitPrice * body.quantity;

    try {
      const { calculateCartItemPrice } = await import('@/lib/services/cart-price-service');

      const basePrice = Number.parseFloat(existingItem.products.base_price.toString());
      const priceCalculation = await calculateCartItemPrice(
        existingItem.product_id,
        basePrice,
        existingItem.customizations || [],
        body.quantity
      );

      unitPrice = priceCalculation.unitPrice;
      totalPrice = priceCalculation.totalPrice;

      console.log(`💰 [CartUpdate] Recalculated price for quantity ${body.quantity}:`, {
        unitPrice,
        totalPrice,
        fromCache: priceCalculation.fromCache
      });
    } catch (priceError) {
      console.error("⚠️ [CartUpdate] Price recalculation failed, using existing unit price:", priceError);
      // Fallback to simple calculation with existing unit price
      totalPrice = unitPrice * body.quantity;
    }

    // Update the cart item with recalculated prices
    const { data, error } = await supabase
      .from("cart_items")
      .update({
        quantity: body.quantity,
        unit_price: unitPrice,
        total_price: totalPrice,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("❌ [CartUpdate] Error updating cart item:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to update cart item",
        },
        { status: 500 }
      );
    }

    // Update cart cache after successful update
    try {
      const { updateCachedCartAfterItemChange } = await import('@/lib/cache/cart-cache');

      await updateCachedCartAfterItemChange(
        session?.user?.id || null,
        sessionId,
        'update',
        id
      );

      console.log(`🗄️ [CartUpdate] Cart cache updated after updating item ${id}`);
    } catch (cacheError) {
      console.error("⚠️ [CartUpdate] Cache update failed (non-critical):", cacheError);
      // Don't fail the request if cache update fails
    }

    console.log(`✅ [CartUpdate] Successfully updated cart item ${id}:`, {
      quantity: data.quantity,
      unitPrice: data.unit_price,
      totalPrice: data.total_price
    });

    return NextResponse.json({
      success: true,
      item: {
        id: data.id,
        userId: data.user_id,
        sessionId: data.session_id,
        productId: data.product_id,
        quantity: data.quantity,
        unitPrice: data.unit_price,
        totalPrice: data.total_price,
        customizations: data.customizations,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      },
    });
  } catch (error) {
    console.error("💥 [CartUpdate] Update cart item API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cart/items/[id] - Remove item from cart
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = createServerClient();
    const session = await auth();

    // Get session ID for guest users
    const sessionId = request.cookies.get("cart-session")?.value;

    if (!(session?.user?.id || sessionId)) {
      return NextResponse.json(
        {
          success: false,
          error: "No valid session",
        },
        { status: 401 }
      );
    }

    // Verify ownership of cart item and get customization data
    let query = supabase.from("cart_items").select("*").eq("id", id);

    if (session?.user?.id) {
      query = query.eq("user_id", session.user.id);
    } else if (sessionId) {
      query = query.eq("session_id", sessionId);
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "No valid session",
        },
        { status: 401 }
      );
    }

    const { data: existingItem, error: fetchError } = await query.single();

    if (fetchError || !existingItem) {
      return NextResponse.json(
        {
          success: false,
          error: "Cart item not found",
        },
        { status: 404 }
      );
    }

    // Log customization cleanup for audit trail
    if (existingItem.customizations && Array.isArray(existingItem.customizations) && existingItem.customizations.length > 0) {
      console.log(`🧹 [CartDelete] Cleaning up customizations for cart item ${id}:`, {
        itemId: id,
        productId: existingItem.product_id,
        customizationCount: existingItem.customizations.length,
        customizations: existingItem.customizations,
        userId: session?.user?.id || null,
        sessionId: sessionId || null,
        timestamp: new Date().toISOString(),
      });
    }

    // Delete the cart item (customizations are automatically deleted as part of the row)
    const { error } = await supabase.from("cart_items").delete().eq("id", id);

    if (error) {
      console.error("❌ [CartDelete] Error deleting cart item:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to remove cart item",
        },
        { status: 500 }
      );
    }

    // Update cart cache after successful deletion
    try {
      const { updateCachedCartAfterItemChange } = await import('@/lib/cache/cart-cache');

      await updateCachedCartAfterItemChange(
        session?.user?.id || null,
        sessionId,
        'remove',
        id
      );

      console.log(`🗄️ [CartDelete] Cart cache updated after removing item ${id}`);
    } catch (cacheError) {
      console.error("⚠️ [CartDelete] Cache update failed (non-critical):", cacheError);
      // Don't fail the request if cache update fails
    }

    // Check if cart is now empty and clear all cache if so
    try {
      let emptyCheckQuery = supabase.from("cart_items").select("id", { count: 'exact' });

      if (session?.user?.id) {
        emptyCheckQuery = emptyCheckQuery.eq("user_id", session.user.id);
      } else if (sessionId) {
        emptyCheckQuery = emptyCheckQuery.eq("session_id", sessionId);
      }

      const { count } = await emptyCheckQuery;

      if (count === 0) {
        console.log(`🧹 [CartDelete] Cart is now empty, clearing all cache`);

        const { clearCartCache } = await import('@/lib/cache/cart-cache');
        await clearCartCache(session?.user?.id || null, sessionId);

        console.log(`✅ [CartDelete] All cart cache cleared - cart is empty`);
      }
    } catch (emptyCheckError) {
      console.error("⚠️ [CartDelete] Error checking if cart is empty (non-critical):", emptyCheckError);
      // Don't fail the request if empty check fails
    }

    // Log successful cleanup
    console.log(`✅ [CartDelete] Successfully removed cart item ${id} with customizations and cache cleanup`);

    return NextResponse.json({
      success: true,
      message: "Cart item and associated customizations removed successfully",
    });
  } catch (error) {
    console.error("💥 [CartDelete] Delete cart item API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
