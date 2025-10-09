/**
 * Hook for handling checkout completion
 * Provides client-side interface for checkout completion logic
 */

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

interface UseCheckoutCompletionOptions {
  locale: string;
  onSuccess?: (orderId: string) => void;
  onError?: (error: string) => void;
}

interface CheckoutCompletionState {
  isProcessing: boolean;
  error: string | null;
}

/**
 * Hook for handling checkout completion
 * Manages the completion flow after successful payment
 */
export function useCheckoutCompletion({
  locale,
  onSuccess,
  onError,
}: UseCheckoutCompletionOptions) {
  const router = useRouter();
  const [state, setState] = useState<CheckoutCompletionState>({
    isProcessing: false,
    error: null,
  });

  /**
   * Handle checkout completion
   * Called after successful payment from Stripe
   */
  const handleComplete = useCallback(
    async (sessionId: string, orderId: string) => {
      setState({ isProcessing: true, error: null });

      try {
        // Call API to handle completion
        const response = await fetch("/api/checkout/complete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionId,
            orderId,
          }),
        });

        const data = await response.json();

        if (!(response.ok && data.success)) {
          throw new Error(data.error || "Failed to complete checkout");
        }

        // Clear cart
        await fetch("/api/cart", { method: "DELETE" });

        // Call success callback if provided
        if (onSuccess) {
          onSuccess(orderId);
        }

        // Redirect to success page
        router.push(`/${locale}/checkout/success?orderId=${orderId}`);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error during checkout completion";

        setState({ isProcessing: false, error: errorMessage });

        // Call error callback if provided
        if (onError) {
          onError(errorMessage);
        }

        console.error("Checkout completion error:", error);
      }
    },
    [locale, router, onSuccess, onError]
  );

  /**
   * Handle checkout cancellation
   * Called when user cancels the payment
   */
  const handleCancel = useCallback(
    async (sessionId: string, orderId?: string) => {
      try {
        // Call API to handle cancellation
        await fetch("/api/checkout/cancel", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionId,
            orderId,
          }),
        });

        // Redirect to cart or checkout page
        router.push(`/${locale}/cart`);
      } catch (error) {
        console.error("Checkout cancellation error:", error);
        // Still redirect even if API call fails
        router.push(`/${locale}/cart`);
      }
    },
    [locale, router]
  );

  /**
   * Reset error state
   */
  const resetError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    handleComplete,
    handleCancel,
    resetError,
    isProcessing: state.isProcessing,
    error: state.error,
  };
}
