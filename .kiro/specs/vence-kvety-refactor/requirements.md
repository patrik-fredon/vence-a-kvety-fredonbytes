# Requirements Document

## Introduction

This feature focuses on refactoring the Vence a kvety funeral wreath e-commerce website to address critical translation issues, improve visual design consistency, and enhance the user experience. The refactor targets the Next.js 15 application using TailwindCSS 4, with emphasis on fixing missing translation keys, standardizing typography colors, improving layout responsiveness, and ensuring consistent product card designs across the site.

## Requirements

### Requirement 1: Translation System Integrity

**User Story:** As a Czech-speaking customer, I want all website content to display properly in my language, so that I can understand all information without encountering missing text or error messages.

#### Acceptance Criteria

1. WHEN the website loads in Czech locale THEN all translation keys SHALL resolve to proper Czech text without console errors
2. WHEN accessing the hero section THEN the keys `home.refactoredHero.subheading`, `home.refactoredHero.cta`, and `home.refactoredHero.ctaAriaLabel` SHALL display translated content
3. WHEN the accessibility toolbar is rendered THEN the key `tAccessibility("accessibility")` SHALL resolve correctly
4. IF a translation key is missing THEN the system SHALL provide a meaningful fallback instead of displaying the raw key
5. WHEN switching between Czech and English locales THEN all content SHALL display correctly in both languages

### Requirement 2: Product Display Functionality

**User Story:** As a customer browsing the website, I want to see all available funeral wreaths with their images and details, so that I can make an informed purchasing decision.

#### Acceptance Criteria

1. WHEN navigating to the products page THEN all product cards SHALL display with images, titles, and pricing information
2. WHEN product data is fetched from the API THEN the data SHALL be properly passed to product card components
3. IF product loading fails THEN an appropriate error message SHALL be displayed to the user
4. WHEN viewing the product grid THEN products SHALL render in a consistent 4-column layout on desktop
5. WHEN clicking on a product card THEN the user SHALL be navigated to the correct product detail page

### Requirement 3: Hero Section Visual Enhancement

**User Story:** As a first-time visitor, I want to see an impactful hero image when I land on the homepage, so that I immediately understand the nature and quality of the business.

#### Acceptance Criteria

1. WHEN the homepage loads THEN the hero image SHALL occupy a larger portion of the viewport compared to the current implementation
2. WHEN viewing on desktop THEN the hero section SHALL maintain proper aspect ratio and image quality
3. WHEN viewing on mobile devices THEN the hero image SHALL scale appropriately without performance degradation
4. WHEN the hero section renders THEN all text overlays SHALL remain readable against the larger image
5. WHEN measuring page performance THEN the larger hero image SHALL NOT negatively impact Core Web Vitals scores

### Requirement 4: Typography Color Standardization

**User Story:** As a customer navigating the website, I want consistent and readable typography throughout the site, so that I can easily read and understand all content.

#### Acceptance Criteria

1. WHEN rendering h1 elements THEN they SHALL use the teal-800 color
2. WHEN rendering h2 elements THEN they SHALL use the teal-800 color
3. WHEN rendering h3 and other heading elements THEN they SHALL use the amber-100 color
4. WHEN rendering paragraph text THEN it SHALL use the amber-100 color
5. WHEN viewing any page THEN the typography color scheme SHALL be consistent across all components

### Requirement 5: Product Detail Layout Optimization

**User Story:** As a customer viewing product details on a large monitor, I want to see all product photos without scrolling within the image gallery, so that I can quickly review all available images.

#### Acceptance Criteria

1. WHEN viewing ProductDetail on large monitors THEN the left column SHALL expand to accommodate all product photos
2. WHEN the image gallery renders THEN there SHALL be no artificial height restrictions limiting photo display
3. WHEN viewing on different screen sizes THEN the layout SHALL remain responsive and functional
4. WHEN scrolling the product detail page THEN the image gallery SHALL behave naturally without layout issues
5. WHEN multiple product images are present THEN all SHALL be accessible without excessive scrolling

### Requirement 6: Card Design Consistency

**User Story:** As a customer browsing products, I want a consistent visual experience across all product displays, so that the website feels cohesive and professional.

#### Acceptance Criteria

1. WHEN viewing product cards on any page THEN they SHALL use darker background colors for better contrast
2. WHEN viewing the products page THEN product cards SHALL use the same cut-corner design as the home page reference products
3. WHEN hovering over product cards THEN the interaction states SHALL be consistent across all pages
4. WHEN viewing card shadows and borders THEN they SHALL follow the same design system
5. WHEN comparing home page and products page cards THEN the design language SHALL be unified with only contextual differences

### Requirement 7: About Page Redesign

**User Story:** As a potential customer learning about the business, I want an attractive and informative About page, so that I can understand the company's story and values.

#### Acceptance Criteria

1. WHEN the About page loads THEN the top image SHALL be smaller than the current implementation
2. WHEN viewing the bottom section THEN decorative elements SHALL use gold-outlined designs instead of dots
3. WHEN the About page renders THEN the logo.svg from the navbar SHALL be incorporated into the design
4. WHEN viewing on mobile devices THEN the About page layout SHALL remain responsive and readable
5. WHEN navigating to the About page THEN all design elements SHALL align with the funeral-appropriate aesthetic

### Requirement 8: Responsive Design Integrity

**User Story:** As a customer using various devices, I want the website to work perfectly on my phone, tablet, or desktop, so that I can shop conveniently from any device.

#### Acceptance Criteria

1. WHEN viewing on mobile devices THEN all layout changes SHALL maintain mobile-first responsive design
2. WHEN resizing the browser window THEN all components SHALL adapt smoothly to different viewport sizes
3. WHEN viewing on tablets THEN the layout SHALL optimize for medium-sized screens
4. WHEN testing across devices THEN touch interactions SHALL work properly on mobile and tablet
5. WHEN measuring performance THEN mobile performance scores SHALL meet or exceed current benchmarks

### Requirement 9: Accessibility Compliance

**User Story:** As a customer with accessibility needs, I want the website to be fully accessible, so that I can navigate and purchase products independently.

#### Acceptance Criteria

1. WHEN using keyboard navigation THEN all interactive elements SHALL be accessible via keyboard
2. WHEN using screen readers THEN all ARIA labels SHALL provide meaningful descriptions
3. WHEN viewing with high contrast mode THEN text SHALL remain readable
4. WHEN color changes are implemented THEN color contrast ratios SHALL meet WCAG AA standards
5. WHEN navigating the site THEN semantic HTML SHALL be used throughout

### Requirement 10: Performance Optimization

**User Story:** As a customer with varying internet speeds, I want the website to load quickly, so that I can browse products without frustration.

#### Acceptance Criteria

1. WHEN implementing the larger hero image THEN lazy loading SHALL be utilized appropriately
2. WHEN loading product cards THEN images SHALL be optimized using Next.js Image component
3. WHEN measuring Core Web Vitals THEN LCP SHALL remain under 2.5 seconds
4. WHEN implementing design changes THEN bundle size SHALL NOT increase significantly
5. WHEN caching is utilized THEN product data SHALL be cached according to existing cache strategy (5min for products)
