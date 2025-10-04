import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = createServerClient();

    console.log(`🔍 Debug: Looking for product with slug: ${slug}`);

    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        categories (
          id,
          name_cs,
          name_en,
          slug
        )
      `)
      .eq("slug", slug)
      .eq("active", true)
      .single();

    console.log(`🔍 Debug: Query result:`, { data: !!data, error: error?.message });

    if (error) {
      console.error(`❌ Debug: Database error:`, error);
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          slug,
        },
        { status: 404 }
      );
    }

    if (!data) {
      console.log(`❌ Debug: No product found for slug: ${slug}`);
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
          slug,
        },
        { status: 404 }
      );
    }

    console.log(`✅ Debug: Product found:`, data.name_cs, data.name_en);

    return NextResponse.json({
      success: true,
      product: {
        id: data.id,
        slug: data.slug,
        name_cs: data.name_cs,
        name_en: data.name_en,
        active: data.active,
        featured: data.featured,
        category: data.categories,
      },
    });
  } catch (error) {
    console.error(`💥 Debug: Unexpected error:`, error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
