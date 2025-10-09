# DateSelector Off-by-One Error Fix

**Date:** 2025-10-09
**Component:** `src/components/product/DateSelector.tsx`

## Problem

Users experienced an off-by-one error when selecting dates in the DateSelector component:
- Clicking on day 12 would register as day 11
- Minimum order date was 3 days instead of required 2 days
- Date selection boundaries were not inclusive

## Root Causes

1. **Timezone Conversion Issue**: The `handleDateSelect` function used `toISOString().split("T")[0]` which converts to UTC, causing dates to shift by one day depending on local timezone
2. **Incorrect Default**: `minDaysFromNow` was set to 3 instead of 2
3. **Exclusive Boundaries**: `isDateSelectable` used strict inequality (`>` and `<`) instead of inclusive (`>=` and `<=`)

## Solution

### Fix 1: Timezone-Safe Date Formatting
Changed `handleDateSelect` to format dates using local date components:
```typescript
// Before
const dateString: string = date.toISOString().split("T")[0] as string;

// After
const year = date.getFullYear();
const month = String(date.getMonth() + 1).padStart(2, '0');
const day = String(date.getDate()).padStart(2, '0');
const dateString = `${year}-${month}-${day}`;
```

### Fix 2: Minimum Days Adjustment
```typescript
// Before
minDaysFromNow = 3,

// After
minDaysFromNow = 2,
```

### Fix 3: Inclusive Date Range
```typescript
// Before
return dateOnly > minDateOnly && dateOnly < maxDateOnly;

// After
return dateOnly >= minDateOnly && dateOnly <= maxDateOnly;
```

## Impact

- Users can now select dates exactly 2 days in advance
- Selected dates display correctly without off-by-one errors
- Boundary dates (min and max) are now selectable
- No timezone-related date shifting

## Validation

- TypeScript diagnostics: Clean (no errors)
- All three fixes applied successfully
