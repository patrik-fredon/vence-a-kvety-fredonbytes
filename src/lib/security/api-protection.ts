/**
 * API Route Protection Utilities
 * Provides middleware functions for securing API routes
 */

import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { logUserActivity } from "./gdpr";
import { validateCSRFToken } from "./validation";

export interface SecurityOptions {
  requireAuth?: boolean;
  requireAdmin?: boolean;
  requireCSRF?: boolean;
  rateLimit?: {
    requests: number;
    window: string; // e.g., "1m", "1h"
  };
  allowedMethods?: string[];
  logActivity?: boolean;
}

export interface SecurityContext {
  user: {
    id: string;
    email: string | undefined;
    role: string | undefined;
  } | undefined;
  clientIP: string;
  userAgent: string;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

/**
 * Secure API route wrapper
 */
export function withSecurity(
  handler: (request: NextRequest, context: SecurityContext) => Promise<NextResponse>,
  options: SecurityOptions = {}
) {
  return async (request: NextRequest) => {
    try {
      const {
        requireAuth = false,
        requireAdmin = false,
        requireCSRF = false,
        allowedMethods = ["GET", "POST", "PUT", "DELETE"],
        logActivity = false,
      } = options;

      // Check allowed methods
      if (!allowedMethods.includes(request.method)) {
        return NextResponse.json(
          {
            error: {
              code: "METHOD_NOT_ALLOWED",
              message: `Method ${request.method} not allowed`,
              allowedMethods,
              timestamp: new Date().toISOString(),
            },
          },
          { status: 405 }
        );
      }

      // Get client information
      const clientIP =
        request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "unknown";
      const userAgent = request.headers.get("user-agent") ?? "unknown";

      // Check authentication if required
      let user: SecurityContext["user"];
      let isAuthenticated = false;
      let isAdmin = false;

      if (requireAuth || requireAdmin) {
        const session = await auth();

        if (!session?.user?.id) {
          return NextResponse.json(
            {
              error: {
                code: "UNAUTHORIZED",
                message: "Authentication required",
                timestamp: new Date().toISOString(),
              },
            },
            { status: 401 }
          );
        }

        user = {
          id: session.user.id,
          email: session.user.email || undefined,
          role: (session.user as any).role || "user",
        };
        isAuthenticated = true;

        // Check admin role if required
        if (requireAdmin) {
          try {
            const { userUtils } = await import("@/lib/supabase/utils");
            isAdmin = await userUtils.isAdmin(user.id);

            if (!isAdmin) {
              return NextResponse.json(
                {
                  error: {
                    code: "FORBIDDEN",
                    message: "Admin access required",
                    timestamp: new Date().toISOString(),
                  },
                },
                { status: 403 }
              );
            }
          } catch (error) {
            console.error("Error checking admin role:", error);
            return NextResponse.json(
              {
                error: {
                  code: "INTERNAL_ERROR",
                  message: "Failed to verify admin access",
                  timestamp: new Date().toISOString(),
                },
              },
              { status: 500 }
            );
          }
        }
      }

      // Check CSRF token if required
      if (requireCSRF && ["POST", "PUT", "DELETE", "PATCH"].includes(request.method)) {
        const isValidCSRF = await validateCSRFToken(request);
        if (!isValidCSRF) {
          return NextResponse.json(
            {
              error: {
                code: "INVALID_CSRF_TOKEN",
                message: "Invalid or missing CSRF token",
                timestamp: new Date().toISOString(),
              },
            },
            { status: 403 }
          );
        }
      }

      // Create security context
      const context: SecurityContext = {
        user,
        clientIP,
        userAgent,
        isAuthenticated,
        isAdmin,
      };

      // Log activity if required
      if (logActivity && user?.id) {
        await logUserActivity(
          user.id,
          `api_${request.method.toLowerCase()}_${request.nextUrl.pathname}`,
          {
            method: request.method,
            path: request.nextUrl.pathname,
            query: Object.fromEntries(request.nextUrl.searchParams),
          },
          clientIP
        );
      }

      // Call the actual handler
      return await handler(request, context);
    } catch (error) {
      console.error("Security middleware error:", error);

      return NextResponse.json(
        {
          error: {
            code: "INTERNAL_ERROR",
            message: "An unexpected security error occurred",
            timestamp: new Date().toISOString(),
          },
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Input sanitization middleware
 */
export async function sanitizeRequestBody(request: NextRequest): Promise<any> {
  try {
    const body = await request.json();
    return sanitizeObject(body);
  } catch (error) {
    throw new Error("Invalid JSON body");
  }
}

/**
 * Recursively sanitize an object
 */
function sanitizeObject(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === "string") {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (typeof obj === "object") {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[sanitizeString(key)] = sanitizeObject(value);
    }
    return sanitized;
  }

  return obj;
}

/**
 * Sanitize string input
 */
function sanitizeString(input: string): string {
  if (typeof input !== "string") {
    return input;
  }

  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove script tags
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, "") // Remove event handlers
    .trim();
}

/**
 * Create standardized error response
 */
export function createErrorResponse(
  code: string,
  message: string,
  status: number = 400,
  details?: any
) {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        details,
        timestamp: new Date().toISOString(),
      },
    },
    { status }
  );
}

/**
 * Create standardized success response
 */
export function createSuccessResponse(data: any, message?: string) {
  return NextResponse.json({
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Validate request origin
 */
export function validateOrigin(request: NextRequest, allowedOrigins: string[]): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  if (!(origin || referer)) {
    return false; // Reject requests without origin/referer
  }

  const requestOrigin = origin || (referer ? new URL(referer).origin : null);

  if (!requestOrigin) {
    return false;
  }

  return allowedOrigins.includes(requestOrigin);
}

/**
 * Check for suspicious request patterns
 */
export function detectSuspiciousActivity(request: NextRequest, context: SecurityContext): boolean {
  const suspiciousPatterns = [
    // SQL injection patterns
    /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/i,
    // XSS patterns
    /<script|javascript:|on\w+\s*=/i,
    // Path traversal
    /\.\.\//,
    // Command injection
    /[;&|`$()]/,
  ];

  const url = request.nextUrl.toString();
  const userAgent = context.userAgent.toLowerCase();

  // Check URL for suspicious patterns
  if (suspiciousPatterns.some((pattern) => pattern.test(url))) {
    return true;
  }

  // Check for suspicious user agents
  const suspiciousUserAgents = ["sqlmap", "nikto", "nessus", "burp", "nmap", "masscan", "zap"];

  if (suspiciousUserAgents.some((agent) => userAgent.includes(agent))) {
    return true;
  }

  return false;
}

/**
 * Log security event
 */
export async function logSecurityEvent(
  event: string,
  details: any,
  context: SecurityContext,
  severity: "low" | "medium" | "high" = "medium"
) {
  try {
    console.warn(`Security Event [${severity.toUpperCase()}]: ${event}`, {
      details,
      context: {
        clientIP: context.clientIP,
        userAgent: context.userAgent,
        userId: context.user?.id,
        timestamp: new Date().toISOString(),
      },
    });

    // In a production environment, you might want to send this to a security monitoring service
    // await sendToSecurityMonitoring(event, details, context, severity);
  } catch (error) {
    console.error("Failed to log security event:", error);
  }
}
