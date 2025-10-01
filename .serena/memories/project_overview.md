# Project Overview

## Purpose
A premium e-commerce platform for funeral wreaths and floral arrangements built with modern web technologies. The platform focuses on providing a dignified experience during difficult times with comprehensive product customization, multilingual support (Czech/English), and accessibility-first design.

## Tech Stack
- **Framework**: Next.js 15 with App Router and Server Components
- **Language**: TypeScript 5 with strict type checking
- **Styling**: TailwindCSS 4 with custom funeral-appropriate design system
- **Database**: Supabase (PostgreSQL) with Row Level Security (RLS)
- **Authentication**: NextAuth.js v5 with Supabase adapter
- **Caching**: Redis with Upstash for cart and API caching
- **Payments**: Stripe (international) + GoPay (Czech market)
- **Internationalization**: next-intl for Czech/English support
- **Testing**: Jest, React Testing Library
- **Code Quality**: Biome for linting and formatting

## Key Features
- Multilingual support (Czech/English)
- Product catalog with advanced customization
- Shopping cart with persistent storage
- Secure checkout with multiple payment methods
- Admin dashboard for management
- WCAG 2.1 AA accessibility compliance
- Performance optimized (Lighthouse 95+)
- GDPR compliant

## Project Structure
- `src/app/` - Next.js 15 App Router with internationalized routes
- `src/components/` - Atomic Design Components (ui, product, cart, etc.)
- `src/lib/` - Utilities, configurations, and services
- `src/types/` - TypeScript type definitions
- `messages/` - Internationalization files (cs.json, en.json)