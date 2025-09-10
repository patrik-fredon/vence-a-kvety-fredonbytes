'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Product, Customization } from '@/types/product';
import { calculateFinalPrice, validateCustomizations as validateCustomizationsUtil } from '@/lib/utils/price-calculator';
import { ProductImageGallery } from './ProductImageGallery';
import { ProductCustomizer } from './ProductCustomizer';
import { ProductInfo } from './ProductInfo';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface ProductDetailProps {
  product: Product;
  locale: string;
  className?: string;
}

export function ProductDetail({ product, locale, className }: ProductDetailProps) {
  const t = useTranslations('product');
  const tCurrency = useTranslations('currency');

  const [customizations, setCustomizations] = useState<Customization[]>([]);
  const [finalPrice, setFinalPrice] = useState(product.basePrice);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Calculate price based on customizations
  const calculatePrice = useCallback((newCustomizations: Customization[]) => {
    return calculateFinalPrice(product.basePrice, newCustomizations, product.customizationOptions);
  }, [product.basePrice, product.customizationOptions]);

  // Handle customization changes
  const handleCustomizationChange = useCallback((newCustomizations: Customization[]) => {
    setCustomizations(newCustomizations);
    const newPrice = calculatePrice(newCustomizations);
    setFinalPrice(newPrice);

    // Clear validation errors when customizations change
    setValidationErrors([]);
  }, [calculatePrice]);

  // Validate customizations
  const validateCustomizations = useCallback((): string[] => {
    const errors: string[] = [];

    product.customizationOptions.forEach(option => {
      const customization = customizations.find(c => c.optionId === option.id);

      if (option.required && (!customization || customization.choiceIds.length === 0)) {
        errors.push(t('validation.required', {
          option: option.name[locale as keyof typeof option.name]
        }));
      }

      if (customization) {
        if (option.minSelections && customization.choiceIds.length < option.minSelections) {
          errors.push(t('validation.minSelections', {
            option: option.name[locale as keyof typeof option.name],
            min: option.minSelections
          }));
        }

        if (option.maxSelections && customization.choiceIds.length > option.maxSelections) {
          errors.push(t('validation.maxSelections', {
            option: option.name[locale as keyof typeof option.name],
            max: option.maxSelections
          }));
        }
      }
    });

    return errors;
  }, [customizations, product.customizationOptions, locale, t]);

  // Handle add to cart
  const handleAddToCart = async () => {
    const errors = validateCustomizations();

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsAddingToCart(true);

    try {
      // TODO: Implement actual cart API call in later tasks
      console.log('Adding to cart:', {
        product: product.id,
        customizations,
        finalPrice
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Show success message (implement toast/notification in later tasks)
      alert(t('addedToCart'));

    } catch (error) {
      console.error('Error adding to cart:', error);
      alert(t('addToCartError'));
    } finally {
      setIsAddingToCart(false);
    }
  };

  const formatPrice = (price: number) => {
    return tCurrency('format', {
      amount: price.toLocaleString(locale === 'cs' ? 'cs-CZ' : 'en-US')
    });
  };

  return (
    <div className={cn('grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12', className)}>
      {/* Left Column - Image Gallery */}
      <div className="space-y-4">
        <ProductImageGallery
          images={product.images}
          productName={product.name[locale as keyof typeof product.name]}
          customizations={customizations}
        />
      </div>

      {/* Right Column - Product Info and Customization */}
      <div className="space-y-6">
        {/* Product Basic Info */}
        <ProductInfo
          product={product}
          locale={locale}
          finalPrice={finalPrice}
        />

        {/* Customization Options */}
        {product.customizationOptions.length > 0 && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-primary-800 mb-4">
              {t('customize')}
            </h3>
            <ProductCustomizer
              product={product}
              locale={locale}
              customizations={customizations}
              onCustomizationChange={handleCustomizationChange}
            />
          </div>
        )}

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-red-800 mb-2">
              {t('validation.title')}
            </h4>
            <ul className="text-sm text-red-700 space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Price and Add to Cart */}
        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-sm text-neutral-600">{t('totalPrice')}</span>
              <div className="text-2xl font-bold text-primary-700">
                {formatPrice(finalPrice)}
              </div>
              {finalPrice !== product.basePrice && (
                <div className="text-sm text-neutral-500 line-through">
                  {formatPrice(product.basePrice)}
                </div>
              )}
            </div>
          </div>

          <Button
            onClick={handleAddToCart}
            disabled={!product.availability.inStock || isAddingToCart}
            loading={isAddingToCart}
            className="w-full"
            size="lg"
          >
            {!product.availability.inStock
              ? t('outOfStock')
              : isAddingToCart
                ? t('addingToCart')
                : t('addToCart')
            }
          </Button>

          {/* Availability Info */}
          <div className="mt-3 text-sm text-neutral-600">
            {product.availability.inStock ? (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                {t('inStock')}
                {product.availability.leadTimeHours && (
                  <span className="ml-2">
                    • {t('leadTime', { hours: product.availability.leadTimeHours })}
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                {t('outOfStock')}
                {product.availability.estimatedRestockDate && (
                  <span className="ml-2">
                    • {t('restockDate', {
                      date: product.availability.estimatedRestockDate.toLocaleDateString(
                        locale === 'cs' ? 'cs-CZ' : 'en-US'
                      )
                    })}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
