/**
 * Stripe payment integration configuration and utilities
 */

import { loadStripe, type StripeElementsOptions } from "@stripe/stripe-js";
import Stripe from "stripe";
import { getRequiredEnvVar } from "@/lib/config/env-validation";

// Server-side Stripe instance with validation
export const stripe = (() => {
  try {
    const secretKey = getRequiredEnvVar("STRIPE_SECRET_KEY");
    return new Stripe(secretKey, {
      apiVersion: "2024-12-18.acacia" as any,
      typescript: true,
      maxNetworkRetries: 3,
      timeout: 10000,
      appInfo: {
        name: "Funeral Wreaths E-commerce",
        version: "1.0.0",
        url: "https://pohrebni-vence.cz",
      },
    });
  } catch (error) {
    console.error("Failed to initialize Stripe:", error);
    return null;
  }
})();

// Client-side Stripe promise
let stripePromise: Promise<any> | null = null;

export const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = getRequiredEnvVar("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
};

// Stripe Elements configuration
export const stripeElementsOptions: StripeElementsOptions = {
  appearance: {
    theme: "stripe",
    variables: {
      colorPrimary: "#0d9488", // Teal-600 from design system
      colorBackground: "#ffffff",
      colorText: "#1f2937", // Gray-800
      colorDanger: "#dc2626", // Red-600
      colorTextSecondary: "#6b7280", // Gray-500
      fontFamily: "Inter, system-ui, -apple-system, sans-serif",
      spacingUnit: "4px",
      borderRadius: "8px",
      fontSizeBase: "16px",
      fontWeightNormal: "400",
      fontWeightMedium: "500",
    },
    rules: {
      ".Input": {
        border: "2px solid #e5e7eb",
        borderRadius: "8px",
        padding: "12px 16px",
        fontSize: "16px",
        lineHeight: "1.5",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
      },
      ".Input:hover": {
        border: "2px solid #d1d5db",
      },
      ".Input:focus": {
        border: "2px solid #0d9488",
        boxShadow: "0 0 0 3px rgba(13, 148, 136, 0.1)",
        outline: "none",
      },
      ".Input--invalid": {
        border: "2px solid #dc2626",
      },
      ".Input--invalid:focus": {
        border: "2px solid #dc2626",
        boxShadow: "0 0 0 3px rgba(220, 38, 38, 0.1)",
      },
      ".Label": {
        fontSize: "14px",
        fontWeight: "500",
        color: "#374151",
        marginBottom: "8px",
      },
      ".Error": {
        fontSize: "14px",
        color: "#dc2626",
        marginTop: "8px",
      },
      ".Tab": {
        border: "2px solid #e5e7eb",
        borderRadius: "8px",
        padding: "12px 16px",
        transition: "border-color 0.2s ease, background-color 0.2s ease",
      },
      ".Tab:hover": {
        border: "2px solid #d1d5db",
        backgroundColor: "#f9fafb",
      },
      ".Tab--selected": {
        border: "2px solid #0d9488",
        backgroundColor: "#f0fdfa",
      },
      ".TabIcon--selected": {
        fill: "#0d9488",
      },
    },
  },
  locale: "cs", // Default to Czech
};;

/**
 * Get Stripe Elements options with locale support
 *
 * @param locale - The locale to use ('cs' or 'en')
 * @returns Stripe Elements options configured for the locale
 *
 * @example
 * ```typescript
 * const options = getStripeElementsOptions('cs');
 * <Elements stripe={stripePromise} options={options}>
 *   <PaymentForm />
 * </Elements>
 * ```
 */
export function getStripeElementsOptions(
  locale: "cs" | "en" = "cs"
): StripeElementsOptions {
  return {
    ...stripeElementsOptions,
    locale,
  };
}

/**
 * Get Stripe Elements options with client secret
 *
 * @param clientSecret - The payment intent client secret
 * @param locale - The locale to use ('cs' or 'en')
 * @returns Stripe Elements options with client secret
 */
export function getStripeElementsOptionsWithSecret(
  clientSecret: string,
  locale: "cs" | "en" = "cs"
): StripeElementsOptions {
  return {
    ...stripeElementsOptions,
    clientSecret,
    locale,
  } as StripeElementsOptions;
}

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
    // Check if payment intent already exists for this order
    const { getCachedPaymentIntentByOrderId } = await import("@/lib/cache/payment-intent-cache");
    const cachedIntent = await getCachedPaymentIntentByOrderId(orderId);

    if (cachedIntent && cachedIntent.status !== "succeeded" && cachedIntent.status !== "canceled") {
      console.log(`✅ [Stripe] Using cached payment intent for order: ${orderId}`);
      // Return the cached payment intent by retrieving it from Stripe
      return await stripe.paymentIntents.retrieve(cachedIntent.id);
    }

    // Create new payment intent
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

    // Cache the payment intent
    const { cachePaymentIntent } = await import("@/lib/cache/payment-intent-cache");
    await cachePaymentIntent(paymentIntent);

    console.log(`✅ [Stripe] Created and cached payment intent: ${paymentIntent.id}`);

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
    // Try to get from cache first
    const { getCachedPaymentIntent } = await import("@/lib/cache/payment-intent-cache");
    const cachedIntent = await getCachedPaymentIntent(paymentIntentId);

    if (cachedIntent) {
      console.log(`✅ [Stripe] Using cached payment intent: ${paymentIntentId}`);
      // Return the cached data by retrieving from Stripe to ensure freshness
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      // Update cache with fresh data
      const { cachePaymentIntent } = await import("@/lib/cache/payment-intent-cache");
      await cachePaymentIntent(paymentIntent);

      return paymentIntent;
    }

    // Fetch from Stripe and cache
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    const { cachePaymentIntent } = await import("@/lib/cache/payment-intent-cache");
    await cachePaymentIntent(paymentIntent);

    console.log(`✅ [Stripe] Retrieved and cached payment intent: ${paymentIntentId}`);

    return paymentIntent;
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
  const orderId = paymentIntent.metadata["orderId"];

  if (!orderId) {
    throw new Error("Order ID not found in payment intent metadata");
  }

  // Invalidate payment intent cache on status change
  const { invalidatePaymentIntentCache } = await import("@/lib/cache/payment-intent-cache");
  await invalidatePaymentIntentCache(paymentIntent.id);

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
  const orderId = paymentIntent.metadata["orderId"];

  if (!orderId) {
    throw new Error("Order ID not found in payment intent metadata");
  }

  // Invalidate payment intent cache on status change
  const { invalidatePaymentIntentCache } = await import("@/lib/cache/payment-intent-cache");
  await invalidatePaymentIntentCache(paymentIntent.id);

  console.log(`Payment failed for order ${orderId}:`, paymentIntent.last_payment_error?.message);

  return {
    orderId,
    transactionId: paymentIntent.id,
    error: paymentIntent.last_payment_error?.message || "Payment failed",
  };
}
