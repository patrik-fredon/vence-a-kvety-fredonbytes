"use client";

import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { LazyProductCustomizer } from "@/components/dynamic";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useCart } from "@/lib/cart/context";
import { cn } from "@/lib/utils";

import {
  validateWreathConfiguration,
  WREATH_VALIDATION_MESSAGES
} from "@/lib/validation/wreath";
import { usePriceCalculationWithSize } from "@/lib/utils/usePriceCalculation";
import type { Customization, Product } from "@/types/product";

import { ProductImageGallery } from "./ProductImageGallery";
import { ProductInfo } from "./ProductInfo";
import { PriceBreakdown } from "./PriceBreakdown";
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

  // Real-time price calculation with size and customizations
  const priceCalculation = usePriceCalculationWithSize(
    product.basePrice,
    customizations,
    customizationOptions,
    selectedSize,
    sizeOption
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



  // Handle size selection changes
  const handleSizeChange = useCallback(
    (sizeId: string) => {
      setSelectedSize(sizeId);
      // Price calculation is now automatic via usePriceCalculationWithSize hook

      // Clear validation errors and warnings when size changes
      setValidationErrors([]);
      setValidationWarnings([]);
    },
    []
  );

  // Handle customization changes
  const handleCustomizationChange = useCallback(
    (newCustomizations: Customization[]) => {
      setCustomizations(newCustomizations);
      // Price calculation is now automatic via usePriceCalculationWithSize hook

      // Clear validation errors and warnings when customizations change
      setValidationErrors([]);
      setValidationWarnings([]);
    },
    []
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
  }, [customizations, customizationOptions, selectedSize, locale]);;;;
  // Handle error recovery with graceful fallbacks
  const handleErrorRecovery = useCallback((errorType: string) => {
    // Clear current errors
    setValidationErrors([]);
    setValidationWarnings([]);
    
    // Apply recovery strategies based on error type
    if (errorType === 'size' && sizeOption?.choices && sizeOption.choices.length > 0) {
      // Auto-select first available size
      setSelectedSize(sizeOption.choices[0].id);
    } else if (errorType === 'ribbon') {
      // Remove all ribbon-related customizations
      setCustomizations(prev => prev.filter(c => !c.optionId.includes('ribbon')));
    }
    
    // Re-validate after recovery
    setTimeout(() => {
      validateCustomizations();
    }, 100);
  }, [sizeOption, validateCustomizations]);;

  // Retry validation
  const handleRetryValidation = useCallback(() => {
    setValidationErrors([]);
    setValidationWarnings([]);
    validateCustomizations();
  }, [validateCustomizations]);

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
        // Clear validation errors on successful add
        setValidationErrors([]);
        setValidationWarnings([]);
        
        // Show success message
        alert(t("addedToCart"));
      } else {
        console.error("❌ [ProductDetail] Failed to add product to cart:", product.id);
        
        // Show user-friendly error message with recovery option
        const messages = WREATH_VALIDATION_MESSAGES[locale as keyof typeof WREATH_VALIDATION_MESSAGES];
        const errorMessage = String(messages.systemError || t("addToCartError"));
        
        if (confirm(`${errorMessage}\n\n${messages.tryAgain}?`)) {
          handleRetryValidation();
        }
      }
    } catch (error) {
      console.error("💥 [ProductDetail] Error adding to cart:", error);
      
      // Handle different types of errors gracefully
      const messages = WREATH_VALIDATION_MESSAGES[locale as keyof typeof WREATH_VALIDATION_MESSAGES];
      let errorMessage = String(messages.systemError || t("addToCartError"));
      
      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('connection')) {
          errorMessage = String(messages.networkError);
        } else if (error.message.includes('session')) {
          errorMessage = String(messages.sessionExpired);
        }
      }
      
      // Show error with recovery options
      if (confirm(`${errorMessage}\n\n${messages.tryAgain}?`)) {
        handleRetryValidation();
      }
    } finally {
      setIsAddingToCart(false);
    }
  };;;;

  const formatPrice = (price: number) => {
    return tCurrency("format", {
      amount: price.toLocaleString(locale === "cs" ? "cs-CZ" : "en-US"),
    });
  };

  const totalPrice = priceCalculation.totalPrice * quantity;

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
          <ProductInfo product={product} locale={locale} finalPrice={priceCalculation.totalPrice} />

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

          {/* Enhanced Validation Error Display */}
          {validationErrors.length > 0 && (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-red-600 rounded-full" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <h4 className="text-sm font-medium text-red-800">
                      {t("validation.title")}
                    </h4>

                    <div className="space-y-2">
                      {validationErrors.map((error, index) => (
                        <div key={index} className="flex items-start justify-between gap-3">
                          <p className="text-sm text-red-700 flex-1">• {error}</p>
                        </div>
                      ))}
                    </div>

                    {/* Recovery Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t border-red-200">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRetryValidation}
                        className="text-xs bg-white border-red-300 text-red-700 hover:bg-red-50"
                      >
                        {WREATH_VALIDATION_MESSAGES[locale as keyof typeof WREATH_VALIDATION_MESSAGES].tryAgain}
                      </Button>

                      {validationErrors.some(error => error.includes('velikost') || error.includes('size')) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleErrorRecovery('size')}
                          className="text-xs bg-white border-red-300 text-red-700 hover:bg-red-50"
                        >
                          Auto-select Size
                        </Button>
                      )}

                      {validationErrors.some(error => error.includes('stuhy') || error.includes('ribbon')) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleErrorRecovery('ribbon')}
                          className="text-xs bg-white border-red-300 text-red-700 hover:bg-red-50"
                        >
                          Remove Ribbon
                        </Button>
                      )}
                    </div>
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

                {/* Price Breakdown */}
                <div className="border-t border-stone-200 pt-4">
                  <PriceBreakdown
                    basePrice={product.basePrice}
                    breakdown={priceCalculation.breakdown}
                    totalPrice={priceCalculation.totalPrice}
                    locale={locale}
                    showDetails={priceCalculation.breakdown.length > 0}
                  />

                  {/* Quantity Total */}
                  {quantity > 1 && (
                    <div className="mt-4 pt-4 border-t border-stone-200">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-medium text-stone-900">
                          {t("totalPrice")} × {quantity}
                        </span>
                        <span className="text-2xl font-semibold text-amber-700">
                          {formatPrice(totalPrice)}
                        </span>
                      </div>
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
