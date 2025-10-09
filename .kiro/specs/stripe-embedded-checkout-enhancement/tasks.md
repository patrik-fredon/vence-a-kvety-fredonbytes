# Implementation Plan

- [x] 1. Database Setup and Migrations
  - Create `webhook_events` table for event deduplication and tracking
  - Add indexes for efficient querying by event_id and created_at
  - Test migration in development environment
  - _Requirements: 1.2, 1.6_

- [-] 2. Email Infrastructure Setup
  - [ ] 2.1 Create SMTP client configuration
    - Implement `src/lib/email/smtp-client.ts` with nodemailer
    - Configure Supabase SMTP connection with TLS
    - Add environment variable validation for SMTP settings
    - Implement connection pooling and retry logic
    - _Requirements: 5.1, 5.2, 5.3, 9.5_

  - [ ] 2.2 Create email template system
    - Set up React Email for type-safe templates
    - Create base template with funeral-appropriate styling (teal/amber)
    - Implement responsive layout for mobile and desktop
    - Add localization support for Czech and English
    - _Requirements: 3.3, 3.5_

  - [ ] 2.3 Implement customer confirmation email template
    - Create `src/lib/email/templates/customer-confirmation.tsx`
    - Include order number, items list, and total amount
    - Add delivery information (address or pickup location)
    - Include order tracking link
    - Add company branding and contact information
    - _Requirements: 3.1, 3.2, 3.4_

  - [ ] 2.4 Implement admin notification email template
    - Create `src/lib/email/templates/admin-notification.tsx`
    - Include all order details and customer information
    - Add direct link to order in admin dashboard
    - Highlight urgent delivery dates
    - Format for easy processing
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ] 2.5 Create email service with retry logic
    - Implement `src/lib/email/order-notifications.ts`
    - Add `sendCustomerConfirmation()` function
    - Add `sendAdminNotification()` function
    - Implement exponential backoff retry logic (3 attempts)
    - Add comprehensive error handling and logging
    - _Requirements: 3.6, 4.5, 5.3, 5.4, 5.5_

- [ ] 3. Webhook Handler Enhancement
  - [ ] 3.1 Implement webhook event deduplication
    - Add function to check if event_id exists in webhook_events table
    - Return early with success if duplicate detected
    - Use database unique constraint for race condition protection
    - _Requirements: 1.2, 1.3_

  - [ ] 3.2 Implement webhook event recording
    - Create function to insert event record into webhook_events table
    - Store event_id, event_type, status, and payload
    - Handle database errors gracefully
    - _Requirements: 1.6_

  - [ ] 3.3 Enhance checkout.session.completed handler
    - Extract order data from Stripe session
    - Create order in Supabase database
    - Handle order creation errors with proper logging
    - Return appropriate HTTP status codes
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

  - [ ] 3.4 Integrate email notifications in webhook
    - Call `sendCustomerConfirmation()` after order creation
    - Call `sendAdminNotification()` after order creation
    - Handle email failures without failing order creation
    - Log email sending results
    - _Requirements: 3.1, 3.6, 4.1, 4.5_

  - [ ] 3.5 Enhance payment status tracking
    - Update handlers for payment_intent.succeeded
    - Update handlers for payment_intent.payment_failed
    - Update handlers for payment_intent.requires_action
    - Update handlers for payment_intent.processing
    - Update handlers for payment_intent.canceled
    - Record transaction details in order payment_info
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

  - [ ] 3.6 Improve error handling and logging
    - Add structured logging with context for all webhook events
    - Implement proper HTTP status code returns (400 vs 500)
    - Add error context preservation for debugging
    - Log all errors with full stack traces
    - _Requirements: 1.4, 1.5, 8.1, 8.2, 8.3, 8.4_

- [ ] 4. Cart Cleanup Service
  - [ ] 4.1 Implement cart cleanup logic
    - Create `src/lib/services/cart-cleanup-service.ts`
    - Implement function to query all carts from Redis
    - Add logic to check cart age (> 24 hours)
    - Verify cart is not associated with completed order
    - Delete cart and cart items from Redis
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [ ] 4.2 Add cleanup logging and error handling
    - Log number of carts and items deleted
    - Handle errors gracefully without stopping cleanup
    - Return cleanup statistics
    - _Requirements: 6.5, 6.6_

  - [ ] 4.3 Create cron job API endpoint
    - Implement `src/app/api/cron/cleanup-carts/route.ts`
    - Add authentication/authorization for cron endpoint
    - Call cart cleanup service
    - Return cleanup results
    - _Requirements: 6.2_

  - [ ]* 4.4 Configure scheduled execution
    - Set up Vercel Cron Job or external scheduler
    - Configure to run every hour
    - Add monitoring for job execution
    - _Requirements: 6.2_

- [ ] 5. Success and Error Page Enhancement
  - [ ] 5.1 Enhance checkout success page
    - Update `src/app/[locale]/checkout/success/page.tsx`
    - Fetch order details using session_id
    - Display order number and confirmation message
    - Show order summary with items
    - Clear cart from Redis
    - Add order tracking link
    - _Requirements: 10.1, 10.2, 10.3_

  - [ ] 5.2 Enhance checkout error page
    - Update `src/app/[locale]/checkout/error/page.tsx`
    - Display user-friendly error message
    - Preserve cart data for retry
    - Add "Return to Cart" button
    - Add "Try Again" button
    - Include contact support link
    - _Requirements: 10.4, 10.5, 10.6_

- [ ] 6. Environment Configuration and Documentation
  - [ ] 6.1 Update environment variable validation
    - Add validation for SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
    - Add validation for SMTP_FROM_EMAIL, SMTP_FROM_NAME
    - Add validation for ADMIN_EMAIL
    - Add validation for STRIPE_WEBHOOK_SECRET
    - Provide clear error messages for missing variables
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [ ] 6.2 Create environment variable documentation
    - Document all required Stripe variables
    - Document all required SMTP variables
    - Document ADMIN_EMAIL usage
    - Add example values and descriptions
    - Include setup instructions
    - _Requirements: 9.1_

- [ ] 7. Testing and Validation
  - [ ]* 7.1 Test webhook event processing
    - Use Stripe CLI to trigger test events
    - Verify signature verification works
    - Test duplicate event detection
    - Verify order creation
    - Verify email sending
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 3.1_

  - [ ]* 7.2 Test email delivery
    - Send test customer confirmation emails
    - Send test admin notification emails
    - Verify emails in multiple clients (Gmail, Outlook, Apple Mail)
    - Test both Czech and English locales
    - Verify responsive design on mobile
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2_

  - [ ]* 7.3 Test cart cleanup
    - Create test carts with various ages
    - Run cleanup service manually
    - Verify old carts are deleted
    - Verify recent carts are preserved
    - Verify carts with orders are preserved
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [ ]* 7.4 Test success and error pages
    - Test success page with valid session_id
    - Test success page with invalid session_id
    - Verify cart clearing on success
    - Test error page with various error types
    - Verify cart preservation on error
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

  - [ ]* 7.5 Test error handling and recovery
    - Test webhook with invalid signature
    - Test webhook with database errors
    - Test email sending failures
    - Verify proper HTTP status codes
    - Verify error logging
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 8. Deployment and Monitoring
  - [ ]* 8.1 Deploy database migration
    - Run migration in staging environment
    - Verify webhook_events table created
    - Test event recording
    - Deploy to production
    - _Requirements: 1.6_

  - [ ]* 8.2 Configure production environment variables
    - Set all SMTP variables in production
    - Set ADMIN_EMAIL in production
    - Verify STRIPE_WEBHOOK_SECRET is set
    - Test environment variable validation
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [ ]* 8.3 Set up monitoring and alerts
    - Monitor webhook success/failure rates
    - Monitor email delivery rates
    - Monitor cart cleanup execution
    - Set up alerts for high error rates
    - _Requirements: 1.4, 1.5_

  - [ ]* 8.4 Configure Stripe webhook endpoint
    - Add production webhook URL in Stripe dashboard
    - Configure webhook events to listen for
    - Test webhook delivery
    - Verify signature verification
    - _Requirements: 1.1_
