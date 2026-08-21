/**
 * Elektraweb HTTP Client
 *
 * Tüm Elektraweb API istekleri bu client üzerinden geçer.
 *
 * Özellikler:
 * - Otomatik JWT auth header ekleme
 * - 15 saniye timeout
 * - GET istekler için 2 retry (network hatalarında)
 * - Güvenli error handling (token maskeleme)
 * - Request/response logging (token olmadan)
 */

'use strict';

const axios = require('axios');
const { getAuthHeaders, clearTokenCache } = require('./auth');

const BASE_URL = process.env.ELEKTRA_API_BASE_URL || 'https://bookingapi.elektraweb.com';
const HOTEL_ID = process.env.ELEKTRA_HOTEL_ID || '37555';
const TIMEOUT_MS = 15000;
const MAX_RETRIES = 2;

/**
 * Normalized base URL (protokol prefix'ini garantile)
 */
function normalizeBaseUrl(url) {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url.replace(/\/$/, '');
  }
  return `https://${url.replace(/\/$/, '')}`;
}

const API_BASE = normalizeBaseUrl(BASE_URL);

/**
 * Elektraweb API'ye authenticated GET isteği gönderir.
 *
 * @param {string} endpoint - Endpoint path (ör: /hotel/37555/price/)
 * @param {Object} params   - Query parametreleri
 * @param {Object} options  - Ek seçenekler { retries, label }
 * @returns {Promise<Object>} API response data
 */
async function elektraGet(endpoint, params = {}, options = {}) {
  const isTest = process.env.NODE_ENV === 'test';
  const { retries = isTest ? 0 : MAX_RETRIES, label = endpoint } = options;
  const url = `${API_BASE}${endpoint}`;
  const startTime = Date.now();

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      const authHeaders = await getAuthHeaders();

      console.log(`[ELEKTRA GET] ${label} | attempt=${attempt} | params=${JSON.stringify(params)}`);

      const response = await axios.get(url, {
        headers: authHeaders,
        params,
        timeout: TIMEOUT_MS,
      });

      const duration = Date.now() - startTime;
      console.log(`[ELEKTRA GET] ${label} ✓ | ${response.status} | ${duration}ms`);

      return response.data;
    } catch (err) {
      const duration = Date.now() - startTime;

      // 401 → Token geçersiz, cache temizle ve retry
      if (err.response?.status === 401 && attempt === 1) {
        console.warn(`[ELEKTRA GET] ${label} — 401 Unauthorized, token yenileniyor...`);
        clearTokenCache();
        continue;
      }

      const isLastAttempt = attempt === retries + 1;
      const isNetworkError = !err.response;
      const isRetryable = isNetworkError || err.code === 'ECONNABORTED';

      if (!isLastAttempt && isRetryable) {
        const delay = attempt * 1000;
        console.warn(
          `[ELEKTRA GET] ${label} — attempt ${attempt} başarısız (${err.code || err.message}), ${delay}ms sonra retry...`
        );
        await sleep(delay);
        continue;
      }

      // Hataları logla (token maskelenerek)
      if (err.response) {
        console.error(
          `[ELEKTRA GET ERROR] ${label} | HTTP ${err.response.status} | ${duration}ms | data:`,
          JSON.stringify(err.response.data)
        );
        throw createApiError(label, err.response.status, err.response.data);
      }

      if (err.code === 'ECONNABORTED') {
        console.error(`[ELEKTRA GET TIMEOUT] ${label} | ${duration}ms`);
        throw new ElektraError('TIMEOUT', `Elektraweb API yanıt vermedi (${TIMEOUT_MS / 1000}s timeout).`, 504);
      }

      console.error(`[ELEKTRA GET ERROR] ${label} | Network:`, err.message);
      throw new ElektraError('NETWORK_ERROR', `Elektraweb API bağlantı hatası: ${err.message}`, 502);
    }
  }
}

/**
 * Elektraweb API'ye authenticated POST isteği gönderir.
 * NOT: POST'larda retry YAPILMAZ (duplicate işlem riski).
 *
 * @param {string} endpoint
 * @param {Object} body
 * @returns {Promise<Object>}
 */
async function elektraPost(endpoint, body = {}) {
  const url = `${API_BASE}${endpoint}`;
  const startTime = Date.now();

  try {
    const authHeaders = await getAuthHeaders();

    console.log(`[ELEKTRA POST] ${endpoint} | body_keys=${Object.keys(body).join(',')}`);

    const response = await axios.post(url, body, {
      headers: authHeaders,
      timeout: TIMEOUT_MS,
    });

    const duration = Date.now() - startTime;
    console.log(`[ELEKTRA POST] ${endpoint} ✓ | ${response.status} | ${duration}ms`);

    return response.data;
  } catch (err) {
    const duration = Date.now() - startTime;

    if (err.response) {
      console.error(
        `[ELEKTRA POST ERROR] ${endpoint} | HTTP ${err.response.status} | ${duration}ms | data:`,
        JSON.stringify(err.response.data)
      );
      throw createApiError(endpoint, err.response.status, err.response.data);
    }

    if (err.code === 'ECONNABORTED') {
      console.error(`[ELEKTRA POST TIMEOUT] ${endpoint} | ${duration}ms`);
      throw new ElektraError('TIMEOUT', `Elektraweb API yanıt vermedi.`, 504);
    }

    throw new ElektraError('NETWORK_ERROR', `Elektraweb bağlantı hatası: ${err.message}`, 502);
  }
}

// ─── Custom Error Class ───────────────────────────────────────────────────────

class ElektraError extends Error {
  constructor(code, message, httpStatus = 500, rawData = null) {
    super(message);
    this.name = 'ElektraError';
    this.code = code;
    this.httpStatus = httpStatus;
    this.rawData = rawData;
  }
}

function createApiError(label, httpStatus, data) {
  const message =
    data?.message ||
    data?.error ||
    data?.Message ||
    data?.Error ||
    (typeof data === 'string' ? data : null) ||
    'Elektraweb API hatası.';

  const code =
    httpStatus === 401
      ? 'UNAUTHORIZED'
      : httpStatus === 404
      ? 'NOT_FOUND'
      : httpStatus === 429
      ? 'RATE_LIMITED'
      : 'ELEKTRA_API_ERROR';

  return new ElektraError(code, message, httpStatus, data);
}

// ─── Utils ────────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  elektraGet,
  elektraPost,
  ElektraError,
  API_BASE,
  HOTEL_ID,
};
