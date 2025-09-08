'use client';

import { useCurrency } from '@/lib/i18n/hooks';

export function CurrencyExample() {
  const { format, formatCustom } = useCurrency();

  const examplePrices = [1500, 2500, 3750, 5000];

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold mb-4">Currency Formatting Examples</h3>
      <div className="space-y-2">
        {examplePrices.map((price) => (
          <div key={price} className="flex justify-between">
            <span>Price {price}:</span>
            <div className="space-x-4">
              <span className="text-sm text-gray-600">Standard: {format(price)}</span>
              <span className="text-sm text-gray-600">Custom: {formatCustom(price)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
