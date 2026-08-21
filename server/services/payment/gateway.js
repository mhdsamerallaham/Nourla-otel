/**
 * PaymentGateway Interface / Base Class
 *
 * All payment provider implementations (Mock, Ziraat Bank Sanal POS, etc.)
 * must implement these standard payment operations.
 */

'use strict';

class PaymentGateway {
  constructor(name) {
    this.name = name;
  }

  /**
   * Initializes a payment session for a reservation snapshot.
   *
   * @param {Object} params
   * @param {Object} params.reservation - Reservation record with snapshot amounts
   * @param {Object} params.card - Card details (or test tokens)
   * @param {string} params.callbackUrl - 3D Secure callback URL
   * @returns {Promise<Object>} { success, transactionId, status, requires3D, htmlForm, redirectUrl }
   */
  async initializePayment(_params) {
    throw new Error(`initializePayment not implemented on ${this.name}`);
  }

  /**
   * Processes 3D Secure Authorization Callback.
   *
   * @param {Object} params
   * @param {Object} params.payload - Raw parameters sent by bank/gateway
   * @returns {Promise<Object>} { success, paymentId, transactionId, status, rawResponse }
   */
  async processCallback(_params) {
    throw new Error(`processCallback not implemented on ${this.name}`);
  }

  /**
   * Verifies the status of a transaction directly with the payment provider.
   *
   * @param {string} transactionId
   * @returns {Promise<Object>} { success, status, amount, currency, rawResponse }
   */
  async verifyPayment(_transactionId) {
    throw new Error(`verifyPayment not implemented on ${this.name}`);
  }

  /**
   * Processes full or partial refund.
   *
   * @param {Object} params
   * @param {string} params.transactionId
   * @param {number} params.amount
   * @returns {Promise<Object>} { success, refundId, amount, status }
   */
  async refund(_params) {
    throw new Error(`refund not implemented on ${this.name}`);
  }

  /**
   * Cancels a pending/initiated transaction before settlement.
   *
   * @param {Object} params
   * @param {string} params.transactionId
   * @returns {Promise<Object>} { success, status }
   */
  async cancel(_params) {
    throw new Error(`cancel not implemented on ${this.name}`);
  }
}

module.exports = PaymentGateway;
