"use client";

import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useCallback, useEffect, useState } from "react";
import { LazyStripePaymentForm } from "@/components/dynamic";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { PaymentMethod } from "@/types/order";

interface PaymentFormClientProps {
  paymentMethod: PaymentMethod;
  orderId: string;
  amount: number;
  currency?: string;
  customerEmail: string;
  locale: string;
  onPaymentSuccess?: (result: any) => void;
  onPaymentError?: (error: string) => void;
}

/**
 * Client Component for payment form with progressive enhancement
 * This component is lazy-loaded only when needed for payment processing
 */
export function PaymentFormClient({
  paymentMethod,
  orderId,
  amount,
  currency = "czk",
  customerEmail,
  locale,
  onPaymentSuccess,
  onPaymentError,
}: PaymentFormClientProps) {
  const [paymentData, setPaymentData] = useState<{
    clientSecret?: string;
    paymentId?: string;
  } | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);

  const initializePayment = useCallback(async () => {
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
  }, [paymentMethod, orderId, amount, currency, customerEmail, locale, onPaymentError]);

  // Initialize payment on mount
  useEffect(() => {
    initializePayment();
  }, [initializePayment]);

  const handlePaymentSuccess = (result: any) => {
    console.log("Payment successful:", result);
    onPaymentSuccess?.(result);
  };

  const handlePaymentError = (error: string) => {
    console.error("Payment error:", error);
    onPaymentError?.(error);
  };

  return (
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
              <button
                type="button"
                onClick={initializePayment}
                className="mt-2 text-sm font-medium text-red-800 hover:text-red-900 underline"
              >
                Zkusit znovu
              </button>
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
  );
}
