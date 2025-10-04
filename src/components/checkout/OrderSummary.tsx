"use client";

import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { formatPrice } from "@/lib/utils";
import type { CartItem } from "@/types/cart";

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
      <Card className={className} variant="default">
        <CardContent className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className} variant="default">
      {/* Header */}
      <CardHeader>
        <CardTitle className="text-xl font-light text-stone-900">{t("orderSummary")}</CardTitle>
        <p className="text-stone-600 mt-1">
          {itemCount} {itemCount === 1 ? tCart("item") : tCart("items")}
        </p>
      </CardHeader>

      {/* Items List */}
      <CardContent className="border-b border-stone-200">
        <div className="space-y-4">
          {items.map((item) => (
            <OrderSummaryItem key={item.id} item={item} locale={locale} />
          ))}
        </div>
      </CardContent>

      {/* Pricing Breakdown */}
      <CardFooter className="flex-col space-y-3">
        {/* Subtotal */}
        <div className="flex justify-between items-center w-full">
          <span className="text-stone-700">{tCart("subtotal")}</span>
          <span className="font-medium text-stone-900">
            {formatPrice(subtotal, locale as "cs" | "en")}
          </span>
        </div>

        {/* Delivery Cost */}
        <div className="flex justify-between items-center w-full">
          <span className="text-stone-700">{tCart("shipping")}</span>
          <span className="font-medium text-stone-900">
            {deliveryCost > 0 ? formatPrice(deliveryCost, locale as "cs" | "en") : t("free")}
          </span>
        </div>

        {/* Estimated Delivery Date */}
        {estimatedDeliveryDate && (
          <div className="flex justify-between items-center text-sm w-full">
            <span className="text-stone-600">{tDelivery("cost.estimatedDelivery")}</span>
            <span className="text-stone-800">
              {estimatedDeliveryDate.toLocaleDateString(locale === "cs" ? "cs-CZ" : "en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        )}

        {/* Total */}
        <div className="pt-3 border-t border-stone-200 w-full">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-stone-900">{tCart("total")}</span>
            <span className="text-xl font-bold text-stone-900">
              {formatPrice(totalAmount, locale as "cs" | "en")}
            </span>
          </div>
        </div>
      </CardFooter>
    </Card>
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
    <div className="flex items-start space-x-3 p-3 border border-stone-200 rounded-lg bg-teal-50/50">
      {/* Product Image */}
      <div className="flex-shrink-0 w-16 h-16 bg-teal-100 rounded-lg overflow-hidden shadow-sm">
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
            <ShoppingCartIcon className="w-6 h-6 text-stone-400" />
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-stone-900 truncate">{productName}</h4>

        {/* Customizations */}
        {item.customizations && item.customizations.length > 0 && (
          <div className="mt-1 space-y-1">
            {item.customizations.map((customization, index) => (
              <div key={index} className="text-xs text-stone-600">
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
          <span className="text-xs text-stone-600">
            {tCart("quantity")}: {item.quantity}
          </span>
          <span className="text-sm font-medium text-stone-900">
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
    <Card className={className} variant="outlined">
      <CardContent className="bg-teal-50">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-stone-700">{t("orderSummary")}</span>
          <span className="text-sm text-stone-600">
            {itemCount} {itemCount === 1 ? tCart("item") : tCart("items")}
          </span>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-stone-600">{tCart("subtotal")}</span>
            <span>{formatPrice(subtotal, locale as "cs" | "en")}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-stone-600">{tCart("shipping")}</span>
            <span>{formatPrice(deliveryCost, locale as "cs" | "en")}</span>
          </div>

          <div className="pt-2 border-t border-stone-200">
            <div className="flex justify-between font-semibold">
              <span>{tCart("total")}</span>
              <span className="text-stone-900">
                {formatPrice(totalAmount, locale as "cs" | "en")}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
