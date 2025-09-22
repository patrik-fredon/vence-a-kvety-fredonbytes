# FIX PLAN - CSS @import Warning & i18n Translation Issues

## Issue Analysis

### Issue 1: CSS @import Warning

**Root Cause**: TailwindCSS 4 with PostCSS is processing `src/app/globals.css` and moving the Google Fonts @import from line 2 to line 3853 in the final output, violating CSS specification.

**Current State**:

- Source: `@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap");` at line 2
- Generated: Same @import at line 3853 (after other CSS rules)

### Issue 2: i18n Translation Issue

**Root Cause**: The i18n configuration appears correct, but there's likely a locale resolution issue in SSR where the English locale is not being properly passed to the translation loading mechanism.

**Current State**:

- URL: `/en` (correct)
- Expected: English translations from `messages/en.json`
- Actual: Czech translations being displayed
- Translation files: Both exist and are properly structured

## Fix Strategy

### Fix 1: CSS @import Issue (Low Risk)

**Approach**: Replace CSS @import with Next.js font optimization

- Remove Google Fonts @import from `globals.css`
- Use Next.js `next/font/google` for proper font loading
- This ensures fonts load before other CSS and eliminates @import

### Fix 2: i18n Translation Issue (Medium Risk)

**Approach**: Debug and fix locale resolution in SSR

- Check if locale parameter is being passed correctly to `getRequestConfig`
- Verify middleware locale detection
- Ensure proper locale fallback mechanism

## Implementation Plan

### TODO 1.1: Fix CSS @import Issue

1. Remove Google Fonts @import from `src/app/globals.css`
2. Verify Next.js font configuration in layout files
3. Test that fonts still load correctly
4. Verify @import warning is gone

### TODO 1.2: Fix i18n Translation Issue

1. Add debug logging to `src/i18n/request.ts`
2. Check locale parameter in SSR
3. Verify English translations are being loaded
4. Test `/en` route shows English content

### TODO 1.3: Verification

1. Start dev server
2. Check browser console for CSS warnings
3. Verify `/en` shows English content
4. Verify `/cs` shows Czech content
5. Test SSR and client-side hydration

## Risk Assessment

- **CSS Fix**: Low risk - Next.js font optimization is standard practice
- **i18n Fix**: Medium risk - May require debugging locale resolution logic
- **Rollback**: Both changes are easily reversible

## Success Criteria

1. No CSS @import warnings in browser console
2. `/en` route displays English translations
3. `/cs` route displays Czech translations
4. Fonts load correctly
5. No regression in functionality
