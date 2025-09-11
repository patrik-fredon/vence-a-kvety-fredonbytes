import type { AppConfig } from "@/types";

/**
 * Application configuration
 */
export const config: AppConfig = {
  env: (process.env.NODE_ENV as AppConfig["env"]) || "development",
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "/api",
  defaultLocale: "cs",
  supportedLocales: ["cs", "en"],
};

/**
 * Environment variables validation
 */
export function validateEnv() {
  const requiredEnvVars: string[] = [
    // Add required environment variables here as they are needed
    // Example: 'NEXT_PUBLIC_SUPABASE_URL'
  ];

  const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(", ")}`);
  }
}

/**
 * Check if running in development mode
 */
export const isDevelopment = config.env === "development";

/**
 * Check if running in production mode
 */
export const isProduction = config.env === "production";

/**
 * Check if running in test mode
 */
export const isTest = config.env === "test";
