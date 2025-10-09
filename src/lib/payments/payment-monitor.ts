/**
 * Payment Error Monitoring
 * Requirements: 7.5, 8.5
 */

import { createClient } from "@/lib/supabase/server";

interface PaymentAttemptLog {
  orderId: string;
  amount: number;
  currency: string;
  customerEmail?: string;
  timestamp: number;
}

interface PaymentSuccessLog {
  orderId: string;
  paymentIntentId: string;
  transactionId: string;
  amount: number;
  currency: string;
  timestamp: number;
}

interface PaymentErrorLog {
  orderId?: string;
  paymentIntentId?: string;
  errorType: string;
  errorCode?: string;
  errorMessage: string;
  sanitizedMessage: string;
  amount?: number;
  currency?: string;
  customerEmail?: string;
  metadata?: Record<string, any>;
  stackTrace?: string;
  timestamp: number;
}

/**
 * PaymentMonitor class for tracking payment events and errors
 */
export class PaymentMonitor {
  /**
   * Log a payment attempt
   */
  static logPaymentAttempt(data: PaymentAttemptLog): void {
    const logData = {
      event: "payment_attempt",
      ...data,
      timestamp: new Date(data.timestamp).toISOString(),
    };

    if (process.env["NODE_ENV"] === "production") {
      console.log("[Payment Monitor]", logData);
    } else {
      console.log("[Payment Monitor - Dev]", logData);
    }
  }

  /**
   * Log a successful payment
   */
  static logPaymentSuccess(data: PaymentSuccessLog): void {
    const logData = {
      event: "payment_success",
      ...data,
      timestamp: new Date(data.timestamp).toISOString(),
    };

    if (process.env["NODE_ENV"] === "production") {
      console.log("[Payment Monitor] ✓", logData);
    } else {
      console.log("[Payment Monitor - Dev] ✓", logData);
    }
  }

  /**
   * Log a payment error and store in database
   */
  static async logPaymentError(data: PaymentErrorLog): Promise<void> {
    const logData = {
      event: "payment_error",
      ...data,
      timestamp: new Date(data.timestamp).toISOString(),
    };

    // Always log to console
    console.error("[Payment Monitor] ✗", logData);

    // Store in database for analysis
    try {
      const supabase = createClient();
      const insertData: any = {
        error_type: data.errorType,
        error_message: data.errorMessage,
        sanitized_message: data.sanitizedMessage,
        created_at: new Date(data.timestamp).toISOString(),
      };

      // Add optional fields only if they exist
      if (data.orderId) insertData.order_id = data.orderId;
      if (data.paymentIntentId) insertData.payment_intent_id = data.paymentIntentId;
      if (data.errorCode) insertData.error_code = data.errorCode;
      if (data.amount !== undefined) insertData.amount = data.amount;
      if (data.currency) insertData.currency = data.currency;
      if (data.customerEmail) insertData.customer_email = data.customerEmail;
      if (data.metadata) insertData.metadata = data.metadata;
      if (data.stackTrace) insertData.stack_trace = data.stackTrace;

      const { error } = await supabase.from("payment_errors").insert(insertData);

      if (error) {
        console.error("[Payment Monitor] Failed to store error in database:", error);
      }
    } catch (error) {
      console.error("[Payment Monitor] Exception storing error:", error);
    }
  }

  /**
   * Sanitize Stripe error for user display
   */
  static sanitizeStripeError(error: unknown): string {
    if (error instanceof Error) {
      // Check if it's a Stripe error
      const stripeError = error as any;

      if (stripeError.type === "StripeCardError") {
        // Card errors are safe to show to users
        return stripeError.message || "Platební karta byla odmítnuta.";
      }

      if (stripeError.type === "StripeInvalidRequestError") {
        return "Chyba v platebním požadavku. Kontaktujte prosím podporu.";
      }

      if (stripeError.type === "StripeAPIError") {
        return "Platební služba je dočasně nedostupná. Zkuste to prosím znovu.";
      }

      if (stripeError.type === "StripeConnectionError") {
        return "Chyba připojení. Zkontrolujte prosím své internetové připojení.";
      }

      if (stripeError.type === "StripeAuthenticationError") {
        return "Chyba autentizace platby. Kontaktujte prosím podporu.";
      }

      // Generic error message
      return "Nastala neočekávaná chyba. Zkuste to prosím znovu nebo kontaktujte podporu.";
    }

    return "Nastala neočekávaná chyba při zpracování platby.";
  }

  /**
   * Extract error details from Stripe error
   */
  static extractErrorDetails(error: unknown): {
    type: string;
    code?: string;
    message: string;
    sanitized: string;
  } {
    if (error instanceof Error) {
      const stripeError = error as any;

      return {
        type: stripeError.type || "UnknownError",
        code: stripeError.code,
        message: stripeError.message || error.message,
        sanitized: PaymentMonitor.sanitizeStripeError(error),
      };
    }

    return {
      type: "UnknownError",
      message: String(error),
      sanitized: PaymentMonitor.sanitizeStripeError(error),
    };
  }

  /**
   * Log Stripe webhook error
   */
  static async logWebhookError(data: {
    eventType: string;
    eventId: string;
    error: unknown;
    payload?: any;
  }): Promise<void> {
    const errorDetails = PaymentMonitor.extractErrorDetails(data.error);

    await PaymentMonitor.logPaymentError({
      errorType: `webhook_${data.eventType}`,
      ...(errorDetails.code ? { errorCode: errorDetails.code } : {}),
      errorMessage: errorDetails.message,
      sanitizedMessage: errorDetails.sanitized,
      metadata: {
        eventType: data.eventType,
        eventId: data.eventId,
        payload: data.payload,
      },
      timestamp: Date.now(),
    });
  }

  /**
   * Log payment intent creation error
   */
  static async logPaymentIntentError(data: {
    orderId: string;
    amount: number;
    currency: string;
    customerEmail?: string;
    error: unknown;
  }): Promise<void> {
    const errorDetails = PaymentMonitor.extractErrorDetails(data.error);

    await PaymentMonitor.logPaymentError({
      orderId: data.orderId,
      errorType: "payment_intent_creation",
      ...(errorDetails.code ? { errorCode: errorDetails.code } : {}),
      errorMessage: errorDetails.message,
      sanitizedMessage: errorDetails.sanitized,
      amount: data.amount,
      currency: data.currency,
      ...(data.customerEmail ? { customerEmail: data.customerEmail } : {}),
      timestamp: Date.now(),
    });
  }

  /**
   * Log payment confirmation error
   */
  static async logPaymentConfirmationError(data: {
    orderId: string;
    paymentIntentId: string;
    error: unknown;
  }): Promise<void> {
    const errorDetails = PaymentMonitor.extractErrorDetails(data.error);

    await PaymentMonitor.logPaymentError({
      orderId: data.orderId,
      paymentIntentId: data.paymentIntentId,
      errorType: "payment_confirmation",
      ...(errorDetails.code ? { errorCode: errorDetails.code } : {}),
      errorMessage: errorDetails.message,
      sanitizedMessage: errorDetails.sanitized,
      timestamp: Date.now(),
    });
  }

  /**
   * Get payment error statistics
   */
  static async getErrorStatistics(hours = 24): Promise<{
    totalErrors: number;
    errorsByType: Record<string, number>;
    recentErrors: any[];
  }> {
    try {
      const supabase = createClient();
      const startTime = new Date();
      startTime.setHours(startTime.getHours() - hours);

      const { data: errors, error } = await supabase
        .from("payment_errors")
        .select("*")
        .gte("created_at", startTime.toISOString())
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) {
        console.error("Error fetching payment error statistics:", error);
        return { totalErrors: 0, errorsByType: {}, recentErrors: [] };
      }

      const errorsByType = (errors || []).reduce(
        (acc, err) => {
          acc[err.error_type] = (acc[err.error_type] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      return {
        totalErrors: errors?.length || 0,
        errorsByType,
        recentErrors: errors?.slice(0, 10) || [],
      };
    } catch (error) {
      console.error("Exception getting error statistics:", error);
      return { totalErrors: 0, errorsByType: {}, recentErrors: [] };
    }
  }
}

// Export convenience functions
export const logPaymentAttempt = PaymentMonitor.logPaymentAttempt.bind(PaymentMonitor);
export const logPaymentSuccess = PaymentMonitor.logPaymentSuccess.bind(PaymentMonitor);
export const logPaymentError = PaymentMonitor.logPaymentError.bind(PaymentMonitor);
export const sanitizeStripeError = PaymentMonitor.sanitizeStripeError.bind(PaymentMonitor);
export const logWebhookError = PaymentMonitor.logWebhookError.bind(PaymentMonitor);
export const logPaymentIntentError = PaymentMonitor.logPaymentIntentError.bind(PaymentMonitor);
export const logPaymentConfirmationError =
  PaymentMonitor.logPaymentConfirmationError.bind(PaymentMonitor);
export const getPaymentErrorStatistics = PaymentMonitor.getErrorStatistics.bind(PaymentMonitor);
