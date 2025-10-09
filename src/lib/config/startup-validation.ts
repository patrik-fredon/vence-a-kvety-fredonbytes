/**
 * Startup Validation
 * Validates environment and configuration at application startup
 */

import { logEnvironmentConfig, validateEnvironmentOrThrow } from "./env-validation";

/**
 * Run all startup validations
 * This should be called as early as possible in the application lifecycle
 */
export function runStartupValidation(): void {
  try {
    console.log("Running startup validation...");

    // Validate environment variables
    validateEnvironmentOrThrow();

    // Log environment configuration (sanitized)
    if (process.env.NODE_ENV === "development") {
      logEnvironmentConfig();
    }

    console.log("✓ Startup validation completed successfully");
  } catch (error) {
    console.error("✗ Startup validation failed:");
    console.error(error);

    // In production, we want to fail fast if configuration is invalid
    if (process.env.NODE_ENV === "production") {
      throw error;
    }

    // In development, log the error but allow the app to start
    console.warn("Continuing in development mode despite validation errors...");
  }
}

// Run validation immediately when this module is imported
// This ensures validation happens before any other code runs
if (typeof window === "undefined") {
  // Only run on server-side
  runStartupValidation();
}
