"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useCart } from "@/lib/cart/context";
import type { Product } from "@/types/product";
import { ProductTeaser } from "./ProductTeaser";

interface RandomProductTeasersProps {
  locale: string;
  count?: number;
}

const RandomProductTeasers = React.memo(function RandomProductTeasers({ locale, count = 3 }: RandomProductTeasersProps) {
  const t = useTranslations("home");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { addToCart } = useCart();

  const fetchRandomProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/products/random?count=${count}&locale=${locale}`, {
        cache: "no-store", // Ensure fresh data on each request for rotation
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch products`);
      }

      const data = await response.json();

      if (data.success) {
        setProducts(data.products);
      } else {
        setError(data.error || "Failed to load products");
      }
    } catch (err) {
      console.error("Error fetching random products:", err);
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [count, locale]);

  useEffect(() => {
    fetchRandomProducts();
  }, [fetchRandomProducts]);

  const handleAddToCart = useCallback(async (product: Product) => {
    try {
      console.log("🛒 [RandomProductTeasers] Starting add to cart for product:", product.id);
      setAddingToCart(product.id);

      const success = await addToCart({
        productId: product.id,
        quantity: 1,
        customizations: [],
      });

      if (success) {
        console.log("✅ [RandomProductTeasers] Successfully added product to cart:", product.id);
      } else {
        console.error("❌ [RandomProductTeasers] Failed to add product to cart:", product.id);
      }
    } catch (error) {
      console.error("💥 [RandomProductTeasers] Error adding to cart:", error);
    } finally {
      setAddingToCart(null);
    }
  }, [addToCart]);

  const handleRetry = useCallback(() => {
    setRetryCount((prev) => prev + 1);
    fetchRandomProducts();
  }, [fetchRandomProducts]);

  if (loading) {
    return (
      <section className="mt-20 max-w-6xl mx-auto px-4" aria-labelledby="featured-products-title">
        <h2
          id="featured-products-title"
          className="text-elegant text-3xl md:text-4xl font-semibold text-stone-800 text-center mb-12"
        >
          {t("featuredProducts.title")}
        </h2>
        <div className="flex justify-center items-center py-12" role="status" aria-label={t("loading")}>
          <LoadingSpinner size="lg" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mt-20 max-w-6xl mx-auto px-4" aria-labelledby="featured-products-title">
        <h2
          id="featured-products-title"
          className="text-elegant text-3xl md:text-4xl font-semibold text-stone-800 text-center mb-12"
        >
          {t("featuredProducts.title")}
        </h2>
        <div className="text-center py-12 bg-white rounded-xl shadow-soft border border-stone-200 p-8">
          <p className="text-stone-600 mb-4" role="alert">{error}</p>
          <button
            onClick={handleRetry}
            className="text-amber-600 hover:text-amber-700 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 rounded-md px-2 py-1"
            type="button"
          >
            {t("tryAgain")}
          </button>
          {retryCount > 0 && (
            <p className="text-sm text-stone-500 mt-2">
              {locale === "cs" ? `Pokus ${retryCount + 1}` : `Attempt ${retryCount + 1}`}
            </p>
          )}
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="mt-20 max-w-6xl mx-auto px-4" aria-labelledby="featured-products-title">
        <h2
          id="featured-products-title"
          className="text-elegant text-3xl md:text-4xl font-semibold text-stone-800 text-center mb-12"
        >
          {t("featuredProducts.title")}
        </h2>
        <div className="text-center py-12 bg-white rounded-xl shadow-soft border border-stone-200 p-8">
          <p className="text-stone-600">{t("noProducts")}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-20 max-w-6xl mx-auto px-4" aria-labelledby="featured-products-title">
      <h2
        id="featured-products-title"
        className="text-elegant text-3xl md:text-4xl font-semibold text-stone-800 text-center mb-12"
      >
        {t("featuredProducts.title")}
      </h2>

      {/* Responsive grid layout optimized for multiple teaser cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {products.map((product) => (
          <ProductTeaser
            key={`teaser-${product.id}-${product.slug}`} // Optimized key prop for React rendering
            product={product}
            locale={locale}
            onAddToCart={handleAddToCart}
            loading={addingToCart === product.id}
          />
        ))}
      </div>

      <div className="text-center mt-12">
        <a
          href={`/${locale}/products`}
          className="inline-flex items-center justify-center px-6 py-3 bg-[linear-gradient(to_right,_#AE8625,_#F7EF8A,_#D2AC47)] hover:bg-amber-700 text-white rounded-lg font-medium transition-colors shadow-soft"
        >
          {t("featuredProducts.viewAll")}
        </a>
      </div>
    </section>
  );
});

// Default export for compatibility with existing imports
export default RandomProductTeasers;

// Named export for compatibility
export { RandomProductTeasers };
