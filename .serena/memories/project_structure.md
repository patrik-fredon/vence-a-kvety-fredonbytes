# Project Structure

## Root Directory Structure
```
├── src/                    # Main source code
├── messages/              # i18n translation files (cs.json, en.json)
├── public/                # Static assets (product images)
├── e2e/                   # Playwright end-to-end tests
├── scripts/               # Utility scripts (deploy, migrate, seed)
├── docs/                  # Project documentation
├── supabase/              # Database migrations
└── archive/               # Archived/legacy files
```

## Source Code Organization (src/)

### App Router (src/app/)
- **[locale]/**: Internationalized routes (Czech/English)
  - page.tsx: Homepage with product teasers
  - products/: Product catalog and details
  - cart/: Shopping cart
  - checkout/: Multi-step checkout flow
  - auth/: Authentication pages
  - admin/: Admin dashboard
  - contact/: Contact form
- **api/**: API routes (RESTful endpoints)
  - products/, cart/, orders/, payments/
  - admin/: Protected admin endpoints
  - auth/: Authentication API

### Components (src/components/)
Organized by **Atomic Design** principles:
- **ui/**: Atoms (Button, Input, LoadingSpinner)
- **product/**: Product-related molecules/organisms
- **cart/**: Shopping cart components
- **checkout/**: Checkout flow components
- **auth/**: Authentication forms
- **admin/**: Admin interface components
- **layout/**: Page templates and layouts
- **accessibility/**: WCAG compliance features

### Library Code (src/lib/)
- **supabase/**: Database client, schema, migrations
- **auth/**: NextAuth configuration and utilities
- **payments/**: Stripe and GoPay integrations
- **cache/**: Redis caching utilities
- **i18n/**: Internationalization utilities
- **utils/**: General utility functions
- **design-tokens.ts**: Design system tokens

### Types (src/types/)
- **product.ts**: Product and category types
- **cart.ts**: Shopping cart types
- **order.ts**: Order management types
- **user.ts**: User and authentication types
- **components.ts**: Component prop interfaces

## Key Configuration Files
- **next.config.ts**: Next.js configuration
- **tailwind.config.ts**: Styling configuration with design tokens
- **biome.json**: Code quality rules
- **tsconfig.json**: TypeScript settings (strict mode)
- **jest.config.js**: Testing configuration