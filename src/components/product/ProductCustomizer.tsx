"use client";


import Image from "next/image";
import { useTranslations } from "next-intl";
import { useCallback } from "react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils/price-calculator";
import { withPerformanceMonitoring } from "@/lib/utils/customization-performance";
import { DateSelector } from "./DateSelector";
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
  customizations,
  locale,
  onCustomizationChange,
  className,
}: ProductCustomizerProps) {
  const t = useTranslations("product");

  const formatPriceModifier = (price: number) => {
    return formatPrice(price, locale as "cs" | "en", true);
  };

  // Check if a conditional option should be visible
  const isOptionVisible = (option: CustomizationOption): boolean => {
    if (!option.conditions || option.conditions.length === 0) {
      return true;
    }

    return option.conditions.every((condition) => {
      const dependentCustomization = customizations.find(
        (c) => c.optionId === condition.dependsOn
      );

      if (!dependentCustomization) {
        return false;
      }

      return condition.values.some((value) =>
        dependentCustomization.choiceIds.includes(value)
      );
    });
  };

  const visibleOptions = product.customization_options?.filter(isOptionVisible) || [];

  const renderTextInput = (option: CustomizationOption) => {
    const current = customizations.find((c) => c.optionId === option.id);
    const value = current?.customValue || "";

    return (
      <div key={option.id} className="space-y-2">
        <label className="block text-sm font-medium text-stone-700">
          {option.name}
          {option.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => {
            const newCustomizations = customizations.filter(c => c.optionId !== option.id);
            newCustomizations.push({
              optionId: option.id,
              choiceIds: [],
              customValue: e.target.value
            });
            onCustomizationChange(newCustomizations);
          }}
          placeholder={option.description || `${t("enterText")}...`}
          className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          maxLength={option.max_length || 100}
        />
        {option.max_length && (
          <p className="text-xs text-stone-500">
            {value.length}/{option.max_length} {t("characters")}
          </p>
        )}
      </div>
    );
  };

  const renderCustomTextInput = (option: CustomizationOption) => {
    const current = customizations.find((c) => c.optionId === option.id);
    const value = current?.customValue || "";

    return (
      <div key={option.id} className="space-y-2">
        <label className="block text-sm font-medium text-stone-700">
          {option.name}
          {option.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <textarea
          value={value}
          onChange={(e) => {
            const newCustomizations = customizations.filter(c => c.optionId !== option.id);
            newCustomizations.push({
              optionId: option.id,
              choiceIds: [],
              customValue: e.target.value
            });
            onCustomizationChange(newCustomizations);
          }}
          placeholder={option.description || `${t("enterCustomText")}...`}
          className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-vertical"
          rows={3}
          maxLength={option.max_length || 200}
        />
        {option.max_length && (
          <p className="text-xs text-stone-500">
            {value.length}/{option.max_length} {t("characters")}
          </p>
        )}
      </div>
    );
  };

  const renderDateSelector = (option: CustomizationOption) => {
    const current = customizations.find((c) => c.optionId === option.id);
    const value = current?.customValue || "";

    return (
      <div key={option.id} className="space-y-2">
        <label className="block text-sm font-medium text-stone-700">
          {option.name}
          {option.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
          type="date"
          value={value}
          onChange={(e) => {
            const newCustomizations = customizations.filter(c => c.optionId !== option.id);
            newCustomizations.push({
              optionId: option.id,
              choiceIds: [],
              customValue: e.target.value
            });
            onCustomizationChange(newCustomizations);
          }}
          className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          min={new Date().toISOString().split("T")[0]}
        />
        {option.description && (
          <p className="text-xs text-stone-500">{option.description}</p>
        )}
      </div>
    );
  };

  return (
    <div className={cn("space-y-6", className)}>
      {visibleOptions.map((option) => {
        const current = customizations.find((c) => c.optionId === option.id);

        if (option.type === "text") {
          return renderTextInput(option);
        }

        if (option.type === "custom_text") {
          return renderCustomTextInput(option);
        }

        if (option.type === "date") {
          return renderDateSelector(option);
        }

        return (
          <div key={option.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-stone-700">
                {option.name}
                {option.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {option.max_selections && option.max_selections > 1 && (
                <span className="text-xs text-stone-500">
                  {current?.choiceIds.length || 0}/{option.max_selections} {t("selected")}
                </span>
              )}
            </div>

            {option.description && (
              <p className="text-sm text-stone-600">{option.description}</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {option.choices?.map((choice) => {
                const isSelected = current?.choiceIds.includes(choice.id) || false;
                const selectionCount = current?.choiceIds.length || 0;
                const canSelect = !isSelected && (
                  !option.max_selections ||
                  selectionCount < option.max_selections
                );

                return (
                  <button
                    key={choice.id}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        // Remove selection
                        const newChoiceIds = current?.choiceIds.filter(id => id !== choice.id) || [];
                        const newCustomizations = customizations.filter(c => c.optionId !== option.id);
                        if (newChoiceIds.length > 0) {
                          newCustomizations.push({
                            optionId: option.id,
                            choiceIds: newChoiceIds
                          });
                        }
                        onCustomizationChange(newCustomizations);
                      } else if (canSelect) {
                        // Add selection
                        const newChoiceIds = option.max_selections === 1
                          ? [choice.id]
                          : [...(current?.choiceIds || []), choice.id];
                        const newCustomizations = customizations.filter(c => c.optionId !== option.id);
                        newCustomizations.push({
                          optionId: option.id,
                          choiceIds: newChoiceIds
                        });
                        onCustomizationChange(newCustomizations);
                      }
                    }}
                    disabled={!isSelected && !canSelect}
                    className={cn(
                      "p-3 border rounded-lg text-left transition-all duration-200",
                      "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-500",
                      isSelected
                        ? "border-amber-500 bg-amber-50 text-amber-900"
                        : canSelect
                          ? "border-stone-300 bg-white text-stone-700 hover:border-amber-300"
                          : "border-stone-200 bg-stone-50 text-stone-400 cursor-not-allowed"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{choice.name}</span>
                      {choice.price_modifier !== 0 && (
                        <span className={cn(
                          "text-sm font-medium",
                          choice.price_modifier > 0 ? "text-green-600" : "text-red-600"
                        )}>
                          {choice.price_modifier > 0 ? "+" : ""}
                          {formatPriceModifier(choice.price_modifier)}
                        </span>
                      )}
                    </div>
                    {choice.description && (
                      <p className="text-sm text-stone-500 mt-1">{choice.description}</p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
