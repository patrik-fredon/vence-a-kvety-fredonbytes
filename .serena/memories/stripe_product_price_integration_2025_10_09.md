# Stripe Product and Price ID Integration - 2025-10-09

## Task Completed

Added Stripe integration columns to the products table to enable proper Stripe checkout with product-specific and customization-based pricing.

## Changes Made

### 1. Database Migration
**File**: `supabase/migrations/20250109000000_add_stripe_ids_to_products.sql`

- Added `stripe_product_id` (TEXT) column to products table
- Added `stripe_price_id` (TEXT) column to products table
- Created indexes for efficient Stripe ID lookups
- Updated all existing products with their Stripe IDs from the provided CSV data
- Created PostgreSQL helper function `get_stripe_price_id_for_product()` for size-based price selection

### 2. TypeScript Type Updates
**File**: `src/types/product.ts`

- Added `stripeProductId?: string` to Product interface
- Added `stripePriceId?: string` to Product interface
- Added `stripe_product_id: string | null` to ProductRow interface
- Added `stripe_price_id: string | null` to ProductRow interface

### 3. Price Selector Utility
**File**: `src/lib/stripe/price-selector.ts`

Created utility functions for Stripe price ID selection:
- `getStripePriceId()` - Gets correct price ID based on product and customizations
- `getStripeProductId()` - Gets Stripe product ID with validation
- `hasStripeIds()` - Validates product has required Stripe IDs
- `getAvailablePriceIds()` - Returns all price IDs for a product (including size variations)

Handles size-specific pricing for:
- **Plné srdce**: 3 sizes (120, 150, 180)
- **Kulatý věnec**: 3 sizes (120, 150, 180)

### 4. Documentation
**File**: `docs/stripe-integration-guide.md`

Comprehensive guide covering:
- Database schema changes
- Product-price mappings
- Code usage examples
- Testing procedures
- Troubleshooting guide
- Security considerations

## Product Mappings

### Single-Price Products
1. Kříž - 5700 CZK
2. Květina na rakev - 3500 CZK
3. Srdce žluté prázdné uvnitř - 5800 CZK
4. Srdce na urnu - 4900 CZK
5. Srdce červené plné šikmé - 4800 CZK
6. Obdélník s fotografii - 5400 CZK

### Multi-Size Products
1. **Plné srdce** (prod_TCX228reKdLXZU)
   - 120cm: 5700 CZK (default)
   - 150cm: 6700 CZK
   - 180cm: 7700 CZK

2. **Kulatý věnec** (prod_TCWzLVqfsV3rF3)
   - 120cm: 4400 CZK (default)
   - 150cm: 4900 CZK
   - 180cm: 5400 CZK

## Migration Safety

The migration is production-safe:
- Uses `ADD COLUMN IF NOT EXISTS` to prevent errors on re-run
- Uses `WHERE stripe_product_id IS NULL` to prevent overwriting existing data
- Creates indexes with `IF NOT EXISTS`
- All UPDATE statements are idempotent

## Next Steps

1. Run the migration: `npm run db:migrate`
2. Update checkout flow to use `getStripePriceId()` function
3. Test checkout with both single-price and multi-size products
4. Verify Stripe webhook handling includes product metadata
5. Update admin panel to allow editing Stripe IDs

## Usage Example

```typescript
import { getStripePriceId } from "@/lib/stripe/price-selector";

// Get price for customized product
const priceId = getStripePriceId(product, [
  { optionId: "size", choiceIds: ["size_150"], customValue: "150" }
]);

// Create Stripe checkout session
const session = await stripe.checkout.sessions.create({
  mode: "payment",
  line_items: [{ price: priceId, quantity: 1 }],
  // ... other options
});
```

## Files Modified/Created

1. ✅ `supabase/migrations/20250109000000_add_stripe_ids_to_products.sql` (created)
2. ✅ `src/types/product.ts` (modified)
3. ✅ `src/lib/stripe/price-selector.ts` (created)
4. ✅ `docs/stripe-integration-guide.md` (created)

## Testing Checklist

- [ ] Run migration on development database
- [ ] Verify all products have Stripe IDs populated
- [ ] Test `getStripePriceId()` with single-price products
- [ ] Test `getStripePriceId()` with size variations
- [ ] Test Stripe checkout session creation
- [ ] Verify correct prices in Stripe Dashboard
- [ ] Test production migration (dry-run first)
