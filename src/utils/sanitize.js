/**
 * Client-Side Input Sanitization & Form Validation Utilities
 * Protects against XSS, injection attacks, and invalid input formats.
 */

// Strip any HTML tags, event handlers, and script payloads
export function sanitizeText(input) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<[^>]*>/g, '') // Strip all HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: pseudo-protocols
    .replace(/on\w+\s*=/gi, '') // Remove event handlers like onclick=
    .trim();
}

// Sanitize all string fields within an object recursively
export function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeObject);

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeText(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

// Strict RFC-compliant Email Validation Regex
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (trimmed.length > 254 || trimmed.length < 5) return false;
  return EMAIL_REGEX.test(trimmed);
}

// Phone Number Sanitizer: keep only digits and leading +
export function sanitizePhone(phone) {
  if (typeof phone !== 'string') return '';
  const cleaned = phone.replace(/[^0-9+]/g, '');
  return cleaned.startsWith('+')
    ? '+' + cleaned.slice(1).replace(/\+/g, '')
    : cleaned;
}

// Phone Number Validator: requires 7 to 15 digits
export function isValidPhone(phone) {
  if (typeof phone !== 'string') return false;
  const digitsOnly = phone.replace(/\D/g, '');
  return digitsOnly.length >= 7 && digitsOnly.length <= 15;
}

// Guest Name Validation (Supports Turkish and International characters, space, hyphen)
const NAME_REGEX = /^[a-zA-ZçÇğĞıİöÖşŞüÜ\s\-'.]+$/;

export function isValidName(name) {
  if (typeof name !== 'string') return false;
  const trimmed = name.trim();
  return trimmed.length >= 2 && trimmed.length <= 80 && NAME_REGEX.test(trimmed);
}
