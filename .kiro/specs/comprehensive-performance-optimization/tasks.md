# Implementation Plan

This implementation plan breaks down the comprehensive performance optimization into discrete, manageable coding tasks. Each task builds incrementally on previous work and focuses on measurable improvements.

## Tasks

- [-] 1. Set up performance monitoring and baseline metrics
  - Create performance monitoring dashboard component
  - Implement automated Lighthouse CI in build pipeline
  - Set up Core Web Vitals tracking with Vercel Analytics
  - Create performance budget configuration file
  - Generate baseline performance report for all key pages
  - _Requirements: 12.1, 12.2, 12.4, 12.5_

- [ ] 2. Implement bundle analysis automation
  - [ ] 2.1 Create bundle analysis script with size thresholds
    - Write script to analyze webpack bundle output
    - Implement size threshold checks (main < 200KB, vendor < 500KB)
    - Generate JSON report with chunk breakdown
    - _Requirements: 8.2, 8.4_

  - [ ] 2.2 Add bundle comparison with baseline
    - Implement baseline storage mechanism
    - Create comparison logic to detect size increases
    - Generate diff report showing changes
    - _Requirements: 8.4_

  - [ ] 2.3 Integrate bundle analysis into CI/CD
    - Add bundle analysis step to GitHub Actions
    - Configure alerts for bundle size increases > 10%
    - Generate and upload bundle reports as artifacts
    - _Requirements: 8.4, 8.5_

- [ ] 3. Optimize CSS delivery and reduce bundle size
  - [ ] 3.1 Extract and inline critical CSS
    - Install and configure critical CSS extraction tool
    - Create script to extract critical CSS for key pages
    - Implement inline CSS injection in root layout
    - Defer non-critical CSS loading
    - _Requirements: 1.1_

  - [ ] 3.2 Convert global CSS to CSS Modules
    - Audit globals.css for component-specific styles
    - Create CSS Module files for product components
    - Create CSS Module files for layout components
    - Update component imports to use CSS Modules
    - Remove unused global styles
    - _Requirements: 1.3_

  - [ ] 3.3 Optimize TailwindCSS configuration
    - Verify content paths in tailwind.config.ts
    - Enable JIT mode optimizations
    - Remove unused Tailwind utilities
    - Configure safelist for dynamic classes
    - _Requirements: 1.2_

  - [ ]* 3.4 Measure CSS optimization impact
    - Run Lighthouse before/after comparison
    - Measure CSS bundle size reduction
    - Verify no visual regressions
    - _Requirements: 1.5_

- [ ] 4. Implement font optimization strategy
  - [ ] 4.1 Self-host and subset fonts
    - Download Inter font files from Google Fonts
    - Subset fonts to Latin and Czech characters only
    - Convert fonts to WOFF2 format
    - Create public/fonts directory structure
    - _Requirements: 3.3, 3.4_

  - [ ] 4.2 Configure next/font for optimal loading
    - Update root layout to use next/font/local
    - Configure font-display: swap
    - Add font preload links
    - Set up font fallback stack
    - _Requirements: 3.1, 3.2_

  - [ ] 4.3 Implement font loading optimization
    - Add font-face declarations with unicode-range
    - Configure variable fonts if applicable
    - Remove Google Fonts external requests
    - _Requirements: 3.5_

- [ ] 5. Refactor components to maximize Server Components
  - [ ] 5.1 Audit current component architecture
    - Create inventory of all "use client" components
    - Identify components that can be Server Components
    - Document client-side requirements for each component
    - _Requirements: 2.1, 2.4_

  - [ ] 5.2 Refactor layout components to Server Components
    - Convert Header to Server Component (move client logic down)
    - Convert Footer to Server Component
    - Convert Navigation to Server Component where possible
    - Push client boundaries to interactive elements only
    - _Requirements: 2.1, 2.3_

  - [ ] 5.3 Refactor product components to Server Components
    - Convert ProductInfo to Server Component
    - Convert ProductGrid to Server Component
    - Keep ProductCard as client only for interactions
    - Optimize ProductDetail component boundaries
    - _Requirements: 2.1, 2.3_

  - [ ] 5.4 Add Suspense boundaries for streaming
    - Wrap slow data fetches in Suspense
    - Create loading skeletons for product lists
    - Implement streaming for product detail pages
    - Add error boundaries for failed fetches
    - _Requirements: 2.5_

  - [ ]* 5.5 Measure component refactoring impact
    - Compare client bundle size before/after
    - Verify 30% reduction in "use client" directives
    - Test all interactive features still work
    - _Requirements: 2.4_

- [ ] 6. Optimize database queries and API routes
  - [ ] 6.1 Add database indexes for performance
    - Create index on products.category_id
    - Create index on products.created_at
    - Create composite index on cart_items(user_id, product_id)
    - Create index on orders.user_id
    - Write migration file for indexes
    - _Requirements: 4.1_

  - [ ] 6.2 Eliminate N+1 queries in product fetching
    - Refactor getProducts to use JOIN for images
    - Refactor getProductDetail to include related data
    - Update cart queries to batch load products
    - Optimize order history queries
    - _Requirements: 4.2_

  - [ ] 6.3 Implement API response caching
    - Add Redis caching to /api/products
    - Add Redis caching to /api/categories
    - Implement cache invalidation on updates
    - Add cache tags for granular invalidation
    - _Requirements: 4.3_

  - [ ] 6.4 Set up database connection pooling
    - Configure Supabase connection pool settings
    - Implement connection reuse in API routes
    - Add connection health checks
    - _Requirements: 4.4_

  - [ ]* 6.5 Measure API optimization impact
    - Benchmark API response times before/after
    - Verify < 200ms for cached responses
    - Verify < 500ms for database queries
    - _Requirements: 4.5_

- [ ] 7. Enhance image optimization
  - [ ] 7.1 Implement responsive image srcsets
    - Update ProductImage component with sizes prop
    - Configure appropriate breakpoints
    - Add srcset generation for product images
    - _Requirements: 5.1_

  - [ ] 7.2 Add blur placeholders for all images
    - Create script to generate blur data URLs
    - Update product image records with blur data
    - Implement blur placeholder in Image components
    - _Requirements: 5.5_

  - [ ] 7.3 Optimize critical image loading
    - Add priority prop to above-fold images
    - Add fetchpriority="high" to hero images
    - Implement lazy loading for below-fold images
    - _Requirements: 5.2, 5.3_

  - [ ] 7.4 Verify AVIF/WebP format support
    - Confirm Next.js image optimization config
    - Test AVIF delivery in production
    - Verify WebP fallback works
    - _Requirements: 5.4_

- [ ] 8. Optimize for mobile performance
  - [ ] 8.1 Audit and fix mobile CSS
    - Review all components for mobile-first approach
    - Fix any desktop-first media queries
    - Optimize mobile layout shifts
    - _Requirements: 6.4_

  - [ ] 8.2 Ensure minimum touch target sizes
    - Audit all interactive elements
    - Fix buttons/links smaller than 48x48px
    - Add padding to small touch targets
    - _Requirements: 6.2_

  - [ ] 8.3 Implement mobile-specific optimizations
    - Lazy load desktop-only features on mobile
    - Reduce image sizes for mobile viewports
    - Optimize mobile scroll performance
    - _Requirements: 6.3, 6.5_

  - [ ]* 8.4 Run mobile Lighthouse tests
    - Test on real mobile devices
    - Achieve Lighthouse mobile score > 90
    - Verify 60fps scroll performance
    - _Requirements: 6.1_

- [ ] 9. Optimize third-party scripts
  - [ ] 9.1 Audit and defer third-party scripts
    - Move Vercel Analytics to lazyOnload strategy
    - Ensure Stripe SDK only loads on checkout
    - Add async/defer to all external scripts
    - _Requirements: 7.1, 7.3_

  - [ ] 9.2 Implement script loading error handling
    - Add onError handlers to all Script components
    - Implement fallbacks for failed scripts
    - Log script loading failures
    - _Requirements: 7.5_

  - [ ] 9.3 Optimize monitoring script loading
    - Load web-vitals library after interactive
    - Defer error logging initialization
    - Ensure monitoring doesn't block main thread
    - _Requirements: 7.2, 7.4_

- [ ] 10. Implement service worker for offline support
  - [ ] 10.1 Create service worker with caching strategy
    - Write service worker with cache-first for static assets
    - Implement network-first for API calls
    - Add offline fallback page
    - _Requirements: 9.5_

  - [ ] 10.2 Configure service worker registration
    - Register service worker in root layout
    - Implement update notification
    - Handle service worker lifecycle
    - _Requirements: 9.5_

  - [ ] 10.3 Implement cache invalidation strategy
    - Add cache versioning
    - Implement cache cleanup on update
    - Configure cache expiration policies
    - _Requirements: 9.4_

- [ ] 11. Optimize caching and CDN strategy
  - [ ] 11.1 Configure optimal cache headers
    - Set 1-year cache for static assets
    - Implement stale-while-revalidate for API
    - Configure CDN cache rules
    - _Requirements: 9.1, 9.3_

  - [ ] 11.2 Implement image CDN caching
    - Configure Vercel image optimization caching
    - Set up cache invalidation for updated images
    - Verify edge caching is working
    - _Requirements: 9.4_

  - [ ] 11.3 Add resource hints for performance
    - Add dns-prefetch for external domains
    - Add preconnect for critical origins
    - Add prefetch for likely navigation
    - _Requirements: 9.2_

- [ ] 12. Implement cross-browser performance testing
  - [ ] 12.1 Set up Playwright performance tests
    - Create performance test suite
    - Test Chrome, Firefox, Safari, Edge
    - Measure Core Web Vitals in each browser
    - _Requirements: 11.1_

  - [ ] 12.2 Add browser-specific optimizations
    - Implement feature detection
    - Add graceful degradation
    - Test fallbacks in all browsers
    - _Requirements: 11.2, 11.3_

  - [ ]* 12.3 Verify cross-browser performance parity
    - Compare metrics across browsers
    - Ensure < 10% variance
    - Fix browser-specific issues
    - _Requirements: 11.1, 11.4, 11.5_

- [ ] 13. Final optimization and validation
  - [ ] 13.1 Run comprehensive performance audit
    - Test all Core Web Vitals targets
    - Verify bundle size targets met
    - Check API response time targets
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [ ] 13.2 Validate production performance
    - Deploy to staging environment
    - Run real-world performance tests
    - Collect RUM data for 24 hours
    - _Requirements: 10.5, 12.4_

  - [ ] 13.3 Create performance documentation
    - Document optimization techniques used
    - Create performance maintenance guide
    - Document monitoring and alerting setup
    - _Requirements: 12.1, 12.2, 12.3_

  - [ ] 13.4 Set up ongoing performance monitoring
    - Configure automated performance tests in CI
    - Set up alerts for performance regressions
    - Create performance dashboard
    - _Requirements: 12.2, 12.5_
