"use client";

import { useLocale } from "next-intl";
import type { Locale } from "@/i18n/config";
import { formatCurrency, formatCurrencyCustom, formatDate, formatDeliveryDate } from "./utils";

/**
 * Hook for currency formatting
 */
export function useCurrency() {
  const locale = useLocale() as Locale;

  return {
    format: (amount: number) => formatCurrency(amount, locale),
    formatCustom: (amount: number) => formatCurrencyCustom(amount, locale),
  };
}

/**
 * Hook for date formatting
 */
export function useDate() {
  const locale = useLocale() as Locale;

  return {
    format: (date: Date) => formatDate(date, locale),
    formatDelivery: (date: Date) => formatDeliveryDate(date, locale),
  };
}

/**
 * Hook for locale-aware utilities
 */
export function useLocaleUtils() {
  const locale = useLocale() as Locale;

  return {
    locale,
    isRTL: false, // Neither Czech nor English are RTL
    currency: locale === "cs" ? "CZK" : "CZK",
    currencySymbol: locale === "cs" ? "Kč" : "CZK",
  };
}
