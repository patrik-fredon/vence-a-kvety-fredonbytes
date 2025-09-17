"use client";

import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { useTranslations } from "next-intl";
import React from "react";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/lib/cart/context";
import { formatPrice } from "@/lib/utils";

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
      <div className={`bg-white rounded-lg shadow-lg p-6 w-80 ${className}`}>
        <div className="text-center">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCartIcon className="w-6 h-6 text-primary-600" />
          </div>
          <p className="text-neutral-600 mb-4">{t("empty")}</p>
          <a
            href={`/${locale}/products`}
            onClick={onClose}
            className="inline-flex items-center justify-center px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md font-medium transition-colors text-sm"
          >
            {t("continueShopping")}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg w-80 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-neutral-200">
        <h3 className="font-semibold text-neutral-800">
          {t("title")} ({itemCount})
        </h3>
      </div>

      {/* Items */}
      <div className="max-h-64 overflow-y-auto">
        {state.items.slice(0, 3).map((item) => {
          const product = item.product;
          if (!product) return null;

          const productName = locale === "cs" ? product.name.cs : product.name.en;
          const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];

          return (
            <div key={item.id} className="p-4 border-b border-neutral-100 last:border-b-0">
              <div className="flex items-start space-x-3">
                {/* Product Image */}
                <div className="flex-shrink-0 w-12 h-12 bg-neutral-100 rounded overflow-hidden">
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
                      <ShoppingCartIcon className="w-4 h-4 text-neutral-400" />
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-neutral-800 truncate">{productName}</h4>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm text-neutral-600">
                      {t("quantity")}: {item.quantity}
                    </span>
                    <span className="text-sm font-semibold text-primary-800">
                      {formatPrice(item.totalPrice || 0, locale as "cs" | "en")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Show more indicator */}
        {state.items.length > 3 && (
          <div className="p-4 text-center text-sm text-neutral-600">
            {t("andMore", { count: state.items.length - 3 })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-neutral-200">
        <div className="flex items-center justify-between mb-4">
          <span className="font-medium text-neutral-800">{t("subtotal")}</span>
          <span className="font-semibold text-primary-800">
            {formatPrice(subtotal, locale as "cs" | "en")}
          </span>
        </div>

        <div className="space-y-2">
          <a
            href={`/${locale}/cart`}
            onClick={onClose}
            className="inline-flex items-center justify-center w-full px-3 py-2 border-2 border-primary-600 text-primary-700 hover:bg-primary-50 rounded-md font-medium transition-colors text-sm"
          >
            {t("viewCart")}
          </a>
          <a
            href={`/${locale}/checkout`}
            onClick={onClose}
            className="inline-flex items-center justify-center w-full px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md font-medium transition-colors text-sm"
          >
            {t("checkout")}
          </a>
        </div>
      </div>
    </div>
  );
}
