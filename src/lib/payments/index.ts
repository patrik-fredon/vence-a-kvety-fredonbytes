/**
 * @fileoverview Unified payment service for Stripe integration
 *
 * This module provides a high-level payment service that abstracts Stripe payment operations.
 * It includes payment initialization, status checking, webhook processing, and error handling.
 *
 * @module lib/payments
 *
 * @example
 * ```typescript
 * // Initialize a payment
 * const response = await PaymentService.initializePayment({
 *   orderId: 'order-123',
 *   amount: 100,
 *   currency: 'czk',
 *   customerEmail: 'customer@example.com',
 *   customerName: 'John Doe',
 *   paymentMethod: 'stripe',
 *   returnUrl: 'https://example.com/success',
 *   cancelUrl: 'https://example.com/cancel',
 *   webhookUrl: 'https://example.com/webhook',
 *   description: 'Order #123'
 * });
 *
 * if (response.success) {
 *   // Use response.clientSecret with Stripe Elements
 * }
 * ```
 */

import type { PaymentInfo, PaymentMethod, PaymentStatus } from "@/types/order";
import {
  createPaymentIntent,
  handleFailedPayment as handleStripeFailure,
  handleSuccessfulPayment as handleStripeSuccess,
  retrievePaymentIntent,
} from "./stripe";

/**
 * Payment request parameters for initializing a payment
 *
 * @interface PaymentRequest
 */
export interface PaymentRequest {
  orderId: string;
  amount: number;
  currency: string;
  customerEmail: string;
  customerName: string;
  paymentMethod: PaymentMethod;
  returnUrl: string;
  cancelUrl: string;
  webhookUrl: string;
  description: string;
  locale?: "cs" | "en";
}

/**
 * Response from payment initialization
 *
 * @interface PaymentResponse
 */
export interface PaymentResponse {
  success: boolean;
  paymentId?: string;
  clientSecret?: string;
  error?: string;
}

/**
 * Result of a payment operation (success or failure)
 *
 * @interface PaymentResult
 */
export interface PaymentResult {
  orderId: string;
  transactionId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  error: string | undefined;
}

/**
 * Payment service class
 */
export class PaymentService {
  /**
   * Initialize a payment with the specified payment method
   *
   * Currently supports Stripe payments. This method handles payment intent creation
   * and returns a client secret for use with Stripe Elements.
   *
   * @param request - Payment request parameters
   * @returns Promise resolving to payment response with client secret or error
   *
   * @example
   * ```typescript
   * const response = await PaymentService.initializePayment({
   *   orderId: 'order-123',
   *   amount: 100,
   *   currency: 'czk',
   *   customerEmail: 'customer@example.com',
   *   customerName: 'John Doe',
   *   paymentMethod: 'stripe',
   *   returnUrl: 'https://example.com/success',
   *   cancelUrl: 'https://example.com/cancel',
   *   webhookUrl: 'https://example.com/webhook',
   *   description: 'Order #123'
   * });
   * ```
   */
  static async initializePayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      if (request.paymentMethod !== "stripe") {
        throw new Error(`Unsupported payment method: ${request.paymentMethod}`);
      }

      return await PaymentService.initializeStripePayment(request);
    } catch (error) {
      console.error("Error initializing payment:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Payment initialization failed",
      };
    }
  }

  /**
   * Initialize a Stripe payment intent
   *
   * @private
   * @param request - Payment request parameters
   * @returns Promise resolving to payment response
   * @throws Error if payment intent creation fails
   */
  private static async initializeStripePayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const paymentIntent = await createPaymentIntent({
        amount: request.amount,
        currency: request.currency,
        orderId: request.orderId,
        customerEmail: request.customerEmail,
        customerName: request.customerName,
        metadata: {
          description: request.description,
          locale: request.locale || "cs",
        },
      });

      return {
        success: true,
        paymentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret!,
      };
    } catch (error) {
      console.error("Error initializing Stripe payment:", error);
      throw error;
    }
  }

  /**
   * Get the current status of a payment
   *
   * Retrieves the payment status from the payment provider and returns
   * standardized payment result information.
   *
   * @param paymentId - The payment intent ID
   * @param paymentMethod - The payment method used ('stripe')
   * @returns Promise resolving to payment result or null if not found
   *
   * @example
   * ```typescript
   * const result = await PaymentService.getPaymentStatus(
   *   'pi_1234567890',
   *   'stripe'
   * );
   *
   * if (result) {
   *   console.log('Payment status:', result.status);
   * }
   * ```
   */
  static async getPaymentStatus(
    paymentId: string,
    paymentMethod: PaymentMethod
  ): Promise<PaymentResult | null> {
    try {
      if (paymentMethod !== "stripe") {
        throw new Error(`Unsupported payment method: ${paymentMethod}`);
      }

      return await PaymentService.getStripePaymentStatus(paymentId);
    } catch (error) {
      console.error("Error getting payment status:", error);
      return null;
    }
  }

  /**
   * Get Stripe payment intent status
   *
   * @private
   * @param paymentIntentId - The Stripe payment intent ID
   * @returns Promise resolving to payment result
   */
  private static async getStripePaymentStatus(paymentIntentId: string): Promise<PaymentResult> {
    const paymentIntent = await retrievePaymentIntent(paymentIntentId);

    let status: PaymentStatus;
    switch (paymentIntent.status) {
      case "succeeded":
        status = "completed";
        break;
      case "processing":
        status = "processing";
        break;
      case "requires_payment_method":
      case "requires_confirmation":
      case "requires_action":
        status = "pending";
        break;
      case "canceled":
        status = "cancelled";
        break;
      default:
        status = "failed";
    }

    return {
      orderId: paymentIntent.metadata.orderId || "",
      transactionId: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      status,
      paymentMethod: "stripe",
      error: paymentIntent.last_payment_error?.message,
    };
  }

  /**
   * Process a payment webhook notification
   *
   * Verifies the webhook signature and processes the payment event.
   * Handles payment success and failure events.
   *
   * @param payload - The raw webhook payload (string or Buffer)
   * @param signature - The webhook signature header
   * @param paymentMethod - The payment method ('stripe')
   * @returns Promise resolving to payment result or null if event not handled
   *
   * @example
   * ```typescript
   * // In your webhook route handler
   * const result = await PaymentService.processWebhook(
   *   await request.text(),
   *   request.headers.get('stripe-signature')!,
   *   'stripe'
   * );
   *
   * if (result) {
   *   // Update order status based on result
   * }
   * ```
   */
  static async processWebhook(
    payload: string | Buffer,
    signature: string,
    paymentMethod: PaymentMethod
  ): Promise<PaymentResult | null> {
    try {
      if (paymentMethod !== "stripe") {
        throw new Error(`Unsupported payment method: ${paymentMethod}`);
      }

      return await PaymentService.processStripeWebhook(payload, signature);
    } catch (error) {
      console.error("Error processing webhook:", error);
      return null;
    }
  }

  /**
   * Process a Stripe webhook event
   *
   * @private
   * @param payload - The raw webhook payload
   * @param signature - The Stripe signature header
   * @returns Promise resolving to payment result or null
   */
  private static async processStripeWebhook(
    payload: string | Buffer,
    signature: string
  ): Promise<PaymentResult | null> {
    const { verifyWebhookSignature } = await import("./stripe");

    const event = verifyWebhookSignature(payload, signature, process.env.STRIPE_WEBHOOK_SECRET!);

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      const result = await handleStripeSuccess(paymentIntent);

      return {
        orderId: result.orderId,
        transactionId: result.transactionId,
        amount: result.amount,
        currency: result.currency,
        status: "completed",
        paymentMethod: "stripe",
        error: undefined,
      };
    } else if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object;
      const result = await handleStripeFailure(paymentIntent);

      return {
        orderId: result.orderId,
        transactionId: result.transactionId,
        amount: 0,
        currency: "czk",
        status: "failed",
        paymentMethod: "stripe",
        error: result.error,
      };
    }

    return null;
  }

  /**
   * Create a payment info object for database storage
   *
   * Generates a standardized payment info object that can be stored
   * in the database orders table.
   *
   * @param paymentMethod - The payment method used
   * @param amount - The payment amount
   * @param currency - The payment currency
   * @param status - The payment status (default: 'pending')
   * @param transactionId - The transaction ID from the payment provider
   * @returns Payment info object ready for database storage
   *
   * @example
   * ```typescript
   * const paymentInfo = PaymentService.createPaymentInfo(
   *   'stripe',
   *   100,
   *   'czk',
   *   'completed',
   *   'pi_1234567890'
   * );
   *
   * await supabase
   *   .from('orders')
   *   .update({ payment_info: paymentInfo })
   *   .eq('id', orderId);
   * ```
   */
  static createPaymentInfo(
    paymentMethod: PaymentMethod,
    amount: number,
    currency: string,
    status: PaymentStatus = "pending",
    transactionId?: string
  ): PaymentInfo {
    return {
      method: paymentMethod,
      amount,
      currency,
      status,
      transactionId,
      processedAt: status === "completed" ? new Date() : undefined,
      failureReason: undefined,
    };
  }
}

export { logPaymentError, sanitizeStripeError } from "./error-handler";
export { PaymentMonitor } from "./payment-monitor";
export { withRetry } from "./retry-handler";
// Export types and utilities
export type { CreatePaymentIntentOptions } from "./stripe";
export { createPaymentIntentAction } from "./stripe-service";
export { PaymentService as default };
