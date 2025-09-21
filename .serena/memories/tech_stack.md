# Technology Stack

## Core Framework & Runtime
- **Next.js 15** with App Router and Server Components
- **React 19** with TypeScript (strict mode enabled)
- **Node.js 18+** (recommended: 20+)
- **TypeScript 5** with extremely strict configuration

## Frontend Technologies
- **Styling**: TailwindCSS 4 with custom funeral-appropriate design system
- **UI Components**: Atomic design architecture (@headlessui/react, @heroicons/react)
- **Internationalization**: next-intl for Czech/English support
- **State Management**: React Context with optimized providers
- **Image Optimization**: Next.js Image component with Vercel CDN

## Backend & Database
- **Database**: Supabase (PostgreSQL) with Row Level Security (RLS)
- **Authentication**: NextAuth.js v5 with Supabase adapter
- **Caching**: Redis with Upstash for cart and API responses
- **File Storage**: Supabase Storage for product images
- **Real-time**: Supabase real-time subscriptions

## Payment & External Services
- **Payment Processing**: Stripe (international) + GoPay (Czech market)
- **Email Service**: Resend for transactional emails
- **Rate Limiting**: @upstash/ratelimit for API protection
- **Monitoring**: Custom performance and error tracking

## Development & Quality Tools
- **Code Quality**: Biome (replaces ESLint/Prettier) with strict rules
- **Testing**: Jest + React Testing Library + Playwright E2E
- **Type Safety**: Generated Supabase types with strict TypeScript
- **Accessibility**: jest-axe for automated accessibility testing
- **Performance**: Bundle analysis, Core Web Vitals monitoring

## Deployment & Infrastructure
- **Hosting**: Vercel with edge functions
- **CDN**: Vercel Edge Network for global performance
- **Environment**: Production, preview, and development environments
- **Monitoring**: Custom health checks and performance metrics