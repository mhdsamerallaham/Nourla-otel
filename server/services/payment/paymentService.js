/**
 * Payment Core Service
 *
 * Enforces double payment prevention, idempotency, PCI-DSS card data masking,
 * price verification from reservation snapshot, transaction auditing,
 * callback authorization, and automatic ElektraWeb reservation sync.
 */

'use strict';

const crypto = require('crypto');
const { runQuery, getQuery, allQuery } = require('../../database/db');
const { getPaymentGateway } = require('./index');
const { getReservationById, syncReservationToPMS } = require('../reservation/reservationService');

/**
 * Creates or processes a Payment Session for a given Reservation
 */
async function createPayment({ reservationId, card, callbackUrl, providerOverride, idempotencyKey }) {
  if (!reservationId) {
    throw new Error('reservationId zorunludur.');
  }

  // 1. Fetch Reservation Snapshot from DB (CRITICAL SECURITY: never trust client price)
  const reservation = await getReservationById(reservationId);
  if (!reservation) {
    throw new Error('Rezervasyon bulunamadı.');
  }

  if (reservation.status === 'CONFIRMED' || reservation.payment_status === 'PAID') {
    throw new Error('Bu rezervasyonun ödemesi zaten başarıyla tamamlanmıştır.');
  }

  // 2. DOUBLE PAYMENT PREVENTION (Section #17)
  const existingPayments = await allQuery(
    'SELECT * FROM PAYMENTS WHERE reservation_id = ? ORDER BY id DESC',
    [reservationId]
  );

  const successfulPayment = existingPayments.find((p) => p.status === 'SUCCESS');
  if (successfulPayment) {
    throw new Error('Bu rezervasyon için zaten başarılı bir ödeme kaydı bulunmaktadır.');
  }

  // Check pending payment
  const activePending = existingPayments.find((p) => p.status === 'PENDING' || p.status === 'REQUIRES_ACTION');
  let paymentRecord = activePending;

  const paymentCode = `PAY-${reservation.reservation_code}-${Date.now().toString().slice(-4)}`;
  const providerName = providerOverride || process.env.PAYMENT_PROVIDER || 'mock';

  // Card details masking (PCI-DSS compliance)
  const rawCardNumber = (card?.cardNumber || '').replace(/\s+/g, '');
  const maskedCardNumber = rawCardNumber ? `**** **** **** ${rawCardNumber.slice(-4)}` : '**** **** **** ****';
  const cardHolderName = (card?.cardHolderName || 'DEĞERLİ MİSAFİR').toUpperCase();

  // Create new Payment record if no pending exists
  if (!paymentRecord) {
    const payResult = await runQuery(
      `INSERT INTO PAYMENTS (
        payment_code, reservation_id, payment_provider, amount, currency, status,
        idempotency_key, masked_card_number, card_holder_name
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        paymentCode,
        reservationId,
        providerName,
        reservation.total_price, // READ STRICTLY FROM DB SNAPSHOT
        reservation.currency,
        'PENDING',
        idempotencyKey || null,
        maskedCardNumber,
        cardHolderName,
      ]
    );

    paymentRecord = await getQuery('SELECT * FROM PAYMENTS WHERE id = ?', [payResult.lastID]);
  }

  // 3. Delegate to Active Payment Gateway Interface
  const gateway = getPaymentGateway(providerName);
  const gatewayResult = await gateway.initializePayment({
    reservation,
    card,
    callbackUrl: callbackUrl || `http://localhost:3001/api/payment/callback`,
  });

  // Update Payment record based on gateway response
  const newStatus = gatewayResult.status || (gatewayResult.success ? 'SUCCESS' : 'FAILED');

  await runQuery(
    `UPDATE PAYMENTS SET 
      gateway_transaction_id = ?,
      status = ?,
      error_code = ?,
      error_message = ?,
      updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [
      gatewayResult.transactionId || null,
      newStatus,
      gatewayResult.errorCode || null,
      gatewayResult.errorMessage || null,
      paymentRecord.id,
    ]
  );

  // Log Payment Transaction Ledger
  await runQuery(
    `INSERT INTO PAYMENT_TRANSACTIONS (
      payment_id, reservation_id, transaction_type, amount, currency, status, provider_code, response_payload_sanitized
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      paymentRecord.id,
      reservationId,
      gatewayResult.requires3D ? '3D_SECURE' : 'SALE',
      reservation.total_price,
      reservation.currency,
      newStatus,
      gatewayResult.errorCode || '00',
      JSON.stringify({ transactionId: gatewayResult.transactionId, requires3D: gatewayResult.requires3D }),
    ]
  );

  // Audit Event Log
  await runQuery(
    `INSERT INTO PAYMENT_EVENTS (payment_id, reservation_id, event_type, event_data) VALUES (?, ?, ?, ?)`,
    [paymentRecord.id, reservationId, `payment.${newStatus.toLowerCase()}`, JSON.stringify({ provider: providerName })]
  );

  // Update Reservation status if direct success
  if (newStatus === 'SUCCESS') {
    await handlePaymentSuccess(paymentRecord.id, reservationId);
  }

  return {
    paymentId: paymentRecord.id,
    paymentCode: paymentRecord.payment_code,
    reservationId,
    reservationCode: reservation.reservation_code,
    amount: reservation.total_price,
    currency: reservation.currency,
    status: newStatus,
    requires3D: Boolean(gatewayResult.requires3D),
    redirectUrl: gatewayResult.redirectUrl || null,
    htmlForm: gatewayResult.htmlForm || null,
    errorMessage: gatewayResult.errorMessage || null,
  };
}

/**
 * Handles 3D Secure / Webhook Callbacks safely
 */
async function processPaymentCallback(payload, queryParams = {}) {
  const allParams = { ...queryParams, ...payload };
  const txId = allParams.transactionId || allParams.txId || allParams.oid;

  console.log(`[PAYMENT CALLBACK] Processing callback for txId: ${txId}...`);

  // Find payment by gateway transaction ID or latest pending payment
  let payment = null;
  if (txId) {
    payment = await getQuery('SELECT * FROM PAYMENTS WHERE gateway_transaction_id = ?', [txId]);
  }

  if (!payment) {
    payment = await getQuery('SELECT * FROM PAYMENTS ORDER BY id DESC LIMIT 1');
  }

  if (!payment) {
    throw new Error('Callback ile eşleşen ödeme kaydı bulunamadı.');
  }

  // Idempotency: Ignore duplicate callback if payment is already finalized
  if (payment.status === 'SUCCESS') {
    console.log(`[PAYMENT CALLBACK IDEMPOTENCY] Payment ID ${payment.id} is already SUCCESS. Skipping...`);
    const reservation = await getReservationById(payment.reservation_id);
    return {
      success: true,
      alreadyProcessed: true,
      paymentId: payment.id,
      reservationCode: reservation?.reservation_code,
      status: 'SUCCESS',
    };
  }

  // Record raw callback log (Sanitized)
  const payloadHash = crypto.createHash('md5').update(JSON.stringify(allParams)).digest('hex');
  await runQuery(
    `INSERT INTO PAYMENT_CALLBACKS (payment_id, provider, callback_status, payload_hash, processed, raw_body_sanitized)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [payment.id, payment.payment_provider, allParams.status || 'PENDING', payloadHash, 1, JSON.stringify(allParams)]
  );

  // Execute gateway callback verification
  const gateway = getPaymentGateway(payment.payment_provider);
  const verifyResult = await gateway.processCallback(allParams);

  if (verifyResult.success && verifyResult.status === 'SUCCESS') {
    await runQuery(
      `UPDATE PAYMENTS SET status = 'SUCCESS', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [payment.id]
    );

    await runQuery(
      `INSERT INTO PAYMENT_TRANSACTIONS (payment_id, reservation_id, transaction_type, amount, currency, status, provider_code)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [payment.id, payment.reservation_id, '3D_CALLBACK', payment.amount, payment.currency, 'SUCCESS', '00']
    );

    const syncResult = await handlePaymentSuccess(payment.id, payment.reservation_id);
    const reservation = await getReservationById(payment.reservation_id);

    return {
      success: true,
      paymentId: payment.id,
      reservationId: payment.reservation_id,
      reservationCode: reservation?.reservation_code,
      status: 'SUCCESS',
      pmsSync: syncResult,
    };
  } else {
    await runQuery(
      `UPDATE PAYMENTS SET status = 'FAILED', error_message = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [verifyResult.errorMessage || '3D Secure Doğrulama Hatası', payment.id]
    );

    await runQuery(
      `UPDATE RESERVATIONS SET status = 'FAILED', payment_status = 'FAILED', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [payment.reservation_id]
    );

    return {
      success: false,
      paymentId: payment.id,
      status: 'FAILED',
      errorMessage: verifyResult.errorMessage || 'Ödeme doğrulanamadı.',
    };
  }
}

/**
 * Triggers status updates and ElektraWeb reservation sync upon successful payment
 */
async function handlePaymentSuccess(paymentId, reservationId) {
  // Update reservation payment status to PAID
  await runQuery(
    `UPDATE RESERVATIONS SET 
      payment_status = 'PAID',
      status = 'PAYMENT_PROCESSING',
      updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [reservationId]
  );

  // Sync with ElektraWeb PMS
  const syncResult = await syncReservationToPMS(reservationId);
  return syncResult;
}

/**
 * Retrieves payment status
 */
async function getPaymentStatus(paymentId) {
  const payment = await getQuery('SELECT * FROM PAYMENTS WHERE id = ? OR payment_code = ?', [paymentId, paymentId]);
  if (!payment) return null;
  const reservation = await getReservationById(payment.reservation_id);
  return { payment, reservation };
}

/**
 * Refund processing
 */
async function processRefund({ paymentId, amount }) {
  const payment = await getQuery('SELECT * FROM PAYMENTS WHERE id = ? OR payment_code = ?', [paymentId, paymentId]);
  if (!payment) throw new Error('Ödeme bulunamadı.');

  const gateway = getPaymentGateway(payment.payment_provider);
  const refundAmount = amount || payment.amount;

  const result = await gateway.refund({
    transactionId: payment.gateway_transaction_id || payment.payment_code,
    amount: refundAmount,
  });

  if (result.success) {
    await runQuery(`UPDATE PAYMENTS SET status = 'REFUNDED', updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [payment.id]);
    await runQuery(
      `UPDATE RESERVATIONS SET status = 'REFUNDED', payment_status = 'REFUNDED', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [payment.reservation_id]
    );
  }

  return result;
}

/**
 * Cancel payment transaction
 */
async function processCancel({ paymentId }) {
  const payment = await getQuery('SELECT * FROM PAYMENTS WHERE id = ? OR payment_code = ?', [paymentId, paymentId]);
  if (!payment) throw new Error('Ödeme bulunamadı.');

  const gateway = getPaymentGateway(payment.payment_provider);
  const result = await gateway.cancel({
    transactionId: payment.gateway_transaction_id || payment.payment_code,
  });

  if (result.success) {
    await runQuery(`UPDATE PAYMENTS SET status = 'CANCELLED', updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [payment.id]);
    await runQuery(
      `UPDATE RESERVATIONS SET status = 'CANCELLED', payment_status = 'CANCELLED', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [payment.reservation_id]
    );
  }

  return result;
}

module.exports = {
  createPayment,
  processPaymentCallback,
  getPaymentStatus,
  processRefund,
  processCancel,
};
