'use client';

import { useState, useCallback, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useTranslations } from 'next-intl';

// Initialize Stripe outside component to avoid recreating on each render
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface StripeEmbeddedCheckoutProps {
  clientSecret: string;
  onComplete?: () => void;
  onError?: (error: Error) => void;
  locale: 'cs' | 'en';
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
  const t = useTranslations('checkout');
  const [isLoading, setIsLoading] = useState(true);
  const [loadTimeout, setLoadTimeout] = useState(false);
  const [stripeLoadError, setStripeLoadError] = useState<Error | null>(null);

  // Memoize the fetchClientSecret function to prevent unnecessary re-renders
  const fetchClientSecret = useCallback(async () => {
    return clientSecret;
  }, [clientSecret]);

  // Handle successful checkout completion
  const handleComplete = useCallback(() => {
    setIsLoading(false);
    onComplete?.();
  }, [onComplete]);

  // Handle checkout errors
  const handleError = useCallback((error: Error) => {
    setIsLoading(false);
    setStripeLoadError(error);
    onError?.(error);
  }, [onError]);

  // Set up timeout for Stripe SDK loading (30 seconds)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        setLoadTimeout(true);
        const timeoutError = new Error('Stripe SDK loading timeout');
        handleError(timeoutError);
      }
    }, 30000); // 30 second timeout

    return () => clearTimeout(timeoutId);
  }, [isLoading, handleError]);

  // Handle retry after timeout
  const handleRetry = useCallback(() => {
    setLoadTimeout(false);
    setStripeLoadError(null);
    setIsLoading(true);
    // Reload the page to retry Stripe SDK loading
    window.location.reload();
  }, []);

  // Show timeout error state
  if (loadTimeout || stripeLoadError) {
    return (
      <div className="stripe-embedded-checkout-container relative min-h-[600px] flex flex-col items-center justify-center bg-stone-50 border border-stone-200 rounded-lg p-8">
        <div className="text-center max-w-md">
          <div className="text-red-600 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
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
            {t('error.generic')}
          </h3>
          <p className="text-stone-600 mb-6">
            {loadTimeout
              ? t('error.sessionExpired')
              : stripeLoadError?.message || t('error.network')}
          </p>
          <button
            onClick={handleRetry}
            className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            {locale === 'cs' ? 'Zkusit znovu' : 'Try Again'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="stripe-embedded-checkout-container relative min-h-[600px]">
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-50 z-10 rounded-lg">
          <LoadingSpinner size="lg" locale={locale} />
          <p className="mt-4 text-stone-600 text-sm">
            {t('loading')}
          </p>
          <p className="mt-2 text-stone-500 text-xs">
            {locale === 'cs' 
              ? 'Připojování k platební bráně...' 
              : 'Connecting to payment gateway...'}
          </p>
        </div>
      )}
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
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
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
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
