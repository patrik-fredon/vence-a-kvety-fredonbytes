/**
 * Checkout session creation API endpoint
 * Creates a Stripe embedded checkout session for the cart
 */

import { type NextRequest, NextResponse } from "next/server";
import { validateCSRFMiddleware } from "@/lib/security/csrf";
import { getServerCart } from "@/lib/services/cart-server-service";
import { createEmbeddedCheckoutSession } from "@/lib/stripe/embedded-checkout";
import { rateLimit } from "@/lib/utils/rate-limit";

export const runtime = "nodejs";

interface CreateSessionRequest {
  locale: "cs" | "en";
  metadata?: Record<string, string>;
}

/**
 * POST /api/checkout/create-session
 * Create a new checkout session for the current cart
 */
export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting (Requirement 5.7)
    const rateLimitResult = await rateLimit(request, "checkout-session");

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many requests. Please try again later.",
          retryAfter: rateLimitResult.reset.toISOString(),
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(
              (rateLimitResult.reset.getTime() - Date.now()) / 1000
            ).toString(),
          },
        }
      );
    }

    // Validate CSRF token (Requirement 5.8)
    const isValidCSRF = await validateCSRFMiddleware(request);

    if (!isValidCSRF) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid or missing CSRF token",
        },
        { status: 403 }
      );
    }

    // Parse request body
    const body = (await request.json()) as CreateSessionRequest;
    const { locale, metadata } = body;

    // Validate locale
    if (!(locale && ["cs", "en"].includes(locale))) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid locale. Must be 'cs' or 'en'",
        },
        { status: 400 }
      );
    }

    // Get cart from server (Requirement 3.1)
    const cart = await getServerCart();

    // Validate cart is not empty (Requirement 3.1)
    if (!cart.items || cart.items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Cart is empty",
        },
        { status: 400 }
      );
    }

    // Validate delivery method is selected (Requirement 3.2)
    const hasDeliveryMethod = cart.items.some((item) =>
      item.customizations?.some((c) => c.optionId === "delivery_method")
    );

    if (!hasDeliveryMethod) {
      return NextResponse.json(
        {
          success: false,
          error: "Delivery method is required",
        },
        { status: 400 }
      );
    }

    // Create checkout session (Requirement 3.1, 3.2)
    const session = await createEmbeddedCheckoutSession({
      cartItems: cart.items,
      locale,
      metadata: {
        ...metadata,
        itemCount: cart.items.length.toString(),
      },
    });

    // Return client secret to client (Requirement 3.1)
    return NextResponse.json({
      success: true,
      clientSecret: session.clientSecret,
      sessionId: session.sessionId,
    });
  } catch (error) {
    console.error("❌ Error creating checkout session:", error);

    // Return user-friendly error message
    const errorMessage =
      error instanceof Error ? error.message : "Failed to create checkout session";

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
