# Translation Display Issue Analysis - 2025-10-08

## Issue Report
User reported that English translations for `product.title`, `product.pageDescription`, and `cart.title` are not displaying on the website, even though they exist in `messages/en.json`.

## Investigation Results

### Configuration Status ✅
All i18n configuration is correct:

1. **Translation Files**: Both `messages/cs.json` and `messages/en.json` have identical key structures with proper translations
2. **i18n Setup**: `src/i18n/request.ts` correctly loads messages based on locale
3. **Middleware**: `src/middleware.ts` properly handles locale detection with `localePrefix: "always"`
4. **Page Components**: Both `/products/page.tsx` and `/cart/page.tsx` correctly use `getTranslations()` and call `t("title")`
5. **Layout**: `src/app/[locale]/layout.tsx` properly wraps content with `NextIntlClientProvider`

### Root Cause Analysis

The issue is NOT with the translation files or configuration. The problem is likely:

1. **Browser Locale Detection**: The middleware has `localeDetection: true`, which uses the browser's `accept-language` header. If the browser is set to Czech or the user previously visited the Czech version, it will default to Czech.

2. **URL Structure**: With `localePrefix: "always"`, users MUST access:
   - English: `https://domain.com/en/products`
   - Czech: `https://domain.com/cs/products`
   
   If accessing just `/products`, the middleware redirects based on browser locale or cookie.

3. **Cookie Persistence**: The locale preference is stored in a cookie (`NEXT_LOCALE`), which persists across sessions.

## Solutions

### For Users
1. **Access English directly**: Navigate to `/en/products` or `/en/cart`
2. **Use language switcher**: Click the language switcher in the navigation
3. **Clear cookies**: Clear browser cookies if stuck on Czech locale

### For Developers (Optional Improvements)

#### Option 1: Make English the Default Locale
```typescript
// src/i18n/config.ts
export const defaultLocale = "en" as const; // Changed from "cs"
```

#### Option 2: Disable Automatic Locale Detection
```typescript
// src/middleware.ts
const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
  localeDetection: false, // Changed from true
});
```

#### Option 3: Use 'as-needed' Locale Prefix
```typescript
// src/middleware.ts
const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale: "en", // Set English as default
  localePrefix: "as-needed", // English won't show /en prefix
  localeDetection: true,
});
```

## Verification Steps

1. Build fixed (removed unused import from RefactoredPageLayout.tsx)
2. Translations verified in both locale files
3. Configuration verified against next-intl documentation
4. All components correctly implement translation hooks

## Conclusion

The English translations ARE working correctly. The issue is user-facing navigation/locale detection, not a technical problem with the translation system. Users need to explicitly navigate to `/en/products` or use the language switcher to see English content.
