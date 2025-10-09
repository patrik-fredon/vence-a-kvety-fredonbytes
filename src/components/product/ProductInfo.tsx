"use client";

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



  // Mock rating data (implement in later tasks)
  // const rating = 4.8;
  // const reviewCount = 127;


  return (
    <div className={cn("space-y-6", className)}>


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



    </div>
  );
}
