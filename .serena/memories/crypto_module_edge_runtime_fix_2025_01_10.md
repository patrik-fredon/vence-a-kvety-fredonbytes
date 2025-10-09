# Crypto Module Edge Runtime Build Fix - January 10, 2025

## Issue
Build was failing with error:
```
Module not found: Can't resolve 'crypto'
Module not found: Can't resolve 'node:crypto'
```

## Root Cause
The API route `/api/checkout/create-session/route.ts` was configured with `export const runtime = "edge"`, but it imported modules that use Node.js built-in `crypto` module:

1. **src/lib/security/csrf.ts** - Uses `import { createHash, randomBytes } from "node:crypto"` for CSRF token generation
2. **src/lib/stripe/embedded-checkout.ts** - Uses `import { createHash } from "crypto"` for cart hashing

Edge Runtime doesn't support Node.js built-in modules like `crypto`, `fs`, `path`, etc.

## Solution
Changed the runtime configuration from Edge to Node.js:

**File**: `src/app/api/checkout/create-session/route.ts`
```typescript
// Before
export const runtime = "edge";

// After
export const runtime = "nodejs";
```

## Why This Route Needs Node.js Runtime
1. **CSRF Protection** - Requires crypto for secure token generation
2. **Cart Hashing** - Uses crypto for cache key generation
3. **Supabase Operations** - Better suited for Node.js runtime
4. **Stripe Integration** - Full Stripe SDK works better in Node.js runtime

## Additional Fixes
Also removed unused variables to pass TypeScript strict checks:
- Removed unused `header` parameter in `DateSelector.tsx`
- Removed unused `monthNames` variable in `DateSelector.tsx`
- Removed unused `getOptionHeader` function in `ProductCustomizer.tsx`

## Build Result
✅ Build successful with all routes compiled correctly
✅ TypeScript type checking passed
✅ No runtime errors

## Notes
- Other API routes (`/api/checkout/cancel`, `/api/checkout/complete`) remain on Edge Runtime as they don't use crypto
- Edge Runtime is still used where appropriate for better performance
- This change doesn't affect functionality, only the runtime environment
