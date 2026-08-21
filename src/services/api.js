/**
 * Frontend API Client — Nourla Hotel
 *
 * All frontend requests to backend booking & payment API endpoints pass through here.
 * SECURITY: No API keys or secrets exist on frontend.
 */

const BOOKING_API_BASE = '/api/booking';
const PAYMENT_API_BASE = '/api/payment';

async function apiFetch(baseUrl, endpoint, options = {}) {
  const url = `${baseUrl}${endpoint}`;
  let response;

  try {
    response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      ...options,
    });
  } catch (netErr) {
    throw new Error(`Backend sunucusuna ulaşılamadı (${netErr.message}). Lütfen backend sunucusunun (Port 3001) çalıştığından emin olun.`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error(
      `API sunucusu beklenmeyen yanıt döndürdü (HTTP ${response.status}). Backend servisinin (Port 3001) aktif olduğundan emin olun.`
    );
  }

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(
      data?.error?.message || `API Hatası: HTTP ${response.status}`
    );
    error.code = data?.error?.code || 'API_ERROR';
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// ─── BOOKING API ─────────────────────────────────────────────────────────────

export async function checkHealth() {
  return apiFetch('/api/hotel', '/definitions');
}

export async function getHotelDefinitions(language = 'TR') {
  return apiFetch(BOOKING_API_BASE, `/definitions?language=${language}`);
}

export async function checkAvailability(fromdate, todate) {
  const params = new URLSearchParams({ fromdate, todate });
  return apiFetch(BOOKING_API_BASE, `/availability?${params}`);
}

export async function getPrices({
  fromdate,
  todate,
  adult,
  childage,
  currency = 'TRY',
  nationality,
  language = 'TR',
  onlybestoffer,
  promoCode,
} = {}) {
  const query = new URLSearchParams({
    fromdate,
    todate,
    adult: String(adult),
    currency,
    language,
  });

  if (childage) query.set('childage', childage);
  if (nationality) query.set('nationality', nationality);
  if (onlybestoffer !== undefined) query.set('onlybestoffer', String(onlybestoffer));
  if (promoCode) query.set('promo-code', promoCode);

  return apiFetch(BOOKING_API_BASE, `/price?${query}`);
}

export async function createReservation(bookingData) {
  return apiFetch(BOOKING_API_BASE, '/reservation', {
    method: 'POST',
    body: JSON.stringify(bookingData),
  });
}

export async function getReservationByCode(code) {
  return apiFetch(BOOKING_API_BASE, `/reservation/${code}`);
}

// ─── PAYMENT API ─────────────────────────────────────────────────────────────

export async function createPaymentSession({ reservationId, card, callbackUrl, idempotencyKey }) {
  return apiFetch(PAYMENT_API_BASE, '/create', {
    method: 'POST',
    body: JSON.stringify({ reservationId, card, callbackUrl, idempotencyKey }),
  });
}

export async function process3DSecureVerification(payload) {
  return apiFetch(PAYMENT_API_BASE, '/3d-secure', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getPaymentStatus(paymentId) {
  return apiFetch(PAYMENT_API_BASE, `/status/${paymentId}`);
}

const hotelApi = {
  checkHealth,
  getHotelDefinitions,
  checkAvailability,
  getPrices,
  createReservation,
  getReservationByCode,
  createPaymentSession,
  process3DSecureVerification,
  getPaymentStatus,
};

export default hotelApi;
