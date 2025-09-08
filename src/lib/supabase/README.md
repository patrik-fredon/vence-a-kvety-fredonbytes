# Supabase Database Setup

This directory contains all the necessary files to set up the Supabase database for the Pohřební věnce e-commerce platform.

## Files Overview

- `client.ts` - Client-side Supabase configuration
- `server.ts` - Server-side Supabase configuration with admin client
- `database.types.ts` - TypeScript types generated from the database schema
- `schema.sql` - Database schema with tables and indexes
- `rls-policies.sql` - Row Level Security policies
- `functions.sql` - Database functions and triggers
- `setup.sql` - Complete setup script combining all SQL files

## Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be fully initialized
3. Note down your project URL and API keys

### 2. Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`
2. Fill in your Supabase credentials:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

### 3. Run Database Setup

1. Open your Supabase project dashboard
2. Go to the SQL Editor
3. Copy and paste the contents of `setup.sql`
4. Run the script to create all tables, functions, and policies

### 4. Verify Setup

After running the setup script, you should have the following tables:

- `categories` - Product categories with multilingual support
- `products` - Products with customization options
- `user_profiles` - Extended user information
- `orders` - Order management with status tracking
- `cart_items` - Persistent shopping cart
- `order_status_log` - Order status change history

## Database Schema Overview

### Categories

- Hierarchical structure with parent-child relationships
- Multilingual support (Czech/English)
- SEO-friendly slugs
- Active/inactive status

### Products

- Multilingual product information
- JSONB fields for images, customization options, and metadata
- Price management with decimal precision
- Category relationships
- Availability tracking

### User Profiles

- Extends Supabase auth.users
- JSONB fields for addresses and preferences
- Admin role support

### Orders

- Complete order information in JSONB format
- Status tracking with enum type
- User association (optional for guest orders)
- Automatic order number generation

### Cart Items

- Supports both authenticated and anonymous users
- Session-based cart for anonymous users
- Product customizations stored as JSONB

## Security Features

### Row Level Security (RLS)

- All tables have RLS enabled
- Users can only access their own data
- Admin users have elevated permissions
- Public read access for active products and categories

### Data Protection

- Automatic user profile creation on signup
- Secure admin role checking
- Input validation through database constraints
- Audit trail for order status changes

## Database Functions

### Available Delivery Dates

```sql
SELECT * FROM get_available_delivery_dates('2024-01-01', '2024-01-31');
```

### Delivery Cost Calculation

```sql
SELECT calculate_delivery_cost(
  '{"city": "Prague", "postal_code": "11000"}'::jsonb,
  '[{"weight": 3.5, "quantity": 1}]'::jsonb,
  '2024-01-15'::date
);
```

### Product Availability Update

```sql
SELECT update_product_availability(
  'product-uuid',
  '{"in_stock": true, "quantity": 50}'::jsonb
);
```

## Maintenance

### Regular Cleanup

The database includes a function to clean up old anonymous cart items:

```sql
SELECT cleanup_old_cart_items();
```

Consider running this weekly via a cron job or Supabase Edge Function.

### Monitoring

- Order status changes are logged in `order_status_log`
- All tables have `created_at` and `updated_at` timestamps
- Indexes are optimized for common query patterns

## Development Notes

- Use the `supabase` client for browser-side operations
- Use `supabaseAdmin` for server-side admin operations
- Use `createServerClient()` for server-side user operations
- Always handle errors appropriately when calling database functions
- Test RLS policies thoroughly before production deployment

## Type Safety

The `database.types.ts` file provides full TypeScript support for:

- Table row types
- Insert/update types
- Function parameter and return types
- Enum values

Update this file whenever you modify the database schema using:

```bash
npx supabase gen types typescript --project-id your-project-id > src/lib/supabase/database.types.ts
```
