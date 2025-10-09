import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";
import type { Customization, CustomizationOption } from "@/types/product";
import {
  type EnhancedValidationError,
  type EnhancedWreathValidationResult,
  ValidationErrorSeverity,
  validateCustomRibbonText,
  validateRibbonDependencies as validateRibbonDependenciesCore,
  validateWreathConfiguration,
  validateWreathConfigurationEnhanced,
  validateWreathSizeSelection,
  WREATH_VALIDATION_MESSAGES,
  type WreathValidationOptions,
  type WreathValidationResult,
} from "./wreath";

export interface UseWreathValidationProps {
  customizations: Customization[];
  customizationOptions: CustomizationOption[];
  selectedSize: string | null;
  locale?: string;
  options?: WreathValidationOptions;
}

export interface UseWreathValidationReturn {
  validateAll: () => WreathValidationResult;
  validateSize: () => { isValid: boolean; error?: string };
  validateRibbonDependencies: () => { isValid: boolean; errors: string[] };
  validateCustomText: (text: string) => {
    errors: string[];
    warnings: string[];
  };
  isValid: boolean;
  errors: string[];
  warnings: string[];
  hasRibbonSelected: boolean;
}

/**
 * Custom hook for wreath-specific validation with localized error messages
 */
export function useWreathValidation({
  customizations,
  customizationOptions,
  selectedSize,
  locale = "cs",
  options = {},
}: UseWreathValidationProps): UseWreathValidationReturn {
  // Find wreath-specific options
  const wreathOptions = useMemo(() => {
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

    return {
      sizeOption,
      ribbonOption,
      ribbonColorOption,
      ribbonTextOption,
    };
  }, [customizationOptions]);

  // Check if ribbon is selected
  const hasRibbonSelected = useMemo(() => {
    const ribbonCustomization = customizations.find(
      (c) => c.optionId === wreathOptions.ribbonOption?.id
    );
    return ribbonCustomization?.choiceIds.includes("ribbon_yes");
  }, [customizations, wreathOptions.ribbonOption]);

  // Validate all wreath customizations
  const validateAll = useCallback((): WreathValidationResult => {
    return validateWreathConfiguration(customizations, customizationOptions, selectedSize, {
      locale,
      ...options,
    });
  }, [customizations, customizationOptions, selectedSize, locale, options]);

  // Validate size selection only
  const validateSize = useCallback(() => {
    return validateWreathSizeSelection(selectedSize, wreathOptions.sizeOption, locale);
  }, [selectedSize, wreathOptions.sizeOption, locale]);

  // Validate ribbon dependencies only
  const validateRibbonDependenciesCallback = useCallback(() => {
    return validateRibbonDependenciesCore(
      customizations,
      wreathOptions.ribbonOption,
      wreathOptions.ribbonColorOption,
      wreathOptions.ribbonTextOption,
      locale
    );
  }, [customizations, wreathOptions, locale]);

  // Validate custom text only
  const validateCustomText = useCallback(
    (text: string) => {
      return validateCustomRibbonText(text, locale);
    },
    [locale]
  );

  // Get current validation state
  const validationResult = useMemo(() => {
    return validateAll();
  }, [validateAll]);

  return {
    validateAll,
    validateSize,
    validateRibbonDependencies: validateRibbonDependenciesCallback,
    validateCustomText,
    isValid: validationResult.isValid,
    errors: validationResult.errors,
    warnings: validationResult.warnings,
    hasRibbonSelected: hasRibbonSelected ?? false,
  };
}

/**
 * Hook for real-time validation feedback during user input
 */
export function useRealtimeWreathValidation({
  customizations,
  customizationOptions,
  selectedSize,
  locale = "cs",
}: Omit<UseWreathValidationProps, "options">) {
  const validation = useWreathValidation({
    customizations,
    customizationOptions,
    selectedSize,
    locale,
    options: { strictMode: false }, // Less strict for real-time feedback
  });

  // Debounced validation for performance
  const debouncedValidation = useMemo(() => {
    let timeoutId: NodeJS.Timeout;

    return {
      ...validation,
      validateWithDelay: (callback: (result: WreathValidationResult) => void, delay = 300) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          callback(validation.validateAll());
        }, delay);
      },
    };
  }, [validation]);

  return debouncedValidation;
}

/**
 * Hook for form submission validation (strict mode)
 */
export function useWreathSubmissionValidation({
  customizations,
  customizationOptions,
  selectedSize,
  locale = "cs",
}: Omit<UseWreathValidationProps, "options">) {
  return useWreathValidation({
    customizations,
    customizationOptions,
    selectedSize,
    locale,
    options: { strictMode: true }, // Strict mode for submissions
  });
}

/**
 * Utility hook for validation error formatting
 */
export function useValidationErrorFormatter(_locale = "cs") {
  const t = useTranslations("product.validation");

  const formatError = useCallback(
    (error: string, params?: Record<string, any>) => {
      // If error is already localized, return as-is
      if (error.includes(" ")) {
        return error;
      }

      // Try to get localized version
      try {
        return t(error as any, params);
      } catch {
        return error;
      }
    },
    [t]
  );

  const formatErrors = useCallback(
    (errors: string[]) => {
      return errors.map((error) => formatError(error));
    },
    [formatError]
  );

  return {
    formatError,
    formatErrors,
  };
}

/**
 * Enhanced validation hook with immediate feedback and error recovery
 */
export function useEnhancedWreathValidation({
  customizations,
  customizationOptions,
  selectedSize,
  locale = "cs",
  options = {},
}: UseWreathValidationProps & {
  options?: {
    enableRecovery?: boolean;
    enableFallback?: boolean;
    enableImmediateFeedback?: boolean;
  };
}): UseWreathValidationReturn & {
  enhancedResult: EnhancedWreathValidationResult;
  recoverFromError: (errorIndex: number) => void;
  applyFallback: () => void;
  clearErrors: () => void;
  retryValidation: () => void;
} {
  const [, setLastValidationTime] = useState<number>(0);
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryAttempts, setRecoveryAttempts] = useState(0);
  const maxRecoveryAttempts = 3;

  const {
    enableRecovery = true,
    enableFallback = true,
    enableImmediateFeedback = true,
  } = options || {};

  // Enhanced validation with recovery capabilities
  const enhancedResult = useMemo((): EnhancedWreathValidationResult => {
    const result = validateWreathConfigurationEnhanced(
      customizations,
      customizationOptions,
      selectedSize,
      {
        locale,
        enableRecovery,
        enableFallback,
        ...options,
      }
    );

    // Update validation timestamp for immediate feedback
    if (enableImmediateFeedback) {
      setLastValidationTime(Date.now());
    }

    return result;
  }, [
    customizations,
    customizationOptions,
    selectedSize,
    locale,
    enableRecovery,
    enableFallback,
    options,
    enableImmediateFeedback,
  ]);

  // Recovery function for specific errors
  const recoverFromError = useCallback(
    (errorIndex: number) => {
      if (isRecovering || recoveryAttempts >= maxRecoveryAttempts) {
        return;
      }

      const error = enhancedResult.enhancedErrors[errorIndex];
      const strategy = enhancedResult.recoveryStrategies[errorIndex];

      if (!(error && strategy && strategy.canRecover)) {
        return;
      }

      setIsRecovering(true);
      setRecoveryAttempts((prev) => prev + 1);

      // Simulate recovery action
      setTimeout(() => {
        switch (strategy.recoveryAction) {
          case "retry":
            // Trigger re-validation
            setLastValidationTime(Date.now());
            break;
          case "fallback":
            // Apply fallback value if available
            if (strategy.fallbackValue !== undefined) {
              // This would typically trigger a callback to update the parent component
              console.log("Applying fallback value:", strategy.fallbackValue);
            }
            break;
          case "refresh":
            // Trigger page refresh or component reset
            window.location.reload();
            break;
          case "contact_support":
            // Show support contact information
            console.log("Contact support for error:", error.code);
            break;
        }
        setIsRecovering(false);
      }, 1000);
    },
    [enhancedResult, isRecovering, recoveryAttempts]
  );

  // Apply fallback configuration
  const applyFallback = useCallback(() => {
    if (enhancedResult.fallbackConfiguration) {
      // This would typically trigger a callback to update customizations
      console.log("Applying fallback configuration:", enhancedResult.fallbackConfiguration);
      setRecoveryAttempts(0);
    }
  }, [enhancedResult.fallbackConfiguration]);

  // Clear all errors and reset recovery state
  const clearErrors = useCallback(() => {
    setRecoveryAttempts(0);
    setIsRecovering(false);
    setLastValidationTime(Date.now());
  }, []);

  // Retry validation
  const retryValidation = useCallback(() => {
    if (recoveryAttempts < maxRecoveryAttempts) {
      setLastValidationTime(Date.now());
      setRecoveryAttempts((prev) => prev + 1);
    }
  }, [recoveryAttempts]);

  // Basic validation functions from original hook
  const validateAll = useCallback((): WreathValidationResult => {
    return validateWreathConfiguration(customizations, customizationOptions, selectedSize, {
      locale,
      ...options,
    });
  }, [customizations, customizationOptions, selectedSize, locale, options]);

  const validateSize = useCallback(() => {
    const sizeOption = customizationOptions.find(
      (option) => option.type === "size" || option.id === "size"
    );
    return validateWreathSizeSelection(selectedSize, sizeOption, locale);
  }, [selectedSize, customizationOptions, locale]);

  const validateRibbonDependencies = useCallback(() => {
    const ribbonOption = customizationOptions.find(
      (option) => option.type === "ribbon" || option.id === "ribbon"
    );
    const ribbonColorOption = customizationOptions.find(
      (option) => option.type === "ribbon_color" || option.id === "ribbon_color"
    );
    const ribbonTextOption = customizationOptions.find(
      (option) => option.type === "ribbon_text" || option.id === "ribbon_text"
    );

    return validateRibbonDependenciesCore(
      customizations,
      ribbonOption,
      ribbonColorOption,
      ribbonTextOption,
      locale
    );
  }, [customizations, customizationOptions, locale]);

  const validateCustomText = useCallback(
    (text: string) => {
      return validateCustomRibbonText(text, locale);
    },
    [locale]
  );

  const hasRibbonSelected = useMemo(() => {
    const ribbonOption = customizationOptions.find(
      (option) => option.type === "ribbon" || option.id === "ribbon"
    );
    const ribbonCustomization = customizations.find((c) => c.optionId === ribbonOption?.id);
    return ribbonCustomization?.choiceIds.includes("ribbon_yes");
  }, [customizations, customizationOptions]);

  return {
    validateAll,
    validateSize,
    validateRibbonDependencies,
    validateCustomText,
    isValid: enhancedResult.canProceed,
    errors: enhancedResult.errors,
    warnings: enhancedResult.warnings,
    hasRibbonSelected: hasRibbonSelected ?? false,
    enhancedResult,
    recoverFromError,
    applyFallback,
    clearErrors,
    retryValidation,
  };
}

/**
 * Hook for handling validation errors with user-friendly messages and recovery options
 */
export function useValidationErrorHandler(locale: string = "cs") {
  const t = useTranslations("product.validation");
  const [errorHistory, setErrorHistory] = useState<EnhancedValidationError[]>([]);
  const [recoveryInProgress, setRecoveryInProgress] = useState<string | null>(null);

  // Format enhanced validation error with recovery options
  const formatEnhancedError = useCallback(
    (error: EnhancedValidationError) => {
      const messages =
        WREATH_VALIDATION_MESSAGES[locale as keyof typeof WREATH_VALIDATION_MESSAGES];

      return {
        ...error,
        displayMessage: error.message,
        severityLabel:
          error.severity === ValidationErrorSeverity.ERROR
            ? messages.validationFailed
            : error.severity === ValidationErrorSeverity.WARNING
              ? messages.customTextWarning
              : messages.fallbackMessage,
        canRetry: error.retryable && error.recoverable,
        recoveryLabel: error.retryable ? messages.tryAgain : messages.contactSupport,
      };
    },
    [locale]
  );

  // Handle error recovery with progress tracking
  const handleErrorRecovery = useCallback(
    async (error: EnhancedValidationError, recoveryAction: () => Promise<void> | void) => {
      setRecoveryInProgress(error.code);
      setErrorHistory((prev) => [...prev, error]);

      try {
        await recoveryAction();
        // Remove error from history on successful recovery
        setErrorHistory((prev) => prev.filter((e) => e.code !== error.code));
      } catch (recoveryError) {
        console.error("Error recovery failed:", recoveryError);
        // Keep error in history but mark as failed recovery
        setErrorHistory((prev) =>
          prev.map((e) =>
            e.code === error.code ? { ...e, context: { ...e.context, recoveryFailed: true } } : e
          )
        );
      } finally {
        setRecoveryInProgress(null);
      }
    },
    []
  );

  // Get user-friendly error message with fallback
  const getErrorMessage = useCallback(
    (error: string | EnhancedValidationError) => {
      const messages =
        WREATH_VALIDATION_MESSAGES[locale as keyof typeof WREATH_VALIDATION_MESSAGES];

      if (typeof error === "string") {
        return error;
      }

      // Try to get localized message, fallback to original message
      try {
        return t(error.code as any) || error.message || messages.systemError;
      } catch {
        return error.message || messages.systemError;
      }
    },
    [locale, t]
  );

  // Check if error is recoverable
  const isErrorRecoverable = useCallback(
    (error: EnhancedValidationError) => {
      return (
        error.recoverable && !error.context?.['recoveryFailed'] && recoveryInProgress !== error.code
      );
    },
    [recoveryInProgress]
  );

  return {
    formatEnhancedError,
    handleErrorRecovery,
    getErrorMessage,
    isErrorRecoverable,
    errorHistory,
    recoveryInProgress: recoveryInProgress !== null,
  };
}
