# Implementation Plan

## Overview

This implementation plan breaks down the session debugging improvements into discrete, actionable coding tasks. Each task builds incrementally on previous work and focuses on specific code changes that can be executed by a coding agent.

## Task List

- [x] 1. Fix ProductCardLayout Image Display

  - Create image resolution utility function in `src/lib/utils/product-image-utils.ts`
  - Implement logic to select primary image, fallback to first image, then placeholder
  - Update ProductCardLayout component to use image resolution utility
  - Ensure proper z-index layering for corner cropping (image z-0, overlay z-10)
  - Add error handling for failed image loads with fallback to placeholder
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 2. Refactor ProductDetail Image Layout

  - [x] 2.1 Create ProductDetailImageGrid component

    - Create new component in `src/components/product/ProductDetailImageGrid.tsx`
    - Implement CSS Grid layout with responsive columns (2 cols desktop, 1 col mobile)
    - Add max-height constraint to match right column height
    - Use Next.js Image component with quality 70 and appropriate sizes
    - Implement lazy loading for images after the first
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.6_

  - [x] 2.2 Integrate ProductDetailImageGrid into ProductDetail page
    - Update `src/app/[locale]/products/[slug]/page.tsx` to use new component
    - Pass all product images from Supabase to the grid component
    - Ensure left column layout with proper spacing
    - Test responsive behavior on mobile, tablet, and desktop
    - _Requirements: 2.1, 2.5_

- [x] 3. Fix Shopping Cart Last Item Deletion

  - [x] 3.1 Enhance removeItem function in Cart Context

    - Update `src/lib/cart/context.tsx` removeItem function
    - Add logic to detect when cart becomes empty (remainingItems.length === 0)
    - Call cache clear endpoint when last item is removed
    - Ensure LocalStorage is completely cleared when cart is empty
    - Add error handling for cache clear failures (non-critical)
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 3.2 Enhance clearCart function in Cart Context

    - Update clearCart function to explicitly clear cache
    - Clear LocalStorage completely
    - Call cache clear endpoint after DELETE all API
    - Verify empty state with fetchCart
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 3.3 Verify cache clearing utilities exist

    - Check `src/lib/cache/cart-cache.ts` for forceClearCartCache function
    - Verify clearAllPriceCalculationCache function exists
    - Ensure verifyCacheOperation function is implemented
    - Add debugCacheState utility if missing
    - _Requirements: 3.2, 3.4, 3.5, 3.6_

  - [x] 3.4 Update cache clear API endpoint
    - Verify `src/app/api/cart/clear-cache/route.ts` exists
    - Ensure it calls forceClearCartCache with user/session identifier
    - Add cache state verification and logging
    - Return success response with cache state
    - _Requirements: 3.2, 3.4_

- [x] 4. Add Missing Internationalization Translations

  - [x] 4.1 Add accessibility translations

    - Update `messages/cs.json` with accessibility.toolbar.title and accessibility.toolbar.footerLink
    - Update `messages/en.json` with same keys
    - Verify translation keys match component usage
    - _Requirements: 4.1, 4.2, 4.3, 4.5_

  - [x] 4.2 Add cart translations

    - Update `messages/cs.json` with cart.clearAll and cart.clearAllConfirm
    - Update `messages/en.json` with same keys
    - Update ShoppingCart component to use t('cart.clearAll')
    - _Requirements: 4.1, 4.2, 4.3, 4.5_

  - [x] 4.3 Update components to use new translations
    - Update `src/components/accessibility/AccessibilityToolbar.tsx` to use t('accessibility.toolbar.title')
    - Update `src/components/cart/ShoppingCart.tsx` to use t('cart.clearAll')
    - Test language switching to verify translations load correctly
    - _Requirements: 4.1, 4.2, 4.3_

- [x] 5. Redesign Accessibility Toolbar Placement

  - [x] 5.1 Update Footer component with accessibility link

    - Update `src/components/layout/Footer.tsx`
    - Add accessibility link in desktop-only section (hidden md:block)
    - Implement handleAccessibilityClick function to scroll to top and focus toolbar
    - Use t('accessibility.toolbar.footerLink') for link text
    - Ensure link is hidden on mobile
    - _Requirements: 5.1, 5.2, 5.3, 5.5, 5.7_

  - [x] 5.2 Update AccessibilityToolbar button visibility

    - Update `src/components/accessibility/AccessibilityToolbar.tsx`
    - Change button className to include opacity-0 focus:opacity-100
    - Keep button at fixed top-20 right-4 z-40
    - Ensure button is keyboard accessible but visually hidden by default
    - Add aria-controls="accessibility-panel" attribute
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 5.3 Verify toolbar panel positioning
    - Ensure panel is at fixed top-24 right-4 z-40
    - Verify pt-16 padding for navbar height
    - Test that panel appears below navbar when opened
    - Verify responsive width with max-w-[calc(100vw-2rem)]
    - _Requirements: 5.2, 5.3, 5.4_

- [x] 6. Migrate to Tailwind CSS 4 Theme System

  - [x] 6.1 Create @theme directive in globals.css

    - Update `src/app/globals.css`
    - Add @theme block with CSS custom properties for colors
    - Define --color-primary, --color-primary-light, --color-primary-dark
    - Define --color-accent, --color-accent-light
    - Define --color-teal-900, --color-teal-800, --color-teal-400
    - Define --color-amber-100, --color-amber-200
    - _Requirements: 6.4, 6.5, 6.8_

  - [x] 6.2 Implement gradient background system

    - Add @layer base block in globals.css
    - Apply linear-gradient(to right, #AE8625, #F7EF8A, #D2AC47) to body
    - Set background-attachment: fixed for consistent gradient
    - Add bg-funeral-gold utility to tailwind.config.ts backgroundImage
    - _Requirements: 6.1, 6.3, 6.7_

  - [x] 6.3 Update tailwind.config.ts

    - Remove extend.colors configuration (Tailwind v3 style)
    - Keep backgroundImage.funeral-gold gradient utility
    - Remove legacy funeral color definitions
    - Verify configuration compiles without errors
    - _Requirements: 6.4, 6.5, 6.6, 6.8_

  - [x] 6.4 Update components to use semantic color classes

    - Search for hardcoded hex colors in components
    - Replace with semantic classes (bg-primary, bg-accent, bg-teal-900)
    - Ensure cards/containers use bg-teal-900
    - Verify hero section uses bg-teal-900 (not gradient)
    - Test visual consistency across all pages
    - _Requirements: 6.2, 6.3, 6.5, 6.7_

  - [x] 6.5 Update design-tokens.ts to reference CSS variables

- Update `src/lib/design-tokens.ts`

  - Change color definitions to reference CSS custom properties
  - Use var(--color-primary) instead of hex values
  - Ensure backward compatibility with existing code
  - _Requirements: 6.5, 6.8_

- [x] 7. Fix Product Card Corner Cropping with Image Display

  - [x] 7.1 Refactor ProductCard image container structure

    - Update `src/components/product/ProductCard.tsx`
    - Create corner-clip-container div with clip-path CSS
    - Add absolute positioned image layer with z-0
    - Add absolute positioned overlay layer with z-10
    - Use Next.js Image with fill prop and object-cover
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [x] 7.2 Implement corner cropping CSS

    - Add corner-clip-container class to globals.css or component
    - Define clip-path polygon for corner cropping effect
    - Ensure clip-path is applied to container, not image
    - Test that image displays within cropped frame
    - Verify hover states maintain cropping effect
    - _Requirements: 7.1, 7.2, 7.3, 7.5, 7.6_

  - [x] 7.3 Test image and cropping integration
    - Verify product images display correctly within cropped frame
    - Test with products that have images and without images
    - Ensure placeholder displays correctly when no image
    - Test responsive behavior on different screen sizes
    - Verify z-index layering works correctly
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [x] 8. Optimize Redis Cache Operations

  - [x] 8.1 Review and update cache TTL values

    - Update `src/lib/cache/cart-cache.ts` with correct TTL constants
    - Set CART_CONFIG_TTL to 24 hours (86400 seconds)
    - Set PRICE_CALCULATION_TTL to 1 hour (3600 seconds)
    - Ensure TTL is applied in all cache set operations
    - _Requirements: 8.3, 8.5_

  - [x] 8.2 Implement cache verification utility

    - Add verifyCacheOperation function if not exists
    - Check for existence of cache keys after operations
    - Log verification results for debugging
    - Return boolean indicating success
    - _Requirements: 8.4, 8.6_

  - [x] 8.3 Add cache state debugging utility

    - Implement debugCacheState function in cart-cache.ts
    - List all cart-related cache keys for identifier
    - Return object with cache state information
    - Use in cache clear endpoint response
    - _Requirements: 8.4, 8.6_

  - [x] 8.4 Update forceClearCartCache with pattern deletion
    - Ensure forceClearCartCache clears cart config
    - Get all price calculation keys from tracking set
    - Delete all price calculation keys in batch
    - Clear price tracking set
    - Log all cache clearing operations
    - _Requirements: 8.1, 8.2, 8.5, 8.6_

- [x] 9. Integration Testing and Validation

  - [x] 9.1 Test product image display

    - Load products with primary images
    - Load products without primary images
    - Load products with no images
    - Verify fallback logic works correctly
    - Test error handling for failed image loads
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 9.2 Test cart operations

    - Add multiple items to cart
    - Remove items one by one
    - Verify cache is cleared when last item removed
    - Test "Clear All" button
    - Refresh page and verify cart state
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.6_

  - [x] 9.3 Test accessibility toolbar

    - Click footer accessibility link
    - Verify toolbar opens and is positioned correctly
    - Test keyboard navigation to toolbar
    - Verify toolbar is hidden on mobile
    - Test toolbar functionality (font size, contrast)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

  - [x] 9.4 Test color system and gradients

    - Verify body gradient displays correctly
    - Check card backgrounds are teal-900
    - Verify hero section background
    - Test contrast ratios for accessibility
    - Verify responsive behavior
    - _Requirements: 6.1, 6.2, 6.3, 6.7_

  - [x] 9.5 Test product card corner cropping
    - Verify images display within cropped frame
    - Test hover states
    - Test with and without images
    - Verify responsive behavior
    - Check z-index layering
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [-] 10. Performance Optimization and Cleanup

  - [x] 10.1 Verify Next.js Image optimization

    - Check that quality 70 is used consistently
    - Verify appropriate sizes attributes
    - Ensure lazy loading for off-screen images
    - Test image loading performance
    - _Requirements: 2.6_

  - [x] 10.2 Audit and remove unused code

    - Remove legacy color definitions from tailwind.config.ts
    - Remove unused funeral color utilities
    - Clean up any temporary debugging code
    - Remove commented-out code
    - _Requirements: 6.6_

  - [x] 10.3 Run TypeScript type checking

    - Execute `npm run type-check`
    - Fix any type errors that appear
    - Ensure strict mode compliance
    - Verify no `any` types introduced
    - _Requirements: All_

  - [x] 10.4 Run Biome linting and formatting

    - Execute `npm run lint`
    - Fix any linting errors
    - Run `npm run format` to format code
    - Verify code quality standards
    - _Requirements: All_

  - [ ] 10.5 Test build process
    - Run `npm run build`
    - Verify build completes without errors
    - Check bundle size hasn't increased significantly
    - Test production build locally
    - _Requirements: All_

## Notes

- Tasks are organized by feature area for logical grouping
- Each task includes specific file paths and implementation details
- Requirements are referenced for traceability
- Testing tasks (Task 9) should be performed after implementation tasks
- Performance optimization (Task 10) should be done last
- All tasks should maintain TypeScript strict mode compliance
- All tasks should preserve existing functionality in other areas

## Execution Order

1. Start with Task 1 (ProductCardLayout) - quick win, high visibility
2. Move to Task 4 (Translations) - simple, no dependencies
3. Tackle Task 3 (Cart) - critical bug fix
4. Implement Task 5 (Accessibility) - UX improvement
5. Work on Task 2 (ProductDetail) - larger refactor
6. Execute Task 7 (Corner Cropping) - visual fix
7. Implement Task 6 (Tailwind CSS 4) - design system migration
8. Optimize Task 8 (Redis Cache) - performance improvement
9. Run Task 9 (Integration Testing) - validation
10. Complete Task 10 (Cleanup) - final polish

## Success Criteria

- All product cards display images or placeholders
- Cart last item deletion works consistently
- All UI elements have Czech and English translations
- Accessibility toolbar accessible via footer only (desktop)
- Application uses Tailwind CSS 4 @theme directive
- Body gradient displays correctly with teal-900 cards
- Product cards show images with corner cropping
- Redis cache cleared properly with correct TTL values
- TypeScript compilation passes without errors
- Build process completes successfully
- Lighthouse performance score maintains 95+
