# Implementation Plan

- [x] 1. Fix Product Grid Navigation Issues
  - Implement proper click handlers for product card navigation
  - Fix routing to product detail pages using correct slug patterns
  - Add error handling for navigation failures
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [x] 1.1 Update ProductCard component navigation handlers
  - Replace window.location.href with Next.js router navigation
  - Implement handleProductClick, handleImageClick, and handleTitleClick functions
  - Add proper event handling with preventDefault and stopPropagation
  - Ensure navigation works for both grid and list view modes
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 1.2 Fix ProductGrid component routing logic
  - Update handleAddToCart function to use proper navigation
  - Implement proper customization check before navigation vs direct cart add
  - Add error boundaries for navigation failures
  - Test navigation with different product types and customization requirements
  - _Requirements: 1.4, 1.5, 1.6_

- [x] 2. Implement Product Image Rendering Fixes
  - Fix database image fetching and display issues
  - Implement proper image optimization and lazy loading
  - Add fallback handling for missing or failed images
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

- [x] 2.1 Create enhanced ProductImage component
  - Implement proper Next.js Image component usage with database URLs
  - Add image loading states and error handling
  - Implement fallback placeholder system for missing images
  - Add proper alt text handling for accessibility
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 2.2 Optimize image loading performance
  - Implement priority loading for above-the-fold images
  - Add lazy loading for images below the fold
  - Configure proper image sizes and responsive breakpoints
  - Add WebP/AVIF format support with fallbacks
  - _Requirements: 2.5, 2.7_

- [x] 2.3 Implement image hover effects and secondary image display
  - Add hover state to show secondary product images
  - Implement smooth transitions between primary and secondary images
  - Ensure hover effects work properly on touch devices
  - Add proper aspect ratio maintenance during image transitions
  - _Requirements: 2.6, 2.7_

- [ ] 3. Create Modern Centralized Theming System
  - Design and implement centralized design tokens system
  - Replace all hardcoded color classes with theme tokens
  - Create theme provider and context for dynamic theming
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

- [-] 3.1 Create design tokens and theme configuration
  - Create src/lib/design-system/tokens.ts with all color definitions
  - Implement semantic color naming (primary, secondary, accent, neutral)
  - Define typography, spacing, shadow, and border radius scales
  - Create light and dark theme variants maintaining funeral-appropriate aesthetics
  - _Requirements: 3.1, 3.2, 3.4, 3.5_

- [ ] 3.2 Implement ThemeProvider and context system
  - Create ThemeProvider component with React Context
  - Implement theme switching functionality
  - Add theme persistence using localStorage
  - Create useTheme hook for consuming theme in components
  - _Requirements: 3.3, 3.6, 3.7_

- [ ] 3.3 Migrate UI components to use design tokens
  - Update Button, Card, Input, Modal, and other UI components
  - Replace hardcoded Tailwind classes with theme token references
  - Ensure all components support both light and dark themes
  - Add proper TypeScript types for theme token usage
  - _Requirements: 3.6, 3.7, 3.8_

- [ ] 3.4 Update product and layout components with new theming
  - Migrate ProductCard, ProductGrid, ProductFilters to use design tokens
  - Update Header, Footer, Navigation components with theme system
  - Replace all bg-teal, text-amber, bg-stone, text-stone classes with semantic tokens
  - Ensure color contrast ratios meet WCAG 2.1 AA standards
  - _Requirements: 3.1, 3.6, 3.8_

- [ ] 4. Streamline Checkout Process to Stripe-Only
  - Remove all GoPay payment integration and references
  - Simplify checkout flow to use only Stripe payments
  - Update payment processing logic and error handling
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_

- [ ] 4.1 Remove GoPay components and references
  - Delete GopayPaymentForm.tsx component
  - Remove GoPay imports and references from LazyPaymentComponents
  - Remove GoPay options from PaymentStep component
  - Clean up GoPay-related types and interfaces
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 4.2 Update PaymentStep component for Stripe-only
  - Remove GoPay payment method option from payment selection
  - Simplify payment method state to only handle Stripe
  - Update payment form rendering to show only StripePaymentForm
  - Remove GoPay-specific validation and error handling
  - _Requirements: 4.2, 4.3, 4.4_

- [ ] 4.3 Enhance StripePaymentForm component
  - Improve Stripe payment form UI and user experience
  - Add comprehensive error handling for Stripe-specific errors
  - Implement proper loading states during payment processing
  - Add payment retry functionality for failed payments
  - _Requirements: 4.4, 4.5, 4.6, 4.8_

- [ ] 4.4 Update checkout flow and order processing
  - Simplify order creation to only handle Stripe payments
  - Update success and error page handling for Stripe-only flow
  - Remove GoPay webhook handling and related API endpoints
  - Update order status tracking for Stripe payment lifecycle
  - _Requirements: 4.5, 4.6, 4.7_

- [ ] 4.5 Clean up payment configuration and environment variables
  - Remove GoPay-related environment variables and configuration
  - Update payment provider initialization to Stripe-only
  - Clean up payment-related utility functions
  - Update documentation and comments to reflect Stripe-only setup
  - _Requirements: 4.1, 4.7_

- [ ] 5. Implement Comprehensive Error Handling and Testing
  - Add error boundaries for all major component sections
  - Implement proper TypeScript error handling patterns
  - Create comprehensive test coverage for all changes
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_

- [ ] 5.1 Add error boundaries for product grid and navigation
  - Create ProductGridErrorBoundary component
  - Implement NavigationErrorBoundary for routing failures
  - Add ImageErrorBoundary for image loading failures
  - Implement proper error logging and user feedback
  - _Requirements: 5.7, 1.6, 2.3_

- [ ] 5.2 Implement comprehensive TypeScript error handling
  - Add proper type guards for all data transformations
  - Implement error handling for API responses and database queries
  - Add validation for all user inputs and navigation parameters
  - Ensure all async operations have proper error handling
  - _Requirements: 5.1, 5.2, 5.6_

- [ ] 5.3 Create test suite for navigation and image rendering
  - Write unit tests for ProductCard navigation handlers
  - Create integration tests for product grid routing
  - Add tests for image loading, fallbacks, and optimization
  - Implement visual regression tests for theme consistency
  - _Requirements: 5.3, 1.1, 1.2, 1.3, 2.1, 2.2, 2.3_

- [ ] 5.4 Add tests for theming system and checkout flow
  - Create unit tests for design token usage and theme switching
  - Write integration tests for Stripe-only checkout process
  - Add accessibility tests for color contrast and keyboard navigation
  - Implement performance tests for image loading and Core Web Vitals
  - _Requirements: 5.4, 5.8, 3.8, 4.4, 4.5, 4.6_

- [ ] 6. Performance Optimization and Production Readiness
  - Optimize bundle size and implement code splitting
  - Add performance monitoring and Core Web Vitals tracking
  - Implement proper caching strategies for images and API responses
  - _Requirements: 5.4, 5.5, 5.8, 2.5_

- [ ] 6.1 Implement image optimization and caching
  - Configure Next.js Image component with proper optimization settings
  - Add CDN configuration for product images
  - Implement browser caching headers for static assets
  - Add image preloading for critical above-the-fold content
  - _Requirements: 5.4, 5.5, 2.5, 2.7_

- [ ] 6.2 Optimize bundle size and code splitting
  - Implement dynamic imports for non-critical components
  - Add route-based code splitting for better performance
  - Optimize third-party library usage and tree shaking
  - Configure webpack bundle analyzer and optimization
  - _Requirements: 5.1, 5.2, 5.4_

- [ ] 6.3 Add production monitoring and logging
  - Implement error tracking for navigation and payment failures
  - Add performance monitoring for Core Web Vitals
  - Create logging for image loading performance and failures
  - Add user interaction tracking for checkout flow optimization
  - _Requirements: 5.8, 4.7, 2.4_

- [ ] 7. Final Integration and Testing
  - Integrate all components and test end-to-end functionality
  - Perform accessibility audit and compliance verification
  - Conduct performance testing and optimization
  - _Requirements: 5.3, 5.8, 3.8_

- [ ] 7.1 End-to-end integration testing
  - Test complete user journey from product grid to checkout completion
  - Verify navigation works correctly across all product types
  - Test image loading and fallback behavior in various scenarios
  - Validate theme consistency across all pages and components
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 2.1, 2.2, 2.3, 3.6, 3.7_

- [ ] 7.2 Accessibility and performance audit
  - Conduct WCAG 2.1 AA compliance audit for all updated components
  - Test keyboard navigation and screen reader compatibility
  - Verify color contrast ratios meet accessibility standards
  - Run Lighthouse audits and optimize for Core Web Vitals
  - _Requirements: 3.8, 5.4, 5.8_

- [ ] 7.3 Production deployment preparation
  - Update environment configuration for production
  - Verify all GoPay references are completely removed
  - Test Stripe payment processing in production environment
  - Validate image optimization and CDN configuration
  - _Requirements: 4.1, 4.7, 5.4, 5.5, 5.8_
