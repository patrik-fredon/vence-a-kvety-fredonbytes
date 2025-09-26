"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import React, { useCallback, useMemo, useState, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { useAnimationSequence } from "@/components/cart/hooks";
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
  onAddToCart,
}: ProductQuickViewProps) {
  const t = useTranslations("product");
  const tCurrency = useTranslations("currency");
  const { startProductToCartAnimation } = useAnimationSequence();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
  const addToCartButtonRef = useRef<HTMLButtonElement>(null);

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
  const handleAddToCart = useCallback(async () => {
    if (!product.availability.inStock || isAddingToCart) return;

    setIsAddingToCart(true);
    setError(null);

    try {
      if (onAddToCart) {
        await onAddToCart(product);

        // Trigger cart animation
        console.log('🛒 [ProductQuickView] Attempting to trigger cart animation');
        if (productImageRef.current && addToCartButtonRef.current) {
          // Try multiple selectors to find the cart icon
          let cartIcon = document.querySelector('[href*="/cart"]') as HTMLElement;

          if (!cartIcon) {
            // Try alternative selectors
            cartIcon = document.querySelector('[data-cart-icon]') as HTMLElement;
          }

          if (!cartIcon) {
            // Try finding by aria-label or text content
            cartIcon = document.querySelector('[aria-label*="cart" i], [aria-label*="košík" i]') as HTMLElement;
          }

          if (!cartIcon) {
            // Try finding cart button or link
            cartIcon = document.querySelector('button[class*="cart" i], a[class*="cart" i]') as HTMLElement;
          }

          if (!cartIcon) {
            // Try finding by SVG or icon that might represent cart
            cartIcon = document.querySelector('svg[class*="cart" i]')?.closest('button, a') as HTMLElement;
          }

          console.log('🛒 [ProductQuickView] Cart icon found:', !!cartIcon, cartIcon?.tagName, cartIcon?.className);

          if (cartIcon) {
            // Get the product image source
            const productImage = productImageRef.current.querySelector('img');
            const imageSrc = productImage?.src || product.images?.[0]?.url || '';

            console.log('🛒 [ProductQuickView] Starting animation with:', {
              productElement: productImageRef.current.tagName,
              cartIcon: cartIcon.tagName,
              cartIconClass: cartIcon.className,
              imageSrc: imageSrc?.substring(0, 50) + '...'
            });

            startProductToCartAnimation(
              productImageRef.current,
              cartIcon,
              imageSrc
            );

            // Fallback visual feedback - simple scale animation on the product image
            if (productImageRef.current) {
              const originalTransform = productImageRef.current.style.transform;
              productImageRef.current.style.transition = 'transform 300ms ease-out';
              productImageRef.current.style.transform = 'scale(0.95)';

              setTimeout(() => {
                if (productImageRef.current) {
                  productImageRef.current.style.transform = originalTransform;
                  setTimeout(() => {
                    if (productImageRef.current) {
                      productImageRef.current.style.transition = '';
                    }
                  }, 300);
                }
              }, 150);
            }
          } else {
            console.warn('🛒 [ProductQuickView] Cart icon not found in DOM. Available elements:', {
              linksWithCart: document.querySelectorAll('[href*="/cart"]').length,
              elementsWithCartClass: document.querySelectorAll('[class*="cart" i]').length,
              elementsWithCartAria: document.querySelectorAll('[aria-label*="cart" i]').length
            });
          }
        } else {
          console.warn('🛒 [ProductQuickView] Missing refs:', {
            productImageRef: !!productImageRef.current,
            addToCartButtonRef: !!addToCartButtonRef.current
          });
        }

        // Close modal after animation starts (increased delay)
        setTimeout(() => {
          onClose();
        }, 800); // Longer delay to ensure animation starts and is visible
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("addToCartError"));
    } finally {
      setIsAddingToCart(false);
    }
  }, [product, onAddToCart, onClose, isAddingToCart, t, startProductToCartAnimation]);

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

  // Memoize availability status text
  const availabilityText = useMemo(() => {
    if (!product.availability.inStock) return t("outOfStock");
    if (product.availability.stockQuantity && product.availability.stockQuantity <= 5) {
      return t("limitedStock");
    }
    return t("inStock");
  }, [product.availability.inStock, product.availability.stockQuantity, t]);

  // Memoize availability styles
  const availabilityStyles = useMemo(() => ({
    dotColor: product.availability.inStock ? "bg-green-500" : "bg-red-500",
    textColor: product.availability.inStock ? "text-green-700" : "text-red-700"
  }), [product.availability.inStock]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={productName}
      size="xl"
      className="max-w-4xl"
    >
      <div className="flex flex-col lg:flex-row gap-6 p-6">
        {/* Image Gallery */}
        <div className="flex-1">
          <div ref={productImageRef} className="aspect-square bg-stone-100 rounded-lg overflow-hidden mb-4">
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
                      ? "border-stone-500"
                      : "border-stone-200 hover:border-stone-300"
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
          {categoryName && (
            <p className="text-sm text-stone-500">
              {categoryName}
            </p>
          )}

          {/* Price */}
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-semibold text-stone-900">
                {formattedFinalPrice}
              </span>
              {formattedBasePrice && (
                <span className="text-lg text-stone-500 line-through">
                  {formattedBasePrice}
                </span>
              )}
            </div>
            {product.featured && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                {t("featured")}
              </span>
            )}
          </div>

          {/* Description */}
          {productDescription && (
            <div className="space-y-2">
              <h3 className="font-medium text-stone-900">{t("description")}</h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                {productDescription}
              </p>
            </div>
          )}

          {/* Availability */}
          <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", availabilityStyles.dotColor)} />
            <span className={cn("text-sm font-medium", availabilityStyles.textColor)}>
              {availabilityText}
            </span>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">


            <Link
              href={`/${locale}/products/${product.slug}`}
              className={cn(
                "flex-1 inline-flex items-center justify-center px-4 py-2 rounded-md",
                "border border-stone-300 text-stone-700 hover:bg-stone-50",
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
