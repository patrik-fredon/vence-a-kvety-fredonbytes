# Implementation Plan

- [x] 1. Project Setup and Core Infrastructure
  - Initialize Next.js 15 project with TypeScript and configure essential dependencies
  - Set up TailwindCSS 4 with custom design system for funeral wreaths theme
  - Configure ESLint, Prettier, and development tooling
  - _Requirements: 8.1, 8.2, 8.3_

- [x] 2. Database Schema and Supabase Configuration
  - Create Supabase project and configure database connection
  - Implement database schema with tables for products, categories, orders, cart_items, and users
  - Set up Row Level Security (RLS) policies for data protection
  - Create database functions and triggers for automated operations
  - _Requirements: 10.1, 10.3, 6.2_

- [x] 3. Authentication System Implementation
  - Configure NextAuth.js v5 with Supabase adapter
  - Implement user registration, login, and password reset functionality
  - Create protected route middleware and session management
  - Build user profile and account management components
  - _Requirements: 6.1, 6.2, 6.3, 6.5_

- [x] 4. Internationalization (i18n) Setup
  - Configure next-intl for Czech and English language support
  - Create translation files and implement language switching functionality
  - Set up locale-based routing and URL structure
  - Implement currency formatting and locale-specific content rendering
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 5. Core Layout and Navigation Components
  - Build responsive header with language toggle and user authentication status
  - Create main navigation with category-based menu structure
  - Implement footer with contact information and legal links
  - Design and code loading states and error boundaries
  - _Requirements: 9.1, 9.2, 9.4_

- [x] 6. Product Data Models and API Routes
  - Create TypeScript interfaces for Product, Category, and related entities
  - Implement API routes for product CRUD operations (/api/products)
  - Build category management API endpoints (/api/categories)
  - Add product search and filtering functionality with query parameters
  - _Requirements: 2.1, 2.2, 2.3, 2.6_

- [x] 7. Product Catalog and Grid Components
  - Build ProductGrid component with responsive layout and pagination
  - Create ProductCard component with image optimization and hover effects
  - Implement category filtering and search functionality
  - Add product sorting options (price, name, popularity)
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 8. Product Detail and Customization System
  - Build ProductDetail page with image gallery and product information
  - Create ProductCustomizer component for size, flowers, ribbons, and message options
  - Implement real-time price calculation based on customizations
  - Add customization validation and availability checking
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [ ] 9. Shopping Cart Implementation
  - Create cart state management with persistent storage (Redis/localStorage)
  - Build ShoppingCart component with item management functionality
  - Implement cart API routes for add, update, and remove operations
  - Add cart persistence across user sessions and devices
  - _Requirements: 4.1, 4.2_

- [ ] 10. Delivery Calendar and Scheduling
  - Build DeliveryCalendar component with date selection functionality
  - Implement delivery date calculation logic (next-day onwards, excluding weekends/holidays)
  - Create Redis caching for delivery availability and pricing
  - Add delivery cost calculation based on location and urgency
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [ ] 11. Checkout Process and Forms
  - Create multi-step checkout form with customer and delivery information
  - Implement form validation and error handling
  - Build order summary component with itemized pricing
  - Add delivery option selection and cost calculation
  - _Requirements: 4.2, 4.3_

- [ ] 12. Payment Integration (Stripe + GoPay)
  - Configure Stripe payment processing with secure tokenization
  - Implement GoPay integration for Czech market payment methods
  - Create payment selection component and secure payment forms
  - Add payment success/failure handling and order confirmation
  - _Requirements: 4.4, 4.5, 4.6, 4.7, 10.2_

- [ ] 13. Order Management System
  - Create Order data models and database operations
  - Implement order creation, status tracking, and history functionality
  - Build order confirmation and email notification system
  - Add order tracking for customers and status updates
  - _Requirements: 6.4, 4.6_

- [ ] 14. User Account and Order History
  - Build user profile management interface
  - Create order history display with detailed order information
  - Implement address book functionality for delivery addresses
  - Add user preferences and account settings management
  - _Requirements: 6.3, 6.4, 6.6_

- [ ] 15. Administrative Dashboard
  - Create admin authentication and role-based access control
  - Build product management interface (CRUD operations)
  - Implement order management dashboard with status updates
  - Add inventory tracking and low stock alerts
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [ ] 16. Performance Optimization Implementation
  - Configure Next.js ISR/SSG for product and category pages
  - Implement Redis caching for frequently accessed data
  - Set up image optimization with Next.js Image component
  - Add lazy loading and code splitting for heavy components
  - _Requirements: 8.1, 8.2, 8.4, 8.5_

- [ ] 17. SEO and Metadata Implementation
  - Create dynamic meta tags and Open Graph data for product pages
  - Implement structured data (JSON-LD) for search engine optimization
  - Build XML sitemap generation for products and categories
  - Add robots.txt and SEO-friendly URL structure
  - _Requirements: 8.2, 8.3_

- [ ] 18. Security and Data Protection Features
  - Implement rate limiting middleware for API protection
  - Add CSRF protection and input validation across all forms
  - Create GDPR compliance features (data export, deletion)
  - Set up security headers and content security policy
  - _Requirements: 10.1, 10.2, 10.4, 10.5, 10.6_

- [ ] 19. Accessibility Implementation
  - Add proper ARIA labels and semantic HTML structure
  - Implement keyboard navigation support across all components
  - Create high contrast mode support and screen reader compatibility
  - Add focus management and skip navigation links
  - _Requirements: 9.2, 9.3, 9.5, 9.6_

- [ ] 20. Testing Suite Implementation
  - Set up Jest and React Testing Library for unit tests
  - Create component tests for all major UI components
  - Implement API route testing with Supertest
  - Add Playwright E2E tests for critical user flows (browse, customize, checkout)
  - _Requirements: All requirements validation through automated testing_

- [ ] 21. Error Handling and Monitoring
  - Implement comprehensive error boundaries and fallback UI
  - Create centralized error logging and monitoring system
  - Add user-friendly error messages with recovery suggestions
  - Set up performance monitoring and Core Web Vitals tracking
  - _Requirements: 8.6, 10.5_

- [ ] 22. Final Integration and Deployment Setup
  - Configure production environment variables and secrets
  - Set up Vercel deployment with proper environment configuration
  - Implement database migrations and seed data for production
  - Create deployment pipeline with automated testing and quality checks
  - _Requirements: 8.1, 8.2, 10.2_
