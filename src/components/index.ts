/**
 * Components - Atomic Design System Barrel Export
 *
 * This is the main entry point for all components, organized by atomic design levels:
 * - Atoms: Basic building blocks (UI components)
 * - Molecules: Simple combinations of atoms
 * - Organisms: Complex UI sections
 * - Templates: Page layouts
 *
 * Tree-shaking is optimized through selective exports.
 */

// =============================================================================
// ATOMS - Basic UI Components
// =============================================================================

export * from "./ui";

// =============================================================================
// MOLECULES - Simple Component Combinations
// =============================================================================

export * from "./auth";
// Form molecules
export * from "./contact";

// Display molecules
export * from "./i18n";
export * from "./seo";

// =============================================================================
// ORGANISMS - Complex UI Sections
// =============================================================================


// Utility organisms
export * from "./accessibility";
// Admin organisms
export * from "./admin";
export * from "./cart";
export * from "./checkout";
export * from "./delivery";
export * from "./faq";
export * from "./gdpr";
// Layout organisms
export * from "./layout";
export * from "./monitoring";
export * from "./order";
export * from "./payments";
export * from "./performance";
// Feature organisms
export * from "./product";

// =============================================================================
// TEMPLATES - Page Layouts
// =============================================================================

// Templates are typically imported directly from layout components
// as they represent full page structures

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type * from "@/types/components";

// =============================================================================
// DYNAMIC IMPORTS FOR CODE SPLITTING
// =============================================================================

// Heavy components that should be loaded dynamically
export { default as DynamicComponents } from "./dynamic";

// =============================================================================
// DEVELOPMENT COMPONENTS
// =============================================================================

// Only export examples in development
if (process.env.NODE_ENV === "development") {
  export * from "./examples";
}
