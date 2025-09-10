/**
 * Stripe webhook handler for payment status updates
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { PaymentService } from '@/lib/payments';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      console.error('Missing Stripe signature header');
      return NextResponse.json(
        { error: 'Missing signature header' },
        { status: 400 }
      );
    }

    // Process the webhook
    const result = await PaymentService.processWebhook(body, signature, 'stripe');

    if (!result) {
      // Event not handled, but still return success to Stripe
      return NextResponse.json({ received: true });
    }

    // Update order in database
    await updateOrderPaymentStatus(result.orderId, result);

    // Send confirmation email if payment successful
    if (result.status === 'completed') {
      await sendOrderConfirmationEmail(result.orderId);
    }

    return NextResponse.json({
      received: true,
      orderId: result.orderId,
      status: result.status
    });

  } catch (error) {
    console.error('Error processing Stripe webhook:', error);

    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Update order payment status in database
 */
async function updateOrderPaymentStatus(orderId: string, paymentResult: any) {
  try {
    const supabase = await createClient();

    const paymentInfo = {
      method: paymentResult.paymentMethod,
      amount: paymentResult.amount,
      currency: paymentResult.currency,
      status: paymentResult.status,
      transactionId: paymentResult.transactionId,
      processedAt: paymentResult.status === 'completed' ? new Date().toISOString() : null,
      failureReason: paymentResult.error || null,
    };

    // Update order with payment information
    const { error } = await supabase
      .from('orders')
      .update({
        payment_info: paymentInfo,
        status: paymentResult.status === 'completed' ? 'confirmed' :
          paymentResult.status === 'failed' ? 'cancelled' : 'pending',
        confirmed_at: paymentResult.status === 'completed' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (error) {
      console.error('Error updating order payment status:', error);
      throw error;
    }

    console.log(`Order ${orderId} payment status updated to ${paymentResult.status}`);
  } catch (error) {
    console.error('Error updating order in database:', error);
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
    console.error('Error sending confirmation email:', error);
    // Don't throw error here as payment was successful
  }
}
