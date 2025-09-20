"use client";

import { useState } from "react";
import { useLocaleSwitch, useSafeTranslations } from "@/lib/i18n/hooks";
import { type Locale } from "@/i18n/config";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface LanguageToggleProps {
  currentLocale: string;
  variant?: "select" | "buttons";
  showLabels?: boolean;
  className?: string;
}

export function LanguageToggle({
  currentLocale,
  variant = "select",
  showLabels = true,
  className = ""
}: LanguageToggleProps) {
  const {
    switchLocale,
    isLoading,
    error,
    clearError,
    availableLocales,
    localeNames
  } = useLocaleSwitch();
  const { t } = useSafeTranslations("common");
  const [showError, setShowError] = useState(false);

  const handleLocaleChange = async (newLocale: Locale) => {
    clearError();
    await switchLocale(newLocale);

    if (error) {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    }
  };

  if (variant === "buttons") {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {availableLocales.map((locale) => (
          <button
            key={locale}
            onClick={() => handleLocaleChange(locale)}
            disabled={isLoading || locale === currentLocale}
            className={`
              px-3 py-1 text-sm font-medium rounded-md transition-colors
              ${locale === currentLocale
                ? "bg-primary-100 text-primary-700 cursor-default"
                : "bg-white text-neutral-700 hover:bg-primary-50 hover:text-primary-700 border border-neutral-300"
              }
              ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
            `}
            aria-label={`${t("switchTo")} ${localeNames[locale]}`}
            aria-pressed={locale === currentLocale}
          >
            {isLoading && locale !== currentLocale ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                {showLabels ? localeNames[locale] : locale.toUpperCase()}
              </>
            )}
          </button>
        ))}

        {showError && error && (
          <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <select
        value={currentLocale}
        onChange={(e) => handleLocaleChange(e.target.value as Locale)}
        disabled={isLoading}
        className={`
          appearance-none bg-white border border-neutral-300 rounded-md px-3 py-1 text-sm text-neutral-700
          hover:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
          cursor-pointer transition-colors
          ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
        `}
        aria-label={t("selectLanguage")}
      >
        {availableLocales.map((locale) => (
          <option key={locale} value={locale}>
            {showLabels ? localeNames[locale] : locale.toUpperCase()}
          </option>
        ))}
      </select>

      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        {isLoading ? (
          <LoadingSpinner size="sm" />
        ) : (
          <svg
            className="w-4 h-4 text-neutral-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </div>

      {showError && error && (
        <div className="absolute top-full left-0 mt-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded shadow-sm z-10">
          {error}
        </div>
      )}
    </div>
  );
}
