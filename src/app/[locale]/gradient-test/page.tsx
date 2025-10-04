/**
 * Gradient Test Page
 *
 * Temporary page for testing the centralized background gradient system.
 * This page should be removed after gradient testing is complete.
 *
 * Access at: /cs/gradient-test or /en/gradient-test
 */

import { GradientTest } from "@/components/test/GradientTest";

export default function GradientTestPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto py-8">
        <h1 className="text-4xl font-bold text-stone-900 mb-8">Centralized Gradient System Test</h1>
        <GradientTest />
      </div>
    </div>
  );
}
