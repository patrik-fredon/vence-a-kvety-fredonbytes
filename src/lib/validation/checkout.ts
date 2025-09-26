/**
 * Checkout form validation utilities
 */

import type { CheckoutValidationErrors, CustomerInfo, DeliveryInfo } from "@/types/order";

// Email validation regex
import type { Customization, CustomizationOption } from '@/types/product';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Phone validation regex (Czech format)
const PHONE_REGEX = /^(\+420)?[0-9]{9}$/;

// Postal code validation regex (Czech format)
const POSTAL_CODE_REGEX = /^[0-9]{3}\s?[0-9]{2}$/;

/**
 * Validate customer information
 */
export function validateCustomerInfo(
  customerInfo: Partial<CustomerInfo>
): Partial<Record<keyof CustomerInfo, string>> {
  const errors: Partial<Record<keyof CustomerInfo, string>> = {};

  // Required fields
  if (!customerInfo.firstName?.trim()) {
    errors.firstName = "Jméno je povinné";
  }

  if (!customerInfo.lastName?.trim()) {
    errors.lastName = "Příjmení je povinné";
  }

  if (!customerInfo.email?.trim()) {
    errors.email = "E-mail je povinný";
  } else if (!EMAIL_REGEX.test(customerInfo.email)) {
    errors.email = "Neplatný formát e-mailu";
  }

  if (!customerInfo.phone?.trim()) {
    errors.phone = "Telefon je povinný";
  } else if (!PHONE_REGEX.test(customerInfo.phone.replace(/\s/g, ""))) {
    errors.phone = "Neplatný formát telefonu (použijte formát +420123456789)";
  }

  // Optional validation for company
  if (customerInfo.company && customerInfo.company.length > 100) {
    errors.company = "Název společnosti je příliš dlouhý (max. 100 znaků)";
  }

  // Optional validation for note
  if (customerInfo.note && customerInfo.note.length > 500) {
    errors.note = "Poznámka je příliš dlouhá (max. 500 znaků)";
  }

  return errors;
}

/**
 * Validate delivery information
 */
export function validateDeliveryInfo(
  deliveryInfo: Partial<DeliveryInfo>
): Partial<Record<keyof DeliveryInfo, string>> {
  const errors: Partial<Record<keyof DeliveryInfo, string>> = {};

  // Validate address
  if (!deliveryInfo.address) {
    errors.address = "Adresa je povinná";
  } else {
    const address = deliveryInfo.address;

    if (!address.street?.trim()) {
      errors.address = "Ulice je povinná";
    }

    if (!address.city?.trim()) {
      errors.address = "Město je povinné";
    }

    if (!address.postalCode?.trim()) {
      errors.address = "PSČ je povinné";
    } else if (!POSTAL_CODE_REGEX.test(address.postalCode)) {
      errors.address = "Neplatný formát PSČ (použijte formát 12345 nebo 123 45)";
    }

    if (!address.country?.trim()) {
      errors.address = "Země je povinná";
    }
  }

  // Validate urgency
  if (!deliveryInfo.urgency) {
    errors.urgency = "Způsob doručení je povinný";
  }

  // Validate preferred date (if provided)
  if (deliveryInfo.preferredDate) {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    if (deliveryInfo.preferredDate < tomorrow) {
      errors.preferredDate = "Datum doručení musí být nejdříve zítra";
    }

    // Check if it's not too far in the future (max 30 days)
    const maxDate = new Date(now);
    maxDate.setDate(now.getDate() + 30);
    if (deliveryInfo.preferredDate > maxDate) {
      errors.preferredDate = "Datum doručení může být maximálně 30 dní dopředu";
    }
  }

  // Validate special instructions length
  if (deliveryInfo.specialInstructions && deliveryInfo.specialInstructions.length > 500) {
    errors.specialInstructions = "Speciální pokyny jsou příliš dlouhé (max. 500 znaků)";
  }

  // Validate recipient name if provided
  if (deliveryInfo.recipientName && deliveryInfo.recipientName.length > 100) {
    errors.recipientName = "Jméno příjemce je příliš dlouhé (max. 100 znaků)";
  }

  // Validate recipient phone if provided
  if (
    deliveryInfo.recipientPhone &&
    !PHONE_REGEX.test(deliveryInfo.recipientPhone.replace(/\s/g, ""))
  ) {
    errors.recipientPhone = "Neplatný formát telefonu příjemce";
  }

  return errors;
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
  const isRibbonSelected = ribbonCustomization && ribbonCustomization.choiceIds.includes("ribbon_yes");

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
  const isRibbonSelected = ribbonCustomization && ribbonCustomization.choiceIds.includes("ribbon_yes");

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

/**
 * Validate complete checkout form
 */
export function validateCheckoutForm(
  customerInfo: Partial<CustomerInfo>,
  deliveryInfo: Partial<DeliveryInfo>,
  agreeToTerms: boolean
): CheckoutValidationErrors {
  const errors: CheckoutValidationErrors = {};

  // Validate customer info
  const customerErrors = validateCustomerInfo(customerInfo);
  if (Object.keys(customerErrors).length > 0) {
    errors.customerInfo = customerErrors;
  }

  // Validate delivery info
  const deliveryErrors = validateDeliveryInfo(deliveryInfo);
  if (Object.keys(deliveryErrors).length > 0) {
    errors.deliveryInfo = deliveryErrors;
  }

  // Validate terms agreement
  if (!agreeToTerms) {
    errors.general = ["Musíte souhlasit s obchodními podmínkami"];
  }

  return errors;
}

/**
 * Check if validation errors exist
 */
export function hasValidationErrors(errors: CheckoutValidationErrors): boolean {
  return !!(
    (errors.customerInfo && Object.keys(errors.customerInfo).length > 0) ||
    (errors.deliveryInfo && Object.keys(errors.deliveryInfo).length > 0) ||
    (errors.general && errors.general.length > 0)
  );
}

/**
 * Format validation error messages for display
 */
export function formatValidationErrors(errors: CheckoutValidationErrors): string[] {
  const messages: string[] = [];

  if (errors.customerInfo) {
    Object.values(errors.customerInfo).forEach((error) => {
      if (error) messages.push(error);
    });
  }

  if (errors.deliveryInfo) {
    Object.values(errors.deliveryInfo).forEach((error) => {
      if (error) messages.push(error);
    });
  }

  if (errors.general) {
    messages.push(...errors.general);
  }

  return messages;
}

/**
 * Sanitize and normalize form data
 */
export function sanitizeCustomerInfo(customerInfo: Partial<CustomerInfo>): Partial<CustomerInfo> {
  return {
    ...customerInfo,
    firstName: customerInfo.firstName?.trim(),
    lastName: customerInfo.lastName?.trim(),
    email: customerInfo.email?.trim().toLowerCase(),
    phone: customerInfo.phone?.replace(/\s/g, ""),
    company: customerInfo.company?.trim(),
    note: customerInfo.note?.trim(),
  };
}

export function sanitizeDeliveryInfo(deliveryInfo: Partial<DeliveryInfo>): Partial<DeliveryInfo> {
  const sanitized = { ...deliveryInfo };

  if (sanitized.address) {
    sanitized.address = {
      ...sanitized.address,
      street: sanitized.address.street?.trim(),
      city: sanitized.address.city?.trim(),
      postalCode: sanitized.address.postalCode?.replace(/\s/g, ""),
      country: sanitized.address.country?.trim(),
    };
  }

  if (sanitized.specialInstructions) {
    sanitized.specialInstructions = sanitized.specialInstructions.trim();
  }

  if (sanitized.recipientName) {
    sanitized.recipientName = sanitized.recipientName.trim();
  }

  if (sanitized.recipientPhone) {
    sanitized.recipientPhone = sanitized.recipientPhone.replace(/\s/g, "");
  }

  return sanitized;
}
