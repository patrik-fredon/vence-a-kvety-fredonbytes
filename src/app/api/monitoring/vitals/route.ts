import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
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
    const { metric, url, userAgent, timestamp } = body;

    // Validate required fields
    if (!metric || !metric.name || typeof metric.value !== "number") {
      return NextResponse.json({ error: "Invalid metric data" }, { status: 400 });
    }

    // Validate metric name
    const validMetrics = ["CLS", "INP", "LCP", "FCP", "TTFB"];
    if (!validMetrics.includes(metric.name)) {
      return NextResponse.json({ error: "Invalid metric name" }, { status: 400 });
    }

    // Log metric for monitoring (in production, this would go to a logging service)
    if (process.env.NODE_ENV === "production") {
      console.log("[Web Vitals]", {
        metric: metric.name,
        value: metric.value,
        rating: metric.rating,
        url,
        timestamp: new Date(timestamp).toISOString(),
      });
    }

    // Store in database
    const supabase = createClient();
    const { error: insertError } = await supabase.from("web_vitals_metrics").insert({
      metric_name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      metric_id: metric.id,
      navigation_type: metric.navigationType,
      url,
      user_agent: userAgent,
      created_at: new Date(timestamp).toISOString(),
    });

    if (insertError) {
      console.error("Error storing Web Vital metric:", insertError);
      // Don't fail the request if storage fails
    }

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
 * Retrieves Core Web Vitals summary
 * Query params:
 * - hours: number of hours to look back (default: 24)
 * - metric: specific metric to filter (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hours = Number.parseInt(searchParams.get("hours") || "24", 10);
    const metricFilter = searchParams.get("metric");

    const supabase = createClient();

    // Calculate time range
    const startTime = new Date();
    startTime.setHours(startTime.getHours() - hours);

    let query = supabase
      .from("web_vitals_metrics")
      .select("*")
      .gte("created_at", startTime.toISOString())
      .order("created_at", { ascending: false })
      .limit(1000);

    if (metricFilter) {
      query = query.eq("metric_name", metricFilter);
    }

    const { data: metrics, error } = await query;

    if (error) {
      console.error("Error fetching Web Vitals:", error);
      return NextResponse.json({ error: "Failed to fetch metrics" }, { status: 500 });
    }

    // Calculate summary statistics
    const summary = calculateVitalsSummary(metrics || []);

    return NextResponse.json({
      success: true,
      metrics: metrics || [],
      summary,
      count: metrics?.length || 0,
      timeRange: {
        hours,
        start: startTime.toISOString(),
        end: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching vitals:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * Calculate summary statistics for Web Vitals metrics
 */
function calculateVitalsSummary(metrics: any[]) {
  if (metrics.length === 0) {
    return {
      averageValues: {},
      ratingDistribution: { good: 0, "needs-improvement": 0, poor: 0 },
      metricCounts: {},
      totalMetrics: 0,
    };
  }

  // Group by metric name
  const metricsByName = metrics.reduce(
    (acc, metric) => {
      if (!acc[metric.metric_name]) {
        acc[metric.metric_name] = [];
      }
      acc[metric.metric_name].push(metric);
      return acc;
    },
    {} as Record<string, any[]>
  );

  // Calculate averages
  const averageValues: Record<string, number> = {};
  const metricCounts: Record<string, number> = {};
  
  Object.entries(metricsByName).forEach(([name, values]) => {
    const metricValues = values as any[];
    const sum = metricValues.reduce((acc, metric) => acc + Number(metric.value), 0);
    averageValues[name] = Math.round((sum / metricValues.length) * 100) / 100;
    metricCounts[name] = metricValues.length;
  });

  // Calculate rating distribution
  const ratingDistribution = metrics.reduce(
    (acc, metric) => {
      acc[metric.rating] = (acc[metric.rating] || 0) + 1;
      return acc;
    },
    { good: 0, "needs-improvement": 0, poor: 0 }
  );

  return {
    averageValues,
    ratingDistribution,
    metricCounts,
    totalMetrics: metrics.length,
  };
}
