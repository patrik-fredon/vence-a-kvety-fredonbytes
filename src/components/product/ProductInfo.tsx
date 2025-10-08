"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";

interface ProductInfoProps {
  product: Product;
  locale: string;
  finalPrice: number;
  className?: string;
}

export function ProductInfo({ product, locale, finalPrice, className }: ProductInfoProps) {
  const t = useTranslations("product");
  const tCurrency = useTranslations("currency");

  const formatPrice = (price: number) => {
    return tCurrency("format", {
      amount: price.toLocaleString(locale === "cs" ? "cs-CZ" : "en-US"),
    });
  };

<<<<<<< HEAD

  // Mock rating data (implement in later tasks)
  // const rating = 4.8;
  // const reviewCount = 127;

=======
>>>>>>> c1bdac3 (Remove mock rating data from ProductInfo)

  return (
    <div className={cn("space-y-6", className)}>
      {/* Breadcrumb */}
      <nav className="text-sm text-teal-800" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          <li>
            <Link href={`/${locale}/products`} className="hover:text-amber-600 transition-colors">
              {t("allProducts")}
            </Link>
          </li>
          {product.category && (
            <>
              <li className="text-teal-800">/</li>
              <li>
                <Link
                  href={`/${locale}/products?category=${product.category.slug}`}
                  className="hover:text-amber-600 transition-colors"
                >
                  {product.category.name[locale as keyof typeof product.category.name]}
                </Link>
              </li>
            </>
          )}
          <li className="text-teal-800">/</li>
          <li className="text-teal-800 font-medium">
            {product.name[locale as keyof typeof product.name]}
          </li>
        </ol>
      </nav>

      {/* Product Title and Badge */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-3xl font-light text-teal-800 leading-tight">
            {product.name[locale as keyof typeof product.name]}
          </h1>
        </div>

      </div>



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
                {product.category?.name[locale as keyof typeof product.category.name] ||
                  t("uncategorized")}
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
                <dt className="text-amber-300 font-medium">{t("maxQuantity")}:</dt>
                <dd className="text-amber-300">{product.availability.maxOrderQuantity}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>


    </div>
  );
}
