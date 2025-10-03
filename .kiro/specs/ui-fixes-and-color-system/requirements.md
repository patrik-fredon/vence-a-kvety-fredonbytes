# Requirements Document

## Introduction

This feature addresses critical UI/UX issues and implements a centralized color system for the funeral wreaths e-commerce platform. The work encompasses fixing image quality configuration errors, refactoring product card rendering, centralizing the Tailwind CSS color system, repositioning accessibility controls, and fixing product navigation from the home page.

## Requirements

### Requirement 1: Fix Next.js Image Quality Configuration

**User Story:** As a developer, I want the Next.js image configuration to support the quality values used in components, so that images render without runtime errors.

#### Acceptance Criteria

1. WHEN the OptimizedImage component uses quality value 70 THEN the application SHALL NOT throw "Invalid quality property" errors
2. WHEN webp format images are rendered THEN the next.config.ts SHALL include quality 70 in the images.qualities array
3. WHEN the configuration is updated THEN all existing quality values (50, 75, 85, 90, 95) SHALL remain functional
4. WHEN images are optimized THEN the system SHALL support quality values: [50, 70, 75, 85, 90, 95]

### Requirement 2: Refactor ProductCard and ProductGrid Image Rendering

**User Story:** As a user, I want to see product images clearly displayed in the product grid, so that I can browse products effectively.

#### Acceptance Criteria

1. WHEN viewing the product grid THEN each ProductCard SHALL display the product image with rounded corners
2. WHEN a ProductCard is rendered THEN the image SHALL fill the card container without being blocked by overlays
3. WHEN viewing a ProductCard THEN the product information (name, price, quick view button) SHALL be displayed in a bottom overlay on the image
4. WHEN hovering over a ProductCard THEN the secondary image SHALL be displayed if available
5. WHEN the ProductCard layout is updated THEN the card SHALL maintain its h-96 height for consistent visual impact
6. WHEN images are loaded THEN they SHALL use the ProductImageHover component for smooth transitions

### Requirement 3: Centralize Tailwind CSS Color System

**User Story:** As a developer, I want all colors centralized in the Tailwind configuration, so that the design system is consistent and maintainable.

#### Acceptance Criteria

1. WHEN colors are defined THEN they SHALL be configured in tailwind.config.ts extended colors section
2. WHEN hardcoded color values exist in components THEN they SHALL be replaced with Tailwind color utility classes
3. WHEN the color system is centralized THEN unused TypeScript design token colors SHALL be removed
4. WHEN color names are used THEN they SHALL follow TypeScript best practices (e.g., bg-primary, text-secondary)
5. WHEN duplicate color configurations exist THEN they SHALL be consolidated into single definitions
6. WHEN the background is rendered THEN it SHALL use a linear gradient (to right, #AE8625, #F7EF8A, #D2AC47) except for the hero section
7. WHEN the hero section is rendered THEN it SHALL maintain teal-900 background
8. WHEN boxes, cards, divs with page titles, or navigation bars are rendered THEN they SHALL use teal-900 background
9. WHEN text is displayed in teal-900 elements THEN it SHALL use amber-100 color
10. WHEN the footer is rendered THEN it SHALL remain unchanged
11. WHEN accent colors are needed THEN they SHALL use teal-800 and amber-200
12. WHEN visible elements are rendered THEN they SHALL have xl shadow applied
13. WHEN hovering over navigation bar items THEN they SHALL use teal-400 color
14. WHEN hovering over other text elements THEN they SHALL use amber-200 color

### Requirement 4: Reposition Accessibility Button

**User Story:** As a user, I want the accessibility toolbar to be positioned below the navigation bar, so that it doesn't interfere with navigation and is easily accessible.

#### Acceptance Criteria

1. WHEN the accessibility button is initially hidden THEN it SHALL be accessible via a link in the footer
2. WHEN the accessibility toolbar is displayed THEN it SHALL be positioned below the navigation bar
3. WHEN the accessibility toolbar is displayed THEN it SHALL have padding equal to the navigation bar height
4. WHEN the accessibility toolbar is positioned THEN it SHALL NOT overlap with the navigation bar
5. WHEN the page is scrolled THEN the accessibility toolbar SHALL maintain its position relative to the navigation bar

### Requirement 5: Fix Home Page Product Navigation

**User Story:** As a user, I want to click on a product in the "Our Products" section and navigate to the correct product detail page, so that I can view the product I'm interested in.

#### Acceptance Criteria

1. WHEN a user clicks on a product in the "Our Products" section THEN they SHALL be navigated to the correct product detail page
2. WHEN the product slug is used for navigation THEN it SHALL match the product displayed in the "Our Products" section
3. WHEN the navigation occurs THEN the product detail page SHALL display the same product that was clicked
4. WHEN the product data is passed THEN it SHALL maintain consistency between the home page and product detail page
5. WHEN the user visits the home page THEN the "Our Products" section SHALL display the correct products with valid slugs
