# Requirements Document

## Introduction

This specification addresses critical issues with the current color system implementation in the Next.js 15 funeral wreaths e-commerce platform. The project currently suffers from:

1. **Inconsistent Color System**: Colors are scattered across `tailwind.config.ts`, `globals.css`, and inline styles, creating maintenance challenges and confusion
2. **TailwindCSS Version Mismatch**: The project uses both v3 (`extend.colors`) and v4 (`@theme`) patterns inconsistently
3. **Missing Product Images**: ProductGrid in the products section fails to display product images or fallback placeholders
4. **Incorrect Background Application**: The golden gradient background is not consistently applied across the application
5. **Hero Section Styling**: The hero section needs specific teal-800 background treatment with proper gradient transitions

The goal is to modernize the color system to use TailwindCSS 4 best practices, centralize all color definitions in `globals.css` using CSS custom properties, and fix visual rendering issues.

## Requirements

### Requirement 1: Modernize Color System Architecture

**User Story:** As a developer, I want a centralized, modern color system using TailwindCSS 4 best practices, so that color management is consistent, maintainable, and follows industry standards.

#### Acceptance Criteria

1. WHEN the color system is implemented THEN all colors SHALL be defined using CSS custom properties in `globals.css` with the `@theme` directive
2. WHEN colors are defined THEN the `tailwind.config.ts` SHALL NOT contain color definitions in the `extend.colors` section
3. WHEN the color system is complete THEN all color variables SHALL follow the naming convention `--color-{palette}-{shade}` (e.g., `--color-teal-800`)
4. WHEN gradients are defined THEN they SHALL use CSS custom properties and be accessible via Tailwind utility classes
5. WHEN the implementation is complete THEN the `src/lib/design-tokens.ts` file SHALL be audited and unused color definitions SHALL be removed or marked as deprecated

### Requirement 2: Implement Project-Wide Background Gradient System

**User Story:** As a user, I want a consistent golden gradient background throughout the application (except specific sections), so that the visual experience is cohesive and professional.

#### Acceptance Criteria

1. WHEN the body element renders THEN it SHALL have the background gradient `linear-gradient(to right, #ae8625, #f7ef8a, #d2ac47)`
2. WHEN the gradient is applied THEN it SHALL use `background-attachment: fixed` to prevent scrolling artifacts
3. WHEN the hero section renders THEN it SHALL have a teal-800 solid background color, NOT the golden gradient
4. WHEN the product references section renders THEN it SHALL have the golden gradient background
5. WHEN the navbar renders THEN it SHALL have the golden gradient background
6. WHEN the footer renders THEN it SHALL maintain its current styling (no changes required)
7. WHEN product cards render in the product references section THEN they SHALL have teal-800 background with clipped corners

### Requirement 3: Fix Hero Section Styling

**User Story:** As a user visiting the homepage, I want the hero section to have a distinctive teal background with proper content styling, so that it stands out as the primary landing area.

#### Acceptance Criteria

1. WHEN the hero section renders THEN it SHALL have a `min-h-screen` height
2. WHEN the hero section renders THEN it SHALL have a teal-800 (`#115e59`) solid background color
3. WHEN the logo renders in the hero section THEN it SHALL be properly sized and centered
4. WHEN the h1 heading renders THEN it SHALL use appropriate color contrast against the teal-800 background
5. WHEN the h2 subheading renders THEN it SHALL use appropriate color contrast against the teal-800 background
6. WHEN the CTA button renders THEN it SHALL have proper styling with good contrast and hover states
7. WHEN the hero section transitions to the product references section THEN there SHALL be a smooth visual transition from teal-800 to the golden gradient

### Requirement 4: Fix ProductGrid Image Display Issues

**User Story:** As a user browsing products, I want to see product images or fallback placeholders in the ProductGrid, so that I can visually identify products.

#### Acceptance Criteria

1. WHEN ProductGrid renders in the products section THEN each product card SHALL display its primary image
2. IF a product has no primary image THEN a fallback placeholder image SHALL be displayed
3. WHEN product images load THEN they SHALL use Next.js Image component with proper optimization
4. WHEN product cards render THEN they SHALL maintain the clipped corners styling
5. WHEN product cards render in ProductGrid THEN they SHALL have teal-800 background color
6. WHEN product images fail to load THEN an error boundary SHALL catch the error and display a fallback UI

### Requirement 5: Implement Consistent Card Styling

**User Story:** As a user, I want product cards to have consistent styling across the home page and products page, so that the visual experience is uniform.

#### Acceptance Criteria

1. WHEN product cards render on the home page THEN they SHALL have teal-800 background with clipped corners
2. WHEN product cards render on the products page THEN they SHALL have teal-800 background with clipped corners
3. WHEN product cards render THEN they SHALL use the same image display logic (primary image or fallback)
4. WHEN product cards have hover states THEN they SHALL use consistent animation and styling
5. WHEN product cards display pricing THEN the text SHALL have proper contrast against the teal-800 background

### Requirement 6: Centralize Gradient Definitions

**User Story:** As a developer, I want gradient definitions centralized in CSS custom properties, so that they can be easily maintained and reused throughout the application.

#### Acceptance Criteria

1. WHEN gradients are defined THEN they SHALL be created as CSS custom properties in `globals.css`
2. WHEN the golden gradient is needed THEN it SHALL be accessible via `bg-funeral-gold` utility class
3. WHEN the teal gradient is needed THEN it SHALL be accessible via `bg-funeral-teal` utility class
4. WHEN gradients are applied THEN they SHALL work correctly with Tailwind's responsive modifiers
5. WHEN the `tailwind.config.ts` is reviewed THEN it SHALL NOT contain gradient definitions in `backgroundImage`

### Requirement 7: Update Navbar Styling

**User Story:** As a user, I want the navbar to have the golden gradient background, so that it matches the overall design aesthetic.

#### Acceptance Criteria

1. WHEN the navbar renders THEN it SHALL have the golden gradient background `linear-gradient(to right, #ae8625, #f7ef8a, #d2ac47)`
2. WHEN the navbar is sticky/fixed THEN the gradient SHALL remain visible
3. WHEN navbar text renders THEN it SHALL have proper contrast against the golden gradient
4. WHEN navbar links have hover states THEN they SHALL be clearly visible against the gradient
5. WHEN the navbar renders on mobile THEN the gradient SHALL be responsive and properly displayed

### Requirement 8: Audit and Clean Up Color Definitions

**User Story:** As a developer, I want unused and duplicate color definitions removed, so that the codebase is clean and maintainable.

#### Acceptance Criteria

1. WHEN the audit is complete THEN all unused color definitions in `design-tokens.ts` SHALL be removed or marked as deprecated
2. WHEN the audit is complete THEN duplicate color definitions between `tailwind.config.ts` and `globals.css` SHALL be eliminated
3. WHEN the audit is complete THEN all components SHALL use the centralized color system
4. WHEN hardcoded color values are found in components THEN they SHALL be replaced with Tailwind utility classes
5. WHEN the cleanup is complete THEN a documentation file SHALL be created explaining the color system usage

### Requirement 9: Ensure Accessibility Compliance

**User Story:** As a user with visual impairments, I want all color combinations to meet WCAG 2.1 AA contrast requirements, so that I can read and navigate the site effectively.

#### Acceptance Criteria

1. WHEN text renders on teal-800 background THEN it SHALL have a contrast ratio of at least 4.5:1 for normal text
2. WHEN text renders on the golden gradient THEN it SHALL have a contrast ratio of at least 4.5:1 for normal text
3. WHEN interactive elements render THEN they SHALL have a contrast ratio of at least 3:1 against their background
4. WHEN focus states are applied THEN they SHALL be clearly visible with sufficient contrast
5. WHEN the high contrast mode is enabled THEN all colors SHALL adapt appropriately

### Requirement 10: Maintain Mobile Responsiveness

**User Story:** As a mobile user, I want the color system and gradients to work correctly on my device, so that I have a consistent experience across all screen sizes.

#### Acceptance Criteria

1. WHEN the application renders on mobile THEN all gradients SHALL display correctly without performance issues
2. WHEN the hero section renders on mobile THEN the teal-800 background SHALL cover the full viewport height
3. WHEN product cards render on mobile THEN they SHALL maintain proper styling and image display
4. WHEN the navbar renders on mobile THEN the golden gradient SHALL be visible and properly sized
5. WHEN orientation changes occur THEN the color system SHALL adapt without visual glitches

### Requirement 11: Performance Optimization

**User Story:** As a user, I want the color system to be performant, so that page load times and rendering are not negatively impacted.

#### Acceptance Criteria

1. WHEN CSS custom properties are used THEN they SHALL NOT cause layout shifts or repaints
2. WHEN gradients are applied THEN they SHALL use GPU acceleration where appropriate
3. WHEN the page loads THEN the color system SHALL NOT block critical rendering path
4. WHEN images load in ProductGrid THEN they SHALL use lazy loading and proper priority hints
5. WHEN the application is built THEN the CSS bundle size SHALL NOT increase significantly compared to the current implementation

### Requirement 12: Documentation and Developer Experience

**User Story:** As a developer joining the project, I want clear documentation on the color system, so that I can quickly understand and use it correctly.

#### Acceptance Criteria

1. WHEN the implementation is complete THEN a `COLOR_SYSTEM.md` documentation file SHALL be created in the `docs/` directory
2. WHEN the documentation is written THEN it SHALL include examples of how to use each color and gradient
3. WHEN the documentation is written THEN it SHALL explain the naming conventions and best practices
4. WHEN the documentation is written THEN it SHALL include a migration guide from the old system
5. WHEN developers need to add new colors THEN the documentation SHALL provide clear instructions on where and how to add them
