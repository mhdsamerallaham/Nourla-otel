/**
 * Elektraweb Auth Manager
 *
 * JWT token yönetimi:
 * - ELEKTRA_API_TOKEN ile /login endpoint'ine POST yapılır
 * - Dönen JWT in-memory cache'de tutulur
 * - TTL dolduğunda otomatik yenilenir (default: 24 saat)
 *
 * GÜVENLİK:
 * - Token hiçbir zaman log'a yazılmaz
 * - Token hiçbir zaman response'a eklenmez
 */

'use strict';

const axios = require('axios');

// ─── Token Cache ──────────────────────────────────────────────────────────────
let _cachedToken = null;
let _tokenExpiresAt = null;

const TOKEN_CACHE_TTL_MS =
  parseInt(process.env.ELEKTRA_TOKEN_CACHE_TTL || '86400', 10) * 1000;

/**
 * Cache'deki token geçerli mi?
 */
function isTokenValid() {
  return _cachedToken !== null && _tokenExpiresAt !== null && Date.now() < _tokenExpiresAt;
}

/**
 * Elektraweb'e login olarak yeni JWT token al.
 *
 * Elektraweb'in iki auth yöntemi:
 *   1. API Token ile: { "login-token": "TOKEN" }
 *   2. Email/Password ile: { "email": "...", "password": "..." }
 *
 * ELEKTRA_API_TOKEN değerine göre otomatik seçim yapılır.
 */
async function fetchNewToken() {
  const baseURL = process.env.ELEKTRA_API_BASE_URL || 'bookingapi.elektraweb.com';
  const rawApiToken = process.env.ELEKTRA_API_TOKEN || 'urlawebsitesi#37555$011da0257ad34e12acfce8ea2ad2727f63fbd8157dc6eebabdc105b8d80185b0253ee9e65ee8f74e41b846702cc7a2cd5104c2267e44f4d916f0c6404bdb6175';
  const apiToken = rawApiToken.replace(/^"|"$/g, '').trim();
  const hotelId = process.env.ELEKTRA_HOTEL_ID || '37555';

  const email = process.env.ELEKTRA_EMAIL;
  const password = process.env.ELEKTRA_PASSWORD;

  let loginBody;
  let authMethod;

  if (email && password) {
    // Email + Password ile giriş (öncelikli)
    loginBody = { email, password };
    authMethod = 'email/password';
  } else if (apiToken) {
    // Login-token ile giriş
    loginBody = { 'login-token': apiToken };
    authMethod = 'login-token';
  } else {
    throw new Error(
      'ElektraWeb kimlik bilgileri eksik. server/.env dosyasına ELEKTRA_EMAIL + ELEKTRA_PASSWORD ekleyin.'
    );
  }

  console.log(`[AUTH] Elektraweb login isteği (${authMethod}) gönderiliyor... (Hotel: ${hotelId})`);

  const startTime = Date.now();

  try {
    const response = await axios.post(
      `https://${baseURL.replace(/^https?:\/\//, '')}/login`,
      loginBody,
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        timeout: 15000,
      }
    );

    const duration = Date.now() - startTime;
    const data = response.data;

    // Response'dan JWT'yi çıkar (Elektraweb farklı field adları kullanabilir)
    const jwt =
      data.jwt ||
      data.JWT_CODE ||
      data.token ||
      data.access_token ||
      data.data?.jwt ||
      data.data?.token;

    if (!jwt) {
      console.error('[AUTH] Login response JWT içermiyor:', JSON.stringify(data));
      throw new Error(`Login başarılı ama JWT bulunamadı. Response keys: ${Object.keys(data).join(', ')}`);
    }

    _cachedToken = jwt;
    _tokenExpiresAt = Date.now() + TOKEN_CACHE_TTL_MS;

    console.log(`[AUTH] JWT token alındı. (${duration}ms) Geçerlilik: ${TOKEN_CACHE_TTL_MS / 3600000}h`);

    return jwt;
  } catch (err) {
    const duration = Date.now() - startTime;

    if (err.response) {
      const status = err.response.status;
      const errData = err.response.data;
      console.error(
        `[AUTH] Login başarısız (${status}, ${duration}ms):`,
        JSON.stringify(errData)
      );
      throw new Error(
        `Elektraweb login hatası: HTTP ${status} — ${
          errData?.message || errData?.error || JSON.stringify(errData)
        }`
      );
    }

    if (err.code === 'ECONNABORTED') {
      throw new Error(`Elektraweb login timeout (${duration}ms)`);
    }

    throw err;
  }
}

/**
 * Geçerli JWT token'ı döndürür.
 * Gerekirse yeni token alır.
 *
 * @returns {Promise<string>} JWT token
 */
async function getToken() {
  if (isTokenValid()) {
    return _cachedToken;
  }

  return fetchNewToken();
}

/**
 * Token cache'ini temizler (force refresh için).
 */
function clearTokenCache() {
  _cachedToken = null;
  _tokenExpiresAt = null;
  console.log('[AUTH] Token cache temizlendi.');
}

/**
 * Auth header'ını döndürür.
 * @returns {Promise<Object>} { Authorization: "Bearer JWT..." }
 */
async function getAuthHeaders() {
  const token = await getToken();
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
}

module.exports = {
  getToken,
  getAuthHeaders,
  clearTokenCache,
  isTokenValid,
};
