export function getSecurityHeaders() {
  const isProd = process.env.NODE_ENV === 'production';
  // HSTS should only be set when actually running on HTTPS, not just "production".
  // Set FORCE_HTTPS=true in .env on Hostinger/VPS after SSL cert is configured.
  const isHttps = process.env.FORCE_HTTPS === 'true';

  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://accounts.google.com https://apis.google.com https://checkout.razorpay.com https://cdn.razorpay.com https://8x8.vc https://meet.jit.si https://www.youtube.com https://s.ytimg.com https://www.googletagmanager.com https://www.google-analytics.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob: http:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.razorpay.com https://cdn.razorpay.com https://vimeo.com https://*.cloudinary.com https://www.google-analytics.com https://cdn.pixabay.com https://oauth2.googleapis.com https://api.github.com https://lumberjack-cx.razorpay.com https://lumberjack.razorpay.com https://checkout.razorpay.com https://meet.jit.si",
    // FIX: Added maps.google.com to allow the Google Maps iframe embed on /contact page
    "frame-src 'self' https://accounts.google.com https://www.youtube.com https://meet.jit.si https://8x8.vc https://api.razorpay.com https://checkout.razorpay.com https://player.vimeo.com https://maps.google.com https://maps.googleapis.com https://www.google.com",
    "media-src 'self' https: blob: data:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    // REMOVED: "upgrade-insecure-requests" — this was causing ERR_SSL_PROTOCOL_ERROR when the
    // server runs in production mode over plain HTTP (localhost / HTTP-only VPS). The directive
    // tells browsers to rewrite all http:// requests to https://, which breaks RSC payload fetches,
    // image loading, and API calls on any non-SSL environment.
  ].join('; ');

  const headers: Record<string, string> = {
    'Content-Security-Policy': isProd ? csp : '',
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
    'X-XSS-Protection': '1; mode=block',
    // Additional security headers
    'X-Permitted-Cross-Domain-Policies': 'none',
    'Cross-Origin-Embedder-Policy': 'credentialless',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
  };

  // FIX: Only enable HSTS when we *know* we are behind a real SSL certificate.
  // Enabling HSTS on plain HTTP causes browsers to refuse all HTTP connections for 1 year.
  // To enable on production: add FORCE_HTTPS=true to your .env on the Hostinger server.
  if (isProd && isHttps) {
    headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload';
  }

  return headers;
}
