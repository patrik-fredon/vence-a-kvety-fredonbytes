/**
 * Environment Variable Validation
 * Ensures all required environment variables are set and valid
 */

interface EnvValidationResult {
  isValid: boolean;
  missing: string[];
  invalid: string[];
  warnings: string[];
}

/**
 * Required environment variables for the application
 */
const REQUIRED_ENV_VARS = {
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: {
    required: true,
    description: "Supabase project URL",
    validate: (value: string) => value.startsWith("https://"),
  },
  NEXT_PUBLIC_SUPABASE_ANON_KEY: {
    required: true,
    description: "Supabase anonymous key",
    validate: (value: string) => value.length > 0,
  },
  SUPABASE_SERVICE_ROLE_KEY: {
    required: true,
    description: "Supabase service role key (server-side only)",
    validate: (value: string) => value.length > 0,
  },

  // Stripe Payment
  STRIPE_SECRET_KEY: {
    required: true,
    description: "Stripe secret key",
    validate: (value: string) => value.startsWith("sk_"),
  },
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: {
    required: true,
    description: "Stripe publishable key",
    validate: (value: string) => value.startsWith("pk_"),
  },
  STRIPE_WEBHOOK_SECRET: {
    required: true,
    description: "Stripe webhook signing secret",
    validate: (value: string) => value.startsWith("whsec_"),
  },

  // Redis/Upstash
  UPSTASH_REDIS_REST_URL: {
    required: true,
    description: "Upstash Redis REST URL",
    validate: (value: string) => value.startsWith("https://"),
  },
  UPSTASH_REDIS_REST_TOKEN: {
    required: true,
    description: "Upstash Redis REST token",
    validate: (value: string) => value.length > 0,
  },

  // NextAuth
  NEXTAUTH_SECRET: {
    required: true,
    description: "NextAuth secret for session encryption",
    validate: (value: string) => value.length >= 32,
  },
  NEXTAUTH_URL: {
    required: false,
    description: "NextAuth URL (optional in production)",
    validate: (value: string) => value.startsWith("http"),
  },

  // Optional but recommended
  NEXT_PUBLIC_BASE_URL: {
    required: false,
    description: "Base URL for the application",
    validate: (value: string) => value.startsWith("http"),
  },
} as const;

/**
 * Validate all required environment variables
 */
export function validateEnvironmentVariables(): EnvValidationResult {
  const missing: string[] = [];
  const invalid: string[] = [];
  const warnings: string[] = [];

  for (const [key, config] of Object.entries(REQUIRED_ENV_VARS)) {
    const value = process.env[key];

    // Check if required variable is missing
    if (config.required && !value) {
      missing.push(`${key} - ${config.description}`);
      continue;
    }

    // Check if optional variable is missing (warning only)
    if (!(config.required || value)) {
      warnings.push(`${key} - ${config.description} (optional but recommended)`);
      continue;
    }

    // Validate the value if present
    if (value && config.validate && !config.validate(value)) {
      invalid.push(`${key} - Invalid format or value`);
    }
  }

  // Additional security checks
  if (process.env["NODE_ENV"] === "production") {
    // Ensure production uses live keys
    const stripeKey = process.env["STRIPE_SECRET_KEY"];
    if (stripeKey?.startsWith("sk_test_")) {
      warnings.push("STRIPE_SECRET_KEY - Using test key in production environment");
    }

    const stripePublishableKey = process.env["NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"];
    if (stripePublishableKey?.startsWith("pk_test_")) {
      warnings.push(
        "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY - Using test key in production environment"
      );
    }

    // Ensure NEXTAUTH_SECRET is strong enough
    const nextAuthSecret = process.env["NEXTAUTH_SECRET"];
    if (nextAuthSecret && nextAuthSecret.length < 32) {
      invalid.push("NEXTAUTH_SECRET - Must be at least 32 characters long");
    }
  }

  return {
    isValid: missing.length === 0 && invalid.length === 0,
    missing,
    invalid,
    warnings,
  };
}

/**
 * Validate environment variables and throw error if invalid
 * Should be called at application startup
 */
export function validateEnvironmentOrThrow(): void {
  const result = validateEnvironmentVariables();

  if (!result.isValid) {
    const errorMessages: string[] = [];

    if (result.missing.length > 0) {
      errorMessages.push("Missing required environment variables:");
      errorMessages.push(...result.missing.map((msg) => `  - ${msg}`));
    }

    if (result.invalid.length > 0) {
      errorMessages.push("\nInvalid environment variables:");
      errorMessages.push(...result.invalid.map((msg) => `  - ${msg}`));
    }

    throw new Error(`\n${errorMessages.join("\n")}\n`);
  }

  // Log warnings if any
  if (result.warnings.length > 0) {
    console.warn("Environment variable warnings:");
    result.warnings.forEach((warning) => console.warn(`  - ${warning}`));
  }
}

/**
 * Get a required environment variable or throw error
 */
export function getRequiredEnvVar(key: string): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}\n` +
        `Please set this variable in your .env file or environment configuration.`
    );
  }

  return value;
}

/**
 * Get an optional environment variable with default value
 */
export function getOptionalEnvVar(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

/**
 * Check if running in production environment
 */
export function isProduction(): boolean {
  return process.env["NODE_ENV"] === "production";
}

/**
 * Check if running in development environment
 */
export function isDevelopment(): boolean {
  return process.env["NODE_ENV"] === "development";
}

/**
 * Check if running in test environment
 */
export function isTest(): boolean {
  return process.env["NODE_ENV"] === "test";
}

/**
 * Sanitize environment variable for logging (hide sensitive parts)
 */
export function sanitizeEnvVarForLogging(key: string, value: string): string {
  // Don't log sensitive keys at all
  const sensitiveKeys = ["SECRET", "KEY", "TOKEN", "PASSWORD", "WEBHOOK", "SERVICE_ROLE"];

  if (sensitiveKeys.some((sensitive) => key.includes(sensitive))) {
    if (value.length <= 8) {
      return "***";
    }
    return `${value.substring(0, 4)}...${value.substring(value.length - 4)}`;
  }

  return value;
}

/**
 * Log environment configuration (sanitized)
 */
export function logEnvironmentConfig(): void {
  console.log("Environment Configuration:");
  console.log(`  NODE_ENV: ${process.env["NODE_ENV"]}`);
  console.log(`  Production: ${isProduction()}`);
  console.log(`  Development: ${isDevelopment()}`);

  // Log sanitized versions of important variables
  const importantVars = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "STRIPE_SECRET_KEY",
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    "UPSTASH_REDIS_REST_URL",
  ];

  importantVars.forEach((key) => {
    const value = process.env[key];
    if (value) {
      console.log(`  ${key}: ${sanitizeEnvVarForLogging(key, value)}`);
    }
  });
}
