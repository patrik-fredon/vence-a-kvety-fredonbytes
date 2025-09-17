"use client";

import {
  ArrowTopRightOnSquareIcon,
  BanknotesIcon,
  CreditCardIcon,
  DevicePhoneMobileIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface GopayPaymentFormProps {
  redirectUrl: string;
  orderId: string;
  amount: number;
  currency: string;
  onError: (error: string) => void;
  locale: string;
}

export function GopayPaymentForm({
  redirectUrl,
  orderId,
  amount,
  currency,
  onError,
  locale,
}: GopayPaymentFormProps) {
  const t = useTranslations("checkout");
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handlePayment = async () => {
    try {
      setIsRedirecting(true);

      // Redirect to GoPay payment gateway
      window.location.href = redirectUrl;
    } catch (error) {
      console.error("Error redirecting to GoPay:", error);
      onError("Chyba při přesměrování na platební bránu.");
      setIsRedirecting(false);
    }
  };

  const paymentMethods = [
    {
      icon: <BanknotesIcon className="w-6 h-6" />,
      name: "Bankovní převod",
      description: "Přímý převod z vašeho bankovního účtu",
    },
    {
      icon: <CreditCardIcon className="w-6 h-6" />,
      name: "Platební karta",
      description: "Visa, Mastercard, American Express",
    },
    {
      icon: <DevicePhoneMobileIcon className="w-6 h-6" />,
      name: "Rychlé platby",
      description: "Apple Pay, Google Pay, PayPal",
    },
  ];

  return (
    <div className="gopay-payment-form space-y-6">
      {/* GoPay Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
          <BanknotesIcon className="w-8 h-8 text-orange-600" />
        </div>
        <h3 className="text-xl font-semibold text-neutral-900 mb-2">Platba přes GoPay</h3>
        <p className="text-neutral-600">
          Vyberte si z různých způsobů platby na bezpečné platební bráně GoPay
        </p>
      </div>

      {/* Available Payment Methods */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-neutral-700 mb-3">Dostupné způsoby platby:</h4>

        {paymentMethods.map((method, index) => (
          <div
            key={index}
            className="flex items-center space-x-3 p-3 bg-neutral-50 border border-neutral-200 rounded-lg"
          >
            <div className="flex-shrink-0 text-orange-600">{method.icon}</div>
            <div>
              <div className="text-sm font-medium text-neutral-900">{method.name}</div>
              <div className="text-xs text-neutral-600">{method.description}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Summary */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-orange-800">Objednávka:</span>
          <span className="text-sm font-medium text-orange-900">#{orderId}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-orange-800">Celková částka:</span>
          <span className="text-lg font-semibold text-orange-900">
            {new Intl.NumberFormat(locale === "cs" ? "cs-CZ" : "en-US", {
              style: "currency",
              currency: currency.toUpperCase(),
            }).format(amount)}
          </span>
        </div>
      </div>

      {/* Security Information */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-green-800 mb-1">Bezpečná platba</h4>
            <div className="text-xs text-green-700 space-y-1">
              <p>• SSL šifrování všech platebních údajů</p>
              <p>• Certifikovaný poskytovatel plateb (PCI DSS)</p>
              <p>• Podpora 3D Secure pro karty</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Button */}
      <Button
        onClick={handlePayment}
        disabled={isRedirecting}
        className="w-full flex items-center justify-center"
        size="lg"
      >
        {isRedirecting ? (
          <>
            <LoadingSpinner size="sm" className="mr-2" />
            Přesměrovává se...
          </>
        ) : (
          <>
            <ArrowTopRightOnSquareIcon className="w-5 h-5 mr-2" />
            Pokračovat na GoPay
          </>
        )}
      </Button>

      {/* Information Notice */}
      <div className="text-xs text-neutral-500 text-center space-y-1">
        <p>Po kliknutí budete přesměrováni na bezpečnou platební bránu GoPay.</p>
        <p>Po dokončení platby se automaticky vrátíte zpět na náš web.</p>
      </div>

      {/* Terms Notice */}
      <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3">
        <p className="text-xs text-neutral-600 text-center">
          Pokračováním souhlasíte s{" "}
          <a href="/terms" className="text-primary-600 hover:text-primary-700 underline">
            obchodními podmínkami
          </a>{" "}
          GoPay a našimi{" "}
          <a href="/privacy" className="text-primary-600 hover:text-primary-700 underline">
            zásadami ochrany osobních údajů
          </a>
          .
        </p>
      </div>
    </div>
  );
}
