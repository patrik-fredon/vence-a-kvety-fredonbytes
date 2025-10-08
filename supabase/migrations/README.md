# Database Migrations

This directory contains SQL migration files for the Supabase database.

## Migration Files

### Core Schema
- `20241216000000_create_main_schema.sql` - Main database schema (categories, products, orders, cart_items, user_profiles)
- `20241216000001_create_contact_forms_simple.sql` - Contact forms table
- `20241230000000_add_cart_items_price_fields.sql` - Cart items price tracking

### Performance & Monitoring
- `20250108000000_create_performance_monitoring.sql` - Performance metrics tracking (web vitals, bundle sizes, general metrics)
- `20250108000001_create_webhook_events.sql` - Webhook event logging
- `20250108000002_add_product_query_indexes.sql` - Product query optimization indexes
- `20250108000003_create_payment_errors.sql` - Payment error tracking and monitoring

## Running Migrations

### Local Development
```bash
# Start Supabase locally
npx supabase start

# Apply migrations
npx supabase db push

# Reset database (caution: deletes all data)
npx supabase db reset
```

### Production
Migrations are automatically applied when pushed to the Supabase project:

```bash
# Login to Supabase
npx supabase login

# Link to your project
npx supabase link --project-ref your-project-ref

# Push migrations
npx supabase db push
```

## Creating New Migrations

```bash
# Create a new migration file
npx supabase migration new migration_name

# Edit the generated file in supabase/migrations/
```

## Migration Naming Convention

Format: `YYYYMMDDHHMMSS_description.sql`

Example: `20250108000003_create_payment_errors.sql`

## Payment Errors Table

The `payment_errors` table tracks payment failures and errors for monitoring and debugging:

### Fields
- `id` - UUID primary key
- `order_id` - Reference to orders table (nullable)
- `payment_intent_id` - Stripe payment intent ID (nullable)
- `error_type` - Type of error (required)
- `error_code` - Error code from payment provider (nullable)
- `error_message` - Full error message (required)
- `sanitized_message` - User-friendly error message (required)
- `amount` - Transaction amount (nullable)
- `currency` - Currency code (nullable)
- `customer_email` - Customer email (nullable)
- `metadata` - Additional context as JSONB (nullable)
- `stack_trace` - Error stack trace for debugging (nullable)
- `created_at` - Timestamp of error

### Indexes
- `idx_payment_errors_created_at` - For time-based queries
- `idx_payment_errors_order_id` - For order lookup
- `idx_payment_errors_payment_intent_id` - For payment intent lookup
- `idx_payment_errors_error_type` - For error type filtering
- `idx_payment_errors_customer_email` - For customer support

### RLS Policies
- Admin users can view all payment errors
- Service role can insert payment errors
- Regular users cannot access payment errors directly

## Notes

- All tables have Row Level Security (RLS) enabled
- Timestamps use `TIMESTAMPTZ` for timezone awareness
- Foreign keys use `ON DELETE SET NULL` or `ON DELETE CASCADE` as appropriate
- Indexes are created for common query patterns
