"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { useAnimationSequence } from "@/components/cart/hooks";
import { Modal } from "@/components/ui/Modal";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { useImagePerformance } from "@/lib/hooks/useImagePerformance";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";

interface ProductQuickViewProps {
  product: Product;
  locale: string;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (product: Product) => void;
}

export const ProductQuickView = React.memo(function ProductQuickView({
  product,
  locale,
  isOpen,
  onClose,
  onAddToCart: _onAddToCart,
}: ProductQuickViewProps) {
  const t = useTranslations("product");
  const tCurrency = useTranslations("currency");
  const { startProductToCartAnimation: _startProductToCartAnimation } = useAnimationSequence();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [_isAddingToCart, _setIsAddingToCart] = useState(false);
  const [_error, _setError] = useState<string | null>(null);

  // Performance tracking for main image
  const currentImage = useMemo(
    () => product.images[selectedImageIndex] || product.images[0],
    [product.images, selectedImageIndex]
  );

  const imagePerformance = useImagePerformance(currentImage?.url || "", {
    enabled: true,
    logMetrics: process.env.NODE_ENV === "development",
  });

  // Refs for animation
  const productImageRef = useRef<HTMLDivElement>(null);

  // Optimized price formatting with useMemo for expensive calculations
  const formatPrice = useMemo(() => {
    return (price: number) => {
      return tCurrency("format", {
        amount: price.toLocaleString(locale === "cs" ? "cs-CZ" : "en-US"),
      });
    };
  }, [tCurrency, locale]);

  // Memoize formatted prices to avoid recalculation on every render
  const formattedFinalPrice = useMemo(() => {
    return formatPrice(product.finalPrice || product.basePrice);
  }, [formatPrice, product.finalPrice, product.basePrice]);

  const formattedBasePrice = useMemo(() => {
    return product.finalPrice && product.finalPrice < product.basePrice
      ? formatPrice(product.basePrice)
      : null;
  }, [formatPrice, product.finalPrice, product.basePrice]);

  // Optimized event handlers with useCallback to prevent function recreation

  const handleImageSelect = useCallback((index: number) => {
    setSelectedImageIndex(index);
  }, []);

  // Memoize product name for current locale to avoid repeated object access
  const productName = useMemo(() => {
    return product.name[locale as keyof typeof product.name];
  }, [product.name, locale]);

  // Memoize product description for current locale
  const productDescription = useMemo(() => {
    return product.description?.[locale as keyof typeof product.description];
  }, [product.description, locale]);

  // Memoize category name for current locale
  const categoryName = useMemo(() => {
    return product.category?.name[locale as keyof typeof product.category.name];
  }, [product.category, locale]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={productName}
      size="xl"
      className=" max-w-4xl  text-teal-800 border-2 border-teal-800"
    >
      <div className="flex flex-col lg:flex-row gap-6 p-6 ">
        {/* Image Gallery */}
        <div className="flex-1">
          <div
            ref={productImageRef}
            className="aspect-square bg-funeral-gold rounded-lg overflow-hidden mb-4"
          >
            {currentImage && (
              <OptimizedImage
                src={currentImage.url}
                alt={currentImage.alt || productName}
                width={400}
                height={400}
                variant="hero" // High quality for modal images
                className="w-full h-full object-cover"
                priority={true} // Quick view images are always priority
                loading="eager"
                quality={90} // High quality for detailed view
                placeholder="blur"
                onLoad={() => imagePerformance.markLoaded()}
                onError={() => imagePerformance.markError()}
              />
            )}
          </div>

          {/* Image Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  type="button"
                  key={image.id || index}
                  onClick={() => handleImageSelect(index)}
                  className={cn(
                    "flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-colors",
                    selectedImageIndex === index
                      ? "border-teal-800"
                      : "border-teal-800 hover:border-teal-800"
                  )}
                >
                  <OptimizedImage
                    src={image.url}
                    alt={image.alt || `${productName} ${index + 1}`}
                    width={64}
                    height={64}
                    variant="thumbnail"
                    className="w-full h-full object-cover"
                    loading="lazy" // Thumbnails are always lazy loaded
                    priority={false}
                    quality={70} // Lower quality for small thumbnails
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex-1 space-y-4">
          {/* Category */}
          {categoryName && <p className="text-sm text-teal-800">{categoryName}</p>}

          {/* Price */}
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-semibold text-teal-800">{formattedFinalPrice}</span>
              {formattedBasePrice && (
                <span className="text-lg text-teal-800 line-through">{formattedBasePrice}</span>
              )}
            </div>
            {product.featured && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-funeral-gold text-teal-800 border border-teal-900">
                {t("featured")}
              </span>
            )}
          </div>

          {/* Description */}
          {productDescription && (
            <div className="space-y-2">
              <h3 className="font-medium text-teal-800">{t("description")}</h3>
              <p className="text-sm text-teal-800 leading-relaxed">{productDescription}</p>
            </div>
          )}

          {/* Error Display */}
          {_error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">{_error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="container flex flex-col sm:flex-row gap-3 pt-4">
            <Link
              href={`/${locale}/products/${product.slug}`}
              className={cn(
                "flex-1 inline-flex items-center justify-center px-4 py-2 rounded-md bg-funeral-gold",
                "border border-amber-300 text-teal-800 hover:bg-amber-10",
                "transition-colors text-sm font-medium"
              )}
            >
              {t("productDetails")}
            </Link>
          </div>
        </div>
      </div>
    </Modal>
  );
});
