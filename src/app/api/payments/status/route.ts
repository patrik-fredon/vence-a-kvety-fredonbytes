/**
 * API route for checking payment status
 */

import { type NextRequest, NextResponse } from "next/server";
import { PaymentService } from "@/lib/payments";
import type { PaymentMethod } from "@/types/order";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get("paymentId");
    const paymentMethod = searchParams.get("paymentMethod") as PaymentMethod;

    // Validate required parameters
    if (!paymentId || !paymentMethod) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required parameters: paymentId and paymentMethod",
        },
        { status: 400 }
      );
    }

    // Validate payment method
    if (!["stripe", "gopay"].includes(paymentMethod)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid payment method. Must be "stripe" or "gopay"',
        },
        { status: 400 }
      );
    }

    // Get payment status
    const result = await PaymentService.getPaymentStatus(paymentId, paymentMethod);

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          error: "Payment not found or status could not be retrieved",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        orderId: result.orderId,
        transactionId: result.transactionId,
        amount: result.amount,
        currency: result.currency,
        status: result.status,
        paymentMethod: result.paymentMethod,
        error: result.error,
      },
    });
  } catch (error) {
    console.error("Error checking payment status:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error while checking payment status",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentId, paymentMethod } = body;

    // Validate required fields
    if (!paymentId || !paymentMethod) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: paymentId and paymentMethod",
        },
        { status: 400 }
      );
    }

    // Validate payment method
    if (!["stripe", "gopay"].includes(paymentMethod)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid payment method. Must be "stripe" or "gopay"',
        },
        { status: 400 }
      );
    }

    // Get payment status
    const result = await PaymentService.getPaymentStatus(paymentId, paymentMethod as PaymentMethod);

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          error: "Payment not found or status could not be retrieved",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        orderId: result.orderId,
        transactionId: result.transactionId,
        amount: result.amount,
        currency: result.currency,
        status: result.status,
        paymentMethod: result.paymentMethod,
        error: result.error,
      },
    });
  } catch (error) {
    console.error("Error checking payment status:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error while checking payment status",
      },
      { status: 500 }
    );
  }
}

// Handle preflight requests for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
