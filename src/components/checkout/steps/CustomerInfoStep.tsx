"use client";

import { BuildingOfficeIcon, EnvelopeIcon, PhoneIcon, UserIcon } from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";
import React from "react";
import { Input } from "@/components/ui/Input";
import type { CustomerInfo } from "@/types/order";

interface CustomerInfoStepProps {
  customerInfo: Partial<CustomerInfo>;
  errors?: Partial<Record<keyof CustomerInfo, string>>;
  onChange: (customerInfo: Partial<CustomerInfo>) => void;
  locale: string;
}

export function CustomerInfoStep({
  customerInfo,
  errors = {},
  onChange,
  locale,
}: CustomerInfoStepProps) {
  const t = useTranslations("checkout");

  const handleChange = (field: keyof CustomerInfo, value: string) => {
    onChange({
      ...customerInfo,
      [field]: value,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-elegant text-2xl font-semibold text-primary-800 mb-2">
          {t("customerInfo")}
        </h2>
        <p className="text-neutral-600">Zadejte své kontaktní údaje pro doručení objednávky.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* First Name */}
        <div>
          <Input
            id="firstName"
            label={`${t("firstName")} *`}
            type="text"
            value={customerInfo.firstName || ""}
            onChange={(e) => handleChange("firstName", e.target.value)}
            {...(errors.firstName && { error: errors.firstName })}
            placeholder="Zadejte své jméno"
            required
          />
        </div>

        {/* Last Name */}
        <div>
          <Input
            id="lastName"
            label={`${t("lastName")} *`}
            type="text"
            value={customerInfo.lastName || ""}
            onChange={(e) => handleChange("lastName", e.target.value)}
            {...(errors.lastName && { error: errors.lastName })}
            placeholder="Zadejte své příjmení"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Email */}
        <div>
          <Input
            id="email"
            label={`${t("email")} *`}
            type="email"
            value={customerInfo.email || ""}
            onChange={(e) => handleChange("email", e.target.value)}
            {...(errors.email && { error: errors.email })}
            placeholder="vas@email.cz"
            required
          />
          <p className="mt-1 text-xs text-neutral-500">
            Na tento e-mail vám pošleme potvrzení objednávky.
          </p>
        </div>

        {/* Phone */}
        <div>
          <Input
            id="phone"
            label={`${t("phone")} *`}
            type="tel"
            value={customerInfo.phone || ""}
            onChange={(e) => handleChange("phone", e.target.value)}
            {...(errors.phone && { error: errors.phone })}
            placeholder="+420 123 456 789"
            required
          />
          <p className="mt-1 text-xs text-neutral-500">Telefon pro případné dotazy k objednávce.</p>
        </div>
      </div>

      {/* Company (Optional) */}
      <div>
        <Input
          id="company"
          label="Společnost (volitelné)"
          type="text"
          value={customerInfo.company || ""}
          onChange={(e) => handleChange("company", e.target.value)}
          error={errors.company}
          placeholder="Název společnosti"
        />
      </div>

      {/* Note (Optional) */}
      <div>
        <label htmlFor="note" className="block text-sm font-medium text-neutral-700 mb-2">
          Poznámka k objednávce (volitelné)
        </label>
        <textarea
          id="note"
          value={customerInfo.note || ""}
          onChange={(e) => handleChange("note", e.target.value)}
          placeholder="Jakékoliv speciální požadavky nebo poznámky..."
          rows={3}
          className={`
            w-full px-4 py-3 border rounded-lg resize-none
            focus:ring-2 focus:ring-primary-500 focus:border-primary-500
            ${errors.note ? "border-red-300 bg-red-50" : "border-neutral-300 bg-white"}
          `}
        />
        {errors.note && <p className="mt-1 text-sm text-red-600">{errors.note}</p>}
        <p className="mt-1 text-xs text-neutral-500">Maximálně 500 znaků</p>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Ochrana osobních údajů</h3>
            <p className="mt-1 text-sm text-blue-700">
              Vaše osobní údaje používáme pouze pro zpracování objednávky a jsou chráněny podle
              GDPR. Více informací najdete v našich{" "}
              <a href="/privacy" className="underline">
                zásadách ochrany osobních údajů
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
