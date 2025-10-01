# Technology Stack

## Framework & Runtime

- **Next.js 15** with App Router and Server Components
- **React 19** with modern hooks and concurrent features
- **TypeScript 5** with strict type checking
- **Node.js 18+** (recommended 20+)

## Styling & Design

- **TailwindCSS 4** with custom design system
- **Stone/Amber color palette** for funeral-appropriate aesthetics
- **Atomic Design** component architecture
- **Design tokens** system in `src/lib/design-tokens.ts`
- **Responsive-first** mobile design approach

## Database & Backend

- **Supabase** (PostgreSQL) with Row Level Security (RLS)
- **NextAuth.js v5** with Supabase adapter for authentication
- **Redis** (Upstash) for caching and session management
- **Supabase Storage** for file uploads

## Payment & External Services

- **Stripe** for international payments
- **GoPay** for Czech banking integration
- **Resend** for transactional emails
- **Upstash Rate Limit** for API protection

## Internationalization

- **next-intl** for Czech/English localization
- Route-based localization (`/cs/`, `/en/`)
- Currency formatting and date localization

## Code Quality & Testing

- **Biome** for linting and formatting (replaces ESLint/Prettier)

## Common Commands

### Development

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run clean        # Clean build artifacts
```

### Code Quality

```bash
npm run lint         # Run Biome linting
npm run lint:fix     # Fix auto-fixable issues
npm run format       # Format code with Biome
npm run type-check   # TypeScript type checking
```

### Database

```bash
npm run db:migrate   # Run database migrations
npm run db:seed:funeral  # Seed funeral-specific data
```

## Environment Variables Required

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXTAUTH_SECRET`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- Payment keys (Stripe, GoPay)
- `RESEND_API_KEY`
