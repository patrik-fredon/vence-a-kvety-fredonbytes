# Task 10.3 Completion: Update funeralColors to use CSS variables consistently

## Date
2025-10-04

## Task Description
Update funeralColors in design-tokens.ts to use CSS variables consistently, removing hardcoded hex values where CSS variables exist.

## Changes Made

### File: src/lib/design-tokens.ts

Updated the `funeralColors` object to replace all hardcoded hex values with CSS custom properties:

1. **backgroundLight**: `"linear-gradient(to right, #AE8625, #F7EF8A, #D2AC47)"` → `"var(--gradient-funeral-gold)"`
   - Now uses the centralized gradient definition from globals.css

2. **backgroundDark**: `"#7A7347"` → `"var(--color-amber-700)"`
   - Mapped to the closest amber shade in the color system

3. **textOnHero**: `"#FFFFFF"` → `"var(--color-stone-50)"`
   - Uses the lightest stone color for text on dark backgrounds

4. **textOnBackground**: `"#2D2D2D"` → `"var(--color-stone-800)"`
   - Uses a dark stone color for text on light backgrounds

5. **textSecondary**: `"#F5F5DC"` → `"var(--color-amber-50)"`
   - Uses the lightest amber shade for secondary text

## Verification

- ✅ No TypeScript errors in design-tokens.ts
- ✅ No TypeScript errors in RefactoredPageLayout.tsx (which uses funeralColors)
- ✅ CSS variables are compatible with inline style usage
- ✅ All changes align with the centralized color system in globals.css

## Requirements Satisfied

- **Requirement 1.5**: Design-tokens.ts file audited and color definitions updated to use CSS variables
- **Requirement 8.2**: Duplicate color definitions eliminated by using centralized CSS custom properties

## Impact

The funeralColors object now consistently uses CSS custom properties throughout, ensuring:
- Single source of truth for colors (globals.css @theme directive)
- Easier maintenance and updates
- Better consistency across the application
- Support for dynamic theming if needed in the future

## Next Steps

Task 10.4 should add deprecation notices to the color section in design-tokens.ts to guide developers toward using the centralized color system.
