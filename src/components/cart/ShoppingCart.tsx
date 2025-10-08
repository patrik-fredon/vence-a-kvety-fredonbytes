"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
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
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearError, setClearError] = useState<string | null>(null);
  const [clearSuccess, setClearSuccess] = useState(false);

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

                {/* Customizations */}
                {item.customizations && item.customizations.length > 0 && (
                  <div className="space-y-1 mb-2">
                    {item.customizations.map((customization, index) => {
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
            disabled={state.isLoading}
            className="flex-1 bg-funeral-gold hover:bg-funeral-gold text-teal-800"
            onClick={handleProceedToCheckout}
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
