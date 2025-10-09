"use client";

/**
 * Stripe Embedded Checkout Component
 *
 * Provides a modern, embedded payment experience using Stripe's Embedded Checkout.
 * This component handles:
 * - Lazy loading of Stripe SDK for optimal performance
 * - Loading states and timeout handling
 * - Error handling with user-friendly messages
 * - Payment completion callbacks
 * - Localized UI based on user locale
 *
 * Features:
 * - No redirect to external Stripe pages
 * - Consistent branding and UX
 * - Built-in 3D Secure support
 * - Automatic retry for recoverable errors
 * - Timeout handling for slow connections
 *
 * Requirements: 3.5, 3.6, 3.13, 3.14, 3.15, 6.6, 6.7, 6.8, 7.1, 7.2, 7.3, 7.7, 8.7
 *
 * @module components/payments/StripeEmbeddedCheckout
 */

import type { Stripe } from "@stripe/stripe-js";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

// Lazy load Stripe SDK only when component is rendered
let stripePromise: Promise<Stripe | null> | null = null;

const getStripe = () => {
  if (!stripePromise) {
    stripePromise = import("@stripe/stripe-js").then((mod) =>
      mod.loadStripe(process.env['NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY']!)
    );
  }
  return stripePromise;
};

interface StripeEmbeddedCheckoutProps {
  clientSecret: string;
  onComplete?: () => void;
  onError?: (error: Error) => void;
  locale: "cs" | "en";
}

/**
 * StripeEmbeddedCheckout Component
 *
 * Renders Stripe's Embedded Checkout interface for seamless payment processing.
 * Integrates with Stripe's EmbeddedCheckoutProvider and handles loading states,
 * completion callbacks, and error handling.
 *
 * @param clientSecret - The client secret from Stripe checkout session
 * @param onComplete - Callback fired when checkout is completed successfully
 * @param onError - Callback fired when an error occurs during checkout
 * @param locale - Current locale for translations (cs or en)
 */
export function StripeEmbeddedCheckout({
  clientSecret,
  onComplete,
  onError,
  locale,
}: StripeEmbeddedCheckoutProps) {
  const t = useTranslations("checkout");
  const [isLoading, setIsLoading] = useState(true);
  const [loadTimeout, setLoadTimeout] = useState(false);
  const [checkoutError, setCheckoutError] = useState<{
    message: string;
    retryable: boolean;
    code: string;
  } | null>(null);

  // Memoize the fetchClientSecret function to prevent unnecessary re-renders
  const fetchClientSecret = useCallback(async () => {
    return clientSecret;
  }, [clientSecret]);

  // Handle successful checkout completion
  const handleComplete = useCallback(() => {
    setIsLoading(false);
    setCheckoutError(null);
    onComplete?.();
  }, [onComplete]);

  // Handle checkout errors from Stripe Embedded Checkout
  // Note: Stripe's EmbeddedCheckout component doesn't support onError prop directly
  // Errors are handled through the EmbeddedCheckoutProvider and completion callbacks
  // const handleEmbeddedCheckoutError = useCallback((error: { error?: { message?: string } }) => {
  //   setIsLoading(false);
  //
  //   const errorMessage = error?.error?.message || 'Unknown error occurred';
  //   const isRetryable =
  //     errorMessage.includes('network') ||
  //     errorMessage.includes('connection') ||
  //     errorMessage.includes('timeout') ||
  //     errorMessage.includes('rate limit');
  //
  //   const checkoutErr = {
  //     message: errorMessage,
  //     retryable: isRetryable,
  //     code: 'STRIPE_EMBEDDED_ERROR',
  //   };
  //
  //   setCheckoutError(checkoutErr);
  //
  //   if (onError) {
  //     const error = new Error(errorMessage);
  //     onError(error);
  //   }
  // }, [onError]);

  // Handle general errors (timeout, SDK loading failures)
  const handleGeneralError = useCallback(
    (error: Error, retryable: boolean = true) => {
      setIsLoading(false);
      setCheckoutError({
        message: error.message,
        retryable,
        code: "GENERAL_ERROR",
      });
      onError?.(error);
    },
    [onError]
  );

  // Set up timeout for Stripe SDK loading (30 seconds)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isLoading && !checkoutError) {
        setLoadTimeout(true);
        const timeoutError = new Error("Stripe SDK loading timeout");
        handleGeneralError(timeoutError, true);
      }
    }, 30000); // 30 second timeout

    return () => clearTimeout(timeoutId);
  }, [isLoading, checkoutError, handleGeneralError]);

  // Handle retry after error
  const handleRetry = useCallback(() => {
    setLoadTimeout(false);
    setCheckoutError(null);
    setIsLoading(true);
    // Reload the page to retry Stripe SDK loading and checkout
    window.location.reload();
  }, []);

  // Get user-friendly error message based on error type
  const getUserErrorMessage = useCallback(() => {
    if (!checkoutError) return "";

    const errorMsg = checkoutError.message.toLowerCase();

    // Map error messages to translation keys
    if (errorMsg.includes("card") || errorMsg.includes("declined")) {
      return t("error.card");
    }
    if (errorMsg.includes("network") || errorMsg.includes("connection")) {
      return t("error.network");
    }
    if (errorMsg.includes("expired") || errorMsg.includes("timeout")) {
      return t("error.sessionExpired");
    }

    // Default to generic error message
    return t("error.generic");
  }, [checkoutError, t]);

  // Show error state
  if (checkoutError || loadTimeout) {
    return (
      <div className="stripe-embedded-checkout-container relative min-h-[600px] flex flex-col items-center justify-center bg-stone-50 border border-stone-200 rounded-lg p-8">
        <div className="text-center max-w-md">
          <div className="text-red-600 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-stone-900 mb-2">
            {locale === "cs" ? "Chyba při platbě" : "Payment Error"}
          </h3>
          <p className="text-stone-600 mb-6">{getUserErrorMessage()}</p>

          {/* Show retry button only for retryable errors */}
          {(checkoutError?.retryable || loadTimeout) && (
            <button
              onClick={handleRetry}
              className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              aria-label={locale === "cs" ? "Zkusit znovu" : "Try again"}
            >
              {locale === "cs" ? "Zkusit znovu" : "Try Again"}
            </button>
          )}

          {/* Show contact support message for non-retryable errors */}
          {checkoutError && !checkoutError.retryable && (
            <div className="mt-4">
              <p className="text-sm text-stone-500">
                {locale === "cs"
                  ? "Pokud problém přetrvává, kontaktujte prosím naši podporu."
                  : "If the problem persists, please contact our support."}
              </p>
              <button
                onClick={() => (window.location.href = `/${locale}/contact`)}
                className="mt-3 px-6 py-3 bg-stone-600 text-white rounded-lg hover:bg-stone-700 transition-colors focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
              >
                {locale === "cs" ? "Kontaktovat podporu" : "Contact Support"}
              </button>
            </div>
          )}

          {/* Show technical error details in development */}
          {process.env['NODE_ENV'] === "development" && checkoutError && (
            <details className="mt-6 text-left">
              <summary className="text-xs text-stone-500 cursor-pointer hover:text-stone-700">
                Technical Details
              </summary>
              <pre className="mt-2 text-xs text-stone-600 bg-stone-100 p-3 rounded overflow-auto">
                {JSON.stringify(checkoutError, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  }

  // Lazy load Stripe components
  const [StripeComponents, setStripeComponents] = useState<{
    EmbeddedCheckoutProvider: any;
    EmbeddedCheckout: any;
  } | null>(null);

  useEffect(() => {
    import("@stripe/react-stripe-js")
      .then((mod) => {
        setStripeComponents({
          EmbeddedCheckoutProvider: mod.EmbeddedCheckoutProvider,
          EmbeddedCheckout: mod.EmbeddedCheckout,
        });
      })
      .catch((_error) => {
        handleGeneralError(new Error("Failed to load Stripe SDK"), true);
      });
  }, [handleGeneralError]);

  if (!StripeComponents) {
    return (
      <div className="stripe-embedded-checkout-container relative min-h-[600px] flex items-center justify-center">
        <LoadingSpinner size="lg" locale={locale} />
        <p className="ml-4 text-stone-600">{t("loading")}</p>
      </div>
    );
  }

  const { EmbeddedCheckoutProvider, EmbeddedCheckout } = StripeComponents;

  return (
    <div className="stripe-embedded-checkout-container relative min-h-[600px]">
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-50 z-10 rounded-lg">
          <LoadingSpinner size="lg" locale={locale} />
          <p className="mt-4 text-stone-600 text-sm">{t("loading")}</p>
          <p className="mt-2 text-stone-500 text-xs">
            {locale === "cs"
              ? "Připojování k platební bráně..."
              : "Connecting to payment gateway..."}
          </p>
        </div>
      )}
      <EmbeddedCheckoutProvider
        stripe={getStripe()}
        options={{
          fetchClientSecret,
          onComplete: handleComplete,
        }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
