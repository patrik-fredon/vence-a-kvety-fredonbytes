"use client";

import { ArrowLeftIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { CompactOrderSummary } from "@/components/checkout/OrderSummary";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useCart } from "@/lib/cart/context";
import type { CartItem } from "@/types/cart";

interface CheckoutPageClientProps {
  locale: string;
}

export function CheckoutPageClient({ locale }: CheckoutPageClientProps) {
  const t = useTranslations("checkout");
  const tCart = useTranslations("cart");
  const router = useRouter();
  const { state } = useCart();

  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart items on mount
  useEffect(() => {
    const loadCartItems = async () => {
      try {
        // Cart items should already be loaded from context
        if (state.items.length === 0) {
          // If no items in cart, redirect to cart page
          router.push(`/${locale}/cart`);
          return;
        }

        setItems(state.items);
      } catch (error) {
        console.error("Error loading cart items:", error);
        router.push(`/${locale}/cart`);
      } finally {
        setIsLoading(false);
      }
    };

    loadCartItems();
  }, [state.items, locale, router]);

  // Handle order completion
  const handleOrderComplete = (orderId: string) => {
    // Redirect to order confirmation page
    router.push(`/${locale}/orders/${orderId}/confirmation`);
  };

  // Handle back to cart
  const handleBackToCart = () => {
    router.push(`/${locale}/cart`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-neutral-600">Načítání objednávky...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="w-16 h-16 bg-neutral-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCartIcon className="w-8 h-8 text-neutral-500" />
          </div>

          <h1 className="text-2xl font-semibold text-neutral-800 mb-4">Košík je prázdný</h1>

          <p className="text-neutral-600 mb-8">
            Nemůžete pokračovat k objednávce s prázdným košíkem.
          </p>

          <Button onClick={() => router.push(`/${locale}/products`)} className="w-full">
            Pokračovat v nákupu
          </Button>
        </div>
      </div>
    );
  }

  const subtotal = items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToCart}
                className="flex items-center text-neutral-600 hover:text-neutral-800 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Zpět do košíku
              </button>
            </div>
            <h1 className="text-xl font-semibold text-neutral-800">{t("title")}</h1>
            <div className="w-24" /> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-soft p-6 lg:p-8">
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
                />
              </div>

              {/* Desktop: Full Summary */}
              <div className="hidden lg:block">
                <div className="bg-white rounded-lg shadow-soft p-6">
                  <h2 className="text-lg font-semibold text-neutral-800 mb-4">
                    Shrnutí objednávky
                  </h2>

                  <div className="space-y-4">
                    {items.map((item) => {
                      const product = item.product;
                      if (!product) return null;

                      const productName = locale === "cs" ? product.name.cs : product.name.en;

                      return (
                        <div
                          key={item.id}
                          className="flex items-start space-x-3 pb-4 border-b border-neutral-100 last:border-b-0 last:pb-0"
                        >
                          <div className="flex-shrink-0 w-12 h-12 bg-neutral-100 rounded-lg" />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-neutral-900 truncate">
                              {productName}
                            </h4>
                            <p className="text-xs text-neutral-600">
                              {tCart("quantity")}: {item.quantity}
                            </p>
                            <p className="text-sm font-medium text-neutral-900 mt-1">
                              {(item.totalPrice || 0).toLocaleString("cs-CZ")} Kč
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6 pt-4 border-t border-neutral-200">
                    <div className="flex justify-between items-center text-lg font-semibold">
                      <span>Mezisoučet:</span>
                      <span>{subtotal.toLocaleString("cs-CZ")} Kč</span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      Cena dopravy bude vypočítana na základě adresy
                    </p>
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
