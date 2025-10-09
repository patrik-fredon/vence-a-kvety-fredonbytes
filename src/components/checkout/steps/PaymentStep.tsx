"use client";

import { CreditCardIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { PaymentMethod } from "@/types/order";

// Lazy load StripeEmbeddedCheckout for better performance
const StripeEmbeddedCheckout = dynamic(
  () =>
    import("@/components/payments/StripeEmbeddedCheckout").then(
      (mod) => mod.StripeEmbeddedCheckout
    ),
  {
    loading: () => (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="md" />
      </div>
    ),
    ssr: false,
  }
);

interface PaymentStepProps {
  paymentMethod?: PaymentMethod;
  onChange: (paymentMethod: PaymentMethod) => void;
  locale: string;
  onPaymentSuccess?: (result: any) => void;
  onPaymentError?: (error: string) => void;
}

export function PaymentStep({
  paymentMethod,
  onChange,
  locale,
  onPaymentSuccess,
  onPaymentError,
}: PaymentStepProps) {
  const t = useTranslations("checkout");
  const [checkoutSession, setCheckoutSession] = useState<{
    clientSecret: string;
    sessionId: string;
  } | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(false);

  // Auto-select Stripe as the only payment method
  useEffect(() => {
    if (!paymentMethod) {
      onChange("stripe");
    }
  }, [paymentMethod, onChange]);

  // Create Stripe Embedded Checkout session when payment method is selected
  useEffect(() => {
    const createCheckoutSession = async () => {
      if (paymentMethod === "stripe" && !checkoutSession && !isLoadingSession) {
        setIsLoadingSession(true);
        setSessionError(null);

        try {
          // Import the checkout session creator
          const { createEmbeddedCheckoutSession } = await import(
            "@/lib/stripe/embedded-checkout"
          );

          // Get cart items from the API
          const cartResponse = await fetch("/api/cart");
          const cartData = await cartResponse.json();

          if (!cartData.success || !cartData.items || cartData.items.length === 0) {
            throw new Error("Cart is empty or could not be loaded");
          }

          // Create the checkout session
          const session = await createEmbeddedCheckoutSession({
            cartItems: cartData.items,
            locale: locale as "cs" | "en",
            metadata: {
              itemCount: cartData.items.length.toString(),
            },
          });

          setCheckoutSession(session);
        } catch (error) {
          console.error("Failed to create checkout session:", error);
          setSessionError(
            error instanceof Error ? error.message : "Failed to create checkout session"
          );
        } finally {
          setIsLoadingSession(false);
        }
      }
    };

    createCheckoutSession();
  }, [paymentMethod, checkoutSession, isLoadingSession, locale]);

  // Handle checkout completion
  const handleCheckoutComplete = async (sessionId: string) => {
    try {
      // Invalidate the cached session
      const { invalidateCheckoutSession } = await import("@/lib/stripe/embedded-checkout");
      await invalidateCheckoutSession(sessionId);

      // Clear the cart
      await fetch("/api/cart", { method: "DELETE" });

      // Call the success callback if provided
      if (onPaymentSuccess) {
        onPaymentSuccess({ sessionId });
      }
    } catch (error) {
      console.error("Error handling checkout completion:", error);
      if (onPaymentError) {
        onPaymentError("Failed to complete checkout");
      }
    }
  };

  // Handle checkout error
  const handleCheckoutError = (error: Error) => {
    console.error("Checkout error:", error);
    if (onPaymentError) {
      onPaymentError(error.message);
    }
  };

  const paymentOptions = [
    {
      id: "stripe" as PaymentMethod,
      name: "Platební karta",
      description: "Visa, Mastercard, American Express",
      icon: <CreditCardIcon className="w-6 h-6" />,
      features: ["Okamžité zpracování", "Bezpečné platby", "3D Secure"],
      recommended: true,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-elegant text-2xl font-semibold text-primary-800 mb-2">
          {t("paymentInfo")}
        </h2>
        <p className="text-neutral-600">Vyberte způsob platby pro dokončení objednávky.</p>
      </div>

      {/* Payment Options */}
      <div className="space-y-4">
        {paymentOptions.map((option) => (
          <div
            key={option.id}
            className={`
              relative border-2 rounded-lg p-6 cursor-pointer transition-all
              ${paymentMethod === option.id
                ? "border-primary-500 bg-primary-50"
                : "border-neutral-200 bg-white hover:border-neutral-300"
              }
            `}
            onClick={() => onChange(option.id)}
          >
            {/* Recommended Badge */}
            {option.recommended && (
              <div className="absolute -top-2 left-4">
                <span className="bg-green-500 text-white text-xs font-medium px-2 py-1 rounded">
                  Doporučeno
                </span>
              </div>
            )}

            <div className="flex items-start space-x-4">
              {/* Radio Button */}
              <div className="flex-shrink-0 mt-1">
                <div
                  className={`
                  w-5 h-5 rounded-full border-2 flex items-center justify-center
                  ${paymentMethod === option.id
                      ? "border-primary-500 bg-primary-500"
                      : "border-neutral-300 bg-white"
                    }
                `}
                >
                  {paymentMethod === option.id && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </div>

              {/* Icon */}
              <div
                className={`
                flex-shrink-0 p-3 rounded-lg
                ${paymentMethod === option.id
                    ? "bg-primary-100 text-primary-600"
                    : "bg-neutral-100 text-neutral-600"
                  }
              `}
              >
                {option.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-neutral-900">{option.name}</h3>
                </div>

                <p className="text-neutral-600 mb-3">{option.description}</p>

                {/* Features */}
                <div className="flex flex-wrap gap-2">
                  {option.features.map((feature, index) => (
                    <span
                      key={index}
                      className={`
                        inline-flex items-center px-2 py-1 rounded text-xs font-medium
                        ${paymentMethod === option.id
                          ? "bg-primary-100 text-primary-800"
                          : "bg-neutral-100 text-neutral-700"
                        }
                      `}
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Security Information */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <ShieldCheckIcon className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-green-800 mb-2">Bezpečné platby</h3>
            <div className="space-y-2 text-sm text-green-700">
              <p>• Všechny platby jsou šifrovány pomocí SSL certifikátu</p>
              <p>• Neukládáme údaje o platebních kartách</p>
              <p>• Platby zpracovávají certifikovaní poskytovatelé (PCI DSS)</p>
              <p>• Podpora 3D Secure pro dodatečnou bezpečnost</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stripe Embedded Checkout - Only shown when Stripe is selected */}
      {paymentMethod === "stripe" && (
        <div className="bg-white border border-neutral-200 rounded-lg p-6">
          <h4 className="font-semibold text-neutral-800 mb-4">Platba kartou</h4>

          {isLoadingSession && (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
              <span className="ml-3 text-neutral-600">Načítání platebního formuláře...</span>
            </div>
          )}

          {sessionError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Chyba při načítání platby</h3>
              <p className="text-red-700 mb-4">{sessionError}</p>
              <button
                type="button"
                onClick={() => {
                  setCheckoutSession(null);
                  setSessionError(null);
                  setIsLoadingSession(false);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Zkusit znovu
              </button>
            </div>
          )}

          {checkoutSession && !isLoadingSession && !sessionError && (
            <>
              <p className="text-sm text-neutral-600 mb-4">
                Zadejte údaje své platební karty. Platba bude zpracována okamžitě a bezpečně přes
                Stripe.
              </p>
              <StripeEmbeddedCheckout
                clientSecret={checkoutSession.clientSecret}
                onComplete={() => handleCheckoutComplete(checkoutSession.sessionId)}
                onError={handleCheckoutError}
                locale={locale as "cs" | "en"}
              />
            </>
          )}
        </div>
      )}

      {/* Terms Notice */}
      <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
        <p className="text-sm text-neutral-700">
          Dokončením objednávky souhlasíte s našimi{" "}
          <a href="/terms" className="text-primary-600 hover:text-primary-700 underline">
            obchodními podmínkami
          </a>{" "}
          a{" "}
          <a href="/privacy" className="text-primary-600 hover:text-primary-700 underline">
            zásadami ochrany osobních údajů
          </a>
          .
        </p>
      </div>
    </div>
  );
}
