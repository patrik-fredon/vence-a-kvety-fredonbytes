# Implementation Plan

- [x] 1. Add missing translation key for Czech locale
  - Add `footer.home` key with value "Domů" to messages/cs.json
  - Verify `footer.home` exists in messages/en.json with value "Home"
  - Ensure consistent footer section structure across both locale files
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 2. Update deprecated meta tags to modern standards
  - [x] 2.1 Update PageMetadata component meta tag
    - Replace `apple-mobile-web-app-capable` with `mobile-web-app-capable` in src/components/seo/PageMetadata.tsx
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 2.2 Update ResourceHints component meta tag
    - Replace `apple-mobile-web-app-capable` with `mobile-web-app-capable` in src/components/performance/ResourceHints.tsx
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 2.3 Update SEO utils metadata object
    - Replace `apple-mobile-web-app-capable` with `mobile-web-app-capable` in src/lib/seo/utils.ts
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 3. Remove unsupported bluetooth directive from Permissions-Policy
  - Remove `bluetooth=()` from Permissions-Policy header value in next.config.ts
  - Maintain all other security directives (camera, microphone, geolocation, payment, usb)
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 4. Fix ProductCard image container height styling
  - [x] 4.1 Add explicit height to grid view image container
    - Wrap ProductImageHover in div with `relative w-full h-64 overflow-hidden` classes
    - Ensure proper aspect ratio maintenance across viewports
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 4.2 Add explicit height to list view image container
    - Wrap ProductImageHover in div with `relative w-full h-32 overflow-hidden` classes
    - Maintain compact display for list view
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 4.3 Verify ProductImageHover component styling
    - Ensure Image component uses `fill` prop correctly
    - Verify `object-cover` class for proper image scaling
    - Add responsive `sizes` attribute for optimal loading
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [-] 5. Debug and verify product image rendering
  - [ ] 5.1 Add debug logging to products page
    - Log transformed product data after transformProductRow execution
    - Log images array length and structure for first product
    - Verify image URLs are valid and accessible
    - _Requirements: 1.1, 1.6_

  - [ ] 5.2 Verify database contains valid image data
    - Query Supabase products table to check images JSONB column
    - Ensure at least one product has valid images array
    - Verify image objects have required fields (url, isPrimary, alt)
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [ ] 5.3 Clear Redis cache to remove stale data
    - Execute cache clear command or API endpoint
    - Verify cache is empty before testing
    - Re-populate cache with fresh data from database
    - _Requirements: 1.1, 1.6_

  - [ ] 5.4 Test image rendering on products page
    - Load products page in browser
    - Verify ProductCard components display images correctly
    - Test primary image selection (isPrimary flag)
    - Test fallback to first image when no primary exists
    - Test placeholder display when no images exist
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ] 5.5 Remove debug logging after verification
    - Clean up console.log statements added for debugging
    - Keep error logging for production monitoring
    - _Requirements: 1.1_

- [ ] 6. Verify all fixes and run final tests
  - [ ] 6.1 Run TypeScript type checking
    - Execute `npm run type-check` to verify no type errors
    - Fix any type issues that arise from changes
    - _Requirements: All_

  - [ ] 6.2 Run Next.js build to check for warnings
    - Execute `npm run build` and review output
    - Verify no image height warnings
    - Verify no deprecated meta tag warnings
    - Verify no Permissions-Policy warnings
    - _Requirements: 2.5, 4.3, 5.3_

  - [ ] 6.3 Test in development environment
    - Start development server with `npm run dev`
    - Test all affected pages (products, product detail)
    - Verify images display correctly in both grid and list views
    - Check browser console for any warnings or errors
    - Test both Czech and English locales
    - _Requirements: All_

  - [ ] 6.4 Verify responsive design on multiple viewports
    - Test on mobile viewport (375px, 414px)
    - Test on tablet viewport (768px, 1024px)
    - Test on desktop viewport (1280px, 1920px)
    - Ensure images maintain aspect ratio without layout shift
    - _Requirements: 2.4_
