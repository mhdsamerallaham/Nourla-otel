/**
 * Elektraweb API Routes
 * Mount: /api/elektra
 */

'use strict';

const express = require('express');
const router = express.Router();

const elektra = require('../services/elektraweb');
const { validateAvailabilityDates, validatePriceParams } = require('../middleware/validation');
const {
  normalizeHotelDefinitions,
  normalizeAvailability,
  normalizePrice,
  normalizeError,
} = require('../utils/responseNormalizer');

// ─── Health Check ─────────────────────────────────────────────────────────────

router.get('/health', async (req, res) => {
  try {
    const result = await elektra.testConnection();
    if (result.connected) {
      return res.json({
        success: true,
        elektraConnected: true,
        hotelId: parseInt(process.env.ELEKTRA_HOTEL_ID, 10),
        message: 'Elektraweb API bağlantısı başarılı.',
        timestamp: new Date().toISOString(),
      });
    } else {
      return res.status(503).json({
        success: false,
        elektraConnected: false,
        hotelId: parseInt(process.env.ELEKTRA_HOTEL_ID, 10),
        message: 'Elektraweb API bağlantısı kurulamadı.',
        error: result.error,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.error('[/health] Error:', err.message);
    return res.status(503).json({
      success: false,
      elektraConnected: false,
      hotelId: parseInt(process.env.ELEKTRA_HOTEL_ID, 10),
      message: 'Elektraweb API bağlantısı kurulamadı.',
      timestamp: new Date().toISOString(),
    });
  }
});

// ─── Hotel Definitions ────────────────────────────────────────────────────────

router.get('/hotel-definitions', async (req, res) => {
  try {
    const language = req.query.language || 'TR';
    const raw = await elektra.getHotelDefinitions(language);
    const normalized = normalizeHotelDefinitions(raw);
    return res.json(normalized);
  } catch (err) {
    console.error('[/hotel-definitions] Error:', err.message);
    const httpStatus = err.httpStatus || 500;
    return res.status(httpStatus).json({
      ...normalizeError(err),
      hotelId: parseInt(process.env.ELEKTRA_HOTEL_ID, 10),
    });
  }
});

// ─── Availability ─────────────────────────────────────────────────────────────

router.get('/availability', validateAvailabilityDates, async (req, res) => {
  try {
    const { fromdate, todate } = req.validatedDates;
    const raw = await elektra.getAvailability(fromdate, todate);
    const normalized = normalizeAvailability(raw, fromdate, todate);
    return res.json(normalized);
  } catch (err) {
    console.error('[/availability] Error:', err.message);
    const httpStatus = err.httpStatus || 500;
    return res.status(httpStatus).json({
      ...normalizeError(err),
      hotelId: parseInt(process.env.ELEKTRA_HOTEL_ID, 10),
    });
  }
});

// ─── Price ────────────────────────────────────────────────────────────────────

router.get('/price', validatePriceParams, async (req, res) => {
  try {
    const params = req.validatedParams;

    const priceParams = {
      fromdate: params.fromdate,
      todate: params.todate,
      adult: params.adult,
      currency: params.currency,
      language: params.language,
    };

    if (params.childage) priceParams.childage = params.childage;
    if (params.nationality) priceParams.nationality = params.nationality;
    if (req.query.onlybestoffer !== undefined) {
      priceParams.onlybestoffer = req.query.onlybestoffer === 'true';
    }
    if (req.query['promo-code']) {
      priceParams['promo-code'] = req.query['promo-code'];
    }

    const raw = await elektra.getPrices(priceParams);
    const normalized = normalizePrice(raw, { ...params, nights: params.nights });
    return res.json(normalized);
  } catch (err) {
    console.error('[/price] Error:', err.message);
    const httpStatus = err.httpStatus || 500;
    return res.status(httpStatus).json({
      ...normalizeError(err),
      hotelId: parseInt(process.env.ELEKTRA_HOTEL_ID, 10),
    });
  }
});

// ─── Reservation Creation (AKTİF) ─────────────────────────────────────────────

/**
 * POST /api/elektra/reservation
 *
 * Web sitesinden gelen rezervasyonu Elektraweb PMS sistemine iletir.
 * Elektraweb PMS üzerinde otomatik olarak stok düşülmesini sağlar.
 */
router.post('/reservation', async (req, res) => {
  try {
    const body = req.body;

    if (!body.checkIn || !body.checkOut || !body.roomTypeId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Eksik parametre: checkIn, checkOut ve roomTypeId zorunludur.',
        },
      });
    }

    const result = await elektra.createReservation(body);

    if (result && (result.success || result['reservation-id'])) {
      return res.json({
        success: true,
        reservationId: result['reservation-id'] || result.reservationId,
        reservationUuid: result['reservation-uuid'] || result.reservationUuid,
        message: 'Rezervasyonunuz başarıyla oluşturuldu.',
      });
    } else {
      return res.status(400).json({
        success: false,
        error: {
          code: 'RESERVATION_FAILED',
          message: result?.message || 'Elektraweb rezervasyon oluşturma hatası.',
        },
      });
    }
  } catch (err) {
    console.error('[/reservation] Error:', err.message);
    const httpStatus = err.httpStatus || 500;
    return res.status(httpStatus).json({
      success: false,
      error: {
        code: err.code || 'RESERVATION_ERROR',
        message: err.message || 'Rezervasyon oluşturulurken bir hata oluştu.',
      },
    });
  }
});

module.exports = router;
