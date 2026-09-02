/**
 * Security Headers Middleware for Express / Vercel API
 * Implements OWASP recommended security headers
 */

'use strict';

function securityHeaders(req, res, next) {
  // Prevent Clickjacking (allow SAMEORIGIN for 3D secure payment frames if needed)
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Control referrer information sent in HTTP requests
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Disable sensitive hardware access
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Legacy browser XSS protection filter
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // HTTP Strict Transport Security (HSTS) — 2 years with subdomains and preload
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');

  // Content Security Policy (CSP)
  const csp = [
    "default-src 'self'",
    "img-src 'self' data: blob: https:",
    "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://maps.googleapis.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "connect-src 'self' https://bookingapi.elektraweb.com https://*.supabase.co https://api.s02.elektraweb.com https:",
    "frame-src 'self' https: data:",
    "object-src 'none'",
    "base-uri 'self'",
  ].join('; ');

  res.setHeader('Content-Security-Policy', csp);

  next();
}

module.exports = { securityHeaders };
