/**
 * API routes for category management
 * Handles CRUD operations for categories
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import {
  Category,
  CreateCategoryRequest,
  CategoryRow
} from '@/types/product';
import { ApiResponse } from '@/types';
import {
  transformCategoryRow,
  categoryToRow,
  validateCategoryData,
  createSlug
} from '@/lib/utils/product-transforms';

/**
 * GET /api/categories
 * Retrieve all categories with optional hierarchy
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);

    const includeInactive = searchParams.get('includeInactive') === 'true';
    const hierarchical = searchParams.get('hierarchical') === 'true';
    const parentId = searchParams.get('parentId');

    let query = supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name_cs', { ascending: true });

    // Filter by active status
    if (!includeInactive) {
      query = query.eq('active', true);
    }

    // Filter by parent ID
    if (parentId) {
      query = query.eq('parent_id', parentId);
    } else if (hierarchical) {
      // Only get root categories for hierarchical view
      query = query.is('parent_id', null);
    }

    const { data: categoriesData, error } = await query;

    if (error) {
      console.error('Error fetching categories:', error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FETCH_ERROR',
            message: 'Failed to fetch categories',
            details: error.message,
          },
        } as ApiResponse,
        { status: 500 }
      );
    }

    // Transform the data
    let categories: Category[] = (categoriesData || []).map(transformCategoryRow);

    // If hierarchical, build the tree structure
    if (hierarchical) {
      categories = await buildCategoryHierarchy(supabase, categories, includeInactive);
    }

    // Add product counts
    for (const category of categories) {
      const { count } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', category.id)
        .eq('active', true);

      category.productCount = count || 0;
    }

    const response: ApiResponse<Category[]> = {
      success: true,
      data: categories,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Unexpected error in GET /api/categories:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
        },
      } as ApiResponse,
      { status: 500 }
    );
  }
}

/**
 * POST /api/categories
 * Create a new category
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const body: CreateCategoryRequest = await request.json();

    // Validate the data
    const validation = validateCategoryData(body);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid category data',
            details: validation.errors,
          },
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Generate slug if not provided
    if (!body.slug) {
      body.slug = createSlug(body.nameCs || body.nameEn);
    }

    // Check if slug already exists
    const { data: existingCategory } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', body.slug)
      .single();

    if (existingCategory) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SLUG_EXISTS',
            message: 'A category with this slug already exists',
          },
        } as ApiResponse,
        { status: 409 }
      );
    }

    // Validate parent category if provided
    if (body.parentId) {
      const { data: parentCategory } = await supabase
        .from('categories')
        .select('id')
        .eq('id', body.parentId)
        .eq('active', true)
        .single();

      if (!parentCategory) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'PARENT_NOT_FOUND',
              message: 'Parent category not found',
            },
          } as ApiResponse,
          { status: 400 }
        );
      }
    }

    // Prepare the data for insertion
    const categoryData = categoryToRow({
      nameCs: body.nameCs,
      nameEn: body.nameEn,
      slug: body.slug,
      descriptionCs: body.descriptionCs,
      descriptionEn: body.descriptionEn,
      imageUrl: body.imageUrl,
      parentId: body.parentId,
      sortOrder: body.sortOrder || 0,
      active: body.active !== undefined ? body.active : true,
    });

    const { data, error } = await supabase
      .from('categories')
      .insert(categoryData)
      .select('*')
      .single();

    if (error) {
      console.error('Error creating category:', error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'CREATE_ERROR',
            message: 'Failed to create category',
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

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in POST /api/categories:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
        },
      } as ApiResponse,
      { status: 500 }
    );
  }
}

/**
 * Helper function to build category hierarchy
 */
async function buildCategoryHierarchy(
  supabase: any,
  rootCategories: Category[],
  includeInactive: boolean
): Promise<Category[]> {
  const categoriesWithChildren = [...rootCategories];

  for (const category of categoriesWithChildren) {
    let childQuery = supabase
      .from('categories')
      .select('*')
      .eq('parent_id', category.id)
      .order('sort_order', { ascending: true })
      .order('name_cs', { ascending: true });

    if (!includeInactive) {
      childQuery = childQuery.eq('active', true);
    }

    const { data: childrenData } = await childQuery;

    if (childrenData && childrenData.length > 0) {
      const children = childrenData.map(transformCategoryRow);
      category.children = await buildCategoryHierarchy(supabase, children, includeInactive);
    }
  }

  return categoriesWithChildren;
}
