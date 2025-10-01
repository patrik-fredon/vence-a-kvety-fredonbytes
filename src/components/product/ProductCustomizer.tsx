"use client";


import Image from "next/image";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils/price-calculator";
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

  // Get current customization for an option
  const getCurrentCustomization = (optionId: string) => {
    return customizations.find((c) => c.optionId === optionId);
  };

  // Handle customization changes
  const handleCustomizationChange = (optionId: string, choiceIds: string[], customValue?: string) => {
    const newCustomizations = customizations.filter(c => c.optionId !== optionId);

    if (choiceIds.length > 0 || customValue) {
      newCustomizations.push({
        optionId,
        choiceIds,
        ...(customValue && { customValue })
      });
    }

    onCustomizationChange(newCustomizations);
  };

  // Handle custom value changes (for text inputs, dates, etc.)
  const handleCustomValueChange = (optionId: string, value: string) => {
    const current = getCurrentCustomization(optionId);
    handleCustomizationChange(optionId, current?.choiceIds || [], value);
  };

  // Check if a conditional option should be visible
  const isOptionVisible = (option: CustomizationOption): boolean => {
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
  };

  // Render a choice button for selection options
  const renderChoice = (option: CustomizationOption, choice: CustomizationChoice) => {
    const currentCustomization = getCurrentCustomization(option.id);
    const isSelected = currentCustomization?.choiceIds.includes(choice.id) || false;
    const selectionCount = currentCustomization?.choiceIds.length || 0;
    const canSelect = !isSelected && (
      !option.maxSelections ||
      selectionCount < option.maxSelections
    );

    return (
      <button
        key={choice.id}
        type="button"
        onClick={() => {
          if (isSelected) {
            // Remove selection
            const newChoiceIds = currentCustomization?.choiceIds.filter(id => id !== choice.id) || [];
            handleCustomizationChange(option.id, newChoiceIds, currentCustomization?.customValue);
          } else if (canSelect) {
            // Add selection
            const newChoiceIds = option.maxSelections === 1
              ? [choice.id]
              : [...(currentCustomization?.choiceIds || []), choice.id];
            handleCustomizationChange(option.id, newChoiceIds, currentCustomization?.customValue);
          }
        }}
        disabled={!isSelected && !canSelect}
        className={cn(
          "flex items-center justify-between p-3 border rounded-lg transition-colors text-left",
          "focus:outline-none focus:ring-2 focus:ring-stone-950 focus:ring-offset-2",
          isSelected
            ? "border-stone-900 bg-stone-50 text-stone-900"
            : canSelect
              ? "border-stone-300 bg-white hover:border-stone-400 hover:bg-stone-50"
              : "border-stone-200 bg-stone-50 text-stone-400 cursor-not-allowed"
        )}
      >
        <div className="flex items-center space-x-3">
          <div
            className={cn(
              "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
              isSelected ? "border-stone-900" : "border-stone-300"
            )}
          >
            {isSelected && (
              <div className="w-2.5 h-2.5 rounded-full bg-stone-900" />
            )}
          </div>
          <div className="text-left">
            <div className="font-medium">
              {typeof choice.label === 'object' ? choice.label[locale as keyof typeof choice.label] || choice.label.cs : choice.label}
            </div>
            {choice.priceModifier !== 0 && (
              <div className="text-sm text-stone-600">
                {formatPriceModifier(choice.priceModifier)}
              </div>
            )}
          </div>
        </div>
        {choice.imageUrl && (
          <Image
            src={choice.imageUrl}
            alt={typeof choice.label === 'object' ? choice.label[locale as keyof typeof choice.label] || choice.label.cs : choice.label}
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

    if (!isSelected || !choice.allowCustomInput) {
      return null;
    }

    return (
      <div className="mt-3 space-y-2">
        <textarea
          value={value}
          onChange={(e) => handleCustomValueChange(option.id, e.target.value)}
          placeholder={t("customTextPlaceholder")}
          className="w-full p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none"
          rows={2}
          maxLength={choice.maxLength || 50}
        />
        <div className="flex justify-between text-xs text-stone-500">
          <span>{t("customTextHelp")}</span>
          <span>{value.length}/{choice.maxLength || 50}</span>
        </div>
      </div>
    );
  };

  // Render date selector for choices that require calendar
  const renderDateSelector = (option: CustomizationOption, choice: CustomizationChoice) => {
    const currentCustomization = getCurrentCustomization(option.id);
    const isSelected = currentCustomization?.choiceIds.includes(choice.id);
    const value = currentCustomization?.customValue || "";

    if (!isSelected || !choice.requiresCalendar) {
      return null;
    }

    return (
      <div className="mt-3">
        <DateSelector
          value={value}
          onChange={(date) => handleCustomValueChange(option.id, date)}
          minDaysFromNow={choice.minDaysFromNow || 1}
          maxDaysFromNow={choice.maxDaysFromNow || 30}
          locale={locale}
        />
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
          className="w-full p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none"
          rows={3}
          maxLength={200}
        />
        <div className="flex justify-between text-xs text-stone-500">
          <span>{t("messageHelp")}</span>
          <span>{value.length}/200</span>
        </div>
      </div>
    );
  };

  // Filter visible options based on conditions
  const visibleOptions = (product.customizationOptions || []).filter(isOptionVisible);

  // Debug logging
  console.log('🔧 [ProductCustomizer] Debug info:', {
    productId: product.id,
    totalOptions: product.customizationOptions?.length || 0,
    visibleOptions: visibleOptions.length,
    customizationOptions: product.customizationOptions,
    visibleOptionsData: visibleOptions,
    currentCustomizations: customizations
  });

  if (visibleOptions.length === 0) {
    console.log('🔧 [ProductCustomizer] No visible options found');
    return null;
  }

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
                <h4 className="font-semibold text-stone-900">
                  {typeof option.name === 'object' ? option.name[locale as keyof typeof option.name] || option.name.cs : option.name}
                  {option.required && <span className="text-red-500 ml-1">*</span>}
                </h4>
                {option.description && (
                  <p className="text-sm text-stone-600 mt-1">
                    {typeof option.description === 'object' ? option.description[locale as keyof typeof option.description] || option.description.cs : option.description}
                  </p>
                )}
              </div>

              {/* Selection Counter */}
              {option.maxSelections && option.maxSelections > 1 && (
                <div className="text-sm text-stone-500">
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
                      {choice.requiresCalendar && renderDateSelector(option, choice)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Validation Messages */}
            {option.required && selectionCount === 0 && (
              <div className="text-sm text-red-600">
                {t("validation.required", {
                  option: typeof option.name === 'object' ? option.name[locale as keyof typeof option.name] || option.name.cs : option.name,
                })}
              </div>
            )}

            {option.minSelections && selectionCount < option.minSelections && (
              <div className="text-sm text-orange-600">
                {t("validation.minSelections", {
                  option: typeof option.name === 'object' ? option.name[locale as keyof typeof option.name] || option.name.cs : option.name,
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
