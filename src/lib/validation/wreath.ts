import type { Customization, CustomizationOption } from '@/types/product';

// Type definitions for wreath validation
export interface WreathValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  hasRibbonSelected: boolean;
}

export interface WreathValidationOptions {
  locale?: string;
  strictMode?: boolean;
  allowEmptyCustomText?: boolean;
}

// Wreath-specific validation functions
export function validateWreathCustomizations(
  customizations: Customization[],
  customizationOptions: CustomizationOption[],
  selectedSize: string | null,
  locale: string = 'cs'
): WreathValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Find wreath-specific options
  const sizeOption = customizationOptions.find(
    (option) => option.type === "size" || option.id === "size"
  );
  const ribbonOption = customizationOptions.find(
    (option) => option.type === "ribbon" || option.id === "ribbon"
  );
  const ribbonColorOption = customizationOptions.find(
    (option) => option.type === "ribbon_color" || option.id === "ribbon_color"
  );
  const ribbonTextOption = customizationOptions.find(
    (option) => option.type === "ribbon_text" || option.id === "ribbon_text"
  );

  // 1. Validate mandatory size selection
  if (sizeOption?.required && !selectedSize) {
    errors.push(
      locale === 'cs'
        ? "Prosím vyberte velikost věnce před přidáním do košíku"
        : "Please select wreath size before adding to cart"
    );
  }

  // Validate size is from available options
  if (selectedSize && sizeOption) {
    const validSizeIds = sizeOption.choices?.map(choice => choice.id) || [];
    if (!validSizeIds.includes(selectedSize)) {
      errors.push(
        locale === 'cs'
          ? "Vybraná velikost není dostupná"
          : "Selected size is not available"
      );
    }
  }

  // 2. Check if ribbon is selected
  const ribbonCustomization = customizations.find(
    (c) => c.optionId === ribbonOption?.id
  );
  const isRibbonSelected = ribbonCustomization && ribbonCustomization.choiceIds.length > 0;

  // 3. Validate ribbon dependency requirements
  if (isRibbonSelected) {
    // Validate ribbon color is selected when ribbon is chosen
    if (ribbonColorOption) {
      const colorCustomization = customizations.find(
        (c) => c.optionId === ribbonColorOption.id
      );
      if (!colorCustomization || colorCustomization.choiceIds.length === 0) {
        errors.push(
          locale === 'cs'
            ? "Při výběru stuhy je nutné zvolit barvu"
            : "Ribbon color selection is required when adding ribbon"
        );
      }
    }

    // Validate ribbon text is selected when ribbon is chosen
    if (ribbonTextOption) {
      const textCustomization = customizations.find(
        (c) => c.optionId === ribbonTextOption.id
      );
      if (!textCustomization ||
        (textCustomization.choiceIds.length === 0 && !textCustomization.customValue)) {
        errors.push(
          locale === 'cs'
            ? "Při výběru stuhy je nutné zvolit text"
            : "Ribbon text selection is required when adding ribbon"
        );
      }

      // Validate custom text if provided
      if (textCustomization?.customValue) {
        const customTextValidation = validateCustomRibbonText(
          textCustomization.customValue,
          locale
        );
        errors.push(...customTextValidation.errors);
        warnings.push(...customTextValidation.warnings);
      }
    }
  }

  // 4. Validate other required customizations
  customizationOptions.forEach((option) => {
    // Skip size and ribbon-related options as they're handled above
    if (option.type === "size" || option.id === "size" ||
      option.type === "ribbon" || option.id === "ribbon" ||
      option.type === "ribbon_color" || option.id === "ribbon_color" ||
      option.type === "ribbon_text" || option.id === "ribbon_text") {
      return;
    }

    const customization = customizations.find((c) => c.optionId === option.id);

    if (option.required && (!customization || customization.choiceIds.length === 0)) {
      const optionName = option.name[locale as keyof typeof option.name] || option.name.cs || option.id;
      errors.push(
        locale === 'cs'
          ? `Pole "${optionName}" je povinné`
          : `Field "${optionName}" is required`
      );
    }

    if (customization) {
      // Validate min/max selections
      if (option.minSelections && customization.choiceIds.length < option.minSelections) {
        const optionName = option.name[locale as keyof typeof option.name] || option.name.cs || option.id;
        errors.push(
          locale === 'cs'
            ? `Pole "${optionName}" vyžaduje minimálně ${option.minSelections} výběrů`
            : `Field "${optionName}" requires at least ${option.minSelections} selections`
        );
      }

      if (option.maxSelections && customization.choiceIds.length > option.maxSelections) {
        const optionName = option.name[locale as keyof typeof option.name] || option.name.cs || option.id;
        errors.push(
          locale === 'cs'
            ? `Pole "${optionName}" umožňuje maximálně ${option.maxSelections} výběrů`
            : `Field "${optionName}" allows maximum ${option.maxSelections} selections`
        );
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    hasRibbonSelected: isRibbonSelected || false
  };
}

export function validateCustomRibbonText(
  customText: string,
  locale: string = 'cs'
): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if text is provided
  if (!customText || customText.trim().length === 0) {
    errors.push(
      locale === 'cs'
        ? "Vlastní text nemůže být prázdný"
        : "Custom text cannot be empty"
    );
    return { errors, warnings };
  }

  // Sanitize and validate length
  const sanitizedText = sanitizeCustomText(customText);

  if (sanitizedText.length > 50) {
    errors.push(
      locale === 'cs'
        ? "Vlastní text může mít maximálně 50 znaků"
        : "Custom text can have maximum 50 characters"
    );
  }

  if (sanitizedText.length < 2) {
    errors.push(
      locale === 'cs'
        ? "Vlastní text musí mít alespoň 2 znaky"
        : "Custom text must have at least 2 characters"
    );
  }

  // Check for potentially inappropriate content
  const inappropriatePatterns = [
    /\b(fuck|shit|damn|hell|bitch)\b/gi, // English profanity
    /\b(kurva|píča|hovno|sráč)\b/gi, // Czech profanity
    /<script|javascript:|data:/gi, // XSS patterns
    /[<>]/g // HTML tags
  ];

  for (const pattern of inappropriatePatterns) {
    if (pattern.test(customText)) {
      errors.push(
        locale === 'cs'
          ? "Text obsahuje nepovolené znaky nebo obsah"
          : "Text contains invalid characters or content"
      );
      break;
    }
  }

  // Warning for very long text (approaching limit)
  if (sanitizedText.length > 40) {
    warnings.push(
      locale === 'cs'
        ? "Text se blíží maximální délce"
        : "Text is approaching maximum length"
    );
  }

  return { errors, warnings };
}

export function sanitizeCustomText(text: string): string {
  if (!text) return '';

  return text
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/[<>]/g, '') // Remove HTML brackets
    .replace(/[^\p{L}\p{N}\p{P}\p{Z}]/gu, '') // Keep only letters, numbers, punctuation, and spaces (Unicode-aware)
    .substring(0, 50); // Enforce max length
}

export function validateWreathSizeSelection(
  selectedSize: string | null,
  sizeOption: CustomizationOption | undefined,
  locale: string = 'cs'
): { isValid: boolean; error?: string } {
  if (!sizeOption) {
    return { isValid: true };
  }

  if (sizeOption.required && !selectedSize) {
    return {
      isValid: false,
      error: locale === 'cs'
        ? "Velikost věnce je povinná"
        : "Wreath size is required"
    };
  }

  if (selectedSize && sizeOption.choices) {
    const validSizeIds = sizeOption.choices.map(choice => choice.id);
    if (!validSizeIds.includes(selectedSize)) {
      return {
        isValid: false,
        error: locale === 'cs'
          ? "Vybraná velikost není dostupná"
          : "Selected size is not available"
      };
    }
  }

  return { isValid: true };
}

export function validateRibbonDependencies(
  customizations: Customization[],
  ribbonOption: CustomizationOption | undefined,
  ribbonColorOption: CustomizationOption | undefined,
  ribbonTextOption: CustomizationOption | undefined,
  locale: string = 'cs'
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!ribbonOption) {
    return { isValid: true, errors };
  }

  const ribbonCustomization = customizations.find(c => c.optionId === ribbonOption.id);
  const isRibbonSelected = ribbonCustomization && ribbonCustomization.choiceIds.length > 0;

  if (isRibbonSelected) {
    // Check ribbon color
    if (ribbonColorOption) {
      const colorCustomization = customizations.find(c => c.optionId === ribbonColorOption.id);
      if (!colorCustomization || colorCustomization.choiceIds.length === 0) {
        errors.push(
          locale === 'cs'
            ? "Barva stuhy je povinná při výběru stuhy"
            : "Ribbon color is required when ribbon is selected"
        );
      }
    }

    // Check ribbon text
    if (ribbonTextOption) {
      const textCustomization = customizations.find(c => c.optionId === ribbonTextOption.id);
      if (!textCustomization ||
        (textCustomization.choiceIds.length === 0 && !textCustomization.customValue)) {
        errors.push(
          locale === 'cs'
            ? "Text stuhy je povinný při výběru stuhy"
            : "Ribbon text is required when ribbon is selected"
        );
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Comprehensive validation function that combines all wreath validations
export function validateWreathConfiguration(
  customizations: Customization[],
  customizationOptions: CustomizationOption[],
  selectedSize: string | null,
  options: WreathValidationOptions = {}
): WreathValidationResult {
  const { locale = 'cs', strictMode = false } = options;

  const result = validateWreathCustomizations(
    customizations,
    customizationOptions,
    selectedSize,
    locale
  );

  // In strict mode, treat warnings as errors
  if (strictMode && result.warnings.length > 0) {
    result.errors.push(...result.warnings);
    result.warnings = [];
    result.isValid = false;
  }

  return result;
}

// Validation error message constants
export const WREATH_VALIDATION_MESSAGES = {
  cs: {
    sizeRequired: "Prosím vyberte velikost věnce před přidáním do košíku",
    sizeInvalid: "Vybraná velikost není dostupná",
    ribbonColorRequired: "Při výběru stuhy je nutné zvolit barvu",
    ribbonTextRequired: "Při výběru stuhy je nutné zvolit text",
    customTextEmpty: "Vlastní text nemůže být prázdný",
    customTextTooLong: "Vlastní text může mít maximálně 50 znaků",
    customTextTooShort: "Vlastní text musí mít alespoň 2 znaky",
    customTextInvalid: "Text obsahuje nepovolené znaky nebo obsah",
    customTextWarning: "Text se blíží maximální délce",
    fieldRequired: "Pole je povinné",
    minSelections: "Vyžaduje minimálně {min} výběrů",
    maxSelections: "Umožňuje maximálně {max} výběrů"
  },
  en: {
    sizeRequired: "Please select wreath size before adding to cart",
    sizeInvalid: "Selected size is not available",
    ribbonColorRequired: "Ribbon color selection is required when adding ribbon",
    ribbonTextRequired: "Ribbon text selection is required when adding ribbon",
    customTextEmpty: "Custom text cannot be empty",
    customTextTooLong: "Custom text can have maximum 50 characters",
    customTextTooShort: "Custom text must have at least 2 characters",
    customTextInvalid: "Text contains invalid characters or content",
    customTextWarning: "Text is approaching maximum length",
    fieldRequired: "Field is required",
    minSelections: "Requires at least {min} selections",
    maxSelections: "Allows maximum {max} selections"
  }
} as const;

// Helper function to get localized validation message
export function getValidationMessage(
  key: keyof typeof WREATH_VALIDATION_MESSAGES.cs,
  locale: string = 'cs',
  params?: Record<string, string | number>
): string {
  const messages = WREATH_VALIDATION_MESSAGES[locale as keyof typeof WREATH_VALIDATION_MESSAGES] || WREATH_VALIDATION_MESSAGES.cs;
  let message = messages[key] || key;

  if (params) {
    Object.entries(params).forEach(([param, value]) => {
      message = message.replace(`{${param}}`, String(value));
    });
  }

  return message;
}
