"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";

interface ProductQuickViewProps {
  product: Product;
  locale: string;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (product: Product) => void;
}

export function ProductQuickView({
  product,
  locale,
  isOpen,
  onClose,
  onAddToCart,
}: ProductQuickViewProps) {
  const t = useTranslations("product");
  const tCurrency = useTranslations("currency");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const formatPrice = (price: number) => {
    return tCurrency("format", {
      amount: price.toLocaleString(locale === "cs" ? "cs-CZ" : "en-US"),
    });
  };

  const handleAddToCart = () => {
    onAddToCart?.(product);
    onClose();
  };

  const currentImage = product.images[selectedImageIndex] || product.images[0];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product.name[locale as keyof typeof product.name]}
      size="xl"
      className="max-w-4xl"
    >
      <div className="flex flex-col lg:flex-row gap-6 p-6">
        {/* Image Gallery */}
        <div className="flex-1">
          <div className="aspect-square bg-stone-100 rounded-lg overflow-hidden mb-4">
            {currentImage && (
              <Image
                src={currentImage.url}
                alt={currentImage.alt || product.name[locale as keyof typeof product.name]}
                width={400}
                height={400}
                className="w-full h-full object-cover"
                priority
              />
            )}
          </div>

          {/* Image Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={image.id || index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={cn(
                    "flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-colors",
                    selectedImageIndex === index
                      ? "border-stone-500"
                      : "border-stone-200 hover:border-stone-300"
                  )}
                >
                  <Image
                    src={image.url}
                    alt={
                      image.alt ||
                      `${product.name[locale as keyof typeof product.name]} ${index + 1}`
                    }
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex-1 space-y-4">
          {/* Category */}
          {product.category && (
            <p className="text-sm text-stone-500">
              {product.category.name[locale as keyof typeof product.category.name]}
            </p>
          )}

          {/* Price */}
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-semibold text-stone-900">
                {formatPrice(product.finalPrice || product.basePrice)}
              </span>
              {product.finalPrice && product.finalPrice < product.basePrice && (
                <span className="text-lg text-stone-500 line-through">
                  {formatPrice(product.basePrice)}
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
          {product.description?.[locale as keyof typeof product.description] && (
            <div className="space-y-2">
              <h3 className="font-medium text-stone-900">{t("description")}</h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                {product.description[locale as keyof typeof product.description]}
              </p>
            </div>
          )}

          {/* Availability */}
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-2 h-2 rounded-full",
                product.availability.inStock ? "bg-green-500" : "bg-red-500"
              )}
            />
            <span
              className={cn(
                "text-sm font-medium",
                product.availability.inStock ? "text-green-700" : "text-red-700"
              )}
            >
              {product.availability.inStock
                ? product.availability.stockQuantity && product.availability.stockQuantity <= 5
                  ? t("limitedStock")
                  : t("inStock")
                : t("outOfStock")}
            </span>
          </div>

          {/* Quantity Selector */}
          {product.availability.inStock && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-900">{t("quantity")}</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-md border border-stone-300 flex items-center justify-center hover:bg-stone-50 transition-colors"
                  aria-label={t("decreaseQuantity")}
                >
                  -
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-md border border-stone-300 flex items-center justify-center hover:bg-stone-50 transition-colors"
                  aria-label={t("increaseQuantity")}
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={handleAddToCart}
              disabled={!product.availability.inStock}
              className="flex-1"
              size="lg"
            >
              {product.availability.inStock ? t("addToCart") : t("outOfStock")}
            </Button>
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
}
