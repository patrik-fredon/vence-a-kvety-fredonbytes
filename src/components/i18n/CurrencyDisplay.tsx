'use client';

import { useTranslations } from 'next-intl';
import { currencyConfig, type Locale } from '../../i18n/config';

interface CurrencyDisplayProps {
  amount: number | null | undefined;
  locale?: Locale;
  className?: string;
  showSymbol?: boolean;
}

export function CurrencyDisplay({
  amount,
  locale = 'cs',
  className = '',
  showSymbol = true
}: CurrencyDisplayProps) {
  const t = useTranslations('currency');

  // Handle invalid amounts
  if (amount === null || amount === undefined || isNaN(amount)) {
    return (
      <span className={className} data-testid="currency-display">
        {showSymbol ? (locale === 'cs' ? '0 Kč' : '0 CZK') : '0'}
      </span>
    );
  }

  const config = currencyConfig[locale];

  // Format the number according to locale
  const formattedAmount = amount.toLocaleString(config.locale, {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });

  // Apply currency symbol based on locale
  const displayValue = showSymbol
    ? t('format', { amount: formattedAmount })
    : formattedAmount;

  return (
    <span className={className} data-testid="currency-display">
      {displayValue}
    </span>
  );
}

// Utility function for formatting currency without component
export function formatCurrency(
  amount: number,
  locale: Locale = 'cs',
  showSymbol: boolean = true
): string {
  if (isNaN(amount)) return showSymbol ? (locale === 'cs' ? '0 Kč' : '0 CZK') : '0';

  const config = currencyConfig[locale];
  const formattedAmount = amount.toLocaleString(config.locale, {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });

  if (!showSymbol) return formattedAmount;

  // Use the translation format
  return locale === 'cs'
    ? `${formattedAmount} Kč`
    : `${formattedAmount} CZK`;
}
