"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Product, Customization } from "@/types/product";
import {
  calculateFinalPrice,
} from "@/lib/utils/price-calculator";
import { ProductImageGallery } from "./ProductImageGallery";
import { LazyProductCustomizer } from "@/components/dynamic";
import { ProductInfo } from "./ProductInfo";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart/context";

interface ProductDetailProps {
  product: Product;
  locale: string;
  className?: string;
}

export function ProductDetail({ product, locale, className }: ProductDetailProps) {
  const t = useTranslations("product");
  const tCurrency = useTranslations("currency");
  const { addToCart } = useCart();

  const [customizations, setCustomizations] = useState<Customization[]>([]);
  const [finalPrice, setFinalPrice] = useState(product.basePrice);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);

  // Calculate price based on customizations
  const calculatePrice = useCallback(
    (newCustomizations: Customization[]) => {
      return calculateFinalPrice(
        product.basePrice,
        newCustomizations,
        [] // No discounts for now
      );
    },
    [product.basePrice]
  );

  // Handle customization changes
  const handleCustomizationChange = useCallback(
    (newCustomizations: Customization[]) => {
      setCustomizations(newCustomizations);
      const newPrice = calculatePrice(newCustomizations);
      setFinalPrice(newPrice);

      // Clear validation errors when customizations change
      setValidationErrors([]);
    },
    [calculatePrice]
  );

  // Validate customizations
  const validateCustomizations = useCallback((): string[] => {
    const errors: string[] = [];

    product.customizationOptions.forEach((option) => {
      const customization = customizations.find((c) => c.optionId === option.id);

      if (option.required && (!customization || customization.choiceIds.length === 0)) {
        errors.push(
          t("validation.required", {
            option: option.name[locale as keyof typeof option.name],
          })
        );
      }

      if (customization) {
        if (option.minSelections && customization.choiceIds.length < option.minSelections) {
          errors.push(
            t("validation.minSelections", {
              option: option.name[locale as keyof typeof option.name],
              min: option.minSelections,
            })
          );
        }

        if (option.maxSelections && customization.choiceIds.length > option.maxSelections) {
          errors.push(
            t("validation.maxSelections", {
              option: option.name[locale as keyof typeof option.name],
              max: option.maxSelections,
            })
          );
        }
      }
    });

    return errors;
  }, [customizations, product.customizationOptions, locale, t]);

  // Handle quantity change
  const handleQuantityChange = (newQuantity: number) => {
    const maxQuantity = product.availability.maxOrderQuantity || 10;
    const validQuantity = Math.max(1, Math.min(maxQuantity, newQuantity));
    setQuantity(validQuantity);
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    const errors = validateCustomizations();

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsAddingToCart(true);

    try {


      const success = await addToCart({
        productId: product.id,
        quantity,
        customizations,
      });

      if (success) {

        // Show success message (implement toast/notification in later tasks)
        alert(t("addedToCart"));
      } else {
        console.error("❌ [ProductDetail] Failed to add product to cart:", product.id);
        alert(t("addToCartError"));
      }
    } catch (error) {
      console.error("💥 [ProductDetail] Error adding to cart:", error);
      alert(t("addToCartError"));
    } finally {
      setIsAddingToCart(false);
    }
  };

  const formatPrice = (price: number) => {
    return tCurrency("format", {
      amount: price.toLocaleString(locale === "cs" ? "cs-CZ" : "en-US"),
    });
  };

  const totalPrice = finalPrice * quantity;

  return (
    <div className={cn("max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", className)}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left Column - Image Gallery */}
        <div className="space-y-6">
          <ProductImageGallery
            images={product.images}
            productName={product.name[locale as keyof typeof product.name]}
            customizations={customizations}
          />
        </div>

        {/* Right Column - Product Info and Actions */}
        <div className="space-y-6">
          {/* Product Basic Info */}
          <ProductInfo product={product} locale={locale} finalPrice={finalPrice} />

          {/* Customization Options */}
          {product.customizationOptions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>{t("customize")}</span>
                  <span className="text-sm font-normal text-stone-500">
                    ({t("optional")})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LazyProductCustomizer
                  product={product}
                  locale={locale}
                  customizations={customizations}
                  onCustomizationChange={handleCustomizationChange}
                />
              </CardContent>
            </Card>
          )}

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-red-600 rounded-full" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-red-800 mb-2">
                      {t("validation.title")}
                    </h4>
                    <ul className="text-sm text-red-700 space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quantity and Add to Cart */}
          <Card className="bg-stone-50">
            <CardContent className="py-6">
              <div className="space-y-6">
                {/* Quantity Selector */}
                <div className="flex items-center justify-between">
                  <label htmlFor="quantity" className="text-sm font-medium text-stone-700">
                    {t("quantity")}
                  </label>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      aria-label={t("decreaseQuantity")}
                    >
                      <span className="text-lg">−</span>
                    </Button>
                    <input
                      id="quantity"
                      type="number"
                      min="1"
                      max={product.availability.maxOrderQuantity || 10}
                      value={quantity}
                      onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                      className="w-16 text-center border border-stone-300 rounded-md py-2 text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= (product.availability.maxOrderQuantity || 10)}
                      aria-label={t("increaseQuantity")}
                    >
                      <span className="text-lg">+</span>
                    </Button>
                  </div>
                </div>

                {/* Price Summary */}
                <div className="border-t border-stone-200 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-stone-600">
                      {t("unitPrice")} × {quantity}
                    </span>
                    <span className="text-sm text-stone-900">
                      {formatPrice(finalPrice)} × {quantity}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium text-stone-900">{t("totalPrice")}</span>
                    <span className="text-2xl font-semibold text-amber-700">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                  {totalPrice !== product.basePrice * quantity && (
                    <div className="text-sm text-stone-500 line-through mt-1 text-right">
                      {formatPrice(product.basePrice * quantity)}
                    </div>
                  )}
                </div>

                {/* Add to Cart Button */}
                <Button
                  onClick={handleAddToCart}
                  disabled={!product.availability.inStock || isAddingToCart}
                  loading={isAddingToCart}
                  className="w-full"
                  size="lg"
                  variant={product.availability.inStock ? "default" : "secondary"}
                >
                  {!product.availability.inStock
                    ? t("outOfStock")
                    : isAddingToCart
                      ? t("addingToCart")
                      : t("addToCart")}
                </Button>

                {/* Additional Info */}
                <div className="text-xs text-stone-500 text-center space-y-1">
                  <div>{t("secureCheckout")}</div>
                  {product.availability.inStock && (
                    <div>{t("freeShippingOver", { amount: "2000" })}</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
