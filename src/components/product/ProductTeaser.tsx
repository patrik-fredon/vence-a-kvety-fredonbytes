"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Product } from "@/types/product";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";

interface ProductTeaserProps {
  product: Product;
  locale: string;
  onAddToCart?: (productId: string) => void;
  loading?: boolean;
}

export function ProductTeaser({ product, locale, onAddToCart, loading }: ProductTeaserProps) {
  const t = useTranslations("product");

  const productName = locale === "cs" ? product.name.cs : product.name.en;
  const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product.id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-soft overflow-hidden hover:shadow-memorial transition-all duration-300 group">
      {/* Product Image */}
      <Link href={`/${locale}/products/${product.slug}`} className="block">
        <div className="aspect-square bg-neutral-100 overflow-hidden relative">
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
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100">
              <span className="text-4xl opacity-60">🌹</span>
            </div>
          )}
          
          {/* Featured badge */}
          {product.featured && (
            <div className="absolute top-3 left-3 bg-primary-600 text-white px-2 py-1 rounded-full text-xs font-medium">
              {locale === "cs" ? "Doporučeno" : "Featured"}
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-6">
        <Link href={`/${locale}/products/${product.slug}`}>
          <h3 className="text-elegant text-xl font-semibold text-primary-800 mb-2 hover:text-primary-700 transition-colors line-clamp-2 min-h-[3.5rem]">
            {productName}
          </h3>
        </Link>

        {/* Price */}
        <div className="mb-4">
          <span className="text-2xl font-semibold text-primary-800">
            {formatPrice(product.basePrice, locale as "cs" | "en")}
          </span>
        </div>

        {/* Availability */}
        <div className="mb-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.availability?.inStock
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
            }`}>
            {product.availability?.inStock ? t("inStock") : t("outOfStock")}
          </span>
        </div>

        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          disabled={!product.availability?.inStock || loading}
          loading={loading}
          className="w-full"
          icon={<ShoppingCartIcon className="w-4 h-4" />}
          iconPosition="left"
          variant="primary"
        >
          {t("addToCart")}
        </Button>
      </div>
    </div>
  );
} className="block">
        <div className="aspect-square bg-neutral-100 overflow-hidden">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt}
              width={400}
              height={400}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-4xl">🌹</span>
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-6">
        <Link href={`/${locale}/products/${product.slug}`}>
          <h3 className="text-elegant text-xl font-semibold text-primary-800 mb-2 hover:text-primary-700 transition-colors line-clamp-2">
            {productName}
          </h3>
        </Link>

        {/* Price */}
        <div className="mb-4">
          <span className="text-2xl font-semibold text-primary-800">
            {formatPrice(product.basePrice, locale as "cs" | "en")}
          </span>
        </div>

        {/* Availability */}
        <div className="mb-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.availability?.inStock
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
            }`}>
            {product.availability?.inStock ? t("inStock") : t("outOfStock")}
          </span>
        </div>

        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          disabled={!product.availability?.inStock || loading}
          loading={loading}
          className="w-full"
          icon={<ShoppingCartIcon className="w-4 h-4" />}
          iconPosition="left"
        >
          {t("addToCart")}
        </Button>
      </div>
    </div>
  );
}
