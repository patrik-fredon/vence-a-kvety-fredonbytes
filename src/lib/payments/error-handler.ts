/**
 * Comprehensive error handling for Stripe payment operations
 * Sanitizes errors and provides user-friendly messages
 */

import Stripe from "stripe";

/**
 * Error categories for payment errors
 */
export enum PaymentErrorCategory {
  CARD_ERROR = "card_error",
  VALIDATION_ERROR = "validation_error",
  API_ERROR = "api_error",
  NETWORK_ERROR = "network_error",
  AUTHENTICATION_ERROR = "authentication_error",
  RATE_LIMIT_ERROR = "rate_limit_error",
  UNKNOWN_ERROR = "unknown_error",
}

/**
 * Sanitized error response
 */
export interface SanitizedError {
  message: string;
  category: PaymentErrorCategory;
  code?: string;
  declineCode?: string;
  userMessage: string;
}

/**
 * Sanitizes Stripe errors for safe display to users
 * Removes sensitive information and provides user-friendly messages
 *
 * @param error - The error to sanitize
 * @param locale - The locale for error messages (default: 'cs')
 * @returns Sanitized error object
 *
 * @example
 * ```typescript
 * try {
 *   await stripe.paymentIntents.create({...});
 * } catch (error) {
 *   const sanitized = sanitizeStripeError(error);
 *   return { error: sanitized.userMessage };
 * }
 * ```
 */
export function sanitizeStripeError(error: unknown, locale: "cs" | "en" = "cs"): SanitizedError {
  // Handle Stripe card errors - safe to show to user
  if (error instanceof Stripe.errors.StripeCardError) {
    return {
      message: error.message,
      category: PaymentErrorCategory.CARD_ERROR,
      ...(error.code ? { code: error.code } : {}),
      declineCode: error.decline_code,
      userMessage: getCardErrorMessage(error, locale),
    };
  }

  // Handle invalid request errors - don't expose details
  if (error instanceof Stripe.errors.StripeInvalidRequestError) {
    console.error("[Payment] Invalid Stripe request:", error);
    return {
      message: "Invalid payment configuration",
      category: PaymentErrorCategory.VALIDATION_ERROR,
      ...(error.code ? { code: error.code } : {}),
      userMessage: getErrorMessage("invalid_request", locale),
    };
  }

  // Handle API errors - temporary issues
  if (error instanceof Stripe.errors.StripeAPIError) {
    console.error("[Payment] Stripe API error:", error);
    return {
      message: "Payment service error",
      category: PaymentErrorCategory.API_ERROR,
      ...(error.code ? { code: error.code } : {}),
      userMessage: getErrorMessage("api_error", locale),
    };
  }

  // Handle connection errors
  if (error instanceof Stripe.errors.StripeConnectionError) {
    console.error("[Payment] Stripe connection error:", error);
    return {
      message: "Connection error",
      category: PaymentErrorCategory.NETWORK_ERROR,
      userMessage: getErrorMessage("connection_error", locale),
    };
  }

  // Handle authentication errors - critical
  if (error instanceof Stripe.errors.StripeAuthenticationError) {
    console.error("[Payment] Stripe authentication error:", error);
    return {
      message: "Authentication error",
      category: PaymentErrorCategory.AUTHENTICATION_ERROR,
      userMessage: getErrorMessage("authentication_error", locale),
    };
  }

  // Handle rate limit errors
  if (error instanceof Stripe.errors.StripeRateLimitError) {
    console.error("[Payment] Stripe rate limit error:", error);
    return {
      message: "Rate limit exceeded",
      category: PaymentErrorCategory.RATE_LIMIT_ERROR,
      userMessage: getErrorMessage("rate_limit", locale),
    };
  }

  // Handle unknown errors - don't expose details
  console.error("[Payment] Unknown payment error:", error);
  return {
    message: "Unknown error",
    category: PaymentErrorCategory.UNKNOWN_ERROR,
    userMessage: getErrorMessage("unknown", locale),
  };
}

/**
 * Gets user-friendly error message for card errors
 */
function getCardErrorMessage(error: Stripe.errors.StripeCardError, locale: "cs" | "en"): string {
  const code = error.code || error.decline_code;

  const messages: Record<string, Record<"cs" | "en", string>> = {
    card_declined: {
      cs: "Vaše karta byla zamítnuta. Zkuste prosím jinou kartu nebo kontaktujte svou banku.",
      en: "Your card was declined. Please try another card or contact your bank.",
    },
    insufficient_funds: {
      cs: "Na kartě není dostatek prostředků. Zkuste prosím jinou kartu.",
      en: "Insufficient funds on the card. Please try another card.",
    },
    expired_card: {
      cs: "Platnost vaší karty vypršela. Zkuste prosím jinou kartu.",
      en: "Your card has expired. Please try another card.",
    },
    incorrect_cvc: {
      cs: "Nesprávný bezpečnostní kód (CVC). Zkontrolujte prosím zadané údaje.",
      en: "Incorrect security code (CVC). Please check your details.",
    },
    processing_error: {
      cs: "Při zpracování platby došlo k chybě. Zkuste to prosím znovu.",
      en: "An error occurred while processing the payment. Please try again.",
    },
    incorrect_number: {
      cs: "Nesprávné číslo karty. Zkontrolujte prosím zadané údaje.",
      en: "Incorrect card number. Please check your details.",
    },
    invalid_expiry_month: {
      cs: "Neplatný měsíc expirace. Zkontrolujte prosím zadané údaje.",
      en: "Invalid expiration month. Please check your details.",
    },
    invalid_expiry_year: {
      cs: "Neplatný rok expirace. Zkontrolujte prosím zadané údaje.",
      en: "Invalid expiration year. Please check your details.",
    },
    authentication_required: {
      cs: "Tato platba vyžaduje ověření. Postupujte prosím podle pokynů vaší banky.",
      en: "This payment requires authentication. Please follow your bank's instructions.",
    },
  };

  if (code) {
    const message = messages[code]?.[locale];
    if (message) return message;
  }

  // Fallback to generic card error message
  return locale === "cs"
    ? "Platbu se nepodařilo zpracovat. Zkuste prosím jinou kartu nebo kontaktujte svou banku."
    : "Unable to process payment. Please try another card or contact your bank.";
}

/**
 * Gets user-friendly error message for general errors
 */
function getErrorMessage(errorType: string, locale: "cs" | "en"): string {
  const messages: Record<string, Record<"cs" | "en", string>> = {
    invalid_request: {
      cs: "Chyba konfigurace platby. Kontaktujte prosím podporu.",
      en: "Payment configuration error. Please contact support.",
    },
    api_error: {
      cs: "Platební služba je dočasně nedostupná. Zkuste to prosím znovu.",
      en: "Payment service temporarily unavailable. Please try again.",
    },
    connection_error: {
      cs: "Chyba připojení. Zkontrolujte prosím své internetové připojení a zkuste to znovu.",
      en: "Connection error. Please check your internet connection and try again.",
    },
    authentication_error: {
      cs: "Chyba platebního systému. Kontaktujte prosím podporu.",
      en: "Payment system error. Please contact support.",
    },
    rate_limit: {
      cs: "Příliš mnoho pokusů. Zkuste to prosím za chvíli.",
      en: "Too many attempts. Please try again in a moment.",
    },
    unknown: {
      cs: "Došlo k neočekávané chybě. Zkuste to prosím znovu nebo kontaktujte podporu.",
      en: "An unexpected error occurred. Please try again or contact support.",
    },
  };

  return messages[errorType]?.[locale] || messages['unknown']?.[locale] || "An unknown error occurred";
}

/**
 * Logs payment error with context
 */
export function logPaymentError(
  error: unknown,
  context: {
    orderId?: string;
    amount?: number;
    currency?: string;
    operation: string;
  }
): void {
  const sanitized = sanitizeStripeError(error);

  console.error("[Payment Error]", {
    ...context,
    category: sanitized.category,
    code: sanitized.code,
    declineCode: sanitized.declineCode,
    message: sanitized.message,
    timestamp: new Date().toISOString(),
  });
}
