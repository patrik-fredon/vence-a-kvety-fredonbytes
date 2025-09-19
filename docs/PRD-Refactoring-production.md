# Product Requirements Document (PRD)

**Project Refactoring – Funeral Wreaths E-commerce Website**

## 1. Overview

The current project implementation contains multiple functional and design issues discovered during testing. The goal of this refactoring is to ensure a fully functional, professional, and user-friendly e-commerce website aligned with the theme of funeral wreaths. This PRD defines the scope of improvements, functional and non-functional requirements, and expected deliverables.

---

## 2. Objectives

* Fix broken features and ensure core e-commerce functionality works as intended.
* Improve user experience (UX) and user interface (UI) consistency.
* Provide proper internationalization (EN/CZ switch).
* Ensure the project meets legal and compliance requirements (GDPR, policies).
* Deliver a responsive, professional design that works across all devices.

---

## 3. Current Issues Identified

1. **Language Translation**

   * EN/CZ translation not working. Only Czech (CS) is displayed.
   * Language switcher is non-functional.

2. **Shopping Cart Functionality**

   * Adding a product to the cart does not reflect in the cart view.
   * Cart logic is broken: items do not persist or display correctly.

3. **UI/UX and Styling Issues**

   * CSS color scheme and layout are broken.
   * Buttons are invisible or transparent.
   * The design lacks professionalism and does not match the funeral wreath theme.

4. **Homepage Enhancements**

   * Missing display of 3 random products from the product grid as a "customer bait" section.

5. **Navigation & Product Display**

   * Navbar products menu contains non-functional sections.
   * Only one working link (“All Products”), other links should be removed until properly implemented.

6. **Legal and Compliance Pages**

   * GDPR, Terms & Conditions, Privacy Policy, and Cookies pages are missing (404 errors).

7. **Responsive Design**

   * Layout and formatting are inconsistent across different devices and screen sizes.

---

## 4. Functional Requirements

### 4.1 Internationalization (i18n)

* Implement proper EN/CZ language switch functionality.
* Store language preference per user (cookie/session/localStorage).
* Ensure all UI text, product descriptions (where available), and buttons are translatable.

### 4.2 Shopping Cart

* Fix cart logic so that adding/removing items updates the cart in real-time.
* Ensure cart persists across navigation until checkout.
* Show item count and subtotal in the cart preview.

### 4.3 Homepage

* Implement a section that displays **3 random products** from the product grid on each visit.
* Ensure product cards display image, name, price, and “Add to Cart” button.

### 4.4 Navigation

* Simplify navbar:

  * Keep only the **All Products** button.
  * Remove or hide non-functional product category sections until implemented.

### 4.5 Legal Pages

* Create functional placeholder pages for:

  * GDPR
  * Terms & Conditions
  * Privacy Policy
  * Cookies Policy
* Each page must be accessible from the footer/navbar and must not return 404.

---

## 5. Non-Functional Requirements

### 5.1 UI/UX & Styling

* Redesign CSS for a professional look aligned with the funeral wreath theme:

  * Muted colors (dark greens, blacks, whites, greys).
  * Consistent button styling (visible, properly contrasted).
  * Clean typography, legible fonts.
* Ensure branding consistency across all pages.

### 5.2 Responsive Design

* Test and optimize for:

  * Desktop (full HD and larger screens).
  * Tablet (landscape and portrait).
  * Mobile devices (iOS and Android).
* Responsive navbar and product grid layout.

---

## 6. Deliverables

* Refactored codebase with fixed translation, cart functionality, and navigation.
* Redesigned UI with professional styling matching the funeral theme.
* Responsive, fully tested design across devices.
* Working legal and compliance pages.
* Documentation on how to manage translations and products.

---

## 7. Acceptance Criteria

* ✅ EN/CZ switcher changes all visible text across the site.
* ✅ Adding products updates the cart correctly.
* ✅ Homepage displays 3 random products on reload.
* ✅ Navbar has only one working “All Products” section.
* ✅ GDPR and other policy pages open without errors.
* ✅ Design appears professional, consistent, and matches the theme.
* ✅ Website is fully responsive on mobile, tablet, and desktop.
