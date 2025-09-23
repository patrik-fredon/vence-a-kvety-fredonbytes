"use client";

import { useMemo, useState, useEffect } from "react";
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
 * Debounced version of price calculation for performance optimization
 * Prevents excessive recalculations during rapid customization changes
 */
export function useDebouncedPriceCalculation(
  basePrice: number,
  customizations: Customization[],
  customizationOptions: CustomizationOption[],
  delay: number = 300
): PriceCalculationResult {
  const [debouncedCustomizations, setDebouncedCustomizations] = useState(customizations);

  // Debounce customizations changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCustomizations(customizations);
    }, delay);

    return () => clearTimeout(timer);
  }, [customizations, delay]);

  // Use regular price calculation with debounced customizations
  return usePriceCalculation(basePrice, debouncedCustomizations, customizationOptions);
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
  // Calculate combined customizations including size at the top level
  const combinedCustomizations = useMemo(() => {
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

      return filteredCustomizations;
    }

    return customizations;
  }, [customizations, selectedSize, sizeOption]);

  // Use the regular price calculation hook with combined customizations
  return usePriceCalculation(basePrice, combinedCustomizations, customizationOptions);
}
