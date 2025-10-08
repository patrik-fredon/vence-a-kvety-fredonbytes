# Requirements Document

## Introduction

This feature addresses critical production issues affecting the funeral wreaths e-commerce platform. The issues span product image rendering, internationalization completeness, and deprecated HTML/HTTP configurations. These fixes are essential for proper product display, complete localization support, and compliance with modern web standards.

The platform currently experiences image rendering problems on the products page due to inconsistent data handling from Supabase, missing translation keys causing console warnings, and deprecated meta tags/HTTP headers that need modernization.

## Requirements

### Requirement 1: Product Image Rendering on Products Page

**User Story:** As a customer browsing the products page, I want to see product images displayed correctly so that I can make informed purchasing decisions about funeral wreaths.

#### Acceptance Criteria

1. WHEN the products page loads THEN the system SHALL correctly parse the Supabase `products.images` JSONB column data
2. WHEN multiple images exist for a product THEN the system SHALL display the image flagged as `primary` first
3. IF no image is flagged as primary THEN the system SHALL display the first available image in the array
4. IF no images exist THEN the system SHALL display a placeholder image
5. WHEN rendering product images THEN the system SHALL apply proper parent container height styling to prevent Next.js Image optimization warnings
6. WHEN data comes from different sources (Supabase JSONB vs CSV imports) THEN the system SHALL handle both array and JSON string formats consistently

### Requirement 2: Image Height Styling Compliance

**User Story:** As a developer maintaining the application, I want all product image components to have proper height constraints so that Next.js Image optimization works without warnings and images render correctly across all viewports.

#### Acceptance Criteria

1. WHEN ProductCard component renders an image THEN the parent container SHALL have explicit CSS height defined
2. WHEN ProductImage component uses Next.js Image with `fill` prop THEN the parent container SHALL have `position: relative` and explicit height
3. WHEN ProductGrid displays multiple products THEN all image containers SHALL maintain consistent aspect ratios
4. WHEN the page is viewed on mobile devices THEN images SHALL render responsively without layout shift
5. WHEN Next.js build runs THEN there SHALL be no image height warnings in the console

### Requirement 3: Internationalization Completeness

**User Story:** As a Czech-speaking customer, I want all interface elements to be properly translated so that I can navigate the site without encountering missing translation errors.

#### Acceptance Criteria

1. WHEN the footer component renders in Czech locale THEN the system SHALL display the translated "Home" link text
2. WHEN the translation key `footer.home` is requested in Czech locale THEN the system SHALL return the proper Czech translation
3. WHEN the translation key `footer.home` is requested in English locale THEN the system SHALL return the proper English translation
4. WHEN the application loads THEN there SHALL be no missing translation key warnings in the browser console
5. WHEN i18n configuration is validated THEN all locale files SHALL have consistent key structures

### Requirement 4: Modern HTML Meta Tag Compliance

**User Story:** As a mobile user accessing the site, I want the application to use modern web standards so that my device properly recognizes the web app capabilities.

#### Acceptance Criteria

1. WHEN the HTML head is rendered THEN the system SHALL NOT include the deprecated `apple-mobile-web-app-capable` meta tag
2. WHEN the HTML head is rendered THEN the system SHALL include the modern `mobile-web-app-capable` meta tag
3. WHEN the page is validated against HTML standards THEN there SHALL be no deprecated meta tag warnings
4. WHEN the application is accessed on mobile devices THEN web app capabilities SHALL function correctly with the updated meta tag

### Requirement 5: HTTP Headers Policy Modernization

**User Story:** As a security-conscious site administrator, I want the HTTP security headers to comply with current standards so that the application passes security audits and browser compatibility checks.

#### Acceptance Criteria

1. WHEN HTTP response headers are sent THEN the `Permissions-Policy` header SHALL NOT include the unsupported `bluetooth` directive
2. WHEN the Permissions-Policy header is configured THEN it SHALL only include supported directives per current browser standards
3. WHEN the application is tested in modern browsers THEN there SHALL be no Permissions-Policy warnings in the console
4. WHEN security headers are audited THEN the configuration SHALL align with OWASP best practices
5. WHEN the Next.js configuration is validated THEN the headers configuration SHALL be syntactically correct and functional
