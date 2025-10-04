"use client";

import { useTranslations } from "next-intl";
import type { Locale } from "../../i18n/config";

interface DateDisplayProps {
  date: Date | string | null | undefined;
  locale?: Locale;
  className?: string;
  includeTime?: boolean;
  relative?: boolean;
  format?: "short" | "medium" | "long" | "full";
}

export function DateDisplay({
  date,
  locale = "cs",
  className = "",
  includeTime = false,
  relative = false,
  format = "short",
}: DateDisplayProps) {
  const t = useTranslations("date");

  // Handle invalid dates
  if (!date) {
    return (
      <span className={className} data-testid="date-display">
        -
      </span>
    );
  }

  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (Number.isNaN(dateObj.getTime())) {
    return (
      <span className={className} data-testid="date-display">
        -
      </span>
    );
  }

  // Handle relative dates
  if (relative) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(today.getDate() + 2);

    const isToday = dateObj.toDateString() === today.toDateString();
    const isTomorrow = dateObj.toDateString() === tomorrow.toDateString();
    const isDayAfterTomorrow = dateObj.toDateString() === dayAfterTomorrow.toDateString();

    if (isToday) {
      return (
        <span className={className} data-testid="date-display">
          {t("today")}
        </span>
      );
    }

    if (isTomorrow) {
      return (
        <span className={className} data-testid="date-display">
          {t("tomorrow")}
        </span>
      );
    }

    if (isDayAfterTomorrow) {
      return (
        <span className={className} data-testid="date-display">
          {t("dayAfterTomorrow")}
        </span>
      );
    }
  }

  // Format options based on locale
  const localeString = locale === "cs" ? "cs-CZ" : "en-US";

  let formatOptions: Intl.DateTimeFormatOptions = {};

  switch (format) {
    case "short":
      formatOptions = {
        year: "numeric",
        month: "numeric",
        day: "numeric",
      };
      break;
    case "medium":
      formatOptions = {
        year: "numeric",
        month: "short",
        day: "numeric",
      };
      break;
    case "long":
      formatOptions = {
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      break;
    case "full":
      formatOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      break;
  }

  if (includeTime) {
    formatOptions.hour = "2-digit";
    formatOptions.minute = "2-digit";

    // Czech uses 24-hour format, English uses 12-hour format
    if (locale === "en") {
      formatOptions.hour12 = true;
    }
  }

  const formattedDate = dateObj.toLocaleDateString(localeString, formatOptions);

  // For Czech locale with time, we might need to adjust the format
  const displayValue =
    includeTime && locale === "cs"
      ? formattedDate.replace(",", "") // Remove comma between date and time in Czech
      : formattedDate;

  return (
    <span className={className} data-testid="date-display">
      {displayValue}
    </span>
  );
}

// Utility function for formatting dates without component
export function formatDate(
  date: Date | string,
  locale: Locale = "cs",
  options: {
    includeTime?: boolean;
    relative?: boolean;
    format?: "short" | "medium" | "long" | "full";
  } = {}
): string {
  const { includeTime = false, relative = false, format = "short" } = options;

  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (Number.isNaN(dateObj.getTime())) return "-";

  // Handle relative dates
  if (relative) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const isToday = dateObj.toDateString() === today.toDateString();
    const isTomorrow = dateObj.toDateString() === tomorrow.toDateString();

    if (isToday) return locale === "cs" ? "Dnes" : "Today";
    if (isTomorrow) return locale === "cs" ? "Zítra" : "Tomorrow";
  }

  const localeString = locale === "cs" ? "cs-CZ" : "en-US";

  let formatOptions: Intl.DateTimeFormatOptions = {};

  switch (format) {
    case "short":
      formatOptions = { year: "numeric", month: "numeric", day: "numeric" };
      break;
    case "medium":
      formatOptions = { year: "numeric", month: "short", day: "numeric" };
      break;
    case "long":
      formatOptions = { year: "numeric", month: "long", day: "numeric" };
      break;
    case "full":
      formatOptions = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
      break;
  }

  if (includeTime) {
    formatOptions.hour = "2-digit";
    formatOptions.minute = "2-digit";
    if (locale === "en") {
      formatOptions.hour12 = true;
    }
  }

  return dateObj.toLocaleDateString(localeString, formatOptions);
}
