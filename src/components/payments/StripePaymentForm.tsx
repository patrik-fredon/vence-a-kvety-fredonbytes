"use client";

import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import type React from "react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { CreditCardIcon, ExclamationTriangleIcon } from "@/lib/icons";
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

interface PaymentError {
  type: string;
  message: string;
  code?: string;
  decline_code?: string;
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
  const stripe = useStripe();
  const elements = useElements();

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [paymentElementReady, setPaymentElementReady] = useState(false);

  const maxRetries = 3;

  const getDetailedErrorMessage = useCallback((error: PaymentError): string => {
    // Handle specific Stripe error types with Czech translations
    switch (error.type) {
      case "card_error":
        switch (error.code) {
          case "card_declined":
            switch (error.decline_code) {
              case "insufficient_funds":
                return "Nedostatek prostředků na kartě. Zkuste jinou kartu.";
              case "expired_card":
                return "Platební karta je prošlá. Zkuste jinou kartu.";
              case "incorrect_cvc":
                return "Nesprávný CVC kód. Zkontrolujte údaje karty.";
              case "processing_error":
                return "Chyba při zpracování platby. Zkuste to znovu za chvíli.";
              default:
                return "Karta byla zamítnuta. Zkuste jinou kartu nebo kontaktujte banku.";
            }
          case "incorrect_number":
            return "Nesprávné číslo karty. Zkontrolujte zadané údaje.";
          case "invalid_expiry_month":
          case "invalid_expiry_year":
            return "Nesprávné datum expirace karty.";
          case "invalid_cvc":
            return "Nesprávný CVC kód karty.";
          case "expired_card":
            return "Platební karta je prošlá. Použijte jinou kartu.";
          default:
            return error.message || "Chyba platební karty. Zkontrolujte údaje.";
        }
      case "validation_error":
        return "Neplatné údaje karty. Zkontrolujte všechna pole.";
      case "api_connection_error":
        return "Problém s připojením k platební bráně. Zkuste to znovu.";
      case "rate_limit_error":
        return "Příliš mnoho pokusů. Zkuste to za chvíli.";
      case "authentication_error":
        return "Chyba ověření. Obnovte stránku a zkuste to znovu.";
      case "api_error":
        return "Chyba platební služby. Zkuste to znovu za chvíli.";
      default:
        return error.message || "Platba se nezdařila. Zkuste to znovu.";
    }
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!(stripe && elements)) {
      const errorMsg = "Platební formulář není připraven. Zkuste to znovu.";
      setErrorMessage(errorMsg);
      onError(errorMsg);
      return;
    }

    if (!paymentElementReady) {
      const errorMsg = "Platební formulář se ještě načítá. Zkuste to za chvíli.";
      setErrorMessage(errorMsg);
      onError(errorMsg);
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
        const errorMsg = getDetailedErrorMessage(error as PaymentError);
        setErrorMessage(errorMsg);
        onError(errorMsg);
      } else if (paymentIntent) {
        switch (paymentIntent.status) {
          case "succeeded":
            console.log("Payment succeeded:", paymentIntent);
            setRetryCount(0); // Reset retry count on success
            onSuccess(paymentIntent);
            break;
          case "processing":
            console.log("Payment is processing:", paymentIntent);
            setErrorMessage("Platba se zpracovává. Počkejte prosím...");
            // Don't call onError here as this is not an error state
            break;
          case "requires_action":
            console.log("Payment requires additional action:", paymentIntent);
            setErrorMessage("Platba vyžaduje dodatečné ověření. Postupujte podle pokynů.");
            break;
          default:
            console.log("Unexpected payment status:", paymentIntent.status);
            setErrorMessage("Neočekávaný stav platby. Zkuste to znovu.");
            onError("Neočekávaný stav platby.");
        }
      }
    } catch (err) {
      console.error("Unexpected error during payment:", err);
      const errorMsg = "Neočekávaná chyba při zpracování platby. Zkuste to znovu.";
      setErrorMessage(errorMsg);
      onError(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetry = useCallback(async () => {
    if (retryCount >= maxRetries) {
      setErrorMessage(
        "Dosáhli jste maximálního počtu pokusů. Zkuste to později nebo použijte jinou kartu."
      );
      return;
    }

    setIsRetrying(true);
    setErrorMessage(null);
    setRetryCount((prev) => prev + 1);

    // Wait a bit before retrying
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsRetrying(false);
  }, [retryCount]);

  const handlePaymentElementReady = useCallback(() => {
    setPaymentElementReady(true);
  }, []);

  const canRetry = errorMessage && retryCount < maxRetries && !isProcessing && !isRetrying;

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
          {/* Loading state for Payment Element */}
          {!paymentElementReady && (
            <div className="flex items-center justify-center p-8 border-2 border-stone-200 rounded-lg bg-stone-50">
              <LoadingSpinner size="md" className="mr-3" />
              <span className="text-stone-600">Načítá se platební formulář...</span>
            </div>
          )}

          <div
            className={`p-4 border-2 border-stone-200 rounded-lg bg-white transition-opacity ${
              paymentElementReady ? "opacity-100" : "opacity-0 absolute"
            }`}
          >
            <PaymentElement
              onReady={handlePaymentElementReady}
              options={{
                layout: "tabs",
                defaultValues: {
                  billingDetails: {
                    email: customerEmail,
                  },
                },
                fields: {
                  billingDetails: {
                    email: "never", // We already have the email
                  },
                },
              }}
            />
          </div>

          {/* Error Message with Retry Option */}
          {errorMessage && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-red-800">Chyba platby</h4>
                  <p className="text-sm text-red-700 mt-1">{errorMessage}</p>

                  {/* Retry information */}
                  {retryCount > 0 && (
                    <p className="text-xs text-red-600 mt-2">
                      Pokus {retryCount} z {maxRetries}
                    </p>
                  )}
                </div>
              </div>

              {/* Retry Button */}
              {canRetry && (
                <div className="mt-3 flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRetry}
                    disabled={isRetrying}
                    className="text-red-700 border-red-300 hover:bg-red-100"
                  >
                    {isRetrying ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Opakuje se...
                      </>
                    ) : (
                      "Zkusit znovu"
                    )}
                  </Button>
                </div>
              )}
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
            disabled={!(stripe && elements && paymentElementReady) || isProcessing || isRetrying}
            className="w-full flex items-center justify-center bg-amber-600 hover:bg-amber-700 text-white disabled:bg-stone-400 disabled:cursor-not-allowed"
            size="lg"
          >
            {isProcessing ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Zpracovává se platba...
              </>
            ) : !paymentElementReady ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Načítá se...
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
          <div className="text-xs text-stone-500 text-center space-y-1">
            <p>🔒 Vaše platební údaje jsou chráněny 256-bit SSL šifrováním.</p>
            <p>Údaje karet nejsou ukládány na našich serverech.</p>
            <p>Platby zpracovává Stripe - certifikovaný PCI DSS poskytovatel.</p>
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
