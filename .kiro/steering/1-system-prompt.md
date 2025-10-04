---
inclusion: always
---

Development Guidelines

## MCP Tool Workflow

- **ALWAY** before task execution, check if the project is initialized and onboarded, on every approach use `sequentialthinking_tools` - Ask what MCP tool to use for Tool confidence

### Initialization (Required)

1. `activate_project` - Initialize Serena context
2. `check_onboarding_performed` - Verify setup
3. `read_memory` - Load relevant project insights
4. `list_dir` - List all files and directories to get knowledge of project structure

### Code Analysis

- `list_memories` - Explore project insights
- `search_for_pattern` - Flexible search for arbitrary patterns in the codebase, possible also to search in non-code files
- `find_file` - Find files matching the given file mask within the given relative path
- `find_symbol` - Locate functions, classes, components
- `find_referencing_symbols` - Check dependencies before changes
- `get_symbols_overview` - Understand file structure
- `resolve-library-id` -> `get-library-docs` - Get library docs and best practices from Context7
- `think_about_collected_information` - Analyze collected informations before starting to modify code
- `think_about_task_adherence` - Analyze task approach and behavior
- `think_about_whether_you_are_done` - Analyze steps produced to solve task

### Code Modifications (Serena Only)

- Use `replace_symbol_body`, `insert_after_symbol`, `insert_before_symbol`
- Never mix with direct file operations (fsWrite, strReplace)
- Always analyze before modifying

### Documentation & Memory

- `write_memory` after completing significant work
- Use Context7 for library docs: `resolve-library-id` → `get-library-docs`

## Architecture Patterns

### Next.js 15 App Router

- Server Components by default, Client Components only when needed
- Route structure: `src/app/[locale]/[feature]/page.tsx`
- API routes: `src/app/api/[endpoint]/route.ts`
- Use `generateMetadata` for SEO

### Component Organization

- Atomic design: `src/components/[category]/[Component].tsx`
- Export from index files for clean imports
- Lazy load heavy components (galleries, configurators)
- Use error boundaries for product features

### TypeScript Standards

- Strict mode enabled
- Define types in `src/types/[domain].ts`
- Use type guards from `src/lib/validation/type-guards.ts`
- No `any` types - use `unknown` and narrow

### Styling Conventions

- TailwindCSS utility-first approach
- Stone/Amber palette for funeral aesthetics
- Mobile-first responsive design
- Design tokens in `src/lib/design-tokens.ts`

## Data & State Management

### Supabase Patterns

- Use server-side client from `src/lib/supabase/server.ts`
- Client-side from `src/lib/supabase/client.ts`
- Types from `src/lib/supabase/database.types.ts`
- Always implement RLS policies

### Caching Strategy

- Redis (Upstash) for API responses and sessions
- Cache utilities in `src/lib/cache/`
- Product cache: 5min, Cart: 1min, Delivery: 15min

### State Management

- Server state via React Server Components
- Client state via Context API (cart, auth, i18n)
- Form state with controlled components

## Code Quality Rules

### Error Handling

- Use error boundaries for UI components
- API routes return structured errors with status codes
- Log errors via `src/lib/monitoring/error-logger.ts`
- Validate inputs with Zod schemas

### Performance

- Optimize images with Next.js Image component
- Lazy load non-critical components
- Monitor Core Web Vitals
- Use `loading.tsx` and `error.tsx` conventions

### Internationalization

- Use `next-intl` for translations
- Messages in `messages/[locale].json`
- Format currency/dates with locale utilities
- Route-based localization: `/cs/` and `/en/`

### Security

- CSRF protection on mutations
- Rate limiting on API routes
- Input validation on all endpoints
- Sanitize user content

## Testing Guidelines

- Do not auto-generate tests unless explicitly requested
- Use `data-testid` for stable selectors
- Focus on critical user flows (checkout, cart, auth)

## Common Pitfalls to Avoid

- Don't use Client Components unnecessarily
- Don't bypass Serena for code modifications
- Don't skip type definitions
- Don't ignore RLS policies
- Don't forget mobile responsiveness
- Don't mix caching strategies
