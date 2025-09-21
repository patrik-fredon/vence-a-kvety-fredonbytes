# Design Document

## Overview

This design document outlines the comprehensive UI migration strategy to transform the current pohrebni-vence e-commerce application to match the visual design and layout patterns from the `pohrebni-vence-layout` repository. The migration focuses on adopting a modern, respectful design system while preserving all existing business functionality, API integrations, and internationalization features.

The target design emphasizes a clean, professional aesthetic appropriate for the sensitive nature of funeral services, using a stone/neutral color palette with amber accents and elegant typography.

## Architecture

### Design System Foundation

The migration will adopt the design system from pohrebni-vence-layout, which is built on:

- **Component Library**: Radix UI primitives for accessibility and functionality
- **Styling Framework**: Tailwind CSS with custom design tokens
- **Color Palette**: Stone-based neutral colors (stone-50 to stone-900) with amber accents
- **Typography**: Light, elegant fonts with careful hierarchy
- **Layout System**: Container-based responsive grid with mobile-first approach

### Component Architecture Strategy

The migration will follow a **component mapping approach** where existing components are visually updated while preserving their functional interfaces:

```
Current Component → Target Design Component
├── Header/Navigation → Stone-based header with dual navigation levels
├── Hero Section → Full-height hero with background image and overlay
├── Product Grid → Card-based grid with hover effects and CTAs
├── Product Detail → Enhanced layout with image gallery integration
├── Contact Form → Clean form design with proper validation styling
├── Footer → Comprehensive footer with organized link sections
└── UI Components → Radix-based design system components
```

### Integration Strategy

The design migration will use a **progressive enhancement approach**:

1. **Design Token Integration**: Establish shared design tokens and CSS variables
2. **Component-by-Component Migration**: Update components individually while maintaining API compatibility
3. **Layout System Adoption**: Implement the container and grid system from target design
4. **Accessibility Preservation**: Maintain existing accessibility features while enhancing with Radix patterns

## Components and Interfaces

### Header Component Design

**Target Layout Structure:**

- **Top Bar**: Quick navigation (Produkty, Kontakt, Jak objednat) with user actions (Search, User, Cart)
- **Main Header**: Brand logo with primary navigation (Domů, Produkty, O nás, Kontakt)
- **Mobile Responsive**: Collapsible menu for mobile devices

**Key Design Elements:**

- Stone-200 border bottom
- Clean typography with hover transitions
- Cart icon with item count badge
- Responsive navigation with hamburger menu

**Integration Requirements:**

- Preserve existing cart state management
- Maintain i18n translation keys for all navigation items
- Keep authentication status integration
- Preserve search functionality hooks

### Hero Section Design

**Visual Specifications:**

- **Height**: 70vh for impactful presence
- **Background**: Full-cover image with stone-900/40 overlay
- **Typography**: Large, light font with amber-200 accent text
- **CTA Button**: Amber-600 background with hover states

**Content Structure:**

- Primary headline with emotional messaging
- Descriptive paragraph about craftsmanship
- Single prominent call-to-action button

**Responsive Behavior:**

- Text scaling from 4xl to 5xl on larger screens
- Proper text balance and readability across devices
- Maintained aspect ratios for background images

### Product Grid Component Design

**Layout System:**

- **Grid Structure**: 1 column mobile, 2 columns tablet, 3 columns desktop
- **Card Design**: Borderless cards with subtle shadows and hover effects
- **Image Treatment**: 64-height images with scale-on-hover animations
- **Featured Product**: Large 2-column span card with split layout

**Interactive Elements:**

- Heart icon for favorites (appears on hover)
- Add to cart buttons with shopping cart icons
- Price display with Czech locale formatting
- Category tags for product classification

**Integration Considerations:**

- Preserve existing product data fetching from Supabase
- Maintain cart integration and state management
- Keep product filtering and search functionality
- Preserve i18n price formatting and text translations

### Product Detail Page Design

**Layout Enhancement:**

- Enhanced image gallery with zoom and navigation
- Improved product information hierarchy
- Better customization options presentation
- Cleaner add-to-cart and quantity controls

**Visual Improvements:**

- Consistent card-based layout
- Better typography hierarchy
- Enhanced button styling and interactions
- Improved mobile responsiveness

### Contact Form Design

**Form Styling:**

- Clean, minimal form design with proper spacing
- Enhanced input styling with focus states
- Better error message presentation
- Improved success feedback design

**Validation Integration:**

- Preserve existing validation logic
- Enhanced visual feedback for form states
- Better accessibility with proper ARIA labels
- Maintained i18n error message support

### UI Component System

**Button Component:**

- Multiple variants: default, destructive, outline, secondary, ghost, link
- Size variations: default, sm, lg, icon
- Focus-visible ring styling for accessibility
- Consistent hover and active states

**Card Component:**

- Subtle shadows with hover enhancements
- Proper border radius and padding
- Flexible content areas
- Responsive behavior

**Input Components:**

- Consistent styling across form elements
- Proper focus and error states
- Accessibility-compliant labeling
- Integration with existing validation

## Data Models

### Design Token System

```typescript
interface DesignTokens {
  colors: {
    stone: Record<50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900, string>
    amber: Record<200 | 600 | 700, string>
    white: string
  }
  typography: {
    fontSizes: Record<'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl', string>
    fontWeights: Record<'light' | 'medium' | 'semibold', string>
  }
  spacing: {
    container: string
    sections: Record<'sm' | 'md' | 'lg', string>
  }
}
```

### Component Props Interface

```typescript
interface MigratedComponentProps {
  // Preserve all existing functional props
  existingProps: any
  // Add design system integration
  variant?: 'default' | 'secondary' | 'ghost'
  size?: 'sm' | 'default' | 'lg'
  className?: string
}
```

### Responsive Breakpoint System

```typescript
interface ResponsiveSystem {
  breakpoints: {
    sm: '640px'
    md: '768px'
    lg: '1024px'
    xl: '1280px'
  }
  containers: {
    sm: '640px'
    md: '768px'
    lg: '1024px'
    xl: '1280px'
  }
}
```

## Error Handling

### Migration Error Prevention

**Component Compatibility Checks:**

- Validate that all existing props are preserved during migration
- Ensure API integration points remain unchanged
- Verify i18n translation keys are maintained
- Test cart and authentication state preservation

**Fallback Strategies:**

- Graceful degradation for unsupported design features
- Fallback to existing components if migration fails
- Error boundaries for new component implementations
- Rollback procedures for problematic migrations

**Validation Procedures:**

- Automated testing for component API compatibility
- Visual regression testing for design accuracy
- Functional testing for preserved business logic
- Accessibility testing for maintained compliance

### Runtime Error Handling

**Design System Errors:**

- Fallback to default styling if design tokens fail to load
- Error logging for missing design system components
- Graceful handling of missing images or assets
- Proper error states for form components

**Integration Error Management:**

- Preserve existing error handling for API calls
- Maintain error message translations
- Enhanced visual error feedback with new design system
- Consistent error styling across all components

## Testing Strategy

### Visual Regression Testing

**Component-Level Testing:**

- Screenshot comparison for each migrated component
- Cross-browser compatibility testing
- Responsive design validation across breakpoints
- Dark mode compatibility (if applicable)

**Page-Level Testing:**

- Full page screenshot comparisons
- User journey visual validation
- Performance impact assessment
- Accessibility compliance verification

### Functional Testing Preservation

**API Integration Testing:**

- Verify all Supabase calls remain functional
- Test cart operations and state management
- Validate authentication flows
- Confirm order processing functionality

**Internationalization Testing:**

- Test Czech and English language switching
- Verify translation key preservation
- Validate currency and date formatting
- Test RTL compatibility (if needed)

### Performance Testing

**Bundle Size Analysis:**

- Monitor JavaScript bundle size changes
- Assess CSS bundle impact
- Evaluate image optimization effects
- Test loading performance metrics

**Runtime Performance:**

- Core Web Vitals monitoring
- Component render performance
- Memory usage assessment
- Mobile performance validation

### Accessibility Testing

**Automated Testing:**

- jest-axe integration for component testing
- Lighthouse accessibility audits
- Screen reader compatibility testing
- Keyboard navigation validation

**Manual Testing:**

- Focus management verification
- Color contrast validation
- Screen reader testing
- Voice control compatibility

## Implementation Phases

### Phase 1: Design System Foundation

- Establish design tokens and CSS variables
- Create base UI component library
- Set up responsive grid system
- Implement typography system

### Phase 2: Layout Components

- Migrate Header component
- Update Footer component
- Implement Hero section
- Create layout templates

### Phase 3: Product Components

- Update ProductGrid component
- Migrate ProductCard components
- Enhance ProductDetail pages
- Update product filtering UI

### Phase 4: Form Components

- Migrate ContactForm component
- Update authentication forms
- Enhance checkout forms
- Implement form validation styling

### Phase 5: Integration and Testing

- Comprehensive testing across all components
- Performance optimization
- Accessibility validation
- Documentation updates

This design provides a comprehensive roadmap for migrating the UI while preserving all existing functionality and ensuring a smooth transition to the new design system.
