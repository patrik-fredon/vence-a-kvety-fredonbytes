"use client";

import dynamic from "next/dynamic";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { Product } from "@/types/product";

// Dynamic import for ProductQuickView to reduce initial bundle size
const ProductQuickView = dynamic(
  () => import("./ProductQuickView").then((mod) => ({ default: mod.ProductQuickView })),
  {
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="md" />
      </div>
    ),
    ssr: false, // Quick view is interactive and doesn't need SSR
  }
);

interface LazyProductQuickViewProps {
  product: Product;
  locale: string;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (product: Product) => void;
}

export function LazyProductQuickView(props: LazyProductQuickViewProps) {
  // Only render the component when the modal is open to save bundle size
  if (!props.isOpen) {
    return null;
  }

  return <ProductQuickView {...props} />;
}
