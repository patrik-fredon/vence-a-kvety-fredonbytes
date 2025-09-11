/**
 * Price calculation utilities for product customizations
 */

import { Product, Customization, CustomizationOption, CustomizationChoice } from "@/types/product";

/**
 * Calculate the final price based on base price and customizations
 */
export function calculateFinalPrice(
  basePrice: number,
  customizations: Customization[],
  customizationOptions: CustomizationOption[]
): number {
  let finalPrice = basePrice;

  customizations.forEach((customization) => {
    const option = customizationOptions.find((opt) => opt.id === customization.optionId);
    if (!option) return;

    customization.choiceIds.forEach((choiceId) => {
      const choice = option.choices.find((c) => c.id === choiceId);
      if (choice && choice.available) {
        finalPrice += choice.priceModifier;
      }
    });
  });

  return Math.max(0, finalPrice); // Ensure price doesn't go negative
}

/**
 * Get price breakdown for display purposes
 */
export interface PriceBreakdown {
  basePrice: number;
  customizations: Array<{
    optionName: string;
    choiceName: string;
    priceModifier: number;
  }>;
  totalModifiers: number;
  finalPrice: number;
}

export function getPriceBreakdown(
  basePrice: number,
  customizations: Customization[],
  customizationOptions: CustomizationOption[],
  locale: "cs" | "en" = "cs"
): PriceBreakdown {
  const breakdown: PriceBreakdown = {
    basePrice,
    customizations: [],
    totalModifiers: 0,
    finalPrice: basePrice,
  };

  customizations.forEach((customization) => {
    const option = customizationOptions.find((opt) => opt.id === customization.optionId);
    if (!option) return;

    customization.choiceIds.forEach((choiceId) => {
      const choice = option.choices.find((c) => c.id === choiceId);
      if (choice && choice.available) {
        breakdown.customizations.push({
          optionName: option.name[locale],
          choiceName: choice.label[locale],
          priceModifier: choice.priceModifier,
        });
        breakdown.totalModifiers += choice.priceModifier;
      }
    });
  });

  breakdown.finalPrice = Math.max(0, basePrice + breakdown.totalModifiers);
  return breakdown;
}

/**
 * Validate customization selections against option constraints
 */
export interface ValidationResult {
  isValid: boolean;
  errors: Array<{
    optionId: string;
    optionName: string;
    error: string;
    errorCode: "REQUIRED" | "MIN_SELECTIONS" | "MAX_SELECTIONS" | "UNAVAILABLE_CHOICE";
  }>;
}

export function validateCustomizations(
  customizations: Customization[],
  customizationOptions: CustomizationOption[],
  locale: "cs" | "en" = "cs"
): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
  };

  customizationOptions.forEach((option) => {
    const customization = customizations.find((c) => c.optionId === option.id);
    const selectionCount = customization?.choiceIds.length || 0;
    const optionName = option.name[locale];

    // Check required options
    if (option.required && selectionCount === 0) {
      result.errors.push({
        optionId: option.id,
        optionName,
        error: `${optionName} is required`,
        errorCode: "REQUIRED",
      });
    }

    // Check minimum selections
    if (option.minSelections && selectionCount < option.minSelections) {
      result.errors.push({
        optionId: option.id,
        optionName,
        error: `${optionName} requires at least ${option.minSelections} selections`,
        errorCode: "MIN_SELECTIONS",
      });
    }

    // Check maximum selections
    if (option.maxSelections && selectionCount > option.maxSelections) {
      result.errors.push({
        optionId: option.id,
        optionName,
        error: `${optionName} allows maximum ${option.maxSelections} selections`,
        errorCode: "MAX_SELECTIONS",
      });
    }

    // Check if selected choices are available
    if (customization) {
      customization.choiceIds.forEach((choiceId) => {
        const choice = option.choices.find((c) => c.id === choiceId);
        if (!choice || !choice.available) {
          result.errors.push({
            optionId: option.id,
            optionName,
            error: `Selected option in ${optionName} is no longer available`,
            errorCode: "UNAVAILABLE_CHOICE",
          });
        }
      });
    }
  });

  result.isValid = result.errors.length === 0;
  return result;
}

/**
 * Check if customizations affect product availability
 */
export function checkCustomizationAvailability(
  customizations: Customization[],
  customizationOptions: CustomizationOption[]
): {
  available: boolean;
  unavailableOptions: string[];
  estimatedLeadTime?: number;
} {
  const unavailableOptions: string[] = [];
  let maxLeadTime = 0;

  customizations.forEach((customization) => {
    const option = customizationOptions.find((opt) => opt.id === customization.optionId);
    if (!option) return;

    customization.choiceIds.forEach((choiceId) => {
      const choice = option.choices.find((c) => c.id === choiceId);
      if (!choice || !choice.available) {
        unavailableOptions.push(option.name.cs || option.name.en);
      }
      // Note: Lead time logic would be implemented here if choices had lead times
    });
  });

  return {
    available: unavailableOptions.length === 0,
    unavailableOptions,
    estimatedLeadTime: maxLeadTime > 0 ? maxLeadTime : undefined,
  };
}

/**
 * Format price for display
 */
export function formatPrice(
  price: number,
  locale: "cs" | "en" = "cs",
  showSign: boolean = false
): string {
  const formattedAmount = price.toLocaleString(locale === "cs" ? "cs-CZ" : "en-US");
  const currency = locale === "cs" ? "Kč" : "CZK";
  const sign = showSign && price > 0 ? "+" : "";

  return `${sign}${formattedAmount} ${currency}`;
}
