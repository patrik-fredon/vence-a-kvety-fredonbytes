"use client";

/**
 * Checkout Page Client Component
 * 
 * Integration with Stripe Embedded Checkout (Task 8.2):
 * When implementing Stripe Embedded Checkout, use the useCheckoutCompletion hook:
 * 
 * import { useCheckoutCompletion } from "@/lib/hooks/useCheckoutCompletion";
 * 
 * const { handleComplete, handleCancel, isProcessing, error } = useCheckoutCompletion({
 *   locale,
 *   onSuccess: (orderId) => {
 *     // Optional: Additional success handling
 *   },
 *   onError: (error) => {
 *     // Optional: Additional error handling
 *   },
 * });
 * 
 * Then pass handleComplete to the StripeEmbeddedCheckout component:
 * <StripeEmbeddedCheckout
 *   clientSecret={clientSecret}
 *   onComplete={(sessionId, orderId) => handleComplete(sessionId, orderId)}
 *   onCancel={(sessionId, orderId) => handleCancel(sessionId, orderId)}
 *   locale={locale}
 * />
 */

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { CartItemImage } from "@/components/cart/CartItemImage";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { CompactOrderSummary } from "@/components/checkout/OrderSummary";
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
}

export function CheckoutPageClient({ locale, initialCart }: CheckoutPageClientProps) {
  const t = useTranslations("checkout");
  const tCart = useTranslations("cart");
  const tProduct = useTranslations("product");
  const router = useRouter();

  // Use initialCart from server-side fetch
  const [items] = useState<CartItem[]>(initialCart.items);

  // Extract delivery method from cart
  const deliveryMethod = getDeliveryMethodFromCart(items);

  // Handle order completion
  const handleOrderComplete = (orderId: string) => {
    // Redirect to order confirmation page
    router.push(`/${locale}/orders/${orderId}/confirmation`);
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
                Zpět do košíku
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
          {/* Checkout Form - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <div className="bg-funeral-gold rounded-lg shadow-soft p-6 lg:p-8">
              <CheckoutForm items={items} locale={locale} onOrderComplete={handleOrderComplete} />
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
                  deliveryCost={0} // Will be calculated in checkout form
                  totalAmount={subtotal}
                  locale={locale}
                  deliveryMethod={deliveryMethod}
                />
              </div>

              {/* Desktop: Full Summary */}
              <div className="hidden lg:block">
                <div className="bg-funeral-gold rounded-lg shadow-soft p-6">
                  <h2 className="text-lg font-semibold text-teal-800 mb-4">Shrnutí objednávky</h2>

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
                              <p className="font-medium">{tProduct("deliveryMethod.pickup.address")}</p>
                              <p>{tProduct("deliveryMethod.pickup.hours")}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mt-6 pt-4 border-t border-teal-200">
                    <div className="flex justify-between items-center text-lg font-semibold">
                      <span>Mezisoučet:</span>
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