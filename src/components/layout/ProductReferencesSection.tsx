'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { ProductReference, ProductReferencesSectionProps } from '@/types/components';

// Utility function to transform Product to ProductReference
const transformProductToReference = (product: any, locale: string): ProductReference => {
  // Get the primary image or first available image
  const primaryImage = product.images?.find((img: any) => img.isPrimary) || product.images?.[0];

  // Fallback image for products without images
  const fallbackImage = {
    src: '/funeral-wreaths-and-floral-arrangement-001.png',
    alt: locale === 'cs' ? 'Pohřební věnec' : 'Funeral wreath',
    width: 400,
    height: 400,
  };

  return {
    id: product.id,
    name: locale === 'cs' ? product.name?.cs || product.nameCs : product.name?.en || product.nameEn,
    image: primaryImage ? {
      src: primaryImage.url,
      alt: primaryImage.alt,
      width: primaryImage.width || 400,
      height: primaryImage.height || 400,
    } : fallbackImage,
    description: locale === 'cs'
      ? product.description?.cs || product.descriptionCs || 'Krásný pohřební věnec vyrobený s láskou a péčí'
      : product.description?.en || product.descriptionEn || 'Beautiful funeral wreath crafted with love and care',
    category: product.category?.name?.[locale] || (locale === 'cs' ? 'Pohřební věnce' : 'Funeral Wreaths'),
    slug: product.slug,
  };
};

// Individual product reference card component
const ProductReferenceCard = ({ product }: { product: ProductReference }) => {
  return (
    <article className="group bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="aspect-square relative overflow-hidden">
        <Image
          src={product.image.src}
          alt={product.image.alt}
          width={product.image.width || 400}
          height={product.image.height || 400}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          priority={false}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-white mb-2 truncate">
          {product.name}
        </h3>
        {product.category && (
          <span className="inline-block px-2 py-1 text-xs bg-white/20 text-white rounded-full mb-2">
            {product.category}
          </span>
        )}
        <p className="text-stone-200 text-sm leading-relaxed overflow-hidden" style={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }}>
          {product.description}
        </p>
      </div>
    </article>
  );
};

// Main ProductReferencesSection component
export const ProductReferencesSection = ({
  locale,
  products: propProducts,
  maxProducts = 4,
  className,
}: ProductReferencesSectionProps) => {
  const [products, setProducts] = useState<ProductReference[]>(propProducts || []);
  const [loading, setLoading] = useState(!propProducts);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    // Skip fetching if products are provided as props
    if (propProducts) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/products/random?count=${maxProducts}&locale=${locale}&featured=true`, {
        cache: 'no-store', // Ensure fresh data
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch products`);
      }

      const data = await response.json();

      if (data.success && data.products) {
        const transformedProducts = data.products.map((product: any) =>
          transformProductToReference(product, locale)
        );
        setProducts(transformedProducts);
      } else {
        setError(data.error || 'Failed to load products');
      }
    } catch (err) {
      console.error('Error fetching products for ProductReferencesSection:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [maxProducts, locale, propProducts]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Loading state
  if (loading) {
    return (
      <section
        className={cn(
          "py-16 px-4 sm:px-6 lg:px-8",
          "bg-funeral-background",
          className
        )}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              {locale === 'cs' ? 'Naše produkty' : 'Our Products'}
            </h2>
          </div>
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section
        className={cn(
          "py-16 px-4 sm:px-6 lg:px-8",
          "bg-funeral-background",
          className
        )}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              {locale === 'cs' ? 'Naše produkty' : 'Our Products'}
            </h2>
          </div>
          <div className="text-center py-12">
            <p className="text-stone-200 mb-4">{error}</p>
            <button
              onClick={fetchProducts}
              className="text-white hover:text-stone-200 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-funeral-background rounded-md px-4 py-2 border border-white/30 hover:border-white/50"
            >
              {locale === 'cs' ? 'Zkusit znovu' : 'Try again'}
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Don't render if no products
  if (products.length === 0) {
    return null;
  }

  return (
    <section
      className={cn(
        "py-16 px-4 sm:px-6 lg:px-8",
        "bg-funeral-background", // funeral background color from design tokens
        className
      )}
      aria-labelledby="product-references-heading"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section heading */}
        <div className="text-center mb-12">
          <h2
            id="product-references-heading"
            className="text-3xl font-bold text-white mb-4"
          >
            {locale === 'cs' ? 'Naše produkty' : 'Our Products'}
          </h2>
          <p className="text-stone-200 text-lg max-w-2xl mx-auto">
            {locale === 'cs'
              ? 'Objevte naši pečlivě vybranou kolekci pohřebních věnců a květinových aranžmá'
              : 'Discover our carefully curated collection of funeral wreaths and floral arrangements'
            }
          </p>
        </div>

        {/* Responsive product grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
          {products.map((product) => (
            <ProductReferenceCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductReferencesSection;
