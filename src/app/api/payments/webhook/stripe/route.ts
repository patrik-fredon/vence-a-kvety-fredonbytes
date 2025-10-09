/**
 * Stripe webhook handler for payment status updates
 */

import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getRequiredEnvVar } from "@/lib/config/env-validation";
import { createOrder } from "@/lib/services/order-service";
// import { PaymentService } from "@/lib/payments";
import { createServerClient } from "@/lib/supabase/server";
import { getPickupLocation } from "@/lib/utils/delivery-method-utils";

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting for webhook endpoint
    const { rateLimit } = await import("@/lib/utils/rate-limit");
    const rateLimitResult = await rateLimit(request, "payment-webhook");

    if (!rateLimitResult.success) {
      console.warn("[Webhook] Rate limit exceeded");
      return NextResponse.json(
        {
          error: "Too many webhook requests. Please try again later.",
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

    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      console.error("[Webhook] Missing Stripe signature header");
      return NextResponse.json({ error: "Missing signature header" }, { status: 400 });
    }

    let webhookSecret: string;
    try {
      webhookSecret = getRequiredEnvVar("STRIPE_WEBHOOK_SECRET");
    } catch (error) {
      console.error("[Webhook] Stripe webhook secret not configured:", error);
      return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      const stripe = (await import("@/lib/payments/stripe")).stripe;
      if (!stripe) {
        throw new Error("Stripe not configured");
      }
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (error) {
      console.error("[Webhook] Signature verification failed:", error);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Check for duplicate events (idempotency)
    const isDuplicate = await checkDuplicateEvent(event.id);
    if (isDuplicate) {
      console.log(`[Webhook] Duplicate event ${event.id}, skipping`);
      return NextResponse.json({ received: true, duplicate: true });
    }

    // Log event for debugging
    console.log(`[Webhook] Processing event ${event.type}:`, event.id);

    // Handle different event types
    let result: { orderId?: string; status?: string; sessionId?: string } | null = null;

    switch (event.type) {
      case "checkout.session.completed":
        result = await handleCheckoutSessionCompleted(event.data.object);
        break;

      case "payment_intent.succeeded":
        result = await handlePaymentSuccess(event.data.object);
        break;

      case "payment_intent.payment_failed":
        result = await handlePaymentFailure(event.data.object);
        break;

      case "payment_intent.requires_action":
        result = await handleRequiresAction(event.data.object);
        break;

      case "payment_intent.canceled":
        result = await handlePaymentCanceled(event.data.object);
        break;

      case "payment_intent.processing":
        result = await handlePaymentProcessing(event.data.object);
        break;

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    // Mark event as processed
    await markEventProcessed(event.id, event.type);

    return NextResponse.json({
      received: true,
      eventId: event.id,
      eventType: event.type,
      orderId: result?.orderId,
    });
  } catch (error) {
    console.error("[Webhook] Error processing Stripe webhook:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

/**
 * Update order payment status in database
 */
async function updateOrderPaymentStatus(
  orderId: string,
  paymentResult: {
    status: string;
    paymentMethod: string;
    amount: number;
    currency: string;
    transactionId: string;
    error?: string;
  }
) {
  try {
    const supabase = createServerClient();

    const paymentInfo = {
      method: paymentResult.paymentMethod,
      amount: paymentResult.amount,
      currency: paymentResult.currency,
      status: paymentResult.status,
      transactionId: paymentResult.transactionId,
      processedAt: paymentResult.status === "completed" ? new Date().toISOString() : null,
      failureReason: paymentResult.error || null,
    };

    // Update order with payment information
    const { error } = await supabase
      .from("orders")
      .update({
        payment_info: paymentInfo,
        status:
          paymentResult.status === "completed"
            ? "confirmed"
            : paymentResult.status === "failed"
              ? "cancelled"
              : "pending",
        confirmed_at: paymentResult.status === "completed" ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (error) {
      console.error("Error updating order payment status:", error);
      throw error;
    }

    console.log(`Order ${orderId} payment status updated to ${paymentResult.status}`);
  } catch (error) {
    console.error("Error updating order in database:", error);
    throw error;
  }
}

/**
 * Send order confirmation email
 */
async function sendOrderConfirmationEmail(orderId: string) {
  try {
    // This would integrate with your email service (e.g., SendGrid, Resend, etc.)
    // For now, we'll just log it
    console.log(`Sending confirmation email for order ${orderId}`);

    // TODO: Implement email sending
    // - Fetch order details from database
    // - Generate email template with order information
    // - Send email to customer
    // - Optionally send SMS notification
  } catch (error) {
    console.error("Error sending confirmation email:", error);
    // Don't throw error here as payment was successful
  }
}

/**
 * Handle successful payment
 */
/**
 * Handle checkout session completed
 * Creates an order when Stripe checkout session is completed
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log(`[Webhook] Checkout session completed: ${session.id}`);

  try {
    // Extract metadata from session
    const metadata = session.metadata || {};

    // Retrieve line items from the session
    const stripe = (await import("@/lib/payments/stripe")).stripe;
    if (!stripe) {
      throw new Error("Stripe not configured");
    }

    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      expand: ["data.price.product"],
    });

    // Build order items from line items
    // Note: We're using Stripe line items directly for order creation
    const orderItems = [];

    for (const item of lineItems.data) {
      if (item.price && typeof item.price === "object") {
        const product = item.price.product;
        const productMetadata =
          product && typeof product === "object" && !("deleted" in product) ? product.metadata : {};
        const productId = productMetadata?.["productId"];

        if (productId) {
          orderItems.push({
            productId,
            quantity: item.quantity || 1,
            price: (item.amount_total || 0) / 100,
            customizations: [], // Stored in metadata if needed
          });
        }
      }
    }

    // Extract delivery method from metadata (Requirement 9.1, 9.2)
    const deliveryMethod = metadata["deliveryMethod"] as "delivery" | "pickup" | undefined;
    const pickupLocation = deliveryMethod === "pickup" ? getPickupLocation() : undefined;

    // Get customer info from session
    const customerDetails = session.customer_details || {};
    const customerEmail = (customerDetails as { email?: string | null }).email || "";
    const customerName = (customerDetails as { name?: string | null }).name || "";
    const customerPhone = (customerDetails as { phone?: string | null }).phone || "";

    // Get address from session
    const address =
      (
        customerDetails as {
          address?: {
            line1?: string | null;
            city?: string | null;
            postal_code?: string | null;
            country?: string | null;
          } | null;
        }
      ).address || {};
    const deliveryAddress =
      deliveryMethod === "delivery"
        ? {
            street: address.line1 || "",
            city: address.city || "",
            postalCode: address.postal_code || "",
            country: address.country || "CZ",
          }
        : undefined;

    // Calculate totals
    const subtotal = session.amount_subtotal ? session.amount_subtotal / 100 : 0;
    const totalAmount = session.amount_total ? session.amount_total / 100 : 0;
    const deliveryCost = deliveryMethod === "delivery" ? 0 : 0; // Free delivery

    // Create order data
    const orderData = {
      order_number: `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      user_id: session.customer || null,
      session_id: session.id,

      // Order details
      items: orderItems,
      item_count: orderItems.reduce((sum, item) => sum + item.quantity, 0),
      subtotal,
      delivery_cost: deliveryCost,
      total_amount: totalAmount,

      // Customer and delivery info
      customer_info: {
        email: customerEmail,
        name: customerName,
        phone: customerPhone,
      },
      delivery_info: deliveryAddress || {},
      payment_info: {
        method: "stripe",
        status: "completed",
        transactionId: session.payment_intent,
        amount: totalAmount,
        currency: session.currency || "czk",
        processedAt: new Date().toISOString(),
      },

      // Delivery method (Requirement 9.1, 9.2)
      delivery_method: deliveryMethod || "delivery",
      pickup_location: pickupLocation,

      // Status
      status: "confirmed",
      confirmed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Create order in database (Requirement 9.1, 9.5)
    const result = await createOrder(orderData);

    if (result.error) {
      console.error("[Webhook] Error creating order:", result.error);
      throw new Error(`Failed to create order: ${result.error.message}`);
    }

    console.log(`[Webhook] Order created successfully: ${result.data?.id}`);

    // Send confirmation email
    await sendOrderConfirmationEmail(result.data?.id || "");

    return {
      orderId: result.data?.id,
      status: "completed",
      sessionId: session.id,
    };
  } catch (error) {
    console.error("[Webhook] Error handling checkout session completed:", error);
    throw error;
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata?.["orderId"];

  if (!orderId) {
    console.error("[Webhook] Order ID not found in payment intent metadata");
    return null;
  }

  console.log(`[Webhook] Payment succeeded for order ${orderId}`);

  const result = {
    orderId,
    status: "completed",
    paymentMethod: "stripe",
    transactionId: paymentIntent.id,
    amount: paymentIntent.amount / 100,
    currency: paymentIntent.currency,
  };

  // Update order in database
  await updateOrderPaymentStatus(orderId, result);

  // Send confirmation email
  await sendOrderConfirmationEmail(orderId);

  return result;
}

/**
 * Handle failed payment
 */
async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata?.["orderId"];

  if (!orderId) {
    console.error("[Webhook] Order ID not found in payment intent metadata");
    return null;
  }

  const errorMessage = paymentIntent.last_payment_error?.message || "Payment failed";
  console.log(`[Webhook] Payment failed for order ${orderId}:`, errorMessage);

  const result = {
    orderId,
    status: "failed",
    paymentMethod: "stripe",
    transactionId: paymentIntent.id,
    amount: paymentIntent.amount / 100,
    currency: paymentIntent.currency,
    error: errorMessage,
  };

  // Update order in database
  await updateOrderPaymentStatus(orderId, result);

  return result;
}

/**
 * Handle payment requiring action (e.g., 3D Secure)
 */
async function handleRequiresAction(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata?.["orderId"];

  if (!orderId) {
    console.error("[Webhook] Order ID not found in payment intent metadata");
    return null;
  }

  console.log(`[Webhook] Payment requires action for order ${orderId}`);

  const result = {
    orderId,
    status: "requires_action",
    paymentMethod: "stripe",
    transactionId: paymentIntent.id,
    amount: paymentIntent.amount / 100,
    currency: paymentIntent.currency,
  };

  // Update order status to indicate action required
  await updateOrderPaymentStatus(orderId, result);

  return result;
}

/**
 * Handle canceled payment
 */
async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata?.["orderId"];

  if (!orderId) {
    console.error("[Webhook] Order ID not found in payment intent metadata");
    return null;
  }

  console.log(`[Webhook] Payment canceled for order ${orderId}`);

  const result = {
    orderId,
    status: "canceled",
    paymentMethod: "stripe",
    transactionId: paymentIntent.id,
    amount: paymentIntent.amount / 100,
    currency: paymentIntent.currency,
  };

  // Update order in database
  await updateOrderPaymentStatus(orderId, result);

  return result;
}

/**
 * Handle payment processing
 */
async function handlePaymentProcessing(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata?.["orderId"];

  if (!orderId) {
    console.error("[Webhook] Order ID not found in payment intent metadata");
    return null;
  }

  console.log(`[Webhook] Payment processing for order ${orderId}`);

  const result = {
    orderId,
    status: "processing",
    paymentMethod: "stripe",
    transactionId: paymentIntent.id,
    amount: paymentIntent.amount / 100,
    currency: paymentIntent.currency,
  };

  // Update order status to processing
  await updateOrderPaymentStatus(orderId, result);

  return result;
}

/**
 * Check if event has already been processed (idempotency)
 */
async function checkDuplicateEvent(_eventId: string): Promise<boolean> {
  // TODO: Create webhook_events table in database
  // For now, always return false (no duplicate)
  return false;
}

/**
 * Mark event as processed
 */
async function markEventProcessed(_eventId: string, _eventType: string): Promise<void> {
  // TODO: Create webhook_events table in database
  // For now, do nothing
  console.log(`[Webhook] Event processed: ${_eventId} (${_eventType})`);
}
