/**
 * Stripe Error Handler
 * Provides error handling and retry logic for Stripe operations
 */

import Stripe from "stripe";

/**
 * Localized error messages
 */
interface LocalizedMessage {
  cs: string;
  en: string;
}

/**
 * Custom checkout error class with localized messages
 */
export class CheckoutError extends Error {
  constructor(
    message: string,
    public code: string,
    public userMessage: LocalizedMessage,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = "CheckoutError";
  }
}

/**
 * Handles Stripe errors and converts them to CheckoutError
 * 
 * @param error - The error to handle
 * @param locale - The locale for error messages
 * @returns CheckoutError with localized message
 * 
 * @example
 * ```typescript
 * try {
 *   await stripe.checkout.sessions.create({...});
 * } catch (error) {
 *   const checkoutError = handleStripeError(error, 'cs');
 *   throw checkoutError;
 * }
 * ```
 */
export function handleStripeError(
  error: unknown,
  locale: "cs" | "en" = "cs"
): CheckoutError {
  if (error instanceof Stripe.errors.StripeError) {
    switch (error.type) {
      case "StripeCardError":
        return new CheckoutError(
          error.message,
          "CARD_ERROR",
          {
            cs: "Platba byla zamítnuta. Zkontrolujte údaje karty.",
            en: "Payment was declined. Please check your card details.",
          },
          true
        );

      case "StripeInvalidRequestError":
        return new CheckoutError(
          error.message,
          "INVALID_REQUEST",
          {
            cs: "Neplatný požadavek. Zkuste to prosím znovu.",
            en: "Invalid request. Please try again.",
          },
          false
        );

      case "StripeAPIError":
      case "StripeConnectionError":
        return new CheckoutError(
          error.message,
          "NETWORK_ERROR",
          {
            cs: "Problém s připojením. Zkuste to prosím znovu.",
            en: "Connection problem. Please try again.",
          },
          true
        );

      case "StripeAuthenticationError":
        return new CheckoutError(
          error.message,
          "AUTH_ERROR",
          {
            cs: "Chyba autentizace. Kontaktujte prosím podporu.",
            en: "Authentication error. Please contact support.",
          },
          false
        );

      case "StripeRateLimitError":
        return new CheckoutError(
          error.message,
          "RATE_LIMIT",
          {
            cs: "Příliš mnoho požadavků. Zkuste to prosím za chvíli.",
            en: "Too many requests. Please try again in a moment.",
          },
          true
        );

      default:
        return new CheckoutError(
          error.message,
          "STRIPE_ERROR",
          {
            cs: "Nastala chyba při zpracování platby.",
            en: "An error occurred while processing payment.",
          },
          false
        );
    }
  }

  // Handle non-Stripe errors
  if (error instanceof Error) {
    return new CheckoutError(
      error.message,
      "UNKNOWN_ERROR",
      {
        cs: "Nastala neočekávaná chyba.",
        en: "An unexpected error occurred.",
      },
      false
    );
  }

  return new CheckoutError(
    "Unknown error",
    "UNKNOWN_ERROR",
    {
      cs: "Nastala neočekávaná chyba.",
      en: "An unexpected error occurred.",
    },
    false
  );
}

/**
 * Retry configuration options
 */
interface RetryOptions {
  maxRetries?: number;
  delayMs?: number;
  backoffMultiplier?: number;
  shouldRetry?: (error: unknown) => boolean;
}

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  delayMs: 1000,
  backoffMultiplier: 2,
  shouldRetry: (error: unknown) => {
    if (error instanceof CheckoutError) {
      return error.retryable;
    }
    if (error instanceof Stripe.errors.StripeError) {
      return (
        error.type === "StripeAPIError" ||
        error.type === "StripeConnectionError" ||
        error.type === "StripeRateLimitError"
      );
    }
    return false;
  },
};

/**
 * Executes a function with retry logic and exponential backoff
 * 
 * @param fn - The function to execute
 * @param options - Retry configuration options
 * @returns The result of the function
 * @throws The last error if all retries fail
 * 
 * @example
 * ```typescript
 * const session = await withRetry(
 *   async () => {
 *     return await stripe.checkout.sessions.create({...});
 *   },
 *   {
 *     maxRetries: 3,
 *     delayMs: 1000,
 *     backoffMultiplier: 2
 *   }
 * );
 * ```
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: unknown;

  for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Check if we should retry
      if (!config.shouldRetry(error)) {
        throw error;
      }

      // Don't retry if this was the last attempt
      if (attempt >= config.maxRetries) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay =
        config.delayMs * Math.pow(config.backoffMultiplier, attempt - 1);

      console.log(
        `⚠️ [Stripe] Retry attempt ${attempt}/${config.maxRetries} after ${delay}ms`,
        error instanceof Error ? error.message : String(error)
      );

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // All retries failed
  throw lastError;
}
