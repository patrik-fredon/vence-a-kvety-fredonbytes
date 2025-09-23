"use client";

import { ShoppingCartIcon, TrashIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { useTranslations } from "next-intl";
import React from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useCart } from "@/lib/cart/context";
import { formatPrice } from "@/lib/utils";
import type { CartItem } from "@/types/cart";
import type { Product, Customization } from "@/types/product";

interface ShoppingCartProps {
  locale: string;
  showHeader?: boolean;
  className?: string;
}

export function ShoppingCart({ locale, showHeader = true, className = "" }: ShoppingCartProps) {
  const t = useTranslations("cart");
  const { state, updateQuantity, removeItem } = useCart();

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

  // Helper function to format customization display
  const formatCustomizationDisplay = (customization: Customization, product?: Product) => {
    if (!product?.customizationOptions) return null;

    const option = product.customizationOptions.find(opt => opt.id === customization.optionId);
    if (!option) return null;

    const optionName = option.name[locale] || option.name.en || option.name.cs;

    // Handle different customization types
    if (customization.customValue) {
      // Custom text input (like ribbon text)
      return `${optionName}: ${customization.customValue}`;
    }

    if (customization.choiceIds && customization.choiceIds.length > 0) {
      const selectedChoices = customization.choiceIds
        .map(choiceId => {
          const choice = option.choices.find(c => c.id === choiceId);
          return choice ? (choice.label[locale] || choice.label.en || choice.label.cs) : null;
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
          <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCartIcon className="w-8 h-8 text-teal-900" />
          </div>

          <h2 className="text-2xl font-light text-stone-900 mb-4">{t("empty")}</h2>

          <p className="text-stone-600 mb-8">{t("emptyDescription")}</p>

          <Button variant="default" className="bg-teal-900 hover:bg-amber-700">
            <a href={`/${locale}/products`}>{t("continueShopping")}</a>
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
          <CardTitle className="text-2xl font-light text-stone-900">{t("title")}</CardTitle>
          <p className="text-stone-600 mt-1">
            {itemCount} {itemCount === 1 ? t("item") : t("items")}
          </p>
        </CardHeader>
      )}

      <CardContent>
        {/* Cart Items */}
        <div className="space-y-6">
          {state.items.map((item) => (
            <CartItemRow
              key={item.id}
              item={item}
              locale={locale}
              onQuantityChange={handleQuantityChange}
              onRemove={handleRemoveItem}
              isUpdating={state.isLoading}
            />
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
          <span className="text-lg font-medium text-stone-900">{t("subtotal")}</span>
          <span className="text-lg font-semibold text-stone-900">
            {formatPrice(subtotal, locale as "cs" | "en")}
          </span>
        </div>

        <Button
          variant="default"
          size="lg"
          disabled={state.isLoading}
          className="w-full bg-teal-900 hover:bg-amber-700 text-white"
        >
          <a href={`/${locale}/checkout`} className="w-full">
            {t("proceedToCheckout")}
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}

// Individual cart item component
interface CartItemRowProps {
  item: CartItem;
  locale: string;
  onQuantityChange: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
  isUpdating: boolean;
}

function CartItemRow({ item, locale, onQuantityChange, onRemove, isUpdating }: CartItemRowProps) {
  const t = useTranslations("cart");
  const product = item.product;

  if (!product) {
    return null;
  }

  const productName = locale === "cs" ? product.name.cs : product.name.en;
  const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];

  // Helper function to format customization display
  const formatCustomizationDisplay = (customization: Customization) => {
    if (!product?.customizationOptions) return null;

    const option = product.customizationOptions.find(opt => opt.id === customization.optionId);
    if (!option) return null;

    const optionName = option.name[locale] || option.name.en || option.name.cs;

    // Handle different customization types
    if (customization.customValue) {
      // Custom text input (like ribbon text)
      return `${optionName}: ${customization.customValue}`;
    }

    if (customization.choiceIds && customization.choiceIds.length > 0) {
      const selectedChoices = customization.choiceIds
        .map(choiceId => {
          const choice = option.choices.find(c => c.id === choiceId);
          return choice ? (choice.label[locale] || choice.label.en || choice.label.cs) : null;
        })
        .filter(Boolean);

      if (selectedChoices.length > 0) {
        return `${optionName}: ${selectedChoices.join(", ")}`;
      }
    }

    return null;
  };

  return (
    <div className="flex items-start space-x-4 p-4 border border-stone-200 rounded-lg bg-stone-50/50">
      {/* Product Image */}
      <div className="flex-shrink-0 w-20 h-20 bg-white rounded-lg overflow-hidden shadow-sm">
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt}
            width={80}
            height={80}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingCartIcon className="w-8 h-8 text-stone-400" />
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-medium text-stone-900 truncate">{productName}</h3>

        {/* Enhanced Customizations Display */}
        {item.customizations && item.customizations.length > 0 && (
          <div className="mt-2 space-y-1">
            {item.customizations.map((customization, index) => {
              const displayText = formatCustomizationDisplay(customization);
              if (!displayText) return null;

              return (
                <div key={index} className="text-sm text-stone-600 bg-stone-100 px-2 py-1 rounded">
                  {displayText}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-3 flex items-center justify-between">
          {/* Quantity Controls */}
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onQuantityChange(item.id, item.quantity - 1)}
              disabled={isUpdating}
              className="w-8 h-8 rounded-full"
            >
              -
            </Button>
            <span className="w-8 text-center font-medium text-stone-900">{item.quantity}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onQuantityChange(item.id, item.quantity + 1)}
              disabled={isUpdating}
              className="w-8 h-8 rounded-full"
            >
              +
            </Button>
          </div>

          {/* Price */}
          <div className="text-right">
            <div className="text-lg font-semibold text-stone-900">
              {formatPrice(item.totalPrice || 0, locale as "cs" | "en")}
            </div>
            {item.quantity > 1 && (
              <div className="text-sm text-stone-600">
                {formatPrice(item.unitPrice || 0, locale as "cs" | "en")} {t("each")}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Remove Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRemove(item.id)}
        disabled={isUpdating}
        className="flex-shrink-0 text-stone-400 hover:text-red-600"
        title={t("removeItem")}
      >
        <TrashIcon className="w-5 h-5" />
      </Button>
    </div>
  );
}
