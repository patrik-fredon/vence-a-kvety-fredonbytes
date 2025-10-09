"use client";

import dynamic from "next/dynamic";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

// Dynamic import for DeliveryMethodSelector to reduce initial bundle size
export const LazyDeliveryMethodSelector = dynamic(
  () =>
    import("./DeliveryMethodSelector").then((mod) => ({
      default: mod.DeliveryMethodSelector,
    })),
  {
    loading: () => (
      <div className="flex items-center justify-center p-6 border border-stone-200 rounded-lg">
        <LoadingSpinner size="md" />
        <span className="ml-2 text-stone-600">Loading delivery options...</span>
      </div>
    ),
    ssr: false, // Delivery method selector is interactive and doesn't need SSR
  }
);
