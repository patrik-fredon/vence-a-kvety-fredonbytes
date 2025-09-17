import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { userUtils } from "@/lib/supabase/utils";

export interface AdminUser {
  id: string;
  email: string;
  name?: string;
  role: "admin" | "super_admin";
}

/**
 * Middleware to check if user has admin access
 */
export async function requireAdmin(request: NextRequest): Promise<AdminUser | NextResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 }
      );
    }

    const role = await userUtils.getUserRole(session.user.id);

    if (!role || !["admin", "super_admin"].includes(role)) {
      return NextResponse.json(
        {
          success: false,
          error: "Insufficient permissions. Admin access required.",
        },
        { status: 403 }
      );
    }

    return {
      id: session.user.id,
      email: session.user.email!,
      name: session.user.name || undefined,
      role: role as "admin" | "super_admin",
    };
  } catch (error) {
    console.error("Admin middleware error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

/**
 * Middleware to check if user has super admin access
 */
export async function requireSuperAdmin(request: NextRequest): Promise<AdminUser | NextResponse> {
  const adminCheck = await requireAdmin(request);

  if (adminCheck instanceof NextResponse) {
    return adminCheck;
  }

  if (adminCheck.role !== "super_admin") {
    return NextResponse.json(
      {
        success: false,
        error: "Super admin access required",
      },
      { status: 403 }
    );
  }

  return adminCheck;
}

/**
 * Utility to log admin actions
 */
export async function logAdminAction(
  adminId: string,
  action: string,
  resourceType: string,
  resourceId?: string,
  oldValues?: any,
  newValues?: any,
  request?: NextRequest
) {
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");

    await supabaseAdmin.from("admin_activity_log").insert({
      admin_id: adminId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      old_values: oldValues,
      new_values: newValues,
      ip_address: (request as any)?.ip || request?.headers.get("x-forwarded-for") || null,
      user_agent: request?.headers.get("user-agent") || null,
    });
  } catch (error) {
    console.error("Failed to log admin action:", error);
  }
}

/**
 * Higher-order function to wrap API routes with admin authentication
 */
export function withAdminAuth(
  handler: (request: NextRequest, admin: AdminUser, ...args: any[]) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: any[]) => {
    const adminCheck = await requireAdmin(request);

    if (adminCheck instanceof NextResponse) {
      return adminCheck;
    }

    return handler(request, adminCheck, ...args);
  };
}

/**
 * Higher-order function to wrap API routes with super admin authentication
 */
export function withSuperAdminAuth(
  handler: (request: NextRequest, admin: AdminUser, ...args: any[]) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: any[]) => {
    const adminCheck = await requireSuperAdmin(request);

    if (adminCheck instanceof NextResponse) {
      return adminCheck;
    }

    return handler(request, adminCheck, ...args);
  };
}
