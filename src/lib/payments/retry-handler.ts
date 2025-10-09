/**
 * Retry handler utility with exponential backoff
 * Provides configurable retry logic for payment operations
 */

export interface RetryOptions {
  /**
   * Maximum number of retry attempts
   * @default 3
   */
  maxRetries?: number;

  /**
   * Initial delay in milliseconds before first retry
   * @default 1000
   */
  delayMs?: number;

  /**
   * Backoff multiplier for exponential backoff
   * @default 2
   */
  backoff?: number;

  /**
   * Function to determine if an error should trigger a retry
   * @default () => true
   */
  shouldRetry?: (error: unknown) => boolean;

  /**
   * Callback function called before each retry attempt
   */
  onRetry?: (attempt: number, error: unknown) => void;
}

/**
 * Executes a function with retry logic and exponential backoff
 *
 * @param fn - The async function to execute
 * @param options - Retry configuration options
 * @returns Promise resolving to the function's result
 * @throws The last error if all retries are exhausted
 *
 * @example
 * ```typescript
 * const result = await withRetry(
 *   async () => await stripe.paymentIntents.create({...}),
 *   {
 *     maxRetries: 3,
 *     delayMs: 1000,
 *     backoff: 2,
 *     shouldRetry: (error) => error instanceof Stripe.errors.StripeConnectionError
 *   }
 * );
 * ```
 */
export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const {
    maxRetries = 3,
    delayMs = 1000,
    backoff = 2,
    shouldRetry = () => true,
    onRetry,
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry if we've exhausted attempts or if shouldRetry returns false
      if (attempt === maxRetries || !shouldRetry(error)) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = delayMs * backoff ** attempt;

      // Call onRetry callback if provided
      if (onRetry) {
        onRetry(attempt + 1, error);
      }

      // Log retry attempt
      console.log(
        `[Retry] Attempt ${attempt + 1}/${maxRetries} failed. Retrying in ${delay}ms...`,
        error instanceof Error ? error.message : String(error)
      );

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError;
}

/**
 * Determines if a Stripe error is retryable
 * Network errors and rate limit errors are typically retryable
 */
export function isRetryableStripeError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const errorType = (error as { type?: string }).type;

  // Retry on network errors, rate limit errors, and API errors
  return (
    errorType === "StripeConnectionError" ||
    errorType === "StripeAPIError" ||
    errorType === "StripeRateLimitError"
  );
}
