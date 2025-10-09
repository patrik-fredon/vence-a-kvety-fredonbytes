"use client";

import dynamic from "next/dynamic";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

// Dynamic imports for payment components to reduce initial bundle size
export const LazyStripePaymentForm = dynamic(
  () =>
    import("./StripePaymentForm").then((mod) => ({
      default: mod.StripePaymentForm,
    })),
  {
    loading: () => (
      <div className="flex items-center justify-center p-6 border border-stone-200 rounded-lg">
        <LoadingSpinner size="md" />
        <span className="ml-2 text-amber-100">Loading Stripe Payment...</span>
      </div>
    ),
    ssr: false, // Payment forms are interactive and don't need SSR
  }
);

// Dynamic import for Stripe Elements provider
export const LazyStripeElementsProvider = dynamic(
  () =>
    import("@stripe/react-stripe-js").then((mod) => ({
      default: mod.Elements,
    })),
  {
    loading: () => (
      <div className="flex items-center justify-center p-6">
        <LoadingSpinner size="md" />
        <span className="ml-2 text-amber-100">Loading Payment Provider...</span>
      </div>
    ),
    ssr: false,
  }
);

// Lazy load Stripe Embedded Checkout component
export const LazyStripeEmbeddedCheckout = dynamic(
  () =>
    import("./StripeEmbeddedCheckout").then((mod) => ({
      default: mod.StripeEmbeddedCheckout,
    })),
  {
    loading: () => (
      <div className="flex flex-col items-center justify-center p-6 border border-stone-200 rounded-lg min-h-[600px]">
        <LoadingSpinner size="lg" />
        <span className="ml-2 text-stone-600">Loading Checkout...</span>
      </div>
    ),
    ssr: false, // Embedded checkout is interactive and doesn't need SSR
  }
);
