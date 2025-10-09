/**
 * Dynamic imports for heavy components to enable code splitting and lazy loading
 *
 * @deprecated This file is maintained for backward compatibility.
 * New code should import from '@/lib/config/dynamic-imports' instead.
 *
 * This file re-exports components from the centralized dynamic imports configuration.
 */

// Re-export all components from the centralized configuration
export {
  // Route component groups
  AdminRouteComponents,
  CheckoutRouteComponents,
  // Utility functions
  createLazyComponent,
  // Accessibility components
  LazyAccessibilityToolbar,
  LazyAddressBook,
  // Admin components
  LazyAdminDashboard,
  // Checkout components
  LazyCheckoutForm,
  // GDPR components
  LazyConsentManager,
  // Contact and FAQ components
  LazyContactForm,
  LazyContactFormsTable,
  LazyCoreWebVitalsExample,
  LazyDataExportButton,
  // Delivery components
  LazyDeliveryCalendar,
  LazyDeliveryCostCalculator,
  LazyFAQAccordion,
  LazyInventoryManagement,
  LazyMonitoringDashboard,
  // Order components
  LazyOrderHistory,
  LazyOrderManagement,
  LazyOrderSummary,
  LazyOrderTracking,
  LazyPaymentStep,
  // Monitoring components
  LazyPerformanceMonitoringExample,
  LazyProductCustomizer,
  LazyProductImageGallery,
  LazyProductManagement,
  // Product components
  LazyProductQuickView,
  // Layout components
  LazyProductReferencesSection,
  LazyRibbonConfigurator,
  // Payment components
  LazyStripePaymentForm,
  // Auth components
  LazyUserProfile,
  ProductDetailRouteComponents,
  ProfileRouteComponents,
  preloadComponent,
  preloadComponents,
  preloadCriticalComponents,
  preloadRouteComponents,
} from "@/lib/config/dynamic-imports";
