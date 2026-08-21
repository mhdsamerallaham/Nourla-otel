/**
 * Request Logger Middleware
 *
 * Şunları loglar:
 *   - Timestamp
 *   - HTTP method + path
 *   - Hotel ID
 *   - Response status
 *   - Request duration
 *
 * Şunları ASLA loglamaz:
 *   - Authorization header (token)
 *   - ELEKTRA_API_TOKEN
 *   - Ödeme bilgileri
 */

'use strict';

/**
 * Express request logger middleware.
 * Token ve sensitive header'ları maskeler.
 */
function requestLogger(req, res, next) {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  const hotelId = process.env.ELEKTRA_HOTEL_ID || 'unknown';

  // Response tamamlandığında logla
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const status = res.statusCode;
    const method = req.method;
    const path = req.path;
    const query = Object.keys(req.query).length
      ? '?' + new URLSearchParams(sanitizeQueryForLog(req.query)).toString()
      : '';

    const statusEmoji = status < 300 ? '✓' : status < 400 ? '→' : status < 500 ? '⚠' : '✗';

    console.log(
      `[${timestamp}] ${statusEmoji} ${method} ${path}${query} | ${status} | ${duration}ms | hotel:${hotelId}`
    );
  });

  next();
}

/**
 * Query parametrelerini log için güvenli hale getirir.
 * Sensitive field'ları maskeler.
 */
function sanitizeQueryForLog(query) {
  const SENSITIVE_KEYS = ['token', 'api_key', 'apikey', 'secret', 'password', 'promo-code'];
  const sanitized = {};

  for (const [key, value] of Object.entries(query)) {
    if (SENSITIVE_KEYS.includes(key.toLowerCase())) {
      sanitized[key] = '***';
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Yardımcı: Nesne içindeki token/sensitive değerleri maskeler (deep).
 * Log'lama sırasında kullanılabilir.
 *
 * @param {Object} obj
 * @returns {Object}
 */
function maskSensitiveFields(obj) {
  if (!obj || typeof obj !== 'object') return obj;

  const SENSITIVE_KEYS = [
    'token', 'jwt', 'jwt_code', 'authorization', 'api_key',
    'password', 'secret', 'api_token', 'bearer',
  ];

  const masked = { ...obj };
  for (const key of Object.keys(masked)) {
    if (SENSITIVE_KEYS.includes(key.toLowerCase())) {
      masked[key] = '***MASKED***';
    } else if (typeof masked[key] === 'object' && masked[key] !== null) {
      masked[key] = maskSensitiveFields(masked[key]);
    }
  }

  return masked;
}

module.exports = {
  requestLogger,
  maskSensitiveFields,
  sanitizeQueryForLog,
};
