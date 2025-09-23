"use client";

import { CheckIcon } from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";
import { useCallback, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils/price-calculator";
import { validateCustomRibbonText } from "@/lib/validation/wreath";
import type {
  Customization,
  CustomizationChoice,
  CustomizationOption,
} from "@/types/product";

interface RibbonConfiguratorProps {
  /** Whether the ribbon configurator should be visible */
  isVisible: boolean;
  /** Ribbon color customization option */
  colorOption: CustomizationOption | null;
  /** Ribbon text customization option */
  textOption: CustomizationOption | null;
  /** Current customizations */
  customizations: Customization[];
  /** Callback when customizations change */
  onCustomizationChange: (customizations: Customization[]) => void;
  /** Current locale */
  locale: string;
  /** Optional CSS class */
  className?: string;
}



export function RibbonConfigurator({
  isVisible,
  colorOption,
  textOption,
  customizations,
  onCustomizationChange,
  locale,
  className,
}: RibbonConfiguratorProps) {
  const t = useTranslations("product");
  const [customTextValidation, setCustomTextValidation] = useState<{
    errors: string[];
    warnings: string[];
  }>({ errors: [], warnings: [] });

  const formatPriceModifier = (price: number) => {
    return formatPrice(price, locale as "cs" | "en", true);
  };

  // Get current customization for an option
  const getCurrentCustomization = useCallback(
    (optionId: string) => {
      return customizations.find((c) => c.optionId === optionId);
    },
    [customizations]
  );

  // Handle choice selection for an option
  const handleChoiceSelection = useCallback(
    (optionId: string, choiceId: string, option: CustomizationOption) => {
      const newCustomizations = [...customizations];
      const existingIndex = newCustomizations.findIndex((c) => c.optionId === optionId);

      if (existingIndex >= 0) {
        const existing = newCustomizations[existingIndex]!;

        if (option.maxSelections === 1) {
          // Single selection - replace
          existing.choiceIds = [choiceId];
          // Clear custom value when selecting predefined option
          if (existing.customValue) {
            delete existing.customValue;
          }
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

      onCustomizationChange(newCustomizations);
    },
    [customizations, onCustomizationChange]
  );

  // Handle custom value change (for custom text input)
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

  // Render a single choice
  const renderChoice = useCallback(
    (option: CustomizationOption, choice: CustomizationChoice) => {
      const currentCustomization = getCurrentCustomization(option.id);
      const isSelected = currentCustomization?.choiceIds.includes(choice.id);

      return (
        <button
          key={choice.id}
          type="button"
          onClick={() => handleChoiceSelection(option.id, choice.id, option)}
          className={cn(
            "flex items-center justify-between p-3 border rounded-lg transition-colors text-left",
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
              <div className="font-medium">
                {choice.label[locale as keyof typeof choice.label]}
              </div>
              {choice.priceModifier !== 0 && (
                <div className="text-sm text-neutral-600">
                  {formatPriceModifier(choice.priceModifier)}
                </div>
              )}
            </div>
          </div>
        </button>
      );
    },
    [getCurrentCustomization, handleChoiceSelection, locale, formatPriceModifier]
  );

  // Handle custom text validation
  const handleCustomTextValidation = useCallback(
    (text: string) => {
      const validation = validateCustomRibbonText(text, locale);
      setCustomTextValidation(validation);
    },
    [locale]
  );

  // Handle custom value change with validation
  const handleCustomValueChangeWithValidation = useCallback(
    (optionId: string, value: string) => {
      handleCustomValueChange(optionId, value);
      // Validate the text in real-time
      if (value.trim()) {
        handleCustomTextValidation(value);
      } else {
        setCustomTextValidation({ errors: [], warnings: [] });
      }
    },
    [handleCustomValueChange, handleCustomTextValidation]
  );

  // Render custom text input for choices that allow custom input
  const renderCustomTextInput = useCallback(
    (option: CustomizationOption, choice: CustomizationChoice) => {
      const currentCustomization = getCurrentCustomization(option.id);
      const isSelected = currentCustomization?.choiceIds.includes(choice.id);
      const value = currentCustomization?.customValue || "";

      if (!isSelected) {
        return null;
      }

      const hasErrors = customTextValidation.errors.length > 0;
      const hasWarnings = customTextValidation.warnings.length > 0;

      return (
        <div className="mt-3 space-y-2">
          <textarea
            value={value}
            onChange={(e) => handleCustomValueChangeWithValidation(option.id, e.target.value)}
            placeholder={t("customTextPlaceholder")}
            className={cn(
              "w-full p-3 border rounded-lg focus:ring-2 resize-none transition-colors",
              hasErrors
                ? "border-red-300 focus:ring-red-200 focus:border-red-500"
                : hasWarnings
                  ? "border-amber-300 focus:ring-amber-200 focus:border-amber-500"
                  : "border-neutral-300 focus:ring-primary-200 focus:border-primary-500"
            )}
            rows={2}
            maxLength={choice.maxLength || 50}
            aria-label={t("customTextAriaLabel")}
            aria-invalid={hasErrors}
            aria-describedby={hasErrors || hasWarnings ? `${option.id}-validation` : undefined}
          />

          {/* Character count and validation messages */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-neutral-500">
              <span>{t("customTextHelp")}</span>
              <span className={cn(
                value.length > 40 ? "text-amber-600" : "",
                value.length >= 50 ? "text-red-600 font-medium" : ""
              )}>
                {value.length}/{choice.maxLength || 50}
              </span>
            </div>

            {/* Validation errors */}
            {hasErrors && (
              <div id={`${option.id}-validation`} className="text-xs text-red-600 space-y-1">
                {customTextValidation.errors.map((error, index) => (
                  <div key={index} className="flex items-start gap-1">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>{error}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Validation warnings */}
            {hasWarnings && !hasErrors && (
              <div id={`${option.id}-validation`} className="text-xs text-amber-600 space-y-1">
                {customTextValidation.warnings.map((warning, index) => (
                  <div key={index} className="flex items-start gap-1">
                    <span className="text-amber-500 mt-0.5">⚠</span>
                    <span>{warning}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    },
    [getCurrentCustomization, handleCustomValueChangeWithValidation, t, customTextValidation]
  );

  // Don't render if not visible
  if (!isVisible) {
    return null;
  }

  return (
    <div className={cn("space-y-6 p-4 bg-stone-50 rounded-lg border", className)}>
      <div className="space-y-4">
        <h4 className="font-semibold text-stone-900 flex items-center gap-2">
          {t("ribbonConfiguration")}
          <span className="text-sm font-normal text-stone-500">({t("optional")})</span>
        </h4>

        {/* Ribbon Color Selection */}
        {colorOption && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-medium text-stone-800">
                  {colorOption.name[locale as keyof typeof colorOption.name]}
                  {colorOption.required && <span className="text-red-500 ml-1">*</span>}
                </h5>
                {colorOption.description && (
                  <p className="text-sm text-stone-600 mt-1">
                    {colorOption.description[locale as keyof typeof colorOption.description]}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {(colorOption.choices || []).map((choice) => renderChoice(colorOption, choice))}
            </div>

            {/* Validation for color */}
            {colorOption.required && !getCurrentCustomization(colorOption.id)?.choiceIds.length && (
              <div className="text-sm text-red-600">
                {t("validation.conditionalRequired", {
                  option: colorOption.name[locale as keyof typeof colorOption.name],
                })}
              </div>
            )}
          </div>
        )}

        {/* Ribbon Text Selection */}
        {textOption && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-medium text-stone-800">
                  {textOption.name[locale as keyof typeof textOption.name]}
                  {textOption.required && <span className="text-red-500 ml-1">*</span>}
                </h5>
                {textOption.description && (
                  <p className="text-sm text-stone-600 mt-1">
                    {textOption.description[locale as keyof typeof textOption.description]}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              {(textOption.choices || []).map((choice) => (
                <div key={choice.id}>
                  {renderChoice(textOption, choice)}
                  {choice.allowCustomInput && renderCustomTextInput(textOption, choice)}
                </div>
              ))}
            </div>

            {/* Validation for text */}
            {textOption.required && !getCurrentCustomization(textOption.id)?.choiceIds.length && (
              <div className="text-sm text-red-600">
                {t("validation.conditionalRequired", {
                  option: textOption.name[locale as keyof typeof textOption.name],
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
