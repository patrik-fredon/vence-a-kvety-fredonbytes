"use client";

import { MapPinIcon, TruckIcon, UserIcon } from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { Input } from "@/components/ui/Input";
import type { CartItem } from "@/types/cart";
import type { DeliveryInfo } from "@/types/order";

interface DeliveryInfoStepProps {
  deliveryInfo: Partial<DeliveryInfo>;
  errors?: Partial<Record<keyof DeliveryInfo, string>>;
  onChange: (deliveryInfo: Partial<DeliveryInfo>) => void;
  locale?: string;
  cartItems?: CartItem[];
}

export function DeliveryInfoStep({
  deliveryInfo,
  errors = {},
  onChange,
  cartItems = [],
}: DeliveryInfoStepProps) {
  const t = useTranslations("checkout");
  const tProduct = useTranslations("product");

  // Extract delivery method from cart items
  const deliveryMethod = useMemo(() => {
    for (const item of cartItems) {
      const deliveryCustomization = item.customizations?.find(
        (c) => c.optionId === "delivery_method"
      );
      if (deliveryCustomization && deliveryCustomization.choiceIds.length > 0) {
        const choiceId = deliveryCustomization.choiceIds[0];
        if (choiceId === "delivery_address") return "delivery";
        if (choiceId === "personal_pickup") return "pickup";
      }
    }
    return null;
  }, [cartItems]);

  const handleAddressChange = (field: string, value: string) => {
    const currentAddress = deliveryInfo.address || {
      street: "",
      city: "",
      postalCode: "",
      country: "CZ",
    };

    const newAddress = {
      ...currentAddress,
      [field]: value,
    };

    onChange({
      ...deliveryInfo,
      address: newAddress,
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-elegant text-2xl font-semibold text-amber-300 mb-2">
          {t("deliveryInfo")}
        </h2>
        <p className="text-amber-100">Zadejte adresu doručení a kontaktní údaje.</p>
      </div>

      {/* Delivery Address */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-amber-100 flex items-center">
          <MapPinIcon className="w-5 h-5 mr-2" />
          Adresa doručení
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {/* Street Address */}
          <div>
            <label htmlFor="street" className="block text-sm font-medium text-amber-100 mb-2">
              Ulice a číslo popisné *
            </label>
            <Input
              id="street"
              type="text"
              value={deliveryInfo.address?.street || ""}
              onChange={(e) => handleAddressChange("street", e.target.value)}
              error={errors.address || ""}
              placeholder="Např. Václavské náměstí 1"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* City */}
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-amber-100 mb-2">
                Město *
              </label>
              <Input
                id="city"
                type="text"
                value={deliveryInfo.address?.city || ""}
                onChange={(e) => handleAddressChange("city", e.target.value)}
                error={errors.address || ""}
                placeholder="Praha"
                required
              />
            </div>

            {/* Postal Code */}
            <div>
              <label
                htmlFor="postalCode"
                className="block text-sm font-medium text-amber-100 mb-2"
              >
                PSČ *
              </label>
              <Input
                id="postalCode"
                type="text"
                value={deliveryInfo.address?.postalCode || ""}
                onChange={(e) => handleAddressChange("postalCode", e.target.value)}
                error={errors.address || ""}
                placeholder="110 00"
                required
              />
            </div>

            {/* Country */}
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-amber-100 mb-2">
                Země *
              </label>
              <select
                id="country"
                value={deliveryInfo.address?.country || "CZ"}
                onChange={(e) => handleAddressChange("country", e.target.value)}
                className="w-full px-4 py-3 border border-amber-100 rounded-lg bg-amber-100 text-teal-800 "
                required
              >
                <option value="CZ">Česká republika</option>
                <option value="SK">Slovensko</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Recipient Information (Optional) */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-amber-100 flex items-center">
          <UserIcon className="w-5 h-5 mr-2" />
          Informace o příjemci (volitelné)
        </h3>

        <p className="text-sm text-amber-100">
          Pokud se liší od objednavatele, zadejte kontakt na příjemce.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="recipientName"
              className="block text-sm font-medium text-amber-100 mb-2"
            >
              Jméno příjemce
            </label>
            <Input
              id="recipientName"
              type="text"
              value={deliveryInfo.recipientName || ""}
              onChange={(e) => onChange({ ...deliveryInfo, recipientName: e.target.value })}
              error={errors.recipientName || ""}
              placeholder="Jméno a příjmení příjemce"
            />
          </div>

          <div>
            <label
              htmlFor="recipientPhone"
              className="block text-sm font-medium text-amber-100 mb-2"
            >
              Telefon příjemce
            </label>
            <Input
              id="recipientPhone"
              type="tel"
              value={deliveryInfo.recipientPhone || ""}
              onChange={(e) => onChange({ ...deliveryInfo, recipientPhone: e.target.value })}
              error={errors.recipientPhone || ""}
              placeholder="+420 123 456 789"
            />
          </div>
        </div>
      </div>

      {/* Special Instructions */}
      <div>
        <label
          htmlFor="specialInstructions"
          className="block text-sm font-medium text-amber-100 mb-2"
        >
          Speciální pokyny pro doručení (volitelné)
        </label>
        <textarea
          id="specialInstructions"
          value={deliveryInfo.specialInstructions || ""}
          onChange={(e) => onChange({ ...deliveryInfo, specialInstructions: e.target.value })}
          placeholder="Např. 'Zazvonit u vrátnice', 'Nechat u sousedů', apod."
          rows={3}
          className={`
            w-full px-4 py-3 border rounded-lg resize-none

            ${errors.specialInstructions
              ? "border-red-300 bg-red-50"
              : "border-amber-100 bg-amber-100 text-teal-800"
            }
          `}
        />
        {errors.specialInstructions && (
          <p className="mt-1 text-sm text-red-600">{errors.specialInstructions}</p>
        )}
        <p className="mt-1 text-xs text-amber-100">Maximálně 500 znaků</p>
      </div>

      {/* Delivery Method Info Box */}
      {deliveryMethod && (
        <div className="bg-teal-800 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <TruckIcon className="w-6 h-6 text-amber-300" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-amber-300 mb-2">
                Vybraný způsob doručení
              </h3>

              {deliveryMethod === "delivery" ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-semibold text-amber-100">
                      {tProduct("deliveryMethod.delivery.label")}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      {tProduct("deliveryMethod.delivery.badge")}
                    </span>
                  </div>
                  <p className="text-sm text-amber-100">
                    {tProduct("deliveryMethod.delivery.description")}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-semibold text-amber-100">
                      {tProduct("deliveryMethod.pickup.label")}
                    </span>
                  </div>
                  <p className="text-sm text-amber-100 mb-2">
                    {tProduct("deliveryMethod.pickup.description")}
                  </p>
                  <div className="text-sm text-amber-100 space-y-1 bg-teal-900 rounded p-3 border border-amber-300">
                    <p className="font-medium text-amber-300">
                      {tProduct("deliveryMethod.pickup.address")}
                    </p>
                    <p>{tProduct("deliveryMethod.pickup.hours")}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Info Box - No delivery method selected */}
      {!deliveryMethod && (
        <div className="bg-amber-100 border border-amber-300 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="w-5 h-5 text-amber-600 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-800">Upozornění</h3>
              <p className="mt-1 text-sm text-amber-700">
                Způsob doručení nebyl vybrán. Vraťte se prosím do košíku a vyberte způsob doručení
                při konfiguraci produktu.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
