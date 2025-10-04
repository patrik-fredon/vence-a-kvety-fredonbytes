# Implementation Plan

- [x] 1. Prepare color system foundation

  - Create comprehensive @theme directive in globals.css with all color definitions
  - Define teal, amber, and stone color palettes with all shades (50-950)
  - Add semantic color aliases (primary, accent, etc.)
  - Define gradient custom properties (funeral-gold, funeral-teal)
  - _Requirements: 1.1, 1.3, 1.4, 6.1, 6.2_

- [x] 2. Update globals.css with centralized color system

  - Implement @theme directive with all color custom properties
  - Add body background gradient (funeral-gold) with fixed attachment
  - Create utility class definitions for gradients
  - Add fallback values for CSS custom properties
  - Remove duplicate color definitions from :root section
  - _Requirements: 1.1, 2.1, 2.2, 6.1, 6.5_

- [x] 3. Clean up tailwind.config.ts

  - Remove all color definitions from extend.colors section
  - Remove backgroundImage gradient definitions
  - Keep only non-color configuration (spacing, fonts, animations, etc.)
  - Verify configuration still compiles correctly
  - _Requirements: 1.2, 6.5_

- [x] 4. Update hero section component with teal-800 background

  - Locate or create HeroSection component
  - Apply bg-teal-800 background class to hero container
  - Set min-h-screen height on hero container
  - Update h1 text color to amber-100 for proper contrast
  - Update h2 text color to amber-200 for hierarchy
  - Style CTA button with amber-200 background and teal-900 text
  - Add hover states to CTA button (hover:bg-amber-300)
  - Ensure logo displays with proper sizing and priority loading
  - _Requirements: 2.3, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [x] 5. Fix ProductGrid image display logic

  - Update ProductGrid component to properly resolve primary images
  - Implement fallback placeholder image logic
  - Add error handling for missing or failed image loads
  - Ensure OptimizedImage component is used with proper props
  - Set priority loading for first 8 products
  - Add lazy loading for products below the fold
  - Apply teal-800 background to product cards
  - Maintain clip-corners styling on cards
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [x] 6. Update ProductCard component for consistent styling

  - Apply bg-teal-800 class to card container
  - Ensure clip-corners class is applied
  - Update image display logic to match ProductGrid
  - Set text colors: product name (amber-100), price (amber-200)
  - Add hover states with proper animations
  - Ensure consistent styling between home page and products page
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 7. Update navbar component with golden gradient

  - Apply bg-funeral-gold class to navbar container
  - Ensure sticky/fixed positioning maintains gradient
  - Update link text colors to teal-900 for proper contrast
  - Add hover states to links (hover:text-teal-800)
  - Test mobile responsiveness of gradient
  - _Requirements: 2.5, 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 8. Update product references section styling

  - Ensure section has golden gradient background
  - Verify product cards have teal-800 background
  - Check smooth transition from hero (teal-800) to references (golden gradient)
  - Test card styling consistency with products page
  - _Requirements: 2.4, 2.7, 3.7_

- [ ] 9. Audit and remove hardcoded colors from components

- [-] 9.1 Update OptimizedImage.tsx SVG placeholder colors

  - Replace hardcoded hex colors in SVG gradient stops with Tailwind color variables
  - Update stop-color values to use stone palette
  - _Requirements: 8.4_

- [ ] 9.2 Update ProductImage.tsx SVG placeholder colors

  - Replace hardcoded hex colors in SVG gradient and shapes
  - Use stone palette color variables for consistency
  - _Requirements: 8.4_

- [ ] 9.3 Update ProductToCartAnimation.tsx background color

  - Replace hardcoded amber-600 hex with Tailwind utility class or CSS variable
  - _Requirements: 8.4_

- [ ] 9.4 Update StripePaymentForm.tsx theme colors

  - Replace hardcoded hex colors with CSS custom properties
  - Use amber and stone palette variables
  - _Requirements: 8.4_

- [ ] 9.5 Update WebVitalsTracker.tsx status colors

  - Replace hardcoded hex colors with semantic color variables
  - Use success/warning/error from color system
  - _Requirements: 8.4_

- [ ] 9.6 Update PageMetadata.tsx theme colors

  - Replace hardcoded theme-color and msapplication-TileColor hex values
  - Use teal palette variables
  - _Requirements: 8.4_

- [ ] 9.7 Update ResourceHints.tsx background colors

  - Replace hardcoded hex colors with CSS custom properties
  - Use teal and amber palette variables
  - _Requirements: 8.4_

- [ ] 10. Clean up design-tokens.ts file

- [ ] 10.1 Update stoneColors palette to match @theme directive

  - Fix incorrect values in stone-50, stone-100, stone-200
  - Ensure consistency with globals.css @theme definitions
  - _Requirements: 1.5, 8.1_

- [ ] 10.2 Update amberColors palette to match @theme directive

  - Fix incorrect values that don't match amber palette
  - Ensure consistency with globals.css @theme definitions
  - _Requirements: 1.5, 8.1_

- [ ] 10.3 Update funeralColors to use CSS variables consistently

  - Ensure all funeral color references use var(--color-\*) format
  - Remove hardcoded hex values where CSS variables exist
  - _Requirements: 1.5, 8.2_

- [ ] 10.4 Add deprecation notice to color section

  - Add JSDoc comment explaining colors are now in globals.css @theme
  - Document that design-tokens.ts colors are for reference only
  - Provide migration guidance for developers
  - _Requirements: 8.1, 8.2_

- [ ] 11. Verify accessibility compliance

- [ ] 11.1 Test text contrast on teal-800 background

  - Verify amber-100 text meets WCAG AA (4.5:1) on teal-800
  - Verify amber-200 text meets WCAG AA (4.5:1) on teal-800
  - Document contrast ratios in test results
  - _Requirements: 9.1_

- [ ] 11.2 Test text contrast on golden gradient background

  - Verify teal-900 text meets WCAG AA on funeral-gold gradient
  - Test at multiple gradient positions
  - Document contrast ratios in test results
  - _Requirements: 9.2_

- [ ] 11.3 Test interactive element contrast

  - Verify button borders and backgrounds meet 3:1 contrast
  - Test link colors against their backgrounds
  - Test form input borders and labels
  - _Requirements: 9.3_

- [ ] 11.4 Test focus state visibility

  - Verify focus rings are visible on all interactive elements
  - Test focus states on both teal-800 and golden gradient backgrounds
  - Ensure focus indicators meet 3:1 contrast requirement
  - _Requirements: 9.4_

- [ ] 11.5 Test high contrast mode

  - Enable high contrast mode in browser/OS
  - Verify all text remains readable
  - Test that interactive elements are distinguishable
  - Document any issues found
  - _Requirements: 9.5_

- [x] 12. Test mobile responsiveness

  - Test gradients on mobile devices (320px, 375px, 414px)
  - Verify hero section covers full viewport height on mobile
  - Test product card styling on mobile
  - Verify navbar gradient displays correctly on mobile
  - Test orientation changes (portrait/landscape)
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 13. Performance optimization and validation

- [ ] 13.1 Measure CSS bundle size

  - Run production build and measure CSS output size
  - Compare with baseline before color system modernization
  - Document size changes and any optimizations applied
  - _Requirements: 11.1, 11.5_

- [ ] 13.2 Run Lighthouse performance audit

  - Run Lighthouse on home page, products page, and product detail page
  - Compare scores with baseline measurements
  - Document any performance regressions or improvements
  - _Requirements: 11.2_

- [ ] 13.3 Test image loading performance

  - Verify lazy loading works correctly for below-fold images
  - Confirm priority hints are applied to above-fold images
  - Test image loading on slow 3G connection
  - _Requirements: 11.3, 11.4_

- [ ] 13.4 Verify no layout shifts

  - Use Lighthouse CLS metric to measure layout stability
  - Test color application doesn't cause repaints
  - Verify gradient backgrounds don't cause layout shifts
  - _Requirements: 11.4_

- [ ] 13.5 Test gradient GPU acceleration

  - Use browser DevTools Performance tab to verify GPU usage
  - Check for smooth scrolling with fixed gradient backgrounds
  - Test on lower-end devices if possible
  - _Requirements: 11.1_

- [ ] 14. Create COLOR_SYSTEM.md documentation

- [ ] 14.1 Write overview and architecture section

  - Explain the TailwindCSS 4 @theme directive approach
  - Document the centralized color system in globals.css
  - Explain benefits over scattered color definitions
  - _Requirements: 12.1_

- [ ] 14.2 Document color palettes with examples

  - List all teal, amber, and stone color shades
  - Provide visual examples or hex values for each shade
  - Show semantic color aliases (primary, accent, etc.)
  - _Requirements: 12.2_

- [ ] 14.3 Provide usage examples and patterns

  - Show how to use bg-teal-800, text-amber-100, etc.
  - Demonstrate gradient usage (bg-funeral-gold)
  - Include common component styling patterns
  - _Requirements: 12.3_

- [ ] 14.4 Document gradient system

  - Explain funeral-gold and funeral-teal gradients
  - Show how to apply gradients with utility classes
  - Document when to use gradients vs solid colors
  - _Requirements: 12.4_

- [ ] 14.5 Include accessibility guidelines

  - Document tested contrast ratios for key combinations
  - Provide guidance on choosing accessible color pairs
  - Include WCAG AA/AAA compliance information
  - _Requirements: 12.5_

- [ ] 14.6 Write migration guide

  - Explain how to migrate from old color system
  - Show before/after examples
  - Document common pitfalls and solutions
  - _Requirements: 12.4_

- [ ] 14.7 Add best practices and troubleshooting

  - List do's and don'ts for color usage
  - Include troubleshooting section for common issues
  - Provide guidance on adding new colors
  - _Requirements: 12.5_

- [ ] 15. Cross-browser testing and final validation

- [ ] 15.1 Test in Chrome (latest)

  - Verify all colors render correctly
  - Test gradients and CSS custom properties
  - Check image optimization and clip-path support
  - _Requirements: All requirements final validation_

- [ ] 15.2 Test in Firefox (latest)

  - Verify all colors render correctly
  - Test gradients and CSS custom properties
  - Check image optimization and clip-path support
  - _Requirements: All requirements final validation_

- [ ] 15.3 Test in Safari (latest)

  - Verify all colors render correctly
  - Test gradients and CSS custom properties
  - Check image optimization and clip-path support
  - Test on both macOS and iOS if possible
  - _Requirements: All requirements final validation_

- [ ] 15.4 Test in Edge (latest)

  - Verify all colors render correctly
  - Test gradients and CSS custom properties
  - Check image optimization and clip-path support
  - _Requirements: All requirements final validation_

- [ ] 15.5 Document cross-browser compatibility
  - Create compatibility matrix for tested browsers
  - Document any browser-specific issues found
  - Provide fallback solutions if needed
  - _Requirements: All requirements final validation_
