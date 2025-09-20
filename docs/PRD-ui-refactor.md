# PRD: UI Refactor – Integration of `pohrebni-vence-layout` Design

## 1. Goal

Refactor the current project’s user interface to **match the visual design and layout from [`pohrebni-vence-layout`](https://github.com/patrik-fredon/pohrebni-vence-layout)** while **keeping all existing business logic, API integrations, caching, and i18n functionality intact**.

## 2. Scope

### Will remain unchanged

* All **backend logic** and **API calls** to Supabase.
* **Redis caching**.
* **Internationalization (next-i18n)** with CS/EN language support.
* All existing project features (cart, authentication, orders, etc.).
* Data models and integrations.

### Will be updated

* **Visual appearance and layout of all pages**, based on `pohrebni-vence-layout`:

  * Landing page (hero section, product highlights, CTA).
  * Product grid (keep API integration, update UI).
  * Product detail page (styles, typography, components).
  * Contact form (UI refactor, preserve submission logic).
  * Header, footer, navigation.
  * Global styling: colors, typography, spacing, component look & feel.

### Out of scope

* API, database, or infrastructure modifications.
* Refactoring business logic (cart, checkout, login, etc.).
* Adding new features.

## 3. Technical Requirements

* Maintain existing **Next.js/React component structure**.
* Adapt and integrate the layout and styles from `pohrebni-vence-layout` into the current codebase.
* Reuse existing **state management, API hooks, and translation functions**.
* Ensure **mobile-first responsiveness** (as in the layout repo).
* Unify styling system (adapt if there are conflicts between the two repos).

## 4. Acceptance Criteria

* After refactor:

  * All pages visually match the design from `pohrebni-vence-layout`.
  * Existing functionality works exactly as before (API calls, login, cart, i18n).
  * UI is fully responsive across devices (mobile, tablet, desktop).
  * Translations (CS/EN) work on all updated pages.

## 5. Risks & Constraints

* Potential conflicts between existing styles and the layout repo → styling unification required.
* Must ensure i18n compatibility (no hardcoded texts).

## 6. Deliverables

* Complete UI refactor of the project.
* Updated documentation (README section on layout/styling maintenance).
* Test protocol: functional checks + visual comparison against `pohrebni-vence-layout`.
