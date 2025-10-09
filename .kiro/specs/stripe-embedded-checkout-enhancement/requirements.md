# Requirements Document

## Introduction

This feature enhances the existing Stripe embedded checkout implementation with comprehensive webhook handling, email automation, cart cleanup, and improved error handling. The system currently has basic Stripe integration but lacks robust email notifications, automated cart cleanup, and comprehensive webhook processing.

## Requirements

### Requirement 1: Webhook Event Processing

**User Story:** As a system administrator, I want reliable webhook processing so that all payment events are properly handled and recorded.

#### Acceptance Criteria

1. WHEN a Stripe webhook event is received THEN the system SHALL verify the webhook signature using STRIPE_WEBHOOK_SECRET
2. WHEN a webhook event is received THEN the system SHALL check for duplicate events to ensure idempotency
3. WHEN a duplicate event is detected THEN the system SHALL return success without reprocessing
4. WHEN a webhook event fails processing THEN the system SHALL log the error with full context for debugging
5. IF webhook processing fails THEN the system SHALL return appropriate HTTP status codes for Stripe retry logic
6. WHEN a webhook event is successfully processed THEN the system SHALL record the event in the webhook_events table

### Requirement 2: Order Creation from Webhook

**User Story:** As a customer, I want my order to be created only after successful payment so that I'm not charged for incomplete orders.

#### Acceptance Criteria

1. WHEN a `checkout.session.completed` event is received THEN the system SHALL create an order in the database
2. WHEN creating an order THEN the system SHALL extract all line items from the Stripe session
3. WHEN creating an order THEN the system SHALL include customer information (name, email, phone, address)
4. WHEN creating an order THEN the system SHALL include delivery method (delivery or pickup) from session metadata
5. WHEN creating an order THEN the system SHALL calculate and store subtotal, delivery cost, and total amount
6. WHEN creating an order THEN the system SHALL generate a unique order number
7. WHEN creating an order THEN the system SHALL set order status to "confirmed"
8. IF order creation fails THEN the system SHALL log the error and allow Stripe to retry the webhook

### Requirement 3: Email Notification System

**User Story:** As a customer, I want to receive an order confirmation email after successful payment so that I have a record of my purchase.

#### Acceptance Criteria

1. WHEN an order is successfully created THEN the system SHALL send a confirmation email to the customer
2. WHEN sending customer email THEN the system SHALL include order number, items, total amount, and delivery information
3. WHEN sending customer email THEN the system SHALL use a responsive HTML template with funeral-appropriate styling
4. WHEN sending customer email THEN the system SHALL include order tracking information
5. WHEN sending customer email THEN the system SHALL be localized based on the order locale (Czech or English)
6. IF email sending fails THEN the system SHALL log the error but not fail the order creation

### Requirement 4: Admin Email Notifications

**User Story:** As a business owner, I want to receive email notifications for new orders so that I can fulfill them promptly.

#### Acceptance Criteria

1. WHEN an order is successfully created THEN the system SHALL send a notification email to ADMIN_EMAIL
2. WHEN sending admin email THEN the system SHALL include all order details (customer info, items, delivery method, payment info)
3. WHEN sending admin email THEN the system SHALL include a direct link to the order in the admin dashboard
4. WHEN sending admin email THEN the system SHALL highlight urgent delivery dates if applicable
5. IF admin email sending fails THEN the system SHALL log the error but not fail the order creation

### Requirement 5: SMTP Integration

**User Story:** As a developer, I want to use Supabase SMTP for email delivery so that emails are reliably sent.

#### Acceptance Criteria

1. WHEN the system initializes THEN it SHALL validate SMTP configuration environment variables
2. WHEN sending emails THEN the system SHALL use Supabase SMTP server with proper authentication
3. WHEN sending emails THEN the system SHALL handle SMTP errors gracefully with retry logic
4. WHEN SMTP connection fails THEN the system SHALL log detailed error information
5. WHEN emails are sent THEN the system SHALL log success with message ID for tracking

### Requirement 6: Cart Cleanup Automation

**User Story:** As a system administrator, I want abandoned carts to be automatically cleaned up so that the database doesn't accumulate stale data.

#### Acceptance Criteria

1. WHEN a cart is created THEN the system SHALL record the creation timestamp
2. WHEN a scheduled cleanup job runs THEN the system SHALL identify carts older than 24 hours
3. WHEN a cart is older than 24 hours AND not associated with a completed order THEN the system SHALL delete the cart
4. WHEN cleaning up carts THEN the system SHALL also delete associated cart items
5. WHEN cart cleanup runs THEN the system SHALL log the number of carts cleaned up
6. WHEN cart cleanup encounters errors THEN the system SHALL log errors but continue processing other carts

### Requirement 7: Payment Status Tracking

**User Story:** As a customer, I want accurate payment status updates so that I know the state of my payment.

#### Acceptance Criteria

1. WHEN a `payment_intent.succeeded` event is received THEN the system SHALL update order payment status to "completed"
2. WHEN a `payment_intent.payment_failed` event is received THEN the system SHALL update order status to "cancelled"
3. WHEN a `payment_intent.requires_action` event is received THEN the system SHALL update order status to "requires_action"
4. WHEN a `payment_intent.processing` event is received THEN the system SHALL update order status to "processing"
5. WHEN a `payment_intent.canceled` event is received THEN the system SHALL update order status to "canceled"
6. WHEN updating payment status THEN the system SHALL record the transaction ID, amount, currency, and timestamp

### Requirement 8: Error Handling and Recovery

**User Story:** As a developer, I want comprehensive error handling so that payment failures are properly managed and recoverable.

#### Acceptance Criteria

1. WHEN any webhook processing step fails THEN the system SHALL log the error with full context
2. WHEN a recoverable error occurs THEN the system SHALL return HTTP 500 to trigger Stripe retry
3. WHEN a non-recoverable error occurs THEN the system SHALL return HTTP 400 to prevent retries
4. WHEN order creation fails THEN the system SHALL preserve the Stripe session data for manual recovery
5. WHEN email sending fails THEN the system SHALL queue the email for retry without failing the order

### Requirement 9: Environment Configuration

**User Story:** As a developer, I want clear environment variable documentation so that I can properly configure the system.

#### Acceptance Criteria

1. WHEN deploying the system THEN all required environment variables SHALL be documented
2. WHEN the system starts THEN it SHALL validate all required environment variables are present
3. WHEN environment validation fails THEN the system SHALL log clear error messages indicating missing variables
4. WHEN using Stripe THEN the system SHALL require STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
5. WHEN using email THEN the system SHALL require SMTP configuration variables and ADMIN_EMAIL

### Requirement 10: Success and Error Page Enhancement

**User Story:** As a customer, I want clear feedback after payment so that I know whether my order was successful.

#### Acceptance Criteria

1. WHEN payment succeeds THEN the system SHALL redirect to `/checkout/success` with session_id parameter
2. WHEN on success page THEN the system SHALL display order confirmation with order number
3. WHEN on success page THEN the system SHALL clear the cart from Redis
4. WHEN payment fails THEN the system SHALL redirect to `/checkout/error` with error information
5. WHEN on error page THEN the system SHALL display helpful error message and recovery options
6. WHEN on error page THEN the system SHALL preserve cart data for retry
