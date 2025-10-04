import { type NextRequest, NextResponse } from "next/server";
import {
  generateOrganizationStructuredData,
  generateProductStructuredData,
  generateWebsiteStructuredData,
} from "@/components/seo/StructuredData";
import {
  auditPageSEO,
  validatePageMetadata,
  validateSitemap,
  validateStructuredData,
} from "@/lib/seo/validation";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const testType = searchParams.get("type") || "all";
  const productSlug = searchParams.get("product");

  try {
    const results: any = {
      timestamp: new Date().toISOString(),
      testType,
      results: {},
    };

    if (testType === "all" || testType === "metadata") {
      // Test homepage metadata
      const homepageMetadata = {
        title: "Pohřební věnce | Ketingmar s.r.o. | Prémiové květinové aranžmá",
        description:
          "Prémiové pohřební věnce a květinové aranžmá. Ruční výroba, pečlivý výběr květin, rychlé dodání.",
        keywords: ["pohřební věnce", "květinové aranžmá", "pohřeb"],
        url: "https://pohrebni-vence.cz/cs",
        image: "/og-homepage.jpg",
      };

      results.results.homepageMetadata = validatePageMetadata(homepageMetadata);
    }

    if (testType === "all" || testType === "structured-data") {
      // Test structured data
      const organizationData = generateOrganizationStructuredData("cs");
      const websiteData = generateWebsiteStructuredData("cs");

      results.results.organizationStructuredData = validateStructuredData(organizationData);
      results.results.websiteStructuredData = validateStructuredData(websiteData);

      // Test product structured data if product slug provided
      if (productSlug) {
        const supabase = createServerClient();
        const { data: product } = await supabase
          .from("products")
          .select("name_cs, description_cs, base_price, images, slug")
          .eq("slug", productSlug)
          .eq("active", true)
          .single();

        if (product) {
          const productImages = product.images as any[];
          const productData = generateProductStructuredData(
            {
              name: product.name_cs,
              description: product.description_cs || product.name_cs,
              price: product.base_price,
              image: productImages?.[0]?.url,
              availability: "InStock",
              url: `https://pohrebni-vence.cz/cs/products/${product.slug}`,
              sku: product.slug,
            },
            "cs"
          );

          results.results.productStructuredData = validateStructuredData(productData);
        }
      }
    }

    if (testType === "all" || testType === "sitemap") {
      // Test sitemap structure (sample)
      const sampleSitemap = [
        {
          url: "https://pohrebni-vence.cz/cs",
          lastModified: new Date(),
          changeFrequency: "daily",
          priority: 1.0,
        },
        {
          url: "https://pohrebni-vence.cz/cs/products",
          lastModified: new Date(),
          changeFrequency: "hourly",
          priority: 0.9,
        },
      ];

      results.results.sitemapValidation = validateSitemap(sampleSitemap);
    }

    if (testType === "all" || testType === "audit") {
      // Comprehensive audit
      const auditParams = {
        metadata: {
          title: "Test Product | Pohřební věnce",
          description: "Test product description for SEO audit",
          keywords: ["test", "product", "pohřební věnce"],
          url: "https://pohrebni-vence.cz/cs/products/test",
          image: "/test-image.jpg",
        },
        structuredData: [
          generateOrganizationStructuredData("cs"),
          generateWebsiteStructuredData("cs"),
        ],
        content: `
          <h1>Test Product</h1>
          <p>This is a test product description with more than 300 words to meet SEO requirements.
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt
          ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
          ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur
          sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim
          id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium
          doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et
          quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia
          voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui
          ratione voluptatem sequi nesciunt.</p>
          <img src="/test.jpg" alt="Test image" />
          <h2>Features</h2>
          <p>Additional content about features and benefits.</p>
        `,
      };

      results.results.comprehensiveAudit = auditPageSEO(auditParams);
    }

    // Add summary
    const allResults = Object.values(results.results);
    const totalScore = allResults.reduce(
      (sum: number, result: any) => sum + (result.score || 0),
      0
    );
    const averageScore = allResults.length > 0 ? Math.round(totalScore / allResults.length) : 0;
    const totalErrors = allResults.reduce(
      (sum: number, result: any) => sum + (result.errors?.length || 0),
      0
    );
    const totalWarnings = allResults.reduce(
      (sum: number, result: any) => sum + (result.warnings?.length || 0),
      0
    );

    results.summary = {
      averageScore,
      totalErrors,
      totalWarnings,
      overallStatus: totalErrors === 0 ? "PASS" : "FAIL",
      recommendations:
        totalErrors > 0 || averageScore < 80
          ? [
              "Review and fix all errors before deployment",
              "Address warnings to improve SEO score",
              "Test with Google Search Console after deployment",
              "Monitor Core Web Vitals and page performance",
            ]
          : [
              "SEO implementation looks good!",
              "Monitor performance after deployment",
              "Consider A/B testing different meta descriptions",
            ],
    };

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error("SEO test error:", error);
    return NextResponse.json(
      {
        error: "SEO test failed",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Development helper endpoint - only available in development
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { type, data } = body;

    let result;
    switch (type) {
      case "metadata":
        result = validatePageMetadata(data);
        break;
      case "structured-data":
        result = validateStructuredData(data);
        break;
      case "sitemap":
        result = validateSitemap(data);
        break;
      default:
        return NextResponse.json({ error: "Invalid test type" }, { status: 400 });
    }

    return NextResponse.json({
      type,
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Validation failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
