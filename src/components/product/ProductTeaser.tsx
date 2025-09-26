"use client";

import { useCallback } from "react";
import type { Product } from "@/types/product";
import { type ProductCardActionType, ProductCardLayout } from "./ProductCardLayout";

interface ProductTeaserProps {
  product: Product;
  locale: string;
  onAddToCart?: (product: Product) => void;
  loading?: boolean;
}

export function ProductTeaser({ product, locale, onAddToCart, loading }: ProductTeaserProps) {
  const handleAction = useCallback(
    async (product: Product, actionType: ProductCardActionType) => {
      if (actionType === "addToCart" && onAddToCart) {
        await onAddToCart(product);
      } else if (actionType === "customize") {
        // Navigation is handled by ProductCardLayout's Link component
        return;
      }
    },
    [onAddToCart]
  );

  return (
    <ProductCardLayout
      product={product}
      locale={locale}
      variant="teaser"
      loading={loading ?? false}
      onAction={handleAction}
    />
  );
}
