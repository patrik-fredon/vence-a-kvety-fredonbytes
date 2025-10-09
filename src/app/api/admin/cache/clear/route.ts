/**
 * Admin API endpoint for cache clearing
 * Allows administrators to manually clear caches
 */

import { type NextRequest, NextResponse } from "next/server";
import {
  getCacheStatistics,
  invalidateAllCaches,
  invalidateAllProductCaches,
  invalidateCacheByEvent,
} from "@/lib/cache/cache-invalidation";
import type { ApiResponse } from "@/types";

/**
 * POST /api/admin/cache/clear
 * Clear specific or all caches
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    // const session = await getServerSession();
    // if (!session || !session.user.isAdmin) {
    //   return NextResponse.json(
    //     { success: false, error: { code: "UNAUTHORIZED", message: "Admin access required" } },
    //     { status: 401 }
    //   );
    // }

    const body = await request.json().catch(() => ({}));
    const { scope, productId, categorySlug, orderId } = body;

    console.log(`🗑️ [API] Cache clear requested: ${scope || "all"}`);

    const startTime = Date.now();

    // Clear caches based on scope
    switch (scope) {
      case "products":
        await invalidateAllProductCaches();
        break;

      case "product":
        if (productId) {
          await invalidateCacheByEvent("product.updated", { productId });
        } else {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: "MISSING_PARAMETER",
                message: "productId is required for product scope",
              },
            } as ApiResponse,
            { status: 400 }
          );
        }
        break;

      case "category":
        await invalidateCacheByEvent("category.updated", { categorySlug });
        break;

      case "order":
        if (orderId) {
          await invalidateCacheByEvent("order.completed", { orderId });
        } else {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: "MISSING_PARAMETER",
                message: "orderId is required for order scope",
              },
            } as ApiResponse,
            { status: 400 }
          );
        }
        break;
      default:
        await invalidateAllCaches();
        break;
    }

    const duration = Date.now() - startTime;

    const response: ApiResponse = {
      success: true,
      data: {
        message: "Cache cleared successfully",
        scope: scope || "all",
        duration: `${duration}ms`,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("❌ [API] Error clearing cache:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "CACHE_CLEAR_ERROR",
          message: "Failed to clear cache",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      } as ApiResponse,
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/cache/clear
 * Get cache statistics
 */
export async function GET() {
  try {
    // TODO: Add admin authentication check

    const stats = await getCacheStatistics();

    const response: ApiResponse = {
      success: true,
      data: stats,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("❌ [API] Error getting cache statistics:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "CACHE_STATS_ERROR",
          message: "Failed to get cache statistics",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      } as ApiResponse,
      { status: 500 }
    );
  }
}
