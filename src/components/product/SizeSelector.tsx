import { useTranslations } from "next-intl";
import { cn, formatPrice } from "@/lib/utils";
import type { CustomizationChoice, CustomizationOption } from "@/types/product";

interface SizeSelectorProps {
  sizeOption: CustomizationOption;
  selectedSize: string | null;
  onSizeChange: (sizeId: string) => void;
  locale: string;
  basePrice: number;
  className?: string;
}

export function SizeSelector({
  sizeOption,
  selectedSize,
  onSizeChange,
  locale,
  basePrice,
  className,
}: SizeSelectorProps) {
  const t = useTranslations("product");
  const tCurrency = useTranslations("currency");
  const tAccessibility = useTranslations("accessibility");

  // Early return with error handling if sizeOption is invalid
  if (!sizeOption) {
    console.warn("⚠️ [SizeSelector] No size option provided");
    return null;
  }

  // Ensure choices array exists and has valid data
  const choices = sizeOption.choices || [];
  if (choices.length === 0) {
    console.warn("⚠️ [SizeSelector] No size choices available for option:", sizeOption.id);
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-amber-300">
            {sizeOption.name?.[locale as keyof typeof sizeOption.name] || "Size"}
          </h3>
        </div>
        <div className="text-sm text-amber-300 p-4 bg-amber-100 rounded-lg">
          {t("noSizesAvailable")}
        </div>
      </div>
    );
  }

  const formatPriceDisplay = (price: number, showSign = false) => {
    const sign = showSign && price >= 0 ? "+" : "";
    const formattedPrice = formatPrice(price, locale as "cs" | "en");
    return tCurrency("format", {
      amount: `${sign}${formattedPrice}`,
    });
  };

  const getDisplayPrice = (choice: CustomizationChoice) => {
    const totalPrice = basePrice + choice.priceModifier;
    return formatPriceDisplay(totalPrice);
  };

  const getPriceModifierDisplay = (priceModifier: number) => {
    if (priceModifier === 0) return null;
    return formatPriceDisplay(priceModifier, true);
  };

  const sectionId = `size-selector-${sizeOption.id}`;
  const hasValidationError = sizeOption.required && !selectedSize;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with required indicator */}
      <div className="flex items-center gap-2">
        <h3 id={`${sectionId}-title`} className="text-lg font-semibold text-amber-300">
          {sizeOption.name?.[locale as keyof typeof sizeOption.name] || "Size"}
        </h3>
        {sizeOption.required && (
          <span
            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-red-500"
            aria-label={tAccessibility("required")}
          >
            {t("required")}
          </span>
        )}
      </div>

      {/* Size options fieldset for proper grouping */}
      <fieldset
        className="border-0 p-0 m-0"
        aria-labelledby={`${sectionId}-title`}
        aria-describedby={hasValidationError ? `${sectionId}-error` : undefined}
        aria-required={sizeOption.required}
      >
        <legend className="sr-only">
          {sizeOption.name?.[locale as keyof typeof sizeOption.name] || "Size"}
          {sizeOption.required && ` (${tAccessibility("required")})`}
        </legend>

        {/* Size options grid */}
        <div
          className="grid grid-cols-1 sm:grid-cols-3 gap-3"
          role="radiogroup"
          aria-labelledby={`${sectionId}-title`}
        >
          {choices.map((choice, index) => {
            const isSelected = selectedSize === choice.id;
            const priceModifier = getPriceModifierDisplay(choice.priceModifier);
            const choiceId = `${sectionId}-choice-${choice.id}`;

            return (
              <button
                key={choice.id}
                id={choiceId}
                type="button"
                onClick={() => onSizeChange(choice.id)}
                disabled={!choice.available}
                className={cn(
                  // Base styles
                  "relative p-4 rounded-lg border-2 text-left transition-all duration-200 ",
                  "disabled:opacity-50 disabled:cursor-not-allowed",

                  // Selected state
                  isSelected
                    ? "border-amber-200 bg-amber-300 shadow-md"
                    : "border-amber-300 bg-amber-100 ",

                  // Interactive states
                  "active:scale-[0.98] transition-transform duration-75",

                  // High contrast support
                  "high-contrast:border-current high-contrast:hover:bg-Highlight high-contrast:hover:text-HighlightText"

                  // Focus improvements for accessibility
                )}
                role="radio"
                aria-checked={isSelected}
                aria-describedby={`${choiceId}-description`}
                aria-labelledby={`${choiceId}-label`}
                aria-posinset={index + 1}
                aria-setsize={choices.length}
                tabIndex={isSelected ? 0 : -1}
              >
                {/* Selection indicator */}
                <div className="absolute top-3 right-3" aria-hidden="true">
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full border-2 transition-colors duration-200",
                      isSelected ? "border-teal-900 bg-amber-300" : "border-teal-800 bg-amber-100"
                    )}
                  >
                    {isSelected && (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-teal-800 rounded-full" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Size information */}
                <div className="pr-8">
                  <div id={`${choiceId}-label`} className="font-semibold text-teal-800">
                    {choice.label?.[locale as keyof typeof choice.label] || choice.id}
                  </div>

                  <div className="mt-2 space-y-1">
                    <div className="text-lg font-bold text-teal-800">{getDisplayPrice(choice)}</div>
                    {priceModifier && <div className="text-sm text-teal-800">{priceModifier}</div>}
                  </div>

                  {!choice.available && (
                    <div className="text-sm text-red-600 mt-2">{t("unavailable")}</div>
                  )}
                </div>

                {/* Screen reader description */}
                <div id={`${choiceId}-description`} className="sr-only">
                  {choice.label?.[locale as keyof typeof choice.label] || choice.id},{" "}
                  {getDisplayPrice(choice)}
                  {priceModifier && `, ${priceModifier}`}
                  {!choice.available && `, ${t("unavailable")}`}
                  {isSelected && ` - ${tAccessibility("selected")}`}
                </div>
              </button>
            );
          })}
        </div>

        {/* Validation error message */}
        {hasValidationError && (
          <div
            id={`${sectionId}-error`}
            className="mt-3 text-sm text-red-600"
            role="alert"
            aria-live="polite"
          >
            {t("validation.sizeRequired")}
          </div>
        )}
      </fieldset>
    </div>
  );
}
