/**
 * MockPaymentGateway - Development & Testing Gateway
 *
 * Implements full payment lifecycle without real bank credentials.
 * Supports testing:
 * - Direct SUCCESS
 * - Controlled FAILED
 * - 3D Secure Verification Requirement
 * - CANCELLED / REFUNDED
 */

'use strict';

const crypto = require('crypto');
const PaymentGateway = require('./gateway');

class MockPaymentGateway extends PaymentGateway {
  constructor() {
    super('MockPaymentGateway');
  }

  /**
   * Initializes mock payment based on test scenario indicators.
   */
  async initializePayment({ reservation, card, callbackUrl }) {
    const transactionId = `MOCK-TX-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const cardHolder = (card?.cardHolderName || '').toUpperCase();
    const cardNumber = (card?.cardNumber || '').replace(/\s+/g, '');

    // Scenarios based on card holder name or test flags
    let scenario = 'SUCCESS';
    if (cardHolder.includes('FAIL') || cardNumber.endsWith('0000')) {
      scenario = 'FAILED';
    } else if (cardHolder.includes('3DS') || cardNumber.endsWith('3333')) {
      scenario = '3D_REQUIRED';
    } else if (cardHolder.includes('CANCEL') || cardNumber.endsWith('9999')) {
      scenario = 'CANCELLED';
    }

    if (scenario === 'FAILED') {
      return {
        success: false,
        status: 'FAILED',
        transactionId,
        errorCode: 'ERR_CARD_DECLINED',
        errorMessage: 'Kart reddedildi (Mock Yetersiz Bakiye/Hata Testi).',
      };
    }

    if (scenario === 'CANCELLED') {
      return {
        success: false,
        status: 'CANCELLED',
        transactionId,
        errorCode: 'ERR_USER_CANCELLED',
        errorMessage: 'İşlem kullanıcı tarafından iptal edildi.',
      };
    }

    if (scenario === '3D_REQUIRED') {
      // Return 3D Secure HTML form / redirect URL simulator
      const redirectUrl = `${callbackUrl}?mock3d=true&txId=${transactionId}&status=3DS_VERIFIED`;
      return {
        success: true,
        status: 'REQUIRES_ACTION',
        transactionId,
        requires3D: true,
        redirectUrl,
        htmlForm: `<form id="mock3ds" action="${callbackUrl}" method="POST">
          <input type="hidden" name="transactionId" value="${transactionId}" />
          <input type="hidden" name="mdStatus" value="1" />
          <input type="hidden" name="status" value="SUCCESS" />
          <input type="hidden" name="signature" value="${this._generateHash(transactionId, 'SUCCESS')}" />
          <p>Mock 3D Secure Yönlendiriliyor...</p>
        </form>`,
      };
    }

    // Default: Direct Success
    return {
      success: true,
      status: 'SUCCESS',
      transactionId,
      requires3D: false,
      maskedCardNumber: cardNumber ? `**** **** **** ${cardNumber.slice(-4)}` : '**** **** **** 4242',
      message: 'Mock Ödeme Başarılı.',
    };
  }

  /**
   * Processes Mock 3D Secure Callback
   */
  async processCallback(params) {
    const { transactionId, status, mdStatus, mockStatus, mock3d } = params;
    const txId = transactionId || params.txId || `MOCK-TX-${Date.now()}`;
    const targetStatus = mockStatus || status || (mock3d === 'true' ? 'SUCCESS' : 'SUCCESS');

    if (targetStatus === 'SUCCESS' || mdStatus === '1' || mdStatus === 1) {
      return {
        success: true,
        status: 'SUCCESS',
        transactionId: txId,
        gatewayCode: '00',
        message: '3D Secure Doğrulaması ve Ödeme Başarılı.',
      };
    }

    return {
      success: false,
      status: 'FAILED',
      transactionId: txId,
      gatewayCode: '99',
      errorMessage: '3D Secure Doğrulaması Başarısız Oldu.',
    };
  }

  async verifyPayment(transactionId) {
    return {
      success: true,
      status: 'SUCCESS',
      transactionId,
      verifiedAt: new Date().toISOString(),
    };
  }

  async refund({ transactionId, amount }) {
    const refundId = `MOCK-REF-${Date.now()}`;
    return {
      success: true,
      status: 'REFUNDED',
      refundId,
      transactionId,
      amount,
      message: `${amount} tutarındaki mock iade işlemi gerçekleştirildi.`,
    };
  }

  async cancel({ transactionId }) {
    return {
      success: true,
      status: 'CANCELLED',
      transactionId,
      message: 'Mock işlem iptal edildi.',
    };
  }

  _generateHash(txId, status) {
    const secret = process.env.PAYMENT_HASH_SECRET || 'mock_secret_key';
    return crypto.createHmac('sha256', secret).update(`${txId}:${status}`).digest('hex');
  }
}

module.exports = MockPaymentGateway;
