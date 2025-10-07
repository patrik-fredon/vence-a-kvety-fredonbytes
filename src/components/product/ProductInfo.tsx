"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { StarIcon, StarIconSolid } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";

interface ProductInfoProps {
  product: Product;
  locale: string;
  finalPrice: number;
  className?: string;
}

export function ProductInfo({
  product,
  locale,
  finalPrice,
  className,
}: ProductInfoProps) {
  const t = useTranslations("product");
  const tCurrency = useTranslations("currency");

  const formatPrice = (price: number) => {
    return tCurrency("format", {
      amount: price.toLocaleString(locale === "cs" ? "cs-CZ" : "en-US"),
    });
  };

  // Mock rating data (implement in later tasks)
  const rating = 4.8;
  const reviewCount = 127;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Breadcrumb */}
      <nav className="text-sm text-amber-300" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          <li>
            <Link
              href={`/${locale}/products`}
              className="hover:text-amber-600 transition-colors"
            >
              {t("allProducts")}
            </Link>
          </li>
          {product.category && (
            <>
              <li className="text-amber-300">/</li>
              <li>
                <Link
                  href={`/${locale}/products?category=${product.category.slug}`}
                  className="hover:text-amber-600 transition-colors"
                >
                  {
                    product.category.name[
                      locale as keyof typeof product.category.name
                    ]
                  }
                </Link>
              </li>
            </>
          )}
          <li className="text-amber-200">/</li>
          <li className="text-amber-300 font-medium">
            {product.name[locale as keyof typeof product.name]}
          </li>
        </ol>
      </nav>

      {/* Product Title and Badge */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-3xl font-light text-amber-300 leading-tight">
            {product.name[locale as keyof typeof product.name]}
          </h1>
        </div>

        {/* Featured Badge */}
        {product.featured && (
          <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full text-sm font-medium">
            <StarIconSolid className="w-4 h-4" />
            {t("featured")}
          </div>
        )}
      </div>

      {/* Rating and Reviews */}
      <Card padding="sm" className="bg-amber-30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon
                  key={star}
                  className={cn(
                    "w-4 h-4",
                    star <= Math.floor(rating)
                      ? "text-amber-500 fill-current"
                      : star <= rating
                      ? "text-amber-500 fill-current opacity-50"
                      : "text-amber-300"
                  )}
                />
              ))}
            </div>
            <span className="text-sm font-medium text-amber-300">{rating}</span>
            <span className="text-sm text-amber-300">
              ({reviewCount} {t("reviews")})
            </span>
          </div>
        </div>
      </Card>

      {/* Price Display */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("pricing")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-semibold text-amber-300">
                {formatPrice(product.basePrice)}
              </span>
              <span className="text-sm text-amber-300">{t("basePrice")}</span>
            </div>
            {finalPrice !== product.basePrice && (
              <div className="text-sm text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">
                {t("priceWillUpdate")}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      {product.description && (
        <Card>
          <CardHeader>
            <CardTitle>{t("description")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-amber-300 leading-relaxed whitespace-pre-line">
              {product.description[locale as keyof typeof product.description]}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Product Details */}
      <Card>
        <CardHeader>
          <CardTitle>{t("productDetails")}</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-3 text-sm">
            <div className="flex justify-between py-2 border-b border-amber-300 last:border-b-0">
              <dt className="text-amber-300 font-medium">{t("category")}:</dt>
              <dd className="text-amber-300">
                {product.category?.name[
                  locale as keyof typeof product.category.name
                ] || t("uncategorized")}
              </dd>
            </div>
            <div className="flex justify-between py-2 border-b border-amber-300 last:border-b-0">
              <dt className="text-amber-300 font-medium">{t("sku")}:</dt>
              <dd className="text-amber-300 font-mono text-xs">
                {product.id.slice(-8).toUpperCase()}
              </dd>
            </div>
            {product.availability.leadTimeHours && (
              <div className="flex justify-between py-2 border-b border-amber-300 last:border-b-0">
                <dt className="text-amber-300 font-medium">{t("leadTime")}:</dt>
                <dd className="text-amber-300">
                  {product.availability.leadTimeHours} {t("hours")}
                </dd>
              </div>
            )}
            {product.availability.maxOrderQuantity && (
              <div className="flex justify-between py-2 border-b border-amber-300 last:border-b-0">
                <dt className="text-amber-300 font-medium">
                  {t("maxQuantity")}:
                </dt>
                <dd className="text-amber-300">
                  {product.availability.maxOrderQuantity}
                </dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Availability Status */}
      <Card
        className={cn(
          product.availability.inStock
            ? "bg-green-50 border-green-200"
            : "bg-red-50 border-red-200"
        )}
      >
        <CardContent className="py-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-3 h-3 rounded-full",
                product.availability.inStock ? "bg-green-500" : "bg-red-500"
              )}
            />
            <div className="flex-1">
              <div
                className={cn(
                  "font-medium text-sm",
                  product.availability.inStock
                    ? "text-green-800"
                    : "text-red-800"
                )}
              >
                {product.availability.inStock ? t("inStock") : t("outOfStock")}
              </div>
              {product.availability.inStock &&
                product.availability.leadTimeHours && (
                  <div className="text-xs text-green-700 mt-1">
                    {t("leadTime", {
                      hours: product.availability.leadTimeHours,
                    })}
                  </div>
                )}
              {!product.availability.inStock &&
                product.availability.estimatedRestockDate && (
                  <div className="text-xs text-red-700 mt-1">
                    {t("restockDate", {
                      date: product.availability.estimatedRestockDate.toLocaleDateString(
                        locale === "cs" ? "cs-CZ" : "en-US"
                      ),
                    })}
                  </div>
                )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
