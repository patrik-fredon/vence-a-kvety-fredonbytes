"use client";

import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { getProductActionConfig } from "@/lib/utils/productCustomization";
import type { Product } from "@/types/product";

interface ProductTeaserProps {
  product: Product;
  locale: string;
  onAddToCart?: (product: Product) => void;
  loading?: boolean;
}

export function ProductTeaser({ product, locale, onAddToCart, loading }: ProductTeaserProps) {
  const t = useTranslations("product");

  const productName = locale === "cs" ? product.name.cs : product.name.en;
  const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];

  const actionConfig = getProductActionConfig(product, locale);

  const handleAction = () => {
    if (actionConfig.action === "addToCart" && onAddToCart) {
      onAddToCart(product);
    }
    // For customize action, the Link component will handle navigation
  };

  const ActionButton = () => {
    const buttonProps = {
      disabled: !product.availability?.inStock || loading,
      loading: loading,
      className: "w-full",
      variant: "primary" as const,
    };

    if (actionConfig.action === "customize") {
      return (
        <Link href={`/${locale}/products/${product.slug}`}>
          <Button
            {...buttonProps}
            icon={actionConfig.icon === "cog" ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            ) : (
              <ShoppingCartIcon className="w-4 h-4" />
            )}
            iconPosition="left"
          >
            {actionConfig.text}
          </Button>
        </Link>
      );
    }

    return (
      <Button
        {...buttonProps}
        onClick={handleAction}
        icon={<ShoppingCartIcon className="w-4 h-4" />}
        iconPosition="left"
      >
        {actionConfig.text}
      </Button>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-soft border border-stone-200 overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
      {/* Product Image */}
      <Link href={`/${locale}/products/${product.slug}`} className="block">
        <div className="aspect-square bg-stone-100 overflow-hidden relative">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt}
              width={400}
              height={400}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-stone-50 to-stone-100">
              <span className="text-4xl opacity-60">🌹</span>
            </div>
          )}

          {/* Featured badge */}
          {product.featured && (
            <div className="absolute top-3 left-3 bg-amber-600 text-white px-2 py-1 rounded-full text-xs font-medium">
              {locale === "cs" ? "Doporučeno" : "Featured"}
            </div>
          )}

          {/* Customization indicator */}
          {actionConfig.action === "customize" && (
            <div className="absolute top-3 right-3 bg-stone-800 text-white px-2 py-1 rounded-full text-xs font-medium">
              {locale === "cs" ? "Přizpůsobitelné" : "Customizable"}
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-6">
        <Link href={`/${locale}/products/${product.slug}`}>
          <h3 className="text-elegant text-xl font-semibold text-stone-800 mb-2 hover:text-stone-700 transition-colors line-clamp-2 min-h-[3.5rem]">
            {productName}
          </h3>
        </Link>

        {/* Price */}
        <div className="mb-4">
          <span className="text-2xl font-semibold text-stone-800">
            {formatPrice(product.basePrice, locale as "cs" | "en")}
          </span>
          {actionConfig.action === "customize" && (
            <span className="text-sm text-stone-500 ml-2">
              {locale === "cs" ? "od" : "from"}
            </span>
          )}
        </div>

        {/* Availability */}
        <div className="mb-4">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.availability?.inStock
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
              }`}
          >
            {product.availability?.inStock ? t("inStock") : t("outOfStock")}
          </span>
        </div>

        {/* Action Button */}
        <ActionButton />
      </div>
    </div>
  );
}
