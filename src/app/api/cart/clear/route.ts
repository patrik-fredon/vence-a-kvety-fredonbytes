import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { clearCartCache } from "@/lib/cache/cart-cache";
import { createServerClient } from "@/lib/supabase/server";

/**
 * POST /api/cart/clear - Clear all items from user's cart
 * Requirements: 5.3, 5.4
 */
export async function POST(request: NextRequest) {
  try {
    console.log("🗑️ [API] POST /api/cart/clear - Clearing cart");

    const supabase = createServerClient();
    const session = await auth();

    // Get session ID from cookies if user is not authenticated
    const sessionId = request.cookies.get("cart-session")?.value || null;

    if (!(session?.user?.id || sessionId)) {
      return NextResponse.json(
        {
          success: false,
          error: "No cart session found",
        },
        { status: 400 }
      );
    }

    // Build delete query based on authentication status
    let query = supabase.from("cart_items").delete();

    if (session?.user?.id) {
      query = query.eq("user_id", session.user.id);
    } else if (sessionId) {
      query = query.eq("session_id", sessionId);
    }

    // Execute delete operation
    const { error } = await query;

    if (error) {
      console.error("❌ [API] Error clearing cart from database:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to clear cart",
        },
        { status: 500 }
      );
    }

    // Clear Redis cache
    try {
      await clearCartCache(session?.user?.id || null, sessionId);
      console.log("✅ [API] Redis cache cleared successfully");
    } catch (cacheError) {
      console.error("⚠️ [API] Cache clearing failed (non-critical):", cacheError);
      // Don't fail the request if cache clearing fails
    }

    console.log("✅ [API] Cart cleared successfully");

    return NextResponse.json({
      success: true,
      message: "Cart cleared successfully",
    });
  } catch (error) {
    console.error("💥 [API] Cart clear API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
