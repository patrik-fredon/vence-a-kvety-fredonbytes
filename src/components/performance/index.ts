/**
 * Performance optimization components and utilities
 *
 * This module provides components and utilities for optimizing web performance,
 * specifically addressing requirements 8.1-8.5 for the home page refactor:
 * - 8.1: Lighthouse performance score of 90+
 * - 8.2: Image optimization for web delivery
 * - 8.3: Efficient CSS and layout shift prevention
 * - 8.4: Non-blocking JavaScript execution
 * - 8.5: Critical resource prioritization
 */

export { PerformanceMonitor, usePerformanceMetrics, PerformanceSummary } from './PerformanceMonitor';
export { ResourceHints, CriticalCSS } from './ResourceHints';

// Re-export performance utilities
export {
  getCriticalResourceHints,
  getHeroResourceHints,
  getBelowFoldResourceHints,
  generateResourceHintTags,
  getCriticalCSSOptimizations,
  getFontOptimizations,
  getImageOptimizations,
  getPerformanceConfig,
} from '@/lib/performance/resource-hints';

// Re-export lazy loading component
export { LazyProductReferencesSection } from '@/components/layout/LazyProductReferencesSection';
