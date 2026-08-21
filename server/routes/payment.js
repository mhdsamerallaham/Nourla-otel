/**
 * Payment API Routes
 * Mount: /api/payment
 */

'use strict';

const express = require('express');
const router = express.Router();
const paymentService = require('../services/payment/paymentService');

/**
 * POST /api/payment/create
 * Creates Pending Reservation + Initialized Payment Session
 */
router.post('/create', async (req, res) => {
  try {
    const { reservationId, card, callbackUrl, idempotencyKey } = req.body;

    if (!reservationId) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_RESERVATION_ID', message: 'reservationId zorunludur.' },
      });
    }

    const result = await paymentService.createPayment({
      reservationId,
      card,
      callbackUrl: callbackUrl || `${req.protocol}://${req.get('host')}/api/payment/callback`,
      idempotencyKey,
    });

    return res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    console.error('[/api/payment/create ERROR]', err.message);
    return res.status(400).json({
      success: false,
      error: { code: 'PAYMENT_CREATION_FAILED', message: err.message },
    });
  }
});

/**
 * POST /api/payment/3d-secure
 * Processes 3D Secure Verification
 */
router.post('/3d-secure', async (req, res) => {
  try {
    const result = await paymentService.processPaymentCallback(req.body, req.query);
    return res.json({ success: result.success, data: result });
  } catch (err) {
    console.error('[/api/payment/3d-secure ERROR]', err.message);
    return res.status(400).json({
      success: false,
      error: { code: '3DS_VERIFICATION_FAILED', message: err.message },
    });
  }
});

/**
 * POST /api/payment/callback & GET /api/payment/callback
 * Target endpoint for 3D Secure redirects & gateway webhooks
 */
const handleCallback = async (req, res) => {
  try {
    const result = await paymentService.processPaymentCallback(req.body, req.query);

    // If request comes from a browser HTML form redirect, render confirmation page / redirect
    const isBrowserForm = req.headers['accept']?.includes('text/html');
    if (isBrowserForm) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const statusParam = result.success ? 'success' : 'failed';
      const codeParam = result.reservationCode || '';
      return res.redirect(`${frontendUrl}/booking-status?status=${statusParam}&code=${codeParam}&payId=${result.paymentId}`);
    }

    return res.json({ success: result.success, data: result });
  } catch (err) {
    console.error('[/api/payment/callback ERROR]', err.message);

    const isBrowserForm = req.headers['accept']?.includes('text/html');
    if (isBrowserForm) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      return res.redirect(`${frontendUrl}/booking-status?status=failed&error=${encodeURIComponent(err.message)}`);
    }

    return res.status(400).json({
      success: false,
      error: { code: 'CALLBACK_FAILED', message: err.message },
    });
  }
};

router.post('/callback', handleCallback);
router.get('/callback', handleCallback);

/**
 * GET /api/payment/status/:paymentId
 * Returns Payment & Sync Status
 */
router.get('/status/:paymentId', async (req, res) => {
  try {
    const statusData = await paymentService.getPaymentStatus(req.params.paymentId);
    if (!statusData) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Ödeme kaydı bulunamadı.' },
      });
    }

    // Mask sensitive fields in response
    const sanitizedPayment = { ...statusData.payment };
    delete sanitizedPayment.raw_body_sanitized;

    return res.json({
      success: true,
      data: {
        payment: sanitizedPayment,
        reservation: statusData.reservation,
      },
    });
  } catch (err) {
    console.error('[/api/payment/status ERROR]', err.message);
    return res.status(500).json({
      success: false,
      error: { code: 'STATUS_FETCH_ERROR', message: err.message },
    });
  }
});

/**
 * POST /api/payment/refund
 */
router.post('/refund', async (req, res) => {
  try {
    const { paymentId, amount } = req.body;
    const result = await paymentService.processRefund({ paymentId, amount });
    return res.json({ success: result.success, data: result });
  } catch (err) {
    console.error('[/api/payment/refund ERROR]', err.message);
    return res.status(400).json({
      success: false,
      error: { code: 'REFUND_FAILED', message: err.message },
    });
  }
});

/**
 * POST /api/payment/cancel
 */
router.post('/cancel', async (req, res) => {
  try {
    const { paymentId } = req.body;
    const result = await paymentService.processCancel({ paymentId });
    return res.json({ success: result.success, data: result });
  } catch (err) {
    console.error('[/api/payment/cancel ERROR]', err.message);
    return res.status(400).json({
      success: false,
      error: { code: 'CANCEL_FAILED', message: err.message },
    });
  }
});

module.exports = router;
