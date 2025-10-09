# Implementation Plan

- [x] 1. Setup and Configuration
  - Create translation keys for delivery method and checkout messages in both Czech and English
  - Add environment variable validation for Stripe Embedded Checkout
  - _Requirements: 2.10, 8.1, 8.6_

- [x] 2. DateSelector UI Improvements
  - [x] 2.1 Update DateSelector component interface
    - Add optional `header` prop to DateSelectorProps interface
    - Remove input message field from component rendering
    - Maintain all existing calendar functionality
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 2.2 Update DateSelector usage in ProductDetail
    - Pass "Order date" as header prop to DateSelector
    - Verify calendar functionality remains intact
    - Test date selection and validation
    - _Requirements: 1.2, 1.5, 1.6_

  - [x] 2.3 Update DateSelector usage in ProductCustomizer
    - Pass "Order date" as header prop to DateSelector
    - Ensure consistent header styling
    - _Requirements: 1.3, 4.1, 4.4_

- [x] 3. Delivery Method Selection Component
  - [x] 3.1 Create DeliveryMethodSelector component
    - Create `src/components/product/DeliveryMethodSelector.tsx`
    - Implement radio button interface for delivery/pickup selection
    - Add "Free delivery" badge for delivery option
    - Display company address and hours for pickup option
    - Implement responsive design for mobile and desktop
    - _Requirements: 2.1, 2.2, 2.5, 2.6, 2.10_

  - [x] 3.2 Add delivery method translations
    - Add translation keys to `messages/cs.json`
    - Add translation keys to `messages/en.json`
    - Include labels, descriptions, and validation messages
    - _Requirements: 2.10, 8.1, 8.6_

  - [x] 3.3 Integrate DeliveryMethodSelector into ProductDetail
    - Add delivery method state to ProductDetail component
    - Render DeliveryMethodSelector in customization flow
    - Add delivery method to customizations when adding to cart
    - Implement validation to require delivery method selection
    - _Requirements: 2.1, 2.7, 2.8, 5.1, 5.2_

  - [x] 3.4 Add accessibility features to DeliveryMethodSelector
    - Implement ARIA labels and roles for radio group
    - Ensure keyboard navigation support
    - Add screen reader announcements
    - Verify color contrast meets WCAG 2.1 AA standards
    - _Requirements: 8.3, 8.4, 8.5_

- [x] 4. ProductCustomizer Header Consistency
  - [x] 4.1 Implement option-specific header logic
    - Create `getOptionHeader` function in ProductCustomizer
    - Map option types to appropriate headers (Order date, Ribbon, Size)
    - Remove generic "Customize" header for date selection
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 4.2 Update header rendering in ProductCustomizer
    - Apply new header logic to all customization sections
    - Ensure consistent typography and styling
    - Verify localization for all headers
    - _Requirements: 4.3, 4.4, 4.5_

- [x] 5. Database Schema Updates
  - [x] 5.1 Create delivery method migration
    - Create `supabase/migrations/20250110000000_add_delivery_method_support.sql`
    - Add `delivery_method` column to orders table
    - Add `pickup_location` column to orders table
    - Create index for delivery method queries
    - Update existing orders with default delivery method
    - _Requirements: 5.5, 9.1, 9.2_

  - [x] 5.2 Update TypeScript types for delivery method
    - Add delivery method fields to Order type
    - Update CustomizationOption type to include delivery_method
    - Add DeliveryMethodOption interface
    - _Requirements: 5.2, 5.6_

- [x] 6. Stripe Embedded Checkout Service
  - [x] 6.1 Create embedded checkout service
    - Create `src/lib/stripe/embedded-checkout.ts`
    - Implement `createEmbeddedCheckoutSession` function
    - Implement `getStripeIds` function to retrieve product and price IDs from Supabase
    - Add validation for missing Stripe IDs
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 5.3_

  - [x] 6.2 Implement Redis caching for checkout sessions
    - Implement cart hash generation function
    - Add cache check before creating new session
    - Store session with 30-minute TTL
    - Implement `invalidateCheckoutSession` function
    - _Requirements: 3.8, 3.9, 3.10, 3.12, 6.1, 6.2, 6.3, 6.4_

  - [x] 6.3 Add error handling and retry logic
    - Create `src/lib/stripe/error-handler.ts`
    - Implement `CheckoutError` class with localized messages
    - Implement `handleStripeError` function
    - Add retry logic with exponential backoff
    - _Requirements: 3.11, 7.1, 7.2, 7.5, 7.6, 7.8_

  - [x] 6.4 Add logging and monitoring
    - Add structured logging for checkout events
    - Log session creation, cache hits/misses, errors
    - Include relevant metadata for debugging
    - _Requirements: 5.8, 7.8_

- [x] 7. Stripe Embedded Checkout Component
  - [x] 7.1 Create StripeEmbeddedCheckout component
    - Create `src/components/payments/StripeEmbeddedCheckout.tsx`
    - Implement EmbeddedCheckoutProvider integration
    - Add loading state with spinner
    - Implement onComplete callback handling
    - Configure Stripe with correct locale
    - _Requirements: 3.5, 3.6, 3.13, 3.14, 3.15, 8.7_

  - [x] 7.2 Add lazy loading for Stripe SDK
    - Implement dynamic import for Stripe SDK
    - Show loading indicator during SDK initialization
    - Handle timeout scenarios
    - _Requirements: 6.6, 6.7, 6.8_

  - [x] 7.3 Add error handling to checkout component
    - Implement onError callback
    - Display user-friendly error messages
    - Add retry button for recoverable errors
    - _Requirements: 7.1, 7.2, 7.3, 7.7_

- [x] 8. Checkout Page Integration
  - [x] 8.1 Update checkout page with embedded checkout
    - Update `src/app/[locale]/checkout/page.tsx`
    - Add delivery method validation before checkout
    - Integrate createEmbeddedCheckoutSession service
    - Render StripeEmbeddedCheckout component
    - _Requirements: 2.3, 2.4, 2.7, 3.5, 5.1_

  - [x] 8.2 Implement checkout completion handling
    - Create handleCheckoutComplete function
    - Invalidate cached session on completion
    - Update order status in database
    - Redirect to confirmation page
    - _Requirements: 3.6, 3.12, 9.4, 9.8_

  - [x] 8.3 Implement checkout cancellation handling
    - Handle cancel callback from Stripe
    - Allow user to retry payment
    - Maintain cart state
    - _Requirements: 3.7, 7.2_

  - [x] 8.4 Add checkout summary with delivery method
    - Display selected delivery method in summary
    - Show delivery address or pickup location
    - Update summary when delivery method changes
    - _Requirements: 2.8, 9.6, 9.8_

- [ ] 9. API Endpoint for Checkout Session Creation
  - [x] 9.1 Create checkout session API endpoint
    - Create `src/app/api/checkout/create-session/route.ts`
    - Validate cart and delivery method
    - Call createEmbeddedCheckoutSession service
    - Return client secret to client
    - Implement rate limiting
    - _Requirements: 3.1, 3.2, 5.7, 6.5_

  - [x] 9.2 Add CSRF protection to checkout endpoint
    - Implement CSRF token validation
    - Verify session ownership
    - Validate metadata
    - _Requirements: 5.8_

- [-] 10. Order Management Updates
  - [x] 10.1 Update order creation to include delivery method
    - Store delivery method in order record
    - Store pickup location if applicable
    - Include delivery method in order metadata
    - _Requirements: 9.1, 9.2, 9.5_

  - [-] 10.2 Update order retrieval to include delivery method
    - Include delivery method in order queries
    - Display delivery method in order history
    - Show pickup location for pickup orders
    - _Requirements: 9.6_

  - [ ] 10.3 Update admin order view
    - Display delivery method in admin dashboard
    - Filter orders by delivery method
    - Show pickup location for pickup orders
    - _Requirements: 9.7_

  - [ ] 10.4 Update order confirmation emails
    - Include delivery method in confirmation email
    - Show delivery address or pickup location
    - Include pickup hours for pickup orders
    - _Requirements: 9.8_

- [ ] 11. Cart Updates for Delivery Method
  - [ ] 11.1 Update cart validation
    - Add validation for delivery method selection
    - Display error if delivery method missing
    - Prevent checkout without delivery method
    - _Requirements: 2.7, 7.4_

  - [ ] 11.2 Update cart summary display
    - Show selected delivery method in cart
    - Display "Free delivery" badge when applicable
    - Allow changing delivery method from cart
    - _Requirements: 2.5, 2.8_

- [ ]* 12. Testing Implementation
  - [ ]* 12.1 Write unit tests for DateSelector
    - Test header prop rendering
    - Test date selection functionality
    - Test validation message display
    - _Requirements: 10.1_

  - [ ]* 12.2 Write unit tests for DeliveryMethodSelector
    - Test option selection
    - Test badge display
    - Test localization
    - Test accessibility features
    - _Requirements: 10.2_

  - [ ]* 12.3 Write unit tests for Stripe service
    - Test session creation
    - Test cache hit/miss scenarios
    - Test error handling
    - Test retry logic
    - _Requirements: 10.3, 10.5_

  - [ ]* 12.4 Write integration tests for checkout flow
    - Test complete checkout with delivery
    - Test complete checkout with pickup
    - Test payment success handling
    - Test payment cancellation handling
    - _Requirements: 10.3, 10.4_

  - [ ]* 12.5 Write E2E tests for full purchase flow
    - Test product selection through payment
    - Test delivery method selection
    - Test Stripe embedded checkout
    - Test order confirmation
    - _Requirements: 10.4_

  - [ ]* 12.6 Test error scenarios
    - Test missing delivery method
    - Test payment failure
    - Test network errors
    - Test session expiration
    - _Requirements: 10.6_

  - [ ]* 12.7 Test localization
    - Verify Czech translations
    - Verify English translations
    - Test date formatting
    - Test error messages
    - _Requirements: 10.7_

  - [ ]* 12.8 Test accessibility
    - Verify keyboard navigation
    - Test screen reader support
    - Verify color contrast
    - Test focus indicators
    - _Requirements: 10.8_

- [ ] 13. Performance Optimization
  - [ ] 13.1 Implement lazy loading for checkout components
    - Lazy load StripeEmbeddedCheckout component
    - Lazy load DeliveryMethodSelector component
    - Add loading states
    - _Requirements: 6.8_

  - [ ] 13.2 Optimize bundle size
    - Code-split Stripe SDK
    - Minimize checkout component bundle
    - Verify bundle size impact
    - _Requirements: 6.6, 6.8_

  - [ ] 13.3 Implement cache warming
    - Pre-cache popular products' Stripe IDs
    - Implement background cache refresh
    - _Requirements: 6.1, 6.2_

- [ ] 14. Documentation and Deployment
  - [ ] 14.1 Update environment variables documentation
    - Document Stripe Embedded Checkout variables
    - Update `.env.example`
    - Add setup instructions
    - _Requirements: 5.7_

  - [ ] 14.2 Create deployment checklist
    - List all environment variables needed
    - Document database migration steps
    - Create rollback plan
    - _Requirements: 5.5_

  - [ ] 14.3 Add inline code documentation
    - Document all new functions and components
    - Add JSDoc comments
    - Document error handling patterns
    - _Requirements: 5.6_

  - [ ] 14.4 Create monitoring and alerting
    - Setup checkout success rate monitoring
    - Configure error rate alerts
    - Setup cache performance monitoring
    - _Requirements: 5.8, 7.8_

- [ ] 15. Final Validation and Testing
  - [ ] 15.1 Run database migration in staging
    - Execute migration script
    - Verify data integrity
    - Test rollback procedure
    - _Requirements: 5.5_

  - [ ] 15.2 Test with Stripe test mode
    - Test successful payment flow
    - Test failed payment scenarios
    - Test 3D Secure authentication
    - Verify webhook handling
    - _Requirements: 3.13, 3.14, 10.3_

  - [ ] 15.3 Perform load testing
    - Test checkout session creation under load
    - Verify cache performance
    - Test Redis connection handling
    - _Requirements: 6.1, 6.5_

  - [ ] 15.4 Verify all requirements met
    - Review all acceptance criteria
    - Confirm all features working
    - Verify localization complete
    - Confirm accessibility compliance
    - _Requirements: All_
