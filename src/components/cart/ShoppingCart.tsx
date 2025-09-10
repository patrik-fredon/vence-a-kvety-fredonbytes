'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { ShoppingCartIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useCart } from '@/lib/cart/context';
import { CartItem } from '@/types/cart';
import { formatPrice } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';

interface ShoppingCartProps {
  locale: string;
  showHeader?: boolean;
  className?: string;
}

export function ShoppingCart({ locale, showHeader = true, className = '' }: ShoppingCartProps) {
  const t = useTranslations('cart');
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

  if (state.isLoading && state.items.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-soft p-8 ${className}`}>
        <div className="flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (state.items.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-soft p-12 text-center ${className}`}>
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingCartIcon className="w-8 h-8 text-primary-600" />
        </div>

        <h2 className="text-elegant text-2xl font-semibold text-primary-800 mb-4">
          {t('empty')}
        </h2>

        <p className="text-neutral-600 mb-8">
          {t('emptyDescription')}
        </p>

        <a
          href={`/${locale}/products`}
          className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
        >
          {t('continueShopping')}
        </a>
      </div>
    );
  }

  const subtotal = state.items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className={`bg-white rounded-lg shadow-soft ${className}`}>
      {showHeader && (
        <div className="p-6 border-b border-neutral-200">
          <h2 className="text-elegant text-2xl font-semibold text-primary-800">
            {t('title')}
          </h2>
          <p className="text-neutral-600 mt-1">
            {itemCount} {itemCount === 1 ? t('item') : t('items')}
          </p>
        </div>
      )}

      <div className="p-6">
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

        {/* Cart Summary */}
        <div className="mt-8 pt-6 border-t border-neutral-200">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-medium text-neutral-800">
              {t('subtotal')}
            </span>
            <span className="text-lg font-semibold text-primary-800">
              {formatPrice(subtotal, locale as 'cs' | 'en')}
            </span>
          </div>

          <a
            href={`/${locale}/checkout`}
            className={`inline-flex items-center justify-center w-full px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors ${state.isLoading ? 'opacity-50 pointer-events-none' : ''}`}
          >
            {t('proceedToCheckout')}
          </a>
        </div>

        {/* Error Message */}
        {state.error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{state.error}</p>
          </div>
        )}
      </div>
    </div>
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
  const t = useTranslations('cart');
  const product = item.product;

  if (!product) {
    return null;
  }

  const productName = locale === 'cs' ? product.name.cs : product.name.en;
  const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];

  return (
    <div className="flex items-start space-x-4">
      {/* Product Image */}
      <div className="flex-shrink-0 w-20 h-20 bg-neutral-100 rounded-lg overflow-hidden">
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
            <ShoppingCartIcon className="w-8 h-8 text-neutral-400" />
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-medium text-neutral-800 truncate">
          {productName}
        </h3>

        {/* Customizations */}
        {item.customizations && item.customizations.length > 0 && (
          <div className="mt-1 space-y-1">
            {item.customizations.map((customization, index) => (
              <div key={index} className="text-sm text-neutral-600">
                {/* Display customization details */}
                {customization.customValue && (
                  <span>{t('customMessage')}: {customization.customValue}</span>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-2 flex items-center justify-between">
          {/* Quantity Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onQuantityChange(item.id, item.quantity - 1)}
              disabled={isUpdating}
              className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center hover:bg-neutral-50 disabled:opacity-50"
            >
              -
            </button>
            <span className="w-8 text-center font-medium">{item.quantity}</span>
            <button
              onClick={() => onQuantityChange(item.id, item.quantity + 1)}
              disabled={isUpdating}
              className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center hover:bg-neutral-50 disabled:opacity-50"
            >
              +
            </button>
          </div>

          {/* Price */}
          <div className="text-right">
            <div className="text-lg font-semibold text-primary-800">
              {formatPrice(item.totalPrice || 0, locale as 'cs' | 'en')}
            </div>
            {item.quantity > 1 && (
              <div className="text-sm text-neutral-600">
                {formatPrice(item.unitPrice || 0, locale as 'cs' | 'en')} {t('each')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Remove Button */}
      <button
        onClick={() => onRemove(item.id)}
        disabled={isUpdating}
        className="flex-shrink-0 p-2 text-neutral-400 hover:text-red-600 disabled:opacity-50"
        title={t('removeItem')}
      >
        <TrashIcon className="w-5 h-5" />
      </button>
    </div>
  );
}
