import { currencyConfig, type Locale } from "@/i18n/config";

/**
 * Format currency based on locale
 */
export function formatCurrency(amount: number, locale: Locale): string {
  const config = currencyConfig[locale];

  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: config.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format currency with custom symbol placement for Czech locale
 */
export function formatCurrencyCustom(amount: number, locale: Locale): string {
  const config = currencyConfig[locale];

  if (locale === "cs") {
    // Czech format: "1 234 Kč"
    const formatted = new Intl.NumberFormat("cs-CZ").format(amount);
    return `${formatted} ${config.symbol}`;
  } else {
    // English format: "1,234 CZK"
    const formatted = new Intl.NumberFormat("en-US").format(amount);
    return `${formatted} ${config.symbol}`;
  }
}

/**
 * Format date based on locale
 */
export function formatDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(currencyConfig[locale].locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

/**
 * Format date for delivery calendar
 */
export function formatDeliveryDate(date: Date, locale: Locale): string {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

  // Check if date is today, tomorrow, or day after tomorrow
  if (date.toDateString() === today.toDateString()) {
    return locale === "cs" ? "Dnes" : "Today";
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return locale === "cs" ? "Zítra" : "Tomorrow";
  } else if (date.toDateString() === dayAfterTomorrow.toDateString()) {
    return locale === "cs" ? "Pozítří" : "Day After Tomorrow";
  }

  // Otherwise format normally
  return formatDate(date, locale);
}

/**
 * Get localized content from multilingual object
 */
export function getLocalizedContent<T>(
  content: Record<Locale, T>,
  locale: Locale,
  fallback?: Locale
): T {
  return content[locale] || content[fallback || "cs"];
}

/**
 * Pluralize based on count and locale
 */
export function pluralize(count: number, singular: string, plural: string, locale: Locale): string {
  if (locale === "cs") {
    // Czech pluralization rules (simplified)
    if (count === 1) return singular;
    if (count >= 2 && count <= 4) return plural;
    return plural; // for 5+ use plural form
  } else {
    // English pluralization
    return count === 1 ? singular : plural;
  }
}

/**
 * Get relative time string
 */
export function getRelativeTime(date: Date, locale: Locale): string {
  const rtf = new Intl.RelativeTimeFormat(currencyConfig[locale].locale, {
    numeric: "auto",
  });

  const now = new Date();
  const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (Math.abs(diffInDays) >= 1) {
    return rtf.format(diffInDays, "day");
  } else if (Math.abs(diffInHours) >= 1) {
    return rtf.format(diffInHours, "hour");
  } else if (Math.abs(diffInMinutes) >= 1) {
    return rtf.format(diffInMinutes, "minute");
  } else {
    return rtf.format(diffInSeconds, "second");
  }
}
