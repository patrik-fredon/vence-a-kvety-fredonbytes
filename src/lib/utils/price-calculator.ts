import type { Customization } from "@/types/product";

export interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface Discount {
  type: "percentage" | "fixed";
  value: number;
  code: string;
}

export interface DiscountResult {
  finalPrice: number;
  totalDiscount: number;
  appliedDiscounts: Discount[];
}

/**
 * Calculate total price including customizations
 */
export function calculateTotalPrice(basePrice: number, customizations: Customization[]): number {
  let total = basePrice;

  for (const customization of customizations) {
    if (customization.priceModifier) {
      total += customization.priceModifier;
    }
  }

  // Ensure price is not negative
  return Math.max(0, total);
}

/**
 * Calculate delivery fee based on address and delivery options
 */
export function calculateDeliveryFee(
  address: Address,
  deliveryDate: Date,
  isExpress: boolean = false
): number {
  let baseFee = 0;

  // Base delivery fee by city
  const cityRates: Record<string, number> = {
    Praha: 200,
    Brno: 250,
    Ostrava: 300,
    Plzeň: 280,
    Liberec: 320,
    Olomouc: 290,
    "České Budějovice": 310,
    "Hradec Králové": 300,
    Pardubice: 290,
    Zlín: 280,
  };

  baseFee = cityRates[address.city] || 350; // Default rate for other cities

  // Express delivery surcharge
  if (isExpress) {
    baseFee *= 1.5;
  }

  // Weekend delivery surcharge
  const dayOfWeek = deliveryDate.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    // Sunday or Saturday
    baseFee += 100;
  }

  // Holiday surcharge (simplified - in real app would check holiday calendar)
  const isHoliday = isPublicHoliday(deliveryDate);
  if (isHoliday) {
    baseFee += 150;
  }

  return Math.round(baseFee);
}

/**
 * Apply discounts to a price
 */
export function applyDiscounts(originalPrice: number, discounts: Discount[]): DiscountResult {
  let currentPrice = originalPrice;
  let totalDiscount = 0;
  const appliedDiscounts: Discount[] = [];

  for (const discount of discounts) {
    let discountAmount = 0;

    if (discount.type === "percentage") {
      if (discount.value > 0 && discount.value <= 100) {
        discountAmount = (currentPrice * discount.value) / 100;
      }
    } else if (discount.type === "fixed") {
      if (discount.value > 0) {
        discountAmount = Math.min(discount.value, currentPrice);
      }
    }

    if (discountAmount > 0) {
      currentPrice -= discountAmount;
      totalDiscount += discountAmount;
      appliedDiscounts.push(discount);
    }
  }

  return {
    finalPrice: Math.max(0, currentPrice),
    totalDiscount,
    appliedDiscounts,
  };
}

/**
 * Check if a date is a public holiday (simplified implementation)
 */
function isPublicHoliday(date: Date): boolean {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // Czech public holidays (simplified)
  const holidays = [
    { month: 1, day: 1 }, // New Year's Day
    { month: 5, day: 1 }, // Labour Day
    { month: 5, day: 8 }, // Liberation Day
    { month: 7, day: 5 }, // Saints Cyril and Methodius Day
    { month: 7, day: 6 }, // Jan Hus Day
    { month: 9, day: 28 }, // Czech Statehood Day
    { month: 10, day: 28 }, // Independent Czechoslovak State Day
    { month: 11, day: 17 }, // Struggle for Freedom and Democracy Day
    { month: 12, day: 24 }, // Christmas Eve
    { month: 12, day: 25 }, // Christmas Day
    { month: 12, day: 26 }, // St. Stephen's Day
  ];

  return holidays.some((holiday) => holiday.month === month && holiday.day === day);
}

/**
 * Calculate tax amount (VAT)
 */
export function calculateTax(price: number, taxRate: number = 0.21): number {
  return Math.round(price * taxRate);
}

/**
 * Format price for display
 */
export function formatPriceForDisplay(
  price: number,
  locale: "cs" | "en" = "cs",
  includeTax: boolean = true
): string {
  const taxAmount = includeTax ? calculateTax(price) : 0;
  const totalPrice = price + taxAmount;

  if (locale === "cs") {
    return `${totalPrice.toLocaleString("cs-CZ")} Kč${includeTax ? " (vč. DPH)" : ""}`;
  } else {
    return `CZK ${totalPrice.toLocaleString("en-US")}${includeTax ? " (incl. VAT)" : ""}`;
  }
}

/**
 * Alias for formatPriceForDisplay for backward compatibility
 */
export const formatPrice = formatPriceForDisplay;

/**
 * Calculate final price with customizations and discounts
 */
export function calculateFinalPrice(
  basePrice: number,
  customizations: Customization[] = [],
  discounts: Discount[] = []
): number {
  // First calculate total with customizations
  const totalWithCustomizations = calculateTotalPrice(basePrice, customizations);

  // Then apply discounts
  const result = applyDiscounts(totalWithCustomizations, discounts);

  return result.finalPrice;
}
