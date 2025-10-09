/**
 * Checkout completion API endpoint
 * Handles post-payment completion logic
 */

import { NextRequest, NextResponse } from "next/server";
import { handleCheckoutComplete } from "@/lib/services/checkout-completion-service";

export const runtime = "edge";

interface CompleteCheckoutRequest {
  sessionId: string;
  orderId: string;
}

/**
 * POST /api/checkout/complete
 * Handle checkout completion after successful payment
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CompleteCheckoutRequest;
    const { sessionId, orderId } = body;

    // Validate required fields
    if (!sessionId || !orderId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: sessionId and orderId",
        },
        { status: 400 }
      );
    }

    // Handle checkout completion
    const result = await handleCheckoutComplete(sessionId, orderId);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to complete checkout",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Checkout completed successfully",
    });
  } catch (error) {
    console.error("Error in checkout completion endpoint:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
