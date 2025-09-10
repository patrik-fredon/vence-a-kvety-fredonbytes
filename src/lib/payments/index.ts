/**
 * Unified payment service for Stripe and GoPay integration
 */

import { PaymentMethod, PaymentInfo, PaymentStatus } from '@/types/order';
import {
  createPaymentIntent,
  retrievePaymentIntent,
  handleSuccessfulPayment as handleStripeSuccess,
  handleFailedPayment as handleStripeFailure
} from './stripe';
import {
  createGopayClient,
  GopayPaymentRequest,
  handleGopaySuccess,
  handleGopayFailure
} from './gopay';

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
  locale?: 'cs' | 'en';
}

export interface PaymentResponse {
  success: boolean;
  paymentId?: string;
  clientSecret?: string; // For Stripe
  redirectUrl?: string; // For GoPay
  error?: string;
}

export interface PaymentResult {
  orderId: string;
  transactionId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  error?: string;
}

/**
 * Payment service class
 */
export class PaymentService {
  /**
   * Initialize payment based on payment method
   */
  static async initializePayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      switch (request.paymentMethod) {
        case 'stripe':
          return await this.initializeStripePayment(request);
        case 'gopay':
          return await this.initializeGopayPayment(request);
        default:
          throw new Error(`Unsupported payment method: ${request.paymentMethod}`);
      }
    } catch (error) {
      console.error('Error initializing payment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment initialization failed',
      };
    }
  }

  /**
   * Initialize Stripe payment
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
          locale: request.locale || 'cs',
        },
      });

      return {
        success: true,
        paymentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret!,
      };
    } catch (error) {
      console.error('Error initializing Stripe payment:', error);
      throw error;
    }
  }

  /**
   * Initialize GoPay payment
   */
  private static async initializeGopayPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const gopayClient = createGopayClient();

      const gopayRequest: GopayPaymentRequest = {
        amount: request.amount,
        currency: request.currency,
        orderId: request.orderId,
        customerEmail: request.customerEmail,
        customerName: request.customerName,
        returnUrl: request.returnUrl,
        notifyUrl: request.webhookUrl,
        description: request.description,
        lang: request.locale?.toUpperCase() as 'CS' | 'EN' || 'CS',
      };

      const payment = await gopayClient.createPayment(gopayRequest);

      return {
        success: true,
        paymentId: payment.id.toString(),
        redirectUrl: payment.gw_url,
      };
    } catch (error) {
      console.error('Error initializing GoPay payment:', error);
      throw error;
    }
  }

  /**
   * Get payment status
   */
  static async getPaymentStatus(paymentId: string, paymentMethod: PaymentMethod): Promise<PaymentResult | null> {
    try {
      switch (paymentMethod) {
        case 'stripe':
          return await this.getStripePaymentStatus(paymentId);
        case 'gopay':
          return await this.getGopayPaymentStatus(paymentId);
        default:
          throw new Error(`Unsupported payment method: ${paymentMethod}`);
      }
    } catch (error) {
      console.error('Error getting payment status:', error);
      return null;
    }
  }

  /**
   * Get Stripe payment status
   */
  private static async getStripePaymentStatus(paymentIntentId: string): Promise<PaymentResult> {
    const paymentIntent = await retrievePaymentIntent(paymentIntentId);

    let status: PaymentStatus;
    switch (paymentIntent.status) {
      case 'succeeded':
        status = 'completed';
        break;
      case 'processing':
        status = 'processing';
        break;
      case 'requires_payment_method':
      case 'requires_confirmation':
      case 'requires_action':
        status = 'pending';
        break;
      case 'canceled':
        status = 'cancelled';
        break;
      default:
        status = 'failed';
    }

    return {
      orderId: paymentIntent.metadata.orderId,
      transactionId: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      status,
      paymentMethod: 'stripe',
      error: paymentIntent.last_payment_error?.message,
    };
  }

  /**
   * Get GoPay payment status
   */
  private static async getGopayPaymentStatus(paymentId: string): Promise<PaymentResult> {
    const gopayClient = createGopayClient();
    const payment = await gopayClient.getPaymentStatus(parseInt(paymentId));

    let status: PaymentStatus;
    switch (payment.state) {
      case 'PAID':
        status = 'completed';
        break;
      case 'AUTHORIZED':
        status = 'processing';
        break;
      case 'CREATED':
      case 'PAYMENT_METHOD_CHOSEN':
        status = 'pending';
        break;
      case 'CANCELED':
        status = 'cancelled';
        break;
      case 'TIMEOUTED':
      case 'REFUNDED':
      case 'PARTIALLY_REFUNDED':
        status = 'refunded';
        break;
      default:
        status = 'failed';
    }

    return {
      orderId: payment.order_number,
      transactionId: payment.id.toString(),
      amount: payment.amount / 100,
      currency: payment.currency,
      status,
      paymentMethod: 'gopay',
    };
  }

  /**
   * Process webhook notification
   */
  static async processWebhook(
    payload: string | Buffer,
    signature: string,
    paymentMethod: PaymentMethod
  ): Promise<PaymentResult | null> {
    try {
      switch (paymentMethod) {
        case 'stripe':
          return await this.processStripeWebhook(payload, signature);
        case 'gopay':
          return await this.processGopayWebhook(payload as string, signature);
        default:
          throw new Error(`Unsupported payment method: ${paymentMethod}`);
      }
    } catch (error) {
      console.error('Error processing webhook:', error);
      return null;
    }
  }

  /**
   * Process Stripe webhook
   */
  private static async processStripeWebhook(payload: string | Buffer, signature: string): Promise<PaymentResult | null> {
    const { verifyWebhookSignature } = await import('./stripe');

    const event = verifyWebhookSignature(payload, signature, process.env.STRIPE_WEBHOOK_SECRET!);

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const result = await handleStripeSuccess(paymentIntent);

      return {
        orderId: result.orderId,
        transactionId: result.transactionId,
        amount: result.amount,
        currency: result.currency,
        status: 'completed',
        paymentMethod: 'stripe',
      };
    } else if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object;
      const result = await handleStripeFailure(paymentIntent);

      return {
        orderId: result.orderId,
        transactionId: result.transactionId,
        amount: 0,
        currency: 'czk',
        status: 'failed',
        paymentMethod: 'stripe',
        error: result.error,
      };
    }

    return null;
  }

  /**
   * Process GoPay webhook
   */
  private static async processGopayWebhook(payload: string, signature: string): Promise<PaymentResult | null> {
    const gopayClient = createGopayClient();

    if (!gopayClient.verifyNotification(payload, signature)) {
      throw new Error('Invalid GoPay webhook signature');
    }

    const data = JSON.parse(payload);
    const paymentId = data.id;

    if (!paymentId) {
      throw new Error('Payment ID not found in GoPay webhook');
    }

    // Get current payment status
    return await this.getGopayPaymentStatus(paymentId.toString());
  }

  /**
   * Create payment info object for database storage
   */
  static createPaymentInfo(
    paymentMethod: PaymentMethod,
    amount: number,
    currency: string,
    status: PaymentStatus = 'pending',
    transactionId?: string
  ): PaymentInfo {
    return {
      method: paymentMethod,
      amount,
      currency,
      status,
      transactionId,
      processedAt: status === 'completed' ? new Date() : undefined,
    };
  }
}

// Export types and utilities
export * from './stripe';
export * from './gopay';
export { PaymentService as default };
