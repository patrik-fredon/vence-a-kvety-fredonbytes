"use client";

import { useState } from "react";
import { Product, Category } from "@/types/product";
import { ProductGrid } from "./ProductGrid";
import { useCart } from "@/lib/cart/context";

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

  // State for favorite products (in a real app, this would come from user preferences/API)
  const [favoriteProductIds, setFavoriteProductIds] = useState<string[]>([]);

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

  const handleToggleFavorite = (productId: string) => {
    console.log("❤️ [ProductGridWithCart] Toggling favorite for product:", productId);

    setFavoriteProductIds(prev => {
      if (prev.includes(productId)) {
        // Remove from favorites
        return prev.filter(id => id !== productId);
      } else {
        // Add to favorites
        return [...prev, productId];
      }
    });

    // In a real app, you would also sync this with the backend/user preferences
    // Example: await updateUserFavorites(productId, !isFavorite);
  };

  return (
    <ProductGrid
      initialProducts={initialProducts}
      initialCategories={initialCategories}
      locale={locale}
      className={className}
      onAddToCart={handleAddToCart}
      onToggleFavorite={handleToggleFavorite}
      favoriteProductIds={favoriteProductIds}
    />
  );
}
