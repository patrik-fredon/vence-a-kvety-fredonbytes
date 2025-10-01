"use client";

import { CreditCardIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { getStripe } from "@/lib/payments/stripe";

interface StripePaymentFormProps {
  clientSecret: string;
  orderId: string;
  amount: number;
  currency: string;
  customerEmail: string;
  onSuccess: (paymentIntent: any) => void;
  onError: (error: string) => void;
  locale: string;
}

interface PaymentFormProps {
  orderId: string;
  amount: number;
  currency: string;
  customerEmail: string;
  onSuccess: (paymentIntent: any) => void;
  onError: (error: string) => void;
  locale: string;
}

/**
 * Inner payment form component that uses Stripe hooks
 */
function PaymentForm({
  orderId,
  amount,
  currency,
  customerEmail,
  onSuccess,
  onError,
  locale,
}: PaymentFormProps) {
  // Removed unused translation hook
  const stripe = useStripe();
  const elements = useElements();

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!(stripe && elements)) {
      onError("Stripe není připraven. Zkuste to znovu.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/${locale}/checkout/success?orderId=${orderId}`,
          receipt_email: customerEmail,
        },
        redirect: "if_required",
      });

      if (error) {
        console.error("Payment confirmation error:", error);

        let errorMsg = "Platba se nezdařila. Zkuste to znovu.";

        switch (error.type) {
          case "card_error":
            errorMsg = error.message || "Chyba platební karty.";
            break;
          case "validation_error":
            errorMsg = "Neplatné údaje karty.";
            break;
          case "api_connection_error":
            errorMsg = "Problém s připojením. Zkuste to znovu.";
            break;
          case "rate_limit_error":
            errorMsg = "Příliš mnoho pokusů. Zkuste to za chvíli.";
            break;
          default:
            errorMsg = error.message || errorMsg;
        }

        setErrorMessage(errorMsg);
        onError(errorMsg);
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        console.log("Payment succeeded:", paymentIntent);
        onSuccess(paymentIntent);
      } else {
        console.log("Payment requires additional action:", paymentIntent);
        setErrorMessage("Platba vyžaduje dodatečné ověření.");
        onError("Platba vyžaduje dodatečné ověření.");
      }
    } catch (err) {
      console.error("Unexpected error during payment:", err);
      const errorMsg = "Neočekávaná chyba při zpracování platby.";
      setErrorMessage(errorMsg);
      onError(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card variant="default">
      <form onSubmit={handleSubmit}>
        {/* Payment Element */}
        <CardHeader>
          <div className="flex items-center space-x-2">
            <CreditCardIcon className="w-5 h-5 text-amber-600" />
            <CardTitle className="text-lg font-light text-stone-900">
              Údaje platební karty
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="p-4 border-2 border-stone-200 rounded-lg bg-white">
            <PaymentElement
              options={{
                layout: "tabs",
                defaultValues: {
                  billingDetails: {
                    email: customerEmail,
                  },
                },
              }}
            />
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-red-800">Chyba platby</h4>
                <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Payment Summary */}
          <div className="bg-stone-50 border border-stone-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-stone-600">Celková částka:</span>
              <span className="text-lg font-semibold text-stone-900">
                {new Intl.NumberFormat(locale === "cs" ? "cs-CZ" : "en-US", {
                  style: "currency",
                  currency: currency.toUpperCase(),
                }).format(amount)}
              </span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex-col space-y-4">
          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!(stripe && elements) || isProcessing}
            className="w-full flex items-center justify-center bg-amber-600 hover:bg-amber-700 text-white"
            size="lg"
          >
            {isProcessing ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Zpracovává se platba...
              </>
            ) : (
              <>
                <CreditCardIcon className="w-5 h-5 mr-2" />
                Zaplatit{" "}
                {new Intl.NumberFormat(locale === "cs" ? "cs-CZ" : "en-US", {
                  style: "currency",
                  currency: currency.toUpperCase(),
                }).format(amount)}
              </>
            )}
          </Button>

          {/* Security Notice */}
          <div className="text-xs text-stone-500 text-center">
            <p>
              🔒 Vaše platební údaje jsou chráněny 256-bit SSL šifrováním.
              <br />
              Údaje karet nejsou ukládány na našich serverech.
            </p>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}

/**
 * Main Stripe payment form component with Elements provider
 */
export function StripePaymentForm({
  clientSecret,
  orderId,
  amount,
  currency,
  customerEmail,
  onSuccess,
  onError,
  locale,
}: StripePaymentFormProps) {
  const [stripePromise] = useState(() => getStripe());

  // Configure Elements options with locale
  const elementsOptions = {
    clientSecret,
    appearance: {
      theme: "stripe" as const,
      variables: {
        colorPrimary: "#D97706", // amber-600
        colorBackground: "#ffffff",
        colorText: "#1C1917", // stone-900
        colorDanger: "#dc2626",
        fontFamily: "Inter, system-ui, sans-serif",
        spacingUnit: "4px",
        borderRadius: "8px",
      },
    },
  };

  return (
    <div className="stripe-payment-form">
      <Elements stripe={stripePromise} options={elementsOptions}>
        <PaymentForm
          orderId={orderId}
          amount={amount}
          currency={currency}
          customerEmail={customerEmail}
          onSuccess={onSuccess}
          onError={onError}
          locale={locale}
        />
      </Elements>
    </div>
  );
}
