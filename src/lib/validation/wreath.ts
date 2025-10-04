import type { LocalizedContent } from "@/types";
import type { Customization, CustomizationOption } from "@/types/product";

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
  locale: string = "cs"
): WreathValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Helper function to safely get localized name
  const getLocalizedName = (name: string | LocalizedContent): string => {
    if (typeof name === "string") {
      return name;
    }
    return name[locale as keyof typeof name] || name.cs || "Unknown";
  };

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
      locale === "cs"
        ? "Prosím vyberte velikost věnce před přidáním do košíku"
        : "Please select wreath size before adding to cart"
    );
  }

  // Validate size is from available options
  if (selectedSize && sizeOption) {
    const validSizeIds = sizeOption.choices?.map((choice) => choice.id) || [];
    if (!validSizeIds.includes(selectedSize)) {
      errors.push(
        locale === "cs" ? "Vybraná velikost není dostupná" : "Selected size is not available"
      );
    }
  }

  // 2. Check if ribbon is selected - specifically check for "ribbon_yes" choice
  const ribbonCustomization = customizations.find((c) => c.optionId === ribbonOption?.id);
  const isRibbonSelected = ribbonCustomization?.choiceIds.includes("ribbon_yes");

  // 3. Validate ribbon dependency requirements
  if (isRibbonSelected) {
    // Validate ribbon color is selected when ribbon is chosen
    if (ribbonColorOption) {
      const colorCustomization = customizations.find((c) => c.optionId === ribbonColorOption.id);
      if (!colorCustomization || colorCustomization.choiceIds.length === 0) {
        errors.push(
          locale === "cs"
            ? "Při výběru stuhy je nutné zvolit barvu"
            : "Ribbon color selection is required when adding ribbon"
        );
      }
    }

    // Validate ribbon text is selected when ribbon is chosen
    if (ribbonTextOption) {
      const textCustomization = customizations.find((c) => c.optionId === ribbonTextOption.id);
      if (
        !textCustomization ||
        (textCustomization.choiceIds.length === 0 && !textCustomization.customValue)
      ) {
        errors.push(
          locale === "cs"
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
    if (
      option.type === "size" ||
      option.id === "size" ||
      option.type === "ribbon" ||
      option.id === "ribbon" ||
      option.type === "ribbon_color" ||
      option.id === "ribbon_color" ||
      option.type === "ribbon_text" ||
      option.id === "ribbon_text"
    ) {
      return;
    }

    const customization = customizations.find((c) => c.optionId === option.id);

    if (option.required && (!customization || customization.choiceIds.length === 0)) {
      const optionName = getLocalizedName(option.name);
      errors.push(
        locale === "cs" ? `Pole "${optionName}" je povinné` : `Field "${optionName}" is required`
      );
    }

    if (customization) {
      // Validate min/max selections
      if (option.minSelections && customization.choiceIds.length < option.minSelections) {
        const optionName = getLocalizedName(option.name);
        errors.push(
          locale === "cs"
            ? `Pole "${optionName}" vyžaduje minimálně ${option.minSelections} výběrů`
            : `Field "${optionName}" requires at least ${option.minSelections} selections`
        );
      }

      if (option.maxSelections && customization.choiceIds.length > option.maxSelections) {
        const optionName = getLocalizedName(option.name);
        errors.push(
          locale === "cs"
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
    hasRibbonSelected: isRibbonSelected,
  };
}

export function validateCustomRibbonText(
  customText: string,
  locale: string = "cs"
): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if text is provided
  if (!customText || customText.trim().length === 0) {
    errors.push(
      locale === "cs" ? "Vlastní text nemůže být prázdný" : "Custom text cannot be empty"
    );
    return { errors, warnings };
  }

  // Sanitize and validate length
  const sanitizedText = sanitizeCustomText(customText);

  if (sanitizedText.length > 50) {
    errors.push(
      locale === "cs"
        ? "Vlastní text může mít maximálně 50 znaků"
        : "Custom text can have maximum 50 characters"
    );
  }

  if (sanitizedText.length < 2) {
    errors.push(
      locale === "cs"
        ? "Vlastní text musí mít alespoň 2 znaky"
        : "Custom text must have at least 2 characters"
    );
  }

  // Check for potentially inappropriate content
  const inappropriatePatterns = [
    /\b(fuck|shit|damn|hell|bitch)\b/gi, // English profanity
    /\b(kurva|píča|hovno|sráč)\b/gi, // Czech profanity
    /<script|javascript:|data:/gi, // XSS patterns
    /[<>]/g, // HTML tags
  ];

  for (const pattern of inappropriatePatterns) {
    if (pattern.test(customText)) {
      errors.push(
        locale === "cs"
          ? "Text obsahuje nepovolené znaky nebo obsah"
          : "Text contains invalid characters or content"
      );
      break;
    }
  }

  // Warning for very long text (approaching limit)
  if (sanitizedText.length > 40) {
    warnings.push(
      locale === "cs" ? "Text se blíží maximální délce" : "Text is approaching maximum length"
    );
  }

  return { errors, warnings };
}

export function sanitizeCustomText(text: string): string {
  if (!text) return "";

  return text
    .trim()
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .replace(/[<>]/g, "") // Remove HTML brackets
    .replace(/[^\p{L}\p{N}\p{P}\p{Z}]/gu, "") // Keep only letters, numbers, punctuation, and spaces (Unicode-aware)
    .substring(0, 50); // Enforce max length
}

export function validateWreathSizeSelection(
  selectedSize: string | null,
  sizeOption: CustomizationOption | undefined,
  locale: string = "cs"
): { isValid: boolean; error?: string } {
  if (!sizeOption) {
    return { isValid: true };
  }

  if (sizeOption.required && !selectedSize) {
    return {
      isValid: false,
      error: locale === "cs" ? "Velikost věnce je povinná" : "Wreath size is required",
    };
  }

  if (selectedSize && sizeOption.choices) {
    const validSizeIds = sizeOption.choices.map((choice) => choice.id);
    if (!validSizeIds.includes(selectedSize)) {
      return {
        isValid: false,
        error:
          locale === "cs" ? "Vybraná velikost není dostupná" : "Selected size is not available",
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
  locale: string = "cs"
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!ribbonOption) {
    return { isValid: true, errors };
  }

  const ribbonCustomization = customizations.find((c) => c.optionId === ribbonOption.id);
  const isRibbonSelected = ribbonCustomization?.choiceIds.includes("ribbon_yes");

  if (isRibbonSelected) {
    // Check ribbon color
    if (ribbonColorOption) {
      const colorCustomization = customizations.find((c) => c.optionId === ribbonColorOption.id);
      if (!colorCustomization || colorCustomization.choiceIds.length === 0) {
        errors.push(
          locale === "cs"
            ? "Barva stuhy je povinná při výběru stuhy"
            : "Ribbon color is required when ribbon is selected"
        );
      }
    }

    // Check ribbon text
    if (ribbonTextOption) {
      const textCustomization = customizations.find((c) => c.optionId === ribbonTextOption.id);
      if (
        !textCustomization ||
        (textCustomization.choiceIds.length === 0 && !textCustomization.customValue)
      ) {
        errors.push(
          locale === "cs"
            ? "Text stuhy je povinný při výběru stuhy"
            : "Ribbon text is required when ribbon is selected"
        );
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Comprehensive validation function that combines all wreath validations
export function validateWreathConfiguration(
  customizations: Customization[],
  customizationOptions: CustomizationOption[],
  selectedSize: string | null,
  options: WreathValidationOptions = {}
): WreathValidationResult {
  const { locale = "cs", strictMode = false } = options;

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
    // Size validation messages
    sizeRequired: "Prosím vyberte velikost věnce před přidáním do košíku",
    sizeInvalid: "Vybraná velikost není dostupná",
    sizeUnavailable: "Vybraná velikost není momentálně k dispozici",

    // Ribbon validation messages
    ribbonColorRequired: "Při výběru stuhy je nutné zvolit barvu",
    ribbonTextRequired: "Při výběru stuhy je nutné zvolit text",
    ribbonColorInvalid: "Vybraná barva stuhy není dostupná",
    ribbonTextInvalid: "Vybraný text stuhy není dostupný",

    // Custom text validation messages
    customTextEmpty: "Vlastní text nemůže být prázdný",
    customTextTooLong: "Vlastní text může mít maximálně 50 znaků",
    customTextTooShort: "Vlastní text musí mít alespoň 2 znaky",
    customTextInvalid: "Text obsahuje nepovolené znaky nebo obsah",
    customTextWarning: "Text se blíží maximální délce",
    customTextForbiddenWords: "Text obsahuje zakázaná slova",
    customTextSpecialCharsOnly: "Text musí obsahovat alespoň jedno písmeno",

    // General validation messages
    fieldRequired: "Pole je povinné",
    minSelections: "Vyžaduje minimálně {min} výběrů",
    maxSelections: "Umožňuje maximálně {max} výběrů",
    invalidSelection: "Neplatný výběr",
    optionUnavailable: "Možnost není k dispozici",

    // System error messages
    validationFailed: "Ověření konfigurace selhalo",
    systemError: "Došlo k systémové chybě, zkuste to prosím znovu",
    networkError: "Chyba připojení, zkontrolujte internetové připojení",
    sessionExpired: "Relace vypršela, obnovte prosím stránku",

    // Recovery messages
    tryAgain: "Zkusit znovu",
    refreshPage: "Obnovit stránku",
    contactSupport: "Kontaktovat podporu",
    fallbackMessage: "Pokud problém přetrvává, kontaktujte naši podporu",
  },
  en: {
    // Size validation messages
    sizeRequired: "Please select wreath size before adding to cart",
    sizeInvalid: "Selected size is not available",
    sizeUnavailable: "Selected size is currently unavailable",

    // Ribbon validation messages
    ribbonColorRequired: "Ribbon color selection is required when adding ribbon",
    ribbonTextRequired: "Ribbon text selection is required when adding ribbon",
    ribbonColorInvalid: "Selected ribbon color is not available",
    ribbonTextInvalid: "Selected ribbon text is not available",

    // Custom text validation messages
    customTextEmpty: "Custom text cannot be empty",
    customTextTooLong: "Custom text can have maximum 50 characters",
    customTextTooShort: "Custom text must have at least 2 characters",
    customTextInvalid: "Text contains invalid characters or content",
    customTextWarning: "Text is approaching maximum length",
    customTextForbiddenWords: "Text contains forbidden words",
    customTextSpecialCharsOnly: "Text must contain at least one letter",

    // General validation messages
    fieldRequired: "Field is required",
    minSelections: "Requires at least {min} selections",
    maxSelections: "Allows maximum {max} selections",
    invalidSelection: "Invalid selection",
    optionUnavailable: "Option is not available",

    // System error messages
    validationFailed: "Configuration validation failed",
    systemError: "A system error occurred, please try again",
    networkError: "Connection error, please check your internet connection",
    sessionExpired: "Session expired, please refresh the page",

    // Recovery messages
    tryAgain: "Try again",
    refreshPage: "Refresh page",
    contactSupport: "Contact support",
    fallbackMessage: "If the problem persists, please contact our support",
  },
} as const;
// Error severity levels for better error handling
export enum ValidationErrorSeverity {
  ERROR = "error",
  WARNING = "warning",
  INFO = "info",
}

// Enhanced validation error interface
export interface EnhancedValidationError {
  field: string;
  message: string;
  code: string;
  severity: ValidationErrorSeverity;
  recoverable: boolean;
  retryable: boolean;
  fallbackAction?: string;
  context?: Record<string, any>;
}

// Error recovery strategies
export interface ErrorRecoveryStrategy {
  canRecover: boolean;
  recoveryAction: "retry" | "fallback" | "refresh" | "contact_support";
  recoveryMessage: string;
  fallbackValue?: any;
}

// Enhanced validation result with recovery information
export interface EnhancedWreathValidationResult extends WreathValidationResult {
  enhancedErrors: EnhancedValidationError[];
  recoveryStrategies: ErrorRecoveryStrategy[];
  canProceed: boolean;
  fallbackConfiguration?: Customization[];
}

/**
 * Enhanced validation function with comprehensive error handling
 */
export function validateWreathConfigurationEnhanced(
  customizations: Customization[],
  customizationOptions: CustomizationOption[],
  selectedSize: string | null,
  options: WreathValidationOptions & {
    enableRecovery?: boolean;
    enableFallback?: boolean;
  } = {}
): EnhancedWreathValidationResult {
  const {
    locale = "cs",
    strictMode = false,
    enableRecovery = true,
    enableFallback = true,
  } = options;

  // Run basic validation first
  const basicResult = validateWreathConfiguration(
    customizations,
    customizationOptions,
    selectedSize,
    { locale, strictMode }
  );

  const enhancedErrors: EnhancedValidationError[] = [];
  const recoveryStrategies: ErrorRecoveryStrategy[] = [];
  let canProceed = basicResult.isValid;
  let fallbackConfiguration: Customization[] | undefined;

  // Process each error with enhanced information
  basicResult.errors.forEach((error, _index) => {
    const enhancedError = createEnhancedValidationError(
      error,
      customizations,
      customizationOptions,
      locale
    );
    enhancedErrors.push(enhancedError);

    // Generate recovery strategy if enabled
    if (enableRecovery) {
      const strategy = generateRecoveryStrategy(
        enhancedError,
        customizations,
        customizationOptions,
        locale
      );
      recoveryStrategies.push(strategy);
    }
  });

  // Generate fallback configuration if enabled and needed
  if (enableFallback && !basicResult.isValid) {
    fallbackConfiguration = generateFallbackConfiguration(
      customizations,
      customizationOptions,
      selectedSize,
      enhancedErrors
    );

    // If fallback is available, user can proceed with warnings
    if (fallbackConfiguration) {
      canProceed = true;
    }
  }

  return {
    ...basicResult,
    enhancedErrors,
    recoveryStrategies,
    canProceed,
    ...(fallbackConfiguration && { fallbackConfiguration }),
  };
}

/**
 * Create enhanced validation error with detailed context
 */
function createEnhancedValidationError(
  errorMessage: string,
  customizations: Customization[],
  customizationOptions: CustomizationOption[],
  _locale: string
): EnhancedValidationError {
  // Determine error type and context based on message
  let field = "general";
  let code = "VALIDATION_ERROR";
  let severity = ValidationErrorSeverity.ERROR;
  const recoverable = true;
  const retryable = true;
  let fallbackAction: string | undefined;
  let context: Record<string, any> = {};

  // Analyze error message to determine specifics
  if (errorMessage.includes("velikost") || errorMessage.includes("size")) {
    field = "size";
    code = "SIZE_VALIDATION_ERROR";
    fallbackAction = "select_default_size";
    context = {
      availableSizes:
        customizationOptions.find((opt) => opt.type === "size")?.choices?.map((c) => c.id) || [],
      currentSelection: null,
    };
  } else if (errorMessage.includes("stuhy") || errorMessage.includes("ribbon")) {
    field = "ribbon";
    code = "RIBBON_VALIDATION_ERROR";
    fallbackAction = "remove_ribbon";
    context = {
      hasRibbon: customizations.some((c) => c.optionId.includes("ribbon")),
      ribbonOptions: customizationOptions.filter((opt) => opt.type?.includes("ribbon")),
    };
  } else if (errorMessage.includes("text")) {
    field = "custom_text";
    code = "CUSTOM_TEXT_ERROR";
    fallbackAction = "use_predefined_text";
    severity = ValidationErrorSeverity.WARNING;
    context = {
      textLength: 0,
      maxLength: 50,
    };
  }

  return {
    field,
    message: errorMessage,
    code,
    severity,
    recoverable,
    retryable,
    ...(fallbackAction && { fallbackAction }),
    ...(context && { context }),
  };
}

/**
 * Generate recovery strategy for validation error
 */
function generateRecoveryStrategy(
  error: EnhancedValidationError,
  _customizations: Customization[],
  customizationOptions: CustomizationOption[],
  locale: string
): ErrorRecoveryStrategy {
  const messages = WREATH_VALIDATION_MESSAGES[locale as keyof typeof WREATH_VALIDATION_MESSAGES];

  switch (error.code) {
    case "SIZE_VALIDATION_ERROR":
      return {
        canRecover: true,
        recoveryAction: "fallback",
        recoveryMessage: messages.tryAgain,
        fallbackValue: customizationOptions.find((opt) => opt.type === "size")?.choices?.[0]?.id,
      };

    case "RIBBON_VALIDATION_ERROR":
      return {
        canRecover: true,
        recoveryAction: "fallback",
        recoveryMessage: messages.tryAgain,
        fallbackValue: null, // Remove ribbon configuration
      };

    case "CUSTOM_TEXT_ERROR":
      return {
        canRecover: true,
        recoveryAction: "retry",
        recoveryMessage: messages.tryAgain,
      };

    default:
      return {
        canRecover: error.recoverable,
        recoveryAction: error.retryable ? "retry" : "contact_support",
        recoveryMessage: error.retryable ? messages.tryAgain : messages.contactSupport,
      };
  }
}

/**
 * Generate fallback configuration when validation fails
 */
function generateFallbackConfiguration(
  customizations: Customization[],
  customizationOptions: CustomizationOption[],
  _selectedSize: string | null,
  errors: EnhancedValidationError[]
): Customization[] | undefined {
  const fallbackCustomizations = [...customizations];
  let hasChanges = false;

  // Apply fallback strategies based on errors
  errors.forEach((error) => {
    if (error.fallbackAction && error.context?.fallbackValue !== undefined) {
      switch (error.fallbackAction) {
        case "select_default_size": {
          // Add default size if missing
          const sizeOption = customizationOptions.find((opt) => opt.type === "size");
          if (sizeOption?.choices && sizeOption.choices.length > 0) {
            const existingSizeIndex = fallbackCustomizations.findIndex(
              (c) => c.optionId === sizeOption.id
            );
            const defaultSize = sizeOption.choices[0]?.id;

            if (defaultSize) {
              if (existingSizeIndex >= 0 && fallbackCustomizations[existingSizeIndex]) {
                fallbackCustomizations[existingSizeIndex].choiceIds = [defaultSize];
              } else {
                fallbackCustomizations.push({
                  optionId: sizeOption.id,
                  choiceIds: [defaultSize],
                });
              }
              hasChanges = true;
            }
          }
          break;
        }

        case "remove_ribbon": {
          // Remove all ribbon-related customizations
          const ribbonIndices = fallbackCustomizations
            .map((c, index) => ({ customization: c, index }))
            .filter(({ customization }) => customization.optionId.includes("ribbon"))
            .map(({ index }) => index)
            .sort((a, b) => b - a); // Sort in reverse order for safe removal

          ribbonIndices.forEach((index) => {
            fallbackCustomizations.splice(index, 1);
            hasChanges = true;
          });
          break;
        }

        case "use_predefined_text": {
          // Replace custom text with first predefined option
          const textOption = customizationOptions.find((opt) => opt.type === "ribbon_text");
          if (textOption?.choices) {
            const predefinedChoice = textOption.choices.find((c) => c.id !== "text_custom");
            if (predefinedChoice) {
              const textIndex = fallbackCustomizations.findIndex(
                (c) => c.optionId === textOption.id
              );
              if (textIndex >= 0 && fallbackCustomizations[textIndex]) {
                fallbackCustomizations[textIndex].choiceIds = [predefinedChoice.id];
                fallbackCustomizations[textIndex].customValue = undefined;
                hasChanges = true;
              }
            }
          }
          break;
        }
      }
    }
  });

  return hasChanges ? fallbackCustomizations : undefined;
}

// Helper function to get localized validation message
export function getValidationMessage(
  key: keyof typeof WREATH_VALIDATION_MESSAGES.cs,
  locale: string = "cs",
  params?: Record<string, string | number>
): string {
  const messages =
    WREATH_VALIDATION_MESSAGES[locale as keyof typeof WREATH_VALIDATION_MESSAGES] ||
    WREATH_VALIDATION_MESSAGES.cs;
  let message: string = messages[key] || key;

  if (params) {
    Object.entries(params).forEach(([param, value]) => {
      message = message.replace(`{${param}}`, String(value));
    });
  }

  return message;
}
