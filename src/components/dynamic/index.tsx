/**
 * Dynamic imports for heavy components to enable code splitting and lazy loading
 */

import dynamic from "next/dynamic";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

// Product components with lazy loading
export const LazyProductCustomizer = dynamic(
  () =>
    import("@/components/product/ProductCustomizer").then((mod) => ({
      default: mod.ProductCustomizer,
    })),
  {
    loading: () => <LoadingSpinner size="md" />,
    ssr: false,
  }
);

// Admin components with lazy loading
export const LazyMonitoringDashboard = dynamic(
  () =>
    import("@/components/admin/MonitoringDashboard").then((mod) => ({
      default: mod.MonitoringDashboard,
    })),
  {
    loading: () => <LoadingSpinner size="md" />,
    ssr: false,
  }
);

export const LazyInventoryManagement = dynamic(
  () => import("@/components/admin/InventoryManagement"),
  {
    loading: () => <LoadingSpinner size="md" />,
    ssr: false,
  }
);

// Payment components with lazy loading
export const LazyStripePaymentForm = dynamic(
  () =>
    import("@/components/payments/StripePaymentForm").then((mod) => ({
      default: mod.StripePaymentForm,
    })),
  {
    loading: () => <LoadingSpinner size="md" />,
    ssr: false,
  }
);
// Contact and FAQ components (not critical for initial load)
export const LazyContactForm = dynamic(
  () => import("@/components/contact/ContactForm") as any,
  {
    loading: () => <LoadingSpinner size="md" />,
    ssr: true, // Keep SSR for SEO
  }
);

export const LazyFAQAccordion = dynamic(
  () => import("@/components/faq/FAQAccordion").then((mod) => ({ default: mod.FAQAccordion })),
  {
    loading: () => <LoadingSpinner size="md" />,
    ssr: true, // Keep SSR for SEO
  }
);;

// GDPR components (privacy-related, can be lazy loaded)
export const LazyConsentManager = dynamic(
  () => import("@/components/gdpr/ConsentManager").then((mod) => ({ default: mod.ConsentManager })),
  {
    loading: () => <LoadingSpinner size="sm" />,
    ssr: false, // Client-side only for privacy controls
  }
);;

export const LazyDataExportButton = dynamic(
  () => import("@/components/gdpr/DataExportButton").then((mod) => ({ default: mod.DataExportButton })),
  {
    loading: () => <LoadingSpinner size="sm" />,
    ssr: false,
  }
);;

// Accessibility components (progressive enhancement)
export const LazyAccessibilityToolbar = dynamic(
  () => import("@/components/accessibility/AccessibilityToolbar").then((mod) => ({ default: mod.AccessibilityToolbar })),
  {
    loading: () => null, // No loading state for accessibility toolbar
    ssr: false, // Client-side enhancement only
  }
);;

// Performance monitoring components (development/admin only)
export const LazyPerformanceMonitoringExample = dynamic(
  () => import("@/components/examples/PerformanceMonitoringExample"),
  {
    loading: () => <LoadingSpinner size="md" />,
    ssr: false, // Development tool only
  }
);

export const LazyCoreWebVitalsExample = dynamic(
  () => import("@/components/examples/CoreWebVitalsExample").then((mod) => ({ default: mod.CoreWebVitalsExample })),
  {
    loading: () => <LoadingSpinner size="md" />,
    ssr: false, // Performance monitoring is client-side only
  }
);;

// Order management components (user-specific)
export const LazyOrderHistory = dynamic(
  () => import("@/components/order/OrderHistory").then((mod) => ({ default: mod.OrderHistory })),
  {
    loading: () => <LoadingSpinner size="lg" />,
    ssr: true, // Order history should be SSR for SEO
  }
);;

export const LazyOrderTracking = dynamic(
  () => import("@/components/order/OrderTracking").then((mod) => ({ default: mod.OrderTracking })),
  {
    loading: () => <LoadingSpinner size="lg" />,
    ssr: true, // Order tracking should be SSR
  }
);;

// Delivery components (checkout-specific)
export const LazyDeliveryCalendar = dynamic(
  () => import("@/components/delivery/DeliveryCalendar").then((mod) => ({ default: mod.DeliveryCalendar })),
  {
    loading: () => <LoadingSpinner size="lg" />,
    ssr: false, // Calendar interactions are client-side
  }
);;

export const LazyDeliveryCostCalculator = dynamic(
  () => import("@/components/delivery/DeliveryCostCalculator").then((mod) => ({ default: mod.DeliveryCostCalculator })),
  {
    loading: () => <LoadingSpinner size="md" />,
    ssr: false, // Cost calculation is interactive
  }
);;

// Auth components (user-specific)
export const LazyUserProfile = dynamic(
  () => import("@/components/auth/UserProfile").then((mod) => ({ default: mod.UserProfile })),
  {
    loading: () => <LoadingSpinner size="lg" />,
    ssr: false, // User profile is client-side only
  }
);;

export const LazyAddressBook = dynamic(
  () => import("@/components/auth/AddressBook").then((mod) => ({ default: mod.AddressBook })),
  {
    loading: () => <LoadingSpinner size="md" />,
    ssr: false, // Address book is client-side only
  }
);;

// Advanced product components (detail page only)
export const LazyProductImageGallery = dynamic(
  () => import("@/components/product/ProductImageGallery").then((mod) => ({ default: mod.ProductImageGallery })),
  {
    loading: () => <LoadingSpinner size="lg" />,
    ssr: true, // Image gallery should be SSR for SEO
  }
);;

export const LazyProductQuickView = dynamic(
  () => import("@/components/product/ProductQuickView").then((mod) => ({ default: mod.ProductQuickView })),
  {
    loading: () => <LoadingSpinner size="lg" />,
    ssr: false, // Quick view is a modal, client-side only
  }
);;



// Utility function to create lazy component with custom loading
export function createLazyComponent<T extends Record<string, any>>(
  importFn: () => Promise<{ default: React.ComponentType<T> }>,
  loadingComponent?: () => React.ReactElement,
  options?: {
    ssr?: boolean;
  }
) {
  return dynamic(importFn, {
    loading: loadingComponent || (() => <LoadingSpinner size="md" />),
    ssr: options?.ssr ?? true,
  });

}

// Route-based lazy loading utilities
export const RouteComponents = {
  // Admin route components
  admin: {
    Dashboard: dynamic(() => import("@/components/admin/AdminDashboard"), {
      loading: () => <LoadingSpinner size="lg" />,
      ssr: false,
    }),
    ProductManagement: dynamic(() => import("@/components/admin/ProductManagement"), {
      loading: () => <LoadingSpinner size="lg" />,
      ssr: false,
    }),
    OrderManagement: dynamic(() => import("@/components/admin/OrderManagement"), {
      loading: () => <LoadingSpinner size="lg" />,
      ssr: false,
    }),
    ContactFormsTable: dynamic(() => import("@/components/admin/ContactFormsTable").then((mod) => ({ default: mod.ContactFormsTable })), {
      loading: () => <LoadingSpinner size="lg" />,
      ssr: false,
    }),
  },

  // Checkout route components
  checkout: {
    CheckoutForm: dynamic(() => import("@/components/checkout/CheckoutForm").then((mod) => ({ default: mod.CheckoutForm })), {
      loading: () => <LoadingSpinner size="lg" />,
      ssr: false, // User-specific data
    }),
    PaymentStep: dynamic(() => import("@/components/checkout/steps/PaymentStep").then((mod) => ({ default: mod.PaymentStep })), {
      loading: () => <LoadingSpinner size="md" />,
      ssr: false,
    }),
    OrderSummary: dynamic(() => import("@/components/checkout/OrderSummary").then((mod) => ({ default: mod.OrderSummary })), {
      loading: () => <LoadingSpinner size="md" />,
      ssr: false,
    }),
  },

  // Product detail route components
  productDetail: {
    ProductCustomizer: dynamic(() => import("@/components/product/ProductCustomizer").then((mod) => ({ default: mod.ProductCustomizer })), {
      loading: () => <LoadingSpinner size="md" />,
      ssr: true, // Important for SEO
    }),
    ProductImageGallery: dynamic(() => import("@/components/product/ProductImageGallery").then((mod) => ({ default: mod.ProductImageGallery })), {
      loading: () => <LoadingSpinner size="md" />,
      ssr: true, // Important for SEO
    }),
    RibbonConfigurator: dynamic(() => import("@/components/product/RibbonConfigurator").then((mod) => ({ default: mod.RibbonConfigurator })), {
      loading: () => <LoadingSpinner size="md" />,
      ssr: false, // Interactive component
    }),
  },

  // Profile route components
  profile: {
    UserProfile: dynamic(() => import("@/components/auth/UserProfile").then((mod) => ({ default: mod.UserProfile })), {
      loading: () => <LoadingSpinner size="md" />,
      ssr: false,
    }),
    OrderHistory: dynamic(() => import("@/components/order/OrderHistory").then((mod) => ({ default: mod.OrderHistory })), {
      loading: () => <LoadingSpinner size="md" />,
      ssr: false,
    }),
    AddressBook: dynamic(() => import("@/components/auth/AddressBook").then((mod) => ({ default: mod.AddressBook })), {
      loading: () => <LoadingSpinner size="md" />,
      ssr: false,
    }),
  },
};;

// Preload utilities for route transitions
export const preloadRouteComponents = {
  admin: () => {
    // Preload admin components when user navigates to admin
    import("@/components/admin/AdminDashboard");
    import("@/components/admin/ProductManagement");
  },

  checkout: () => {
    // Preload checkout components when user adds to cart
    import("@/components/checkout/CheckoutForm");
    import("@/components/checkout/steps/PaymentStep");
  },

  productDetail: () => {
    // Preload product detail components on product card hover
    import("@/components/product/ProductCustomizer");
    import("@/components/product/ProductImageGallery");
  },

  profile: () => {
    // Preload profile components when user signs in
    import("@/components/auth/UserProfile");
    import("@/components/order/OrderHistory");
  },
};
