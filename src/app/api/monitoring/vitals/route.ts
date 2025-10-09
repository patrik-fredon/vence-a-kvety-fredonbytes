import { type NextRequest, NextResponse } from "next/server";
// import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/utils/rate-limit";

interface WebVitalMetric {
  name: "CLS" | "INP" | "LCP" | "FCP" | "TTFB";
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  id: string;
  navigationType: string;
}

interface VitalsRequest {
  metric: WebVitalMetric;
  url: string;
  userAgent: string;
  timestamp: number;
}

/**
 * POST /api/monitoring/vitals
 * Receives Core Web Vitals metrics from the client
 * Requirements: 7.1, 7.2
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting to prevent abuse
    const rateLimitResult = await rateLimit(request, "general");
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const body = (await request.json()) as VitalsRequest;
    const { metric, url, timestamp } = body;

    // Validate required fields
    if (!metric?.name || typeof metric.value !== "number") {
      return NextResponse.json({ error: "Invalid metric data" }, { status: 400 });
    }

    // Validate metric name
    const validMetrics = ["CLS", "INP", "LCP", "FCP", "TTFB"];
    if (!validMetrics.includes(metric.name)) {
      return NextResponse.json({ error: "Invalid metric name" }, { status: 400 });
    }

    // Log metric for monitoring (in production, this would go to a logging service)
    if (process.env["NODE_ENV"] === "production") {
      console.log("[Web Vitals]", {
        metric: metric.name,
        value: metric.value,
        rating: metric.rating,
        url,
        timestamp: new Date(timestamp).toISOString(),
      });
    }

    // Store in database
    // TODO: Create web_vitals_metrics table in database
    // const supabase = createClient();
    // const { error: insertError } = await supabase.from("web_vitals_metrics").insert({
    //   metric_name: metric.name,
    //   value: metric.value,
    //   rating: metric.rating,
    //   delta: metric.delta,
    //   metric_id: metric.id,
    //   navigation_type: metric.navigationType,
    //   url,
    //   user_agent: userAgent,
    //   created_at: new Date(timestamp).toISOString(),
    // });
    // if (insertError) {
    //   console.error("Error storing Web Vital metric:", insertError);
    // }

    return NextResponse.json({
      success: true,
      message: "Web Vital metric received",
      metric: {
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in vitals endpoint:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * GET /api/monitoring/vitals
 * Retrieve historical Web Vitals data
 *
 * Query params:
 * - hours: number of hours to look back (default: 24)
 * - metric: specific metric to filter (optional)
 */
// export async function GET(request: NextRequest) {
//   // Implementation commented out - requires web_vitals_metrics table
//   return NextResponse.json({ error: "Not implemented" }, { status: 501 });
// }

/**
 * Calculate summary statistics for Web Vitals metrics
 */
// function calculateVitalsSummary(metrics: any[]) {
//   // Implementation commented out
//   return {};
// }
