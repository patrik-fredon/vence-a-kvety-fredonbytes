"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import {
  CheckoutFormData,
  CheckoutStep,
  CheckoutState,
  CustomerInfo,
  DeliveryInfo,
  PaymentMethod,
} from "@/types/order";
import { CartItem } from "@/types/cart";
import { DeliveryUrgency } from "@/types/delivery";
import {
  validateCheckoutForm,
  hasValidationErrors,
  formatValidationErrors,
  sanitizeCustomerInfo,
  sanitizeDeliveryInfo,
} from "@/lib/validation/checkout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { CustomerInfoStep } from "./steps/CustomerInfoStep";
import { DeliveryInfoStep } from "./steps/DeliveryInfoStep";
import { PaymentStep } from "./steps/PaymentStep";
import { ReviewStep } from "./steps/ReviewStep";

interface CheckoutFormProps {
  items: CartItem[];
  locale: string;
  onOrderComplete: (orderId: string) => void;
  className?: string;
}

const STEPS: CheckoutStep[] = ["customer", "delivery", "payment", "review"];

const STEP_TITLES = {
  customer: "customerInfo",
  delivery: "deliveryInfo",
  payment: "paymentInfo",
  review: "orderSummary",
} as const;

export function CheckoutForm({
  items,
  locale,
  onOrderComplete,
  className = "",
}: CheckoutFormProps) {
  const t = useTranslations("checkout");
  const tCommon = useTranslations("common");
  const router = useRouter();

  // Initialize checkout state
  const [state, setState] = useState<CheckoutState>({
    currentStep: "customer",
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

  // Calculate delivery cost when delivery info changes
  useEffect(() => {
    const calculateDeliveryCost = async () => {
      if (state.formData.deliveryInfo.address && state.formData.deliveryInfo.urgency) {
        try {
          const response = await fetch("/api/delivery/estimate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              address: state.formData.deliveryInfo.address,
              urgency: state.formData.deliveryInfo.urgency,
              items: items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
              })),
            }),
          });

          const data = await response.json();
          if (data.success && data.estimate) {
            setState((prev) => ({
              ...prev,
              deliveryCost: data.estimate.totalCost,
              estimatedDeliveryDate: new Date(data.estimate.estimatedDeliveryDate),
            }));
          }
        } catch (error) {
          console.error("Error calculating delivery cost:", error);
        }
      }
    };

    calculateDeliveryCost();
  }, [state.formData.deliveryInfo.address, state.formData.deliveryInfo.urgency, items]);

  // Handle step navigation
  const goToStep = (step: CheckoutStep) => {
    setState((prev) => ({ ...prev, currentStep: step, errors: {} }));
  };

  const goToNextStep = () => {
    const currentIndex = STEPS.indexOf(state.currentStep);
    if (currentIndex < STEPS.length - 1) {
      const nextStep = STEPS[currentIndex + 1];

      // Validate current step before proceeding
      if (nextStep && validateCurrentStep()) {
        goToStep(nextStep);
      }
    }
  };

  const goToPreviousStep = () => {
    const currentIndex = STEPS.indexOf(state.currentStep);
    if (currentIndex > 0) {
      const prevStep = STEPS[currentIndex - 1];
      if (prevStep) {
        goToStep(prevStep);
      }
    }
  };

  // Validate current step
  const validateCurrentStep = (): boolean => {
    const { customerInfo, deliveryInfo, agreeToTerms } = state.formData;

    switch (state.currentStep) {
      case "customer":
        const customerErrors = validateCheckoutForm(customerInfo, {}, false);
        if (hasValidationErrors(customerErrors)) {
          setState((prev) => ({ ...prev, errors: customerErrors }));
          return false;
        }
        break;

      case "delivery":
        const deliveryErrors = validateCheckoutForm({}, deliveryInfo, false);
        if (hasValidationErrors(deliveryErrors)) {
          setState((prev) => ({ ...prev, errors: deliveryErrors }));
          return false;
        }
        break;

      case "payment":
        if (!state.formData.paymentMethod) {
          setState((prev) => ({
            ...prev,
            errors: { general: ["Vyberte způsob platby"] },
          }));
          return false;
        }
        break;

      case "review":
        const allErrors = validateCheckoutForm(customerInfo, deliveryInfo, agreeToTerms);
        if (hasValidationErrors(allErrors)) {
          setState((prev) => ({ ...prev, errors: allErrors }));
          return false;
        }
        break;
    }

    setState((prev) => ({ ...prev, errors: {} }));
    return true;
  };

  // Update form data
  const updateFormData = (updates: Partial<CheckoutFormData>) => {
    setState((prev) => ({
      ...prev,
      formData: { ...prev.formData, ...updates },
      errors: {},
    }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      return;
    }

    setState((prev) => ({ ...prev, isSubmitting: true }));

    try {
      const sanitizedCustomerInfo = sanitizeCustomerInfo(state.formData.customerInfo);
      const sanitizedDeliveryInfo = sanitizeDeliveryInfo(state.formData.deliveryInfo);

      const orderData = {
        items,
        customerInfo: sanitizedCustomerInfo as CustomerInfo,
        deliveryInfo: sanitizedDeliveryInfo as DeliveryInfo,
        paymentMethod: state.formData.paymentMethod!,
        agreeToTerms: state.formData.agreeToTerms,
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (data.success) {
        // Clear cart and redirect to success page
        await fetch("/api/cart", { method: "DELETE" });
        onOrderComplete(data.order.id);
      } else {
        setState((prev) => ({
          ...prev,
          errors: { general: [data.error || "Chyba při vytváření objednávky"] },
        }));
      }
    } catch (error) {
      console.error("Error submitting order:", error);
      setState((prev) => ({
        ...prev,
        errors: { general: ["Chyba při odesílání objednávky. Zkuste to znovu."] },
      }));
    } finally {
      setState((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  const totalAmount = subtotal + state.deliveryCost;

  return (
    <div className={`checkout-form ${className}`}>
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const isActive = step === state.currentStep;
            const isCompleted = STEPS.indexOf(state.currentStep) > index;
            const isClickable = STEPS.indexOf(state.currentStep) >= index;

            return (
              <React.Fragment key={step}>
                <button
                  onClick={() => isClickable && goToStep(step)}
                  disabled={!isClickable}
                  className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors
                    ${
                      isActive
                        ? "border-primary-600 bg-primary-600 text-white"
                        : isCompleted
                          ? "border-green-500 bg-green-500 text-white"
                          : "border-neutral-300 bg-white text-neutral-400"
                    }
                    ${isClickable ? "cursor-pointer hover:border-primary-500" : "cursor-not-allowed"}
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
                    flex-1 h-0.5 mx-4
                    ${isCompleted ? "bg-green-500" : "bg-neutral-200"}
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
              <p className="text-sm font-medium text-neutral-700">{t(STEP_TITLES[step])}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Error Messages */}
      {Object.keys(state.errors).length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
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
        </div>
      )}

      {/* Step Content */}
      <div className="mb-8">
        {state.currentStep === "customer" && (
          <CustomerInfoStep
            customerInfo={state.formData.customerInfo}
            errors={state.errors.customerInfo}
            onChange={(customerInfo) => updateFormData({ customerInfo })}
            locale={locale}
          />
        )}

        {state.currentStep === "delivery" && (
          <DeliveryInfoStep
            deliveryInfo={state.formData.deliveryInfo}
            errors={state.errors.deliveryInfo}
            onChange={(deliveryInfo) => updateFormData({ deliveryInfo })}
            locale={locale}
          />
        )}

        {state.currentStep === "payment" && (
          <PaymentStep
            paymentMethod={state.formData.paymentMethod}
            onChange={(paymentMethod) => updateFormData({ paymentMethod })}
            locale={locale}
          />
        )}

        {state.currentStep === "review" && (
          <ReviewStep
            formData={state.formData}
            items={items}
            subtotal={subtotal}
            deliveryCost={state.deliveryCost}
            totalAmount={totalAmount}
            estimatedDeliveryDate={state.estimatedDeliveryDate}
            agreeToTerms={state.formData.agreeToTerms}
            subscribeNewsletter={state.formData.subscribeNewsletter}
            onAgreeToTermsChange={(agreeToTerms) => updateFormData({ agreeToTerms })}
            onSubscribeNewsletterChange={(subscribeNewsletter) =>
              updateFormData({ subscribeNewsletter })
            }
            locale={locale}
          />
        )}
      </div>

      {/* Navigation Buttons */}
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

        {state.currentStep === "review" ? (
          <Button
            onClick={handleSubmit}
            disabled={state.isSubmitting}
            className="flex items-center min-w-[140px]"
          >
            {state.isSubmitting ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Odesílání...
              </>
            ) : (
              t("placeOrder")
            )}
          </Button>
        ) : (
          <Button
            onClick={goToNextStep}
            disabled={state.isSubmitting}
            className="flex items-center"
          >
            {tCommon("next")}
            <ChevronRightIcon className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
