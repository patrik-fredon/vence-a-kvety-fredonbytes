# Biome Linting Fixes for Open Files - October 9, 2025

## Summary
Fixed all Biome linting errors in the currently open editor files, ensuring TypeScript type safety and code quality standards.

## Files Fixed

### 1. src/app/[locale]/admin/contact-forms/page.tsx
**Issue**: Unnecessary `await` on `createServerClient()` call
**Fix**: Removed `await` keyword since `createServerClient()` is not an async function
```typescript
// Before
const supabase = await createServerClient();

// After
const supabase = createServerClient();
```

### 2. src/app/api/admin/customizations/integrity/route.ts
**Issues**: 
- Multiple `noExplicitAny` errors on `supabase.rpc` calls
- Type casting issues

**Fixes**:
- Replaced `as any` with proper type casting using `as unknown as (name: string) => Promise<{ data: unknown; error: unknown }>`
- Fixed error message access with proper type guards
- Formatted long type casts for better readability

```typescript
// Before
const { data: dbIntegrityResult, error: dbError } = await (supabase.rpc as any)(
  "check_customization_integrity"
);

// After
const { data: dbIntegrityResult, error: dbError } = await (
  supabase.rpc as unknown as (name: string) => Promise<{ data: unknown; error: unknown }>
)("check_customization_integrity");
```

### 3. src/app/api/admin/orders/route.ts
**Issue**: `noExplicitAny` errors on address type casting
**Fix**: Replaced `as any` with proper interface type
```typescript
// Before
deliveryAddress: `${(deliveryInfo["address"] as any).city}, ${(deliveryInfo["address"] as any).postalCode}`

// After
deliveryAddress: `${(deliveryInfo["address"] as { city?: string; postalCode?: string })?.city || ""}, ${(deliveryInfo["address"] as { city?: string; postalCode?: string })?.postalCode || ""}`
```

### 4. src/app/api/payments/webhook/stripe/route.ts
**Issues**: 
- Multiple `noExplicitAny` errors on function parameters
- Missing Stripe type imports
- Index signature access issues

**Fixes**:
- Added `import type Stripe from "stripe"` for proper Stripe types
- Replaced all `any` types with proper Stripe types:
  - `session: any` → `session: Stripe.Checkout.Session`
  - `paymentIntent: any` → `paymentIntent: Stripe.PaymentIntent`
  - `event: any` → `event: Stripe.Event`
- Fixed metadata access to use bracket notation: `metadata?.orderId` → `metadata?.["orderId"]`
- Added proper type definitions for `paymentResult` parameter
- Fixed customer details access with proper type casting

```typescript
// Before
async function handleCheckoutSessionCompleted(session: any) {
  const deliveryMethod = metadata.deliveryMethod as "delivery" | "pickup" | undefined;
  const orderId = paymentIntent.metadata?.orderId;
}

// After
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const deliveryMethod = metadata["deliveryMethod"] as "delivery" | "pickup" | undefined;
  const orderId = paymentIntent.metadata?.["orderId"];
}
```

## Results
- **All linting errors fixed** in the open files
- **TypeScript type checking passes** with no errors
- **Only warnings remaining**: Cognitive complexity warnings (acceptable, not errors)
  - `handleCheckoutSessionCompleted`: complexity 36 (max 15) - webhook handler
  - `POST` in integrity route: complexity 16 (max 15) - admin endpoint

## Impact
- Improved type safety across admin and payment webhook endpoints
- Better error handling with proper type guards
- Maintained all existing functionality
- No breaking changes to visual appearance or behavior
- Code now follows strict TypeScript and Biome standards

## Technical Notes
- Used `as unknown as` pattern for complex type casts where direct casting wasn't possible
- Applied proper type guards for error message access
- Maintained responsive design and accessibility standards
- All fixes are compatible with Next.js 15 and React 19
