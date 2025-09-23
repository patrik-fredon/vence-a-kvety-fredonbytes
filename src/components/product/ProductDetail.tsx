"use client";

import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { LazyProductCustomizer } from "@/components/dynamic";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useCart } from "@/lib/cart/context";
import { cn } from "@/lib/utils";
import { calculateFinalPrice } from "@/lib/utils/price-calculator";
import { validateWreathConfiguration } from "@/lib/validation/wreath";
import type { Customization, Product } from "@/types/product";
import { ProductImageGallery } from "./ProductImageGallery";
import { ProductInfo } from "./ProductInfo";
import { RibbonConfigurator } from "./RibbonConfigurator";
import { SizeSelector } from "./SizeSelector";

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
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  // Ensure customizationOptions is always an array to prevent map errors
  const customizationOptions = product.customizationOptions || [];

  // Find size option from customization options
  const sizeOption = customizationOptions.find(
    (option) => option.type === "size" || option.id === "size"
  );

  // Find ribbon-related options
  const ribbonOption = customizationOptions.find(
    (option) => option.type === "ribbon" || option.id === "ribbon"
  );
  const ribbonColorOption = customizationOptions.find(
    (option) => option.type === "ribbon_color" || option.id === "ribbon_color"
  ) || null;
  const ribbonTextOption = customizationOptions.find(
    (option) => option.type === "ribbon_text" || option.id === "ribbon_text"
  ) || null;

  // Check if ribbon is selected
  const isRibbonSelected = customizations.some(
    (customization) =>
      customization.optionId === ribbonOption?.id &&
      customization.choiceIds.length > 0
  );

  // Get non-ribbon, non-size customization options for the general customizer
  const generalCustomizationOptions = customizationOptions.filter(
    (option) =>
      option.type !== "size" &&
      option.id !== "size" &&
      option.type !== "ribbon" &&
      option.id !== "ribbon" &&
      option.type !== "ribbon_color" &&
      option.id !== "ribbon_color" &&
      option.type !== "ribbon_text" &&
      option.id !== "ribbon_text"
  );

  // Calculate price based on customizations and size
  const calculatePrice = useCallback(
    (newCustomizations: Customization[], sizeId?: string | null) => {
      const allCustomizations = [...newCustomizations];

      // Add size customization if selected
      if (sizeId && sizeOption) {
        const existingSizeIndex = allCustomizations.findIndex(c => c.optionId === sizeOption.id);
        if (existingSizeIndex >= 0) {
          allCustomizations[existingSizeIndex] = {
            optionId: sizeOption.id,
            choiceIds: [sizeId],
          };
        } else {
          allCustomizations.push({
            optionId: sizeOption.id,
            choiceIds: [sizeId],
          });
        }
      }

      return calculateFinalPrice(
        product.basePrice,
        allCustomizations,
        [] // No discounts for now
      );
    },
    [product.basePrice, sizeOption]
  );

  // Handle size selection changes
  const handleSizeChange = useCallback(
    (sizeId: string) => {
      setSelectedSize(sizeId);
      const newPrice = calculatePrice(customizations, sizeId);
      setFinalPrice(newPrice);

      // Clear validation errors and warnings when size changes
      setValidationErrors([]);
      setValidationWarnings([]);
    },
    [customizations, calculatePrice]
  );

  // Handle customization changes
  const handleCustomizationChange = useCallback(
    (newCustomizations: Customization[]) => {
      setCustomizations(newCustomizations);
      const newPrice = calculatePrice(newCustomizations, selectedSize);
      setFinalPrice(newPrice);

      // Clear validation errors and warnings when customizations change
      setValidationErrors([]);
      setValidationWarnings([]);
    },
    [calculatePrice, selectedSize]
  );

  // Enhanced validation using wreath-specific validation system
  const validateCustomizations = useCallback(() => {
    const validationResult = validateWreathConfiguration(
      customizations,
      customizationOptions,
      selectedSize,
      { locale }
    );

    // Update warnings state
    setValidationWarnings(validationResult.warnings);

    return validationResult;
  }, [customizations, customizationOptions, selectedSize, locale]);

  // Handle quantity change
  const handleQuantityChange = (newQuantity: number) => {
    const maxQuantity = product.availability.maxOrderQuantity || 10;
    const validQuantity = Math.max(1, Math.min(maxQuantity, newQuantity));
    setQuantity(validQuantity);
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    const validationResult = validateCustomizations();

    if (!validationResult.isValid) {
      setValidationErrors(validationResult.errors);
      return;
    }

    setIsAddingToCart(true);

    try {
      // Combine size and other customizations
      const allCustomizations = [...customizations];
      if (selectedSize && sizeOption) {
        allCustomizations.push({
          optionId: sizeOption.id,
          choiceIds: [selectedSize],
        });
      }

      const success = await addToCart({
        productId: product.id,
        quantity,
        customizations: allCustomizations,
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
            images={product.images || []}
            productName={product.name[locale as keyof typeof product.name]}
            customizations={customizations}
          />
        </div>

        {/* Right Column - Product Info and Actions */}
        <div className="space-y-6">
          {/* Product Basic Info */}
          <ProductInfo product={product} locale={locale} finalPrice={finalPrice} />

          {/* Size Selection */}
          {sizeOption && (
            <Card>
              <CardContent className="py-6">
                <SizeSelector
                  sizeOption={sizeOption}
                  selectedSize={selectedSize}
                  onSizeChange={handleSizeChange}
                  locale={locale}
                  basePrice={product.basePrice}
                />
              </CardContent>
            </Card>
          )}

          {/* Ribbon Selection */}
          {ribbonOption && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>{t("ribbon")}</span>
                  <span className="text-sm font-normal text-stone-500">({t("optional")})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <LazyProductCustomizer
                    product={{ ...product, customizationOptions: [ribbonOption] }}
                    locale={locale}
                    customizations={customizations}
                    onCustomizationChange={handleCustomizationChange}
                  />

                  {/* Ribbon Configuration - appears when ribbon is selected */}
                  <RibbonConfigurator
                    isVisible={isRibbonSelected}
                    colorOption={ribbonColorOption}
                    textOption={ribbonTextOption}
                    customizations={customizations}
                    onCustomizationChange={handleCustomizationChange}
                    locale={locale}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Other Customization Options */}
          {generalCustomizationOptions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>{t("customize")}</span>
                  <span className="text-sm font-normal text-stone-500">({t("optional")})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LazyProductCustomizer
                  product={{ ...product, customizationOptions: generalCustomizationOptions }}
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

          {/* Validation Warnings */}
          {validationWarnings.length > 0 && (
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-amber-600 rounded-full" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-amber-800 mb-2">
                      {t("validation.warnings")}
                    </h4>
                    <ul className="text-sm text-amber-700 space-y-1">
                      {validationWarnings.map((warning, index) => (
                        <li key={index}>• {warning}</li>
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
                      onChange={(e) => handleQuantityChange(Number.parseInt(e.target.value) || 1)}
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
