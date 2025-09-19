---
inclusion: always
---

# Development Guidelines for Pohrebni Vence E-commerce Platform

This Next.js 15 application is a Czech funeral wreath e-commerce platform with internationalization, built using modern web technologies and accessibility-first principles.

## Project Architecture

### Core Technologies

- **Next.js 15** with App Router and Server Components
- **TypeScript** with strict type checking
- **Tailwind CSS** for styling with design system approach
- **Supabase** for authentication, database, and real-time features
- **Redis** for caching and data fetching (cart caching of user cart)
- **next-intl** for internationalization (Czech default, English support)
- **Biome** for linting and formatting (not ESLint/Prettier)

### Key Patterns

- Provider pattern for global state (Auth, Cart, Accessibility, Monitoring)
- Locale-based routing with `[locale]` dynamic segments
- Server/Client component separation following Next.js best practices
- Type-safe database operations with generated Supabase types
- Modular component architecture with barrel exports (`index.ts`)

## Development Conventions

### File Structure

- Use kebab-case for file and folder names
- Components in `src/components/[feature]/ComponentName.tsx`
- API routes follow App Router conventions: `src/app/api/[endpoint]/route.ts`
- Localized pages: `src/app/[locale]/[page]/page.tsx`
- Tests co-located: `__tests__/` folders within feature directories

### TypeScript Standards

- Strict mode enabled - no `any` types
- Use interface for object shapes, type for unions/primitives
- Import types with `import type` when possible
- Generate and use Supabase database types from `database.types.ts`

### Internationalization

- Default locale: Czech (`cs`), secondary: English (`en`)
- All user-facing text must be internationalized using `next-intl`
- Message keys use dot notation: `"navigation.home"`
- Currency always CZK, format per locale conventions

### Component Guidelines

- Use Server Components by default, Client Components only when needed
- Implement proper loading states and error boundaries
- Follow accessibility guidelines (WCAG 2.1 AA)
- Include proper TypeScript props interfaces
- Use Tailwind classes, avoid custom CSS unless necessary

### Database & API

- Use Supabase client for database operations
- Implement proper RLS (Row Level Security) policies
- API routes should include proper error handling and validation
- Use server actions for form submissions when appropriate

## Quality Standards

### Testing Requirements

- Unit tests with Jest and React Testing Library
- E2E tests with Playwright for critical user journeys
- Accessibility testing with jest-axe
- Test coverage for business logic and critical components

### Code Quality

- Use Biome for consistent formatting and linting
- Run type checking with `npm run type-check`
- Follow semantic commit conventions
- Include proper JSDoc comments for complex functions

### Performance & SEO

- Optimize images with Next.js Image component
- Implement proper metadata for all pages
- Use dynamic imports for heavy components
- Monitor Core Web Vitals and performance metrics

## MCP Integration Workflow

When working on tasks, leverage available MCP servers strategically:

### Knowledge Management

- Use **Byterover** tools to retrieve and store project-specific knowledge
- Reference stored patterns and solutions with "According to Byterover memory"
- Update module information when making architectural changes

### Problem Solving

- Apply **SequentialThinking** for complex feature implementations
- Break down tasks into manageable steps with clear dependencies
- Document decision-making process for future reference

### Context Enhancement

- Utilize **Context7** for external library documentation and best practices
- Validate implementation approaches against established patterns
- Gather relevant technical context for informed decisions

### Code Analysis

- Leverage **Serena** for deep codebase analysis and pattern recognition
- Use semantic understanding for refactoring and optimization tasks
- Apply insights for maintaining code consistency and quality

## Accessibility Requirements

- Implement keyboard navigation for all interactive elements
- Provide proper ARIA labels and semantic HTML
- Ensure color contrast meets WCAG standards
- Test with screen readers and accessibility tools
- Include skip links and focus management

## Deployment & Monitoring

- Deploy to Vercel with proper environment configuration
- Monitor application performance and error rates
- Implement proper logging for debugging and analytics
- Use feature flags for gradual rollouts when appropriate
