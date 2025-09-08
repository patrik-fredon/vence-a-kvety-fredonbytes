# 📄 Product Requirements Document (PRD)

**Project:** Wreaths and Flowers – E-commerce Platform
**Client:** Ketingmar s.r.o.
**Prepared by:** \[Your Name]
**Date:** \[2025-09-08]

---

## 1. Overview

Ketingmar s.r.o. requires a **responsive, luxurious, somber-themed e-commerce platform** to sell **funeral wreaths and flowers**. The platform must allow **product configuration**, **visualization of wreaths**, **calendar-based delivery scheduling**, and **payment processing**.

The goal is to create an **easy-to-use**, **conversion-optimized**, and **SEO-friendly** website that caters to bereaved families and relatives of the deceased, ensuring **trust, empathy, and professionalism** in the design.

---

## 2. Objectives

* Provide a **fast-loading, SEO-optimized e-shop** with intuitive navigation.
* Support **multi-language (Czech & English)** via Next-i18n.
* Enable customers to:

  * Browse categories with collapsible menus.
  * Configure custom wreaths with visualization.
  * Schedule delivery for the **next day via a custom-styled calendar**.
  * Register/login (NextAuth + Supabase) and view order history.
* Offer **secure payment integration** (Stripe/GoPay for CZ).
* Allow admins to **easily manage products, categories, and images**.

---

## 3. Target Users

* **Primary Users:** Bereaved families/relatives ordering funeral flowers/wreaths.
* **Secondary Users:** Funeral service providers or event organizers.

**User Needs:**

* Simple product discovery and customization.
* Clear delivery/transport options.
* Trustworthy, elegant design reflecting the sensitive context.
* Multilingual support (CZ/EN).

---

## 4. Functional Requirements

### 4.1 User Flows

#### 1. Visitor (Unregistered)

* Browse products (by categories).
* Configure wreaths (choose size, flowers, ribbons, message).
* Add products to cart.
* Schedule delivery (via calendar).
* Checkout as guest or register.

#### 2. Registered User

* All of the above.
* Save delivery addresses.
* View order history.
* Reorder quickly.

#### 3. Admin

* Manage product catalog (add/update/remove products).
* Manage wreath configurator options.
* Upload high-quality images.
* Manage orders (view, update status, process).
* Manage delivery calendar slots.
* Manage registered customers.

---

### 4.2 Core Features

1. **E-commerce Essentials**

   * Product catalog with categories.
   * Product detail pages (high-quality photos, description, price, options).
   * Cart & checkout flow (with payment integration).
   * Delivery calendar (only allows **next-day onward** booking).

2. **Product Customization (Wreath Configurator)**

   * Options: size, type of flowers, ribbon color, message text.
   * Visualization (preview image updates in real-time).

3. **Authentication & Accounts**

   * Login/Registration (NextAuth with Supabase).
   * Purchase history & profile.

4. **Content Pages**

   * Home (hero banner, featured products, categories).
   * About Us (company story, mission).
   * Services (custom wreath design, funeral arrangements).
   * Portfolio (gallery of past works).
   * Delivery & Transport options.
   * Contact (form + company details).

5. **Calendar Scheduling**

   * Integrated into checkout.
   * Default starts from **next day only**.
   * Styled to match **luxury / old tavern style**.
   * Redis used for caching available delivery slots.

6. **Payments & Transactions**

   * Integration with **Stripe** (global) and/or **GoPay** (local CZ).
   * Multiple payment options (card, bank transfer).

---

## 5. Non-Functional Requirements

* **Performance:**

  * Load time < 2s (optimized images, Next.js ISR/SSG, Redis caching).
  * Mobile-first responsive design.

* **Security:**

  * HTTPS, encrypted transactions.
  * Secure authentication with JWT sessions (NextAuth + Supabase).

* **Scalability:**

  * Product catalog and orders stored in Supabase.
  * Redis caching for session management & calendar availability.

* **SEO & Marketing:**

  * Metadata, Open Graph, structured data for products.
  * Fast, clean URLs: `/wreaths/roses-white`.
  * Schema markup for e-commerce.

---

## 6. Tech Stack

* **Frontend:** Next.js 15, TypeScript, TailwindCSS 4.
* **Backend:** Supabase (Postgres, Auth, Storage).
* **Auth:** NextAuth with Supabase adapter.
* **Caching:** Redis (calendar slots, session data, product caching).
* **i18n:** Next-i18n (Czech, English).
* **Payments:** Stripe (primary) + GoPay (CZ option).
* **Deployment:** Vercel (frontend) + Supabase hosting.

---

## 7. Example Layout & Design

* **Style:** Luxurious, natural, somber tones (dark greens, muted gold, white, black).
* **Typography:** Serif + elegant sans-serif for readability.
* **Homepage Layout Example:**

  * Hero banner (large wreath image + CTA "Order Now").
  * Category showcase (collapsible).
  * Featured products.
  * Configurator CTA block.
  * Testimonials / trust signals.
  * Footer (contact, about, policies).

---

## 8. Implementation Plan

### Phase 1: Setup & Core

* Initialize Next.js 15 + Tailwind 4 + TS.
* Supabase setup (DB schema: users, products, orders, categories, calendar).
* NextAuth integration.
* Product catalog + cart + checkout flow.

### Phase 2: Custom Features

* Delivery calendar (with Redis).
* Wreath configurator with visualization.
* Admin panel for product & order management.

### Phase 3: Enhancements

* SEO optimization (structured data, sitemap).
* Multilingual (Next-i18n).
* Responsive polish + accessibility.
* Payment integration (Stripe + GoPay).

### Phase 4: Launch & Monitoring

* Beta testing with client.
* Deploy on Vercel.
* Analytics & error monitoring (Vercel + Sentry).

---

## 9. Success Metrics

* **Page speed:** < 2s load on mobile.
* **Conversion rate:** ≥ 2.5% within 3 months.
* **Abandoned cart recovery:** Email reminders (via Supabase triggers).
* **Uptime:** 99.9%.

