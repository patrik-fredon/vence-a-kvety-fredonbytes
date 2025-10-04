"use client";

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

  const handleAddToCart = (product: Product) => {
    console.log("🛒 [ProductGridWithCart] Adding product to cart:", product.id);

    // Execute the async addToCart operation without awaiting
    addToCart({
      productId: product.id,
      quantity: 1,
      customizations: [],
    })
      .then((success) => {
        if (success) {
          console.log("✅ [ProductGridWithCart] Successfully added product to cart:", product.id);
        } else {
          console.error("❌ [ProductGridWithCart] Failed to add product to cart:", product.id);
        }
      })
      .catch((error) => {
        console.error("❌ [ProductGridWithCart] Error adding product to cart:", product.id, error);
      });
  };

  return (
    <ProductGrid
      initialProducts={initialProducts}
      initialCategories={initialCategories}
      locale={locale}
      {...(className && { className })}
      onAddToCart={handleAddToCart}
    />
  );
}
