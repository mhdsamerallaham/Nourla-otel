/**
 * Booking API Routes (Public Hotel Reservation API)
 * Mount: /api/booking or /api/hotel
 */

'use strict';

const express = require('express');
const router = express.Router();
const reservationService = require('../services/reservation/reservationService');
const elektra = require('../services/elektraweb');
const { validateAvailabilityDates, validatePriceParams } = require('../middleware/validation');
const {
  normalizeHotelDefinitions,
  normalizeAvailability,
  normalizePrice,
  normalizeError,
} = require('../utils/responseNormalizer');

// ─── Hotel Definitions ────────────────────────────────────────────────────────
router.get('/definitions', async (req, res) => {
  try {
    const language = req.query.language || 'TR';
    const raw = await elektra.getHotelDefinitions(language);
    const normalized = normalizeHotelDefinitions(raw);
    return res.json(normalized);
  } catch (err) {
    return res.status(err.httpStatus || 500).json(normalizeError(err));
  }
});

// ─── Exchange Rates (TCMB) ──────────────────────────────────────────────────
router.get('/exchange-rates', async (req, res) => {
  try {
    const { getTcmbExchangeRates } = require('../services/currency/tcmbService');
    const rates = await getTcmbExchangeRates();
    return res.json(rates);
  } catch (err) {
    return res.status(500).json(normalizeError(err));
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
    return res.status(err.httpStatus || 500).json(normalizeError(err));
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
    // onlybestoffer=true returns only 1 offer (cheapest room in the hotel) — do NOT default to true.
    // Only pass it if the caller explicitly requests it.
    if (req.query.onlybestoffer !== undefined) {
      priceParams.onlybestoffer = req.query.onlybestoffer === 'true';
    }
    if (req.query['promo-code'] || req.query.promo_code) {
      priceParams['promo-code'] = req.query['promo-code'] || req.query.promo_code;
    }
    if (req.query['price-agency-id']) {
      priceParams['price-agency-id'] = req.query['price-agency-id'];
    }

    let raw = await elektra.getPrices(priceParams);

    // If full month query starting on closed days returns 0 offers, try mid-month sub-range
    if ((!Array.isArray(raw) || raw.length === 0) && params.fromdate && params.todate) {
      const fromD = new Date(params.fromdate + 'T00:00:00Z');
      const toD = new Date(params.todate + 'T00:00:00Z');
      const diffDays = Math.round((toD - fromD) / (1000 * 60 * 60 * 24));
      
      if (diffDays > 10) {
        const midD = new Date(fromD.getTime() + Math.floor(diffDays / 2) * 86400000);
        const midStr = midD.toISOString().split('T')[0];
        const subRaw = await elektra.getPrices({ ...priceParams, fromdate: midStr });
        if (Array.isArray(subRaw) && subRaw.length > 0) {
          raw = subRaw;
        }
      }
    }

    const normalized = normalizePrice(raw, { ...params, nights: params.nights });
    return res.json(normalized);
  } catch (err) {
    return res.status(err.httpStatus || 500).json(normalizeError(err));
  }
});

// ─── Create Pending Reservation ───────────────────────────────────────────────
router.post('/reservation', async (req, res) => {
  try {
    const body = req.body;
    const reservation = await reservationService.createPendingReservation({
      pmsRoomTypeId: body.roomTypeId || body.pmsRoomTypeId,
      checkIn: body.checkIn,
      checkOut: body.checkOut,
      adultCount: body.adultCount || body.adults || 2,
      childCount: body.childCount || 0,
      guestName: body.guestName,
      guestEmail: body.guestEmail,
      guestPhone: body.guestPhone,
      specialNotes: body.specialNotes,
      nationality: body.nationality || 'TR',
      currency: body.currency || 'TRY',
      promoCode: body.promoCode,
    });

    return res.json({
      success: true,
      reservationId: reservation.id,
      reservationCode: reservation.reservation_code,
      reservationUuid: reservation.reservation_uuid,
      amount: reservation.total_price,
      currency: reservation.currency,
      message: 'Rezervasyon kaydı başarıyla oluşturuldu.',
    });
  } catch (err) {
    console.error('[/api/booking/reservation ERROR]', err.message);
    return res.status(400).json({
      success: false,
      error: { code: 'RESERVATION_CREATE_FAILED', message: err.message },
    });
  }
});

// ─── Get Reservation Details ─────────────────────────────────────────────────
router.get('/reservation/:code', async (req, res) => {
  try {
    const reservation = await reservationService.getReservationByCode(req.params.code);
    if (!reservation) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Rezervasyon bulunamadı.' },
      });
    }

    return res.json({
      success: true,
      data: reservation,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message },
    });
  }
});

module.exports = router;
