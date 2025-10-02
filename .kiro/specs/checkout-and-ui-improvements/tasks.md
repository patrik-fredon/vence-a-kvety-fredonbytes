# Implementation Plan

- [ ] 1. Set up centralized background gradient system
  - Create Tailwind configuration for funeral-gold and funeral-teal gradients
  - Add gradient utility classes to tailwind.config.ts
  - Test gradient rendering in isolation
  - _Requirements: 7.4, 7.6_

- [ ] 2. Apply global background gradient
  - [ ] 2.1 Update root layout to apply bg-funeral-gold globally
    - Modify src/app/[locale]/layout.tsx to add bg-funeral-gold to body element
    - Verify gradient applies to all pages
    - _Requirements: 7.1_

  - [ ] 2.2 Add Teal background overrides for Hero and page headers
    - Update HeroSection component with bg-funeral-teal class
    - Update Checkout page header with bg-funeral-teal
    - Update Contact page header with bg-funeral-teal
    - Update Products page header with bg-funeral-teal
    - Update About page header with bg-funeral-teal
    - _Requirements: 7.2, 7.3_

  - [ ] 2.3 Remove inline gradient styles throughout codebase
    - Search for inline bg-[linear-gradient...] usage
    - Replace with centralized gradient classes
    - Verify no visual regressions
    - _Requirements: 7.7_

- [ ] 3. Implement step-based checkout form validation
  - [ ] 3.1 Create step-specific validation schemas
    - Define STEP_FIELDS constant with field mappings per step
    - Create StepValidationSchema type definition
    - Implement validateCustomerStep function
    - Implement validateDeliveryStep function
    - Implement validatePaymentStep function
    - Implement validateReviewStep function
    - _Requirements: 1.1, 1.2_

  - [ ] 3.2 Refactor validateCurrentStep function
    - Update validateCurrentStep to use step-specific validators
    - Remove validation of fields not in current step
    - Add step completion tracking
    - Ensure errors only show for current step fields
    - _Requirements: 1.3, 1.4_

  - [ ] 3.3 Implement progressive validation state management
    - Add completedSteps state to track validated steps
    - Update goToNextStep to mark step as completed
    - Allow navigation back without re-validation
    - Preserve validated data when navigating between steps
    - _Requirements: 1.5_

- [ ] 4. Create reusable cart item image component
  - [ ] 4.1 Implement image resolution utility
    - Create resolveCartItemImage function
    - Implement primary image detection logic
    - Add fallback chain (primary → first → placeholder)
    - Handle missing or null image data
    - _Requirements: 2.1, 2.3_

  - [ ] 4.2 Build CartItemImage component
    - Create CartItemImage component with size variants
    - Implement loading skeleton state
    - Add error handling with fallback image
    - Use Next.js Image component for optimization
    - Add proper alt text for accessibility
    - _Requirements: 2.2, 2.4_

  - [ ] 4.3 Integrate CartItemImage into ShoppingCart
    - Replace existing image rendering in ShoppingCart.tsx
    - Use CartItemImage component for all cart items
    - Verify images display correctly
    - Test loading and error states
    - _Requirements: 2.1, 2.5_

- [ ] 5. Fix product grid primary image display
  - [ ] 5.1 Create primary image resolution utility
    - Implement resolvePrimaryProductImage function
    - Add logic to find isPrimary marked images
    - Implement fallback to first image
    - Add placeholder fallback for missing images
    - Return ProductImageResolution type with metadata
    - _Requirements: 3.1, 3.2, 3.3_

  - [ ] 5.2 Update ProductCard component
    - Integrate resolvePrimaryProductImage utility
    - Update image rendering to use resolved image
    - Ensure consistent aspect ratios across cards
    - Add hover effects for visual feedback
    - _Requirements: 3.4, 3.5_

- [ ] 6. Optimize product detail image layout
  - [ ] 6.1 Implement responsive grid layout
    - Create CSS grid configuration with 12-column system
    - Set main image to col-span-7 row-span-2
    - Set secondary images to col-span-5
    - Add max-height constraint (700px)
    - Implement responsive breakpoints for mobile
    - _Requirements: 4.1, 4.2, 4.3_

  - [ ] 6.2 Update ProductDetail image gallery
    - Replace current grid layout with optimized configuration
    - Ensure main image doesn't exceed right column height
    - Add "more images" indicator for 5+ images
    - Implement proper aspect ratios for all images
    - Test layout on various screen sizes
    - _Requirements: 4.4, 4.5_

- [ ] 7. Add clear cart functionality
  - [ ] 7.1 Create clear cart API endpoint
    - Implement POST /api/cart/clear endpoint
    - Add Redis cache clearing logic
    - Add database cart clearing logic
    - Return success/error response
    - _Requirements: 5.3, 5.4_

  - [ ] 7.2 Build clear cart UI component
    - Add "Clear Cart" button to ShoppingCart footer
    - Implement confirmation modal/dialog
    - Add loading state during clear operation
    - Show success message after clearing
    - Handle errors gracefully
    - _Requirements: 5.1, 5.2, 5.5_

  - [ ] 7.3 Integrate clear cart with cart context
    - Add clearAllItems method to cart context
    - Call API endpoint from context method
    - Update local state after successful clear
    - Refresh cart to confirm empty state
    - _Requirements: 5.3, 5.4_

- [ ] 8. Fix Redis cache synchronization for last item removal
  - [ ] 8.1 Implement explicit cache clearing logic
    - Update removeItem function in cart context
    - Check if cart becomes empty after removal
    - Call explicit cache clear endpoint when empty
    - Add cache key deletion for all related keys
    - _Requirements: 6.1, 6.2_

  - [ ] 8.2 Create cache clearing utility
    - Implement clearCartCache function
    - Clear main cart cache key
    - Clear cart:items cache key
    - Clear cart:summary cache key
    - Handle both user and session-based keys
    - _Requirements: 6.3, 6.4_

  - [ ] 8.3 Add cache clear API endpoint
    - Create POST /api/cart/clear-cache endpoint
    - Implement Redis cache deletion
    - Add proper error handling
    - Return cache clear confirmation
    - _Requirements: 6.5_

- [ ] 9. Add product images to checkout page
  - [ ] 9.1 Integrate CartItemImage into checkout order summary
    - Import CartItemImage component in CheckoutPageClient
    - Replace placeholder divs with CartItemImage
    - Use size="sm" variant for compact display
    - Ensure images align with product information
    - _Requirements: 8.1, 8.2, 8.5_

  - [ ] 9.2 Add loading and error states for checkout images
    - Implement loading skeleton for image loading
    - Add fallback image for load errors
    - Ensure consistent sizing in order summary
    - Test with various product image scenarios
    - _Requirements: 8.3, 8.4_

- [ ] 10. Testing and validation
  - [ ] 10.1 Test checkout form validation flow
    - Verify step 1 only validates customer fields
    - Verify step 2 only validates delivery fields
    - Verify step 3 only validates payment method
    - Verify review step validates all fields
    - Test navigation between steps preserves data
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ] 10.2 Test image rendering across all components
    - Verify cart images display correctly
    - Verify checkout images display correctly
    - Verify product grid images display correctly
    - Verify product detail layout is optimized
    - Test fallback images on error
    - Test loading states
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5, 8.1, 8.2, 8.3, 8.4, 8.5_

  - [ ] 10.3 Test cart operations and cache synchronization
    - Test clear cart functionality
    - Test last item removal clears cache
    - Test cart state persists after refresh
    - Test concurrent cart operations
    - Verify Redis cache is properly updated
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ] 10.4 Test background gradient system
    - Verify gold gradient on all pages
    - Verify Teal gradient on Hero section
    - Verify Teal gradient on page headers
    - Check gradient consistency across browsers
    - Verify no inline gradient styles remain
    - Test text readability on gradients
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

  - [ ] 10.5 Perform accessibility testing
    - Test form validation with screen readers
    - Verify keyboard navigation in checkout
    - Check image alt text for all images
    - Test color contrast on gradients
    - Verify ARIA labels are correct
    - Test with keyboard-only navigation
    - _Requirements: All requirements (accessibility is cross-cutting)_

  - [ ] 10.6 Perform cross-browser and responsive testing
    - Test on Chrome, Firefox, Safari, Edge
    - Test on mobile devices (iOS, Android)
    - Test on tablet devices
    - Verify responsive breakpoints work correctly
    - Check image optimization on different devices
    - Test performance on slower connections
    - _Requirements: All requirements (compatibility is cross-cutting)_
