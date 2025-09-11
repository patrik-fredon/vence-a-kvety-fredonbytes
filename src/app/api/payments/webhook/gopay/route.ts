/**
 * GoPay webhook handler for payment status updates
 */

import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { PaymentService } from "@/lib/payments";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get("x-gopay-signature") || headersList.get("signature");

    if (!signature) {
      console.error("Missing GoPay signature header");
      return NextResponse.json({ error: "Missing signature header" }, { status: 400 });
    }

    // Process the webhook
    const result = await PaymentService.processWebhook(body, signature, "gopay");

    if (!result) {
      console.error("Failed to process GoPay webhook");
      return NextResponse.json({ error: "Webhook processing failed" }, { status: 400 });
    }

    // Update order in database
    await updateOrderPaymentStatus(result.orderId, result);

    // Send confirmation email if payment successful
    if (result.status === "completed") {
      await sendOrderConfirmationEmail(result.orderId);
    }

    return NextResponse.json({
      received: true,
      orderId: result.orderId,
      status: result.status,
    });
  } catch (error) {
    console.error("Error processing GoPay webhook:", error);

    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

/**
 * Handle GET requests for GoPay return URL
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("order_id");
    const paymentId = searchParams.get("id");

    if (!orderId || !paymentId) {
      return NextResponse.redirect(new URL("/checkout/error", request.url));
    }

    // Get payment status from GoPay
    const result = await PaymentService.getPaymentStatus(paymentId, "gopay");

    if (!result) {
      return NextResponse.redirect(new URL("/checkout/error", request.url));
    }

    // Update order status
    await updateOrderPaymentStatus(result.orderId, result);

    // Redirect based on payment status
    if (result.status === "completed") {
      return NextResponse.redirect(new URL(`/checkout/success?orderId=${orderId}`, request.url));
    } else if (result.status === "cancelled") {
      return NextResponse.redirect(new URL(`/checkout/cancel?orderId=${orderId}`, request.url));
    } else {
      return NextResponse.redirect(new URL(`/checkout/error?orderId=${orderId}`, request.url));
    }
  } catch (error) {
    console.error("Error handling GoPay return:", error);
    return NextResponse.redirect(new URL("/checkout/error", request.url));
  }
}

/**
 * Update order payment status in database
 */
async function updateOrderPaymentStatus(orderId: string, paymentResult: any) {
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
