"use client";

import { useMemo } from "react";
import type { Customization, CustomizationOption } from "@/types/product";
import {
  calculateTotalPriceWithOptions,
  calculateCustomizationPriceModifiers,
  type CustomizationPriceBreakdown
} from "./price-calculator";

interface PriceCalculationResult {
  totalPrice: number;
  totalModifier: number;
  breakdown: CustomizationPriceBreakdown[];
  basePrice: number;
}

/**
 * Hook for real-time price calculation with customizations
 */
export function usePriceCalculation(
  basePrice: number,
  customizations: Customization[],
  customizationOptions: CustomizationOption[]
): PriceCalculationResult {
  return useMemo(() => {
    const { totalModifier, breakdown } = calculateCustomizationPriceModifiers(
      customizations,
      customizationOptions
    );

    const totalPrice = calculateTotalPriceWithOptions(
      basePrice,
      customizations,
      customizationOptions
    );

    return {
      totalPrice,
      totalModifier,
      breakdown,
      basePrice
    };
  }, [basePrice, customizations, customizationOptions]);
}

/**
 * Hook for calculating price with a specific size selection
 */
export function usePriceCalculationWithSize(
  basePrice: number,
  customizations: Customization[],
  customizationOptions: CustomizationOption[],
  selectedSize: string | null,
  sizeOption?: CustomizationOption
): PriceCalculationResult {
  return useMemo(() => {
    // Create a combined customizations array including size
    const allCustomizations = [...customizations];

    if (selectedSize && sizeOption) {
      // Remove any existing size customization
      const filteredCustomizations = allCustomizations.filter(
        c => c.optionId !== sizeOption.id
      );

      // Add the selected size
      filteredCustomizations.push({
        optionId: sizeOption.id,
        choiceIds: [selectedSize]
      });

      return usePriceCalculation(basePrice, filteredCustomizations, customizationOptions);
    }

    return usePriceCalculation(basePrice, customizations, customizationOptions);
  }, [basePrice, customizations, customizationOptions, selectedSize, sizeOption]);
}
