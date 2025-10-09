# Requirements Document

## Introduction

This specification addresses enhancements to the product customization flow and checkout process for the funeral wreaths e-commerce platform. The focus is on improving the user experience for date selection, delivery method selection, and implementing Stripe's modern Embedded Checkout for a seamless payment experience. These changes will streamline the ordering process and provide customers with more flexible delivery options.

## Requirements

### Requirement 1: DateSelector UI/UX Improvements

**User Story:** As a customer, I want a clean and intuitive date selection interface, so that I can easily choose my preferred delivery or order date without confusion.

#### Acceptance Criteria

1. WHEN viewing the DateSelector component THEN the system SHALL NOT display an input message field
2. WHEN the DateSelector appears in ProductDetail view THEN the system SHALL display "Order date" as the header
3. WHEN the DateSelector appears in ProductCustomizer view THEN the system SHALL display "Order date" as the header
4. WHEN the DateSelector is rendered THEN the system SHALL maintain the calendar functionality for date selection
5. IF a date is selected THEN the system SHALL display it in a clear, formatted manner
6. WHEN interacting with the calendar THEN the system SHALL provide visual feedback for selectable and non-selectable dates
7. IF the date range constraints exist THEN the system SHALL enforce them without displaying confusing messages

### Requirement 2: Delivery Method Selection

**User Story:** As a customer, I want to choose between home delivery and personal pickup, so that I can select the most convenient option for receiving my order.

#### Acceptance Criteria

1. WHEN viewing product customization options THEN the system SHALL display delivery method selection
2. WHEN selecting delivery method THEN the system SHALL offer two options: "Delivery to address" and "Personal pickup at company office"
3. IF "Delivery to address" is selected THEN the system SHALL show address input fields in the checkout flow
4. IF "Personal pickup" is selected THEN the system SHALL skip address input and display pickup location information
5. WHEN "Delivery to address" is selected THEN the system SHALL display "Delivery for free" badge or indicator
6. WHEN "Personal pickup" is selected THEN the system SHALL display pickup address and business hours
7. IF delivery method is not selected THEN the system SHALL prevent checkout completion
8. WHEN delivery method changes THEN the system SHALL update the order summary accordingly
9. IF personal pickup is selected THEN the system SHALL not charge delivery fees
10. WHEN displaying delivery options THEN the system SHALL use clear, localized text for both Czech and English

### Requirement 3: Stripe Embedded Checkout Integration

**User Story:** As a customer, I want a modern, seamless payment experience, so that I can complete my purchase quickly and securely without leaving the page.

#### Acceptance Criteria

1. WHEN implementing Stripe checkout THEN the system SHALL use Stripe Embedded Checkout API
2. WHEN creating a checkout session THEN the system SHALL send `stripe_product_id` and `stripe_price_id` from the Supabase database
3. WHEN initializing checkout THEN the system SHALL load product and price data from Supabase
4. IF product lacks Stripe IDs THEN the system SHALL display an error and prevent checkout
5. WHEN checkout session is created THEN the system SHALL embed the Stripe checkout form on the page
6. WHEN payment is successful THEN the system SHALL handle the success callback and redirect appropriately
7. IF payment is cancelled THEN the system SHALL handle the cancel callback and allow retry
8. WHEN handling checkout THEN the system SHALL implement proper caching with TTL (Time To Live)
9. IF checkout session expires THEN the system SHALL create a new session automatically
10. WHEN caching checkout sessions THEN the system SHALL use Redis with appropriate TTL (e.g., 30 minutes)
11. IF network errors occur THEN the system SHALL implement retry logic with exponential backoff
12. WHEN checkout completes THEN the system SHALL invalidate the cached session
13. WHEN displaying checkout THEN the system SHALL follow Stripe's Embedded Checkout best practices from official documentation
14. IF 3D Secure is required THEN the system SHALL handle it within the embedded checkout flow
15. WHEN checkout loads THEN the system SHALL display loading states to prevent user confusion

### Requirement 4: Product Customization Header Consistency

**User Story:** As a customer, I want consistent and clear labeling throughout the customization process, so that I understand what each section is for.

#### Acceptance Criteria

1. WHEN viewing customization sections THEN the system SHALL use "Order date" instead of "Customize" for date selection
2. WHEN multiple customization options exist THEN the system SHALL use appropriate headers for each section
3. IF a section has a specific purpose THEN the system SHALL label it clearly (e.g., "Ribbon options", "Size selection", "Order date")
4. WHEN headers are displayed THEN the system SHALL use consistent typography and styling
5. IF localization is enabled THEN the system SHALL translate all headers appropriately

### Requirement 5: Integration with Existing Systems

**User Story:** As a developer, I want the new features to integrate seamlessly with existing systems, so that the application remains stable and maintainable.

#### Acceptance Criteria

1. WHEN implementing delivery method selection THEN the system SHALL integrate with existing cart and order systems
2. WHEN storing delivery preferences THEN the system SHALL use existing Customization data structure
3. IF Stripe IDs are missing THEN the system SHALL use existing error handling patterns
4. WHEN caching checkout sessions THEN the system SHALL use existing Redis infrastructure
5. IF database schema changes are needed THEN the system SHALL create proper migrations
6. WHEN implementing new features THEN the system SHALL maintain TypeScript type safety
7. IF new API endpoints are needed THEN the system SHALL follow existing API patterns
8. WHEN handling errors THEN the system SHALL use existing error handling and logging infrastructure

### Requirement 6: Performance and Caching

**User Story:** As a customer, I want fast checkout experiences, so that I can complete my purchase without delays.

#### Acceptance Criteria

1. WHEN creating Stripe checkout sessions THEN the system SHALL cache them in Redis
2. WHEN setting cache TTL THEN the system SHALL use 30 minutes as default
3. IF cached session exists and is valid THEN the system SHALL reuse it
4. WHEN session expires or is used THEN the system SHALL invalidate the cache
5. IF cache retrieval fails THEN the system SHALL create a new session without blocking the user
6. WHEN loading Stripe Embedded Checkout THEN the system SHALL show loading indicators
7. IF Stripe SDK loads slowly THEN the system SHALL implement timeout handling
8. WHEN optimizing performance THEN the system SHALL lazy load Stripe SDK only when needed

### Requirement 7: Error Handling and User Feedback

**User Story:** As a customer, I want clear error messages and guidance, so that I can resolve issues and complete my purchase.

#### Acceptance Criteria

1. WHEN errors occur during checkout THEN the system SHALL display user-friendly error messages
2. IF Stripe API fails THEN the system SHALL provide retry options
3. WHEN validation fails THEN the system SHALL highlight the specific fields requiring attention
4. IF delivery method is not selected THEN the system SHALL display a clear validation message
5. WHEN network errors occur THEN the system SHALL inform the user and suggest actions
6. IF session expires THEN the system SHALL automatically create a new one and inform the user
7. WHEN payment fails THEN the system SHALL display the reason and next steps
8. IF critical errors occur THEN the system SHALL log them for developer investigation

### Requirement 8: Localization and Accessibility

**User Story:** As a customer, I want the interface in my preferred language with accessible controls, so that I can use the platform comfortably.

#### Acceptance Criteria

1. WHEN displaying delivery options THEN the system SHALL show text in the user's selected language (Czech/English)
2. WHEN showing date formats THEN the system SHALL use locale-appropriate formatting
3. IF screen readers are used THEN the system SHALL provide appropriate ARIA labels
4. WHEN keyboard navigation is used THEN the system SHALL support full keyboard accessibility
5. IF color is used to convey information THEN the system SHALL provide alternative indicators
6. WHEN displaying error messages THEN the system SHALL localize them appropriately
7. IF Stripe Embedded Checkout is displayed THEN the system SHALL configure it with the correct locale

### Requirement 9: Data Persistence and Order Management

**User Story:** As a business owner, I want delivery preferences and payment information properly stored, so that I can fulfill orders accurately.

#### Acceptance Criteria

1. WHEN an order is placed THEN the system SHALL store the selected delivery method
2. WHEN personal pickup is selected THEN the system SHALL store pickup preference in order metadata
3. IF delivery address is provided THEN the system SHALL validate and store it
4. WHEN payment succeeds THEN the system SHALL update order status to "paid"
5. IF order includes customizations THEN the system SHALL store all customization details
6. WHEN retrieving orders THEN the system SHALL include delivery method information
7. IF admin views orders THEN the system SHALL display delivery method clearly
8. WHEN generating order confirmations THEN the system SHALL include delivery/pickup details

### Requirement 10: Testing and Quality Assurance

**User Story:** As a developer, I want comprehensive testing for new features, so that I can deploy with confidence.

#### Acceptance Criteria

1. WHEN implementing DateSelector changes THEN the system SHALL include component tests
2. WHEN implementing delivery method selection THEN the system SHALL test all selection scenarios
3. IF Stripe Embedded Checkout is implemented THEN the system SHALL test with Stripe test mode
4. WHEN testing checkout flow THEN the system SHALL verify success and failure scenarios
5. IF caching is implemented THEN the system SHALL test cache hit/miss scenarios
6. WHEN testing error handling THEN the system SHALL simulate various error conditions
7. IF localization is updated THEN the system SHALL verify translations in both languages
8. WHEN testing accessibility THEN the system SHALL verify keyboard navigation and screen reader support
