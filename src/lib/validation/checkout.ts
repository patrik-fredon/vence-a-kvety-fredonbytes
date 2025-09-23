/**
 * Checkout form validation utilities
 */

import type { CheckoutValidationErrors, CustomerInfo, DeliveryInfo } from "@/types/order";

// Email validation regex
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
