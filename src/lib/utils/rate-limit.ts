import { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Create Redis instance
const redis = Redis.fromEnv();

// Define rate limiters for different endpoints
const rateLimiters = {
  'error-logging': new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '1 m'), // 20 error reports per minute
    analytics: true,
  }),
  'performance-monitoring': new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 performance reports per minute
    analytics: true,
  }),
  'general': new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, '1 m'), // 60 requests per minute
    analytics: true,
  }),
};

export async function rateLimit(
  request: NextRequest,
  type: keyof typeof rateLimiters = 'general'
): Promise<{ success: boolean; limit: number; remaining: number; reset: Date }> {
  const identifier = getClientIdentifier(request);
  const limiter = rateLimiters[type];

  const result = await limiter.limit(identifier);

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: new Date(result.reset),
  };
}

function getClientIdentifier(request: NextRequest): string {
  // Try to get IP address from various headers
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const remoteAddr = request.headers.get('remote-addr');

  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown';
  }

  if (realIp) {
    return realIp;
  }

  if (remoteAddr) {
    return remoteAddr;
  }

  // Fallback to a default identifier
  return 'unknown';
}
