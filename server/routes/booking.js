/**
 * Booking API Routes (Public Hotel Reservation API)
 * Mount: /api/booking or /api/hotel
 */

'use strict';

const express = require('express');
const router = express.Router();
const reservationService = require('../services/reservation/reservationService');
const elektra = require('../services/elektraweb');
const { validateAvailabilityDates, validatePriceParams, validateReservationBody } = require('../middleware/validation');
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
    res.set('Cache-Control', 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400');
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
    res.set('Cache-Control', 'public, max-age=1800, s-maxage=1800, stale-while-revalidate=3600');
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
    res.set('Cache-Control', 'public, max-age=60, s-maxage=60, stale-while-revalidate=120');
    return res.json(normalized);
  } catch (err) {
    return res.status(err.httpStatus || 500).json(normalizeError(err));
  }
});

// ─── Fast In-Memory Price Cache (60s TTL for identical requests) ─────────────
const priceCache = new Map();
const PRICE_CACHE_TTL_MS = 60 * 1000; // 60 seconds

function getCachedPrice(key) {
  const cached = priceCache.get(key);
  if (!cached) return null;
  if (Date.now() > cached.expiresAt) {
    priceCache.delete(key);
    return null;
  }
  return cached.data;
}

function setCachedPrice(key, data) {
  if (priceCache.size > 200) {
    const firstKey = priceCache.keys().next().value;
    priceCache.delete(firstKey);
  }
  priceCache.set(key, {
    data,
    expiresAt: Date.now() + PRICE_CACHE_TTL_MS,
  });
}

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

    const cacheKey = JSON.stringify(priceParams);
    const cachedData = getCachedPrice(cacheKey);
    if (cachedData) {
      res.set('Cache-Control', 'no-store');
      res.set('X-Price-Cache', 'HIT');
      return res.json(cachedData);
    }

    const raw = await elektra.getPrices(priceParams);

    const normalized = normalizePrice(raw, { ...params, nights: params.nights });
    setCachedPrice(cacheKey, normalized);

    res.set('Cache-Control', 'no-store');
    res.set('X-Price-Cache', 'MISS');
    return res.json(normalized);
  } catch (err) {
    return res.status(err.httpStatus || 500).json(normalizeError(err));
  }
});

// ─── Create Pending Reservation ───────────────────────────────────────────────
router.post('/reservation', validateReservationBody, async (req, res) => {
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
      totalPrice: body.totalPrice,
      basePrice: body.basePrice || body.originalPrice || body.totalPrice,
      discountAmount: body.discountAmount || 0,
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

// ─── Confirm Havale / EFT — Creates Real PMS Reservation ─────────────────────
// Called when customer clicks "Rezervasyonu Tamamla" on the havale payment page.
// All reservation data is passed from frontend since the DB may be in memory mode.
router.post('/reservation/:id/confirm-transfer', async (req, res) => {
  try {
    const body = req.body;

    if (!body.guestName || !body.checkIn || !body.checkOut) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_FIELDS', message: 'Eksik alan: guestName, checkIn, checkOut zorunludur.' },
      });
    }

    // Extract list of rooms in cart (or single room fallback)
    let roomItems = Array.isArray(body.cartItems) && body.cartItems.length > 0
      ? body.cartItems
      : [{
          pmsRoomTypeId: body.pmsRoomTypeId,
          boardTypeId: body.boardTypeId || 893,
          rateTypeId: body.rateTypeId || 792,
          rateCodeId: body.rateCodeId || 6844,
          priceAgencyId: body.priceAgencyId || 44573,
          totalPrice: body.totalPrice,
          roomName: 'Oda 1',
        }];

    const totalCartRooms = roomItems.length;
    const finalTotalHavalePrice = parseFloat(body.havaleFinalPrice || body.totalPrice || 0);
    const cartTotalPriceSum = roomItems.reduce((sum, r) => sum + (parseFloat(r.totalPrice) || 0), 0);
    const overallCartTotal = parseFloat((body.totalPrice || cartTotalPriceSum || 0).toFixed(2));
    const overallHavaleDiscountAmount = parseFloat((overallCartTotal * 0.05).toFixed(2));

    const pmsResults = [];
    const pmsIds = [];

    // Create a PMS reservation for each room item in the cart
    for (let i = 0; i < roomItems.length; i++) {
      const item = roomItems[i];
      const itemPayablePrice = parseFloat(item.totalPrice) || (totalCartRooms > 0 ? parseFloat((overallCartTotal / totalCartRooms).toFixed(2)) : 0);
      const itemDisplayPrice = item.originalPrice ? parseFloat(item.originalPrice) : parseFloat((itemPayablePrice / 0.95).toFixed(2));
      const itemDiscountAmount = parseFloat((itemDisplayPrice - itemPayablePrice).toFixed(2));

      const transferNotes = [
        'ÖDEME YÖNTEMİ: BANKA HAVALESİ / EFT (%5 WEB İNDİRİMLİ)',
        body.reservationCode ? `Ref: ${body.reservationCode}` : '',
        `Web Liste Fiyatı: ${itemDisplayPrice} ${body.currency || 'TRY'}`,
        `%5 Web İndirimi: -${itemDiscountAmount} ${body.currency || 'TRY'}`,
        `NET TAHSİL EDİLEN TUTAR: ${itemPayablePrice} ${body.currency || 'TRY'}`,
        `Misafir: ${body.guestName} (${body.guestEmail || ''} | ${body.guestPhone || ''})`,
        totalCartRooms > 1 ? `Sepet: Oda ${i + 1}/${totalCartRooms} (${item.roomName || 'Oda'})` : '',
        body.specialNotes || '',
      ].filter(Boolean).join(' | ');

      try {
        const pmsRes = await elektra.createReservation({
          roomTypeId:    item.pmsRoomTypeId || body.pmsRoomTypeId,
          checkIn:       body.checkIn,
          checkOut:      body.checkOut,
          adultCount:    body.adultCount || 2,
          guestName:     body.guestName,
          guestEmail:    body.guestEmail || 'info@nourla.com.tr',
          guestPhone:    body.guestPhone || '+905320000000',
          boardTypeId:   item.boardTypeId   || body.boardTypeId   || 893,
          rateTypeId:    item.rateTypeId    || body.rateTypeId    || 792,
          rateCodeId:    item.rateCodeId    || body.rateCodeId    || 6844,
          priceAgencyId: item.priceAgencyId || body.priceAgencyId || 44573,
          currency:      (body.currency || 'TRY').toUpperCase(),
          totalPrice:    itemPayablePrice,
          netPrice:      itemPayablePrice,
          displayPrice:  itemDisplayPrice,
          nationality:   body.nationality || 'TR',
          specialNotes:  transferNotes,
          paymentType:   body.paymentType !== undefined ? body.paymentType : 3, // 3 = Banka Havalesi / EFT
          discountPercent: 5,
          discountAmount:  itemDiscountAmount,
          discountTypeId:  1,
        });

        const pId = pmsRes?.['reservation-id'] || pmsRes?.reservationId || pmsRes?.id || null;
        if (pId) pmsIds.push(pId);
        pmsResults.push(pmsRes);
      } catch (rErr) {
        console.error(`[CONFIRM-TRANSFER] Error creating room ${i + 1}/${totalCartRooms}:`, rErr.message);
      }
    }

    const primaryPmsId = pmsIds[0] || null;
    const primaryPmsUuid = pmsResults[0]?.['reservation-uuid'] || pmsResults[0]?.reservationUuid || null;

    console.log(`[CONFIRM-TRANSFER] ElektraWeb PMS ${pmsResults.length} oda rezervasyonu oluşturuldu. PMS IDs: ${pmsIds.join(', ')}`);

    // Best-effort: update local DB record
    try {
      const { runQuery } = require('../database/db');
      const reservationId = parseInt(req.params.id, 10);
      if (reservationId && primaryPmsId) {
        await runQuery(
          `UPDATE RESERVATIONS SET
             status = 'CONFIRMED',
             sync_status = 'SYNC_SUCCESS',
             pms_reservation_id = ?,
             payment_status = 'PENDING_HAVALE',
             updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [String(primaryPmsId), reservationId]
        );
      }
    } catch (_dbErr) {
      console.warn('[confirm-transfer] DB güncellemesi başarısız (memory-store modu):', _dbErr.message);
    }

    return res.json({
      success: true,
      pmsReservationId:   primaryPmsId,
      pmsReservationIds:  pmsIds,
      pmsReservationUuid: primaryPmsUuid,
      reservationCode:    body.reservationCode,
      havaleFinalPrice:   body.havaleFinalPrice,
      currency:           body.currency || 'TRY',
      message: `${pmsResults.length} adet oda için ElektraWeb rezervasyonu başarıyla oluşturuldu.`,
    });
  } catch (err) {
    console.error('[/reservation/:id/confirm-transfer ERROR]', err.message);
    return res.status(502).json({
      success: false,
      error: {
        code: 'PMS_RESERVATION_FAILED',
        message: `ElektraWeb rezervasyonu oluşturulamadı: ${err.message}`,
      },
    });
  }
});

// ─── Confirm Mail Order — Creates PMS Reservation + Logs Card Data ─────────────
// Called when customer selects "Mail Order" and clicks "Rezervasyonu Tamamla".
// Card data is saved to Supabase and sent to ElektraWeb reservation notes.
router.post('/reservation/:id/confirm-mail-order', async (req, res) => {
  try {
    const body = req.body;

    if (!body.guestName || !body.checkIn || !body.checkOut) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_FIELDS', message: 'Eksik alan: guestName, checkIn, checkOut zorunludur.' },
      });
    }

    if (!body.cardNumber || !body.cardHolderName || !body.cardExpiry) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_CARD_FIELDS', message: 'Kart bilgileri eksik: cardNumber, cardHolderName, cardExpiry zorunludur.' },
      });
    }

    // ── Kart bilgileri — tam, düz metin (muhasebe mail order yapacak) ──────
    const rawCard = body.cardNumber.replace(/\s+/g, '');
    // Görüntüleme için boşluklu format: "4111 1111 1111 1111"
    const cardFormatted = rawCard.match(/.{1,4}/g)?.join(' ') || rawCard;
    const cardExpiry    = body.cardExpiry || '';
    const cardCvv       = body.cardCvv || '';
    const cardLast4     = rawCard.slice(-4);
    const cardFirst6    = rawCard.slice(0, 6);

    // Build cart items (same pattern as confirm-transfer)
    let roomItems = Array.isArray(body.cartItems) && body.cartItems.length > 0
      ? body.cartItems
      : [{
          pmsRoomTypeId: body.pmsRoomTypeId,
          boardTypeId: body.boardTypeId || 893,
          rateTypeId: body.rateTypeId || 792,
          rateCodeId: body.rateCodeId || 6844,
          priceAgencyId: body.priceAgencyId || 44573,
          totalPrice: body.totalPrice,
          roomName: 'Oda 1',
        }];

    const totalCartRooms = roomItems.length;
    const overallCartTotal = parseFloat((body.totalPrice || 0).toFixed(2));

    const pmsResults = [];
    const pmsIds = [];

    // Create ElektraWeb reservation for each room — card info goes to PMS fields, NOT to notes!
    for (let i = 0; i < roomItems.length; i++) {
      const item = roomItems[i];
      // Mail Order'da indirim yok: Liste fiyatı tahsil edilir
      const itemPayablePrice = parseFloat(item.totalPrice) || (totalCartRooms > 0 ? parseFloat((overallCartTotal / totalCartRooms).toFixed(2)) : 0);
      const itemDisplayPrice = item.originalPrice ? parseFloat(item.originalPrice) : itemPayablePrice;

      // Hem ElektraWeb PMS kart sekmesi hem de Notlar sekmesi için açık format
      const cleanNotes = [
        '=== MAİL ORDER KREDİ KARTI BİLGİLERİ ===',
        `Kart Sahibi: ${body.cardHolderName}`,
        `Kart Numarası: ${cardFormatted}`,
        `Son Kullanma: ${cardExpiry} | CVV: ${cardCvv}`,
        `Tahsil Edilecek Tutar: ${itemPayablePrice} ${body.currency || 'TRY'}`,
        body.reservationCode ? `Ref: ${body.reservationCode}` : '',
        `Misafir: ${body.guestName} (${body.guestEmail || ''} | ${body.guestPhone || ''})`,
        totalCartRooms > 1 ? `Sepet: Oda ${i + 1}/${totalCartRooms} (${item.roomName || 'Oda'})` : '',
        body.specialNotes || '',
      ].filter(Boolean).join(' | ');

      try {
        const pmsRes = await elektra.createReservation({
          roomTypeId:    item.pmsRoomTypeId || body.pmsRoomTypeId,
          checkIn:       body.checkIn,
          checkOut:      body.checkOut,
          adultCount:    body.adultCount || 2,
          guestName:     body.guestName,
          guestEmail:    body.guestEmail || 'info@nourla.com.tr',
          guestPhone:    body.guestPhone || '+905320000000',
          boardTypeId:   item.boardTypeId   || body.boardTypeId   || 893,
          rateTypeId:    item.rateTypeId    || body.rateTypeId    || 792,
          rateCodeId:    item.rateCodeId    || body.rateCodeId    || 6844,
          priceAgencyId: item.priceAgencyId || body.priceAgencyId || 44573,
          currency:      (body.currency || 'TRY').toUpperCase(),
          totalPrice:    itemPayablePrice,
          netPrice:      itemPayablePrice,
          displayPrice:  itemDisplayPrice,
          nationality:   body.nationality || 'TR',
          specialNotes:  cleanNotes,
          paymentType:   2, // 2 = Kredi Kartı / Credit Card (PMS kart sekmesi için)
          discountPercent: 0, // Mail order'da indirim yok
          discountAmount:  0,
          discountTypeId:  0,
          // ─ ElektraWeb PMS Kredi Kartı Bilgileri Alanı ───────────────
          paymentInfo: {
            ccNo:     rawCard,                   // tam kart numarası (boşluksuz)
            ccHolder: body.cardHolderName,       // kart sahibi
            ccExpire: cardExpiry,                // "12/28"
            ccCvv:    cardCvv,                   // CVV
          },
        });

        const pId = pmsRes?.['reservation-id'] || pmsRes?.reservationId || pmsRes?.id || null;
        if (pId) pmsIds.push(pId);
        pmsResults.push(pmsRes);
      } catch (rErr) {
        console.error(`[CONFIRM-MAIL-ORDER] ElektraWeb oda ${i + 1}/${totalCartRooms} hatası:`, rErr.message);
      }
    }

    const primaryPmsId = pmsIds[0] || null;
    const primaryPmsUuid = pmsResults[0]?.['reservation-uuid'] || pmsResults[0]?.reservationUuid || null;

    console.log(`[CONFIRM-MAIL-ORDER] ElektraWeb PMS ${pmsResults.length} oda rezervasyonu. PMS IDs: ${pmsIds.join(', ')}`);

    // ── Supabase'e tam kart bilgileriyle kayıt (.env.local credentials) ──────
    try {
      const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://yghiynqrtstvchtcaeml.supabase.co';
      const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_zRRKvCYKhtutXkY1H1th6A_taqFyJRU';

      if (supabaseUrl && supabaseKey) {
        const fetchFn = globalThis.fetch || ((...args) => import('node-fetch').then(({ default: f }) => f(...args)));

        // 1. mail_order_requests tablosuna kayıt
        const sbRes = await fetchFn(`${supabaseUrl}/rest/v1/mail_order_requests`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({
            reservation_code:   body.reservationCode || null,
            pms_reservation_id: primaryPmsId ? String(primaryPmsId) : null,
            pms_reservation_ids: pmsIds.length > 1 ? pmsIds.join(',') : null,
            guest_name:         body.guestName,
            guest_email:        body.guestEmail || null,
            guest_phone:        body.guestPhone || null,
            card_holder_name:   body.cardHolderName,
            card_number:        cardFormatted,   // boşluklu: "4111 1111 1111 1111"
            card_number_raw:    rawCard,          // boşluksuz: "4111111111111111"
            card_first6:        cardFirst6,
            card_last4:         cardLast4,
            card_expiry:        cardExpiry,       // "12/28"
            card_cvv:           cardCvv,          // tam CVV
            check_in:           body.checkIn,
            check_out:          body.checkOut,
            total_price:        overallCartTotal,
            currency:           body.currency || 'TRY',
            status:             'PENDING',
          }),
        });

        console.log(`[CONFIRM-MAIL-ORDER] Supabase mail_order_requests kayıt: HTTP ${sbRes?.status}`);

        // Eğer mail_order_requests tablosu 404/hata verdiyse guest_leads'e fallback yap
        if (sbRes && sbRes.status >= 400) {
          await fetchFn(`${supabaseUrl}/rest/v1/guest_leads`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Prefer': 'return=minimal',
            },
            body: JSON.stringify({
              guest_name:       body.guestName,
              guest_email:      body.guestEmail || null,
              guest_phone:      body.guestPhone || null,
              check_in:         body.checkIn,
              check_out:        body.checkOut,
              total_price:      overallCartTotal,
              currency:         body.currency || 'TRY',
              reservation_code: body.reservationCode || (primaryPmsId ? String(primaryPmsId) : null),
              status:           'MAIL_ORDER_PENDING',
              special_notes:    `[MAIL ORDER] Kart Sahibi: ${body.cardHolderName} | Kart No: ${cardFormatted} | Son Kul: ${cardExpiry} | CVV: ${cardCvv}`,
              source:           'mail_order',
            }),
          });
          console.log('[CONFIRM-MAIL-ORDER] Supabase guest_leads fallback kaydı tamamlandı ✓');
        }
      }
    } catch (sbErr) {
      console.warn('[CONFIRM-MAIL-ORDER] Supabase kayıt hatası (non-blocking):', sbErr.message);
    }

    // Best-effort: update local DB
    try {
      const { runQuery } = require('../database/db');
      const reservationId = parseInt(req.params.id, 10);
      if (reservationId && primaryPmsId) {
        await runQuery(
          `UPDATE RESERVATIONS SET
             status = 'CONFIRMED',
             sync_status = 'SYNC_SUCCESS',
             pms_reservation_id = ?,
             payment_status = 'PENDING_MAIL_ORDER',
             updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [String(primaryPmsId), reservationId]
        );
      }
    } catch (_dbErr) {
      console.warn('[confirm-mail-order] DB güncellemesi başarısız (memory-store modu):', _dbErr.message);
    }

    return res.json({
      success: true,
      pmsReservationId:   primaryPmsId,
      pmsReservationIds:  pmsIds,
      pmsReservationUuid: primaryPmsUuid,
      reservationCode:    body.reservationCode,
      cardLast4,
      currency:           body.currency || 'TRY',
      totalPrice:         overallCartTotal,
      message: `${pmsResults.length} oda için ElektraWeb mail order rezervasyonu oluşturuldu. Kart bilgileri sisteme kaydedildi.`,
    });
  } catch (err) {
    console.error('[/reservation/:id/confirm-mail-order ERROR]', err.message);
    return res.status(502).json({
      success: false,
      error: {
        code: 'MAIL_ORDER_FAILED',
        message: `Mail order rezervasyonu oluşturulamadı: ${err.message}`,
      },
    });
  }
});

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
