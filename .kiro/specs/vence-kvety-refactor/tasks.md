3# Implementation Plan

- [x] 1. Fix translation system and add missing keys

  - Add missing Czech translation keys to messages/cs.json
  - Validate translation key structure matches English locale
  - Test fallback system with missing keys
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 2. Standardize typography colors globally

  - [x] 2.1 Update globals.css with typography color rules

    - Add h1/h2 color rules (teal-800)
    - Add h3-h6 color rules (amber-100)
    - Add paragraph color rules (amber-100)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 2.2 Remove inline color classes from components

    - Audit all components for hardcoded text colors
    - Remove conflicting color classes
    - Verify global styles are applied
    - _Requirements: 4.5_

  - [ ]\* 2.3 Test color contrast ratios
    - Verify WCAG AA compliance for all color combinations
    - Test with accessibility tools
    - Document contrast ratios
    - _Requirements: 9.4_

- [x] 3. Enhance hero section sizing and impact

  - [x] 3.1 Update RefactoredHeroSection height classes

    - Increase mobile height to min-h-[600px]
    - Adjust tablet height to min-h-[700px]
    - Set desktop height to min-h-[750px]
    - Add xl breakpoint height min-h-[800px]
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 3.2 Increase logo sizing across breakpoints

    - Update mobile logo to w-56
    - Adjust tablet logo to w-80
    - Set desktop logo to w-96
    - Add xl breakpoint logo to w-[28rem]
    - _Requirements: 3.1, 3.2, 3.3_

  - [ ]\* 3.3 Test responsive behavior and performance
    - Test on mobile devices (320px-767px)
    - Test on tablets (768px-1023px)
    - Test on desktop (1024px+)
    - Measure LCP impact
    - _Requirements: 3.5, 8.1, 8.2, 8.3, 10.1, 10.3_

- [x] 4. Standardize product card design across all pages

  - [x] 4.1 Update ProductCard component styling

    - Ensure bg-teal-800 is applied consistently
    - Verify clip-corners utility is used
    - Maintain h-96 height
    - Update info overlay styling (bg-amber-100/95)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 4.2 Verify card consistency on products page

    - Check grid layout rendering
    - Test hover states
    - Verify image loading
    - _Requirements: 6.1, 6.5_

  - [x] 4.3 Verify card consistency on home page

    - Check reference products section
    - Test featured product cards
    - Ensure styling matches products page
    - _Requirements: 6.5_

  - [ ]\* 4.4 Test image loading and error handling
    - Test with missing images
    - Verify fallback images work
    - Test error logging
    - _Requirements: 2.3_

- [x] 5. Optimize product detail layout for large monitors

  - [x] 5.1 Remove height restrictions from ProductDetail left column

    - Remove max-h classes from image container
    - Update ProductDetailImageGrid to use flexible height
    - Ensure images stack naturally
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 5.2 Implement flexible image grid layout

    - Use aspect-square for main image
    - Create responsive thumbnail grid
    - Remove artificial height constraints
    - _Requirements: 5.1, 5.2, 5.5_

  - [x] 5.3 Test layout on various screen sizes
    - Test on mobile (single column)
    - Test on tablet (single column, larger images)
    - Test on desktop (two columns, sticky sidebar)
    - Test on large monitors (expanded image display)
    - _Requirements: 5.3, 8.1, 8.2, 8.3_

- [x] 6. Redesign About page with new visual elements

  - [x] 6.1 Reduce top image section height

    - Change hero image from h-96 to h-64 on mobile
    - Adjust responsive heights (sm:h-72, md:h-80, lg:h-96)
    - Test image quality at reduced sizes
    - _Requirements: 7.1, 7.4_

  - [x] 6.2 Integrate logo into About page design

    - Add logo section above main content
    - Implement responsive logo sizing
    - Ensure proper spacing and alignment
    - _Requirements: 7.3, 7.5_

  - [x] 6.3 Replace decorative elements with gold-outlined cards

    - Create card components with border-2 border-amber-300
    - Add semi-transparent teal-800 background
    - Implement hover effects (border-amber-200)
    - Apply to values/features section
    - _Requirements: 7.2, 7.5_

  - [x] 6.4 Test About page responsive layout
    - Test mobile layout (single column)
    - Test tablet layout (grid adjustments)
    - Test desktop layout (three-column grid)
    - _Requirements: 7.4, 8.1, 8.2, 8.3_

- [x] 7. Fix product loading and display issues

  - [x] 7.1 Investigate product data fetching mechanism

    - Check API endpoint functionality
    - Verify data structure matches component expectations
    - Test with mock data
    - _Requirements: 2.1, 2.2_

  - [x] 7.2 Implement error handling for product loading

    - Add loading states
    - Create error boundary for product components
    - Implement retry mechanism
    - Add fallback empty state
    - _Requirements: 2.3, 2.4_

  - [x] 7.3 Verify product cards render correctly
    - Test with real product data
    - Verify images display properly
    - Check pricing and availability display
    - _Requirements: 2.1, 2.2, 2.5_

- [x] 8. Ensure responsive design integrity across all changes

  - [x] 8.1 Test mobile responsiveness (320px-767px)

    - Test hero section
    - Test product cards
    - Test product detail layout
    - Test About page
    - _Requirements: 8.1, 8.2_

  - [x] 8.2 Test tablet responsiveness (768px-1023px)

    - Test all updated components
    - Verify layout adaptations
    - Check touch interactions
    - _Requirements: 8.1, 8.3_

  - [x] 8.3 Test desktop responsiveness (1024px+)
    - Test on standard desktop (1920x1080)
    - Test on large monitors (2560x1440+)
    - Verify all components scale properly
    - _Requirements: 8.1, 8.5_

- [x] 9. Verify accessibility compliance

  - [x] 9.1 Test keyboard navigation

    - Verify all interactive elements are keyboard accessible
    - Test tab order
    - Check focus indicators
    - _Requirements: 9.1_

  - [x] 9.2 Test screen reader compatibility

    - Verify ARIA labels are meaningful
    - Test with NVDA/JAWS
    - Check semantic HTML structure
    - _Requirements: 9.2, 9.5_

  - [ ]\* 9.3 Run automated accessibility audit
    - Use axe DevTools
    - Run Lighthouse accessibility audit
    - Fix any violations found
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 10. Optimize performance and monitor metrics

  - [x] 10.1 Optimize image loading strategy

    - Verify Next.js Image component usage
    - Set appropriate priority flags
    - Implement lazy loading for below-fold images
    - Use WebP format with fallbacks
    - _Requirements: 10.1, 10.2, 10.3_

  - [x] 10.2 Measure Core Web Vitals

    - Measure LCP (target: <2.5s)
    - Measure FID (target: <100ms)
    - Measure CLS (target: <0.1)
    - _Requirements: 10.3, 10.4_

  - [ ]\* 10.3 Run Lighthouse performance audit

    - Test on mobile
    - Test on desktop
    - Address any performance issues
    - _Requirements: 10.3, 10.5_

  - [x] 10.4 Verify bundle size hasn't increased significantly
    - Compare bundle sizes before/after
    - Check for unnecessary dependencies
    - Optimize if needed
    - _Requirements: 10.4_

- [x] 11. Cross-browser testing and validation

  - [x] 11.1 Test in Chrome/Edge

    - Verify all functionality works
    - Check visual consistency
    - Test responsive behavior
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [x] 11.2 Test in Firefox

    - Verify all functionality works
    - Check visual consistency
    - Test responsive behavior
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [x] 11.3 Test in Safari (desktop and mobile)
    - Verify all functionality works
    - Check visual consistency
    - Test responsive behavior
    - Test on iOS devices
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [-] 12. Final validation and documentation

  - [x] 12.1 Verify all translation keys are working

    - Test Czech locale
    - Test English locale
    - Verify no console errors
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 12.2 Verify all design requirements are met

    - Check typography colors
    - Verify hero section sizing
    - Confirm product card consistency
    - Validate product detail layout
    - Review About page redesign
    - _Requirements: 3.1, 4.1, 5.1, 6.1, 7.1_

  - [ ]\* 12.3 Create visual regression test baseline

    - Capture screenshots of key pages
    - Document expected visual appearance
    - Set up automated visual testing
    - _Requirements: 8.1, 8.2, 8.3_

  - [ ]\* 12.4 Update project documentation
    - Document color system changes
    - Update component usage guidelines
    - Add troubleshooting guide
    - _Requirements: 4.5, 6.5_
