# i18n Message Structure Documentation

## Overview

This document describes the internationalization (i18n) message structure for the funeral wreaths e-commerce application. The project uses **next-intl** for managing translations across Czech (cs) and English (en) locales.

## File Structure

```
messages/
├── cs.json  # Czech translations (594 keys)
└── en.json  # English translations (594 keys)
```

## Message Organization

The message files follow next-intl best practices with a deeply nested JSON structure organized by feature/component namespaces.

### Top-Level Namespaces

#### Layout & Navigation
- **navigation** - Main navigation menu items, links
- **footer** - Footer content, company info, legal links
- **ui** - General UI elements (menu, language selector)

#### Pages
- **home** - Homepage content including hero section, product references, philosophy
- **about** - About page content
- **faq** - Frequently asked questions
- **contact** - Contact page and form

#### Components
- **product** - Product-related translations (cards, details, filters, validation)
- **cart** - Shopping cart interface
- **checkout** - Checkout process steps and forms
- **delivery** - Delivery options, calendar, cost calculator
- **auth** - Authentication (login, register, profile)
- **admin** - Admin panel interface
- **gdpr** - GDPR consent and data management
- **accessibility** - Accessibility features and toolbar

#### Utilities
- **common** - Common UI elements (buttons, states, actions)
- **currency** - Currency formatting
- **date** - Date formatting and relative dates
- **seo** - SEO metadata and Open Graph tags
- **meta** - Basic page metadata

## Usage Patterns

### In Server Components
```tsx
import {getTranslations} from 'next-intl/server';

async function Page() {
  const t = await getTranslations('product');
  return <h1>{t('title')}</h1>;
}
```

### In Client Components
```tsx
import {useTranslations} from 'next-intl';

function Component() {
  const t = useTranslations('product');
  return <h1>{t('title')}</h1>;
}
```

### Accessing Nested Keys
```tsx
const t = useTranslations('home.refactoredHero');
// Access: t('heading'), t('subheading'), t('cta')
```

## Key Statistics

- **Total keys per locale**: 594
- **Locales supported**: Czech (cs), English (en)
- **Structure consistency**: 100% (both locales have identical structure)
- **Active namespaces**: 20+

## Namespace Usage Map

| Namespace | Used In | Primary Components |
|-----------|---------|-------------------|
| navigation | Header, Navigation, Cart | Main menu, mobile nav |
| common | Multiple | Buttons, states, language switcher |
| product | Product pages | Cards, details, filters, customizer |
| cart | Cart page | Shopping cart, cart icon |
| checkout | Checkout flow | Multi-step checkout form |
| auth | Auth pages | Login, register, profile |
| footer | Footer | Company info, links |
| delivery | Checkout | Calendar, options, cost calculator |
| accessibility | Global | Toolbar, skip links, keyboard nav |
| admin | Admin panel | Dashboard, orders, products |
| gdpr | GDPR components | Consent manager, data export/deletion |
| currency | Price displays | Currency formatting |
| date | Date displays | Date formatting |
| home | Homepage | Hero, product references |
| faq | FAQ page | Questions and answers |
| about | About page | Company story |
| contact | Contact page | Contact form |
| ui | UI components | Menu, language selector |
| seo | Meta tags | SEO metadata, Open Graph |
| meta | Page metadata | Basic page info |

## Best Practices

### 1. Namespace Organization
- Group related translations under a common namespace
- Use dot notation for nested access: `t('form.placeholder')`
- Provide the lowest common denominator to `useTranslations()`

### 2. Type Safety
- TypeScript types are auto-generated from `messages/en.json`
- Provides autocompletion and validation for all keys
- Prevents typos and missing translations

### 3. Consistency
- Both locale files must have identical structure
- All keys must exist in all locales
- Use fallback utilities for graceful degradation

### 4. Performance
- Use `pick()` from lodash to provide only needed messages to client components
- Leverage Server Components for better performance
- Split large namespaces if needed

## Validation

The message structure is validated through:
1. JSON syntax validation
2. TypeScript type checking
3. Build-time validation in Next.js
4. Runtime fallback system

## Maintenance

When adding new translations:
1. Add keys to both `cs.json` and `en.json`
2. Maintain identical structure in both files
3. Update fallback utilities if needed
4. Run `npm run type-check` to verify
5. Test in both locales

## Archive Structure

For deprecated or unused keys:
```
docs/archive/messages/
├── duplicates.json  # Duplicate keys (if found)
└── unused.json      # Deprecated/unused keys (if found)
```

## Related Files

- `src/i18n/config.ts` - i18n configuration
- `src/i18n/request.ts` - Request-level i18n setup
- `src/lib/utils/fallback-utils.ts` - Fallback translations
- `src/lib/i18n/` - i18n utilities and hooks

## References

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://formatjs.io/docs/core-concepts/icu-syntax/)
- [Next.js Internationalization](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
