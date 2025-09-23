import { useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  validateWreathConfiguration,
  validateCustomRibbonText,
  validateWreathSizeSelection,
  validateRibbonDependencies,
  type WreathValidationResult,
  type WreathValidationOptions
} from './wreath';
import type { Customization, CustomizationOption } from '@/types/product';

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
  validateCustomText: (text: string) => { errors: string[]; warnings: string[] };
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
  locale = 'cs',
  options = {}
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
      ribbonTextOption
    };
  }, [customizationOptions]);

  // Check if ribbon is selected
  const hasRibbonSelected = useMemo(() => {
    const ribbonCustomization = customizations.find(
      (c) => c.optionId === wreathOptions.ribbonOption?.id
    );
    return ribbonCustomization && ribbonCustomization.choiceIds.length > 0;
  }, [customizations, wreathOptions.ribbonOption]);

  // Validate all wreath customizations
  const validateAll = useCallback((): WreathValidationResult => {
    return validateWreathConfiguration(
      customizations,
      customizationOptions,
      selectedSize,
      { locale, ...options }
    );
  }, [customizations, customizationOptions, selectedSize, locale, options]);

  // Validate size selection only
  const validateSize = useCallback(() => {
    return validateWreathSizeSelection(
      selectedSize,
      wreathOptions.sizeOption,
      locale
    );
  }, [selectedSize, wreathOptions.sizeOption, locale]);

  // Validate ribbon dependencies only
  const validateRibbonDependenciesCallback = useCallback(() => {
    return validateRibbonDependencies(
      customizations,
      wreathOptions.ribbonOption,
      wreathOptions.ribbonColorOption,
      wreathOptions.ribbonTextOption,
      locale
    );
  }, [customizations, wreathOptions, locale]);

  // Validate custom text only
  const validateCustomText = useCallback((text: string) => {
    return validateCustomRibbonText(text, locale);
  }, [locale]);

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
    hasRibbonSelected: hasRibbonSelected || false
  };
}

/**
 * Hook for real-time validation feedback during user input
 */
export function useRealtimeWreathValidation({
  customizations,
  customizationOptions,
  selectedSize,
  locale = 'cs'
}: Omit<UseWreathValidationProps, 'options'>) {
  const validation = useWreathValidation({
    customizations,
    customizationOptions,
    selectedSize,
    locale,
    options: { strictMode: false } // Less strict for real-time feedback
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
      }
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
  locale = 'cs'
}: Omit<UseWreathValidationProps, 'options'>) {
  return useWreathValidation({
    customizations,
    customizationOptions,
    selectedSize,
    locale,
    options: { strictMode: true } // Strict mode for submissions
  });
}

/**
 * Utility hook for validation error formatting
 */
export function useValidationErrorFormatter(_locale = 'cs') {
  const t = useTranslations('product.validation');

  const formatError = useCallback((error: string, params?: Record<string, any>) => {
    // If error is already localized, return as-is
    if (error.includes(' ')) {
      return error;
    }

    // Try to get localized version
    try {
      return t(error as any, params);
    } catch {
      return error;
    }
  }, [t]);

  const formatErrors = useCallback((errors: string[]) => {
    return errors.map(error => formatError(error));
  }, [formatError]);

  return {
    formatError,
    formatErrors
  };
}
