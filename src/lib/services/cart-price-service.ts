/**
 * Cart price calculation service
 * Handles price calculations with customizations and caching
 */

import { calculateTotalPriceWithOptions, calculateCustomizationPriceModifiers } from '@/lib/utils/price-calculator';
import { getProductCustomizationOptions } from '@/lib/utils/customization-queries';
import {
  cachePriceCalculation,
  getCachedPriceCalculation,
  type CachedPriceCalculation
} from '@/lib/cache/cart-cache';
import type { Customization, CustomizationOption } from '@/types/product';

/**
 * Price calculation result with detailed breakdown
 */
export interface CartPriceCalculationResult {
  unitPrice: number;
  totalPrice: number;
  basePrice: number;
  customizationModifier: number;
  priceBreakdown: {
    basePrice: number;
    customizations: Array<{
      optionId: string;
      optionName: string;
      totalModifier: number;
      choices: Array<{
        choiceId: string;
        label: string;
        priceModifier: number;
      }>;
    }>;
    totalModifier: number;
  };
  fromCache: boolean;
}

/**
 * Calculate cart item price with customizations and caching
 */
export async function calculateCartItemPrice(
  productId: string,
  basePrice: number,
  customizations: Customization[],
  quantity: number = 1
): Promise<CartPriceCalculationResult> {
  try {
    console.log(`🧮 [PriceService] Calculating price for product:${productId} with ${customizations.length} customizations:`, customizations);

    // Check cache first
    const cachedPrice = await getCachedPriceCalculation(productId, customizations);
    if (cachedPrice) {
      console.log(`✅ [PriceService] Using cached price calculation for product:${productId}`);

      return {
        unitPrice: cachedPrice.unitPrice,
        totalPrice: cachedPrice.unitPrice * quantity,
        basePrice: cachedPrice.basePrice,
        customizationModifier: cachedPrice.customizationModifier,
        priceBreakdown: {
          basePrice: cachedPrice.basePrice,
          customizations: [], // Simplified for cached results
          totalModifier: cachedPrice.customizationModifier
        },
        fromCache: true
      };
    }

    // Get customization options for the product
    console.log(`🔍 [PriceService] Fetching customization options for product:${productId}`);
    const customizationOptions = await getProductCustomizationOptions(productId);
    console.log(`📋 [PriceService] Retrieved ${customizationOptions.length} customization options for product:${productId}`);

    if (!customizationOptions || customizationOptions.length === 0) {
      console.log(`⚠️ [PriceService] No customization options found for product:${productId}, using base price`);

      const result = {
        unitPrice: basePrice,
        totalPrice: basePrice * quantity,
        basePrice,
        customizationModifier: 0,
        priceBreakdown: {
          basePrice,
          customizations: [],
          totalModifier: 0
        },
        fromCache: false
      };

      // Cache the base price calculation
      await cachePriceCalculation(productId, customizations, {
        unitPrice: basePrice,
        totalPrice: basePrice,
        basePrice,
        customizationModifier: 0,
        calculatedAt: new Date().toISOString()
      });

      return result;
    }

    // Calculate price with customizations
    const { totalModifier, breakdown } = calculateCustomizationPriceModifiers(
      customizations,
      customizationOptions
    );

    const unitPrice = calculateTotalPriceWithOptions(
      basePrice,
      customizations,
      customizationOptions
    );

    const totalPrice = unitPrice * quantity;

    console.log(`✅ [PriceService] Calculated price for product:${productId}:`, {
      basePrice,
      customizationModifier: totalModifier,
      unitPrice,
      totalPrice
    });

    const result: CartPriceCalculationResult = {
      unitPrice,
      totalPrice,
      basePrice,
      customizationModifier: totalModifier,
      priceBreakdown: {
        basePrice,
        customizations: breakdown.map(item => ({
          optionId: item.optionId,
          optionName: item.optionName,
          totalModifier: item.totalModifier,
          choices: item.choices
        })),
        totalModifier
      },
      fromCache: false
    };

    // Cache the calculation result
    await cachePriceCalculation(productId, customizations, {
      unitPrice,
      totalPrice: unitPrice, // Store unit price, not total (quantity-independent)
      basePrice,
      customizationModifier: totalModifier,
      calculatedAt: new Date().toISOString()
    });

    return result;

  } catch (error) {
    console.error(`❌ [PriceService] Error calculating price for product:${productId}:`, error);

    // Fallback to base price calculation
    console.log(`🔄 [PriceService] Falling back to base price for product:${productId}`);

    return {
      unitPrice: basePrice,
      totalPrice: basePrice * quantity,
      basePrice,
      customizationModifier: 0,
      priceBreakdown: {
        basePrice,
        customizations: [],
        totalModifier: 0
      },
      fromCache: false
    };
  }
}

/**
 * Batch calculate prices for multiple cart items
 */
export async function batchCalculateCartItemPrices(
  items: Array<{
    productId: string;
    basePrice: number;
    customizations: Customization[];
    quantity: number;
  }>
): Promise<CartPriceCalculationResult[]> {
  try {
    console.log(`🧮 [PriceService] Batch calculating prices for ${items.length} items`);

    const results = await Promise.all(
      items.map(item =>
        calculateCartItemPrice(
          item.productId,
          item.basePrice,
          item.customizations,
          item.quantity
        )
      )
    );

    console.log(`✅ [PriceService] Batch price calculation completed for ${items.length} items`);
    return results;

  } catch (error) {
    console.error('❌ [PriceService] Error in batch price calculation:', error);

    // Fallback to individual calculations
    const results: CartPriceCalculationResult[] = [];
    for (const item of items) {
      try {
        const result = await calculateCartItemPrice(
          item.productId,
          item.basePrice,
          item.customizations,
          item.quantity
        );
        results.push(result);
      } catch (itemError) {
        console.error(`❌ [PriceService] Error calculating price for item ${item.productId}:`, itemError);
        // Add fallback result
        results.push({
          unitPrice: item.basePrice,
          totalPrice: item.basePrice * item.quantity,
          basePrice: item.basePrice,
          customizationModifier: 0,
          priceBreakdown: {
            basePrice: item.basePrice,
            customizations: [],
            totalModifier: 0
          },
          fromCache: false
        });
      }
    }

    return results;
  }
}

/**
 * Validate price calculation result
 */
export function validatePriceCalculation(
  result: CartPriceCalculationResult,
  expectedMinPrice: number = 0
): boolean {
  try {
    // Basic validation checks
    if (result.unitPrice < expectedMinPrice) {
      console.warn(`⚠️ [PriceService] Unit price ${result.unitPrice} is below minimum ${expectedMinPrice}`);
      return false;
    }

    if (result.totalPrice < result.unitPrice) {
      console.warn(`⚠️ [PriceService] Total price ${result.totalPrice} is less than unit price ${result.unitPrice}`);
      return false;
    }

    if (result.basePrice + result.customizationModifier !== result.unitPrice) {
      console.warn(`⚠️ [PriceService] Price calculation mismatch: ${result.basePrice} + ${result.customizationModifier} ≠ ${result.unitPrice}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ [PriceService] Error validating price calculation:', error);
    return false;
  }
}
