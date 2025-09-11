"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  CreditCardIcon,
  BanknotesIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { PaymentMethod } from "@/types/order";
import { StripePaymentForm } from "@/components/payments/StripePaymentForm";
import { GopayPaymentForm } from "@/components/payments/GopayPaymentForm";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

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

  const [paymentData, setPaymentData] = useState<{
    clientSecret?: string;
    redirectUrl?: string;
    paymentId?: string;
  } | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);

  // Initialize payment when method is selected and we have required data
  useEffect(() => {
    if (paymentMethod && orderId && amount && customerEmail) {
      initializePayment();
    }
  }, [paymentMethod, orderId, amount, customerEmail]);

  const initializePayment = async () => {
    if (!paymentMethod || !orderId || !amount || !customerEmail) {
      return;
    }

    setIsInitializing(true);
    setInitializationError(null);

    try {
      const response = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          amount,
          currency,
          customerEmail,
          customerName: customerEmail, // Will be updated with actual name
          paymentMethod,
          locale,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPaymentData({
          clientSecret: data.data.clientSecret,
          redirectUrl: data.data.redirectUrl,
          paymentId: data.data.paymentId,
        });
      } else {
        setInitializationError(data.error || "Chyba při inicializaci platby");
        onPaymentError?.(data.error || "Chyba při inicializaci platby");
      }
    } catch (error) {
      console.error("Error initializing payment:", error);
      const errorMsg = "Chyba při připojení k platební bráně";
      setInitializationError(errorMsg);
      onPaymentError?.(errorMsg);
    } finally {
      setIsInitializing(false);
    }
  };

  const handlePaymentSuccess = (result: any) => {
    console.log("Payment successful:", result);
    onPaymentSuccess?.(result);
  };

  const handlePaymentError = (error: string) => {
    console.error("Payment error:", error);
    onPaymentError?.(error);
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
    {
      id: "gopay" as PaymentMethod,
      name: "GoPay",
      description: "Bankovní převod, platební karta, rychlé platby",
      icon: <BanknotesIcon className="w-6 h-6" />,
      features: ["Bankovní převod", "Platební karta", "Apple Pay", "Google Pay"],
      recommended: false,
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

      {paymentMethod === "gopay" && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h4 className="font-semibold text-orange-800 mb-2">Platba přes GoPay</h4>
          <p className="text-sm text-orange-700">
            Po dokončení objednávky budete přesměrováni na platební bránu GoPay, kde si můžete
            vybrat z různých způsobů platby včetně bankovního převodu, platební karty nebo rychlých
            plateb.
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
            <StripePaymentForm
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

          {/* GoPay Payment Form */}
          {paymentMethod === "gopay" && paymentData?.redirectUrl && (
            <GopayPaymentForm
              redirectUrl={paymentData.redirectUrl}
              orderId={orderId}
              amount={amount}
              currency={currency}
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
