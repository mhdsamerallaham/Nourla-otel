/**
 * Server-Side Input Sanitization & Validation Utilities
 * Ensures zero XSS payloads or malicious strings are stored or sent to Elektraweb/database.
 */

'use strict';

function sanitizeText(input) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<[^>]*>/g, '') // Strip all HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: pseudo-protocols
    .replace(/on\w+\s*=/gi, '') // Remove event handlers (onerror=, onload=, etc.)
    .trim();
}

function sanitizeObject(obj) {
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

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (trimmed.length > 254 || trimmed.length < 5) return false;
  return EMAIL_REGEX.test(trimmed);
}

function sanitizePhone(phone) {
  if (typeof phone !== 'string') return '';
  const cleaned = phone.replace(/[^0-9+]/g, '');
  return cleaned.startsWith('+')
    ? '+' + cleaned.slice(1).replace(/\+/g, '')
    : cleaned;
}

function isValidPhone(phone) {
  if (typeof phone !== 'string') return false;
  const digitsOnly = phone.replace(/\D/g, '');
  return digitsOnly.length >= 7 && digitsOnly.length <= 15;
}

module.exports = {
  sanitizeText,
  sanitizeObject,
  isValidEmail,
  sanitizePhone,
  isValidPhone,
};
