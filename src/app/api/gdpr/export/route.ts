/**
 * GDPR Data Export API Route
 * Allows users to export all their personal data
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { exportUserData, logUserActivity } from "@/lib/security/gdpr";
import { validateCSRFToken } from "@/lib/security/validation";

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

    const userId = session.user.id;
    const clientIP = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "unknown";

    // Log the data export request
    await logUserActivity(userId, "gdpr_data_export_requested", {}, clientIP);

    // Export user data
    const exportData = await exportUserData(userId);

    if (!exportData) {
      return NextResponse.json(
        {
          error: {
            code: "EXPORT_FAILED",
            message: "Failed to export user data",
            timestamp: new Date().toISOString(),
          },
        },
        { status: 500 }
      );
    }

    // Log successful export
    await logUserActivity(userId, "gdpr_data_export_completed", {
      recordsExported: {
        orders: exportData.orders.length,
        cartItems: exportData.cartItems.length,
        addresses: exportData.addresses.length,
        activityLog: exportData.activityLog.length,
      },
    }, clientIP);

    // Return the export data
    return NextResponse.json({
      success: true,
      data: exportData,
      exportedAt: new Date().toISOString(),
      message: "Data export completed successfully",
    });

  } catch (error) {
    console.error("GDPR export error:", error);

    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "An unexpected error occurred during data export",
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
