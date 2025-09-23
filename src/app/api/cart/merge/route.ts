import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { createServerClient } from "@/lib/supabase/server";

interface MergeCartRequest {
  sessionId: string;
  userId: string;
}

/**
 * POST /api/cart/merge - Merge guest cart with user cart after login
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const session = await auth();
    const body: MergeCartRequest = await request.json();

    // Verify user is authenticated and matches the userId
    if (!session?.user?.id || session.user.id !== body.userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // Get guest cart items
    const { data: guestItems, error: guestError } = await supabase
      .from("cart_items")
      .select("*")
      .eq("session_id", body.sessionId);

    if (guestError) {
      console.error("Error fetching guest cart items:", guestError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch guest cart",
        },
        { status: 500 }
      );
    }

    if (!guestItems || guestItems.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No guest cart items to merge",
      });
    }

    // Get existing user cart items
    const { data: userItems, error: userError } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", body.userId);

    if (userError) {
      console.error("Error fetching user cart items:", userError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch user cart",
        },
        { status: 500 }
      );
    }

    // Process each guest item
    for (const guestItem of guestItems) {
      // Check if user already has the same product with same customizations
      const existingUserItem = userItems?.find(
        (userItem) =>
          userItem.product_id === guestItem.product_id &&
          JSON.stringify(userItem.customizations) === JSON.stringify(guestItem.customizations)
      );

      if (existingUserItem) {
        // Update existing user item quantity
        const newQuantity = existingUserItem.quantity + guestItem.quantity;

        const { error: updateError } = await supabase
          .from("cart_items")
          .update({
            quantity: newQuantity,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingUserItem.id);

        if (updateError) {
          console.error("Error updating user cart item:", updateError);
        }
      } else {
        // Create new user cart item
        const { error: insertError } = await supabase.from("cart_items").insert({
          user_id: body.userId,
          session_id: null,
          product_id: guestItem.product_id,
          quantity: guestItem.quantity,
          customizations: guestItem.customizations,
        });

        if (insertError) {
          console.error("Error creating user cart item:", insertError);
        }
      }
    }

    // Delete guest cart items
    const { error: deleteError } = await supabase
      .from("cart_items")
      .delete()
      .eq("session_id", body.sessionId);

    if (deleteError) {
      console.error("Error deleting guest cart items:", deleteError);
    }

    return NextResponse.json({
      success: true,
      message: "Cart merged successfully",
    });
  } catch (error) {
    console.error("Cart merge API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
