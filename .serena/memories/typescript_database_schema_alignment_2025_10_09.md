# TypeScript Database Schema Alignment - October 9, 2025

## Summary
Fixed all TypeScript errors related to database schema misalignment. The code was trying to access fields that don't exist in the actual Supabase database schema.

## Key Issues Fixed

### 1. Missing Database Fields
The code referenced fields that don't exist in the database:
- `orders.internal_notes` → Use `orders.notes` instead
- `orders.confirmed_at`, `shipped_at`, `delivered_at`, `cancelled_at` → These timestamp fields don't exist; only `created_at` and `updated_at` are available
- `products.stock_quantity`, `track_inventory` → Use `products.availability` JSONB field instead
- `order_status` enum → Doesn't exist; use string literal type instead

### 2. Null Handling for Date Constructors
Fixed multiple instances where `string | null` values were passed to `Date()` constructor:
- Pattern: `new Date(value)` → `new Date(value || new Date().toISOString())`
- Affected files:
  - `src/app/api/orders/[id]/route.ts`
  - `src/app/api/orders/route.ts`
  - `src/app/api/cart/items/[id]/route.ts`
  - `src/app/api/cart/items/route.ts`
  - `src/app/sitemap.ts`
  - `src/lib/security/gdpr.ts`

### 3. Order Creation Missing Required Fields
Fixed `src/app/api/orders/route.ts`:
- Added `order_number` field (required)
- Added `subtotal` field (required)
- Added `delivery_cost` field

### 4. Inventory Management
Fixed `src/app/api/admin/products/[id]/inventory/route.ts`:
- Changed from non-existent `updateProductInventory()` to `updateProductAvailability()`
- Store inventory data in `availability` JSONB field with structure:
  ```typescript
  {
    inStock: boolean,
    stockQuantity: number,
    trackInventory: boolean
  }
  ```

### 5. Admin Authentication Pattern
Fixed inventory route to use `withAdminAuth` wrapper correctly:
```typescript
export const PUT = withAdminAuth(
  async (request: NextRequest, admin, { params }) => {
    // admin is automatically provided by wrapper
  }
)
```

### 6. Order Status History
Fixed `src/app/api/orders/[id]/history/route.ts`:
- Added null checks for `order.status` before using `.includes()`
- Ensured all timestamps have fallback values

### 7. Contact Forms Status
Fixed `src/app/[locale]/admin/contact-forms/page.tsx`:
- Added null check for `form.status` before using as object key

### 8. Sitemap Generation
Fixed `src/app/sitemap.ts`:
- Added null handling for `category.sort_order`
- Fixed Date constructor calls for `updated_at` and `created_at`
- Fixed incorrect variable reference (`category` → `product`)

### 9. Order Service Type
Fixed `src/lib/services/order-service.ts`:
- Removed non-existent `Database["public"]["Enums"]["order_status"]`
- Used string literal type instead: `"pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"`

## Database Schema Reference

### Orders Table (Actual Schema)
```sql
- order_number: string (required)
- user_id: string | null
- customer_info: JSONB
- delivery_info: JSONB
- delivery_cost: number | null
- payment_info: JSONB | null
- items: JSONB
- subtotal: number (required)
- total_amount: number (required)
- status: string | null
- notes: string | null
- created_at: string | null
- updated_at: string | null
```

### Products Table (Actual Schema)
```sql
- id: string
- name_cs, name_en: string
- slug: string
- base_price: number
- category_id: string | null
- images: JSONB | null
- customization_options: JSONB | null
- availability: JSONB | null  ← Use this for inventory
- seo_metadata: JSONB | null
- active: boolean | null
- featured: boolean | null
- stripe_product_id: string | null
- stripe_price_id: string | null
- created_at: string | null
- updated_at: string | null
```

## Pattern for Future Development

### Always Check Database Schema First
Before accessing database fields, verify they exist in:
1. `src/lib/supabase/database.types.ts`
2. `supabase/migrations/*.sql`

### Null Handling Pattern
```typescript
// For Date constructors
new Date(value || new Date().toISOString())

// For string operations
const status = value || "default";

// For numeric operations
const sortOrder = value || 0;

// For array includes
if (value && array.includes(value))
```

### JSONB Field Usage
When database doesn't have dedicated columns, use JSONB fields:
- `availability` for inventory data
- `customer_info`, `delivery_info`, `payment_info` for order details
- `customization_options` for product options

## Verification
All TypeScript errors resolved:
```bash
npm run type-check
# ✓ No errors
```

## Related Files Modified
- src/app/api/orders/route.ts
- src/app/api/orders/[id]/route.ts
- src/app/api/orders/[id]/history/route.ts
- src/app/api/admin/orders/route.ts
- src/app/api/admin/orders/[id]/status/route.ts
- src/app/api/admin/products/[id]/inventory/route.ts
- src/app/api/cart/items/route.ts
- src/app/api/cart/items/[id]/route.ts
- src/app/[locale]/admin/contact-forms/page.tsx
- src/app/sitemap.ts
- src/lib/security/gdpr.ts
- src/lib/services/order-service.ts
