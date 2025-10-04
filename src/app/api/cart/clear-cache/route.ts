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

    const userId = session?.user?.id || null;
    const identifier = userId ? `user:${userId}` : `session:${sessionId}`;

    // Clear all cart-related cache (config + price calculations)
    try {
      console.log(`🧹 [API] Clearing cart cache for ${identifier}`);

      await forceClearCartCache(userId, sessionId);

      console.log(`✅ [API] Cart cache cleared successfully for ${identifier}`);

      // Verify cache state after clearing
      const { debugCacheState } = await import("@/lib/cache/cart-cache");
      const cacheState = await debugCacheState(userId, sessionId);

      // Log verification results
      if (cacheState.configExists || cacheState.priceKeysExist) {
        console.warn(
          `⚠️ [API] Cache verification warning: Some cache entries still exist after clearing`,
          {
            configExists: cacheState.configExists,
            priceKeysExist: cacheState.priceKeysExist,
            identifier,
          }
        );
      } else {
        console.log(
          `✅ [API] Cache verification passed: All cache entries cleared for ${identifier}`
        );
      }

      return NextResponse.json({
        success: true,
        message: "Cart cache cleared successfully",
        cacheState: {
          configExists: cacheState.configExists,
          priceKeysExist: cacheState.priceKeysExist,
          identifier: cacheState.identifier,
          verified: !(cacheState.configExists || cacheState.priceKeysExist),
        },
      });
    } catch (cacheError) {
      console.error("❌ [API] Cache clearing failed:", cacheError);

      return NextResponse.json(
        {
          success: false,
          error: "Failed to clear cart cache",
          details: cacheError instanceof Error ? cacheError.message : "Unknown error",
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
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
