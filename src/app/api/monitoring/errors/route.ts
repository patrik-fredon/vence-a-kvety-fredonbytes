import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/utils/rate-limit';

interface ErrorLogRequest {
  id: string;
  message: string;
  stack?: string;
  name: string;
  level: string;
  context?: string;
  timestamp: string;
  userAgent: string;
  url: string;
  userId?: string;
  sessionId?: string;
  additionalData?: Record<string, any>;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting to prevent spam
    const rateLimitResult = await rateLimit(request, 'error-logging');
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many error reports. Please try again later.' },
        { status: 429 }
      );
    }

    const errorLog: ErrorLogRequest = await request.json();

    // Validate required fields
    if (!errorLog.id || !errorLog.message || !errorLog.level) {
      return NextResponse.json(
        { error: 'Missing required fields: id, message, level' },
        { status: 400 }
      );
    }

    // Get client IP for additional context
    const clientIP = request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const supabase = createClient();

    // Store error in database
    const { error: dbError } = await supabase
      .from('error_logs')
      .insert({
        error_id: errorLog.id,
        message: errorLog.message,
        stack: errorLog.stack,
        error_name: errorLog.name,
        level: errorLog.level,
        context: errorLog.context,
        timestamp: errorLog.timestamp,
        user_agent: errorLog.userAgent,
        url: errorLog.url,
        user_id: errorLog.userId,
        session_id: errorLog.sessionId,
        client_ip: clientIP,
        additional_data: errorLog.additionalData,
        resolved: false,
        created_at: new Date().toISOString(),
      });

    if (dbError) {
      console.error('Failed to store error log:', dbError);
      return NextResponse.json(
        { error: 'Failed to store error log' },
        { status: 500 }
      );
    }

    // For critical errors, send immediate notification (in production)
    if (errorLog.level === 'critical' && process.env.NODE_ENV === 'production') {
      await sendCriticalErrorNotification(errorLog);
    }

    return NextResponse.json({ success: true, errorId: errorLog.id });

  } catch (error) {
    console.error('Error in error logging endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level');
    const limit = parseInt(searchParams.get('limit') || '50');
    const resolved = searchParams.get('resolved');

    const supabase = createClient();

    // Check if user is admin (you might want to implement proper admin auth)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let query = supabase
      .from('error_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (level) {
      query = query.eq('level', level);
    }

    if (resolved !== null) {
      query = query.eq('resolved', resolved === 'true');
    }

    const { data: errors, error: dbError } = await query;

    if (dbError) {
      console.error('Failed to fetch error logs:', dbError);
      return NextResponse.json(
        { error: 'Failed to fetch error logs' },
        { status: 500 }
      );
    }

    return NextResponse.json({ errors });

  } catch (error) {
    console.error('Error in error logs fetch:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function sendCriticalErrorNotification(errorLog: ErrorLogRequest) {
  // In a real application, you would send this to:
  // - Slack webhook
  // - Email notification
  // - SMS alert
  // - Third-party monitoring service (Sentry, Bugsnag, etc.)

  console.error('🚨 CRITICAL ERROR DETECTED:', {
    id: errorLog.id,
    message: errorLog.message,
    url: errorLog.url,
    timestamp: errorLog.timestamp,
  });

  // Example: Send to webhook (uncomment and configure in production)
  /*
  try {
    await fetch(process.env.SLACK_WEBHOOK_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `🚨 Critical Error on Pohřební věnce`,
        attachments: [{
          color: 'danger',
          fields: [
            { title: 'Error ID', value: errorLog.id, short: true },
            { title: 'Message', value: errorLog.message, short: false },
            { title: 'URL', value: errorLog.url, short: true },
            { title: 'Time', value: errorLog.timestamp, short: true },
          ]
        }]
      })
    });
  } catch (notificationError) {
    console.error('Failed to send critical error notification:', notificationError);
  }
  */
}
