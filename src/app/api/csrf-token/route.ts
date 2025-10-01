/**
 * CSRF Token API Route
 * Provides CSRF tokens for client-side requests
 */

import { NextResponse } from "next/server";
import { createCSRFHeaders, generateCSRFToken } from "@/lib/security/csrf";

export async function GET() {
  try {
    // Generate a new CSRF token
    const token = await generateCSRFToken();

    // Create response with token in headers
    const response = NextResponse.json({
      success: true,
      message: "CSRF token generated",
      timestamp: new Date().toISOString(),
    });

    // Add CSRF token to response headers
    const headers = createCSRFHeaders(token);
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    // Set cache control to prevent caching of tokens
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");

    return response;
  } catch (error) {
    console.error("Error generating CSRF token:", error);

    return NextResponse.json(
      {
        error: {
          code: "CSRF_TOKEN_GENERATION_FAILED",
          message: "Failed to generate CSRF token",
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}

// Only allow GET requests
export async function POST() {
  return NextResponse.json(
    {
      error: {
        code: "METHOD_NOT_ALLOWED",
        message: "Only GET requests are allowed",
        timestamp: new Date().toISOString(),
      },
    },
    { status: 405 }
  );
}
