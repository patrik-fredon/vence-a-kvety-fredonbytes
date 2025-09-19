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

// Form molecules
export * from "./contact";
export * from "./auth";

// Display molecules
export * from "./i18n";
export * from "./seo";

// =============================================================================
// ORGANISMS - Complex UI Sections
// =============================================================================

// Layout organisms
export * from "./layout";

// Feature organisms
export * from "./product";
export * from "./cart";
export * from "./checkout";
export * from "./order";
export * from "./delivery";
export * from "./payments";

// Admin organisms
export * from "./admin";

// Utility organisms
export * from "./accessibility";
export * from "./monitoring";
export * from "./gdpr";
export * from "./faq";

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
