"use client";

import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon, ExclamationTriangleIcon } from "@/lib/icons";
import { formatValidationErrors } from "@/lib/validation/checkout";
import { hasStepValidationErrors, stepValidationSchema } from "@/lib/validation/checkout-steps";
import type { CartItem } from "@/types/cart";

import type { CheckoutFormData, CheckoutState, CheckoutStep } from "@/types/order";
import { CustomerInfoStep } from "./steps/CustomerInfoStep";
import { DeliveryInfoStep } from "./steps/DeliveryInfoStep";
import { PaymentStep } from "./steps/PaymentStep";
import { ReviewStep } from "./steps/ReviewStep";

interface CheckoutFormProps {
  items: CartItem[];
  locale: string;
  className?: string;
}

const STEPS: CheckoutStep[] = ["customer", "delivery", "review", "payment"];

const STEP_TITLES = {
  customer: "customerInfo",
  delivery: "deliveryInfo",
  review: "orderSummary",
  payment: "paymentInfo",
} as const;

export function CheckoutForm({ items, locale, className = "" }: CheckoutFormProps) {
  const t = useTranslations("checkout");
  const tCommon = useTranslations("common");

  // Initialize checkout state
  const [state, setState] = useState<CheckoutState>({
    currentStep: "customer",
    completedSteps: new Set<CheckoutStep>(),
    formData: {
      customerInfo: {},
      deliveryInfo: {},
      agreeToTerms: false,
      subscribeNewsletter: false,
    },
    isSubmitting: false,
    errors: {},
    deliveryCost: 0,
  });



  // Handle step navigation
  const goToStep = (step: CheckoutStep) => {
    // Clear errors when navigating to preserve validated data
    setState((prev) => ({ ...prev, currentStep: step, errors: {} }));
  };

  const goToNextStep = () => {
    const currentIndex = STEPS.indexOf(state.currentStep);
    if (currentIndex < STEPS.length - 1) {
      const nextStep = STEPS[currentIndex + 1];

      // Validate current step before proceeding
      if (nextStep && validateCurrentStep()) {
        // Mark current step as completed
        setState((prev) => {
          const newCompletedSteps = new Set(prev.completedSteps);
          newCompletedSteps.add(prev.currentStep);
          return {
            ...prev,
            currentStep: nextStep,
            completedSteps: newCompletedSteps,
            errors: {}, // Clear errors when moving to next step
          };
        });
      }
    }
  };

  const goToPreviousStep = () => {
    const currentIndex = STEPS.indexOf(state.currentStep);
    if (currentIndex > 0) {
      const prevStep = STEPS[currentIndex - 1];
      if (prevStep) {
        // Navigate back without re-validation, preserving data
        goToStep(prevStep);
      }
    }
  };

  // Validate current step
  const validateCurrentStep = (): boolean => {
    // Get the appropriate validator for the current step
    const validator = stepValidationSchema[state.currentStep];

    if (!validator) {
      console.error(`No validator found for step: ${state.currentStep}`);
      return false;
    }

    // Validate only the current step using step-specific validator
    const stepErrors = validator(state.formData);

    // Check if there are any validation errors
    if (hasStepValidationErrors(stepErrors)) {
      setState((prev) => ({ ...prev, errors: stepErrors }));
      return false;
    }

    // Clear errors if validation passes
    setState((prev) => ({ ...prev, errors: {} }));
    return true;
  };

  // Update form data
  const updateFormData = (updates: Partial<CheckoutFormData>) => {
    setState((prev) => ({
      ...prev,
      formData: { ...prev.formData, ...updates },
      // Don't clear errors on data update to preserve validation state
    }));
  };

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  const totalAmount = subtotal + state.deliveryCost;

  return (
    <div className={`checkout-form ${className}`}>
      {/* Progress Steps */}
      <Card className="mb-8" variant="default">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const isActive = step === state.currentStep;
              // Use completedSteps Set to determine if step is completed
              const isCompleted = state.completedSteps.has(step);
              // Allow clicking on current step, completed steps, and previous steps
              const currentIndex = STEPS.indexOf(state.currentStep);
              const isClickable = index <= currentIndex || isCompleted;

              return (
                <React.Fragment key={step}>
                  <button
                    onClick={() => isClickable && goToStep(step)}
                    disabled={!isClickable}
                    className={`
                      flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200
                      ${isActive
                        ? "border-amber-300 bg-teal-800 text-amber-300 shadow-md"
                        : isCompleted
                          ? "border-green-500 bg-green-500 text-amber-200 shadow-sm"
                          : "border-amber-100 bg-teal-800 text-amber-100"
                      }
                      ${isClickable ? "cursor-pointer hover:border-amber-300 hover:shadow-md" : "cursor-not-allowed"}
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-100/20
                    `}
                  >
                    {isCompleted ? (
                      <CheckIcon className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </button>

                  {index < STEPS.length - 1 && (
                    <div
                      className={`
                      flex-1 h-0.5 mx-4 transition-colors duration-200
                      ${isCompleted ? "bg-green-500" : "bg-amber-100"}
                    `}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          <div className="flex justify-between mt-4">
            {STEPS.map((step) => (
              <div key={step} className="text-center">
                <p className="text-sm font-medium text-amber-100">{t(STEP_TITLES[step])}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Error Messages */}
      {Object.keys(state.errors).length > 0 && (
        <Card className="mb-6" variant="outlined">
          <CardContent className="p-4 bg-red-50">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-red-800 mb-2">
                  Prosím opravte následující chyby:
                </h3>
                <ul className="text-sm text-red-700 space-y-1">
                  {formatValidationErrors(state.errors).map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step Content */}
      <Card className="mb-8" variant="default">
        <CardContent className="py-6">
          {state.currentStep === "customer" && (
            <CustomerInfoStep
              customerInfo={state.formData.customerInfo}
              errors={state.errors.customerInfo || {}}
              onChange={(customerInfo) => updateFormData({ customerInfo })}
              locale={locale}
            />
          )}

          {state.currentStep === "delivery" && (
            <DeliveryInfoStep
              deliveryInfo={state.formData.deliveryInfo}
              errors={state.errors.deliveryInfo || {}}
              onChange={(deliveryInfo) => updateFormData({ deliveryInfo })}
              locale={locale}
              cartItems={items}
            />
          )}

          {state.currentStep === "review" && (
            <ReviewStep
              formData={state.formData}
              items={items}
              subtotal={subtotal}
              totalAmount={totalAmount}
              agreeToTerms={state.formData.agreeToTerms}
              subscribeNewsletter={state.formData.subscribeNewsletter}
              onAgreeToTermsChange={(agreeToTerms) => updateFormData({ agreeToTerms })}
              onSubscribeNewsletterChange={(subscribeNewsletter) => updateFormData({ subscribeNewsletter })}
              locale={locale}
              deliveryCost={0} />
          )}

          {state.currentStep === "payment" && (
            <PaymentStep
              {...(state.formData.paymentMethod && { paymentMethod: state.formData.paymentMethod })}
              onChange={(paymentMethod) => updateFormData({ paymentMethod })}
              locale={locale}
              onPaymentSuccess={(result) => {
                // Payment successful, redirect to success page
                if (result.sessionId) {
                  window.location.href = `/${locale}/checkout/success?session_id=${result.sessionId}`;
                }
              }}
              onPaymentError={(error) => {
                // Show error message
                setState((prev) => ({
                  ...prev,
                  errors: { general: [error] },
                }));
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons - Hidden on payment step as Stripe handles submission */}
      {state.currentStep !== "payment" && (
        <Card variant="default">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={goToPreviousStep}
                disabled={state.currentStep === "customer" || state.isSubmitting}
                className="flex items-center"
              >
                <ChevronLeftIcon className="w-4 h-4 mr-2" />
                {tCommon("previous")}
              </Button>

              <Button
                onClick={goToNextStep}
                disabled={state.isSubmitting}
                className="flex items-center bg-funeral-gold hover:bg-amber-300 text-teal-800"
              >
                {tCommon("next")}
                <ChevronRightIcon className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Back button for payment step */}
      {state.currentStep === "payment" && (
        <Card variant="default">
          <CardContent className="py-4">
            <Button
              variant="outline"
              onClick={goToPreviousStep}
              disabled={state.isSubmitting}
              className="flex items-center"
            >
              <ChevronLeftIcon className="w-4 h-4 mr-2" />
              {tCommon("previous")}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
