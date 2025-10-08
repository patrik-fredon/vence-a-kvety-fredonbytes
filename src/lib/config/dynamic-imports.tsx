'use client';

/**
 * Centralized dynamic imports configuration for code splitting
 * This file defines all lazy-loaded components with their loading states
 * 
 * Requirements: 1.6, 5.2, 5.3
 */

import dynamic from 'next/dynamic';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { ComponentType } from 'react';

// =============================================================================
// LOADING STATES
// =============================================================================

/**
 * Default loading component for most lazy-loaded components
 */
const DefaultLoading = () => <LoadingSpinner size="md" />;

/**
 * Large loading component for heavy components like dashboards
 */
const LargeLoading = () => <LoadingSpinner size="lg" />;

/**
 * Small loading component for lightweight components
 */
const SmallLoading = () => <LoadingSpinner size="sm" />;

/**
 * No loading state for progressive enhancement components
 */
const NoLoading = () => null;

// =============================================================================
// ADMIN COMPONENTS (Heavy - Lazy Load)
// =============================================================================

export const LazyAdminDashboard = dynamic(
  () => import('@/components/admin/AdminDashboard'),
  {
    loading: LargeLoading,
    ssr: false, // Admin components are client-side only
  }
);

export const LazyProductManagement = dynamic(
  () => import('@/components/admin/ProductManagement'),
  {
    loading: LargeLoading,
    ssr: false,
  }
);

export const LazyOrderManagement = dynamic(
  () => import('@/components/admin/OrderManagement'),
  {
    loading: LargeLoading,
    ssr: false,
  }
);

export const LazyInventoryManagement = dynamic(
  () => import('@/components/admin/InventoryManagement'),
  {
    loading: DefaultLoading,
    ssr: false,
  }
);

export const LazyContactFormsTable = dynamic(
  () => import('@/components/admin/ContactFormsTable').then(mod => ({ default: mod.ContactFormsTable })),
  {
    loading: LargeLoading,
    ssr: false,
  }
);

export const LazyMonitoringDashboard = dynamic(
  () => import('@/components/admin/MonitoringDashboard').then(mod => ({ default: mod.MonitoringDashboard })),
  {
    loading: DefaultLoading,
    ssr: false,
  }
);

// =============================================================================
// PAYMENT COMPONENTS (Critical for Checkout - Lazy Load)
// =============================================================================

export const LazyStripePaymentForm = dynamic(
  () => import('@/components/payments/StripePaymentForm').then(mod => ({ default: mod.StripePaymentForm })),
  {
    loading: DefaultLoading,
    ssr: false, // Payment forms are client-side only
  }
);

// =============================================================================
// PRODUCT COMPONENTS (Heavy - Lazy Load)
// =============================================================================

export const LazyProductQuickView = dynamic(
  () => import('@/components/product/ProductQuickView').then(mod => ({ default: mod.ProductQuickView })),
  {
    loading: LargeLoading,
    ssr: false, // Modal component, client-side only
  }
);

export const LazyProductImageGallery = dynamic(
  () => import('@/components/product/ProductImageGallery').then(mod => ({ default: mod.ProductImageGallery })),
  {
    loading: DefaultLoading,
    ssr: true, // Important for SEO
  }
);

export const LazyProductCustomizer = dynamic(
  () => import('@/components/product/ProductCustomizer').then(mod => ({ default: mod.ProductCustomizer })),
  {
    loading: DefaultLoading,
    ssr: false, // Interactive component
  }
);

export const LazyRibbonConfigurator = dynamic(
  () => import('@/components/product/RibbonConfigurator').then(mod => ({ default: mod.RibbonConfigurator })),
  {
    loading: DefaultLoading,
    ssr: false, // Interactive component
  }
);

// =============================================================================
// CHECKOUT COMPONENTS (Lazy Load for Better Performance)
// =============================================================================

export const LazyCheckoutForm = dynamic(
  () => import('@/components/checkout/CheckoutForm').then(mod => ({ default: mod.CheckoutForm })),
  {
    loading: LargeLoading,
    ssr: false, // User-specific data
  }
);

export const LazyPaymentStep = dynamic(
  () => import('@/components/checkout/steps/PaymentStep').then(mod => ({ default: mod.PaymentStep })),
  {
    loading: DefaultLoading,
    ssr: false,
  }
);

export const LazyOrderSummary = dynamic(
  () => import('@/components/checkout/OrderSummary').then(mod => ({ default: mod.OrderSummary })),
  {
    loading: DefaultLoading,
    ssr: false,
  }
);

// =============================================================================
// DELIVERY COMPONENTS (Checkout-Specific - Lazy Load)
// =============================================================================

export const LazyDeliveryCalendar = dynamic(
  () => import('@/components/delivery/DeliveryCalendar').then(mod => ({ default: mod.DeliveryCalendar })),
  {
    loading: LargeLoading,
    ssr: false, // Calendar interactions are client-side
  }
);

export const LazyDeliveryCostCalculator = dynamic(
  () => import('@/components/delivery/DeliveryCostCalculator').then(mod => ({ default: mod.DeliveryCostCalculator })),
  {
    loading: DefaultLoading,
    ssr: false, // Cost calculation is interactive
  }
);

// =============================================================================
// AUTH COMPONENTS (User-Specific - Lazy Load)
// =============================================================================

export const LazyUserProfile = dynamic(
  () => import('@/components/auth/UserProfile').then(mod => ({ default: mod.UserProfile })),
  {
    loading: LargeLoading,
    ssr: false, // User profile is client-side only
  }
);

export const LazyAddressBook = dynamic(
  () => import('@/components/auth/AddressBook').then(mod => ({ default: mod.AddressBook })),
  {
    loading: DefaultLoading,
    ssr: false, // Address book is client-side only
  }
);

// =============================================================================
// ORDER COMPONENTS (User-Specific - Lazy Load)
// =============================================================================

export const LazyOrderHistory = dynamic(
  () => import('@/components/order/OrderHistory').then(mod => ({ default: mod.OrderHistory })),
  {
    loading: LargeLoading,
    ssr: true, // Order history should be SSR for SEO
  }
);

export const LazyOrderTracking = dynamic(
  () => import('@/components/order/OrderTracking').then(mod => ({ default: mod.OrderTracking })),
  {
    loading: LargeLoading,
    ssr: true, // Order tracking should be SSR
  }
);

// =============================================================================
// ACCESSIBILITY COMPONENTS (Progressive Enhancement - Lazy Load)
// =============================================================================

export const LazyAccessibilityToolbar = dynamic(
  () => import('@/components/accessibility/AccessibilityToolbar').then(mod => ({ default: mod.AccessibilityToolbar })),
  {
    loading: NoLoading, // No loading state for accessibility toolbar
    ssr: false, // Client-side enhancement only
  }
);

// =============================================================================
// GDPR COMPONENTS (Privacy-Related - Lazy Load)
// =============================================================================

export const LazyConsentManager = dynamic(
  () => import('@/components/gdpr/ConsentManager').then(mod => ({ default: mod.ConsentManager })),
  {
    loading: SmallLoading,
    ssr: false, // Client-side only for privacy controls
  }
);

export const LazyDataExportButton = dynamic(
  () => import('@/components/gdpr/DataExportButton').then(mod => ({ default: mod.DataExportButton })),
  {
    loading: SmallLoading,
    ssr: false,
  }
);

// =============================================================================
// CONTACT AND FAQ COMPONENTS (Not Critical - Lazy Load)
// =============================================================================

export const LazyContactForm = dynamic(
  () => import('@/components/contact/ContactForm') as any,
  {
    loading: DefaultLoading,
    ssr: true, // Keep SSR for SEO
  }
);

export const LazyFAQAccordion = dynamic(
  () => import('@/components/faq/FAQAccordion').then(mod => ({ default: mod.FAQAccordion })),
  {
    loading: DefaultLoading,
    ssr: true, // Keep SSR for SEO
  }
);

// =============================================================================
// MONITORING COMPONENTS (Development/Admin Only - Lazy Load)
// =============================================================================

export const LazyPerformanceMonitoringExample = dynamic(
  () => import('@/components/examples/PerformanceMonitoringExample'),
  {
    loading: DefaultLoading,
    ssr: false, // Development tool only
  }
);

export const LazyCoreWebVitalsExample = dynamic(
  () => import('@/components/examples/CoreWebVitalsExample').then(mod => ({ default: mod.CoreWebVitalsExample })),
  {
    loading: DefaultLoading,
    ssr: false, // Performance monitoring is client-side only
  }
);

// =============================================================================
// LAYOUT COMPONENTS (Lazy Load for Better Performance)
// =============================================================================

export const LazyProductReferencesSection = dynamic(
  () => import('@/components/layout/ProductReferencesSection').then(mod => ({ default: mod.ProductReferencesSection })),
  {
    loading: DefaultLoading,
    ssr: true, // Important for SEO
  }
);

// =============================================================================
// ROUTE-BASED COMPONENT GROUPS
// =============================================================================

/**
 * Admin route components grouped for easy import
 */
export const AdminRouteComponents = {
  Dashboard: LazyAdminDashboard,
  ProductManagement: LazyProductManagement,
  OrderManagement: LazyOrderManagement,
  ContactFormsTable: LazyContactFormsTable,
  InventoryManagement: LazyInventoryManagement,
  MonitoringDashboard: LazyMonitoringDashboard,
} as const;

/**
 * Checkout route components grouped for easy import
 */
export const CheckoutRouteComponents = {
  CheckoutForm: LazyCheckoutForm,
  PaymentStep: LazyPaymentStep,
  OrderSummary: LazyOrderSummary,
  StripePaymentForm: LazyStripePaymentForm,
} as const;

/**
 * Product detail route components grouped for easy import
 */
export const ProductDetailRouteComponents = {
  ProductCustomizer: LazyProductCustomizer,
  ProductImageGallery: LazyProductImageGallery,
  RibbonConfigurator: LazyRibbonConfigurator,
  ProductQuickView: LazyProductQuickView,
} as const;

/**
 * Profile route components grouped for easy import
 */
export const ProfileRouteComponents = {
  UserProfile: LazyUserProfile,
  OrderHistory: LazyOrderHistory,
  AddressBook: LazyAddressBook,
} as const;

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Create a custom lazy component with specific loading state
 */
export function createLazyComponent<T extends Record<string, any>>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  options?: {
    loading?: () => React.ReactElement | null;
    ssr?: boolean;
  }
) {
  return dynamic(importFn, {
    loading: options?.loading || DefaultLoading,
    ssr: options?.ssr ?? true,
  });
}

/**
 * Preload a component for faster subsequent loads
 */
export function preloadComponent(component: any) {
  if (component && typeof component.preload === 'function') {
    component.preload();
  }
}

/**
 * Preload multiple components
 */
export function preloadComponents(components: any[]) {
  components.forEach(preloadComponent);
}

// =============================================================================
// PRELOAD UTILITIES FOR ROUTE TRANSITIONS
// =============================================================================

/**
 * Preload components for specific routes
 */
export const preloadRouteComponents = {
  admin: () => preloadComponents(Object.values(AdminRouteComponents)),
  checkout: () => preloadComponents(Object.values(CheckoutRouteComponents)),
  productDetail: () => preloadComponents(Object.values(ProductDetailRouteComponents)),
  profile: () => preloadComponents(Object.values(ProfileRouteComponents)),
};

/**
 * Preload critical components on app initialization
 */
export function preloadCriticalComponents() {
  // Preload components that are likely to be needed soon
  if (typeof window !== 'undefined') {
    // Use requestIdleCallback for non-blocking preloading
    const preload = () => {
      preloadComponent(LazyProductQuickView);
      preloadComponent(LazyAccessibilityToolbar);
    };

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(preload);
    } else {
      setTimeout(preload, 1);
    }
  }
}
