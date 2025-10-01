"use client";

import dynamic from "next/dynamic";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

// Dynamic imports for admin components to reduce main bundle size
export const LazyProductManagement = dynamic(
  () => import("./ProductManagement"),
  {
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" />
        <span className="ml-2 text-stone-600">Loading Product Management...</span>
      </div>
    ),
    ssr: false, // Admin components don't need SSR
  }
);

export const LazyOrderManagement = dynamic(
  () => import("./OrderManagement"),
  {
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" />
        <span className="ml-2 text-stone-600">Loading Order Management...</span>
      </div>
    ),
    ssr: false,
  }
);

export const LazyInventoryManagement = dynamic(
  () => import("./InventoryManagement"),
  {
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" />
        <span className="ml-2 text-stone-600">Loading Inventory Management...</span>
      </div>
    ),
    ssr: false,
  }
);

export const LazyMonitoringDashboard = dynamic(
  () => import("./MonitoringDashboard").then((mod) => ({ default: mod.MonitoringDashboard })),
  {
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" />
        <span className="ml-2 text-stone-600">Loading Monitoring Dashboard...</span>
      </div>
    ),
    ssr: false,
  }
);

export const LazyContactFormsTable = dynamic(
  () => import("./ContactFormsTable").then((mod) => ({ default: mod.ContactFormsTable })),
  {
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" />
        <span className="ml-2 text-stone-600">Loading Contact Forms...</span>
      </div>
    ),
    ssr: false,
  }
);

export const LazyProductForm = dynamic(
  () => import("./ProductForm"),
  {
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" />
        <span className="ml-2 text-stone-600">Loading Product Form...</span>
      </div>
    ),
    ssr: false,
  }
);
