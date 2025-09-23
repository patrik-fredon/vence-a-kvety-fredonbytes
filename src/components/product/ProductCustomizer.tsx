"use client";

import { CheckIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useCallback } from "react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils/price-calculator";
import type {
  Customization,
  CustomizationChoice,
  CustomizationOption,
  Product,
} from "@/types/product";

interface ProductCustomizerProps {
  product: Product;
  locale: string;
  customizations: Customization[];
  onCustomizationChange: (customizations: Customization[]) => void;
  className?: string;
}

export function ProductCustomizer({
  product,
  locale,
  customizations,
  onCustomizationChange,
  className,
}: ProductCustomizerProps) {
  const t = useTranslations("product");
  const tCurrency = useTranslations("currency");

  const formatPriceModifier = (price: number) => {
    return formatPrice(price, locale as "cs" | "en", true);
  };

  // Check if a conditional option should be visible
  const isOptionVisible = useCallback(
    (option: CustomizationOption) => {
      if (!option.dependsOn) {
        return true;
      }

      const dependentCustomization = customizations.find(
        (c) => c.optionId === option.dependsOn!.optionId
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

  // Clean up dependent customizations when parent option changes
  const cleanupDependentCustomizations = useCallback(
    (customizations: Customization[], changedOptionId: string) => {
      const dependentOptions = product.customizationOptions.filter(
        (option) => option.dependsOn?.optionId === changedOptionId
      );

      let cleanedCustomizations = [...customizations];

      for (const dependentOption of dependentOptions) {
        // Check if the dependent option should still be visible
        const shouldBeVisible = dependentOption.dependsOn?.requiredChoiceIds.some((requiredId) => {
          const parentCustomization = cleanedCustomizations.find(
            (c) => c.optionId === dependentOption.dependsOn!.optionId
          );
          return parentCustomization?.choiceIds.includes(requiredId);
        });

        if (!shouldBeVisible) {
          // Remove customizations for options that are no longer visible
          cleanedCustomizations = cleanedCustomizations.filter(
            (c) => c.optionId !== dependentOption.id
          );
        }
      }

      return cleanedCustomizations;
    },
    [product.customizationOptions]
  );

  // Handle choice selection for an option
  const handleChoiceSelection = useCallback(
    (optionId: string, choiceId: string, option: CustomizationOption) => {
      const newCustomizations = [...customizations];
      const existingIndex = newCustomizations.findIndex((c) => c.optionId === optionId);

      if (existingIndex >= 0) {
        const existing = newCustomizations[existingIndex]!; // Safe because existingIndex >= 0

        if (option.maxSelections === 1) {
          // Single selection - replace
          existing.choiceIds = [choiceId];
        } else {
          // Multiple selection - toggle
          if (existing.choiceIds.includes(choiceId)) {
            existing.choiceIds = existing.choiceIds.filter((id) => id !== choiceId);
          } else {
            // Check max selections limit
            if (!option.maxSelections || existing.choiceIds.length < option.maxSelections) {
              existing.choiceIds.push(choiceId);
            }
          }
        }
      } else {
        // Create new customization
        newCustomizations.push({
          optionId,
          choiceIds: [choiceId],
        });
      }

      // Clean up dependent customizations when parent option changes
      const updatedCustomizations = cleanupDependentCustomizations(newCustomizations, optionId);
      onCustomizationChange(updatedCustomizations);
    },
    [customizations, onCustomizationChange, cleanupDependentCustomizations]
  );

  // Handle custom value change (for text inputs)
  const handleCustomValueChange = useCallback(
    (optionId: string, value: string) => {
      const newCustomizations = [...customizations];
      const existingIndex = newCustomizations.findIndex((c) => c.optionId === optionId);

      if (existingIndex >= 0) {
        newCustomizations[existingIndex]!.customValue = value;
      } else {
        newCustomizations.push({
          optionId,
          choiceIds: [],
          customValue: value,
        });
      }

      onCustomizationChange(newCustomizations);
    },
    [customizations, onCustomizationChange]
  );

  // Get current customization for an option
  const getCurrentCustomization = (optionId: string) => {
    return customizations.find((c) => c.optionId === optionId);
  };

  // Render a single choice
  const renderChoice = (option: CustomizationOption, choice: CustomizationChoice) => {
    const currentCustomization = getCurrentCustomization(option.id);
    const isSelected = currentCustomization?.choiceIds.includes(choice.id);

    return (
      <button
        key={choice.id}
        type="button"
        onClick={() => handleChoiceSelection(option.id, choice.id, option)}
        className={cn(
          "flex items-center justify-between p-3 border rounded-lg transition-colors",
          isSelected
            ? "border-primary-500 bg-primary-50 text-primary-900"
            : "border-neutral-300 bg-white hover:border-neutral-400 hover:bg-neutral-50"
        )}
      >
        <div className="flex items-center space-x-3">
          <div
            className={cn(
              "w-5 h-5 rounded-full border-2 flex items-center justify-center",
              isSelected ? "border-primary-500 bg-primary-500" : "border-neutral-300"
            )}
          >
            {isSelected && <CheckIcon className="w-3 h-3 text-white" />}
          </div>
          <div className="text-left">
            <div className="font-medium">{choice.label[locale as keyof typeof choice.label]}</div>
            {choice.priceModifier !== 0 && (
              <div className="text-sm text-neutral-600">
                {formatPriceModifier(choice.priceModifier)}
              </div>
            )}
          </div>
        </div>
        {choice.imageUrl && (
          <Image
            src={choice.imageUrl}
            alt={choice.label[locale as keyof typeof choice.label]}
            width={48}
            height={48}
            className="rounded-md object-cover"
          />
        )}
      </button>
    );
  };

  // Render custom text input for choices that allow custom input
  const renderCustomTextInput = (option: CustomizationOption, choice: CustomizationChoice) => {
    const currentCustomization = getCurrentCustomization(option.id);
    const isSelected = currentCustomization?.choiceIds.includes(choice.id);
    const value = currentCustomization?.customValue || "";

    if (!isSelected) {
      return null;
    }

    return (
      <div className="mt-3 space-y-2">
        <textarea
          value={value}
          onChange={(e) => handleCustomValueChange(option.id, e.target.value)}
          placeholder={t("customTextPlaceholder")}
          className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-primary-500 resize-none"
          rows={2}
          maxLength={choice.maxLength || 50}
        />
        <div className="flex justify-between text-xs text-neutral-500">
          <span>{t("customTextHelp")}</span>
          <span>{value.length}/{choice.maxLength || 50}</span>
        </div>
      </div>
    );
  };

  // Render text input for message options
  const renderTextInput = (option: CustomizationOption) => {
    const currentCustomization = getCurrentCustomization(option.id);
    const value = currentCustomization?.customValue || "";

    return (
      <div className="space-y-2">
        <textarea
          value={value}
          onChange={(e) => handleCustomValueChange(option.id, e.target.value)}
          placeholder={t("messagePlaceholder")}
          className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-primary-500 resize-none"
          rows={3}
          maxLength={200}
        />
        <div className="flex justify-between text-xs text-neutral-500">
          <span>{t("messageHelp")}</span>
          <span>{value.length}/200</span>
        </div>
      </div>
    );
  };

  if (product.customizationOptions.length === 0) {
    return null;
  }

  // Filter visible options
  const visibleOptions = product.customizationOptions.filter(isOptionVisible);

  return (
    <div className={cn("space-y-6", className)}>
      {visibleOptions.map((option) => {
        const currentCustomization = getCurrentCustomization(option.id);
        const selectionCount = currentCustomization?.choiceIds.length || 0;

        return (
          <div key={option.id} className="space-y-3">
            {/* Option Header */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-neutral-900">
                  {option.name[locale as keyof typeof option.name]}
                  {option.required && <span className="text-red-500 ml-1">*</span>}
                </h4>
                {option.description && (
                  <p className="text-sm text-neutral-600 mt-1">
                    {option.description[locale as keyof typeof option.description]}
                  </p>
                )}
              </div>

              {/* Selection Counter */}
              {option.maxSelections && option.maxSelections > 1 && (
                <div className="text-sm text-neutral-500">
                  {selectionCount}/{option.maxSelections}
                </div>
              )}
            </div>

            {/* Option Choices */}
            {option.type === "message" ? (
              renderTextInput(option)
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-1 gap-2">
                  {(option.choices || []).map((choice) => (
                    <div key={choice.id}>
                      {renderChoice(option, choice)}
                      {choice.allowCustomInput && renderCustomTextInput(option, choice)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Validation Messages */}
            {option.required && selectionCount === 0 && (
              <div className="text-sm text-red-600">
                {t("validation.required", {
                  option: option.name[locale as keyof typeof option.name],
                })}
              </div>
            )}

            {option.minSelections && selectionCount < option.minSelections && (
              <div className="text-sm text-orange-600">
                {t("validation.minSelections", {
                  option: option.name[locale as keyof typeof option.name],
                  min: option.minSelections,
                  current: selectionCount,
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
