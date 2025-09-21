# Code Style and Conventions

## TypeScript Configuration
- **Strict Mode**: Enabled with enhanced strict type checking
- **Additional Checks**: noUncheckedIndexedAccess, noImplicitReturns, exactOptionalPropertyTypes
- **Import Aliases**: @/* for src/*, @/components/*, @/lib/*, @/types/*, @/app/*
- **No Unused**: noUnusedLocals and noUnusedParameters enabled

## Biome Configuration (Linting & Formatting)
- **Formatter**: 2-space indentation, 100 character line width, LF line endings
- **Quote Style**: Double quotes, semicolons always, trailing commas (ES5)
- **Strict Rules**: noExplicitAny as error, useImportType/useExportType as error
- **Accessibility**: Comprehensive a11y rules enabled (useAltText, useAriaPropsForRole, etc.)
- **Performance**: noDelete, noAccumulatingSpread warnings

## File Naming Conventions
- **Components**: PascalCase (ProductCard.tsx, SignInForm.tsx)
- **Pages**: lowercase (page.tsx, layout.tsx)
- **Utilities**: camelCase (priceCalculator.ts, deliveryCalculator.ts)
- **Types**: camelCase with .ts extension
- **Tests**: *.test.tsx or __tests__/ directory

## Component Architecture
- **Atomic Design**: Atoms (ui/), Molecules (feature-specific), Organisms (complex sections)
- **File Structure**: Components organized by feature/domain
- **Barrel Exports**: index.ts files for clean imports
- **Naming Patterns**:
  - Product: Product* (ProductCard, ProductDetail, ProductCustomizer)
  - Cart: Cart* or Shopping* (CartIcon, ShoppingCart, MiniCart)
  - Admin: Admin* (AdminDashboard, AdminOrderManagement)
  - Auth: Auth* or Sign* (AuthProvider, SignInForm, SignUpForm)

## API Route Structure
- **Public Routes**: /api/products, /api/cart, /api/orders, /api/contact
- **Admin Routes**: /api/admin/* (protected)
- **Localized Pages**: /[locale]/* pattern
- **RESTful**: Follow standard HTTP methods and status codes

## Import/Export Patterns
- **Type Imports**: Use `import type` for type-only imports
- **Barrel Exports**: Organized index.ts files for clean imports
- **Path Aliases**: Consistent use of @/* aliases
- **Tree Shaking**: Optimized exports for bundle size