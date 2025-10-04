/**
 * Tests for step-specific checkout validation
 * These tests verify that each step only validates its own fields
 */

import { describe, expect, it } from "vitest";
import type { CheckoutFormData } from "@/types/order";
import {
  formatStepValidationErrors,
  hasStepValidationErrors,
  STEP_FIELDS,
  stepValidationSchema,
  validateCustomerStep,
  validateDeliveryStep,
  validatePaymentStep,
  validateReviewStep,
} from "../checkout-steps";

describe("STEP_FIELDS constant", () => {
  it("should define fields for each step", () => {
    expect(STEP_FIELDS.customer).toContain("email");
    expect(STEP_FIELDS.customer).toContain("firstName");
    expect(STEP_FIELDS.customer).toContain("lastName");
    expect(STEP_FIELDS.customer).toContain("phone");

    expect(STEP_FIELDS.delivery).toContain("address");
    expect(STEP_FIELDS.delivery).toContain("urgency");

    expect(STEP_FIELDS.payment).toContain("paymentMethod");

    expect(STEP_FIELDS.review).toEqual([]);
  });
});

describe("validateCustomerStep", () => {
  it("should validate only customer fields", () => {
    const data: CheckoutFormData = {
      customerInfo: {
        email: "invalid-email",
        firstName: "",
        lastName: "Doe",
        phone: "123",
      },
      deliveryInfo: {
        // These should NOT be validated in customer step
        address: undefined as any,
        urgency: undefined as any,
      },
      agreeToTerms: false,
      subscribeNewsletter: false,
    };

    const errors = validateCustomerStep(data);

    // Should have customer errors
    expect(errors.customerInfo).toBeDefined();
    expect(errors.customerInfo?.email).toBeDefined();
    expect(errors.customerInfo?.firstName).toBeDefined();
    expect(errors.customerInfo?.phone).toBeDefined();

    // Should NOT have delivery errors
    expect(errors.deliveryInfo).toBeUndefined();
    expect(errors.general).toBeUndefined();
  });

  it("should pass with valid customer data", () => {
    const data: CheckoutFormData = {
      customerInfo: {
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
        phone: "+420123456789",
      },
      deliveryInfo: {},
      agreeToTerms: false,
      subscribeNewsletter: false,
    };

    const errors = validateCustomerStep(data);
    expect(errors.customerInfo).toBeUndefined();
  });
});

describe("validateDeliveryStep", () => {
  it("should validate only delivery fields", () => {
    const data: CheckoutFormData = {
      customerInfo: {
        // These should NOT be validated in delivery step
        email: "",
        firstName: "",
      },
      deliveryInfo: {
        address: undefined as any,
        urgency: undefined as any,
      },
      agreeToTerms: false,
      subscribeNewsletter: false,
    };

    const errors = validateDeliveryStep(data);

    // Should have delivery errors
    expect(errors.deliveryInfo).toBeDefined();
    expect(errors.deliveryInfo?.address).toBeDefined();
    expect(errors.deliveryInfo?.urgency).toBeDefined();

    // Should NOT have customer errors
    expect(errors.customerInfo).toBeUndefined();
  });

  it("should pass with valid delivery data", () => {
    const data: CheckoutFormData = {
      customerInfo: {},
      deliveryInfo: {
        address: {
          street: "123 Main St",
          city: "Prague",
          postalCode: "12345",
          country: "Czech Republic",
        },
        urgency: "standard",
      },
      agreeToTerms: false,
      subscribeNewsletter: false,
    };

    const errors = validateDeliveryStep(data);
    expect(errors.deliveryInfo).toBeUndefined();
  });
});

describe("validatePaymentStep", () => {
  it("should validate only payment method", () => {
    const data: CheckoutFormData = {
      customerInfo: {
        // These should NOT be validated in payment step
        email: "",
      },
      deliveryInfo: {
        // These should NOT be validated in payment step
        address: undefined as any,
      },
      agreeToTerms: false,
      subscribeNewsletter: false,
    };

    const errors = validatePaymentStep(data);

    // Should have payment error
    expect(errors.general).toBeDefined();
    expect(errors.general?.[0]).toContain("platby");

    // Should NOT have customer or delivery errors
    expect(errors.customerInfo).toBeUndefined();
    expect(errors.deliveryInfo).toBeUndefined();
  });

  it("should pass with valid payment method", () => {
    const data: CheckoutFormData = {
      customerInfo: {},
      deliveryInfo: {},
      paymentMethod: "stripe",
      agreeToTerms: false,
      subscribeNewsletter: false,
    };

    const errors = validatePaymentStep(data);
    expect(errors.general).toBeUndefined();
  });
});

describe("validateReviewStep", () => {
  it("should validate all fields from all steps", () => {
    const data: CheckoutFormData = {
      customerInfo: {
        email: "invalid",
        firstName: "",
      },
      deliveryInfo: {
        address: undefined as any,
      },
      agreeToTerms: false,
      subscribeNewsletter: false,
    };

    const errors = validateReviewStep(data);

    // Should have errors from all steps
    expect(errors.customerInfo).toBeDefined();
    expect(errors.deliveryInfo).toBeDefined();
    expect(errors.general).toBeDefined();
  });

  it("should pass with all valid data", () => {
    const data: CheckoutFormData = {
      customerInfo: {
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
        phone: "+420123456789",
      },
      deliveryInfo: {
        address: {
          street: "123 Main St",
          city: "Prague",
          postalCode: "12345",
          country: "Czech Republic",
        },
        urgency: "standard",
      },
      paymentMethod: "stripe",
      agreeToTerms: true,
      subscribeNewsletter: false,
    };

    const errors = validateReviewStep(data);
    expect(errors.customerInfo).toBeUndefined();
    expect(errors.deliveryInfo).toBeUndefined();
    expect(errors.general).toBeUndefined();
  });
});

describe("stepValidationSchema", () => {
  it("should provide validation functions for all steps", () => {
    expect(stepValidationSchema.customer).toBe(validateCustomerStep);
    expect(stepValidationSchema.delivery).toBe(validateDeliveryStep);
    expect(stepValidationSchema.payment).toBe(validatePaymentStep);
    expect(stepValidationSchema.review).toBe(validateReviewStep);
  });
});

describe("hasStepValidationErrors", () => {
  it("should return true when errors exist", () => {
    const errors = {
      customerInfo: { email: "Invalid email" },
    };
    expect(hasStepValidationErrors(errors)).toBe(true);
  });

  it("should return false when no errors exist", () => {
    const errors = {};
    expect(hasStepValidationErrors(errors)).toBe(false);
  });
});

describe("formatStepValidationErrors", () => {
  it("should format all error messages", () => {
    const errors = {
      customerInfo: { email: "Invalid email", firstName: "Required" },
      deliveryInfo: { address: "Required" },
      general: ["Terms required"],
    };

    const messages = formatStepValidationErrors(errors);
    expect(messages).toHaveLength(4);
    expect(messages).toContain("Invalid email");
    expect(messages).toContain("Required");
    expect(messages).toContain("Terms required");
  });
});
