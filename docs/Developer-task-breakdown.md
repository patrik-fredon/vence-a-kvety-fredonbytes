# 🔹 Developer Task Breakdown (Step-by-step Refactor Plan)

### 1. Setup & Analysis

* Clone both repos: current project and `pohrebni-vence-layout`.
* Review the **UI components** from `pohrebni-vence-layout` (header, footer, hero, product grid, contact form).
* Identify overlapping components and styling conflicts with the current project.

### 2. Styling & Component Migration

* Extract global styles (colors, typography, spacing) from `pohrebni-vence-layout`.
* Apply them to the current project’s **global CSS/theme provider**.
* Replace existing UI components step by step:

  1. Header & navigation
  2. Footer
  3. Landing page sections (hero, highlights)
  4. Product grid
  5. Product detail page
  6. Contact form

### 3. Functional Preservation

* Ensure existing **API hooks, Supabase calls, and Redis caching** remain untouched.
* Keep **i18n translation hooks** intact – no hardcoded strings.
* Verify **cart, checkout, login** logic still works after UI replacement.

### 4. Responsiveness & Accessibility

* Adjust migrated components for mobile-first responsiveness.
* Check for a11y compliance (semantic HTML, aria attributes, keyboard navigation).

### 5. Testing & QA

* Run functional tests (API calls, forms, translations).
* Perform visual comparison against `pohrebni-vence-layout`.
* Verify translations (CS/EN) on every refactored page.

### 6. Documentation

* Update **README.md** with notes on styling system and how to maintain UI consistency going forward.

---

# 🔹 Optimized Starting Prompt for Developers

Here’s a ready-to-use starting prompt you can paste into GitHub issues, Slack, or task tracker for your dev team:

---

## 🛠️ Task: UI Refactor with `pohrebni-vence-layout`

**Goal:**
Refactor the UI of our project to adopt the design and layout from [`pohrebni-vence-layout`](https://github.com/patrik-fredon/pohrebni-vence-layout), while keeping all functionality, API integrations, caching, and i18n intact.

**What stays the same:**

* Supabase API calls
* Redis caching
* next-i18n (CS/EN)
* Business logic (cart, auth, orders, etc.)

**What changes:**

* UI/UX (header, footer, landing page, product grid, product detail, contact form, overall styling)
* Responsive design (mobile-first)
* Consistent theme (colors, fonts, spacing)

**Deliverables:**

* All pages styled according to `pohrebni-vence-layout`
* Functionality remains unchanged
* Full responsiveness and CS/EN i18n preserved
* Updated README with styling notes

**Acceptance criteria:**

* Visuals match layout repo
* Functionality identical to current project
* CS/EN translations fully working
* Mobile/tablet/desktop responsive
