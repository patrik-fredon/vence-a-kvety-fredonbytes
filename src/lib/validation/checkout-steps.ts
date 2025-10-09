/**
 * Step-specific validation schemas for checkout form
 * Implements progressive validation that only validates fields in the current step
 */

import type {
  CheckoutFormData,
  CheckoutValidationErrors,
  CustomerInfo,
  DeliveryInfo,
} from "@/types/order";

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Phone validation regex (Czech format)
const PHONE_REGEX = /^(\+420)?[0-9]{9}$/;

// Postal code validation regex (Czech format)
const POSTAL_CODE_REGEX = /^[0-9]{3}\s?[0-9]{2}$/;

/**
 * Define which fields belong to each checkout step
 * This ensures we only validate fields visible in the current step
 */
export const STEP_FIELDS = {
  customer: ["email", "firstName", "lastName", "phone", "company", "note"] as const,
  delivery: [
    "address",
    "preferredDate",
    "preferredTimeSlot",
    "specialInstructions",
    "recipientName",
    "recipientPhone",
  ] as const,
  payment: ["paymentMethod"] as const,
  review: [] as const, // Review step validates all previous steps
} as const;

/**
 * Type definition for step validation functions
 */
export type StepValidationSchema = {
  customer: (data: CheckoutFormData) => CheckoutValidationErrors;
  delivery: (data: CheckoutFormData) => CheckoutValidationErrors;
  payment: (data: CheckoutFormData) => CheckoutValidationErrors;
  review: (data: CheckoutFormData) => CheckoutValidationErrors;
};

/**
 * Validate customer information step (Step 1)
 * Only validates fields visible in the customer info step
 */
export function validateCustomerStep(data: CheckoutFormData): CheckoutValidationErrors {
  const errors: CheckoutValidationErrors = {};
  const customerErrors: Partial<Record<keyof CustomerInfo, string>> = {};
  const { customerInfo } = data;

  // Required: First Name
  if (!customerInfo.firstName?.trim()) {
    customerErrors.firstName = "Jméno je povinné";
  }

  // Required: Last Name
  if (!customerInfo.lastName?.trim()) {
    customerErrors.lastName = "Příjmení je povinné";
  }

  // Required: Email
  if (!customerInfo.email?.trim()) {
    customerErrors.email = "E-mail je povinný";
  } else if (!EMAIL_REGEX.test(customerInfo.email)) {
    customerErrors.email = "Neplatný formát e-mailu";
  }

  // Required: Phone
  if (!customerInfo.phone?.trim()) {
    customerErrors.phone = "Telefon je povinný";
  } else if (!PHONE_REGEX.test(customerInfo.phone.replace(/\s/g, ""))) {
    customerErrors.phone = "Neplatný formát telefonu (použijte formát +420123456789)";
  }

  // Optional: Company (validate only if provided)
  if (customerInfo.company && customerInfo.company.length > 100) {
    customerErrors.company = "Název společnosti je příliš dlouhý (max. 100 znaků)";
  }

  // Optional: Note (validate only if provided)
  if (customerInfo.note && customerInfo.note.length > 500) {
    customerErrors.note = "Poznámka je příliš dlouhá (max. 500 znaků)";
  }

  if (Object.keys(customerErrors).length > 0) {
    errors.customerInfo = customerErrors;
  }

  return errors;
}

/**
 * Validate delivery information step (Step 2)
 * Only validates fields visible in the delivery info step
 */
export function validateDeliveryStep(data: CheckoutFormData): CheckoutValidationErrors {
  const errors: CheckoutValidationErrors = {};
  const deliveryErrors: Partial<Record<keyof DeliveryInfo, string>> = {};
  const { deliveryInfo } = data;

  // Required: Address
  if (!deliveryInfo.address) {
    deliveryErrors.address = "Adresa je povinná";
  } else {
    const address = deliveryInfo.address;

    if (!address.street?.trim()) {
      deliveryErrors.address = "Ulice je povinná";
    } else if (!address.city?.trim()) {
      deliveryErrors.address = "Město je povinné";
    } else if (!address.postalCode?.trim()) {
      deliveryErrors.address = "PSČ je povinné";
    } else if (!POSTAL_CODE_REGEX.test(address.postalCode)) {
      deliveryErrors.address = "Neplatný formát PSČ (použijte formát 12345 nebo 123 45)";
    } else if (!address.country?.trim()) {
      deliveryErrors.address = "Země je povinná";
    }
  }

  // Note: Delivery method (urgency) is validated at cart level, not here
  // The delivery method is selected during product configuration in the cart

  // Optional: Preferred Date (validate only if provided)
  if (deliveryInfo.preferredDate) {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    if (deliveryInfo.preferredDate < tomorrow) {
      deliveryErrors.preferredDate = "Datum doručení musí být nejdříve zítra";
    }

    // Check if it's not too far in the future (max 30 days)
    const maxDate = new Date(now);
    maxDate.setDate(now.getDate() + 30);
    if (deliveryInfo.preferredDate > maxDate) {
      deliveryErrors.preferredDate = "Datum doručení může být maximálně 30 dní dopředu";
    }
  }

  // Optional: Special Instructions (validate only if provided)
  if (deliveryInfo.specialInstructions && deliveryInfo.specialInstructions.length > 500) {
    deliveryErrors.specialInstructions = "Speciální pokyny jsou příliš dlouhé (max. 500 znaků)";
  }

  // Optional: Recipient Name (validate only if provided)
  if (deliveryInfo.recipientName && deliveryInfo.recipientName.length > 100) {
    deliveryErrors.recipientName = "Jméno příjemce je příliš dlouhé (max. 100 znaků)";
  }

  // Optional: Recipient Phone (validate only if provided)
  if (
    deliveryInfo.recipientPhone &&
    !PHONE_REGEX.test(deliveryInfo.recipientPhone.replace(/\s/g, ""))
  ) {
    deliveryErrors.recipientPhone = "Neplatný formát telefonu příjemce";
  }

  if (Object.keys(deliveryErrors).length > 0) {
    errors.deliveryInfo = deliveryErrors;
  }

  return errors;
}

/**
 * Validate payment method step (Step 3)
 * Only validates payment method selection
 */
export function validatePaymentStep(data: CheckoutFormData): CheckoutValidationErrors {
  const errors: CheckoutValidationErrors = {};

  if (!data.paymentMethod) {
    errors.general = ["Vyberte způsob platby"];
  }

  return errors;
}

/**
 * Validate review step (Step 4)
 * Validates all fields from all previous steps plus terms agreement
 */
export function validateReviewStep(data: CheckoutFormData): CheckoutValidationErrors {
  const errors: CheckoutValidationErrors = {};

  // Validate all customer fields
  const customerErrors = validateCustomerStep(data);
  if (customerErrors.customerInfo) {
    errors.customerInfo = customerErrors.customerInfo;
  }

  // Validate all delivery fields
  const deliveryErrors = validateDeliveryStep(data);
  if (deliveryErrors.deliveryInfo) {
    errors.deliveryInfo = deliveryErrors.deliveryInfo;
  }

  // Validate payment method
  const paymentErrors = validatePaymentStep(data);
  if (paymentErrors.general) {
    errors.general = [...(errors.general || []), ...paymentErrors.general];
  }

  // Validate terms agreement
  if (!data.agreeToTerms) {
    errors.general = [...(errors.general || []), "Musíte souhlasit s obchodními podmínkami"];
  }

  return errors;
}

/**
 * Step validation schema object
 * Maps each step to its validation function
 */
export const stepValidationSchema: StepValidationSchema = {
  customer: validateCustomerStep,
  delivery: validateDeliveryStep,
  payment: validatePaymentStep,
  review: validateReviewStep,
};

/**
 * Helper function to check if validation errors exist
 */
export function hasStepValidationErrors(errors: CheckoutValidationErrors): boolean {
  return !!(
    (errors.customerInfo && Object.keys(errors.customerInfo).length > 0) ||
    (errors.deliveryInfo && Object.keys(errors.deliveryInfo).length > 0) ||
    (errors.general && errors.general.length > 0)
  );
}

/**
 * Helper function to format validation errors for display
 */
export function formatStepValidationErrors(errors: CheckoutValidationErrors): string[] {
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
