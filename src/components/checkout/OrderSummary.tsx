"use client";

import React from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { CartItem } from "@/types/cart";
import { OrderSummary as OrderSummaryType } from "@/types/order";
import { formatPrice } from "@/lib/utils";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  deliveryCost: number;
  totalAmount: number;
  estimatedDeliveryDate?: Date;
  locale: string;
  isLoading?: boolean;
  className?: string;
}

export function OrderSummary({
  items,
  subtotal,
  deliveryCost,
  totalAmount,
  estimatedDeliveryDate,
  locale,
  isLoading = false,
  className = "",
}: OrderSummaryProps) {
  const t = useTranslations("checkout");
  const tCart = useTranslations("cart");
  const tDelivery = useTranslations("delivery");

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-soft p-6 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-soft ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-neutral-200">
        <h2 className="text-elegant text-xl font-semibold text-primary-800">{t("orderSummary")}</h2>
        <p className="text-neutral-600 mt-1">
          {itemCount} {itemCount === 1 ? tCart("item") : tCart("items")}
        </p>
      </div>

      {/* Items List */}
      <div className="p-6 border-b border-neutral-200">
        <div className="space-y-4">
          {items.map((item) => (
            <OrderSummaryItem key={item.id} item={item} locale={locale} />
          ))}
        </div>
      </div>

      {/* Pricing Breakdown */}
      <div className="p-6 space-y-3">
        {/* Subtotal */}
        <div className="flex justify-between items-center">
          <span className="text-neutral-700">{tCart("subtotal")}</span>
          <span className="font-medium text-neutral-900">
            {formatPrice(subtotal, locale as "cs" | "en")}
          </span>
        </div>

        {/* Delivery Cost */}
        <div className="flex justify-between items-center">
          <span className="text-neutral-700">{tCart("shipping")}</span>
          <span className="font-medium text-neutral-900">
            {deliveryCost > 0 ? formatPrice(deliveryCost, locale as "cs" | "en") : t("free")}
          </span>
        </div>

        {/* Estimated Delivery Date */}
        {estimatedDeliveryDate && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-neutral-600">{tDelivery("cost.estimatedDelivery")}</span>
            <span className="text-neutral-800">
              {estimatedDeliveryDate.toLocaleDateString(locale === "cs" ? "cs-CZ" : "en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        )}

        {/* Total */}
        <div className="pt-3 border-t border-neutral-200">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-neutral-900">{tCart("total")}</span>
            <span className="text-xl font-bold text-primary-800">
              {formatPrice(totalAmount, locale as "cs" | "en")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Individual order summary item component
interface OrderSummaryItemProps {
  item: CartItem;
  locale: string;
}

function OrderSummaryItem({ item, locale }: OrderSummaryItemProps) {
  const tCart = useTranslations("cart");
  const product = item.product;

  if (!product) {
    return null;
  }

  const productName = locale === "cs" ? product.name.cs : product.name.en;
  const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];

  return (
    <div className="flex items-start space-x-3">
      {/* Product Image */}
      <div className="flex-shrink-0 w-16 h-16 bg-neutral-100 rounded-lg overflow-hidden">
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt}
            width={64}
            height={64}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingCartIcon className="w-6 h-6 text-neutral-400" />
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-neutral-900 truncate">{productName}</h4>

        {/* Customizations */}
        {item.customizations && item.customizations.length > 0 && (
          <div className="mt-1 space-y-1">
            {item.customizations.map((customization, index) => (
              <div key={index} className="text-xs text-neutral-600">
                {customization.customValue && (
                  <span>
                    {tCart("customMessage")}: {customization.customValue}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Quantity and Price */}
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-neutral-600">
            {tCart("quantity")}: {item.quantity}
          </span>
          <span className="text-sm font-medium text-neutral-900">
            {formatPrice(item.totalPrice || 0, locale as "cs" | "en")}
          </span>
        </div>
      </div>
    </div>
  );
}

// Compact version for mobile or sidebar
export function CompactOrderSummary({
  items,
  subtotal,
  deliveryCost,
  totalAmount,
  locale,
  className = "",
}: Omit<OrderSummaryProps, "estimatedDeliveryDate" | "isLoading">) {
  const t = useTranslations("checkout");
  const tCart = useTranslations("cart");

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className={`bg-neutral-50 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-neutral-700">{t("orderSummary")}</span>
        <span className="text-sm text-neutral-600">
          {itemCount} {itemCount === 1 ? tCart("item") : tCart("items")}
        </span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-neutral-600">{tCart("subtotal")}</span>
          <span>{formatPrice(subtotal, locale as "cs" | "en")}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-neutral-600">{tCart("shipping")}</span>
          <span>{formatPrice(deliveryCost, locale as "cs" | "en")}</span>
        </div>

        <div className="pt-2 border-t border-neutral-200">
          <div className="flex justify-between font-semibold">
            <span>{tCart("total")}</span>
            <span className="text-primary-800">
              {formatPrice(totalAmount, locale as "cs" | "en")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
