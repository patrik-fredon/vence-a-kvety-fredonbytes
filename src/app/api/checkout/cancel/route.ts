/**
 * Checkout cancellation API endpoint
 * Handles payment cancellation logic
 */

import { type NextRequest, NextResponse } from "next/server";
import { handleCheckoutCancel } from "@/lib/services/checkout-completion-service";

export const runtime = "edge";

interface CancelCheckoutRequest {
  sessionId: string;
  orderId?: string;
}

/**
 * POST /api/checkout/cancel
 * Handle checkout cancellation when user cancels payment
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CancelCheckoutRequest;
    const { sessionId, orderId } = body;

    // Validate required fields
    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required field: sessionId",
        },
        { status: 400 }
      );
    }

    // Handle checkout cancellation
    const result = await handleCheckoutCancel(sessionId, orderId);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to cancel checkout",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Checkout cancelled successfully",
    });
  } catch (error) {
    console.error("Error in checkout cancellation endpoint:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
