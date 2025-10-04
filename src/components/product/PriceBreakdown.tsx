"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import type { CustomizationPriceBreakdown } from "@/lib/utils/price-calculator";

interface PriceBreakdownProps {
  basePrice?: number;
  breakdown?: CustomizationPriceBreakdown[];
  totalPrice?: number;
  locale: string;
  className?: string;
  showDetails?: boolean;
}

export function PriceBreakdown({
  basePrice = 0,
  breakdown = [], // Add default empty array
  totalPrice = 0,
  locale,
  className,
  showDetails = false,
}: PriceBreakdownProps) {
  const t = useTranslations("product");
  const tCurrency = useTranslations("currency");

  const formatPrice = (price: number | undefined | null) => {
    if (price === undefined || price === null || Number.isNaN(price)) {
      return tCurrency("format", {
        amount: "0",
      });
    }
    return tCurrency("format", {
      amount: price.toLocaleString(locale === "cs" ? "cs-CZ" : "en-US"),
    });
  };

  // Safe check for breakdown array
  const totalModifications = breakdown?.reduce((sum, item) => sum + item.totalModifier, 0) || 0;
  const hasModifications = totalModifications !== 0;

  return (
    <Card className={cn("bg-stone-50", className)}>
      <CardContent className="py-4">
        <div className="space-y-3">
          {/* Base Price */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-stone-600">{t("basePrice")}</span>
            <span className="text-sm font-medium">{formatPrice(basePrice)}</span>
          </div>

          {/* Customization Breakdown */}
          {hasModifications && showDetails && breakdown && (
            <div className="space-y-2 border-t border-stone-200 pt-3">
              <div className="text-xs font-medium text-stone-500 uppercase tracking-wide">
                {t("customizations")}
              </div>
              {breakdown.map((item) => (
                <div key={item.optionId} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-stone-600">
                      {item.optionName[locale as keyof typeof item.optionName]}
                    </span>
                    <span
                      className={cn(
                        "text-sm font-medium",
                        item.totalModifier > 0
                          ? "text-amber-600"
                          : item.totalModifier < 0
                            ? "text-green-600"
                            : "text-stone-500"
                      )}
                    >
                      {item.totalModifier > 0 ? "+" : ""}
                      {formatPrice(item.totalModifier)}
                    </span>
                  </div>

                  {/* Choice Details */}
                  {item.choices?.map((choice) => (
                    <div key={choice.choiceId} className="flex items-center justify-between ml-4">
                      <span className="text-xs text-stone-500">
                        {choice.label[locale as keyof typeof choice.label]}
                      </span>
                      <span className="text-xs text-stone-400">
                        {choice.priceModifier > 0 ? "+" : ""}
                        {formatPrice(choice.priceModifier)}
                      </span>
                    </div>
                  ))}

                  {/* Custom Value */}
                  {item.customValue && (
                    <div className="ml-4">
                      <span className="text-xs text-stone-500 italic">"{item.customValue}"</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Total Price */}
          <div className="flex items-center justify-between border-t border-stone-200 pt-3">
            <span className="text-base font-semibold text-stone-900">{t("totalPrice")}</span>
            <span className="text-base font-bold text-amber-600">{formatPrice(totalPrice)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
