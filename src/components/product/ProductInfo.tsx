'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Product } from '@/types/product';
import { cn } from '@/lib/utils';
import { StarIcon, HeartIcon, ShareIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface ProductInfoProps {
  product: Product;
  locale: string;
  finalPrice: number;
  className?: string;
}

export function ProductInfo({ product, locale, finalPrice, className }: ProductInfoProps) {
  const t = useTranslations('product');
  const tCurrency = useTranslations('currency');

  const formatPrice = (price: number) => {
    return tCurrency('format', {
      amount: price.toLocaleString(locale === 'cs' ? 'cs-CZ' : 'en-US')
    });
  };

  // Mock rating data (implement in later tasks)
  const rating = 4.8;
  const reviewCount = 127;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name[locale as keyof typeof product.name],
          text: product.description?.[locale as keyof typeof product.description],
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // TODO: Show toast notification in later tasks
      alert(t('linkCopied'));
    }
  };

  const handleAddToWishlist = () => {
    // TODO: Implement wishlist functionality in later tasks
    console.log('Added to wishlist:', product.id);
    alert(t('addedToWishlist'));
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Breadcrumb */}
      <nav className="text-sm text-neutral-600">
        <Link href={`/${locale}/products`} className="hover:text-primary-600">
          {t('allProducts')}
        </Link>
        {product.category && (
          <>
            <span className="mx-2">/</span>
            <Link
              href={`/${locale}/products?category=${product.category.slug}`}
              className="hover:text-primary-600"
            >
              {product.category.name[locale as keyof typeof product.category.name]}
            </Link>
          </>
        )}
        <span className="mx-2">/</span>
        <span className="text-neutral-800">
          {product.name[locale as keyof typeof product.name]}
        </span>
      </nav>

      {/* Product Title */}
      <div>
        <h1 className="text-elegant text-3xl font-semibold text-primary-800 mb-2">
          {product.name[locale as keyof typeof product.name]}
        </h1>

        {/* Featured Badge */}
        {product.featured && (
          <div className="inline-flex items-center gap-1 bg-primary-100 text-primary-700 px-2 py-1 rounded-md text-sm font-medium">
            <StarIconSolid className="w-4 h-4" />
            {t('featured')}
          </div>
        )}
      </div>

      {/* Rating and Reviews */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <StarIcon
              key={star}
              className={cn(
                'w-5 h-5',
                star <= Math.floor(rating)
                  ? 'text-yellow-400 fill-current'
                  : star <= rating
                  ? 'text-yellow-400 fill-current opacity-50'
                  : 'text-neutral-300'
              )}
            />
          ))}
          <span className="ml-2 text-sm font-medium text-neutral-700">
            {rating}
          </span>
        </div>
        <div className="text-sm text-neutral-600">
          ({reviewCount} {t('reviews')})
        </div>
      </div>

      {/* Price Display */}
      <div className="py-2">
        <div className="text-sm text-neutral-600 mb-1">{t('basePrice')}</div>
        <div className="text-2xl font-bold text-primary-700">
          {formatPrice(product.basePrice)}
        </div>
        {finalPrice !== product.basePrice && (
          <div className="text-sm text-neutral-500 mt-1">
            {t('priceWillUpdate')}
          </div>
        )}
      </div>

      {/* Description */}
      {product.description && (
        <div>
          <h3 className="text-lg font-semibold text-primary-800 mb-2">
            {t('description')}
          </h3>
          <div className="text-neutral-700 leading-relaxed whitespace-pre-line">
            {product.description[locale as keyof typeof product.description]}
          </div>
        </div>
      )}

      {/* Product Details */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold text-primary-800 mb-3">
          {t('productDetails')}
        </h3>
        <dl className="grid grid-cols-1 gap-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-neutral-600">{t('category')}:</dt>
            <dd className="text-neutral-800">
              {product.category?.name[locale as keyof typeof product.category.name] || t('uncategorized')}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-neutral-600">{t('sku')}:</dt>
            <dd className="text-neutral-800 font-mono">{product.id.slice(-8).toUpperCase()}</dd>
          </div>
          {product.availability.leadTimeHours && (
            <div className="flex justify-between">
              <dt className="text-neutral-600">{t('leadTime')}:</dt>
              <dd className="text-neutral-800">
                {product.availability.leadTimeHours} {t('hours')}
              </dd>
            </div>
          )}
          {product.availability.maxOrderQuantity && (
            <div className="flex justify-between">
              <dt className="text-neutral-600">{t('maxQuantity')}:</dt>
              <dd className="text-neutral-800">{product.availability.maxOrderQuantity}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={handleAddToWishlist}
          className="flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
          aria-label={t('addToWishlist')}
        >
          <HeartIcon className="w-5 h-5" />
          <span className="hidden sm:inline">{t('wishlist')}</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
          aria-label={t('share')}
        >
          <ShareIcon className="w-5 h-5" />
          <span className="hidden sm:inline">{t('share')}</span>
        </button>
      </div>
    </div>
  );
}
