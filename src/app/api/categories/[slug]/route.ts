/**
 * API routes for individual category operations
 * Handles GET, PUT, DELETE for specific categories by slug
 */

import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import {
  createSlug,
  transformCategoryRow,
  validateCategoryData,
} from "@/lib/utils/product-transforms";
import type { ApiResponse } from "@/types";
import type { Category, CategoryRow, UpdateCategoryRequest } from "@/types/product";

interface RouteContext {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * GET /api/categories/[slug]
 * Retrieve a single category by slug
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const supabase = createServerClient();
    const { slug } = await params;
    const { searchParams } = new URL(request.url);

    const includeChildren = searchParams.get("includeChildren") === "true";
    const includeProducts = searchParams.get("includeProducts") === "true";

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("slug", slug)
      .eq("active", true)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "CATEGORY_NOT_FOUND",
              message: "Category not found",
            },
          } as ApiResponse,
          { status: 404 }
        );
      }

      console.error("Error fetching category:", error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FETCH_ERROR",
            message: "Failed to fetch category",
            details: error.message,
          },
        } as ApiResponse,
        { status: 500 }
      );
    }

    // Transform the data
    const category = transformCategoryRow(data);

    // Include children if requested
    if (includeChildren) {
      const { data: childrenData } = await supabase
        .from("categories")
        .select("*")
        .eq("parent_id", category.id)
        .eq("active", true)
        .order("sort_order", { ascending: true })
        .order("name_cs", { ascending: true });

      if (childrenData) {
        category.children = childrenData.map(transformCategoryRow);
      }
    }

    // Include product count
    const { count } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("category_id", category.id)
      .eq("active", true);

    category.productCount = count || 0;

    const response: ApiResponse<Category> = {
      success: true,
      data: category,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Unexpected error in GET /api/categories/[slug]:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Internal server error",
        },
      } as ApiResponse,
      { status: 500 }
    );
  }
}

/**
 * PUT /api/categories/[slug]
 * Update an existing category
 */
export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const supabase = createServerClient();
    const { slug } = await params;
    const body: UpdateCategoryRequest = await request.json();

    // First, get the existing category
    const { data: existingCategory, error: fetchError } = await supabase
      .from("categories")
      .select("id, slug")
      .eq("slug", slug)
      .single();

    if (fetchError || !existingCategory) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CATEGORY_NOT_FOUND",
            message: "Category not found",
          },
        } as ApiResponse,
        { status: 404 }
      );
    }

    // Validate the update data
    const validation = validateCategoryData({
      ...body,
      nameCs: body.nameCs || "temp",
      nameEn: body.nameEn || "temp",
    });
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid category data",
            details: validation.errors,
          },
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Generate new slug if name changed
    let newSlug = slug;
    if (body.nameCs || body.nameEn) {
      const nameForSlug = body.nameCs || body.nameEn || "";
      newSlug = body.slug || createSlug(nameForSlug);

      // Check if new slug conflicts with existing categories (excluding current)
      if (newSlug !== slug) {
        const { data: conflictingCategory } = await supabase
          .from("categories")
          .select("id")
          .eq("slug", newSlug)
          .neq("id", existingCategory.id)
          .single();

        if (conflictingCategory) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: "SLUG_EXISTS",
                message: "A category with this slug already exists",
              },
            } as ApiResponse,
            { status: 409 }
          );
        }
      }
    }

    // Validate parent category if provided
    if (body.parentId) {
      // Check if parent exists
      const { data: parentCategory } = await supabase
        .from("categories")
        .select("id")
        .eq("id", body.parentId)
        .eq("active", true)
        .single();

      if (!parentCategory) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "PARENT_NOT_FOUND",
              message: "Parent category not found",
            },
          } as ApiResponse,
          { status: 400 }
        );
      }

      // Prevent circular references
      if (body.parentId === existingCategory.id) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "CIRCULAR_REFERENCE",
              message: "Category cannot be its own parent",
            },
          } as ApiResponse,
          { status: 400 }
        );
      }
    }

    // Prepare update data (only include provided fields)
    const updateData: Partial<Omit<CategoryRow, "id" | "created_at" | "updated_at">> = {};

    if (body.nameCs !== undefined) updateData.name_cs = body.nameCs;
    if (body.nameEn !== undefined) updateData.name_en = body.nameEn;
    if (body.slug !== undefined || newSlug !== slug) updateData.slug = newSlug;
    if (body.descriptionCs !== undefined) updateData.description_cs = body.descriptionCs;
    if (body.descriptionEn !== undefined) updateData.description_en = body.descriptionEn;
    if (body.imageUrl !== undefined) updateData.image_url = body.imageUrl;
    if (body.parentId !== undefined) updateData.parent_id = body.parentId;
    if (body.sortOrder !== undefined) updateData.sort_order = body.sortOrder;
    if (body.active !== undefined) updateData.active = body.active;

    const { data, error } = await supabase
      .from("categories")
      .update(updateData)
      .eq("id", existingCategory.id)
      .select("*")
      .single();

    if (error) {
      console.error("Error updating category:", error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UPDATE_ERROR",
            message: "Failed to update category",
            details: error.message,
          },
        } as ApiResponse,
        { status: 500 }
      );
    }

    // Transform the response
    const category = transformCategoryRow(data);

    const response: ApiResponse<Category> = {
      success: true,
      data: category,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Unexpected error in PUT /api/categories/[slug]:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Internal server error",
        },
      } as ApiResponse,
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/categories/[slug]
 * Soft delete a category (set active = false)
 */
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const supabase = createServerClient();
    const { slug } = await params;

    // Check if category exists
    const { data: existingCategory, error: fetchError } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", slug)
      .single();

    if (fetchError || !existingCategory) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CATEGORY_NOT_FOUND",
            message: "Category not found",
          },
        } as ApiResponse,
        { status: 404 }
      );
    }

    // Check if category has products
    const { count: productCount } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("category_id", existingCategory.id)
      .eq("active", true);

    if (productCount && productCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CATEGORY_HAS_PRODUCTS",
            message: "Cannot delete category that contains products",
            details: { productCount },
          },
        } as ApiResponse,
        { status: 409 }
      );
    }

    // Check if category has child categories
    const { count: childCount } = await supabase
      .from("categories")
      .select("*", { count: "exact", head: true })
      .eq("parent_id", existingCategory.id)
      .eq("active", true);

    if (childCount && childCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CATEGORY_HAS_CHILDREN",
            message: "Cannot delete category that has child categories",
            details: { childCount },
          },
        } as ApiResponse,
        { status: 409 }
      );
    }

    // Soft delete by setting active = false
    const { error } = await supabase
      .from("categories")
      .update({ active: false })
      .eq("id", existingCategory.id);

    if (error) {
      console.error("Error deleting category:", error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "DELETE_ERROR",
            message: "Failed to delete category",
            details: error.message,
          },
        } as ApiResponse,
        { status: 500 }
      );
    }

    const response: ApiResponse = {
      success: true,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Unexpected error in DELETE /api/categories/[slug]:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Internal server error",
        },
      } as ApiResponse,
      { status: 500 }
    );
  }
}
