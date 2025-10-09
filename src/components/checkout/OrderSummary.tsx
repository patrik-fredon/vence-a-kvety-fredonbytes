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
  deliveryMethod?: "delivery" | "pickup" | null;
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
  deliveryMethod,
}: OrderSummaryProps) {
  const t = useTranslations("checkout");
  const tCart = useTranslations("cart");
  const tDelivery = useTranslations("delivery");
  const tProduct = useTranslations("product");

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
    <Card className="bg-funeral-gold border border-amber-200 shadow-4xl">
      {/* Header */}
      <CardHeader>
        <CardTitle className="text-xl font-light text-teal-800">{t("orderSummary")}</CardTitle>
        <p className="text-teal-800 mt-1">
          {itemCount} {itemCount === 1 ? tCart("item") : tCart("items")}
        </p>
      </CardHeader>

      {/* Items List */}
      <CardContent className="border-b border-teal-800">
        <div className="space-y-4">
          {items.map((item) => (
            <OrderSummaryItem key={item.id} item={item} locale={locale} />
          ))}
        </div>
      </CardContent>

      {/* Delivery Method Section */}
      {deliveryMethod && (
        <CardContent className="border-b border-teal-800">
          <h3 className="text-sm font-semibold text-teal-800 mb-3">
            {tProduct("deliveryMethod.title")}
          </h3>
          <div className="bg-teal-50 rounded-lg p-3">
            {deliveryMethod === "delivery" ? (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-teal-800">
                    {tProduct("deliveryMethod.delivery.label")}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    {tProduct("deliveryMethod.delivery.badge")}
                  </span>
                </div>
                <p className="text-xs text-teal-800">
                  {tProduct("deliveryMethod.delivery.description")}
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-teal-800">
                    {tProduct("deliveryMethod.pickup.label")}
                  </span>
                </div>
                <p className="text-xs text-teal-800 mb-2">
                  {tProduct("deliveryMethod.pickup.description")}
                </p>
                <div className="text-xs text-teal-800 space-y-1 bg-amber-200 rounded p-2">
                  <p className="font-medium">{tProduct("deliveryMethod.pickup.address")}</p>
                  <p>{tProduct("deliveryMethod.pickup.hours")}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      )}

      {/* Pricing Breakdown */}
      <CardFooter className="flex-col space-y-3">
        {/* Subtotal */}
        <div className="flex justify-between items-center w-full">
          <span className="text-teal-800">{tCart("subtotal")}</span>
          <span className="font-medium text-teal-800">
            {formatPrice(subtotal, locale as "cs" | "en")}
          </span>
        </div>

        {/* Delivery Cost */}
        <div className="flex justify-between items-center w-full">
          <span className="text-teal-800">{tCart("shipping")}</span>
          <span className="font-medium text-teal-800">
            {deliveryCost > 0 ? formatPrice(deliveryCost, locale as "cs" | "en") : t("free")}
          </span>
        </div>

        {/* Estimated Delivery Date */}
        {estimatedDeliveryDate && (
          <div className="flex justify-between items-center text-sm w-full">
            <span className="text-teal-800">{tDelivery("cost.estimatedDelivery")}</span>
            <span className="text-teal-800">
              {estimatedDeliveryDate.toLocaleDateString(locale === "cs" ? "cs-CZ" : "en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        )}

        {/* Total */}
        <div className="pt-3 border-t border-teal-800 w-full">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-teal-800">{tCart("total")}</span>
            <span className="text-xl font-bold text-teal-800">
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
    <div className="flex items-start space-x-3 p-3 border border-teal-800 rounded-lg bg-teal-50/50">
      {/* Product Image */}
      <div className="flex-shrink-0 w-16 h-16 bg-teal-800 rounded-lg overflow-hidden shadow-sm">
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt}
            width={96}
            height={96}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingCartIcon className="w-6 h-6 text-teal-800" />
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-teal-800 truncate">{productName}</h4>

        {/* Customizations */}
        {item.customizations && item.customizations.length > 0 && (
          <div className="mt-1 space-y-1">
            {item.customizations.map((customization, index) => (
              <div key={index} className="text-xs text-teal-800">
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
          <span className="text-xs text-teal-800">
            {tCart("quantity")}: {item.quantity}
          </span>
          <span className="text-sm font-medium text-teal-800">
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
  deliveryMethod,
  className = "",
}: Omit<OrderSummaryProps, "estimatedDeliveryDate" | "isLoading"> & {
  deliveryMethod?: "delivery" | "pickup" | null;
}) {
  const t = useTranslations("checkout");
  const tCart = useTranslations("cart");
  const tProduct = useTranslations("product");

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Card className={className} variant="outlined">
      <CardContent className="bg-teal-50">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-teal-800">{t("orderSummary")}</span>
          <span className="text-sm text-teal-800">
            {itemCount} {itemCount === 1 ? tCart("item") : tCart("items")}
          </span>
        </div>

        <div className="space-y-2 text-sm">
          {/* Delivery Method */}
          {deliveryMethod && (
            <div className="pb-2 mb-2 border-b border-teal-800">
              <div className="flex items-center justify-between">
                <span className="text-teal-800 font-medium">
                  {tProduct("deliveryMethod.title")}
                </span>
                {deliveryMethod === "delivery" && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    {tProduct("deliveryMethod.delivery.badge")}
                  </span>
                )}
              </div>
              <p className="text-xs text-teal-800 mt-1">
                {deliveryMethod === "delivery"
                  ? tProduct("deliveryMethod.delivery.label")
                  : tProduct("deliveryMethod.pickup.label")}
              </p>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-teal-800">{tCart("subtotal")}</span>
            <span>{formatPrice(subtotal, locale as "cs" | "en")}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-teal-800">{tCart("shipping")}</span>
            <span>{formatPrice(deliveryCost, locale as "cs" | "en")}</span>
          </div>

          <div className="pt-2 border-t border-teal-800">
            <div className="flex justify-between font-semibold">
              <span>{tCart("total")}</span>
              <span className="text-teal-800">
                {formatPrice(totalAmount, locale as "cs" | "en")}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
