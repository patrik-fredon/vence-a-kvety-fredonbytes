import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Cleanup endpoint for maintenance tasks
 * Runs via Vercel cron job daily at 2 AM
 */
export async function POST(request: NextRequest) {
  try {
    // Verify this is a cron job request
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient();
    const results = {
      cleanedSessions: 0,
      cleanedLogs: 0,
      cleanedMetrics: 0,
      errors: []
    };

    // Clean up expired sessions (older than 30 days)
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { count: sessionCount, error: sessionError } = await supabase
        .from('user_sessions')
        .delete()
        .lt('expires_at', thirtyDaysAgo.toISOString())
        .select('*', { count: 'exact', head: true });

      if (sessionError) throw sessionError;
      results.cleanedSessions = sessionCount || 0;
    } catch (error) {
      results.errors.push(`Session cleanup failed: ${error}`);
    }

    // Clean up old error logs (older than 90 days)
    try {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const { count: logCount, error: logError } = await supabase
        .from('error_logs')
        .delete()
        .lt('created_at', ninetyDaysAgo.toISOString())
        .select('*', { count: 'exact', head: true });

      if (logError) throw logError;
      results.cleanedLogs = logCount || 0;
    } catch (error) {
      results.errors.push(`Log cleanup failed: ${error}`);
    }

    // Clean up old performance metrics (older than 30 days)
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { count: metricsCount, error: metricsError } = await supabase
        .from('performance_metrics')
        .delete()
        .lt('created_at', thirtyDaysAgo.toISOString())
        .select('*', { count: 'exact', head: true });

      if (metricsError) throw metricsError;
      results.cleanedMetrics = metricsCount || 0;
    } catch (error) {
      results.errors.push(`Metrics cleanup failed: ${error}`);
    }

    // Clean up Redis cache if configured
    if (process.env.REDIS_URL) {
      try {
        const { Redis } = await import('ioredis');
        const redis = new Redis(process.env.REDIS_URL);

        // Clean up expired cart items
        const expiredKeys = await redis.keys('cart:*');
        for (const key of expiredKeys) {
          const ttl = await redis.ttl(key);
          if (ttl === -1) { // No expiration set
            await redis.expire(key, 86400 * 7); // Set 7 day expiration
          }
        }

        await redis.disconnect();
      } catch (error) {
        results.errors.push(`Redis cleanup failed: ${error}`);
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results
    });

  } catch (error) {
    console.error('Cleanup job failed:', error);

    return NextResponse.json({
      success: false,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
