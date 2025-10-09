import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Health check endpoint for monitoring and deployment verification
 */
export async function GET() {
  const startTime = Date.now();

  try {
    // Check database connectivity
    const supabase = createClient();
    const { error: dbError } = await supabase.from("categories").select("count").limit(1).single();

    if (dbError) {
      throw new Error(`Database check failed: ${dbError.message}`);
    }

    // Check Redis connectivity (if configured)
    let redisStatus = "not_configured";
    if (process.env.REDIS_URL) {
      try {
        // Import Redis dynamically to avoid issues if not configured
        const { Redis } = await import("ioredis");
        const redis = new Redis(process.env.REDIS_URL);
        await redis.ping();
        await redis.disconnect();
        redisStatus = "healthy";
      } catch (_error) {
        redisStatus = "error";
      }
    }

    // Check environment variables
    const requiredEnvVars = [
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "NEXTAUTH_SECRET",
      "NEXTAUTH_URL",
    ];

    const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName]);

    const responseTime = Date.now() - startTime;

    const healthData = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: process.env["npm_package_version "] || "1.0.0",
      environment: process.env.NODE_ENV || "development",
      uptime: process.uptime(),
      responseTime: `${responseTime}ms`,
      checks: {
        database: dbError ? "error" : "healthy",
        redis: redisStatus,
        environment: missingEnvVars.length === 0 ? "healthy" : "warning",
      },
      ...(missingEnvVars.length > 0 && {
        warnings: {
          missingEnvVars,
        },
      }),
    };

    // Return appropriate status code
    const hasErrors = Object.values(healthData.checks).includes("error");
    const statusCode = hasErrors ? 503 : 200;

    return NextResponse.json(healthData, {
      status: statusCode,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        responseTime: `${responseTime}ms`,
        error: error instanceof Error ? error.message : "Unknown error",
        checks: {
          database: "error",
          redis: "unknown",
          environment: "unknown",
        },
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  }
}
