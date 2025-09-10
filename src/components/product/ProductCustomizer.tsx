'use client';

import { useState, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Product, Customization, CustomizationOption, CustomizationChoice } from '@/types/product';
import { formatPrice } from '@/lib/utils/price-calculator';
import { cn } from '@/lib/utils';
import { CheckIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

interface ProductCustomizerProps {
  product: Product;
  locale: string;
  customizations: Customization[];
  onCustomizationChange: (customizations: Customization[]) => void;
  className?: string;
}

export function ProductCustomizer({
  product,
  locale,
  customizations,
  onCustomizationChange,
  className
}: ProductCustomizerProps) {
  const t = useTranslations('product');
  const tCurrency = useTranslations('currency');

  const formatPriceModifier = (price: number) => {
    return formatPrice(price, locale as 'cs' | 'en', true);
  };

  // Handle choice selection for an option
  const handleChoiceSelection = useCallback((
    optionId: string,
    choiceId: string,
    option: CustomizationOption
  ) => {
    const newCustomizations = [...customizations];
    const existingIndex = newCustomizations.findIndex(c => c.optionId === optionId);

    if (existingIndex >= 0) {
      const existing = newCustomizations[existingIndex]!; // Safe because existingIndex >= 0

      if (option.maxSelections === 1) {
        // Single selection - replace
        existing.choiceIds = [choiceId];
      } else {
        // Multiple selection - toggle
        if (existing.choiceIds.includes(choiceId)) {
          existing.choiceIds = existing.choiceIds.filter(id => id !== choiceId);
        } else {
          // Check max selections limit
          if (!option.maxSelections || existing.choiceIds.length < option.maxSelections) {
            existing.choiceIds.push(choiceId);
          }
        }
      }

      // Remove customization if no choices selected
      if (existing.choiceIds.length === 0) {
        newCustomizations.splice(existingIndex, 1);
      }
    } else {
      // Create new customization
      newCustomizations.push({
        optionId,
        choiceIds: [choiceId],
        customValue: undefined
      });
    }

    onCustomizationChange(newCustomizations);
  }, [customizations, onCustomizationChange]);

  // Handle custom text input (for messages)
  const handleCustomValueChange = useCallback((
    optionId: string,
    value: string
  ) => {
    const newCustomizations = [...customizations];
    const existingIndex = newCustomizations.findIndex(c => c.optionId === optionId);

    if (existingIndex >= 0 && newCustomizations[existingIndex]) {
      newCustomizations[existingIndex].customValue = value;
    } else {
      newCustomizations.push({
        optionId,
        choiceIds: [],
        customValue: value
      });
    }

    onCustomizationChange(newCustomizations);
  }, [customizations, onCustomizationChange]);

  // Get current customization for an option
  const getCurrentCustomization = (optionId: string): Customization | undefined => {
    return customizations.find(c => c.optionId === optionId);
  };

  // Check if a choice is selected
  const isChoiceSelected = (optionId: string, choiceId: string): boolean => {
    const customization = getCurrentCustomization(optionId);
    return customization?.choiceIds.includes(choiceId) || false;
  };

  // Check if choice selection is disabled
  const isChoiceDisabled = (option: CustomizationOption, choice: CustomizationChoice): boolean => {
    if (!choice.available) return true;

    const customization = getCurrentCustomization(option.id);
    if (!customization) return false;

    // If max selections reached and this choice is not selected
    if (option.maxSelections &&
        customization.choiceIds.length >= option.maxSelections &&
        !customization.choiceIds.includes(choice.id)) {
      return true;
    }

    return false;
  };

  // Render choice option based on type
  const renderChoice = (option: CustomizationOption, choice: CustomizationChoice) => {
    const isSelected = isChoiceSelected(option.id, choice.id);
    const isDisabled = isChoiceDisabled(option, choice);
    const label = choice.label[locale as keyof typeof choice.label];

    const baseClasses = cn(
      'relative flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all',
      'hover:border-primary-300 focus-within:ring-2 focus-within:ring-primary-200',
      isSelected
        ? 'border-primary-500 bg-primary-50'
        : 'border-neutral-200 bg-white',
      isDisabled && 'opacity-50 cursor-not-allowed'
    );

    return (
      <div
        key={choice.id}
        className={baseClasses}
        onClick={() => !isDisabled && handleChoiceSelection(option.id, choice.id, option)}
      >
        {/* Selection Indicator */}
        <div className={cn(
          'flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center',
          isSelected
            ? 'border-primary-500 bg-primary-500'
            : 'border-neutral-300'
        )}>
          {isSelected && <CheckIcon className="w-3 h-3 text-white" />}
        </div>

        {/* Choice Image (if available) */}
        {choice.imageUrl && (
          <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-neutral-100">
            <Image
              src={choice.imageUrl}
              alt={label}
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Choice Info */}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-neutral-900">{label}</div>
          {choice.priceModifier !== 0 && (
            <div className={cn(
              'text-sm',
              choice.priceModifier > 0 ? 'text-primary-600' : 'text-green-600'
            )}>
              {formatPriceModifier(choice.priceModifier)}
            </div>
          )}
        </div>

        {/* Unavailable indicator */}
        {!choice.available && (
          <div className="text-xs text-red-600 font-medium">
            {t('unavailable')}
          </div>
        )}
      </div>
    );
  };

  // Render text input for custom messages
  const renderTextInput = (option: CustomizationOption) => {
    const customization = getCurrentCustomization(option.id);
    const value = customization?.customValue || '';

    return (
      <div className="space-y-2">
        <textarea
          value={value}
          onChange={(e) => handleCustomValueChange(option.id, e.target.value)}
          placeholder={t('messagePlaceholder')}
          className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-primary-500 resize-none"
          rows={3}
          maxLength={200}
        />
        <div className="flex justify-between text-xs text-neutral-500">
          <span>{t('messageHelp')}</span>
          <span>{value.length}/200</span>
        </div>
      </div>
    );
  };

  if (product.customizationOptions.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-6', className)}>
      {product.customizationOptions.map((option) => {
        const currentCustomization = getCurrentCustomization(option.id);
        const selectionCount = currentCustomization?.choiceIds.length || 0;

        return (
          <div key={option.id} className="space-y-3">
            {/* Option Header */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-neutral-900">
                  {option.name[locale as keyof typeof option.name]}
                  {option.required && <span className="text-red-500 ml-1">*</span>}
                </h4>
                {option.description && (
                  <p className="text-sm text-neutral-600 mt-1">
                    {option.description[locale as keyof typeof option.description]}
                  </p>
                )}
              </div>

              {/* Selection Counter */}
              {option.maxSelections && option.maxSelections > 1 && (
                <div className="text-sm text-neutral-500">
                  {selectionCount}/{option.maxSelections}
                </div>
              )}
            </div>

            {/* Option Choices */}
            {option.type === 'message' ? (
              renderTextInput(option)
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {option.choices.map((choice) => renderChoice(option, choice))}
              </div>
            )}

            {/* Validation Messages */}
            {option.required && selectionCount === 0 && (
              <div className="text-sm text-red-600">
                {t('validation.required', {
                  option: option.name[locale as keyof typeof option.name]
                })}
              </div>
            )}

            {option.minSelections && selectionCount < option.minSelections && (
              <div className="text-sm text-orange-600">
                {t('validation.minSelections', {
                  option: option.name[locale as keyof typeof option.name],
                  min: option.minSelections,
                  current: selectionCount
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
