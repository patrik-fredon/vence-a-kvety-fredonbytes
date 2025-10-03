# Requirements Document

## Introduction

This specification addresses critical bugs and improvements identified during a session debugging review of the funeral wreaths e-commerce platform. The issues span multiple domains including product image display, cart functionality, internationalization, accessibility UX, and design system migration. These fixes are essential for production readiness and maintaining a professional, bug-free user experience.

The scope includes:

- Product image rendering issues in card layouts and detail pages
- Shopping cart persistence and cache synchronization bugs
- Missing internationalization translations
- Accessibility toolbar UX improvements
- Tailwind CSS 4 migration with proper gradient implementation
- Product card visual consistency

## Requirements

### Requirement 1: Product Image Display in ProductCardLayout

**User Story:** As a customer browsing products, I want to see product images in the product cards, so that I can visually identify and evaluate products before clicking through to details.

#### Acceptance Criteria

1. WHEN the ProductCardLayout component renders THEN the system SHALL display the primary product image from Supabase database
2. IF no primary image is marked THEN the system SHALL display the first available image from the product's images array
3. IF no images exist for a product THEN the system SHALL display a professional placeholder image with appropriate funeral aesthetics
4. WHEN product images are loaded THEN the system SHALL maintain the existing corner-cropping visual style without image/logic conflicts
5. IF image loading fails THEN the system SHALL log the error and display the fallback placeholder without breaking the layout

### Requirement 2: Product Detail Page Image Layout

**User Story:** As a customer viewing product details, I want to see all product images in a clean, professional layout in the left column, so that I can examine the product from multiple angles before making a purchase decision.

#### Acceptance Criteria

1. WHEN the ProductDetail page renders THEN the system SHALL display all product images from Supabase in the left column
2. WHEN multiple images exist THEN the system SHALL arrange them in a responsive grid layout that adapts to screen size
3. WHEN the left column images are displayed THEN the system SHALL ensure the column height does not exceed the right column (product info) height
4. WHEN images are arranged THEN the system SHALL use a modern, clean layout with consistent spacing and aspect ratios
5. IF the user is on mobile THEN the system SHALL stack images vertically with appropriate touch-friendly spacing
6. WHEN images load THEN the system SHALL use Next.js Image component with proper optimization (quality 70)

### Requirement 3: Shopping Cart Last Item Deletion

**User Story:** As a customer managing my cart, I want the last item to be completely removed when I delete it, so that my cart accurately reflects an empty state without phantom items persisting.

#### Acceptance Criteria

1. WHEN the user removes the last item from the cart THEN the system SHALL delete the item from both LocalStorage and Redis cache
2. WHEN the cart becomes empty THEN the system SHALL clear all cart-related cache entries including configuration and price calculations
3. WHEN the user refreshes the page after removing the last item THEN the system SHALL display an empty cart state
4. WHEN the "Clear All" button is clicked THEN the system SHALL remove all items and completely clear the cart cache
5. IF cache clearing fails THEN the system SHALL log the error and attempt cache reconciliation on next cart operation
6. WHEN cart operations complete THEN the system SHALL verify cache consistency between LocalStorage, Redis, and database

### Requirement 4: Internationalization Translations

**User Story:** As a user switching between Czech and English languages, I want all UI elements to be properly translated, so that I have a consistent localized experience throughout the application.

#### Acceptance Criteria

1. WHEN the accessibility button in the footer is rendered THEN the system SHALL display the translated text from the i18n messages file
2. WHEN the "Clear All" button in the shopping cart is rendered THEN the system SHALL display the translated text from the i18n messages file
3. WHEN the user switches language THEN the system SHALL update both button texts immediately without page refresh
4. IF a translation key is missing THEN the system SHALL log a warning and display the key name as fallback
5. WHEN translations are added THEN the system SHALL include them in both `messages/cs.json` and `messages/en.json` files

### Requirement 5: Accessibility Toolbar Placement

**User Story:** As a user navigating the site, I want the accessibility toolbar to be hidden by default and only accessible via the footer link, so that the interface remains clean while still providing accessibility options when needed.

#### Acceptance Criteria

1. WHEN the page loads THEN the system SHALL NOT display the accessibility button in the header/navbar area
2. WHEN the user views the footer THEN the system SHALL display an "Accessibility" link
3. WHEN the user clicks the footer accessibility link THEN the system SHALL display the accessibility toolbar panel in the upper right corner below the navbar
4. WHEN the accessibility panel is displayed THEN the system SHALL position it at z-index 40 (below navbar's z-50) and top-24 positioning
5. IF the user is on mobile THEN the system SHALL NOT display the accessibility option in the footer
6. WHEN the accessibility panel is open THEN the system SHALL allow users to adjust font size, contrast, and other accessibility settings
7. WHEN the user closes the accessibility panel THEN the system SHALL hide it until the footer link is clicked again

### Requirement 6: Tailwind CSS 4 Migration with Gradient System

**User Story:** As a developer maintaining the codebase, I want the color system to use Tailwind CSS 4 best practices with proper gradient implementation, so that the design system is modern, maintainable, and consistent across the application.

#### Acceptance Criteria

1. WHEN the application loads THEN the system SHALL display the gold gradient background `linear-gradient(to right, #AE8625, #F7EF8A, #D2AC47)` across the entire page
2. WHEN cards, containers, and boxes are rendered THEN the system SHALL use teal-900 background color
3. WHEN the hero section loads THEN the system SHALL be the ONLY section with teal-900 background (exception to gradient rule)
4. WHEN Tailwind configuration is reviewed THEN the system SHALL use CSS custom properties with `@theme` directive (Tailwind v4 style)
5. WHEN color classes are used in components THEN the system SHALL reference semantic color names (primary, accent) from the centralized theme
6. IF legacy color definitions exist THEN the system SHALL remove them to maintain a single source of truth
7. WHEN the gradient is applied THEN the system SHALL ensure proper contrast ratios for WCAG 2.1 AA compliance
8. WHEN the color system is updated THEN the system SHALL consolidate all color definitions into a single, maintainable configuration file

### Requirement 7: Product Card Corner Cropping with Image Display

**User Story:** As a customer browsing products, I want to see product cards with properly cropped corners and visible product images, so that the visual design is consistent and professional.

#### Acceptance Criteria

1. WHEN a product card renders THEN the system SHALL display the product image within the cropped corner frame
2. WHEN the corner cropping logic is applied THEN the system SHALL NOT take precedence over image rendering
3. WHEN the image and cropping are combined THEN the system SHALL ensure both visual effects work together harmoniously
4. WHEN the card layout is rendered THEN the system SHALL maintain consistent corner radius and cropping across all product cards
5. IF the image fails to load THEN the system SHALL still display the cropped corner frame with a placeholder
6. WHEN the user hovers over the card THEN the system SHALL maintain the cropped corner effect during any hover state transitions

### Requirement 8: Redis Cache Optimization

**User Story:** As a system administrator, I want Redis cache to be properly cleared and optimized according to best practices, so that the application performs efficiently without stale data issues.

#### Acceptance Criteria

1. WHEN cart operations complete THEN the system SHALL clear relevant Redis cache entries with appropriate TTL values
2. WHEN the application starts THEN the system SHALL verify Redis connection and log any connection issues
3. WHEN cache entries are created THEN the system SHALL set TTL values according to data type (cart: 24h, prices: 1h, products: 5min)
4. IF cache operations fail THEN the system SHALL fall back to database queries and log the failure for monitoring
5. WHEN cache is cleared THEN the system SHALL use pattern-based deletion for related entries (e.g., all cart price calculations)
6. WHEN debugging cache issues THEN the system SHALL provide cache state logging utilities for troubleshooting

## Success Criteria

The implementation will be considered successful when:

1. All product cards display images correctly without layout issues
2. Product detail pages show all images in a professional, responsive layout
3. Shopping cart last item deletion works consistently across all scenarios
4. All UI elements have proper Czech and English translations
5. Accessibility toolbar is hidden by default and accessible only via footer (desktop only)
6. The application uses Tailwind CSS 4 with proper gradient backgrounds and semantic color system
7. Product cards display images with proper corner cropping visual effects
8. Redis cache is optimized with proper TTL values and clearing logic
9. All TypeScript compilation passes without errors
10. The application maintains Lighthouse performance score of 95+

## Technical Constraints

- Must maintain Next.js 15 App Router architecture
- Must preserve existing TypeScript strict mode compliance
- Must maintain WCAG 2.1 AA accessibility standards
- Must not break existing functionality in other areas
- Must use Supabase as the source of truth for product data
- Must maintain Redis cache performance optimizations
- Must support both Czech and English locales
- Must work on mobile and desktop viewports

## Dependencies

- Supabase database with product images properly stored
- Redis (Upstash) for caching layer
- next-intl for internationalization
- Tailwind CSS 4 configuration
- Next.js Image optimization
- Existing cart context and API endpoints
