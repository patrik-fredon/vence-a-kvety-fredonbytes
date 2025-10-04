# TypeScript Strict Mode Fixes - October 4, 2025

## Summary
Fixed 37 TypeScript errors across 14 files related to strict mode compliance, particularly `exactOptionalPropertyTypes` and proper dependency management in React hooks.

## Error Categories Fixed

### 1. useEffect Dependency Issues (Functions Used Before Declaration)
**Problem**: Functions referenced in useEffect dependency arrays before being declared, causing TS2448 and TS2454 errors.

**Solution**: Use `useCallback` to properly memoize functions before they're used in dependency arrays.

**Files Fixed**:
- `src/components/monitoring/WebVitalsTracker.tsx` - queueMetricForReporting, sendMetricsToServer
- `src/components/order/OrderHistory.tsx` - fetchOrderHistory, applyFiltersAndSort
- `src/components/order/OrderTracking.tsx` - fetchOrderHistory
- `src/components/checkout/steps/PaymentStep.tsx` - initializePayment
- `src/components/product/ProductImageGallery.tsx` - handleNext, handlePrevious
- `src/lib/cart/context.tsx` - syncWithServer (removed from dependency array, stable via useCallback)

**Pattern**:
```typescript
// Before (Error)
useEffect(() => {
  someFunction();
}, [someFunction]);

const someFunction = () => { ... };

// After (Fixed)
const someFunction = useCallback(() => {
  // implementation
}, [dependencies]);

useEffect(() => {
  someFunction();
}, [someFunction]);
```

### 2. Boolean Type Mismatches (boolean | undefined → boolean)
**Problem**: With `exactOptionalPropertyTypes: true`, `boolean | undefined` cannot be assigned to `boolean`.

**Solution**: Use nullish coalescing operator (`?? false`) to ensure boolean type.

**Files Fixed**:
- `src/lib/validation/checkout.ts` - hasRibbonSelected
- `src/lib/validation/hooks.ts` - hasRibbonSelected (2 occurrences)
- `src/lib/validation/wreath.ts` - hasRibbonSelected
- `src/components/product/OptimizedProductCustomizer.tsx` - isVisible, isRibbonSelected props

**Pattern**:
```typescript
// Before (Error)
hasRibbonSelected: isRibbonSelected,  // boolean | undefined

// After (Fixed)
hasRibbonSelected: isRibbonSelected ?? false,  // boolean
```

### 3. Optional Property Assignment (exactOptionalPropertyTypes)
**Problem**: Setting optional properties to `undefined` is not allowed with `exactOptionalPropertyTypes: true`.

**Solution**: Use `delete` operator instead of assigning `undefined`.

**Files Fixed**:
- `src/lib/validation/wreath.ts` - customValue property
- `src/components/product/OptimizedProductCustomizer.tsx` - customValue property
- `src/components/product/RibbonConfigurator.tsx` - customValue property

**Pattern**:
```typescript
// Before (Error)
existing.customValue = undefined;

// After (Fixed)
delete existing.customValue;
```

### 4. Environment Variable Access (Index Signature)
**Problem**: TypeScript requires bracket notation for accessing properties from index signatures.

**Solution**: Use bracket notation `process.env["VARIABLE"]` instead of dot notation.

**Files Fixed**:
- `src/components/seo/PageMetadata.tsx` - NEXT_PUBLIC_BASE_URL
- `src/components/seo/StructuredData.tsx` - NEXT_PUBLIC_BASE_URL (8 occurrences)

**Pattern**:
```typescript
// Before (Error)
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "default";

// After (Fixed)
const baseUrl = process.env["NEXT_PUBLIC_BASE_URL"] || "default";
```

### 5. Null Safety (Possible Undefined Access)
**Problem**: Accessing properties on potentially undefined objects.

**Solution**: Store intermediate value to narrow type before accessing nested properties.

**Files Fixed**:
- `src/components/performance/PerformanceMonitor.tsx` - timestamp access

**Pattern**:
```typescript
// Before (Error)
if (!latest[metric.name] || metric.timestamp > latest[metric.name]?.timestamp) {

// After (Fixed)
const existingMetric = latest[metric.name];
if (!existingMetric || metric.timestamp > existingMetric.timestamp) {
```

### 6. Index Signature Property Access
**Problem**: Properties from index signatures must be accessed with bracket notation.

**Solution**: Use bracket notation for dynamic property access.

**Files Fixed**:
- `src/lib/validation/hooks.ts` - recoveryFailed
- `src/lib/validation/wreath.ts` - fallbackValue

**Pattern**:
```typescript
// Before (Error)
error.context?.recoveryFailed

// After (Fixed)
error.context?.["recoveryFailed"]
```

### 7. Unused Variables
**Problem**: Variables declared but never used.

**Solution**: Remove unused variables and their initialization.

**Files Fixed**:
- `src/components/monitoring/WebVitalsTracker.tsx` - isMounted state

### 8. Missing Exports
**Problem**: Exporting non-existent members from modules.

**Solution**: Remove invalid exports.

**Files Fixed**:
- `src/components/monitoring/index.ts` - removed useWebVitals export

## Key Takeaways

1. **Always use useCallback** for functions that are dependencies in useEffect
2. **Use ?? false** for optional boolean values that need to be strictly boolean
3. **Use delete** instead of assigning undefined to optional properties
4. **Use bracket notation** for environment variables and index signature properties
5. **Store intermediate values** to help TypeScript narrow types for null safety
6. **Clean up unused code** to maintain strict mode compliance

## Verification
All 37 errors resolved. Type-check passes with exit code 0.

```bash
npm run type-check
# Exit Code: 0 ✓
```
