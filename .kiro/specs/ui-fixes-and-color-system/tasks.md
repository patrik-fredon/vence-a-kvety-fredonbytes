# Implementation Plan

- [x] 1. Update Next.js Image Configuration

  - Update `next.config.ts` to add quality value 70 to the `images.qualities` array
  - Verify the configuration includes: [50, 70, 75, 85, 90, 95]
  - Test build process to ensure no configuration errors
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2. Centralize Tailwind CSS Color System

  - [x] 2.1 Update tailwind.config.ts with centralized color definitions

    - Add primary color palette (teal-900, teal-800, teal-400)
    - Add accent color palette (amber-100, amber-200)
    - Add gradient background utility class
    - Define semantic color names following TypeScript best practices
    - _Requirements: 3.1, 3.4, 3.6, 3.11_

  - [x] 2.2 Update component color classes

    - Replace hardcoded colors in ProductCard with centralized classes
    - Replace hardcoded colors in ProductGrid with centralized classes
    - Replace hardcoded colors in navigation components with centralized classes
    - Replace hardcoded colors in layout components with centralized classes
    - Apply teal-900 background to boxes, cards, page title divs, and navbar
    - Apply amber-100 text color to elements with teal-900 backgrounds
    - Apply gradient background to non-hero sections
    - Apply xl shadow to all visible elements
    - Apply teal-400 hover state to navigation items
    - Apply amber-200 hover state to other text elements
    - _Requirements: 3.2, 3.3, 3.5, 3.7, 3.8, 3.9, 3.11, 3.12, 3.13, 3.14_

  - [x] 2.3 Clean up unused color definitions
    - Remove duplicate color configurations from design-tokens.ts
    - Remove unused TypeScript design token colors
    - Verify no color rendering issues
    - _Requirements: 3.3, 3.5_

- [x] 3. Refactor ProductCard Component

  - [x] 3.1 Update image container layering

    - Ensure ProductImageHover fills the card container with absolute positioning
    - Set image layer to z-0
    - Verify rounded corners (clip-corners) are maintained
    - _Requirements: 2.2, 2.3, 2.5_

  - [x] 3.2 Update overlay positioning and z-indexing

    - Position stock overlay at z-10
    - Position info overlay at bottom with z-20
    - Ensure overlays don't block image visibility
    - Apply backdrop-blur to info overlay for better readability
    - _Requirements: 2.3, 2.4_

  - [x] 3.3 Maintain h-96 height and visual consistency
    - Verify h-96 height is maintained
    - Test hover states and transitions
    - Ensure ProductImageHover component works correctly
    - _Requirements: 2.5, 2.6_

- [ ] 4. Update ProductGrid Component

  - Update grid container styling to use centralized colors
  - Verify 4-column responsive layout is maintained
  - Test product card rendering in grid
  - Ensure proper spacing and gaps
  - _Requirements: 2.1_

- [ ] 5. Fix AccessibilityToolbar Positioning

  - [ ] 5.1 Update toolbar button positioning

    - Change fixed positioning from `top-4` to `top-20`
    - Ensure button appears below navigation bar
    - Maintain z-40 (below navbar's z-50)
    - _Requirements: 4.2, 4.3, 4.4_

  - [ ] 5.2 Update toolbar panel positioning

    - Add padding-top equal to navbar height
    - Position panel below navbar with proper spacing
    - Test responsive behavior on mobile and desktop
    - Verify toolbar doesn't overlap navigation
    - _Requirements: 4.2, 4.3, 4.4, 4.5_

  - [ ] 5.3 Update footer accessibility link
    - Ensure footer link to show accessibility toolbar works
    - Test initial hidden state
    - _Requirements: 4.1_

- [ ] 6. Fix Home Page Product Navigation

  - [ ] 6.1 Update ProductTeaser navigation logic

    - Validate product slug before navigation
    - Implement router.push with error handling
    - Add fallback to window.location on router failure
    - Add navigation logging for debugging
    - _Requirements: 5.1, 5.2, 5.3_

  - [ ] 6.2 Verify product data consistency

    - Ensure product slugs are correctly passed from home page
    - Validate product data matches between home page and detail page
    - Test navigation with different product types
    - _Requirements: 5.4, 5.5_

  - [ ] 6.3 Test "Our Products" section navigation
    - Click each product in "Our Products" section
    - Verify navigation to correct product detail page
    - Test error handling for invalid slugs
    - _Requirements: 5.1, 5.2, 5.3_

- [ ] 7. Testing and Validation

  - [ ]\* 7.1 Configuration testing

    - Verify quality 70 is in next.config.ts
    - Build application without errors
    - Test OptimizedImage with quality 70
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [ ]\* 7.2 Component rendering testing

    - Test ProductCard layering and image display
    - Test ProductGrid layout consistency
    - Test AccessibilityToolbar positioning
    - Verify no overlapping elements
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 4.2, 4.3, 4.4_

  - [ ]\* 7.3 Navigation testing

    - Test product navigation from home page
    - Test navigation error handling
    - Verify fallback navigation works
    - Test with different product types
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ]\* 7.4 Color system testing

    - Verify centralized colors applied correctly
    - Check gradient background on non-hero sections
    - Validate teal-900 on hero section
    - Test hover states (teal-400 on nav, amber-200 on text)
    - Verify xl shadow on visible elements
    - Check color contrast for accessibility
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11, 3.12, 3.13, 3.14_

  - [ ]\* 7.5 Visual regression testing
    - Compare ProductCard before/after
    - Compare ProductGrid layout
    - Check AccessibilityToolbar positioning
    - Validate overall visual consistency
    - _Requirements: All_
