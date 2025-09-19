/**
 * GoPay payment integration for Czech market
 */

export interface GopayConfig {
  clientId: string;
  clientSecret: string;
  environment: "sandbox" | "production";
}

export interface GopayPaymentRequest {
  amount: number; // Amount in cents
  currency: string;
  orderId: string;
  customerEmail: string;
  customerName: string;
  returnUrl: string;
  notifyUrl: string;
  description: string;
  lang?: "CS" | "EN";
}

export interface GopayPaymentResponse {
  id: number;
  order_number: string;
  state: string;
  amount: number;
  currency: string;
  payment_instrument?: string;
  payer?: {
    payment_card?: any;
    bank_account?: any;
  };
  target: {
    type: string;
    goid: number;
  };
  additional_params?: any[];
  lang: string;
  gw_url: string;
}

export interface GopayAccessToken {
  token_type: string;
  access_token: string;
  expires_in: number;
}

/**
 * GoPay API client
 */
export class GopayClient {
  private config: GopayConfig;
  private baseUrl: string;
  private accessToken?: string;
  private tokenExpiry?: number;

  constructor(config: GopayConfig) {
    this.config = config;
    this.baseUrl =
      config.environment === "production"
        ? "https://gate.gopay.cz/api"
        : "https://gw.sandbox.gopay.com/api";
  }

  /**
   * Get access token for API authentication
   */
  private async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const credentials = Buffer.from(
        `${this.config.clientId}:${this.config.clientSecret}`
      ).toString("base64");

      const response = await fetch(`${this.baseUrl}/oauth2/token`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${credentials}`,
        },
        body: "grant_type=client_credentials&scope=payment-create",
      });

      if (!response.ok) {
        throw new Error(`GoPay authentication failed: ${response.statusText}`);
      }

      const tokenData: GopayAccessToken = await response.json();

      this.accessToken = tokenData.access_token;
      this.tokenExpiry = Date.now() + tokenData.expires_in * 1000 - 60000; // Subtract 1 minute for safety

      return this.accessToken;
    } catch (error) {
      console.error("Error getting GoPay access token:", error);
      throw new Error("Failed to authenticate with GoPay");
    }
  }

  /**
   * Create a payment
   */
  async createPayment(paymentRequest: GopayPaymentRequest): Promise<GopayPaymentResponse> {
    try {
      const token = await this.getAccessToken();

      const paymentData = {
        payer: {
          default_payment_instrument: "BANK_ACCOUNT",
          allowed_payment_instruments: [
            "BANK_ACCOUNT",
            "PAYMENT_CARD",
            "PAYPAL",
            "GPAY",
            "APPLE_PAY",
          ],
          contact: {
            first_name: paymentRequest.customerName.split(" ")[0] || "",
            last_name: paymentRequest.customerName.split(" ").slice(1).join(" ") || "",
            email: paymentRequest.customerEmail,
          },
        },
        target: {
          type: "ACCOUNT",
          goid: parseInt(this.config.clientId),
        },
        amount: Math.round(paymentRequest.amount * 100), // Convert to cents
        currency: paymentRequest.currency.toUpperCase(),
        order_number: paymentRequest.orderId,
        order_description: paymentRequest.description,
        items: [
          {
            name: paymentRequest.description,
            amount: Math.round(paymentRequest.amount * 100),
            count: 1,
          },
        ],
        callback: {
          return_url: paymentRequest.returnUrl,
          notification_url: paymentRequest.notifyUrl,
        },
        additional_params: [
          {
            name: "order_id",
            value: paymentRequest.orderId,
          },
        ],
        lang: paymentRequest.lang || "CS",
      };

      const response = await fetch(`${this.baseUrl}/payments/payment`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("GoPay payment creation failed:", errorData);
        throw new Error(`GoPay payment creation failed: ${response.statusText}`);
      }

      const paymentResponse: GopayPaymentResponse = await response.json();
      return paymentResponse;
    } catch (error) {
      console.error("Error creating GoPay payment:", error);
      throw new Error("Failed to create GoPay payment");
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId: number): Promise<GopayPaymentResponse> {
    try {
      const token = await this.getAccessToken();

      const response = await fetch(`${this.baseUrl}/payments/payment/${paymentId}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get payment status: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error getting GoPay payment status:", error);
      throw new Error("Failed to get payment status");
    }
  }

  /**
   * Verify payment notification signature
   */
  verifyNotification(payload: string, signature: string): boolean {
    try {
      const crypto = require("crypto");
      const expectedSignature = crypto
        .createHmac("sha1", this.config.clientSecret)
        .update(payload)
        .digest("hex");

      return signature === expectedSignature;
    } catch (error) {
      console.error("Error verifying GoPay notification:", error);
      return false;
    }
  }
}

/**
 * Create GoPay client instance
 */
export function createGopayClient(): GopayClient {
  const clientId = process.env.GOPAY_CLIENT_ID;
  const clientSecret = process.env.GOPAY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "GoPay configuration is missing. Please set GOPAY_CLIENT_ID and GOPAY_CLIENT_SECRET environment variables."
    );
  }

  const config: GopayConfig = {
    clientId,
    clientSecret,
    environment: process.env.NODE_ENV === "production" ? "production" : "sandbox",
  };

  return new GopayClient(config);
}

/**
 * Handle successful GoPay payment
 */
export async function handleGopaySuccess(paymentData: GopayPaymentResponse) {
  const orderId = paymentData.order_number;

  console.log(`GoPay payment successful for order ${orderId}`);

  return {
    orderId,
    transactionId: paymentData.id.toString(),
    amount: paymentData.amount / 100,
    currency: paymentData.currency,
    paymentInstrument: paymentData.payment_instrument,
  };
}

/**
 * Handle failed GoPay payment
 */
export async function handleGopayFailure(paymentData: GopayPaymentResponse) {
  const orderId = paymentData.order_number;

  console.log(`GoPay payment failed for order ${orderId}:`, paymentData.state);

  return {
    orderId,
    transactionId: paymentData.id.toString(),
    error: `Payment failed with state: ${paymentData.state}`,
  };
}
