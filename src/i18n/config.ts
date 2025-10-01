export const locales = ["cs", "en"] as const;
export const defaultLocale = "cs" as const;

export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  cs: "Čeština",
  en: "English",
};

export const currencyConfig = {
  cs: {
    currency: "CZK",
    locale: "cs-CZ",
    symbol: "Kč",
  },
  en: {
    currency: "CZK",
    locale: "en-US",
    symbol: "CZK",
  },
} as const;

// Enhanced i18n configuration
export const i18nConfig = {
  locales,
  defaultLocale,
  localeNames,
  currencyConfig,
  // Persistence settings
  persistence: {
    cookieName: "NEXT_LOCALE",
    cookieMaxAge: 365 * 24 * 60 * 60, // 1 year in seconds
    storageKey: "preferred-locale",
  },
  // Fallback settings
  fallback: {
    enabled: true,
    showMissingKeys: process.env['NODE_ENV'] === "development",
    logMissingKeys: process.env['NODE_ENV'] === "development",
  },
  // Validation settings
  validation: {
    enabled: process.env['NODE_ENV'] === "development",
    strictMode: false, // Set to true to throw errors on missing keys
  },
} as const;

export type I18nConfig = typeof i18nConfig;
