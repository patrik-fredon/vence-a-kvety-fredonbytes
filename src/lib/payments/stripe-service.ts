/**
 * Modern Stripe service with Server Actions
 * Provides payment intent management with retry logic and error handling
 */

"use server";

import { cache } from "react";
import Stripe from "stripe";
import { sanitizeStripeError, logPaymentError } from "./error-handler";
import { withRetry, isRetryableStripeError } from "./retry-handler";
import { stripe } from "./stripe";

/**
 * Payment intent creation options
 */
export interface CreatePaymentIntentOptions {
  orderId: string;
  amount: number;
  currency?: string;
  customerEmail?: string;
  customerName?: string;
  locale?: string;
  metadata?: Record<string, string>;
}

/**
 * Payment intent result
 */
export interface PaymentIntentResult {
  success: boolean;
  clientSecret?: string;
  paymentIntentId?: string;
  error?: string;
  errorCategory?: string;
}

/**
 * Server Action to create a Stripe Payment Intent
 * Includes retry logic and comprehensive error handling
 *
 * @param options - Payment intent creation options
 * @returns Payment intent result with client secret or error
 *
 * @example
 * ```typescript
 * const result = await createPaymentIntentAction({
 *   orderId: 'order-123',
 *   amount: 100,
 *   currency: 'czk',
 *   customerEmail: 'customer@example.com'
 * });
 *
 * if (result.success) {
 *   // Use result.clientSecret with Stripe Elements
 * } else {
 *   // Display result.error to user
 * }
 * ```
 */
export async function createPaymentIntentAction(
  options: CreatePaymentIntentOptions
): Promise<PaymentIntentResult> {
  if (!stripe) {
    console.error("[Payment] Stripe is not configured");
    return {
      success: false,
      error: "Payment system is not configured. Please contact support.",
    };
  }

  const {
    orderId,
    amount,
    currency = "czk",
    customerEmail,
    customerName,
    locale = "cs",
    metadata = {},
  } = options;

  try {
    // Create payment intent with retry logic
    const paymentIntent = await withRetry(
      async () => {
        if (!stripe) {
          throw new Error("Stripe is not initialized");
        }
        return await stripe.paymentIntents.create({
          amount: Math.round(amount * 100), // Convert to cents
          currency: currency.toLowerCase(),
          automatic_payment_methods: {
            enabled: true,
          },
          metadata: {
            orderId,
            customerEmail: customerEmail || "",
            customerName: customerName || "",
            locale,
            ...metadata,
          },
          ...(customerEmail ? { receipt_email: customerEmail } : {}),
          description: `Objednávka pohřebních věnců #${orderId}`,
          statement_descriptor: "FUNERAL WREATHS",
        });
      },
      {
        maxRetries: 3,
        delayMs: 1000,
        backoff: 2,
        shouldRetry: isRetryableStripeError,
        onRetry: (attempt, error) => {
          console.log(
            `[Payment] Retry attempt ${attempt} for order ${orderId}`,
            error instanceof Error ? error.message : String(error)
          );
        },
      }
    );

    console.log(
      `[Payment] Payment intent created successfully for order ${orderId}:`,
      paymentIntent.id
    );

    return {
      success: true,
      ...(paymentIntent.client_secret ? { clientSecret: paymentIntent.client_secret } : {}),
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    // Log error with context
    logPaymentError(error, {
      orderId,
      amount,
      currency,
      operation: "createPaymentIntent",
    });

    // Sanitize error for user display
    const sanitized = sanitizeStripeError(error, locale as "cs" | "en");

    return {
      success: false,
      error: sanitized.userMessage,
      errorCategory: sanitized.category,
    };
  }
}

/**
 * Cached payment intent retrieval
 * Uses React cache to avoid redundant API calls
 *
 * @param paymentIntentId - The payment intent ID
 * @returns Payment intent object
 */
export const getPaymentIntent = cache(
  async (paymentIntentId: string): Promise<Stripe.PaymentIntent | null> => {
    if (!stripe) {
      console.error("[Payment] Stripe is not configured");
      return null;
    }

    try {
      return await withRetry(
        async () => {
          if (!stripe) {
            throw new Error("Stripe is not initialized");
          }
          return await stripe.paymentIntents.retrieve(paymentIntentId);
        },
        {
          maxRetries: 2,
          delayMs: 500,
          shouldRetry: isRetryableStripeError,
        }
      );
    } catch (error) {
      console.error(
        `[Payment] Failed to retrieve payment intent ${paymentIntentId}:`,
        error
      );
      return null;
    }
  }
);

/**
 * Server Action to retrieve payment intent status
 *
 * @param paymentIntentId - The payment intent ID
 * @returns Payment intent status information
 */
export async function getPaymentIntentStatusAction(
  paymentIntentId: string
): Promise<{
  status: string;
  amount?: number;
  currency?: string;
  error?: string;
}> {
  try {
    const paymentIntent = await getPaymentIntent(paymentIntentId);

    if (!paymentIntent) {
      return {
        status: "unknown",
        error: "Payment intent not found",
      };
    }

    return {
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
    };
  } catch (error) {
    console.error(
      `[Payment] Error getting payment intent status ${paymentIntentId}:`,
      error
    );
    return {
      status: "error",
      error: "Failed to retrieve payment status",
    };
  }
}

/**
 * Server Action to cancel a payment intent
 *
 * @param paymentIntentId - The payment intent ID
 * @returns Success status
 */
export async function cancelPaymentIntentAction(
  paymentIntentId: string
): Promise<{ success: boolean; error?: string }> {
  if (!stripe) {
    return {
      success: false,
      error: "Payment system is not configured",
    };
  }

  try {
    await stripe.paymentIntents.cancel(paymentIntentId);

    console.log(`[Payment] Payment intent cancelled: ${paymentIntentId}`);

    return { success: true };
  } catch (error) {
    console.error(
      `[Payment] Failed to cancel payment intent ${paymentIntentId}:`,
      error
    );

    const sanitized = sanitizeStripeError(error);

    return {
      success: false,
      error: sanitized.userMessage,
    };
  }
}

/**
 * Server Action to update payment intent metadata
 *
 * @param paymentIntentId - The payment intent ID
 * @param metadata - Metadata to update
 * @returns Success status
 */
export async function updatePaymentIntentMetadataAction(
  paymentIntentId: string,
  metadata: Record<string, string>
): Promise<{ success: boolean; error?: string }> {
  if (!stripe) {
    return {
      success: false,
      error: "Payment system is not configured",
    };
  }

  try {
    await stripe.paymentIntents.update(paymentIntentId, {
      metadata,
    });

    console.log(
      `[Payment] Payment intent metadata updated: ${paymentIntentId}`
    );

    return { success: true };
  } catch (error) {
    console.error(
      `[Payment] Failed to update payment intent metadata ${paymentIntentId}:`,
      error
    );

    const sanitized = sanitizeStripeError(error);

    return {
      success: false,
      error: sanitized.userMessage,
    };
  }
}
