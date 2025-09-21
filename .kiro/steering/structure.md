# Project Structure

## Root Directory

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

## Source Code Organization (`src/`)

### App Router (`src/app/`)

```
app/
├── [locale]/              # Internationalized routes
│   ├── page.tsx          # Homepage with product teasers
│   ├── products/         # Product catalog and details
│   ├── cart/             # Shopping cart
│   ├── checkout/         # Multi-step checkout flow
│   ├── auth/             # Authentication pages
│   ├── admin/            # Admin dashboard
│   ├── contact/          # Contact form
│   └── layout.tsx        # Locale-specific layout
├── api/                  # API routes
│   ├── products/         # Product management
│   ├── cart/             # Cart operations
│   ├── orders/           # Order processing
│   ├── payments/         # Stripe/GoPay integration
│   ├── admin/            # Admin endpoints
│   ├── auth/             # Authentication API
│   └── monitoring/       # Performance tracking
└── globals.css           # Global styles
```

### Components (`src/components/`)

Organized by **Atomic Design** principles:

```
components/
├── ui/                   # Atoms (Button, Input, LoadingSpinner)
├── product/              # Product-related molecules/organisms
├── cart/                 # Shopping cart components
├── checkout/             # Checkout flow components
├── auth/                 # Authentication forms
├── admin/                # Admin interface components
├── layout/               # Page templates and layouts
├── accessibility/        # WCAG compliance features
├── monitoring/           # Performance tracking
├── seo/                  # SEO optimization components
├── i18n/                 # Internationalization helpers
└── index.ts              # Barrel exports
```

### Library Code (`src/lib/`)

```
lib/
├── supabase/             # Database client, schema, migrations
├── auth/                 # NextAuth configuration and utilities
├── payments/             # Stripe and GoPay integrations
├── cache/                # Redis caching utilities
├── monitoring/           # Error tracking and performance
├── security/             # CSRF, validation, GDPR
├── i18n/                 # Internationalization utilities
├── utils/                # General utility functions
├── design-tokens.ts      # Design system tokens
└── config.ts             # Application configuration
```

### Types (`src/types/`)

```
types/
├── product.ts            # Product and category types
├── cart.ts               # Shopping cart types
├── order.ts              # Order management types
├── user.ts               # User and authentication types
├── components.ts         # Component prop interfaces
└── index.ts              # Type exports
```

## Key Conventions

### File Naming

- **Components**: PascalCase (`ProductCard.tsx`)
- **Pages**: lowercase (`page.tsx`, `layout.tsx`)
- **Utilities**: camelCase (`priceCalculator.ts`)
- **Types**: camelCase with `.ts` extension
- **Tests**: `*.test.tsx` or `__tests__/` directory

### Import Aliases

```typescript
@/*           # src/*
@/components  # src/components
@/lib         # src/lib
@/types       # src/types
@/app         # src/app
```

### Component Organization

- **Atoms**: Basic UI elements in `src/components/ui/`
- **Molecules**: Feature-specific combinations
- **Organisms**: Complex sections with business logic
- **Templates**: Page layouts in `src/components/layout/`
- **Pages**: Route components in `src/app/[locale]/`

### API Structure

- RESTful endpoints following `/api/resource` pattern
- Admin endpoints under `/api/admin/`
- Authentication routes in `/api/auth/`
- Monitoring endpoints in `/api/monitoring/`

### Database Organization

- Schema in `src/lib/supabase/schema.sql`
- Migrations in `supabase/migrations/`
- RLS policies for security
- Generated types in `database.types.ts`

### Internationalization

- Translation files in `messages/` (cs.json, en.json)
- i18n configuration in `src/i18n/`
- Locale-based routing with `[locale]` parameter
- Currency and date formatting per locale

### Testing Structure

- Unit tests alongside components (`*.test.tsx`)
- E2E tests in `e2e/` directory
- Test utilities and setup in root
- Accessibility tests with jest-axe

## Important Directories

### Critical for Development

- `src/app/[locale]/` - All user-facing pages
- `src/components/` - Reusable UI components
- `src/lib/supabase/` - Database integration
- `messages/` - Translation files

### Configuration Files

- `next.config.ts` - Next.js configuration
- `tailwind.config.ts` - Styling configuration
- `biome.json` - Code quality rules
- `tsconfig.json` - TypeScript settings

### Deployment Related

- `scripts/deploy.sh` - Deployment automation
- `vercel.json` - Vercel configuration
- `.env` files - Environment variables
