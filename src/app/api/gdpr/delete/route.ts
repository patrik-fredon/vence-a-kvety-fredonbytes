/**
 * GDPR Data Deletion API Route
 * Allows users to request deletion of all their personal data
 */

import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { deleteUserData, logUserActivity } from "@/lib/security/gdpr";
import {
  type ValidationResult,
  validateCSRFToken,
  validateRequestBody,
  validateRequiredString,
} from "@/lib/security/validation";

interface DeleteRequestBody {
  confirmation: string;
  reason?: string;
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
    const bodyValidation = await validateRequestBody(
      request,
      (body: any): ValidationResult<DeleteRequestBody> => {
        const confirmationResult = validateRequiredString(body.confirmation, "confirmation");
        const reasonResult = body.reason
          ? validateRequiredString(body.reason, "reason", 500)
          : { isValid: true, data: undefined, errors: [] };

        // Collect all errors
        const allErrors = [...confirmationResult.errors, ...reasonResult.errors];

        if (!confirmationResult.isValid) {
          return {
            isValid: false,
            errors: allErrors,
          };
        }

        if (confirmationResult.data !== "DELETE_MY_DATA") {
          return {
            isValid: false,
            errors: [
              ...allErrors,
              {
                field: "confirmation",
                message: "Invalid confirmation text. Please type 'DELETE_MY_DATA' to confirm.",
                code: "INVALID_CONFIRMATION",
              },
            ],
          };
        }

        if (!reasonResult.isValid) {
          return {
            isValid: false,
            errors: allErrors,
          };
        }

        return {
          isValid: true,
          data: {
            confirmation: confirmationResult.data,
            reason: reasonResult.data || "",
          },
          errors: [],
        };
      }
    );

    if (!bodyValidation.isValid) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request data",
            details: bodyValidation.errors,
            timestamp: new Date().toISOString(),
          },
        },
        { status: 400 }
      );
    }

    const userId = session.user.id;
    const clientIP =
      request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "unknown";
    const { reason } = bodyValidation.data!;

    // Log the deletion request
    await logUserActivity(userId, "gdpr_data_deletion_requested", { reason }, clientIP);

    // Delete user data
    const deletionResult = await deleteUserData(userId);

    if (!deletionResult.success) {
      // Log failed deletion
      await logUserActivity(
        userId,
        "gdpr_data_deletion_failed",
        {
          errors: deletionResult.errors,
        },
        clientIP
      );

      return NextResponse.json(
        {
          error: {
            code: "DELETION_FAILED",
            message: "Failed to delete user data",
            details: deletionResult.errors,
            timestamp: new Date().toISOString(),
          },
        },
        { status: 500 }
      );
    }

    // Note: We can't log successful deletion since the user will be deleted
    // The deletion result will be returned to confirm the operation

    return NextResponse.json({
      success: true,
      message: "Your data has been successfully deleted",
      deletedRecords: deletionResult.deletedRecords,
      deletedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("GDPR deletion error:", error);

    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "An unexpected error occurred during data deletion",
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}

// Only allow POST requests
export async function GET() {
  return NextResponse.json(
    {
      error: {
        code: "METHOD_NOT_ALLOWED",
        message: "Only POST requests are allowed",
        timestamp: new Date().toISOString(),
      },
    },
    { status: 405 }
  );
}
