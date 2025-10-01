# Code Style and Conventions

## TypeScript
- Strict mode enabled with comprehensive typing
- Use explicit return types for functions
- Prefer interfaces over types for object shapes
- Use proper generic constraints

## React/Next.js
- Use "use client" directive for client components
- Prefer Server Components when possible
- Use proper Next.js Image component with optimization
- Implement proper error boundaries

## Component Architecture
- Follow Atomic Design principles (atoms, molecules, organisms)
- Use composition over inheritance
- Implement proper prop interfaces with TypeScript
- Use React.memo for performance optimization when needed

## Styling
- Use TailwindCSS with custom design system
- Stone/Amber color palette for funeral-appropriate aesthetics
- Responsive-first mobile design approach
- Use cn() utility for conditional classes (clsx + tailwind-merge)

## File Naming
- PascalCase for components (ProductCard.tsx)
- camelCase for utilities and hooks (useCart.ts)
- kebab-case for pages and API routes
- Descriptive names that indicate purpose

## Import Organization
1. React and Next.js imports
2. Third-party libraries
3. Internal components (@ imports)
4. Relative imports
5. Type imports at the end

## Accessibility
- Use semantic HTML elements
- Implement proper ARIA labels and roles
- Ensure keyboard navigation support
- Meet WCAG 2.1 AA contrast requirements
- Include alt text for images

## Performance
- Use React.memo and useMemo appropriately
- Implement proper image optimization
- Use dynamic imports for code splitting
- Optimize bundle size with tree shaking