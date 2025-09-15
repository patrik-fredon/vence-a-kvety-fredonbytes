import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/utils/rate-limit';

interface PerformanceMetricRequest {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
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
    const rateLimitResult = await rateLimit(request, 'performance-monitoring');
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many performance reports. Please try again later.' },
        { status: 429 }
      );
    }

    const data: PerformanceDataRequest = await request.json();

    if (!data.metrics || !Array.isArray(data.metrics)) {
      return NextResponse.json(
        { error: 'Invalid metrics data' },
        { status: 400 }
      );
    }

    const clientIP = request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const supabase = createClient();

    // Get user if authenticated
    const { data: { user } } = await supabase.auth.getUser();

    // Prepare metrics for batch insert
    const metricsToInsert = data.metrics.map(metric => ({
      metric_id: metric.id,
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      timestamp: new Date(metric.timestamp).toISOString(),
      url: metric.url,
      user_agent: data.userAgent,
      user_id: user?.id || null,
      client_ip: clientIP,
      created_at: new Date().toISOString(),
    }));

    // Insert metrics in batches to avoid payload limits
    const batchSize = 50;
    for (let i = 0; i < metricsToInsert.length; i += batchSize) {
      const batch = metricsToInsert.slice(i, i + batchSize);

      const { error: dbError } = await supabase
        .from('performance_metrics')
        .insert(batch);

      if (dbError) {
        console.error('Failed to store performance metrics batch:', dbError);
        return NextResponse.json(
          { error: 'Failed to store performance metrics' },
          { status: 500 }
        );
      }
    }

    // Check for performance alerts
    await checkPerformanceAlerts(data.metrics);

    return NextResponse.json({
      success: true,
      metricsStored: data.metrics.length
    });

  } catch (error) {
    console.error('Error in performance monitoring endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const metricName = searchParams.get('metric');
    const rating = searchParams.get('rating');
    const hours = parseInt(searchParams.get('hours') || '24');
    const limit = parseInt(searchParams.get('limit') || '100');

    const supabase = createClient();

    // Check if user is authenticated (for admin access)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hoursAgo = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

    let query = supabase
      .from('performance_metrics')
      .select('*')
      .gte('timestamp', hoursAgo)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (metricName) {
      query = query.eq('name', metricName);
    }

    if (rating) {
      query = query.eq('rating', rating);
    }

    const { data: metrics, error: dbError } = await query;

    if (dbError) {
      console.error('Failed to fetch performance metrics:', dbError);
      return NextResponse.json(
        { error: 'Failed to fetch performance metrics' },
        { status: 500 }
      );
    }

    // Calculate summary statistics
    const summary = calculatePerformanceSummary(metrics || []);

    return NextResponse.json({
      metrics: metrics || [],
      summary,
      timeRange: `${hours} hours`,
    });

  } catch (error) {
    console.error('Error in performance metrics fetch:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function checkPerformanceAlerts(metrics: PerformanceMetricRequest[]) {
  // Check for critical performance issues
  const criticalMetrics = metrics.filter(metric =>
    metric.rating === 'poor' &&
    ['LCP', 'FID', 'CLS'].includes(metric.name)
  );

  if (criticalMetrics.length > 0) {
    console.warn('🚨 Critical Web Vitals detected:', criticalMetrics);

    // In production, send alerts to monitoring service
    // await sendPerformanceAlert(criticalMetrics);
  }

  // Check for performance degradation patterns
  const slowPageLoads = metrics.filter(metric =>
    metric.name === 'PAGE_LOAD' && metric.value > 5000
  );

  if (slowPageLoads.length > 0) {
    console.warn('⚠️ Slow page loads detected:', slowPageLoads);
  }
}

function calculatePerformanceSummary(metrics: any[]) {
  if (metrics.length === 0) {
    return {
      totalMetrics: 0,
      averageValues: {},
      ratingDistribution: { good: 0, 'needs-improvement': 0, poor: 0 },
      metricCounts: {},
    };
  }

  const summary = {
    totalMetrics: metrics.length,
    averageValues: {} as Record<string, number>,
    ratingDistribution: {
      good: metrics.filter(m => m.rating === 'good').length,
      'needs-improvement': metrics.filter(m => m.rating === 'needs-improvement').length,
      poor: metrics.filter(m => m.rating === 'poor').length,
    },
    metricCounts: {} as Record<string, number>,
  };

  // Calculate averages and counts for each metric type
  const metricTypes = [...new Set(metrics.map(m => m.name))];

  metricTypes.forEach(type => {
    const typeMetrics = metrics.filter(m => m.name === type);
    const average = typeMetrics.reduce((sum, m) => sum + m.value, 0) / typeMetrics.length;

    summary.averageValues[type] = Math.round(average * 100) / 100;
    summary.metricCounts[type] = typeMetrics.length;
  });

  return summary;
}
