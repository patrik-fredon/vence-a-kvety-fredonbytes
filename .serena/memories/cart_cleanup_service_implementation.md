# Cart Cleanup Service Implementation

## Date
January 10, 2025

## Overview
Implemented automated cart cleanup service for the Stripe embedded checkout enhancement spec (Task 4).

## Files Created

### 1. Cart Cleanup Service
**File:** `src/lib/services/cart-cleanup-service.ts`

**Purpose:** Core service for cleaning up abandoned carts

**Key Functions:**
- `cleanupAbandonedCarts()` - Main cleanup function that:
  - Queries cart items older than 24 hours from database
  - Groups items by user_id/session_id to identify unique carts
  - Checks if cart is associated with completed order
  - Deletes cart items from database
  - Clears cart cache from Redis
  - Returns cleanup statistics

**Features:**
- Graceful error handling - continues processing other carts if one fails
- Comprehensive logging with cart age calculation
- Returns detailed statistics (cartsDeleted, itemsDeleted, errors, duration)
- Uses service role client for database operations

### 2. Cron Job API Endpoint
**File:** `src/app/api/cron/cleanup-carts/route.ts`

**Purpose:** HTTP endpoint for scheduled cart cleanup

**Endpoints:**
- `POST /api/cron/cleanup-carts` - Triggers cleanup
- `GET /api/cron/cleanup-carts` - Health check

**Authentication:**
- Uses `CRON_SECRET` environment variable
- Supports both "Bearer <token>" and direct token formats
- Returns 401 if authentication fails
- Warns if CRON_SECRET not configured

**Response Format:**
```json
{
  "success": true,
  "cartsDeleted": 5,
  "itemsDeleted": 12,
  "errors": [],
  "duration": 1234,
  "timestamp": "2025-01-10T12:00:00.000Z"
}
```

## Implementation Details

### Cart Age Calculation
- Cutoff time: 24 hours ago
- Carts older than cutoff are candidates for deletion

### Order Association Check
- Queries orders table for completed orders (confirmed, processing, shipped, delivered)
- Matches by user_id or session_id in customer_info
- Preserves carts associated with orders

### Redis Cache Cleanup
- Uses existing `clearCartCache()` function from cart-cache.ts
- Clears both cart configuration and price calculation caches
- Continues cleanup even if cache clearing fails

### Error Handling
- Try-catch around each cart processing
- Collects errors in array without stopping cleanup
- Logs all errors with context
- Returns partial success with error details

## Environment Variables

### Required
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for database operations
- `UPSTASH_REDIS_REST_URL` - Redis URL for cache operations
- `UPSTASH_REDIS_REST_TOKEN` - Redis token

### Optional
- `CRON_SECRET` - Secret token for authenticating cron job requests

## Scheduling

The endpoint can be scheduled using:
1. **Vercel Cron Jobs** - Add to vercel.json:
```json
{
  "crons": [{
    "path": "/api/cron/cleanup-carts",
    "schedule": "0 * * * *"
  }]
}
```

2. **External Scheduler** - Use any cron service that can make HTTP POST requests with Authorization header

## Testing

To test manually:
```bash
curl -X POST http://localhost:3000/api/cron/cleanup-carts \
  -H "Authorization: Bearer your-cron-secret"
```

Health check:
```bash
curl -X GET http://localhost:3000/api/cron/cleanup-carts \
  -H "Authorization: Bearer your-cron-secret"
```

## Requirements Satisfied

- ✅ 6.1 - Record cart creation timestamp (uses existing created_at field)
- ✅ 6.2 - Scheduled cleanup job runs (API endpoint ready for scheduling)
- ✅ 6.3 - Delete carts older than 24 hours not associated with orders
- ✅ 6.4 - Delete cart items along with carts
- ✅ 6.5 - Log number of carts cleaned up
- ✅ 6.6 - Handle errors gracefully without stopping cleanup

## Next Steps

1. Add CRON_SECRET to environment variables
2. Configure Vercel Cron Job or external scheduler
3. Monitor cleanup execution logs
4. Adjust cleanup frequency if needed (currently designed for hourly)
