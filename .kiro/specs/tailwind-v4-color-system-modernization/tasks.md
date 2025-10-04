# Implementation Plan

- [ ] 1. Prepare color system foundation

  - Create comprehensive @theme directive in globals.css with all color definitions
  - Define teal, amber, and stone color palettes with all shades (50-950)
  - Add semantic color aliases (primary, accent, etc.)
  - Define gradient custom properties (funeral-gold, funeral-teal)
  - _Requirements: 1.1, 1.3, 1.4, 6.1, 6.2_

- [ ] 2. Update globals.css with centralized color system

  - Implement @theme directive with all color custom properties
  - Add body background gradient (funeral-gold) with fixed attachment
  - Create utility class definitions for gradients
  - Add fallback values for CSS custom properties
  - Remove duplicate color definitions from :root section
  - _Requirements: 1.1, 2.1, 2.2, 6.1, 6.5_

- [ ] 3. Clean up tailwind.config.ts

  - Remove all color definitions from extend.colors section
  - Remove backgroundImage gradient definitions
  - Keep only non-color configuration (spacing, fonts, animations, etc.)
  - Verify configuration still compiles correctly
  - _Requirements: 1.2, 6.5_

- [ ] 4. Update hero section component with teal-800 background

  - Locate or create HeroSection component
  - Apply bg-teal-800 background class to hero container
  - Set min-h-screen height on hero container
  - Update h1 text color to amber-100 for proper contrast
  - Update h2 text color to amber-200 for hierarchy
  - Style CTA button with amber-200 background and teal-900 text
  - Add hover states to CTA button (hover:bg-amber-300)
  - Ensure logo displays with proper sizing and priority loading
  - _Requirements: 2.3, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [ ] 5. Fix ProductGrid image display logic

  - Update ProductGrid component to properly resolve primary images
  - Implement fallback placeholder image logic
  - Add error handling for missing or failed image loads
  - Ensure OptimizedImage component is used with proper props
  - Set priority loading for first 8 products
  - Add lazy loading for products below the fold
  - Apply teal-800 background to product cards
  - Maintain clip-corners styling on cards
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [ ] 6. Update ProductCard component for consistent styling

  - Apply bg-teal-800 class to card container
  - Ensure clip-corners class is applied
  - Update image display logic to match ProductGrid
  - Set text colors: product name (amber-100), price (amber-200)
  - Add hover states with proper animations
  - Ensure consistent styling between home page and products page
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 7. Update navbar component with golden gradient

  - Apply bg-funeral-gold class to navbar container
  - Ensure sticky/fixed positioning maintains gradient
  - Update link text colors to teal-900 for proper contrast
  - Add hover states to links (hover:text-teal-800)
  - Test mobile responsiveness of gradient
  - _Requirements: 2.5, 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 8. Update product references section styling

  - Ensure section has golden gradient background
  - Verify product cards have teal-800 background
  - Check smooth transition from hero (teal-800) to references (golden gradient)
  - Test card styling consistency with products page
  - _Requirements: 2.4, 2.7, 3.7_

- [ ] 9. Audit and remove hardcoded colors from components

  - Search for hex color values in component files
  - Replace hardcoded colors with Tailwind utility classes
  - Remove inline style attributes with color values
  - Update any RGB/HSL color values to use utility classes
  - _Requirements: 8.4_

- [ ] 10. Clean up design-tokens.ts file

  - Add deprecation comments to color section
  - Remove unused color definitions
  - Keep only colors that are still referenced elsewhere
  - Document migration path for any remaining colors
  - _Requirements: 1.5, 8.1, 8.2_

- [ ] 11. Verify accessibility compliance

  - Test contrast ratios for text on teal-800 background
  - Test contrast ratios for text on golden gradient
  - Verify interactive elements meet 3:1 contrast requirement
  - Test focus states for visibility
  - Verify high contrast mode adaptations
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 12. Test mobile responsiveness

  - Test gradients on mobile devices (320px, 375px, 414px)
  - Verify hero section covers full viewport height on mobile
  - Test product card styling on mobile
  - Verify navbar gradient displays correctly on mobile
  - Test orientation changes (portrait/landscape)
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 13. Performance optimization and validation

  - Measure CSS bundle size before and after changes
  - Run Lighthouse audit and compare scores
  - Test image loading performance (lazy loading, priority hints)
  - Verify no layout shifts occur during color application
  - Test gradient GPU acceleration
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ] 14. Create COLOR_SYSTEM.md documentation

  - Write overview section explaining the color system
  - Document all color palettes with visual examples
  - Provide usage examples for common patterns
  - Explain gradient system usage
  - Include accessibility guidelines and contrast ratios
  - Write migration guide for developers
  - Add best practices section
  - Include troubleshooting guide
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ] 15. Cross-browser testing and final validation
  - Test in Chrome (latest)
  - Test in Firefox (latest)
  - Test in Safari (latest)
  - Test in Edge (latest)
  - Verify CSS custom properties support
  - Test gradient rendering across browsers
  - Verify image optimization works correctly
  - Test clip-path support for clipped corners
  - _Requirements: All requirements final validation_
