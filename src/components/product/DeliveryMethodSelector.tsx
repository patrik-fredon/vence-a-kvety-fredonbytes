"use client";

import { useId, useState } from "react";
import { HomeIcon, TruckIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

export interface DeliveryMethodSelectorProps {
  value?: "delivery" | "pickup" | undefined;
  onChange: (method: "delivery" | "pickup") => void;
  locale: string;
  className?: string;
}

interface DeliveryMethodOption {
  id: "delivery" | "pickup";
  icon: React.ComponentType<{ className?: string }>;
  labelKey: string;
  descriptionKey: string;
  badgeKey?: string;
  additionalInfo?: {
    addressKey: string;
    hoursKey: string;
  };
}

const deliveryMethods: DeliveryMethodOption[] = [
  {
    id: "delivery",
    icon: TruckIcon,
    labelKey: "product.deliveryMethod.delivery.label",
    descriptionKey: "product.deliveryMethod.delivery.description",
    badgeKey: "product.deliveryMethod.delivery.badge",
  },
  {
    id: "pickup",
    icon: HomeIcon,
    labelKey: "product.deliveryMethod.pickup.label",
    descriptionKey: "product.deliveryMethod.pickup.description",
    additionalInfo: {
      addressKey: "product.deliveryMethod.pickup.address",
      hoursKey: "product.deliveryMethod.pickup.hours",
    },
  },
];

export function DeliveryMethodSelector({
  value,
  onChange,
  locale,
  className,
}: DeliveryMethodSelectorProps) {
  const labelId = useId();
  const [announcement, setAnnouncement] = useState<string>("");
  // Translation helper - in a real app this would use next-intl
  const t = (key: string): string => {
    // This is a placeholder - the actual translations will be loaded from messages
    const translations: Record<string, Record<string, string>> = {
      cs: {
        "product.deliveryMethod.title": "Způsob doručení",
        "product.deliveryMethod.delivery.label": "Doručení na adresu",
        "product.deliveryMethod.delivery.description": "Doručíme na vámi uvedenou adresu",
        "product.deliveryMethod.delivery.badge": "Doprava zdarma",
        "product.deliveryMethod.pickup.label": "Osobní odběr",
        "product.deliveryMethod.pickup.description": "Vyzvedněte si v naší provozovně",
        "product.deliveryMethod.pickup.address": "Adresa provozovny, Praha",
        "product.deliveryMethod.pickup.hours": "Po-Pá: 9:00-17:00",
        "product.deliveryMethod.required": "Vyberte prosím způsob doručení",
      },
      en: {
        "product.deliveryMethod.title": "Delivery method",
        "product.deliveryMethod.delivery.label": "Delivery to address",
        "product.deliveryMethod.delivery.description": "We will deliver to your specified address",
        "product.deliveryMethod.delivery.badge": "Free delivery",
        "product.deliveryMethod.pickup.label": "Personal pickup",
        "product.deliveryMethod.pickup.description": "Pick up at our office",
        "product.deliveryMethod.pickup.address": "Company Address, Prague",
        "product.deliveryMethod.pickup.hours": "Mon-Fri: 9:00-17:00",
        "product.deliveryMethod.required": "Please select a delivery method",
      },
    };
    return translations[locale]?.[key] || key;
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Header */}
      <h3 id={labelId} className="text-lg font-semibold text-teal-800">
        {t("product.deliveryMethod.title")}
      </h3>

      {/* Radio Group */}
      <div role="radiogroup" aria-labelledby={labelId} aria-required="true" className="space-y-3">
        {deliveryMethods.map((method) => {
          const Icon = method.icon;
          const isSelected = value === method.id;

          return (
            <button
              key={method.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-describedby={`${method.id}-description`}
              onClick={() => {
                onChange(method.id);
                setAnnouncement(`${t(method.labelKey)} selected`);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onChange(method.id);
                  setAnnouncement(`${t(method.labelKey)} selected`);
                }
              }}
              tabIndex={0}
              className={cn(
                "w-full p-4 rounded-lg border-2 transition-all duration-200",
                "flex items-start gap-4 text-left",
                "hover:border-teal-500 hover:shadow-md",
                "focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2",
                isSelected ? "border-teal-600 bg-teal-50 shadow-md" : "border-stone-300 bg-white"
              )}
            >
              {/* Radio Circle */}
              <div
                className={cn(
                  "flex-shrink-0 w-5 h-5 rounded-full border-2 mt-0.5",
                  "flex items-center justify-center transition-colors",
                  isSelected ? "border-teal-600 bg-teal-600" : "border-stone-400 bg-white"
                )}
                aria-hidden="true"
              >
                {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>

              {/* Icon */}
              <Icon
                className={cn(
                  "flex-shrink-0 w-6 h-6 mt-0.5",
                  isSelected ? "text-teal-700" : "text-stone-600"
                )}
                aria-hidden="true"
              />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={cn(
                      "font-semibold text-base",
                      isSelected ? "text-teal-900" : "text-stone-900"
                    )}
                  >
                    {t(method.labelKey)}
                  </span>
                  {/* Free Delivery Badge */}
                  {method.badgeKey && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-300">
                      {t(method.badgeKey)}
                    </span>
                  )}
                </div>

                <p
                  id={`${method.id}-description`}
                  className={cn("text-sm", isSelected ? "text-teal-700" : "text-stone-600")}
                >
                  {t(method.descriptionKey)}
                </p>

                {/* Additional Info for Pickup */}
                {method.additionalInfo && isSelected && (
                  <div className="mt-3 pt-3 border-t border-teal-200 space-y-1">
                    <p className="text-sm font-medium text-teal-800">
                      {t(method.additionalInfo.addressKey)}
                    </p>
                    <p className="text-sm text-teal-700">{t(method.additionalInfo.hoursKey)}</p>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Screen Reader Announcements */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>
    </div>
  );
}
