import { NextRequest } from 'next/server';

/**
 * Robustly determines the base URL for the application, 
 * ensuring consistent protocol (https in production) and 
 * matching whitelisted Redirect URIs in Google/GitHub consoles.
 */
export function getBaseUrl(request: NextRequest) {
  // 1. Fallback to hardcoded NEXT_PUBLIC_APP_URL (highest priority in production)
  const envUrl = process.env.NEXT_PUBLIC_APP_URL;
  const isProd = process.env.NODE_ENV === 'production';
  
  if (isProd && envUrl) {
    return envUrl.replace(/\/$/, ''); // Remove trailing slash
  }

  const { origin } = new URL(request.url);
  
  // 2. Always respect localhost/127.0.0.1 for development
  if (origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('0.0.0.0')) {
    return origin.replace('0.0.0.0', 'localhost');
  }

  // 3. Check for Proxy Headers (Hostinger/Vercel/Cloudflare)
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
  
  if (forwardedHost) {
    // Ensure we don't return an internal port if it's not localhost/0.0.0.0
    const proxyOrigin = `${forwardedProto}://${forwardedHost}`;
    if (!proxyOrigin.includes('localhost') && !proxyOrigin.includes('0.0.0.0')) {
      return proxyOrigin.split(',')[0].trim(); // Take first if multiple
    }
  }

  if (envUrl) {
    return envUrl.replace(/\/$/, ''); 
  }

  // 4. Final fallback
  if (process.env.NODE_ENV === 'production') {
    return origin.replace(/^http:/, 'https:');
  }

  return origin;
}

/**
 * Accept only same-origin relative redirects.
 * Reject protocol-relative and absolute URLs to prevent open redirects.
 */
export function sanitizeRedirectPath(redirect?: string | null): string | null {
  if (!redirect) return null;
  const value = redirect.trim();
  if (!value) return null;
  if (!value.startsWith('/')) return null;
  if (value.startsWith('//')) return null;
  return value;
}

/**
 * Resolves cookie options with secure flag, lax SameSite, and wildcard domain
 * to prevent www vs non-www subdomain mismatch issues.
 */
export function getCookieOptions(request: NextRequest, maxAgeSeconds: number) {
  const isProd = process.env.NODE_ENV === 'production';
  const { origin } = new URL(request.url);
  const isLocal = origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('0.0.0.0');

  // Extract host without port
  const host = request.headers.get('host') || '';
  const hostname = host.split(':')[0];
  
  let domain: string | undefined = undefined;
  if (!isLocal && hostname.includes('.')) {
    const parts = hostname.split('.');
    if (parts.length >= 2) {
      domain = `.${parts.slice(-2).join('.')}`;
    }
  }

  return {
    httpOnly: true,
    secure: isProd && !isLocal,
    sameSite: 'lax' as const,
    maxAge: maxAgeSeconds,
    path: '/',
    ...(domain ? { domain } : {}),
  };
}
