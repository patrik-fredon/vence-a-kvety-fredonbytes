"use client";

import { useTranslations } from "next-intl";
import { useCallback, useMemo } from "react";
import { useCustomizationCache } from "@/lib/cache/customization-cache";
import { useDebouncedPriceCalculation } from "@/lib/utils/usePriceCalculation";
import type {
  Customization,
  CustomizationOption,
  Product,
} from "@/types/product";
import { LazyRibbonConfigurator } from "./LazyRibbonConfigurator";
import { SizeSelector } from "./SizeSelector";

interface OptimizedProductCustomizerProps {
  product: Product;
  locale: string;
  customizations: Customization[];
  onCustomizationChange: (customizations: Customization[]) => void;
  className?: string;
}

/**
 * Performance-optimized ProductCustomizer with lazy loading and debouncing
 */
export function OptimizedProductCustomizer({
  product,
  locale,
  customizations,
  onCustomizationChange,
  className,
}: OptimizedProductCustomizerProps) {
  const t = useTranslations("product");
  const cache = useCustomizationCache();

  // Memoize customization options to prevent unnecessary re-renders
  const customizationOptions = useMemo(() => {
    // Try to get from cache first
    const cached = cache.get(product.id);
    if (cached) {
      return cached;
    }

    // Use product's customization options and cache them
    const options = product.customizationOptions || [];
    cache.set(product.id, options);
    return options;
  }, [product.id, product.customizationOptions, cache]);

  // Use debounced price calculation for better performance
  const priceCalculation = useDebouncedPriceCalculation(
    product.basePrice,
    customizations,
    customizationOptions,
    200 // 200ms debounce delay
  );

  // Memoize option visibility check to prevent recalculation
  const isOptionVisible = useCallback(
    (option: CustomizationOption) => {
      if (!option.dependsOn) {
        return true;
      }

      const dependentCustomization = customizations.find(
        (c) => c.optionId === option.dependsOn?.optionId
      );

      if (!dependentCustomization) {
        return false;
      }

      return option.dependsOn.requiredChoiceIds.some((requiredId) =>
        dependentCustomization.choiceIds.includes(requiredId)
      );
    },
    [customizations]
  );

  // Memoize visible options to prevent unnecessary filtering
  const visibleOptions = useMemo(() => {
    return customizationOptions.filter(isOptionVisible);
  }, [customizationOptions, isOptionVisible]);

  // Optimized cleanup function with memoization
  const cleanupDependentCustomizations = useCallback(
    (customizations: Customization[], changedOptionId: string) => {
      const dependentOptions = customizationOptions.filter(
        (option) => option.dependsOn?.optionId === changedOptionId
      );

      if (dependentOptions.length === 0) {
        return customizations; // Early return if no dependent options
      }

      let cleanedCustomizations = [...customizations];

      for (const dependentOption of dependentOptions) {
        const shouldBeVisible =
          dependentOption.dependsOn?.requiredChoiceIds.some((requiredId) => {
            const parentCustomization = cleanedCustomizations.find(
              (c) => c.optionId === dependentOption.dependsOn?.optionId
            );
            return parentCustomization?.choiceIds.includes(requiredId);
          });

        if (!shouldBeVisible) {
          cleanedCustomizations = cleanedCustomizations.filter(
            (c) => c.optionId !== dependentOption.id
          );
        }
      }

      return cleanedCustomizations;
    },
    [customizationOptions]
  );

  // Optimized choice selection handler
  const handleChoiceSelection = useCallback(
    (optionId: string, choiceId: string, option: CustomizationOption) => {
      const newCustomizations = [...customizations];
      const existingIndex = newCustomizations.findIndex(
        (c) => c.optionId === optionId
      );

      if (existingIndex >= 0) {
        const existing = newCustomizations[existingIndex]!;

        if (option.maxSelections === 1) {
          existing.choiceIds = [choiceId];
          // Clear custom value when selecting predefined option
          if (existing.customValue) {
            delete existing.customValue;
          }
        } else {
          if (existing.choiceIds.includes(choiceId)) {
            existing.choiceIds = existing.choiceIds.filter(
              (id) => id !== choiceId
            );
          } else {
            if (
              !option.maxSelections ||
              existing.choiceIds.length < option.maxSelections
            ) {
              existing.choiceIds.push(choiceId);
            }
          }
        }
      } else {
        newCustomizations.push({
          optionId,
          choiceIds: [choiceId],
        });
      }

      const updatedCustomizations = cleanupDependentCustomizations(
        newCustomizations,
        optionId
      );
      onCustomizationChange(updatedCustomizations);
    },
    [customizations, onCustomizationChange, cleanupDependentCustomizations]
  );

  // Memoize size and ribbon options for better performance
  const { sizeOption, ribbonOption, ribbonColorOption, ribbonTextOption } =
    useMemo(() => {
      const size = visibleOptions.find((opt) => opt.type === "size");
      const ribbon = visibleOptions.find((opt) => opt.type === "ribbon");
      const ribbonColor = visibleOptions.find(
        (opt) => opt.type === "ribbon_color"
      );
      const ribbonText = visibleOptions.find(
        (opt) => opt.type === "ribbon_text"
      );

      return {
        sizeOption: size,
        ribbonOption: ribbon,
        ribbonColorOption: ribbonColor,
        ribbonTextOption: ribbonText,
      };
    }, [visibleOptions]);

  // Memoize current customizations for better performance
  const currentCustomizations = useMemo(() => {
    const customizationMap = new Map(
      customizations.map((c) => [c.optionId, c])
    );
    return customizationMap;
  }, [customizations]);

  // Check if ribbon is selected for lazy loading
  const isRibbonSelected = useMemo(() => {
    if (!ribbonOption) return false;
    const ribbonCustomization = currentCustomizations.get(ribbonOption.id);
    return ribbonCustomization?.choiceIds.some((id) =>
      ribbonOption.choices.some((choice) => choice.id === id)
    );
  }, [ribbonOption, currentCustomizations]);

  return (
    <div className={className}>
      {/* Size Selector - Always visible for wreaths */}
      {sizeOption && (
        <SizeSelector
          sizeOption={sizeOption}
          selectedSize={
            currentCustomizations.get(sizeOption.id)?.choiceIds[0] || null
          }
          onSizeChange={(sizeId) =>
            handleChoiceSelection(sizeOption.id, sizeId, sizeOption)
          }
          locale={locale}
          basePrice={product.basePrice}
          className="mb-6"
        />
      )}

      {/* Ribbon Selection */}
      {ribbonOption && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-teal-900 mb-4">
            {ribbonOption.name[locale as keyof typeof ribbonOption.name]}
          </h3>
          <div className="space-y-2">
            {ribbonOption.choices.map((choice) => {
              const isSelected = currentCustomizations
                .get(ribbonOption.id)
                ?.choiceIds.includes(choice.id);
              return (
                <button
                  key={choice.id}
                  type="button"
                  onClick={() =>
                    handleChoiceSelection(
                      ribbonOption.id,
                      choice.id,
                      ribbonOption
                    )
                  }
                  className={`w-full p-3 text-left rounded-lg border-2 transition-colors ${
                    isSelected
                      ? "border-stone-900 bg-funeral-gold"
                      : "border-stone-200 hover:border-stone-300"
                  }`}
                >
                  {choice.label[locale as keyof typeof choice.label]}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Lazy-loaded Ribbon Configurator */}
      {ribbonColorOption && ribbonTextOption && (
        <LazyRibbonConfigurator
          isVisible={isRibbonSelected ?? false}
          isRibbonSelected={isRibbonSelected ?? false}
          colorOption={ribbonColorOption}
          textOption={ribbonTextOption}
          customizations={customizations}
          onCustomizationChange={onCustomizationChange}
          locale={locale}
          className="mb-6"
        />
      )}

      {/* Price Display */}
      <div className="mt-6 p-4 bg-funeral-gold rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-stone-900">
            {t("totalPrice")}
          </span>
          <span className="text-xl font-bold text-stone-900">
            {priceCalculation.totalPrice.toLocaleString(
              locale === "cs" ? "cs-CZ" : "en-US",
              {
                style: "currency",
                currency: "CZK",
              }
            )}
          </span>
        </div>
        {priceCalculation.totalModifier > 0 && (
          <div className="text-sm text-amber-100 mt-1">
            {t("basePrice")}:{" "}
            {priceCalculation.basePrice.toLocaleString(
              locale === "cs" ? "cs-CZ" : "en-US",
              {
                style: "currency",
                currency: "CZK",
              }
            )}{" "}
            +{" "}
            {priceCalculation.totalModifier.toLocaleString(
              locale === "cs" ? "cs-CZ" : "en-US",
              {
                style: "currency",
                currency: "CZK",
              }
            )}
          </div>
        )}
      </div>
    </div>
  );
}
