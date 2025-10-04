/**
 * Stripe payment integration configuration and utilities
 */

import { loadStripe, type StripeElementsOptions } from "@stripe/stripe-js";
import Stripe from "stripe";

// Server-side Stripe instance
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-08-27.basil",
      typescript: true,
    })
  : null;

// Client-side Stripe promise
let stripePromise: Promise<any> | null = null;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
};

// Stripe Elements configuration
export const stripeElementsOptions: StripeElementsOptions = {
  appearance: {
    theme: "stripe",
    variables: {
      colorPrimary: "#059669", // Primary green color
      colorBackground: "#ffffff",
      colorText: "#1f2937",
      colorDanger: "#dc2626",
      fontFamily: "Inter, system-ui, sans-serif",
      spacingUnit: "4px",
      borderRadius: "8px",
    },
    rules: {
      ".Input": {
        border: "2px solid #e5e7eb",
        borderRadius: "8px",
        padding: "12px",
        fontSize: "16px",
      },
      ".Input:focus": {
        border: "2px solid #059669",
        boxShadow: "0 0 0 3px rgba(5, 150, 105, 0.1)",
      },
      ".Input--invalid": {
        border: "2px solid #dc2626",
      },
    },
  },
  locale: "cs", // Default to Czech, will be updated dynamically
};

// Payment intent creation options
export interface CreatePaymentIntentOptions {
  amount: number; // Amount in cents
  currency: string;
  orderId: string;
  customerEmail: string;
  customerName: string;
  metadata?: Record<string, string>;
}

/**
 * Create a Stripe Payment Intent
 */
export async function createPaymentIntent(
  options: CreatePaymentIntentOptions
): Promise<Stripe.PaymentIntent> {
  if (!stripe) {
    throw new Error("Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.");
  }

  const { amount, currency = "czk", orderId, customerEmail, customerName, metadata = {} } = options;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        orderId,
        customerEmail,
        customerName,
        ...metadata,
      },
      receipt_email: customerEmail,
      description: `Objednávka pohřebních věnců #${orderId}`,
    });

    return paymentIntent;
  } catch (error) {
    console.error("Error creating Stripe Payment Intent:", error);
    throw new Error("Failed to create payment intent");
  }
}

/**
 * Retrieve a Payment Intent by ID
 */
export async function retrievePaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  if (!stripe) {
    throw new Error("Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.");
  }

  try {
    return await stripe.paymentIntents.retrieve(paymentIntentId);
  } catch (error) {
    console.error("Error retrieving Payment Intent:", error);
    throw new Error("Failed to retrieve payment intent");
  }
}

/**
 * Confirm a Payment Intent
 */
export async function confirmPaymentIntent(
  paymentIntentId: string,
  paymentMethodId: string
): Promise<Stripe.PaymentIntent> {
  if (!stripe) {
    throw new Error("Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.");
  }

  try {
    return await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId,
    });
  } catch (error) {
    console.error("Error confirming Payment Intent:", error);
    throw new Error("Failed to confirm payment");
  }
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event {
  if (!stripe) {
    throw new Error("Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.");
  }

  try {
    return stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    throw new Error("Invalid webhook signature");
  }
}

/**
 * Handle successful payment
 */
export async function handleSuccessfulPayment(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata.orderId;

  if (!orderId) {
    throw new Error("Order ID not found in payment intent metadata");
  }

  // Update order status in database
  // This will be implemented when we create the order update function
  console.log(`Payment successful for order ${orderId}`);

  return {
    orderId,
    transactionId: paymentIntent.id,
    amount: paymentIntent.amount / 100,
    currency: paymentIntent.currency,
  };
}

/**
 * Handle failed payment
 */
export async function handleFailedPayment(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata.orderId;

  if (!orderId) {
    throw new Error("Order ID not found in payment intent metadata");
  }

  console.log(`Payment failed for order ${orderId}:`, paymentIntent.last_payment_error?.message);

  return {
    orderId,
    transactionId: paymentIntent.id,
    error: paymentIntent.last_payment_error?.message || "Payment failed",
  };
}
