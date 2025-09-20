"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { useCart } from "@/lib/cart/context";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import Image from "next/image";

interface MiniCartProps {
  locale: string;
  onClose?: () => void;
  className?: string;
}

export function MiniCart({ locale, onClose, className = "" }: MiniCartProps) {
  const t = useTranslations("cart");
  const { state } = useCart();

  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = state.items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);

  if (state.items.length === 0) {
    return (
      <Card className={`w-80 ${className}`} variant="elevated">
        <CardContent className="text-center py-8">
          <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCartIcon className="w-6 h-6 text-stone-600" />
          </div>
          <p className="text-stone-600 mb-6">{t("empty")}</p>
          <Button
            variant="default"
            size="sm"
            onClick={onClose}
            className="w-full"
          >
            <a href={`/${locale}/products`} className="w-full">
              {t("continueShopping")}
            </a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-80 ${className}`} variant="elevated">
      {/* Header */}
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">
          {t("title")} ({itemCount})
        </CardTitle>
      </CardHeader>

      {/* Items */}
      <CardContent className="py-0">
        <div className="max-h-64 overflow-y-auto space-y-3">
          {state.items.slice(0, 3).map((item) => {
            const product = item.product;
            if (!product) return null;

            const productName = locale === "cs" ? product.name.cs : product.name.en;
            const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];

            return (
              <div key={item.id} className="flex items-start space-x-3 py-3 border-b border-stone-100 last:border-b-0">
                {/* Product Image */}
                <div className="flex-shrink-0 w-12 h-12 bg-stone-50 rounded-lg overflow-hidden">
                  {primaryImage ? (
                    <Image
                      src={primaryImage.url}
                      alt={primaryImage.alt}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingCartIcon className="w-4 h-4 text-stone-400" />
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-stone-900 truncate">{productName}</h4>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm text-stone-600">
                      {t("quantity")}: {item.quantity}
                    </span>
                    <span className="text-sm font-semibold text-stone-900">
                      {formatPrice(item.totalPrice || 0, locale as "cs" | "en")}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Show more indicator */}
          {state.items.length > 3 && (
            <div className="py-3 text-center text-sm text-stone-600">
              {t("andMore", { count: state.items.length - 3 })}
            </div>
          )}
        </div>
      </CardContent>

      {/* Footer */}
      <CardFooter className="flex-col space-y-4">
        <div className="flex items-center justify-between w-full">
          <span className="font-medium text-stone-900">{t("subtotal")}</span>
          <span className="font-semibold text-stone-900">
            {formatPrice(subtotal, locale as "cs" | "en")}
          </span>
        </div>

        <div className="space-y-2 w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="w-full"
          >
            <a href={`/${locale}/cart`} className="w-full">
              {t("viewCart")}
            </a>
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={onClose}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white"
          >
            <a href={`/${locale}/checkout`} className="w-full">
              {t("checkout")}
            </a>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
