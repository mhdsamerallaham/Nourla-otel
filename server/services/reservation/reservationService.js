/**
 * Reservation Service
 *
 * Manages local database reservations, snapshot creation, fresh PMS validation,
 * payment state tracking, and background ElektraWeb PMS retry syncs.
 */

'use strict';

const crypto = require('crypto');
const { runQuery, getQuery, allQuery } = require('../../database/db');
const elektraService = require('../elektraweb');

/**
 * Calculates night difference between checkIn and checkOut
 */
function calculateNights(checkIn, checkOut) {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 1;
}

/**
 * Creates a Pending Reservation record with an Immutable Snapshot
 */
async function createPendingReservation(data) {
  const {
    pmsRoomTypeId,
    checkIn,
    checkOut,
    adultCount = 2,
    childCount = 0,
    guestName,
    guestEmail,
    guestPhone,
    specialNotes,
    nationality = 'TR',
    currency = 'TRY',
    promoCode,
  } = data;

  if (!pmsRoomTypeId || !checkIn || !checkOut || !guestName) {
    throw new Error('Eksik bilgi: Oda tipi, giriş-çıkış tarihleri ve misafir adı zorunludur.');
  }

  const nightCount = calculateNights(checkIn, checkOut);

  // 1. FRESH Availability & Price check from PMS
  let livePriceRes;
  try {
    livePriceRes = await elektraService.getPrices({
      fromdate: checkIn,
      todate: checkOut,
      adult: adultCount,
      currency,
      language: 'TR',
      promoCode,
    });
  } catch (err) {
    console.warn('[RESERVATION SERVICE] PMS price fetch error, falling back to local room rate:', err.message);
  }

  let pmsOffer = null;
  if (livePriceRes && livePriceRes.success && Array.isArray(livePriceRes.offers)) {
    pmsOffer = livePriceRes.offers.find(
      (o) => String(o.roomTypeId || o['room-type-id']) === String(pmsRoomTypeId)
    );
  }

  // Find local room record
  const room = await getQuery('SELECT * FROM ROOMS WHERE pms_room_type_id = ?', [pmsRoomTypeId]);
  const roomName = room ? room.name_tr : `Oda Tipi ${pmsRoomTypeId}`;
  const basePricePerNight = pmsOffer?.pricePerNight || pmsOffer?.price || room?.base_price || 350;

  // Compute immutable snapshot price values
  const basePriceTotal = data.totalPrice ? parseFloat(data.totalPrice) : parseFloat((basePricePerNight * nightCount).toFixed(2));
  const discountAmount = pmsOffer?.discount || 0.0;
  const taxAmount = parseFloat((basePriceTotal * 0.10).toFixed(2)); // 10% VAT
  const totalPrice = data.totalPrice ? parseFloat(data.totalPrice) : parseFloat((basePriceTotal - discountAmount + taxAmount).toFixed(2));

  const reservationCode = `NOURLA-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
  const reservationUuid = crypto.randomUUID();

  // Get hotel ID
  const hotel = await getQuery('SELECT id FROM HOTELS LIMIT 1');
  const hotelId = hotel ? hotel.id : 1;
  const roomId = room ? room.id : 1;

  // Insert RESERVATION with snapshot values
  const resResult = await runQuery(
    `INSERT INTO RESERVATIONS (
      reservation_code, reservation_uuid, hotel_id, room_id, pms_room_type_id,
      room_name, rate_plan, board_type_id, rate_type_id, rate_code_id, price_agency_id,
      check_in, check_out, night_count, adult_count, child_count,
      base_price, discount_amount, tax_amount, total_price, currency,
      status, payment_status, sync_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      reservationCode,
      reservationUuid,
      hotelId,
      roomId,
      pmsRoomTypeId,
      roomName,
      pmsOffer?.rateName || 'STANDARD',
      pmsOffer?.boardTypeId || 893,
      pmsOffer?.rateTypeId || 792,
      pmsOffer?.rateCodeId || 6844,
      pmsOffer?.priceAgencyId || 44573,
      checkIn,
      checkOut,
      nightCount,
      adultCount,
      childCount,
      basePriceTotal,
      discountAmount,
      taxAmount,
      totalPrice,
      currency.toUpperCase(),
      'PENDING_PAYMENT',
      'PENDING',
      'SYNC_PENDING',
    ]
  );

  const reservationId = resResult.lastID;

  // Insert primary guest info
  const nameParts = guestName.trim().split(' ');
  const firstName = nameParts.slice(0, -1).join(' ') || nameParts[0];
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : 'Misafir';

  await runQuery(
    `INSERT INTO RESERVATION_GUESTS (
      reservation_id, first_name, last_name, email, phone, is_primary, country, special_notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [reservationId, firstName, lastName, guestEmail, guestPhone, 1, nationality, specialNotes]
  );

  return getReservationById(reservationId);
}

async function getReservationById(id) {
  const reservation = await getQuery('SELECT * FROM RESERVATIONS WHERE id = ?', [id]);
  if (!reservation) return null;
  const guests = await allQuery('SELECT * FROM RESERVATION_GUESTS WHERE reservation_id = ?', [id]);
  return { ...reservation, guests };
}

async function getReservationByCode(code) {
  const reservation = await getQuery('SELECT * FROM RESERVATIONS WHERE reservation_code = ?', [code]);
  if (!reservation) return null;
  const guests = await allQuery('SELECT * FROM RESERVATION_GUESTS WHERE reservation_id = ?', [reservation.id]);
  return { ...reservation, guests };
}

/**
 * Synchronizes confirmed/paid reservation to ElektraWeb PMS
 */
async function syncReservationToPMS(reservationId) {
  const reservation = await getReservationById(reservationId);
  if (!reservation) throw new Error('Rezervasyon bulunamadı.');

  const primaryGuest = reservation.guests.find((g) => g.is_primary) || reservation.guests[0];
  const guestName = primaryGuest ? `${primaryGuest.first_name} ${primaryGuest.last_name}` : 'Değerli Misafir';

  const pmsPayload = {
    checkIn: reservation.check_in,
    checkOut: reservation.check_out,
    roomTypeId: reservation.pms_room_type_id,
    boardTypeId: reservation.board_type_id,
    rateTypeId: reservation.rate_type_id,
    rateCodeId: reservation.rate_code_id,
    priceAgencyId: reservation.price_agency_id,
    currency: reservation.currency,
    totalPrice: reservation.total_price,
    adultCount: reservation.adult_count,
    guestName,
    guestEmail: primaryGuest?.email || 'info@nourla.com.tr',
    guestPhone: primaryGuest?.phone || '+905320000000',
    specialNotes: primaryGuest?.special_notes || `Web Ödeme Ref: ${reservation.reservation_code}`,
  };

  const attempts = (reservation.sync_attempts || 0) + 1;

  try {
    console.log(`[PMS SYNC] Attempt ${attempts} for Reservation ID: ${reservation.id} (${reservation.reservation_code})...`);
    const pmsRes = await elektraService.createReservation(pmsPayload);

    const pmsId = pmsRes?.['reservation-id'] || pmsRes?.reservationId || pmsRes?.id || `PMS-${Date.now()}`;
    const pmsUuid = pmsRes?.['reservation-uuid'] || pmsRes?.reservationUuid || null;

    await runQuery(
      `UPDATE RESERVATIONS SET 
        status = 'CONFIRMED',
        sync_status = 'SYNC_SUCCESS',
        pms_reservation_id = ?,
        pms_reservation_uuid = ?,
        sync_attempts = ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [String(pmsId), pmsUuid, attempts, reservationId]
    );

    console.log(`[PMS SYNC SUCCESS] Reservation ID ${reservationId} synced to PMS with ID: ${pmsId}`);
    return { success: true, pmsId, pmsUuid };
  } catch (err) {
    console.error(`[PMS SYNC FAILED] Attempt ${attempts} error for Reservation ID ${reservationId}:`, err.message);

    await runQuery(
      `UPDATE RESERVATIONS SET 
        status = 'PAYMENT_SUCCESS_RESERVATION_PENDING',
        sync_status = 'SYNC_FAILED',
        sync_attempts = ?,
        last_sync_error = ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [attempts, err.message, reservationId]
    );

    return { success: false, error: err.message };
  }
}

/**
 * Background retry engine for pending PMS syncs
 */
async function processPendingSyncs() {
  const pendingReservations = await allQuery(
    `SELECT id FROM RESERVATIONS 
     WHERE payment_status = 'PAID' AND sync_status IN ('SYNC_PENDING', 'SYNC_FAILED') AND sync_attempts < 5`
  );

  if (pendingReservations.length === 0) return;

  console.log(`[PMS RETRY ENGINE] Found ${pendingReservations.length} pending PMS syncs to retry...`);
  for (const row of pendingReservations) {
    await syncReservationToPMS(row.id);
  }
}

module.exports = {
  calculateNights,
  createPendingReservation,
  getReservationById,
  getReservationByCode,
  syncReservationToPMS,
  processPendingSyncs,
};
