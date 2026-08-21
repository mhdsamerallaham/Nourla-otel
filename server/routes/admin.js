/**
 * Admin API Routes
 * Mount: /api/admin
 */

'use strict';

const express = require('express');
const router = express.Router();
const { allQuery, getQuery } = require('../database/db');
const { syncReservationToPMS, processPendingSyncs } = require('../services/reservation/reservationService');

/**
 * GET /api/admin/reservations
 * Retrieves overview list of reservations, payments, and PMS sync statuses.
 */
router.get('/reservations', async (req, res) => {
  try {
    const reservations = await allQuery(`
      SELECT 
        r.id AS reservation_id,
        r.reservation_code,
        r.room_name,
        r.check_in,
        r.check_out,
        r.total_price,
        r.currency,
        r.status AS reservation_status,
        r.payment_status,
        r.sync_status,
        r.pms_reservation_id AS external_reservation_id,
        r.sync_attempts,
        r.last_sync_error,
        r.created_at,
        r.updated_at,
        p.id AS payment_id,
        p.payment_code,
        p.payment_provider,
        p.status AS payment_provider_status,
        p.masked_card_number,
        g.first_name || ' ' || g.last_name AS guest_name,
        g.email AS guest_email,
        g.phone AS guest_phone
      FROM RESERVATIONS r
      LEFT JOIN PAYMENTS p ON p.reservation_id = r.id
      LEFT JOIN RESERVATION_GUESTS g ON g.reservation_id = r.id AND g.is_primary = 1
      ORDER BY r.id DESC
    `);

    return res.json({
      success: true,
      count: reservations.length,
      data: reservations,
    });
  } catch (err) {
    console.error('[/api/admin/reservations ERROR]', err.message);
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

/**
 * POST /api/admin/reservations/:id/retry-sync
 * Manually triggers ElektraWeb PMS sync retry for a reservation.
 */
router.post('/reservations/:id/retry-sync', async (req, res) => {
  try {
    const reservationId = parseInt(req.params.id, 10);
    const result = await syncReservationToPMS(reservationId);
    return res.json({
      success: result.success,
      data: result,
    });
  } catch (err) {
    console.error('[/api/admin/retry-sync ERROR]', err.message);
    return res.status(400).json({ success: false, error: { message: err.message } });
  }
});

/**
 * POST /api/admin/sync-all-pending
 * Triggers background retry engine for all unsynced paid reservations.
 */
router.post('/sync-all-pending', async (req, res) => {
  try {
    await processPendingSyncs();
    return res.json({ success: true, message: 'Toplu senkronizasyon retry işlemi başlatıldı.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

module.exports = router;
