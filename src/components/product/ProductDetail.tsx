"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useCallback, useState, useMemo, useRef } from "react";
import { LazyProductCustomizer } from "@/components/dynamic";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useCart } from "@/lib/cart/context";
import { cn } from "@/lib/utils";
import { useAnimationSequence } from "@/components/cart/hooks";

import {
  validateWreathConfiguration,
  WREATH_VALIDATION_MESSAGES
} from "@/lib/validation/wreath";
import { usePriceCalculationWithSize } from "@/lib/utils/usePriceCalculation";
import type { Customization, Product } from "@/types/product";

import { ProductImageGallery } from "./ProductImageGallery";
import { ProductInfo } from "./ProductInfo";
import { PriceBreakdown } from "./PriceBreakdown";
import { LazyRibbonConfigurator } from "./LazyRibbonConfigurator";
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
  const { startProductToCartAnimation } = useAnimationSequence();

  const [customizations, setCustomizations] = useState<Customization[]>([]);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);

  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  // Refs for animation
  const productImageRef = useRef<HTMLDivElement>(null);
  const addToCartButtonRef = useRef<HTMLButtonElement>(null);

  // Ensure customizationOptions is always an array to prevent map errors
  const customizationOptions = useMemo(() => product.customizationOptions || [], [product.customizationOptions]);

  // Find size option from customization options
  const sizeOption = useMemo(() =>
    customizationOptions.find(
      (option) => option.type === "size" || option.id === "size"
    ), [customizationOptions]
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
  const ribbonOption = useMemo(() =>
    customizationOptions.find(
      (option) => option.type === "ribbon" || option.id === "ribbon"
    ), [customizationOptions]
  );

  const ribbonColorOption = useMemo(() =>
    customizationOptions.find(
      (option) => option.type === "ribbon_color" || option.id === "ribbon_color"
    ) || null, [customizationOptions]
  );

  const ribbonTextOption = useMemo(() =>
    customizationOptions.find(
      (option) => option.type === "ribbon_text" || option.id === "ribbon_text"
    ) || null, [customizationOptions]
  );

  // FIXED: Check if ribbon is selected - specifically check for "ribbon_yes" choice
  const isRibbonSelected = useMemo(() => {
    const ribbonCustomization = customizations.find(
      (customization) => customization.optionId === ribbonOption?.id
    );

    // Only return true if "ribbon_yes" is specifically selected
    return ribbonCustomization?.choiceIds.includes("ribbon_yes") || false;
  }, [customizations, ribbonOption?.id]);

  // Get non-ribbon, non-size customization options for the general customizer
  const generalCustomizationOptions = useMemo(() =>
    customizationOptions.filter(
      (option) =>
        option.type !== "size" &&
        option.id !== "size" &&
        option.type !== "ribbon" &&
        option.id !== "ribbon" &&
        option.type !== "ribbon_color" &&
        option.id !== "ribbon_color" &&
        option.type !== "ribbon_text" &&
        option.id !== "ribbon_text"
    ), [customizationOptions]
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
  }, [customizations, customizationOptions, selectedSize, locale]);

  // Handle error recovery with graceful fallbacks
  const handleErrorRecovery = useCallback((errorType: string) => {
    // Clear current errors
    setValidationErrors([]);
    setValidationWarnings([]);

    // Apply recovery strategies based on error type
    if (errorType === 'size' && sizeOption?.choices && sizeOption.choices.length > 0) {
      // Auto-select first available size with proper null checking
      const firstChoice = sizeOption.choices[0];
      if (firstChoice?.id) {
        setSelectedSize(firstChoice.id);
      }
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
        quantity: 1,
        customizations: allCustomizations,
      });

      if (success) {
        // Clear validation errors on successful add
        setValidationErrors([]);
        setValidationWarnings([]);

        // Trigger cart animation
        console.log('🛒 [ProductDetail] Attempting to trigger cart animation');
        if (productImageRef.current && addToCartButtonRef.current) {
          // Find the cart icon in the header
          const cartIcon = document.querySelector('[href*="/cart"]') as HTMLElement;
          console.log('🛒 [ProductDetail] Cart icon found:', !!cartIcon, cartIcon?.tagName);

          if (cartIcon) {
            // Get the product image source
            const productImage = productImageRef.current.querySelector('img');
            const imageSrc = productImage?.src || product.images?.[0]?.url || '';

            console.log('🛒 [ProductDetail] Starting animation with:', {
              productElement: productImageRef.current.tagName,
              cartIcon: cartIcon.tagName,
              imageSrc: imageSrc?.substring(0, 50) + '...'
            });

            startProductToCartAnimation(
              productImageRef.current,
              cartIcon,
              imageSrc
            );
          } else {
            console.warn('🛒 [ProductDetail] Cart icon not found in DOM');
          }
        } else {
          console.warn('🛒 [ProductDetail] Missing refs:', {
            productImageRef: !!productImageRef.current,
            addToCartButtonRef: !!addToCartButtonRef.current
          });
        }

        // Show success message (after a delay to not interfere with animation)
        setTimeout(() => {
          alert(t("addedToCart"));
        }, 1200); // After animation completes
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
  };

  const formatPrice = (price: number) => {
    return tCurrency("format", {
      amount: price.toLocaleString(locale === "cs" ? "cs-CZ" : "en-US"),
    });
  };

  const totalPrice = priceCalculation.totalPrice;

  return (
    <div className={cn("max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", className)}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left Column - Collage-Style Image Layout */}
        <div className="h-full min-h-[600px] lg:min-h-[700px]" ref={productImageRef}>
          <div className="grid grid-cols-2 grid-rows-3 gap-2 h-full">
            {/* Main large image - spans 2 rows */}
            {product.images && product.images[0] && (
              <div className="col-span-2 row-span-2 relative overflow-hidden rounded-lg bg-stone-100">
                <Image
                  src={product.images[0].url}
                  alt={product.images[0].alt || product.name[locale as keyof typeof product.name]}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              </div>
            )}

            {/* Secondary images - smaller grid items */}
            {product.images && product.images.slice(1, 4).map((image, index) => (
              <div key={image.id || index} className="relative overflow-hidden rounded-lg bg-stone-100 aspect-square">
                <Image
                  src={image.url}
                  alt={image.alt || product.name[locale as keyof typeof product.name]}
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover"
                />
              </div>
            ))}

            {/* If we have more than 4 images, show a "more" indicator on the last visible image */}
            {product.images && product.images.length > 4 && (
              <div className="relative overflow-hidden rounded-lg bg-stone-100 aspect-square">
                <Image
                  src={product.images[4]?.url || product.images[1]?.url || product.images[0]?.url || "/placeholder-image.jpg"}
                  alt={product.images[4]?.alt || product.name[locale as keyof typeof product.name]}
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">
                    +{product.images.length - 4}
                  </span>
                </div>
              </div>
            )}
          </div>
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

                  {/* Ribbon Configuration - FIXED: Only appears when "ribbon_yes" is specifically selected */}
                  {isRibbonSelected && (
                    <LazyRibbonConfigurator
                      isVisible={isRibbonSelected}
                      isRibbonSelected={isRibbonSelected}
                      colorOption={ribbonColorOption}
                      textOption={ribbonTextOption}
                      customizations={customizations}
                      onCustomizationChange={handleCustomizationChange}
                      locale={locale}
                    />
                  )}
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

                      {validationWarnings.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setValidationWarnings([])}
                          className="text-xs bg-white border-amber-300 text-amber-700 hover:bg-amber-50"
                        >
                          Dismiss Warnings
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Validation Warnings Display */}
          {validationWarnings.length > 0 && (
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-amber-600 rounded-full" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <h4 className="text-sm font-medium text-amber-800">
                      {t("validation.warnings")}
                    </h4>

                    <div className="space-y-2">
                      {validationWarnings.map((warning, index) => (
                        <div key={index} className="flex items-start justify-between gap-3">
                          <p className="text-sm text-amber-700 flex-1">• {warning}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Price Breakdown */}
          <Card>
            <CardContent className="py-6">
              <PriceBreakdown
                basePrice={product.basePrice}
                breakdown={priceCalculation.breakdown}
                totalPrice={priceCalculation.totalPrice}
                locale={locale}
                showDetails={true}
              />
            </CardContent>
          </Card>

          {/* Configuration Summary and Proceed Button */}
          <Card>
            <CardContent className="py-6 space-y-4">
              <div className="text-center">
                <div className="text-sm text-stone-600 mb-2">{t("totalPrice")}</div>
                <div className="text-3xl font-bold text-stone-900">
                  {formatPrice(priceCalculation.totalPrice)}
                </div>
              </div>

              <Button
                ref={addToCartButtonRef}
                onClick={handleAddToCart}
                disabled={isAddingToCart || !selectedSize}
                className="w-full"
                size="lg"
              >
                {isAddingToCart ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    {t("addingToCart")}
                  </>
                ) : (
                  "Proceed to Configuration"
                )}
              </Button>

              {!selectedSize && (
                <p className="text-sm text-red-600 text-center">
                  {t("selectSizeFirst")}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
