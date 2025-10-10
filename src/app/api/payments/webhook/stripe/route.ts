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
  let event: Stripe.Event | undefined;

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

    try {
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

      // Mark event as processed successfully
      await markEventProcessed(
        event.id,
        event.type,
        "success",
        undefined,
        event.data.object as Record<string, any>
      );

      return NextResponse.json({
        received: true,
        eventId: event.id,
        eventType: event.type,
        orderId: result?.orderId,
      });
    } catch (handlerError) {
      // Record the failed event
      const errorMessage =
        handlerError instanceof Error ? handlerError.message : String(handlerError);
      const errorStack = handlerError instanceof Error ? handlerError.stack : undefined;

      console.error(`[Webhook] Error handling event ${event.type}:`, {
        eventId: event.id,
        error: errorMessage,
        stack: errorStack,
      });

      await markEventProcessed(
        event.id,
        event.type,
        "failed",
        errorMessage,
        event.data.object as Record<string, any>
      );

      // Return 500 to trigger Stripe retry for recoverable errors
      return NextResponse.json(
        {
          error: "Event processing failed",
          eventId: event.id,
          eventType: event.type,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error("[Webhook] Error processing Stripe webhook:", {
      error: errorMessage,
      stack: errorStack,
      eventId: event?.id,
    });

    // If we have an event, record the failure
    if (event) {
      await markEventProcessed(
        event.id,
        event.type,
        "failed",
        errorMessage,
        event.data.object as Record<string, any>
      );
    }

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
    console.log(`[Webhook] Updating payment status for order ${orderId}:`, {
      orderId,
      status: paymentResult.status,
      transactionId: paymentResult.transactionId,
      amount: paymentResult.amount,
      currency: paymentResult.currency,
    });

    const supabase = createServerClient();

    // Map payment status to order status
    let orderStatus = "pending";
    if (paymentResult.status === "completed") {
      orderStatus = "confirmed";
    } else if (paymentResult.status === "failed") {
      orderStatus = "cancelled";
    } else if (paymentResult.status === "canceled") {
      orderStatus = "cancelled";
    } else if (paymentResult.status === "requires_action") {
      orderStatus = "pending";
    } else if (paymentResult.status === "processing") {
      orderStatus = "pending";
    }

    const paymentInfo = {
      method: paymentResult.paymentMethod,
      amount: paymentResult.amount,
      currency: paymentResult.currency,
      status: paymentResult.status,
      transactionId: paymentResult.transactionId,
      processedAt: paymentResult.status === "completed" ? new Date().toISOString() : null,
      failureReason: paymentResult.error || null,
      updatedAt: new Date().toISOString(),
    };

    // Update order with payment information
    const { error } = await supabase
      .from("orders")
      .update({
        payment_info: paymentInfo,
        status: orderStatus,
        confirmed_at: paymentResult.status === "completed" ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (error) {
      console.error("[Webhook] Error updating order payment status:", {
        orderId,
        error: error.message,
        code: error.code,
      });
      throw error;
    }

    console.log(`[Webhook] Order payment status updated successfully:`, {
      orderId,
      paymentStatus: paymentResult.status,
      orderStatus,
      transactionId: paymentResult.transactionId,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[Webhook] Error updating order in database:", {
      orderId,
      error: errorMessage,
    });
    throw error;
  }
}

/**
 * Send order confirmation email
 */
async function sendOrderConfirmationEmail(orderId: string, orderData?: any) {
  try {
    console.log(`[Webhook] Sending confirmation emails for order ${orderId}`);

    // If order data is not provided, fetch it from database
    let order = orderData;
    if (!order) {
      const supabase = createServerClient();
      const { data, error } = await supabase.from("orders").select("*").eq("id", orderId).single();

      if (error || !data) {
        console.error("[Webhook] Failed to fetch order for email:", {
          orderId,
          error: error?.message,
        });
        return;
      }
      order = data;
    }

    // Import email service
    const { sendCustomerConfirmation, sendAdminNotification } = await import(
      "@/lib/email/order-notifications"
    );

    // Determine locale from order or default to 'cs'
    const locale = (order.customer_info?.locale || "cs") as "cs" | "en";

    // Prepare customer confirmation data
    const customerData = {
      orderId: order.id,
      orderNumber: order.order_number,
      customerName: order.customer_info?.name || "Valued Customer",
      customerEmail: order.customer_info?.email,
      customerPhone: order.customer_info?.phone,
      items: order.items.map((item: any) => ({
        productName: item.productName || item.product_name || "Product",
        quantity: item.quantity,
        price: item.price,
        customizations: item.customizations || [],
      })),
      subtotal: order.subtotal,
      deliveryCost: order.delivery_cost || 0,
      totalAmount: order.total_amount,
      currency: order.payment_info?.currency?.toUpperCase() || "CZK",
      deliveryMethod: order.delivery_method as "delivery" | "pickup",
      deliveryAddress: order.delivery_info,
      pickupLocation: order.pickup_location,
      deliveryDate: order.delivery_info?.preferred_date,
      locale,
      createdAt: order.created_at,
      trackingUrl: `${process.env["NEXT_PUBLIC_BASE_URL"] || "https://pohrebni-vence.cz"}/${locale}/orders/${order.order_number}`,
    };

    // Prepare admin notification data
    const adminData = {
      orderId: order.id,
      orderNumber: order.order_number,
      customerName: order.customer_info?.name || "Unknown",
      customerEmail: order.customer_info?.email,
      customerPhone: order.customer_info?.phone,
      items: order.items.map((item: any) => ({
        productName: item.productName || item.product_name || "Product",
        quantity: item.quantity,
        price: item.price,
        customizations: item.customizations || [],
      })),
      subtotal: order.subtotal,
      deliveryCost: order.delivery_cost || 0,
      totalAmount: order.total_amount,
      currency: order.payment_info?.currency?.toUpperCase() || "CZK",
      deliveryMethod: order.delivery_method as "delivery" | "pickup",
      deliveryAddress: order.delivery_info,
      pickupLocation: order.pickup_location,
      deliveryDate: order.delivery_info?.preferred_date,
      locale,
      createdAt: order.created_at,
      ...(order.payment_info && {
        paymentInfo: {
          method: order.payment_info.method,
          transactionId: order.payment_info.transactionId,
          status: order.payment_info.status,
        },
      }),
      ...(order.special_instructions && {
        specialInstructions: order.special_instructions,
      }),
    };

    // Send both emails concurrently
    const [customerResult, adminResult] = await Promise.all([
      sendCustomerConfirmation(customerData),
      sendAdminNotification(adminData),
    ]);

    // Log results
    if (customerResult.success) {
      console.log(`[Webhook] Customer confirmation email sent:`, {
        orderId,
        orderNumber: order.order_number,
        customerEmail: customerData.customerEmail,
        messageId: customerResult.messageId,
      });
    } else {
      console.error(`[Webhook] Failed to send customer confirmation email:`, {
        orderId,
        orderNumber: order.order_number,
        customerEmail: customerData.customerEmail,
        error: customerResult.error,
      });
    }

    if (adminResult.success) {
      console.log(`[Webhook] Admin notification email sent:`, {
        orderId,
        orderNumber: order.order_number,
        messageId: adminResult.messageId,
      });
    } else {
      console.error(`[Webhook] Failed to send admin notification email:`, {
        orderId,
        orderNumber: order.order_number,
        error: adminResult.error,
      });
    }

    // Don't throw errors - email failures shouldn't fail the webhook
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[Webhook] Error sending confirmation emails:", {
      orderId,
      error: errorMessage,
    });
    // Don't throw - email failures shouldn't fail order creation
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
  console.log(`[Webhook] Checkout session completed: ${session.id}`, {
    sessionId: session.id,
    paymentStatus: session.payment_status,
    amount: session.amount_total,
    currency: session.currency,
  });

  try {
    // Extract metadata from session
    const metadata = session.metadata || {};

    // Retrieve line items from the session
    const stripe = (await import("@/lib/payments/stripe")).stripe;
    if (!stripe) {
      const error = new Error("Stripe not configured");
      console.error("[Webhook] Stripe configuration error:", {
        sessionId: session.id,
        error: error.message,
      });
      throw error;
    }

    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      expand: ["data.price.product"],
    });

    console.log(
      `[Webhook] Retrieved ${lineItems.data.length} line items for session ${session.id}`
    );

    // Build order items from line items
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
        } else {
          console.warn(`[Webhook] Line item missing productId:`, {
            sessionId: session.id,
            priceId: item.price.id,
          });
        }
      }
    }

    if (orderItems.length === 0) {
      const error = new Error("No valid order items found in session");
      console.error("[Webhook] Order creation failed:", {
        sessionId: session.id,
        error: error.message,
        lineItemsCount: lineItems.data.length,
      });
      throw error;
    }

    // Extract delivery method from metadata
    const deliveryMethod = metadata["deliveryMethod"] as "delivery" | "pickup" | undefined;
    const pickupLocation = deliveryMethod === "pickup" ? getPickupLocation() : undefined;

    // Get customer info from session
    const customerDetails = session.customer_details || {};
    const customerEmail = (customerDetails as { email?: string | null }).email || "";
    const customerName = (customerDetails as { name?: string | null }).name || "";
    const customerPhone = (customerDetails as { phone?: string | null }).phone || "";

    if (!customerEmail) {
      console.warn(`[Webhook] Missing customer email for session ${session.id}`);
    }

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

      // Delivery method
      delivery_method: deliveryMethod || "delivery",
      pickup_location: pickupLocation,

      // Status
      status: "confirmed",
      confirmed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log(`[Webhook] Creating order for session ${session.id}:`, {
      orderNumber: orderData.order_number,
      itemCount: orderData.item_count,
      totalAmount: orderData.total_amount,
      deliveryMethod: orderData.delivery_method,
    });

    // Create order in database
    const result = await createOrder(orderData);

    if (result.error) {
      console.error("[Webhook] Error creating order:", {
        sessionId: session.id,
        error: result.error.message,
        code: result.error.code,
        details: result.error.details,
      });
      throw new Error(`Failed to create order: ${result.error.message}`);
    }

    console.log(`[Webhook] Order created successfully:`, {
      orderId: result.data?.id,
      orderNumber: orderData.order_number,
      sessionId: session.id,
    });

    // Send confirmation email with order data
    await sendOrderConfirmationEmail(result.data?.id || "", {
      id: result.data?.id,
      order_number: orderData.order_number,
      customer_info: orderData.customer_info,
      items: orderData.items,
      subtotal: orderData.subtotal,
      delivery_cost: orderData.delivery_cost,
      total_amount: orderData.total_amount,
      delivery_method: orderData.delivery_method,
      delivery_info: orderData.delivery_info,
      pickup_location: orderData.pickup_location,
      payment_info: orderData.payment_info,
      created_at: orderData.created_at,
    });

    return {
      orderId: result.data?.id,
      status: "completed",
      sessionId: session.id,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error("[Webhook] Error handling checkout session completed:", {
      sessionId: session.id,
      error: errorMessage,
      stack: errorStack,
    });
    throw error;
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata?.["orderId"];

  if (!orderId) {
    console.error("[Webhook] Order ID not found in payment intent metadata:", {
      paymentIntentId: paymentIntent.id,
      metadata: paymentIntent.metadata,
    });
    return null;
  }

  console.log(`[Webhook] Payment succeeded for order ${orderId}:`, {
    orderId,
    paymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount / 100,
    currency: paymentIntent.currency,
  });

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
    console.error("[Webhook] Order ID not found in payment intent metadata:", {
      paymentIntentId: paymentIntent.id,
      metadata: paymentIntent.metadata,
    });
    return null;
  }

  const errorMessage = paymentIntent.last_payment_error?.message || "Payment failed";
  const errorCode = paymentIntent.last_payment_error?.code;
  const errorType = paymentIntent.last_payment_error?.type;

  console.error(`[Webhook] Payment failed for order ${orderId}:`, {
    orderId,
    paymentIntentId: paymentIntent.id,
    errorMessage,
    errorCode,
    errorType,
    amount: paymentIntent.amount / 100,
    currency: paymentIntent.currency,
  });

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
    console.error("[Webhook] Order ID not found in payment intent metadata:", {
      paymentIntentId: paymentIntent.id,
      metadata: paymentIntent.metadata,
    });
    return null;
  }

  console.log(`[Webhook] Payment requires action for order ${orderId}:`, {
    orderId,
    paymentIntentId: paymentIntent.id,
    nextAction: paymentIntent.next_action?.type,
    amount: paymentIntent.amount / 100,
    currency: paymentIntent.currency,
  });

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
    console.error("[Webhook] Order ID not found in payment intent metadata:", {
      paymentIntentId: paymentIntent.id,
      metadata: paymentIntent.metadata,
    });
    return null;
  }

  console.log(`[Webhook] Payment canceled for order ${orderId}:`, {
    orderId,
    paymentIntentId: paymentIntent.id,
    cancellationReason: paymentIntent.cancellation_reason,
    amount: paymentIntent.amount / 100,
    currency: paymentIntent.currency,
  });

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
    console.error("[Webhook] Order ID not found in payment intent metadata:", {
      paymentIntentId: paymentIntent.id,
      metadata: paymentIntent.metadata,
    });
    return null;
  }

  console.log(`[Webhook] Payment processing for order ${orderId}:`, {
    orderId,
    paymentIntentId: paymentIntent.id,
    paymentMethod: paymentIntent.payment_method_types,
    amount: paymentIntent.amount / 100,
    currency: paymentIntent.currency,
  });

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
async function checkDuplicateEvent(eventId: string): Promise<boolean> {
  try {
    const supabase = createServerClient();

    // Check if event_id exists in webhook_events table
    const { data, error } = await supabase
      .from("webhook_events")
      .select("event_id")
      .eq("event_id", eventId)
      .single();

    if (error) {
      // If error is "not found", event is not a duplicate
      if (error.code === "PGRST116") {
        return false;
      }
      // Log other errors but don't fail the webhook
      console.error("[Webhook] Error checking duplicate event:", error);
      return false;
    }

    // If we found a record, it's a duplicate
    return !!data;
  } catch (error) {
    console.error("[Webhook] Error checking duplicate event:", error);
    // On error, assume not duplicate to allow processing
    return false;
  }
}

/**
 * Mark event as processed
 */
async function markEventProcessed(
  eventId: string,
  eventType: string,
  status: "success" | "failed" = "success",
  errorMessage?: string,
  payload?: Record<string, any>
): Promise<void> {
  try {
    const supabase = createServerClient();

    const { error } = await supabase.from("webhook_events").insert({
      event_id: eventId,
      event_type: eventType,
      status,
      error_message: errorMessage || null,
      payload: payload || null,
      processed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    });

    if (error) {
      // If it's a duplicate key error, that's okay (race condition protection)
      if (error.code === "23505") {
        console.log(`[Webhook] Event ${eventId} already recorded (race condition)`);
        return;
      }
      console.error("[Webhook] Error recording webhook event:", error);
      // Don't throw - we don't want to fail the webhook if recording fails
    } else {
      console.log(`[Webhook] Event recorded: ${eventId} (${eventType}) - ${status}`);
    }
  } catch (error) {
    console.error("[Webhook] Error recording webhook event:", error);
    // Don't throw - we don't want to fail the webhook if recording fails
  }
}
