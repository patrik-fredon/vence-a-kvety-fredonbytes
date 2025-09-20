"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Product } from "@/types/product";
import { ProductTeaser } from "./ProductTeaser";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useCart } from "@/lib/cart/context";

interface RandomProductTeasersProps {
  locale: string;
  count?: number;
}

export function RandomProductTeasers({ locale, count = 3 }: RandomProductTeasersProps) {
  const t = useTranslations("home");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchRandomProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/products/random?count=${count}&locale=${locale}`);

        if (!response.ok) {
          throw new Error("Failed to fetch products");
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
    };

    fetchRandomProducts();
  }, [count, locale]);

  const handleAddToCart = async (productId: string) => {
    try {
      setAddingToCart(productId);

      const success = await addToCart({
        productId,
        quantity: 1,
        customizations: [],
      });

      if (!success) {
        // Error handling is done in the cart context
        console.error("Failed to add product to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setAddingToCart(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-primary-600 hover:text-primary-700 font-medium"
        >
          {t("tryAgain")}
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-600">{t("noProducts")}</p>
      </div>
    );
  }

  return (
    <div className="mt-20 max-w-6xl mx-auto">
      <h2 className="text-elegant text-3xl md:text-4xl font-semibold text-primary-800 text-center mb-12">
        {t("featuredProducts.title")}
      </h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <ProductTeaser
            key={product.id}
            product={product}
            locale={locale}
            onAddToCart={handleAddToCart}
            loading={addingToCart === product.id}
          />
        ))}
      </div>

      <div className="text-center mt-8">
        <a
          href={`/${locale}/products`}
          className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
        >
          {t("featuredProducts.viewAll")}
        </a>
      </div>
    </div>
  );
}
