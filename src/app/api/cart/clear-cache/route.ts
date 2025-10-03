import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { forceClearCartCache } from "@/lib/cache/cart-cache";

/**
 * POST /api/cart/clear-cache - Clear Redis cache for user's cart
 * This endpoint is specifically for clearing cache without deleting cart items
 * Used when cart becomes empty after last item removal
 * Requirements: 6.5
 */
export async function POST(request: NextRequest) {
  try {
    console.log("🗑️ [API] POST /api/cart/clear-cache - Clearing cart cache");

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

    // Clear all cart-related cache (config + price calculations)
    try {
      await forceClearCartCache(session?.user?.id || null, sessionId);

      console.log(
        `✅ [API] Cart cache cleared successfully for ${
          session?.user?.id ? `user:${session.user.id}` : `session:${sessionId}`
        }`
      );

      return NextResponse.json({
        success: true,
        message: "Cart cache cleared successfully",
      });
    } catch (cacheError) {
      console.error("❌ [API] Cache clearing failed:", cacheError);

      return NextResponse.json(
        {
          success: false,
          error: "Failed to clear cart cache",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("💥 [API] Cart clear-cache API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
