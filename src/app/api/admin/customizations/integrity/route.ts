import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { auth } from "@/lib/auth/config";
import {
  performCustomizationIntegrityCheck,
  cleanupAbandonedCustomizations
} from "@/lib/cart/utils";

/**
 * GET - Perform customization integrity check
 * Admin-only endpoint to check for customization data integrity issues
 */
export async function GET() {
  try {
    const supabase = createServerClient();
    const session = await auth();

    // Check if user is admin
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 }
      );
    }

    // Get user profile to check admin status
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        {
          success: false,
          error: "User profile not found",
        },
        { status: 403 }
      );
    }

    // Check if user has admin privileges (assuming admin flag in preferences)
    const isAdmin = profile.preferences &&
      typeof profile.preferences === 'object' &&
      'isAdmin' in profile.preferences &&
      profile.preferences['isAdmin'] === true;
    if (!isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: "Admin access required",
        },
        { status: 403 }
      );
    }

    // Perform integrity check
    const integrityResult = await performCustomizationIntegrityCheck(supabase);

    // Also run database-level integrity check
    const { data: dbIntegrityResult, error: dbError } = await supabase
      .rpc('check_customization_integrity' as any);

    if (dbError) {
      console.error("Database integrity check failed:", dbError);
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      applicationLevel: integrityResult,
      databaseLevel: dbIntegrityResult || null,
      dbError: dbError?.message || null,
    });

  } catch (error) {
    console.error("Customization integrity check failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST - Fix integrity issues and cleanup abandoned data
 * Admin-only endpoint to fix customization integrity issues
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const session = await auth();
    const body = await request.json();

    // Check if user is admin
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 }
      );
    }

    // Get user profile to check admin status
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        {
          success: false,
          error: "User profile not found",
        },
        { status: 403 }
      );
    }

    // Check if user has admin privileges
    const isAdmin = profile.preferences &&
      typeof profile.preferences === 'object' &&
      'isAdmin' in profile.preferences &&
      profile.preferences.isAdmin === true;
    if (!isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: "Admin access required",
        },
        { status: 403 }
      );
    }

    const results: any = {
      timestamp: new Date().toISOString(),
      operations: [],
    };

    // Cleanup abandoned customizations if requested
    if (body.cleanupAbandoned !== false) {
      const daysOld = body.daysOld || 7;
      const cleanupResult = await cleanupAbandonedCustomizations(supabase, daysOld);
      results.operations.push({
        type: 'cleanup_abandoned',
        result: cleanupResult,
      });
    }

    // Fix integrity issues if requested
    if (body.fixIntegrityIssues === true) {
      const { data: dbFixResult, error: dbFixError } = await supabase
        .rpc('cleanup_invalid_customizations' as any);

      results.operations.push({
        type: 'fix_integrity_issues',
        result: dbFixResult || null,
        error: dbFixError?.message || null,
      });
    }

    // Run post-cleanup integrity check
    if (body.runPostCheck !== false) {
      const postCheckResult = await performCustomizationIntegrityCheck(supabase);
      results.postCheck = postCheckResult;
    }

    return NextResponse.json({
      success: true,
      ...results,
    });

  } catch (error) {
    console.error("Customization integrity fix failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
