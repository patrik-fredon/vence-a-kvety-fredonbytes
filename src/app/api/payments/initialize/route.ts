/**
 * API route for initializing Stripe payments
 */

import { type NextRequest, NextResponse } from "next/server";
import { type PaymentRequest, PaymentService } from "@/lib/payments";
import { validateCSRFMiddleware } from "@/lib/security/csrf";
import type { PaymentMethod } from "@/types/order";

export async function POST(request: NextRequest) {
  try {
    // Validate CSRF token
    const isValidCSRF = await validateCSRFMiddleware(request);
    if (!isValidCSRF) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid or missing CSRF token. Please refresh the page and try again.",
        },
        { status: 403 }
      );
    }

    // Apply rate limiting for payment initialization
    const { rateLimit } = await import("@/lib/utils/rate-limit");
    const rateLimitResult = await rateLimit(request, "payment-initialization");

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many payment initialization attempts. Please try again later.",
          retryAfter: rateLimitResult.reset,
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.round(
              (rateLimitResult.reset.getTime() - Date.now()) / 1000
            ).toString(),
            "X-RateLimit-Limit": rateLimitResult.limit.toString(),
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": rateLimitResult.reset.toISOString(),
          },
        }
      );
    }

    const body = await request.json();

    const {
      orderId,
      amount,
      currency = "czk",
      customerEmail,
      customerName,
      paymentMethod,
      locale = "cs",
    } = body;

    // Validate required fields
    if (!(orderId && amount && customerEmail && customerName && paymentMethod)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: orderId, amount, customerEmail, customerName, paymentMethod",
        },
        { status: 400 }
      );
    }

    // Validate payment method
    if (paymentMethod !== "stripe") {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid payment method. Must be "stripe"',
        },
        { status: 400 }
      );
    }

    // Validate amount
    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Amount must be a positive number",
        },
        { status: 400 }
      );
    }

    // Get base URL for return/webhook URLs
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || `${request.nextUrl.protocol}//${request.nextUrl.host}`;

    // Prepare payment request
    const paymentRequest: PaymentRequest = {
      orderId,
      amount,
      currency: currency.toLowerCase(),
      customerEmail,
      customerName,
      paymentMethod: paymentMethod as PaymentMethod,
      returnUrl: `${baseUrl}/${locale}/checkout/success?orderId=${orderId}`,
      cancelUrl: `${baseUrl}/${locale}/checkout/cancel?orderId=${orderId}`,
      webhookUrl: `${baseUrl}/api/payments/webhook/${paymentMethod}`,
      description: `Objednávka pohřebních věnců #${orderId}`,
      locale: locale as "cs" | "en",
    };

    // Initialize payment
    const result = await PaymentService.initializePayment(paymentRequest);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Payment initialization failed",
        },
        { status: 500 }
      );
    }

    // Return success response
    return NextResponse.json({
      success: true,
      data: {
        paymentId: result.paymentId,
        clientSecret: result.clientSecret,
        paymentMethod,
      },
    });
  } catch (error) {
    console.error("Error in payment initialization:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error during payment initialization",
      },
      { status: 500 }
    );
  }
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
