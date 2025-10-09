# Design Document

## Overview

This design enhances the existing Stripe embedded checkout implementation with production-ready features including comprehensive webhook handling, automated email notifications, cart cleanup, and robust error handling. The system builds upon the current implementation which already has Stripe embedded checkout integrated into the payment step.

### Current State

- Stripe embedded checkout is integrated in `PaymentStep.tsx`
- Basic webhook handler exists at `/api/payments/webhook/stripe/route.ts`
- Order creation happens via `checkout.session.completed` webhook
- Cart cleanup is manual via API calls
- Email sending is stubbed but not implemented

### Target State

- Robust webhook processing with idempotency and retry logic
- Automated email notifications for customers and admins
- Scheduled cart cleanup for abandoned carts
- Enhanced success/error pages with proper feedback
- Comprehensive error handling and logging

## Architecture

### System Components

```mermaid
graph TB
    Client[Client Browser]
    PaymentStep[PaymentStep Component]
    CreateSession[/api/checkout/create-session]
    Stripe[Stripe Checkout]
    Webhook[/api/payments/webhook/stripe]
    EmailService[Email Service]
    CartCleanup[Cart Cleanup Job]
    Redis[(Redis Cache)]
    Supabase[(Supabase DB)]
    
    Client --> PaymentStep
    PaymentStep --> CreateSession
    CreateSession --> Redis
    CreateSession --> Supabase
    CreateSession --> Stripe
    Stripe --> Client
    Stripe --> Webhook
    Webhook --> Supabase
    Webhook --> EmailService
    Webhook --> Redis
    EmailService --> Client
    EmailService --> Admin[Admin Email]
    CartCleanup --> Redis
    CartCleanup --> Supabase
```

### Data Flow

1. **Checkout Initiation**
   - User completes review step
   - System creates Stripe checkout session
   - Session cached in Redis with 30-minute TTL
   - Stripe embedded checkout rendered

2. **Payment Processing**
   - User completes payment in Stripe
   - Stripe sends `checkout.session.completed` webhook
   - System verifies webhook signature
   - Order created in Supabase
   - Emails sent to customer and admin
   - Cart cleared from Redis

3. **Cart Cleanup**
   - Scheduled job runs every hour
   - Identifies carts older than 24 hours
   - Deletes abandoned carts and items
   - Logs cleanup statistics

## Components and Interfaces

### 1. Webhook Handler Enhancement

**File:** `src/app/api/payments/webhook/stripe/route.ts`

**Enhancements:**
- Implement webhook event deduplication using `webhook_events` table
- Add comprehensive error handling with appropriate HTTP status codes
- Improve logging with structured context
- Add retry logic for transient failures

**Interface:**
```typescript
interface WebhookEvent {
  id: string;
  type: string;
  data: any;
  created: number;
}

interface WebhookEventRecord {
  event_id: string;
  event_type: string;
  processed_at: string;
  status: 'success' | 'failed';
  error_message?: string;
}
```

### 2. Email Service

**File:** `src/lib/email/order-notifications.ts` (new)

**Purpose:** Handle all order-related email notifications

**Interface:**
```typescript
interface OrderEmailData {
  orderId: string;
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  deliveryCost: number;
  totalAmount: number;
  deliveryMethod: 'delivery' | 'pickup';
  deliveryAddress?: Address;
  pickupLocation?: string;
  locale: 'cs' | 'en';
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

async function sendCustomerConfirmation(data: OrderEmailData): Promise<EmailResult>
async function sendAdminNotification(data: OrderEmailData): Promise<EmailResult>
```

### 3. Email Templates

**Files:** 
- `src/lib/email/templates/customer-confirmation.tsx` (new)
- `src/lib/email/templates/admin-notification.tsx` (new)

**Technology:** React Email for type-safe, responsive templates

**Features:**
- Responsive HTML design
- Funeral-appropriate styling (teal/amber palette)
- Localization support (Czech/English)
- Order summary with itemized list
- Delivery information
- Order tracking link

### 4. SMTP Configuration

**File:** `src/lib/email/smtp-client.ts` (new)

**Purpose:** Configure and manage SMTP connection

**Configuration:**
```typescript
interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: {
    name: string;
    email: string;
  };
}
```

**Implementation:** Use `nodemailer` with Supabase SMTP

### 5. Cart Cleanup Service

**File:** `src/lib/services/cart-cleanup-service.ts` (new)

**Purpose:** Automated cleanup of abandoned carts

**Interface:**
```typescript
interface CleanupResult {
  cartsDeleted: number;
  itemsDeleted: number;
  errors: string[];
}

async function cleanupAbandonedCarts(): Promise<CleanupResult>
```

**Scheduling:** 
- Implement as API route: `/api/cron/cleanup-carts`
- Use Vercel Cron Jobs or external scheduler
- Run every hour

**Logic:**
```typescript
// Pseudocode
1. Query Redis for all cart keys
2. For each cart:
   - Check creation timestamp
   - If > 24 hours old:
     - Check if associated with completed order
     - If not, delete cart and items
3. Log results
```

### 6. Webhook Event Tracking

**Database Table:** `webhook_events`

**Schema:**
```sql
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL CHECK (status IN ('success', 'failed')),
  error_message TEXT,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_webhook_events_event_id ON webhook_events(event_id);
CREATE INDEX idx_webhook_events_created_at ON webhook_events(created_at);
```

### 7. Success/Error Pages Enhancement

**Files:**
- `src/app/[locale]/checkout/success/page.tsx`
- `src/app/[locale]/checkout/error/page.tsx`

**Success Page Features:**
- Display order number
- Show order summary
- Clear cart from Redis
- Provide order tracking link
- Thank you message

**Error Page Features:**
- Display error message
- Preserve cart data
- Offer retry option
- Contact support link
- Return to cart button

## Data Models

### Order Email Data
```typescript
interface OrderEmailData {
  orderId: string;
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
    customizations?: Array<{
      optionName: string;
      value: string;
    }>;
  }>;
  subtotal: number;
  deliveryCost: number;
  totalAmount: number;
  currency: string;
  deliveryMethod: 'delivery' | 'pickup';
  deliveryAddress?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  pickupLocation?: string;
  deliveryDate?: string;
  locale: 'cs' | 'en';
  createdAt: string;
}
```

### Webhook Event Record
```typescript
interface WebhookEventRecord {
  id: string;
  event_id: string;
  event_type: string;
  processed_at: string;
  status: 'success' | 'failed';
  error_message?: string;
  payload: Record<string, any>;
  created_at: string;
}
```

## Error Handling

### Webhook Error Handling

**Strategy:**
1. **Signature Verification Failure** → Return 400 (no retry)
2. **Duplicate Event** → Return 200 (already processed)
3. **Database Error** → Return 500 (Stripe will retry)
4. **Email Failure** → Log error, return 200 (don't fail order)
5. **Unknown Event Type** → Return 200 (ignore gracefully)

**Error Logging:**
```typescript
interface WebhookError {
  eventId: string;
  eventType: string;
  error: string;
  stack?: string;
  timestamp: string;
  retryCount?: number;
}
```

### Email Error Handling

**Strategy:**
1. **SMTP Connection Error** → Retry 3 times with exponential backoff
2. **Invalid Email Address** → Log error, don't retry
3. **Template Rendering Error** → Log error, don't retry
4. **Rate Limit** → Queue for later retry

**Retry Logic:**
```typescript
async function sendEmailWithRetry(
  emailData: OrderEmailData,
  maxRetries = 3
): Promise<EmailResult> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await sendEmail(emailData);
    } catch (error) {
      if (attempt === maxRetries || !isRetryableError(error)) {
        return { success: false, error: error.message };
      }
      await delay(Math.pow(2, attempt) * 1000);
    }
  }
}
```

### Cart Cleanup Error Handling

**Strategy:**
- Continue processing other carts if one fails
- Log all errors for monitoring
- Don't throw exceptions that would stop the job

## Testing Strategy

### Unit Tests

1. **Webhook Handler**
   - Test signature verification
   - Test duplicate event detection
   - Test each event type handler
   - Test error scenarios

2. **Email Service**
   - Test template rendering
   - Test SMTP connection
   - Test retry logic
   - Test localization

3. **Cart Cleanup**
   - Test cart age calculation
   - Test order association check
   - Test deletion logic

### Integration Tests

1. **End-to-End Checkout Flow**
   - Create checkout session
   - Complete payment (test mode)
   - Verify webhook processing
   - Verify order creation
   - Verify email sending

2. **Webhook Processing**
   - Use Stripe CLI to trigger test events
   - Verify database updates
   - Verify email sending
   - Verify idempotency

### Manual Testing

1. **Email Templates**
   - Test in multiple email clients
   - Verify responsive design
   - Test both locales
   - Verify all data displays correctly

2. **Success/Error Pages**
   - Test with valid session ID
   - Test with invalid session ID
   - Test cart clearing
   - Test error scenarios

## Security Considerations

### Webhook Security

1. **Signature Verification**
   - Always verify Stripe signature
   - Use constant-time comparison
   - Reject invalid signatures immediately

2. **Idempotency**
   - Check for duplicate events
   - Use database constraints
   - Return success for duplicates

3. **Rate Limiting**
   - Apply rate limits to webhook endpoint
   - Prevent abuse
   - Log suspicious activity

### Email Security

1. **Data Sanitization**
   - Sanitize all user input in emails
   - Prevent XSS in HTML templates
   - Validate email addresses

2. **SMTP Authentication**
   - Use secure connection (TLS)
   - Store credentials in environment variables
   - Rotate credentials regularly

### Environment Variables

**Required Variables:**
```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# SMTP (Supabase)
SMTP_HOST=smtp.supabase.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM_EMAIL=orders@pohrebni-vence.cz
SMTP_FROM_NAME="Pohřební věnce"

# Admin
ADMIN_EMAIL=admin@pohrebni-vence.cz

# Application
NEXT_PUBLIC_BASE_URL=https://pohrebni-vence.cz
```

## Performance Considerations

### Webhook Processing

1. **Async Operations**
   - Process emails asynchronously
   - Don't block webhook response
   - Use background jobs for heavy operations

2. **Database Queries**
   - Use indexes on frequently queried fields
   - Batch operations where possible
   - Cache frequently accessed data

### Email Sending

1. **Template Caching**
   - Cache compiled templates
   - Reuse SMTP connections
   - Batch emails when possible

2. **Rate Limiting**
   - Respect SMTP rate limits
   - Queue emails if needed
   - Monitor sending metrics

### Cart Cleanup

1. **Batch Processing**
   - Process carts in batches
   - Use cursor-based pagination
   - Limit concurrent operations

2. **Scheduling**
   - Run during off-peak hours
   - Adjust frequency based on load
   - Monitor execution time

## Monitoring and Logging

### Webhook Monitoring

**Metrics to Track:**
- Webhook success/failure rate
- Processing time
- Event types received
- Duplicate event rate
- Error types and frequency

**Logging:**
```typescript
console.log('[Webhook] Processing event', {
  eventId: event.id,
  eventType: event.type,
  timestamp: new Date().toISOString(),
});

console.error('[Webhook] Error processing event', {
  eventId: event.id,
  eventType: event.type,
  error: error.message,
  stack: error.stack,
});
```

### Email Monitoring

**Metrics to Track:**
- Email send success/failure rate
- Delivery time
- Bounce rate
- Open rate (if tracking enabled)

**Logging:**
```typescript
console.log('[Email] Sent confirmation', {
  orderId: order.id,
  recipient: order.customerEmail,
  messageId: result.messageId,
});

console.error('[Email] Failed to send', {
  orderId: order.id,
  recipient: order.customerEmail,
  error: error.message,
});
```

### Cart Cleanup Monitoring

**Metrics to Track:**
- Carts cleaned per run
- Execution time
- Error rate
- Cart age distribution

**Logging:**
```typescript
console.log('[Cleanup] Completed cart cleanup', {
  cartsDeleted: result.cartsDeleted,
  itemsDeleted: result.itemsDeleted,
  duration: executionTime,
  errors: result.errors.length,
});
```

## Migration Plan

### Phase 1: Database Setup
1. Create `webhook_events` table
2. Add indexes
3. Test migrations

### Phase 2: Email Infrastructure
1. Configure SMTP client
2. Create email templates
3. Test email sending
4. Deploy email service

### Phase 3: Webhook Enhancement
1. Implement event deduplication
2. Enhance error handling
3. Add email notifications
4. Test with Stripe CLI

### Phase 4: Cart Cleanup
1. Implement cleanup service
2. Create cron job endpoint
3. Configure scheduler
4. Monitor execution

### Phase 5: UI Enhancement
1. Update success page
2. Update error page
3. Test user flows
4. Deploy to production

## Rollback Plan

If issues arise:
1. **Email Failures** → Disable email sending, queue for manual processing
2. **Webhook Issues** → Revert to previous version, replay missed events
3. **Cart Cleanup Issues** → Disable cleanup job, manual cleanup if needed
4. **Database Issues** → Rollback migration, restore from backup

## Future Enhancements

1. **Email Queue System** → Implement Redis-based email queue for better reliability
2. **Webhook Replay** → Add admin UI to replay failed webhooks
3. **Email Templates** → Add more email types (shipping, delivery confirmation)
4. **Analytics** → Track email open rates and conversion metrics
5. **SMS Notifications** → Add SMS notifications for order updates
