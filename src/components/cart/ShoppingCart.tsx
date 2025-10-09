"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { CartItemImage } from "@/components/cart/CartItemImage";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ConfirmModal } from "@/components/ui/Modal";
import { useCart } from "@/lib/cart/context";
import { ShoppingCartIcon } from "@/lib/icons";
import { formatPrice } from "@/lib/utils";
import type { Customization } from "@/types/product";

interface ShoppingCartProps {
  locale: string;
  showHeader?: boolean;
  className?: string;
}

export function ShoppingCart({ locale, showHeader = true, className = "" }: ShoppingCartProps) {
  const t = useTranslations("cart");
  const { state, updateQuantity, removeItem, clearAllItems } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearError, setClearError] = useState<string | null>(null);
  const [clearSuccess, setClearSuccess] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Check for delivery method validation error from URL params
  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "delivery_method_required") {
      setValidationError(t("deliveryMethodRequired"));
      // Clear the error from URL
      const newUrl = `/${locale}/cart`;
      window.history.replaceState({}, "", newUrl);
    }
  }, [searchParams, locale, t]);

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeItem(itemId);
    } else {
      await updateQuantity(itemId, newQuantity);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    await removeItem(itemId);
  };

  const handleProceedToCheckout = () => {
    // Check if delivery method is selected (Requirement 2.7, 7.4)
    const hasDeliveryMethod = state.items.some((item) =>
      item.customizations?.some((c) => c.optionId === "delivery_method")
    );

    if (!hasDeliveryMethod) {
      // Set error message if delivery method is missing
      router.push(`/${locale}/cart?error=delivery_method_required`);
      return;
    }

    router.push(`/${locale}/checkout`);
  };

  const handleClearCart = async () => {
    setClearError(null);

    const success = await clearAllItems();

    if (success) {
      setShowClearConfirm(false);
      setClearSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => {
        setClearSuccess(false);
      }, 3000);
    } else {
      setClearError(state.error || t("clearCartError"));
    }
  };

  // Helper function to get delivery method from customizations
  const getDeliveryMethod = (customizations?: Customization[]) => {
    if (!customizations) return null;
    const deliveryCustomization = customizations.find((c) => c.optionId === "delivery_method");
    if (!deliveryCustomization?.choiceIds?.[0]) return null;
    return deliveryCustomization.choiceIds[0];
  };

  // Helper function to format customization display
  const formatCustomizationDisplay = (customization: Customization, product?: any) => {
    if (!product?.customizationOptions) return null;

    const option = product.customizationOptions.find(
      (opt: any) => opt.id === customization.optionId
    );
    if (!option) return null;

    const optionName =
      option.name?.[locale as keyof typeof option.name] ||
      option.name?.en ||
      option.name?.cs ||
      "Option";

    // Handle different customization types
    if (customization.customValue) {
      // Custom text input (like ribbon text)
      return `${optionName}: ${customization.customValue}`;
    }

    if (customization.choiceIds && customization.choiceIds.length > 0) {
      const selectedChoices = customization.choiceIds
        .map((choiceId) => {
          const choice = option.choices?.find((c: any) => c.id === choiceId);
          return choice
            ? choice.label?.[locale as keyof typeof choice.label] ||
                choice.label?.en ||
                choice.label?.cs
            : null;
        })
        .filter(Boolean);

      if (selectedChoices.length > 0) {
        return `${optionName}: ${selectedChoices.join(", ")}`;
      }
    }

    return null;
  };

  if (state.isLoading && state.items.length === 0) {
    return (
      <Card className={className} variant="default">
        <CardContent className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </CardContent>
      </Card>
    );
  }

  if (state.items.length === 0) {
    return (
      <Card className={className} variant="default">
        <CardContent className="text-center py-16">
          <div className="w-16 h-16 bg-teal-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCartIcon className="w-8 h-8 text-amber-200" />
          </div>

          <h2 className="text-2xl font-light text-amber-200 mb-4">{t("empty")}</h2>

          <p className="text-amber-100/50 mb-8">{t("emptyDescription")}</p>

          <Button
            variant="default"
            className="bg-funeral-gold hover:bg-funeral-teal hover:text-funeral-gold text-teal-800"
            onClick={() => router.push(`/${locale}/products`)}
          >
            {t("continueShopping")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const subtotal = state.items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

  // Check if all items have delivery method selected
  const hasDeliveryMethod = state.items.every((item) =>
    item.customizations?.some((c) => c.optionId === "delivery_method")
  );

  return (
    <Card className={className} variant="default">
      {showHeader && (
        <CardHeader>
          <CardTitle className="text-2xl font-light text-amber-200">{t("title")}</CardTitle>
          <p className="text-amber-100/50 mt-1">
            {itemCount} {itemCount === 1 ? t("item") : t("items")}
          </p>
        </CardHeader>
      )}

      <CardContent>
        {/* Cart Items */}
        <div className="space-y-6">
          {state.items.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-4 p-4 border border-amber-200 rounded-lg"
            >
              {/* Product Image */}
              <CartItemImage item={item} locale={locale} size="md" className="flex-shrink-0" />

              {/* Product Details */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-medium text-amber-200 mb-1">
                  {item.product?.name[locale as keyof typeof item.product.name] ||
                    item.product?.name.cs ||
                    "Product"}
                </h3>

                {/* Delivery Method Badge */}
                {(() => {
                  const deliveryMethod = getDeliveryMethod(item.customizations);
                  const productSlug = item.product?.slug;
                  
                  if (deliveryMethod === "delivery_address") {
                    return (
                      <div className="flex items-center gap-2 mb-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-900/30 border border-amber-400 rounded-full">
                          <svg
                            className="w-4 h-4 text-amber-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                            />
                          </svg>
                          <span className="text-sm font-medium text-amber-400">
                            {t("freeDeliveryRibbon")}
                          </span>
                        </div>
                        {productSlug && (
                          <button
                            onClick={() => router.push(`/${locale}/products/${productSlug}`)}
                            className="text-xs text-amber-200 hover:text-amber-400 underline"
                            title={t("changeDeliveryMethod")}
                          >
                            {t("changeDeliveryMethod")}
                          </button>
                        )}
                      </div>
                    );
                  } else if (deliveryMethod === "personal_pickup") {
                    return (
                      <div className="flex items-center gap-2 mb-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-900/30 border border-amber-200 rounded-full">
                          <svg
                            className="w-4 h-4 text-amber-200"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          <span className="text-sm font-medium text-amber-200">
                            {t("personalPickup")}
                          </span>
                        </div>
                        {productSlug && (
                          <button
                            onClick={() => router.push(`/${locale}/products/${productSlug}`)}
                            className="text-xs text-amber-200 hover:text-amber-400 underline"
                            title={t("changeDeliveryMethod")}
                          >
                            {t("changeDeliveryMethod")}
                          </button>
                        )}
                      </div>
                    );
                  } else {
                    // No delivery method selected - show warning
                    return (
                      <div className="flex items-center gap-2 mb-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-900/30 border border-red-400 rounded-full">
                          <svg
                            className="w-4 h-4 text-red-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                          </svg>
                          <span className="text-sm font-medium text-red-400">
                            {t("deliveryMethodMissing")}
                          </span>
                        </div>
                        {productSlug && (
                          <button
                            onClick={() => router.push(`/${locale}/products/${productSlug}`)}
                            className="text-xs text-amber-200 hover:text-amber-400 underline"
                          >
                            {t("changeDeliveryMethod")}
                          </button>
                        )}
                      </div>
                    );
                  }
                })()}

                {/* Customizations */}
                {item.customizations && item.customizations.length > 0 && (
                  <div className="space-y-1 mb-2">
                    {item.customizations
                      .filter((c) => c.optionId !== "delivery_method") // Don't show delivery method in customizations list
                      .map((customization, index) => {
                        const display = formatCustomizationDisplay(customization, item.product);
                        return display ? (
                          <p key={index} className="text-sm text-amber-100">
                            {display}
                          </p>
                        ) : null;
                      })}
                  </div>
                )}

                {/* Quantity Controls */}
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      disabled={state.isLoading}
                      className="w-8 h-8 p-0"
                    >
                      -
                    </Button>
                    <span className="w-8 text-center text-amber-100 font-medium">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      disabled={state.isLoading}
                      className="w-8 h-8 p-0"
                    >
                      +
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveItem(item.id)}
                    disabled={state.isLoading}
                    className="text-red-600 hover:text-red-700 hover:bg-amber-100"
                  >
                    {t("remove")}
                  </Button>
                </div>
              </div>

              {/* Price */}
              <div className="flex-shrink-0 text-right">
                <p className="text-lg font-semibold text-amber-200">
                  {formatPrice(item.totalPrice || 0, locale as "cs" | "en")}
                </p>
                {item.quantity > 1 && (
                  <p className="text-sm text-amber-100">
                    {formatPrice((item.totalPrice || 0) / item.quantity, locale as "cs" | "en")}{" "}
                    {t("each")}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Error Message */}
        {state.error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{state.error}</p>
          </div>
        )}

        {/* Validation Error Message */}
        {validationError && (
          <div className="mt-6 p-4 bg-amber-50 border border-amber-400 rounded-lg">
            <p className="text-amber-900 text-sm font-medium">{validationError}</p>
          </div>
        )}
      </CardContent>

      {/* Cart Summary */}
      <CardFooter className="flex-col space-y-4">
        <div className="flex justify-between items-center w-full">
          <span className="text-lg font-medium text-amber-100">{t("subtotal")}</span>
          <span className="text-lg font-semibold text-amber-100">
            {formatPrice(subtotal, locale as "cs" | "en")}
          </span>
        </div>

        {/* Success Message */}
        {clearSuccess && (
          <div className="w-full p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm text-center">{t("clearCartSuccess")}</p>
          </div>
        )}

        <div className="flex gap-3 w-full">
          <Button
            variant="outline"
            size="lg"
            disabled={state.isLoading}
            className="flex-1"
            onClick={() => setShowClearConfirm(true)}
          >
            {t("clearCart")}
          </Button>

          <Button
            variant="default"
            size="lg"
            disabled={state.isLoading || !hasDeliveryMethod}
            className="flex-1 bg-funeral-gold hover:bg-funeral-gold text-teal-800 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleProceedToCheckout}
            title={!hasDeliveryMethod ? t("deliveryMethodRequired") : undefined}
          >
            {t("proceedToCheckout")}
          </Button>
        </div>
      </CardFooter>

      {/* Clear Cart Confirmation Modal */}
      <ConfirmModal
        isOpen={showClearConfirm}
        onClose={() => {
          setShowClearConfirm(false);
          setClearError(null);
        }}
        onConfirm={handleClearCart}
        title={t("clearCartConfirmTitle")}
        message={clearError || t("clearCartConfirmMessage")}
        confirmText={t("clearCartConfirm")}
        cancelText={t("clearCartCancel")}
        variant="destructive"
        loading={state.isLoading}
      />
    </Card>
  );
}
