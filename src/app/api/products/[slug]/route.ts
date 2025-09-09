/**
 * API routes for individual product operations
 * Handles GET, PUT, DELETE for specific products by slug
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import {
  Product,
  UpdateProductRequest,
  ProductRow,
  CategoryRow
} from '@/types/product';
import { ApiResponse } from '@/types';
import {
  transformProductRow,
  transformCategoryRow,
  productToRow,
  validateProductData,
  createSlug
} from '@/lib/utils/product-transforms';

interface RouteContext {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * GET /api/products/[slug]
 * Retrieve a single product by slug
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const supabase = createServerClient();
    const { slug } = await params;

    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (
          id,
          name_cs,
          name_en,
          slug,
          description_cs,
          description_en,
          image_url,
          parent_id,
          sort_order,
          active,
          created_at,
          updated_at
        )
      `)
      .eq('slug', slug)
      .eq('active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'PRODUCT_NOT_FOUND',
              message: 'Product not found',
            },
          } as ApiResponse,
          { status: 404 }
        );
      }

      console.error('Error fetching product:', error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FETCH_ERROR',
            message: 'Failed to fetch product',
            details: error.message,
          },
        } as ApiResponse,
        { status: 500 }
      );
    }

    // Transform the data
    const category = data.categories ? transformCategoryRow(data.categories) : undefined;
    const product = transformProductRow(data, category);

    const response: ApiResponse<Product> = {
      success: true,
      data: product,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Unexpected error in GET /api/products/[slug]:', error);
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
 * PUT /api/products/[slug]
 * Update an existing product
 */
export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const supabase = createServerClient();
    const { slug } = await params;
    const body: UpdateProductRequest = await request.json();

    // First, get the existing product
    const { data: existingProduct, error: fetchError } = await supabase
      .from('products')
      .select('id, slug')
      .eq('slug', slug)
      .single();

    if (fetchError || !existingProduct) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PRODUCT_NOT_FOUND',
            message: 'Product not found',
          },
        } as ApiResponse,
        { status: 404 }
      );
    }

    // Validate the update data
    const validation = validateProductData({ ...body, nameCs: body.nameCs || 'temp', nameEn: body.nameEn || 'temp' });
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid product data',
            details: validation.errors,
          },
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Generate new slug if name changed
    let newSlug = slug;
    if (body.nameCs || body.nameEn) {
      const nameForSlug = body.nameCs || body.nameEn || '';
      newSlug = body.slug || createSlug(nameForSlug);

      // Check if new slug conflicts with existing products (excluding current)
      if (newSlug !== slug) {
        const { data: conflictingProduct } = await supabase
          .from('products')
          .select('id')
          .eq('slug', newSlug)
          .neq('id', existingProduct.id)
          .single();

        if (conflictingProduct) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'SLUG_EXISTS',
                message: 'A product with this slug already exists',
              },
            } as ApiResponse,
            { status: 409 }
          );
        }
      }
    }

    // Prepare update data (only include provided fields)
    const updateData: Partial<Omit<ProductRow, 'id' | 'created_at' | 'updated_at'>> = {};

    if (body.nameCs !== undefined) updateData.name_cs = body.nameCs;
    if (body.nameEn !== undefined) updateData.name_en = body.nameEn;
    if (body.slug !== undefined || newSlug !== slug) updateData.slug = newSlug;
    if (body.descriptionCs !== undefined) updateData.description_cs = body.descriptionCs;
    if (body.descriptionEn !== undefined) updateData.description_en = body.descriptionEn;
    if (body.basePrice !== undefined) updateData.base_price = body.basePrice;
    if (body.categoryId !== undefined) updateData.category_id = body.categoryId;
    if (body.images !== undefined) updateData.images = body.images;
    if (body.customizationOptions !== undefined) updateData.customization_options = body.customizationOptions;
    if (body.availability !== undefined) updateData.availability = body.availability;
    if (body.seoMetadata !== undefined) updateData.seo_metadata = body.seoMetadata;
    if (body.active !== undefined) updateData.active = body.active;
    if (body.featured !== undefined) updateData.featured = body.featured;

    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', existingProduct.id)
      .select(`
        *,
        categories (
          id,
          name_cs,
          name_en,
          slug,
          description_cs,
          description_en,
          image_url,
          parent_id,
          sort_order,
          active,
          created_at,
          updated_at
        )
      `)
      .single();

    if (error) {
      console.error('Error updating product:', error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UPDATE_ERROR',
            message: 'Failed to update product',
            details: error.message,
          },
        } as ApiResponse,
        { status: 500 }
      );
    }

    // Transform the response
    const category = data.categories ? transformCategoryRow(data.categories) : undefined;
    const product = transformProductRow(data, category);

    const response: ApiResponse<Product> = {
      success: true,
      data: product,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Unexpected error in PUT /api/products/[slug]:', error);
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
 * DELETE /api/products/[slug]
 * Soft delete a product (set active = false)
 */
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const supabase = createServerClient();
    const { slug } = await params;

    // Check if product exists
    const { data: existingProduct, error: fetchError } = await supabase
      .from('products')
      .select('id')
      .eq('slug', slug)
      .single();

    if (fetchError || !existingProduct) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PRODUCT_NOT_FOUND',
            message: 'Product not found',
          },
        } as ApiResponse,
        { status: 404 }
      );
    }

    // Soft delete by setting active = false
    const { error } = await supabase
      .from('products')
      .update({ active: false })
      .eq('id', existingProduct.id);

    if (error) {
      console.error('Error deleting product:', error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DELETE_ERROR',
            message: 'Failed to delete product',
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
    console.error('Unexpected error in DELETE /api/products/[slug]:', error);
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
