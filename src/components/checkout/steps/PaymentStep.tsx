"use client";

import {
  CreditCardIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { PaymentMethod } from "@/types/order";

interface PaymentStepProps {
  paymentMethod?: PaymentMethod;
  onChange: (paymentMethod: PaymentMethod) => void;
  locale: string;
  orderId?: string;
  amount?: number;
  currency?: string;
  customerEmail?: string;
  onPaymentSuccess?: (result: any) => void;
  onPaymentError?: (error: string) => void;
}

/**
 * Wrapper component for payment form with Suspense and Error Boundary
 * Implements progressive enhancement for better performance
 */
function PaymentFormWrapper({
  paymentMethod,
  orderId,
  amount,
  currency,
  customerEmail,
  locale,
  onPaymentSuccess,
  onPaymentError,
}: {
  paymentMethod: PaymentMethod;
  orderId: string;
  amount: number;
  currency: string;
  customerEmail: string;
  locale: string;
  onPaymentSuccess?: (result: any) => void;
  onPaymentError?: (error: string) => void;
}) {
  const { Suspense, lazy } = require("react");
  const { PaymentErrorBoundary } = require("@/components/checkout/PaymentErrorBoundary");

  // Lazy load the payment form client component
  const PaymentFormClient = lazy(() =>
    import("@/components/checkout/PaymentFormClient").then((mod) => ({
      default: mod.PaymentFormClient,
    }))
  );

  return (
    <PaymentErrorBoundary>
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="md" className="mr-3" />
            <span className="text-neutral-600">Načítání platebního formuláře...</span>
          </div>
        }
      >
        <PaymentFormClient
          paymentMethod={paymentMethod}
          orderId={orderId}
          amount={amount}
          currency={currency}
          customerEmail={customerEmail}
          locale={locale}
          onPaymentSuccess={onPaymentSuccess}
          onPaymentError={onPaymentError}
        />
      </Suspense>
    </PaymentErrorBoundary>
  );
}

export function PaymentStep({
  paymentMethod,
  onChange,
  locale,
  orderId,
  amount,
  currency = "czk",
  customerEmail,
  onPaymentSuccess,
  onPaymentError,
}: PaymentStepProps) {
  const t = useTranslations("checkout");

  // Auto-select Stripe as the only payment method
  useEffect(() => {
    if (!paymentMethod) {
      onChange("stripe");
    }
  }, [paymentMethod, onChange]);

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
              ${
                paymentMethod === option.id
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
                  ${
                    paymentMethod === option.id
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
                ${
                  paymentMethod === option.id
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
                        ${
                          paymentMethod === option.id
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

      {/* Payment Method Details */}
      {paymentMethod === "stripe" && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">Platba kartou přes Stripe</h4>
          <p className="text-sm text-blue-700">
            Po dokončení objednávky budete přesměrováni na bezpečnou platební bránu Stripe, kde
            zadáte údaje své platební karty. Platba bude zpracována okamžitě.
          </p>
        </div>
      )}

      {/* Payment Forms with Progressive Enhancement */}
      {paymentMethod && orderId && amount && customerEmail && (
        <PaymentFormWrapper
          paymentMethod={paymentMethod}
          orderId={orderId}
          amount={amount}
          currency={currency}
          customerEmail={customerEmail}
          locale={locale}
          onPaymentSuccess={onPaymentSuccess}
          onPaymentError={onPaymentError}
        />
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
                  ${
                    paymentMethod === option.id
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
                ${
                  paymentMethod === option.id
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
                        ${
                          paymentMethod === option.id
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

      {/* Payment Method Details */}
      {paymentMethod === "stripe" && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">Platba kartou přes Stripe</h4>
          <p className="text-sm text-blue-700">
            Po dokončení objednávky budete přesměrováni na bezpečnou platební bránu Stripe, kde
            zadáte údaje své platební karty. Platba bude zpracována okamžitě.
          </p>
        </div>
      )}

      {/* Payment Forms */}
      {paymentMethod && orderId && amount && customerEmail && (
        <div className="mt-8">
          {/* Initialization Loading */}
          {isInitializing && (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="md" className="mr-3" />
              <span className="text-neutral-600">Připravuje se platba...</span>
            </div>
          )}

          {/* Initialization Error */}
          {initializationError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-red-800">Chyba inicializace platby</h4>
                  <p className="text-sm text-red-700 mt-1">{initializationError}</p>
                </div>
              </div>
            </div>
          )}

          {/* Stripe Payment Form */}
          {paymentMethod === "stripe" && paymentData?.clientSecret && (
            <LazyStripePaymentForm
              clientSecret={paymentData.clientSecret}
              orderId={orderId}
              amount={amount}
              currency={currency}
              customerEmail={customerEmail}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              locale={locale}
            />
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
