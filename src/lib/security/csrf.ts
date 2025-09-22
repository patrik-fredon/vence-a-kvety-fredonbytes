/**
 * CSRF Token Management
 * Provides utilities for generating and validating CSRF tokens
 */

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/config";
import { createHash, randomBytes } from "crypto";

const CSRF_TOKEN_LENGTH = 32;
const CSRF_TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour in milliseconds



/**
 * Generate a CSRF token for the current session
 */
export async function generateCSRFToken(): Promise<string> {
  try {
    const session = await auth();
    const randomToken = randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
    const timestamp = Date.now();
    const userId = session?.user?.id || 'anonymous';

    // Create a hash that includes user context
    const tokenData = `${randomToken}:${timestamp}:${userId}`;
    const hash = createHash('sha256').update(tokenData).digest('hex');

    // Combine random token with hash for verification
    const csrfToken = `${randomToken}.${hash}.${timestamp}`;

    return Buffer.from(csrfToken).toString('base64url');
  } catch (error) {
    console.error('Error generating CSRF token:', error);
    throw new Error('Failed to generate CSRF token');
  }
}

/**
 * Validate a CSRF token
 */
export async function validateCSRFToken(token: string, request?: NextRequest): Promise<boolean> {
  try {
    if (!token) {
      return false;
    }

    // Decode the token
    const decodedToken = Buffer.from(token, 'base64url').toString();
    const [randomToken, hash, timestampStr] = decodedToken.split('.');

    if (!randomToken || !hash || !timestampStr) {
      return false;
    }

    const timestamp = parseInt(timestampStr, 10);

    // Check if token has expired
    if (Date.now() - timestamp > CSRF_TOKEN_EXPIRY) {
      return false;
    }

    // Get current session
    const session = await auth();
    const userId = session?.user?.id || 'anonymous';

    // Recreate the token data and verify hash
    const tokenData = `${randomToken}:${timestamp}:${userId}`;
    const expectedHash = createHash('sha256').update(tokenData).digest('hex');

    if (hash !== expectedHash) {
      return false;
    }

    // Additional validation: check if request comes from same origin
    if (request) {
      const origin = request.headers.get('origin');
      const referer = request.headers.get('referer');
      const host = request.headers.get('host');

      if (!origin && !referer) {
        return false; // Reject requests without origin/referer
      }

      const requestOrigin = origin || (referer ? new URL(referer).origin : null);
      const expectedOrigin = `${request.nextUrl.protocol}//${host}`;

      if (requestOrigin !== expectedOrigin) {
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error validating CSRF token:', error);
    return false;
  }
}

/**
 * Get CSRF token from request headers
 */
export function getCSRFTokenFromRequest(request: NextRequest): string | null {
  // Check multiple possible header names
  const tokenHeaders = [
    'x-csrf-token',
    'x-xsrf-token',
    'csrf-token',
    'xsrf-token'
  ];

  for (const header of tokenHeaders) {
    const token = request.headers.get(header);
    if (token) {
      return token;
    }
  }

  return null;
}

/**
 * Middleware to validate CSRF token for state-changing requests
 */
export async function validateCSRFMiddleware(request: NextRequest): Promise<boolean> {
  const method = request.method.toUpperCase();

  // Only validate CSRF for state-changing methods
  if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    return true;
  }

  const token = getCSRFTokenFromRequest(request);

  if (!token) {
    return false;
  }

  return await validateCSRFToken(token, request);
}

/**
 * Create CSRF token response headers
 */
export function createCSRFHeaders(token: string): Record<string, string> {
  return {
    'X-CSRF-Token': token,
    'X-CSRF-Token-Expires': (Date.now() + CSRF_TOKEN_EXPIRY).toString(),
  };
}

/**
 * CSRF protection for API routes
 */
export function withCSRFProtection<T extends any[]>(
  handler: (...args: T) => Promise<Response>
) {
  return async (...args: T): Promise<Response> => {
    const request = args[0] as NextRequest;

    // Generate and return CSRF token for GET requests
    if (request.method === 'GET') {
      const token = await generateCSRFToken();
      const response = await handler(...args);

      // Add CSRF token to response headers
      const headers = createCSRFHeaders(token);
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      return response;
    }

    // Validate CSRF token for state-changing requests
    const isValidCSRF = await validateCSRFMiddleware(request);

    if (!isValidCSRF) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'INVALID_CSRF_TOKEN',
            message: 'Invalid or missing CSRF token',
            timestamp: new Date().toISOString(),
          },
        }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return await handler(...args);
  };
}

/**
 * Client-side utility to get CSRF token from meta tag or API
 */
export const clientCSRFUtils = {
  /**
   * Get CSRF token from meta tag
   */
  getTokenFromMeta(): string | null {
    if (typeof document === 'undefined') return null;

    const metaTag = document.querySelector('meta[name="csrf-token"]');
    return metaTag?.getAttribute('content') || null;
  },

  /**
   * Fetch CSRF token from API
   */
  async fetchToken(): Promise<string | null> {
    try {
      const response = await fetch('/api/csrf-token');
      if (response.ok) {
        const token = response.headers.get('X-CSRF-Token');
        return token;
      }
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error);
    }
    return null;
  },

  /**
   * Get CSRF token (try meta tag first, then API)
   */
  async getToken(): Promise<string | null> {
    let token = this.getTokenFromMeta();
    if (!token) {
      token = await this.fetchToken();
    }
    return token;
  },

  /**
   * Add CSRF token to fetch options
   */
  async addTokenToFetchOptions(options: RequestInit = {}): Promise<RequestInit> {
    const token = await this.getToken();
    if (token) {
      options.headers = {
        ...options.headers,
        'X-CSRF-Token': token,
      };
    }
    return options;
  },
};
