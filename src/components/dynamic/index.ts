/**
 * Dynamic imports for heavy components to enable code splitting and lazy loading
 */

import dynamic from 'next/dynamic';
import { ProductCardSkeleton, ProductGridSkeleton, CategoryFilterSkeleton } from '@/components/ui/LazyWrapper';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Product components with lazy loading
export const LazyProductCustomizer = dynamic(
  () => import('@/components/product/ProductCustomizer').then(mod => ({ default: mod.ProductCustomizer })),
  {
    loading: () => (
      <div className= "space-y-4" >
      <div className="animate-pulse">
        <div className="h-6 bg-neutral-200 rounded w-1/3 mb-4"> </div>
          < div className="space-y-3" >
          <div className="h-12 bg-neutral-200 rounded"> </div>
            < div className="h-12 bg-neutral-200 rounded" > </div>
            < div className="h-12 bg-neutral-200 rounded" > </div>
            </div>
            </div>
            </div>
    ),
  ssr: false, // Disable SSR for customizer to improve initial load
  }
);

export const LazyProductImageGallery = dynamic(
  () => import('@/components/product/ProductImageGallery').then(mod => ({ default: mod.ProductImageGallery })),
  {
    loading: () => (
      <div className= "space-y-4" >
      <div className="aspect-square bg-neutral-200 animate-pulse rounded-lg"> </div>
        < div className="flex gap-2" >
        {
          Array.from({ length: 4 }).map((_, i) => (
            <div key= { i } className = "w-16 h-16 bg-neutral-200 animate-pulse rounded" > </div>
          ))}
</div>
  </div>
    ),
  }
);

export const LazyProductGrid = dynamic(
  () => import('@/components/product/ProductGrid').then(mod => ({ default: mod.ProductGrid })),
  {
    loading: () => <ProductGridSkeleton count={ 8} />,
  }
);

export const LazyProductFilters = dynamic(
  () => import('@/components/product/ProductFilters').then(mod => ({ default: mod.ProductFilters })),
  {
    loading: () => <CategoryFilterSkeleton />,
    ssr: false, // Filters are interactive, no need for SSR
  }
);

// Cart components with lazy loading
export const LazyShoppingCart = dynamic(
  () => import('@/components/cart/ShoppingCart').then(mod => ({ default: mod.ShoppingCart })),
  {
    loading: () => (
      <div className= "p-4" >
      <LoadingSpinner size="medium" />
        </div>
    ),
  ssr: false, // Cart is client-side only
  }
);

export const LazyMiniCart = dynamic(
  () => import('@/components/cart/MiniCart').then(mod => ({ default: mod.MiniCart })),
  {
    loading: () => (
      <div className= "w-6 h-6 bg-neutral-200 animate-pulse rounded" > </div>
    ),
  ssr: false,
  }
);

// Checkout components with lazy loading
export const LazyCheckoutForm = dynamic(
  () => import('@/components/checkout/CheckoutForm').then(mod => ({ default: mod.CheckoutForm })),
  {
    loading: () => (
      <div className= "space-y-6" >
      <div className="animate-pulse">
        <div className="h-8 bg-neutral-200 rounded w-1/3 mb-4"> </div>
          < div className="space-y-4" >
          <div className="h-12 bg-neutral-200 rounded"> </div>
            < div className="h-12 bg-neutral-200 rounded" > </div>
            < div className="h-32 bg-neutral-200 rounded" > </div>
            </div>
            </div>
            </div>
    ),
  ssr: false,
  }
);

// Delivery components with lazy loading
export const LazyDeliveryCalendar = dynamic(
  () => import('@/components/delivery/DeliveryCalendar').then(mod => ({ default: mod.DeliveryCalendar })),
  {
    loading: () => (
      <div className= "p-4" >
      <div className="animate-pulse">
        <div className="h-6 bg-neutral-200 rounded w-1/4 mb-4"> </div>
          < div className="grid grid-cols-7 gap-2" >
          {
            Array.from({ length: 35 }).map((_, i) => (
              <div key= { i } className = "h-10 bg-neutral-200 rounded" > </div>
            ))}
</div>
  </div>
  </div>
    ),
ssr: false,
  }
);

export const LazyDeliveryCostCalculator = dynamic(
  () => import('@/components/delivery/DeliveryCostCalculator').then(mod => ({ default: mod.DeliveryCostCalculator })),
  {
    loading: () => (
      <div className= "p-4" >
      <LoadingSpinner size="small" />
        </div>
    ),
  ssr: false,
  }
);

// Payment components with lazy loading
export const LazyStripePaymentForm = dynamic(
  () => import('@/components/payments/StripePaymentForm').then(mod => ({ default: mod.StripePaymentForm })),
  {
    loading: () => (
      <div className= "p-6 border rounded-lg" >
      <div className="animate-pulse">
        <div className="h-6 bg-neutral-200 rounded w-1/3 mb-4"> </div>
          < div className="space-y-3" >
          <div className="h-12 bg-neutral-200 rounded"> </div>
            < div className="h-12 bg-neutral-200 rounded" > </div>
            </div>
            </div>
            </div>
    ),
  ssr: false,
  }
);

export const LazyGopayPaymentForm = dynamic(
  () => import('@/components/payments/GopayPaymentForm').then(mod => ({ default: mod.GopayPaymentForm })),
  {
    loading: () => (
      <div className= "p-6 border rounded-lg" >
      <div className="animate-pulse">
        <div className="h-6 bg-neutral-200 rounded w-1/3 mb-4"> </div>
          < div className="space-y-3" >
          <div className="h-12 bg-neutral-200 rounded"> </div>
            < div className="h-12 bg-neutral-200 rounded" > </div>
            </div>
            </div>
            </div>
    ),
  ssr: false,
  }
);

// Admin components with lazy loading
export const LazyAdminDashboard = dynamic(
  () => import('@/components/admin/AdminDashboard').then(mod => ({ default: mod.AdminDashboard })),
  {
    loading: () => (
      <div className= "p-6" >
      <LoadingSpinner size="large" />
        </div>
    ),
  ssr: false, // Admin components don't need SSR
  }
);

export const LazyProductManagement = dynamic(
  () => import('@/components/admin/ProductManagement').then(mod => ({ default: mod.ProductManagement })),
  {
    loading: () => (
      <div className= "p-6" >
      <LoadingSpinner size="large" />
        </div>
    ),
  ssr: false,
  }
);

export const LazyOrderManagement = dynamic(
  () => import('@/components/admin/OrderManagement').then(mod => ({ default: mod.OrderManagement })),
  {
    loading: () => (
      <div className= "p-6" >
      <LoadingSpinner size="large" />
        </div>
    ),
  ssr: false,
  }
);

// Auth components with lazy loading
export const LazySignInForm = dynamic(
  () => import('@/components/auth/SignInForm').then(mod => ({ default: mod.SignInForm })),
  {
    loading: () => (
      <div className= "space-y-4" >
      <div className="animate-pulse">
        <div className="h-12 bg-neutral-200 rounded mb-4"> </div>
          < div className="h-12 bg-neutral-200 rounded mb-4" > </div>
          < div className="h-12 bg-neutral-200 rounded" > </div>
          </div>
          </div>
    ),
  ssr: false,
  }
);

export const LazySignUpForm = dynamic(
  () => import('@/components/auth/SignUpForm').then(mod => ({ default: mod.SignUpForm })),
  {
    loading: () => (
      <div className= "space-y-4" >
      <div className="animate-pulse">
        <div className="h-12 bg-neutral-200 rounded mb-4"> </div>
          < div className="h-12 bg-neutral-200 rounded mb-4" > </div>
          < div className="h-12 bg-neutral-200 rounded mb-4" > </div>
          < div className="h-12 bg-neutral-200 rounded" > </div>
          </div>
          </div>
    ),
  ssr: false,
  }
);

// Utility function to create lazy component with custom loading
export function createLazyComponent<T extends Record<string, any>>(
  importFn: () => Promise<{ default: React.ComponentType<T> }>,
  loadingComponent?: React.ComponentType,
  options?: {
    ssr?: boolean;
  }
) {
  return dynamic(importFn, {
    loading: loadingComponent || (() => <LoadingSpinner size="medium" />),
    ssr: options?.ssr ?? true,
  });
}
