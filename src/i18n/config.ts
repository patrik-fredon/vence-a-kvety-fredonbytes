export const locales = ['cs', 'en'] as const;
export const defaultLocale = 'cs' as const;

export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  cs: 'Čeština',
  en: 'English',
};

export const currencyConfig = {
  cs: {
    currency: 'CZK',
    locale: 'cs-CZ',
    symbol: 'Kč',
  },
  en: {
    currency: 'CZK',
    locale: 'en-US',
    symbol: 'CZK',
  },
} as const;
