"use client";

/**
 * Checkout Page Client Component
 * 
 * Implements Stripe Embedded Checkout integration (Task 8.1)
 * - Validates delivery method before checkout
 * - Integrates with createEmbeddedCheckoutSession service
 * - Renders StripeEmbeddedCheckout component
 * - Handles checkout completion and error states
 */

import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { CartItemImage } from "@/components/cart/CartItemImage";
import { CompactOrderSummary } from "@/components/checkout/OrderSummary";

// Lazy load StripeEmbeddedCheckout for better performance
const StripeEmbeddedCheckout = dynamic(
  () =>
    import("@/components/payments/StripeEmbeddedCheckout").then(
      (mod) => mod.StripeEmbeddedCheckout
    ),
  {
    loading: () => (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    ),
    ssr: false,
  }
);
import { ArrowLeftIcon } from "@/lib/icons";
import type { CartItem } from "@/types/cart";

// Helper function to extract delivery method from cart items
function getDeliveryMethodFromCart(items: CartItem[]): "delivery" | "pickup" | null {
  for (const item of items) {
    const deliveryCustomization = item.customizations?.find(
      (c) => c.optionId === "delivery_method"
    );
    if (deliveryCustomization && deliveryCustomization.choiceIds.length > 0) {
      const choiceId = deliveryCustomization.choiceIds[0];
      if (choiceId === "delivery_address") return "delivery";
      if (choiceId === "personal_pickup") return "pickup";
    }
  }
  return null;
}

interface CheckoutPageClientProps {
  locale: string;
  initialCart: import("@/types/cart").CartSummary;
  checkoutSession: { clientSecret: string; sessionId: string } | null;
  sessionError: string | null;
}

export function CheckoutPageClient({
  locale,
  initialCart,
  checkoutSession,
  sessionError,
}: CheckoutPageClientProps) {
  const t = useTranslations("checkout");
  const tCart = useTranslations("cart");
  const tProduct = useTranslations("product");
  const router = useRouter();

  // Use initialCart from server-side fetch
  const [items] = useState<CartItem[]>(initialCart.items);

  // Extract delivery method from cart
  const deliveryMethod = getDeliveryMethodFromCart(items);

  // Handle checkout completion
  const handleCheckoutComplete = async (sessionId: string) => {
    try {
      // Invalidate the cached session
      const { invalidateCheckoutSession } = await import("@/lib/stripe/embedded-checkout");
      await invalidateCheckoutSession(sessionId);

      // Clear the cart
      await fetch("/api/cart", { method: "DELETE" });

      // Redirect to completion page
      router.push(`/${locale}/checkout/complete?session_id=${sessionId}`);
    } catch (error) {
      console.error("Error handling checkout completion:", error);
    }
  };

  // Handle checkout error
  const handleCheckoutError = (error: Error) => {
    console.error("Checkout error:", error);
  };

  // Handle back to cart
  const handleBackToCart = () => {
    router.push(`/${locale}/cart`);
  };

  const subtotal = items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);

  return (
    <div className="min-h-screen bg-funeral-gold">
      {/* Header */}
      <div className="bg-funeral-teal border-b border-teal-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={handleBackToCart}
                className="flex items-center text-amber-100 hover:text-amber-200 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                {t("backToCart")}
              </button>
            </div>
            <h1 className="text-lg sm:text-xl font-semibold text-amber-100">{t("title")}</h1>
            <div className="w-24" /> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Section - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <div className="bg-funeral-gold rounded-lg shadow-soft p-6 lg:p-8">
              {sessionError ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-red-800 mb-2">
                    {t("error.generic")}
                  </h3>
                  <p className="text-red-700 mb-4">{sessionError}</p>
                  <button
                    type="button"
                    onClick={() => router.refresh()}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    {t("retry")}
                  </button>
                </div>
              ) : checkoutSession ? (
                <>
                  <h2 className="text-xl font-semibold text-teal-800 mb-6">
                    {t("paymentInfo")}
                  </h2>
                  <StripeEmbeddedCheckout
                    clientSecret={checkoutSession.clientSecret}
                    onComplete={() => handleCheckoutComplete(checkoutSession.sessionId)}
                    onError={handleCheckoutError}
                    locale={locale as "cs" | "en"}
                  />
                </>
              ) : (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner size="lg" />
                  <span className="ml-3 text-teal-800">{t("loading")}</span>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar - Takes 1 column on large screens */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              {/* Mobile: Compact Summary */}
              <div className="lg:hidden mb-6">
                <CompactOrderSummary
                  items={items}
                  subtotal={subtotal}
                  deliveryCost={0}
                  totalAmount={subtotal}
                  locale={locale}
                  deliveryMethod={deliveryMethod}
                />
              </div>

              {/* Desktop: Full Summary */}
              <div className="hidden lg:block">
                <div className="bg-funeral-gold rounded-lg shadow-soft p-6">
                  <h2 className="text-lg font-semibold text-teal-800 mb-4">
                    {t("orderSummary")}
                  </h2>

                  <div className="space-y-4">
                    {items.map((item) => {
                      const product = item.product;
                      if (!product) return null;

                      const productName = locale === "cs" ? product.name.cs : product.name.en;

                      return (
                        <div
                          key={item.id}
                          className="flex items-start space-x-3 pb-4 border-b border-teal-100 last:border-b-0 last:pb-0"
                        >
                          <CartItemImage item={item} locale={locale} size="sm" />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-teal-900 truncate">
                              {productName}
                            </h4>
                            <p className="text-xs text-teal-800">
                              {tCart("quantity")}: {item.quantity}
                            </p>
                            <p className="text-sm font-medium text-teal-900 mt-1">
                              {(item.totalPrice || 0).toLocaleString("cs-CZ")} Kč
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Delivery Method Section */}
                  {deliveryMethod && (
                    <div className="mt-6 pt-4 border-t border-teal-200">
                      <h3 className="text-sm font-semibold text-teal-900 mb-3">
                        {tProduct("deliveryMethod.title")}
                      </h3>
                      <div className="bg-teal-50 rounded-lg p-3">
                        {deliveryMethod === "delivery" ? (
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-teal-900">
                                {tProduct("deliveryMethod.delivery.label")}
                              </span>
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                {tProduct("deliveryMethod.delivery.badge")}
                              </span>
                            </div>
                            <p className="text-xs text-teal-700">
                              {tProduct("deliveryMethod.delivery.description")}
                            </p>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-teal-900">
                                {tProduct("deliveryMethod.pickup.label")}
                              </span>
                            </div>
                            <p className="text-xs text-teal-700 mb-2">
                              {tProduct("deliveryMethod.pickup.description")}
                            </p>
                            <div className="text-xs text-teal-800 space-y-1 bg-white rounded p-2">
                              <p className="font-medium">
                                {tProduct("deliveryMethod.pickup.address")}
                              </p>
                              <p>{tProduct("deliveryMethod.pickup.hours")}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mt-6 pt-4 border-t border-teal-200">
                    <div className="flex justify-between items-center text-lg font-semibold">
                      <span>{t("total")}:</span>
                      <span>{subtotal.toLocaleString("cs-CZ")} Kč</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
