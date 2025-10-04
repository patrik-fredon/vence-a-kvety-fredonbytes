/**
 * Unified payment service for Stripe integration
 */

import type { PaymentInfo, PaymentMethod, PaymentStatus } from "@/types/order";
import {
  createPaymentIntent,
  handleFailedPayment as handleStripeFailure,
  handleSuccessfulPayment as handleStripeSuccess,
  retrievePaymentIntent,
} from "./stripe";

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

export interface PaymentResponse {
  success: boolean;
  paymentId?: string;
  clientSecret?: string;
  error?: string;
}

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
   * Initialize Stripe payment
   */
  static async initializePayment(
    request: PaymentRequest
  ): Promise<PaymentResponse> {
    try {
      if (request.paymentMethod !== "stripe") {
        throw new Error(`Unsupported payment method: ${request.paymentMethod}`);
      }

      return await PaymentService.initializeStripePayment(request);
    } catch (error) {
      console.error("Error initializing payment:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Payment initialization failed",
      };
    }
  }

  /**
   * Initialize Stripe payment
   */
  private static async initializeStripePayment(
    request: PaymentRequest
  ): Promise<PaymentResponse> {
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
   * Get Stripe payment status
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
   * Get Stripe payment status
   */
  private static async getStripePaymentStatus(
    paymentIntentId: string
  ): Promise<PaymentResult> {
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
      orderId: paymentIntent.metadata["orderId"] || "",
      transactionId: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      status,
      paymentMethod: "stripe",
      error: paymentIntent.last_payment_error?.message,
    };
  }

  /**
   * Process Stripe webhook notification
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
   * Process Stripe webhook
   */
  private static async processStripeWebhook(
    payload: string | Buffer,
    signature: string
  ): Promise<PaymentResult | null> {
    const { verifyWebhookSignature } = await import("./stripe");

    const event = verifyWebhookSignature(
      payload,
      signature,
      process.env["STRIPE_WEBHOOK_SECRET"]!
    );

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
   * Create payment info object for database storage
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

// Export types and utilities
export * from "./stripe";
export { PaymentService as default };
