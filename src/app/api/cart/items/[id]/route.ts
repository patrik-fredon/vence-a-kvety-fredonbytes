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

    // Verify ownership of cart item
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

    // Update the cart item
    const { data, error } = await supabase
      .from("cart_items")
      .update({
        quantity: body.quantity,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating cart item:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to update cart item",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      item: {
        id: data.id,
        userId: data.user_id,
        sessionId: data.session_id,
        productId: data.product_id,
        quantity: data.quantity,
        customizations: data.customizations,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      },
    });
  } catch (error) {
    console.error("Update cart item API error:", error);
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

    // Verify ownership of cart item
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

    // Delete the cart item
    const { error } = await supabase.from("cart_items").delete().eq("id", id);

    if (error) {
      console.error("Error deleting cart item:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to remove cart item",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Delete cart item API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
