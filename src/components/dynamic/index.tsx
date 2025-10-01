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
