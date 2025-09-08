'use client';

import { useCurrency } from '@/lib/i18n/hooks';

interface CurrencyDisplayProps {
  amount: number;
  className?: string;
  custom?: boolean;
}

/**
 * Component for displaying currency with proper locale formatting
 */
export function CurrencyDisplay({ amount, className, custom = false }: CurrencyDisplayProps) {
  const { format, formatCustom } = useCurrency();

  const formattedAmount = custom ? formatCustom(amount) : format(amount);

  return (
    <span className={className} suppressHydrationWarning>
      {formattedAmount}
    </span>
  );
}

/**
 * Component for displaying price ranges
 */
interface PriceRangeProps {
  minPrice: number;
  maxPrice: number;
  className?: string;
  custom?: boolean;
}

export function PriceRange({ minPrice, maxPrice, className, custom = false }: PriceRangeProps) {
  const { format, formatCustom } = useCurrency();

  const formatPrice = custom ? formatCustom : format;

  if (minPrice === maxPrice) {
    return (
      <span className={className} suppressHydrationWarning>
        {formatPrice(minPrice)}
      </span>
    );
  }

  return (
    <span className={className} suppressHydrationWarning>
      {formatPrice(minPrice)} - {formatPrice(maxPrice)}
    </span>
  );
}
