# Cart Context useEffect Dependency Fix - January 10, 2025

## Issue
TypeScript errors in `src/lib/cart/context.tsx`:
- `TS2448: Block-scoped variable 'syncWithServer' used before its declaration`
- `TS2454: Variable 'syncWithServer' is used before being assigned`

## Root Cause
The online/offline detection `useEffect` hook was placed at the beginning of the `CartProvider` component (around line 235-265) and referenced `syncWithServer` in its dependency array. However, `syncWithServer` was declared much later in the component (around line 672).

This violated JavaScript's temporal dead zone rules - you cannot reference a `const` or `let` variable before it's declared, even in a dependency array.

## Solution
Moved the online/offline detection `useEffect` hook to after the `syncWithServer` function declaration. The hook now appears after line 720, ensuring `syncWithServer` is already defined when the `useEffect` is evaluated.

## Code Structure After Fix
```typescript
// 1. State declarations and refs
// 2. fetchCart callback
// 3. addToCart callback
// 4. removeItem callback
// 5. updateQuantity callback
// 6. clearCart callback
// 7. clearAllItems callback
// 8. refreshCart callback
// 9. syncWithServer callback ← Must be declared before use
// 10. Online/offline detection useEffect ← Moved here
// 11. Periodic sync useEffect
// 12. Load cart useEffect
// 13. Real-time sync functions
// 14. Other effects and context value
```

## Key Learnings
- Always declare functions/variables before using them in dependency arrays
- `useCallback` hooks must be declared before any `useEffect` that depends on them
- TypeScript's strict mode catches these temporal dead zone violations
- The order of hooks matters when they have dependencies on each other

## Files Modified
- `src/lib/cart/context.tsx` - Reordered useEffect hooks to respect declaration order

## Verification
```bash
npm run type-check
# No errors for src/lib/cart/context.tsx
```
