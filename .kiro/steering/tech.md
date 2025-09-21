# Technology Stack

## Framework & Runtime

- **Next.js 15** with App Router and Server Components
- **React 19** with TypeScript (strict mode)
- **Node.js 18+** (recommended: 20+)

## Core Technologies

- **TypeScript**: Strict type checking with comprehensive interfaces
- **TailwindCSS 4**: Custom funeral-appropriate design system
- **Supabase**: PostgreSQL database with Row Level Security (RLS)
- **NextAuth.js v5**: Authentication with Supabase adapter
- **Redis (Upstash)**: Caching for cart and API responses

## Key Libraries

- **next-intl**: Czech/English internationalization
- **@stripe/stripe-js**: International payments
- **@supabase/supabase-js**: Database client
- **@headlessui/react**: Accessible UI components
- **@heroicons/react**: Icon library
- **clsx + tailwind-merge**: Conditional styling

## Development Tools

- **Biome**: Linting and formatting (replaces ESLint/Prettier)
- **Jest + React Testing Library**: Unit testing
- **Playwright**: End-to-end testing
- **jest-axe**: Accessibility testing

## Common Commands

### Development

```bash
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server
npm run type-check      # TypeScript validation
```

### Code Quality

```bash
npm run lint            # Run Biome linting
npm run lint:fix        # Fix auto-fixable issues
npm run format          # Format code
```

### Database

```bash
npm run db:migrate      # Run migrations
npm run db:seed:funeral # Seed sample data
```

## Architecture Patterns

- **Atomic Design**: Components organized as atoms → molecules → organisms
- **Server Components**: Leverage Next.js 15 server-side rendering
- **API Routes**: RESTful endpoints in `/api` directory
- **Middleware**: i18n routing and authentication
- **Design Tokens**: Centralized styling system

## Environment Setup

Required environment variables in `.env.local`:

- Supabase: URL, anon key, service role key
- NextAuth: secret and URL
- Redis: Upstash URL and token
- Payments: Stripe and GoPay credentials
- Email: Resend API key

## Performance Optimizations

- Bundle splitting and tree-shaking
- Image optimization with Next.js Image
- Redis caching for cart and API responses
- Static generation where possible
- Core Web Vitals monitoring
