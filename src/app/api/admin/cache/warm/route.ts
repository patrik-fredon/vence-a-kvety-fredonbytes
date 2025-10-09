/**
 * Admin API endpoint for cache warming
 * Allows administrators to manually trigger cache warming
 */

import { type NextRequest, NextResponse } from "next/server";
import { warmAllCaches, warmPopularCategories } from "@/lib/cache/cache-warming";
import { warmPopularProductsStripeIds } from "@/lib/stripe/embedded-checkout";
import type { ApiResponse } from "@/types";

/**
 * POST /api/admin/cache/warm
 * Trigger cache warming for all critical data
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
    const { categoryIds, includeStripeIds = true } = body;

    console.log("🔥 [API] Cache warming requested");

    const startTime = Date.now();

    // Warm all caches or specific categories
    const warmingTasks = [];

    if (categoryIds && Array.isArray(categoryIds) && categoryIds.length > 0) {
      warmingTasks.push(warmPopularCategories(categoryIds));
    } else {
      warmingTasks.push(warmAllCaches());
    }

    // Optionally warm Stripe IDs cache
    if (includeStripeIds) {
      warmingTasks.push(warmPopularProductsStripeIds());
    }

    await Promise.all(warmingTasks);

    const duration = Date.now() - startTime;

    const response: ApiResponse = {
      success: true,
      data: {
        message: "Cache warming completed successfully",
        duration: `${duration}ms`,
        warmedCategories: categoryIds?.length || "all",
        stripeIdsWarmed: includeStripeIds,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("❌ [API] Error warming cache:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "CACHE_WARMING_ERROR",
          message: "Failed to warm cache",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      } as ApiResponse,
      { status: 500 }
    );
  }
}
