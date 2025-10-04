# TypeScript useEffect Dependency Fix Pattern

## Date: 2025-10-04

## Issue
TypeScript errors: "Block-scoped variable used before its declaration" when functions are defined after useEffect but used in its dependency array.

## Root Cause
Functions defined with `const functionName = async () => {}` after a useEffect that references them in the dependency array cause hoisting issues in strict TypeScript mode.

## Solution Pattern
Wrap functions in `useCallback` and define them BEFORE the useEffect that uses them:

### Before (Error):
```typescript
useEffect(() => {
  fetchData();
}, [fetchData]); // Error: fetchData used before declaration

const fetchData = async () => {
  // ...
};
```

### After (Fixed):
```typescript
import { useCallback, useEffect } from "react";

const fetchData = useCallback(async () => {
  // ...
}, [dependencies]);

useEffect(() => {
  fetchData();
}, [fetchData]); // ✓ No error
```

## Files Fixed
- `src/components/auth/UserProfile.tsx` - loadUserProfile
- `src/components/admin/AdminActivityLog.tsx` - fetchActivities
- `src/components/admin/AdminDashboard.tsx` - fetchDashboardStats
- `src/components/admin/DashboardOverview.tsx` - fetchRecentOrders
- `src/components/admin/OrderManagement.tsx` - fetchOrders
- `src/components/admin/InventoryManagement.tsx` - fetchAlerts, fetchInventoryProducts

## Key Points
1. Always import `useCallback` when fixing these errors
2. Add proper dependencies to useCallback array
3. Move function definition before useEffect
4. This pattern is required for strict TypeScript mode with `exactOptionalPropertyTypes`

## Remaining Similar Errors
Other files still need the same fix:
- src/components/checkout/steps/PaymentStep.tsx
- src/components/monitoring/WebVitalsTracker.tsx
- src/components/order/OrderHistory.tsx
- src/components/order/OrderTracking.tsx
- src/components/product/ProductImageGallery.tsx
- src/lib/cart/context.tsx
