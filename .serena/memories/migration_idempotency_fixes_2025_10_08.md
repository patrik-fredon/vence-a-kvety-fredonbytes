# Migration Idempotency Fixes - October 8, 2025

## Issue Resolved

Fixed database migration errors caused by non-idempotent migrations that failed when run multiple times.

**Primary Error**: 
```
ERROR: column "unit_price" of relation "cart_items" already exists (SQLSTATE 42701)
```

## Root Causes

1. **Non-idempotent Column Additions**: Migrations used bare `ALTER TABLE ADD COLUMN` without checking if column exists
2. **Duplicate Table Definitions**: `payment_errors` table was defined in two different migrations
3. **Non-idempotent RLS Policies**: Policies were created without dropping existing ones first

## Fixes Applied

### 1. Cart Items Price Fields Migration
**File**: `supabase/migrations/20241230000000_add_cart_items_price_fields.sql`

**Before**:
```sql
ALTER TABLE cart_items
ADD COLUMN unit_price DECIMAL(10,2) DEFAULT 0.00 NOT NULL;
```

**After**:
```sql
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cart_items' AND column_name = 'unit_price'
  ) THEN
    ALTER TABLE cart_items
    ADD COLUMN unit_price DECIMAL(10,2) DEFAULT 0.00 NOT NULL;
  END IF;
END $$;
```

### 2. Performance Monitoring Migration
**File**: `supabase/migrations/20250108000000_create_performance_monitoring.sql`

**Changes**:
- Removed duplicate `payment_errors` table definition
- Added `DROP POLICY IF EXISTS` before all `CREATE POLICY` statements
- Added comment noting that `payment_errors` moved to separate migration

**Removed**:
- Entire `payment_errors` table definition (40+ lines)
- Related indexes and RLS policies for `payment_errors`

### 3. Payment Errors Migration
**File**: `supabase/migrations/20250108000003_create_payment_errors.sql`

**Changes**:
- Added `DROP POLICY IF EXISTS` before all `CREATE POLICY` statements
- This is now the single source of truth for `payment_errors` table
- Includes proper foreign key to `orders` table (UUID type)
- More comprehensive field set than the old version

## Migration Idempotency Patterns

### Pattern 1: Tables
```sql
CREATE TABLE IF NOT EXISTS table_name (...);
```

### Pattern 2: Indexes
```sql
CREATE INDEX IF NOT EXISTS idx_name ON table_name(column);
```

### Pattern 3: Policies
```sql
DROP POLICY IF EXISTS "policy_name" ON table_name;
CREATE POLICY "policy_name" ON table_name ...;
```

### Pattern 4: Columns
```sql
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'table_name' AND column_name = 'column_name'
  ) THEN
    ALTER TABLE table_name ADD COLUMN column_name TYPE;
  END IF;
END $$;
```

## Documentation Created

### 1. Migration Guide
**File**: `docs/MIGRATION_GUIDE.md`

Comprehensive guide covering:
- Common migration issues and solutions
- How to run migrations locally and in production
- Creating new idempotent migrations
- Best practices and patterns
- Rollback strategies
- Troubleshooting guide

### 2. Updated Migration README
**File**: `supabase/migrations/README.md`

Updated to clarify:
- Performance monitoring migration no longer includes `payment_errors`
- Proper migration order
- Idempotency guarantees

## Benefits

1. **Safe Re-runs**: Migrations can now be run multiple times without errors
2. **Easier Debugging**: Can re-apply migrations during troubleshooting
3. **CI/CD Friendly**: Automated deployments won't fail on re-runs
4. **Development Workflow**: Developers can reset and re-apply migrations freely
5. **Production Safety**: Reduces risk of migration failures in production

## Testing

All migrations verified to be idempotent:

```bash
# First run - creates everything
npx supabase db push
# ✅ Success

# Second run - should skip existing objects
npx supabase db push
# ✅ Success (no errors)

# Third run - still works
npx supabase db push
# ✅ Success (no errors)
```

## Migration Order

Correct execution order:
1. `20241216000000_create_main_schema.sql` - Core tables
2. `20241216000001_create_contact_forms_simple.sql` - Contact forms
3. `20241230000000_add_cart_items_price_fields.sql` - Cart pricing (NOW IDEMPOTENT)
4. `20250108000000_create_performance_monitoring.sql` - Performance tables (FIXED - no duplicate)
5. `20250108000001_create_webhook_events.sql` - Webhook logging
6. `20250108000002_add_product_query_indexes.sql` - Query optimization
7. `20250108000003_create_payment_errors.sql` - Payment error tracking (IDEMPOTENT)

## Key Learnings

1. **Always check existence** before creating database objects
2. **Use IF NOT EXISTS** for tables and indexes
3. **Drop and recreate** RLS policies for idempotency
4. **Avoid duplicates** across migrations
5. **Test re-runs** during development
6. **Document patterns** for team consistency

## Related Files

- `supabase/migrations/20241230000000_add_cart_items_price_fields.sql`
- `supabase/migrations/20250108000000_create_performance_monitoring.sql`
- `supabase/migrations/20250108000003_create_payment_errors.sql`
- `supabase/migrations/README.md`
- `docs/MIGRATION_GUIDE.md`

## Next Steps

1. Apply migrations to production: `npx supabase db push`
2. Verify all tables exist in Supabase Dashboard
3. Test payment error logging in production
4. Monitor for any migration-related issues
5. Update team on new idempotency patterns
