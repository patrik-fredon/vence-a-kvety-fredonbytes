/**
 * GDPR Consent Management API Route
 * Allows users to view and update their consent preferences
 */

import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import {
  checkUserConsent,
  logUserActivity,
  updateUserConsent,
} from "@/lib/security/gdpr";
import {
  validateCSRFToken,
  validateRequestBody,
} from "@/lib/security/validation";

// Removed unused ConsentUpdateBody interface

export async function GET() {
  try {
    // Verify authentication
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

    const userId = session.user.id;

    // Get current consent settings
    const consent = await checkUserConsent(userId);

    return NextResponse.json({
      success: true,
      consent,
    });
  } catch (error) {
    console.error("Error fetching consent:", error);

    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch consent preferences",
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
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

    // Validate CSRF token
    const isValidCSRF = await validateCSRFToken(request);
    if (!isValidCSRF) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_CSRF_TOKEN",
            message: "Invalid CSRF token",
            timestamp: new Date().toISOString(),
          },
        },
        { status: 403 }
      );
    }

    // Validate request body
    const bodyValidation = await validateRequestBody(request, (body: any) => {
      const errors = [];

      if (typeof body.marketing !== "boolean") {
        errors.push({
          field: "marketing",
          message: "Marketing consent must be a boolean",
          code: "INVALID_TYPE",
        });
      }

      if (typeof body.analytics !== "boolean") {
        errors.push({
          field: "analytics",
          message: "Analytics consent must be a boolean",
          code: "INVALID_TYPE",
        });
      }

      if (typeof body.functional !== "boolean") {
        errors.push({
          field: "functional",
          message: "Functional consent must be a boolean",
          code: "INVALID_TYPE",
        });
      }

      if (errors.length > 0) {
        return { isValid: false, errors };
      }

      return {
        isValid: true,
        data: {
          marketing: body.marketing,
          analytics: body.analytics,
          functional: body.functional,
        },
        errors: [],
      };
    });

    if (!bodyValidation.isValid) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid consent data",
            details: bodyValidation.errors,
            timestamp: new Date().toISOString(),
          },
        },
        { status: 400 }
      );
    }

    const userId = session.user.id;
    const clientIP =
      request.headers.get("x-forwarded-for") ??
      request.headers.get("x-real-ip") ??
      "unknown";
    const consentData = bodyValidation.data;

    if (!consentData) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_DATA",
            message: "Consent data is required",
            timestamp: new Date().toISOString(),
          },
        },
        { status: 400 }
      );
    }

    // Update consent preferences
    const success = await updateUserConsent(userId, consentData);

    if (!success) {
      return NextResponse.json(
        {
          error: {
            code: "UPDATE_FAILED",
            message: "Failed to update consent preferences",
            timestamp: new Date().toISOString(),
          },
        },
        { status: 500 }
      );
    }

    // Log the consent update
    await logUserActivity(
      userId,
      "consent_preferences_updated",
      consentData,
      clientIP
    );

    return NextResponse.json({
      success: true,
      message: "Consent preferences updated successfully",
      consent: consentData,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating consent:", error);

    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "An unexpected error occurred while updating consent",
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}
