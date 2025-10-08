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
  // Admin components
  LazyAdminDashboard,
  LazyProductManagement,
  LazyOrderManagement,
  LazyInventoryManagement,
  LazyContactFormsTable,
  LazyMonitoringDashboard,
  
  // Payment components
  LazyStripePaymentForm,
  
  // Product components
  LazyProductQuickView,
  LazyProductImageGallery,
  LazyProductCustomizer,
  LazyRibbonConfigurator,
  
  // Checkout components
  LazyCheckoutForm,
  LazyPaymentStep,
  LazyOrderSummary,
  
  // Delivery components
  LazyDeliveryCalendar,
  LazyDeliveryCostCalculator,
  
  // Auth components
  LazyUserProfile,
  LazyAddressBook,
  
  // Order components
  LazyOrderHistory,
  LazyOrderTracking,
  
  // Accessibility components
  LazyAccessibilityToolbar,
  
  // GDPR components
  LazyConsentManager,
  LazyDataExportButton,
  
  // Contact and FAQ components
  LazyContactForm,
  LazyFAQAccordion,
  
  // Monitoring components
  LazyPerformanceMonitoringExample,
  LazyCoreWebVitalsExample,
  
  // Layout components
  LazyProductReferencesSection,
  
  // Route component groups
  AdminRouteComponents,
  CheckoutRouteComponents,
  ProductDetailRouteComponents,
  ProfileRouteComponents,
  
  // Utility functions
  createLazyComponent,
  preloadComponent,
  preloadComponents,
  preloadRouteComponents,
  preloadCriticalComponents,
} from '@/lib/config/dynamic-imports';
