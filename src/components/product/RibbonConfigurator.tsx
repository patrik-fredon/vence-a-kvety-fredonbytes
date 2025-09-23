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

export interface RibbonConfiguratorProps {
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
  const tAccessibility = useTranslations("accessibility");
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
    (option: CustomizationOption, choice: CustomizationChoice, index: number) => {
      const currentCustomization = getCurrentCustomization(option.id);
      const isSelected = currentCustomization?.choiceIds.includes(choice.id);
      const choiceId = `${option.id}-choice-${choice.id}`;
      const isRadioGroup = option.maxSelections === 1;

      return (
        <button
          key={choice.id}
          id={choiceId}
          type="button"
          onClick={() => handleChoiceSelection(option.id, choice.id, option)}
          className={cn(
            "flex items-center justify-between p-3 border rounded-lg transition-colors text-left",
            "focus:outline-none focus:ring-2 focus:ring-stone-950 focus:ring-offset-2",
            isSelected
              ? "border-stone-900 bg-stone-50 text-stone-900"
              : "border-stone-300 bg-white hover:border-stone-400 hover:bg-stone-50",
            // High contrast support
            "high-contrast:border-current high-contrast:hover:bg-Highlight high-contrast:hover:text-HighlightText"
          )}
          role={isRadioGroup ? "radio" : "checkbox"}
          aria-checked={isSelected}
          aria-describedby={`${choiceId}-description`}
          aria-labelledby={`${choiceId}-label`}
          {...(isRadioGroup && {
            "aria-posinset": index + 1,
            "aria-setsize": option.choices?.length || 0,
            tabIndex: isSelected ? 0 : -1,
          })}
        >
          <div className="flex items-center space-x-3">
            <div
              className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                isSelected ? "border-stone-900 bg-stone-900" : "border-stone-300"
              )}
              aria-hidden="true"
            >
              {isSelected && <CheckIcon className="w-3 h-3 text-white" />}
            </div>
            <div className="text-left">
              <div id={`${choiceId}-label`} className="font-medium">
                {choice.label[locale as keyof typeof choice.label]}
              </div>
              {choice.priceModifier !== 0 && (
                <div className="text-sm text-stone-600">
                  {formatPriceModifier(choice.priceModifier)}
                </div>
              )}
            </div>
          </div>

          {/* Screen reader description */}
          <div id={`${choiceId}-description`} className="sr-only">
            {choice.label[locale as keyof typeof choice.label]}
            {choice.priceModifier !== 0 && `, ${formatPriceModifier(choice.priceModifier)}`}
            {isSelected && ` - ${tAccessibility("selected")}`}
          </div>
        </button>
      );
    },
    [getCurrentCustomization, handleChoiceSelection, locale, formatPriceModifier, tAccessibility]
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
      const inputId = `${option.id}-custom-text`;
      const validationId = `${option.id}-validation`;

      return (
        <div className="mt-3 space-y-2">
          <label htmlFor={inputId} className="sr-only">
            {t("customTextAriaLabel")}
          </label>
          <textarea
            id={inputId}
            value={value}
            onChange={(e) => handleCustomValueChangeWithValidation(option.id, e.target.value)}
            placeholder={t("customTextPlaceholder")}
            className={cn(
              "w-full p-3 border rounded-lg focus:ring-2 resize-none transition-colors",
              "focus:outline-none",
              hasErrors
                ? "border-red-300 focus:ring-red-200 focus:border-red-500"
                : hasWarnings
                  ? "border-amber-300 focus:ring-amber-200 focus:border-amber-500"
                  : "border-stone-300 focus:ring-stone-200 focus:border-stone-500"
            )}
            rows={2}
            maxLength={choice.maxLength || 50}
            aria-label={t("customTextAriaLabel")}
            aria-invalid={hasErrors}
            aria-describedby={cn(
              hasErrors || hasWarnings ? validationId : undefined,
              `${inputId}-help`
            )}
            aria-required={option.required}
          />

          {/* Character count and validation messages */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-stone-500">
              <span id={`${inputId}-help`}>{t("customTextHelp")}</span>
              <span
                className={cn(
                  value.length > 40 ? "text-amber-600" : "",
                  value.length >= 50 ? "text-red-600 font-medium" : ""
                )}
                aria-label={`${value.length} ${tAccessibility("charactersOf")} ${choice.maxLength || 50}`}
              >
                {value.length}/{choice.maxLength || 50}
              </span>
            </div>

            {/* Validation errors */}
            {hasErrors && (
              <div
                id={validationId}
                className="text-xs text-red-600 space-y-1"
                role="alert"
                aria-live="polite"
              >
                {customTextValidation.errors.map((error, index) => (
                  <div key={index} className="flex items-start gap-1">
                    <span className="text-red-500 mt-0.5" aria-hidden="true">•</span>
                    <span>{error}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Validation warnings */}
            {hasWarnings && !hasErrors && (
              <div
                id={validationId}
                className="text-xs text-amber-600 space-y-1"
                role="alert"
                aria-live="polite"
              >
                {customTextValidation.warnings.map((warning, index) => (
                  <div key={index} className="flex items-start gap-1">
                    <span className="text-amber-500 mt-0.5" aria-hidden="true">⚠</span>
                    <span>{warning}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    },
    [getCurrentCustomization, handleCustomValueChangeWithValidation, t, customTextValidation, tAccessibility]
  );

  // Don't render if not visible
  if (!isVisible) {
    return null;
  }

  const sectionId = "ribbon-configurator";

  return (
    <section
      className={cn("space-y-6 p-4 bg-stone-50 rounded-lg border", className)}
      aria-labelledby={`${sectionId}-title`}
      role="region"
    >
      <div className="space-y-4">
        <h4
          id={`${sectionId}-title`}
          className="font-semibold text-stone-900 flex items-center gap-2"
        >
          {t("ribbonConfiguration")}
          <span
            className="text-sm font-normal text-stone-500"
            aria-label={tAccessibility("optional")}
          >
            ({t("optional")})
          </span>
        </h4>

        {/* Ribbon Color Selection */}
        {colorOption && (
          <fieldset className="space-y-3 border-0 p-0 m-0">
            <legend className="sr-only">
              {colorOption.name[locale as keyof typeof colorOption.name]}
              {colorOption.required && ` (${tAccessibility("required")})`}
            </legend>

            <div className="flex items-center justify-between">
              <div>
                <h5
                  id={`${colorOption.id}-title`}
                  className="font-medium text-stone-800"
                >
                  {colorOption.name[locale as keyof typeof colorOption.name]}
                  {colorOption.required && (
                    <span className="text-red-500 ml-1" aria-label={tAccessibility("required")}>*</span>
                  )}
                </h5>
                {colorOption.description && (
                  <p className="text-sm text-stone-600 mt-1">
                    {colorOption.description[locale as keyof typeof colorOption.description]}
                  </p>
                )}
              </div>
            </div>

            <div
              className="grid grid-cols-2 gap-3"
              role={colorOption.maxSelections === 1 ? "radiogroup" : "group"}
              aria-labelledby={`${colorOption.id}-title`}
              aria-required={colorOption.required}
            >
              {(colorOption.choices || []).map((choice, index) =>
                renderChoice(colorOption, choice, index)
              )}
            </div>

            {/* Validation for color */}
            {colorOption.required && !getCurrentCustomization(colorOption.id)?.choiceIds.length && (
              <div
                className="text-sm text-red-600"
                role="alert"
                aria-live="polite"
              >
                {t("validation.conditionalRequired", {
                  option: colorOption.name[locale as keyof typeof colorOption.name],
                })}
              </div>
            )}
          </fieldset>
        )}

        {/* Ribbon Text Selection */}
        {textOption && (
          <fieldset className="space-y-3 border-0 p-0 m-0">
            <legend className="sr-only">
              {textOption.name[locale as keyof typeof textOption.name]}
              {textOption.required && ` (${tAccessibility("required")})`}
            </legend>

            <div className="flex items-center justify-between">
              <div>
                <h5
                  id={`${textOption.id}-title`}
                  className="font-medium text-stone-800"
                >
                  {textOption.name[locale as keyof typeof textOption.name]}
                  {textOption.required && (
                    <span className="text-red-500 ml-1" aria-label={tAccessibility("required")}>*</span>
                  )}
                </h5>
                {textOption.description && (
                  <p className="text-sm text-stone-600 mt-1">
                    {textOption.description[locale as keyof typeof textOption.description]}
                  </p>
                )}
              </div>
            </div>

            <div
              className="space-y-2"
              role={textOption.maxSelections === 1 ? "radiogroup" : "group"}
              aria-labelledby={`${textOption.id}-title`}
              aria-required={textOption.required}
            >
              {(textOption.choices || []).map((choice, index) => (
                <div key={choice.id}>
                  {renderChoice(textOption, choice, index)}
                  {choice.allowCustomInput && renderCustomTextInput(textOption, choice)}
                </div>
              ))}
            </div>

            {/* Validation for text */}
            {textOption.required && !getCurrentCustomization(textOption.id)?.choiceIds.length && (
              <div
                className="text-sm text-red-600"
                role="alert"
                aria-live="polite"
              >
                {t("validation.conditionalRequired", {
                  option: textOption.name[locale as keyof typeof textOption.name],
                })}
              </div>
            )}
          </fieldset>
        )}
      </div>
    </section>
  );
}
