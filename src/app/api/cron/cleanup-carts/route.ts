/**
 * Cron Job API Endpoint for Cart Cleanup
 * This endpoint is called by a scheduled job (e.g., Vercel Cron) to clean up abandoned carts
 * Requirements: 6.2
 */

import { type NextRequest, NextResponse } from "next/server";
import { cleanupAbandonedCarts } from "@/lib/services/cart-cleanup-service";

/**
 * POST /api/cron/cleanup-carts
 * Triggers the cart cleanup process
 *
 * Authentication:
 * - Requires CRON_SECRET environment variable to match the Authorization header
 * - This prevents unauthorized access to the cleanup endpoint
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Step 1: Verify authentication
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // If CRON_SECRET is configured, verify it
    if (cronSecret) {
      if (!authHeader) {
        console.error("❌ [CronCleanup] Missing authorization header");
        return NextResponse.json(
          { error: "Unauthorized: Missing authorization header" },
          { status: 401 }
        );
      }

      // Support both "Bearer <token>" and direct token formats
      const token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;

      if (token !== cronSecret) {
        console.error("❌ [CronCleanup] Invalid authorization token");
        return NextResponse.json(
          { error: "Unauthorized: Invalid authorization token" },
          { status: 401 }
        );
      }
    } else {
      console.warn("⚠️ [CronCleanup] CRON_SECRET not configured - endpoint is not protected");
    }

    console.log("🚀 [CronCleanup] Starting cart cleanup job");

    // Step 2: Execute cart cleanup
    const result = await cleanupAbandonedCarts();

    // Step 3: Log results
    const duration = Date.now() - startTime;
    console.log("✅ [CronCleanup] Cart cleanup job completed:", {
      cartsDeleted: result.cartsDeleted,
      itemsDeleted: result.itemsDeleted,
      errors: result.errors.length,
      cleanupDuration: `${result.duration}ms`,
      totalDuration: `${duration}ms`,
    });

    // Step 4: Return results
    return NextResponse.json(
      {
        success: true,
        cartsDeleted: result.cartsDeleted,
        itemsDeleted: result.itemsDeleted,
        errors: result.errors,
        duration: result.duration,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);

    console.error("💥 [CronCleanup] Cart cleanup job failed:", {
      error: errorMessage,
      duration: `${duration}ms`,
    });

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        duration,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cron/cleanup-carts
 * Health check endpoint to verify the cron job is accessible
 */
export async function GET(request: NextRequest) {
  // Verify authentication for GET as well
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret) {
    if (!authHeader) {
      return NextResponse.json(
        { error: "Unauthorized: Missing authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;

    if (token !== cronSecret) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid authorization token" },
        { status: 401 }
      );
    }
  }

  return NextResponse.json(
    {
      status: "healthy",
      endpoint: "/api/cron/cleanup-carts",
      method: "POST",
      description: "Cart cleanup cron job endpoint",
      authentication: cronSecret ? "enabled" : "disabled",
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
