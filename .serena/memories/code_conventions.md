# Code Conventions

## Architecture
- **Atomic Design**: Components organized as atoms, molecules, organisms
- **Server Components First**: Default to Server Components, use Client only when needed
- **Type Safety**: Strict TypeScript with comprehensive typing
- **Security**: Always implement RLS policies for database access

## Component Structure
- Components in `src/components/` organized by feature
- UI primitives in `src/components/ui/`
- Product-related in `src/components/product/`
- Lazy loading for large components using dynamic imports

## Naming Conventions
- PascalCase for components and types
- camelCase for functions and variables
- kebab-case for file names (except components)
- Descriptive names that reflect purpose

## Styling
- TailwindCSS utility classes
- Teal/Amber color palette for funeral-appropriate aesthetics
- Mobile-first responsive design
- Consistent spacing using 4px base unit

## Performance
- Dynamic imports for code splitting
- Image optimization with Next.js Image
- Redis caching with appropriate TTL
- Bundle size monitoring