"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart/context";
import type { Category, Product } from "@/types/product";
import { ProductGrid } from "./ProductGrid";

interface ProductGridWithCartProps {
  initialProducts?: Product[];
  initialCategories?: Category[];
  locale: string;
  className?: string;
}

export function ProductGridWithCart({
  initialProducts = [],
  initialCategories = [],
  locale,
  className,
}: ProductGridWithCartProps) {
  const { addToCart } = useCart();

  const handleAddToCart = async (product: Product) => {
    console.log("🛒 [ProductGridWithCart] Adding product to cart:", product.id);

    const success = await addToCart({
      productId: product.id,
      quantity: 1,
      customizations: [],
    });

    if (success) {
      console.log("✅ [ProductGridWithCart] Successfully added product to cart:", product.id);
    } else {
      console.error("❌ [ProductGridWithCart] Failed to add product to cart:", product.id);
    }
  };

  return (
    <ProductGrid
      initialProducts={initialProducts}
      initialCategories={initialCategories}
      locale={locale}
      className={className}
      onAddToCart={handleAddToCart}
    />
  );
}
