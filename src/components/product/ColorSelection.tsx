import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface ColorSelectionProps {
  selectedColor: string | null;
  onColorChange: (colorId: string) => void;
  locale: string;
  className?: string;
}

const WREATH_COLORS = [
  { id: "purple", nameCs: "Fialová", nameEn: "Purple", hex: "#9333EA" },
  { id: "white", nameCs: "Bílá", nameEn: "White", hex: "#FFFFFF" },
  { id: "pink", nameCs: "Růžová", nameEn: "Pink", hex: "#EC4899" },
  { id: "yellow", nameCs: "Žlutá", nameEn: "Yellow", hex: "#EAB308" },
  { id: "green", nameCs: "Zelená", nameEn: "Green", hex: "#22C55E" },
  { id: "red", nameCs: "Červená", nameEn: "Red", hex: "#EF4444" },
  { id: "orange", nameCs: "Oranžová", nameEn: "Orange", hex: "#F97316" },
] as const;

export function ColorSelection({
  selectedColor,
  onColorChange,
  locale,
  className,
}: ColorSelectionProps) {
  const t = useTranslations("product");
  const tAccessibility = useTranslations("accessibility");

  const sectionId = "color-selector";
  const hasValidationError = !selectedColor;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with required indicator */}
      <div className="flex items-center gap-2">
        <h3 id={`${sectionId}-title`} className="text-lg font-semibold text-amber-300">
          {t("color.title")}
        </h3>
        <span
          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-red-500"
          aria-label={tAccessibility("required")}
        >
          {t("required")}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-amber-300">{t("color.description")}</p>

      {/* Color options fieldset */}
      <fieldset
        className="border-0 p-0 m-0"
        aria-labelledby={`${sectionId}-title`}
        aria-describedby={hasValidationError ? `${sectionId}-error` : undefined}
        aria-required={true}
      >
        <legend className="sr-only">
          {t("color.title")} ({tAccessibility("required")})
        </legend>

        {/* Color options grid */}
        <div
          className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3"
          role="radiogroup"
          aria-labelledby={`${sectionId}-title`}
        >
          {WREATH_COLORS.map((color, index) => {
            const isSelected = selectedColor === color.id;
            const colorId = `${sectionId}-choice-${color.id}`;
            const colorName = locale === "cs" ? color.nameCs : color.nameEn;

            return (
              <button
                key={color.id}
                id={colorId}
                type="button"
                onClick={() => onColorChange(color.id)}
                className={cn(
                  // Base styles
                  "relative flex flex-col items-center gap-2 p-2 rounded-lg  transition-all duration-200",

                  // Selected state
                  isSelected
                    ? "border-amber-200 bg-amber-200  shadow-md"
                    : "border-amber-300 bg-teal-900 text-amber-100 hover:border-amber-200",

                  // Interactive states
                  "active:scale-[0.98] transition-transform duration-75",

                  // High contrast support
                  "high-contrast:border-current high-contrast:hover:bg-Highlight high-contrast:hover:text-HighlightText"
                )}
                role="radio"
                aria-checked={isSelected}
                aria-labelledby={`${colorId}-label`}
                aria-posinset={index + 1}
                aria-setsize={WREATH_COLORS.length}
                tabIndex={isSelected ? 0 : -1}
              >
                {/* Color swatch */}
                <div
                  className={cn(
                    "w-12 h-12 rounded-full  transition-all duration-200",
                    isSelected ? " scale-105" : "",
                    color.id === "white" && "border-gray-300"
                  )}
                  style={{ backgroundColor: color.hex }}
                  aria-hidden="true"
                >
                  {/* Selection indicator */}
                  {isSelected && (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* Color name */}
                <div
                  id={`${colorId}-label`}
                  className={cn(
                    "text-xs font-medium text-center",
                    isSelected ? "text-teal-800 font-semibold" : "text-amber-100"
                  )}
                >
                  {colorName}
                </div>

                {/* Screen reader description */}
                <div className="sr-only">
                  {colorName}
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
            {t("color.required")}
          </div>
        )}
      </fieldset>
    </div>
  );
}
