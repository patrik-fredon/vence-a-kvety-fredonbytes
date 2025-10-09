# Project Overview

## Purpose
Premium e-commerce platform for funeral wreaths and floral arrangements (Pohřební věnce | Ketingmar s.r.o), built with modern web technologies and focused on providing a dignified experience during difficult times.

## Tech Stack
- **Framework**: Next.js 15 with App Router and Server Components
- **Language**: TypeScript 5 with strict type checking
- **Styling**: TailwindCSS 4 with custom funeral-appropriate design system
- **Database**: Supabase (PostgreSQL) with Row Level Security (RLS)
- **Authentication**: NextAuth.js v5 with Supabase adapter
- **Caching**: Redis (Upstash) for cart and session management
- **Payments**: Stripe (international) + GoPay (Czech market)
- **Internationalization**: next-intl for Czech/English support
- **Code Quality**: Biome for linting and formatting

## Key Features
- Multilingual support (Czech/English)
- Advanced product customization (size, color, ribbons, messages)
- Shopping cart with Redis caching
- Multi-step checkout with Stripe integration
- Admin dashboard for order/product management
- WCAG 2.1 AA accessibility compliance
- Performance optimized with bundle splitting and caching