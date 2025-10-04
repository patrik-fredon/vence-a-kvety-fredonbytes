import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/utils/rate-limit";

interface PerformanceMetricRequest {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  timestamp: number;
  url: string;
  id: string;
}

interface PerformanceDataRequest {
  metrics: PerformanceMetricRequest[];
  userAgent: string;
  timestamp: number;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(request, "general");
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const body = (await request.json()) as PerformanceDataRequest;
    const { metrics, userAgent } = body;

    if (!(metrics && Array.isArray(metrics))) {
      return NextResponse.json({ error: "Invalid metrics data" }, { status: 400 });
    }

    const supabase = createClient();

    // Insert performance metrics
    const metricsToInsert = metrics.map((metric) => ({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      timestamp: new Date(metric.timestamp).toISOString(),
      url: metric.url,
      metric_id: metric.id,
      user_agent: userAgent,
      created_at: new Date().toISOString(),
    }));

    const { error: insertError } = await supabase
      .from("performance_metrics")
      .insert(metricsToInsert);

    if (insertError) {
      console.error("Error inserting performance metrics:", insertError);
      return NextResponse.json({ error: "Failed to store performance metrics" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Performance metrics stored successfully",
      count: metrics.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in performance monitoring endpoint:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hours = Number.parseInt(searchParams.get("hours") || "24", 10);
    const limit = Number.parseInt(searchParams.get("limit") || "100", 10);
    const metric = searchParams.get("metric");

    const supabase = createClient();

    // Calculate time range
    const startTime = new Date();
    startTime.setHours(startTime.getHours() - hours);

    let query = supabase
      .from("performance_metrics")
      .select("*")
      .gte("timestamp", startTime.toISOString())
      .order("timestamp", { ascending: false })
      .limit(limit);

    if (metric) {
      query = query.eq("name", metric);
    }

    const { data: metrics, error } = await query;

    if (error) {
      console.error("Error fetching performance metrics:", error);
      return NextResponse.json({ error: "Failed to fetch performance metrics" }, { status: 500 });
    }

    // Calculate summary statistics
    const summary = calculatePerformanceSummary(metrics || []);

    return NextResponse.json({
      success: true,
      metrics: metrics || [],
      summary,
      count: metrics?.length || 0,
      timeRange: {
        start: startTime.toISOString(),
        end: new Date().toISOString(),
        hours,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in performance data fetch:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function calculatePerformanceSummary(metrics: any[]) {
  if (metrics.length === 0) {
    return {
      averageValues: {},
      ratingDistribution: { good: 0, "needs-improvement": 0, poor: 0 },
      totalMetrics: 0,
    };
  }

  const metricsByName = metrics.reduce(
    (acc, metric) => {
      if (!acc[metric.name]) {
        acc[metric.name] = [];
      }
      acc[metric.name].push(metric);
      return acc;
    },
    {} as Record<string, any[]>
  );

  const averageValues: Record<string, number> = {};
  Object.entries(metricsByName).forEach(([name, values]) => {
    const metricValues = values as any[];
    const sum = metricValues.reduce((acc, metric) => acc + metric.value, 0);
    averageValues[name] = Math.round((sum / metricValues.length) * 100) / 100;
  });

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
    totalMetrics: metrics.length,
  };
}
